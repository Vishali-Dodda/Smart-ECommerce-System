from decimal import Decimal

from django.db import transaction

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from cart.models import Cart

from .models import Order, OrderItem
from .serializers import OrderSerializer
from .permissions import IsAdminUser


class OrderCreateView(generics.CreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):

        # =========================
        # VALIDATE SHIPPING DETAILS
        # =========================

        required_fields = [
            "full_name",
            "phone",
            "address",
            "city",
            "state",
            "pincode",
        ]

        for field in required_fields:
            value = request.data.get(field)

            if not value or not str(value).strip():
                return Response(
                    {
                        "detail": (
                            f"{field.replace('_', ' ').title()} "
                            "is required."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )


        # =========================
        # GET USER CART
        # =========================

        cart = Cart.objects.filter(
            user=request.user
        ).first()


        if not cart:
            return Response(
                {
                    "detail": "Your cart is empty."
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        cart_items = cart.items.select_related(
            "product"
        ).all()


        if not cart_items.exists():
            return Response(
                {
                    "detail": "Your cart is empty."
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        # =========================
        # VALIDATE PRODUCTS + STOCK
        # =========================

        total_amount = Decimal("0.00")


        for cart_item in cart_items:

            product = cart_item.product


            # Product must be active

            if not product.is_active:
                return Response(
                    {
                        "detail": (
                            f"Product '{product.name}' "
                            "is no longer available."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )


            # Product must have enough stock

            if cart_item.quantity > product.stock:
                return Response(
                    {
                        "detail": (
                            f"Only {product.stock} units of "
                            f"'{product.name}' are available."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )


        # =========================
        # CREATE ORDER
        # =========================

        order = Order.objects.create(
            user=request.user,

            full_name=request.data.get(
                "full_name"
            ).strip(),

            phone=request.data.get(
                "phone"
            ).strip(),

            address=request.data.get(
                "address"
            ).strip(),

            city=request.data.get(
                "city"
            ).strip(),

            state=request.data.get(
                "state"
            ).strip(),

            pincode=request.data.get(
                "pincode"
            ).strip(),

            status="PENDING",

            total_amount=Decimal("0.00")
        )


        # =========================
        # CREATE ORDER ITEMS
        # =========================

        for cart_item in cart_items:

            product = cart_item.product

            price = product.price

            subtotal = (
                price *
                cart_item.quantity
            )


            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=cart_item.quantity,
                price=price,
                subtotal=subtotal
            )


            total_amount += subtotal


        # =========================
        # UPDATE ORDER TOTAL
        # =========================

        order.total_amount = total_amount

        order.save(
            update_fields=[
                "total_amount",
                "updated_at"
            ]
        )


        # =========================
        # REDUCE PRODUCT STOCK
        # =========================

        for cart_item in cart_items:

            product = cart_item.product

            product.stock -= cart_item.quantity

            product.save(
                update_fields=["stock"]
            )


        # =========================
        # CLEAR CART
        # =========================

        cart.items.all().delete()


        # =========================
        # RETURN CREATED ORDER
        # =========================

        serializer = self.get_serializer(
            order
        )


        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related("items__product")
            .order_by("-created_at")
        )


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related("items__product")
        )


class AdminOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return (
            Order.objects
            .all()
            .prefetch_related("items__product")
            .order_by("-created_at")
        )


class AdminOrderDetailView(
    generics.RetrieveUpdateAPIView
):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]

    queryset = (
        Order.objects
        .all()
        .prefetch_related("items__product")
    )

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        order = self.get_object()

        new_status = request.data.get(
            "status"
        )


        if not new_status:
            return Response(
                {
                    "detail": "Status is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        valid_statuses = [
            choice[0]
            for choice in Order.STATUS_CHOICES
        ]


        if new_status not in valid_statuses:
            return Response(
                {
                    "detail": (
                        "Invalid status. "
                        f"Allowed values: {valid_statuses}"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        if order.status == "CANCELLED":
            return Response(
                {
                    "detail": (
                        "Cancelled orders "
                        "cannot be updated."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        if order.status == "DELIVERED":
            return Response(
                {
                    "detail": (
                        "Delivered orders "
                        "cannot be updated."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        if new_status == "CANCELLED":
            return Response(
                {
                    "detail": (
                        "Use the order cancellation "
                        "endpoint to cancel an order."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        allowed_transitions = {
            "PENDING": ["CONFIRMED"],
            "CONFIRMED": ["SHIPPED"],
            "SHIPPED": ["DELIVERED"],
        }


        allowed_statuses = (
            allowed_transitions.get(
                order.status,
                []
            )
        )


        if new_status not in allowed_statuses:
            return Response(
                {
                    "detail": (
                        "Cannot change order status "
                        f"from {order.status} "
                        f"to {new_status}."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        order.status = new_status

        order.save(
            update_fields=[
                "status",
                "updated_at"
            ]
        )


        serializer = self.get_serializer(
            order
        )


        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class OrderCancelView(
    generics.UpdateAPIView
):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related("items__product")
        )

    @transaction.atomic
    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        order = self.get_object()


        if order.status != "PENDING":
            return Response(
                {
                    "detail": (
                        "Only pending orders "
                        "can be cancelled."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        # Restore stock

        for item in order.items.select_related(
            "product"
        ).all():

            product = item.product

            product.stock += item.quantity

            product.save(
                update_fields=["stock"]
            )


        # Cancel order

        order.status = "CANCELLED"

        order.save(
            update_fields=[
                "status",
                "updated_at"
            ]
        )


        serializer = self.get_serializer(
            order
        )


        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )