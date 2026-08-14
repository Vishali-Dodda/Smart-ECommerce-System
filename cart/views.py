from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from products.models import Product


class CartView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        cart, created = Cart.objects.get_or_create(
            user=self.request.user
        )
        return cart


class CartItemCreateView(generics.CreateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):

        product_id = request.data.get("product")
        quantity = request.data.get("quantity", 1)

        # Check product ID
        if not product_id:
            return Response(
                {"detail": "Product is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check product exists
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check product is active
        if not product.is_active:
            return Response(
                {"detail": "This product is not available."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate quantity
        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Quantity must be a valid number."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity <= 0:
            return Response(
                {"detail": "Quantity must be greater than zero."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get or create user's cart
        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        # Check if product already exists in cart
        cart_item = CartItem.objects.filter(
            cart=cart,
            product=product
        ).first()

        if cart_item:
            new_quantity = cart_item.quantity + quantity

            # Check stock
            if new_quantity > product.stock:
                return Response(
                    {
                        "detail": f"Only {product.stock} units are available."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            cart_item.quantity = new_quantity
            cart_item.save()

        else:
            # Check stock
            if quantity > product.stock:
                return Response(
                    {
                        "detail": f"Only {product.stock} units are available."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            cart_item = CartItem.objects.create(
                cart=cart,
                product=product,
                quantity=quantity
            )

        serializer = self.get_serializer(cart_item)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class CartItemUpdateView(generics.UpdateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["patch"]

    def get_queryset(self):
        """
        Return only cart items belonging to the logged-in user.
        """
        return CartItem.objects.filter(
            cart__user=self.request.user
        )

    def update(self, request, *args, **kwargs):
        cart_item = self.get_object()

        quantity = request.data.get("quantity")

        # Quantity must be provided
        if quantity is None:
            return Response(
                {"detail": "Quantity is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Quantity must be a valid number
        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Quantity must be a valid number."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Quantity must be greater than zero
        if quantity <= 0:
            return Response(
                {"detail": "Quantity must be greater than zero."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check available stock
        if quantity > cart_item.product.stock:
            return Response(
                {
                    "detail": (
                        f"Only {cart_item.product.stock} units are available."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update quantity
        cart_item.quantity = quantity
        cart_item.save()

        serializer = self.get_serializer(cart_item)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class CartItemDeleteView(generics.DestroyAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Return only cart items belonging to the logged-in user.
        """
        return CartItem.objects.filter(
            cart__user=self.request.user
        )

class CartClearView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        cart.items.all().delete()

        return Response(
            {"detail": "Cart cleared successfully."},
            status=status.HTTP_204_NO_CONTENT
        )