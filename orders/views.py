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

        # Get the logged-in user's cart
        cart = Cart.objects.filter(
            user=request.user
        ).first()

        # Check if cart does not exist
        if not cart:
            return Response(
                {"detail": "Your cart is empty."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if cart is empty
        cart_items = cart.items.select_related("product").all()

        if not cart_items.exists():
            return Response(
                {"detail": "Your cart is empty."},
            status=status.HTTP_400_BAD_REQUEST
            )

        total_amount = Decimal("0.00")

        # Validate all cart items before creating the order
        for cart_item in cart_items:

            product = cart_item.product

            # Check product is active
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

            # Check stock
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

        # Create the order
        order = Order.objects.create(
            user=request.user,
            status="PENDING",
            total_amount=Decimal("0.00")
        )

        # Create OrderItems and calculate total
        for cart_item in cart_items:

            product = cart_item.product

            price = product.price
            subtotal = price * cart_item.quantity

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=cart_item.quantity,
                price=price,
                subtotal=subtotal
            )

            total_amount += subtotal

        # Update order total
        order.total_amount = total_amount
        order.save(update_fields=["total_amount", "updated_at"])

        # Reduce inventory
        for cart_item in cart_items:

            product = cart_item.product
            product.stock -= cart_item.quantity
            product.save(update_fields=["stock"])

        # Clear cart after successful order creation
        cart.items.all().delete()

        serializer = self.get_serializer(order)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(
            user=self.request.user
        ).prefetch_related(
            "items__product"
        ).order_by("-created_at")

class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(
            user=self.request.user
        ).prefetch_related(
            "items__product"
        )

class AdminOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Order.objects.all().prefetch_related(
            "items__product"
        ).order_by("-created_at")

class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]

    queryset = Order.objects.all().prefetch_related(
        "items__product"
    )

    def update(self, request, *args, **kwargs):
        order = self.get_object()

        new_status = request.data.get("status")

        if not new_status:
            return Response(
                {"detail": "Status is required."},
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
                        f"Invalid status. "
                        f"Allowed values: {valid_statuses}"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prevent changing an already cancelled order
        if order.status == "CANCELLED":
            return Response(
                {
                    "detail": (
                        "Cancelled orders cannot be updated."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prevent changing a delivered order
        if order.status == "DELIVERED":
            return Response(
                {
                    "detail": (
                        "Delivered orders cannot be updated."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Cancellation must use the dedicated cancellation endpoint
        if new_status == "CANCELLED":
            return Response(
                {
                    "detail": (
                        "Use the order cancellation endpoint "
                        "to cancel an order."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Define allowed forward transitions
        allowed_transitions = {
            "PENDING": ["CONFIRMED"],
            "CONFIRMED": ["SHIPPED"],
            "SHIPPED": ["DELIVERED"],
        }

        allowed_statuses = allowed_transitions.get(
            order.status,
            []
        )

        if new_status not in allowed_statuses:
            return Response(
                {
                    "detail": (
                        f"Cannot change order status "
                        f"from {order.status} to {new_status}."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = new_status
        order.save(
            update_fields=["status", "updated_at"]
        )

        serializer = self.get_serializer(order)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

class OrderCancelView(generics.UpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(
            user=self.request.user
        ).prefetch_related("items__product")

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        order = self.get_object()

        # Only pending orders can be cancelled
        if order.status != "PENDING":
            return Response(
                {
                    "detail": (
                        "Only pending orders can be cancelled."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Restore product stock
        for item in order.items.select_related("product").all():
            product = item.product
            product.stock += item.quantity
            product.save(update_fields=["stock"])

        # Update order status
        order.status = "CANCELLED"
        order.save(update_fields=["status", "updated_at"])

        serializer = self.get_serializer(order)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )