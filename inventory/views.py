from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from products.models import Product
from .serializers import (
    InventorySerializer,
    StockAdjustmentSerializer,
)
from orders.permissions import IsAdminUser


class InventoryListView(generics.ListAPIView):
    """
    Allows admins to view inventory for all products.
    """

    serializer_class = InventorySerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Product.objects.select_related(
            "category"
        ).order_by("id")


class InventoryDetailView(generics.RetrieveUpdateAPIView):
    """
    Allows admins to view and update inventory
    for a specific product.
    """

    serializer_class = InventorySerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Product.objects.select_related(
            "category"
        )

class StockAdjustmentView(generics.GenericAPIView):
    """
    Allows admins to increase or decrease product stock.
    """

    serializer_class = StockAdjustmentSerializer
    permission_classes = [IsAdminUser]

    def post(self, request, pk):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        quantity = serializer.validated_data["quantity"]
        reason = serializer.validated_data["reason"]

        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        new_stock = product.stock + quantity

        # Prevent negative stock
        if new_stock < 0:
            return Response(
                {
                    "detail": (
                        f"Insufficient stock. "
                        f"Current stock: {product.stock}, "
                        f"adjustment: {quantity}."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        old_stock = product.stock

        product.stock = new_stock
        product.save(update_fields=["stock"])

        return Response(
            {
                "product_id": product.id,
                "product_name": product.name,
                "previous_stock": old_stock,
                "adjustment": quantity,
                "new_stock": product.stock,
                "reason": reason,
            },
            status=status.HTTP_200_OK
        )