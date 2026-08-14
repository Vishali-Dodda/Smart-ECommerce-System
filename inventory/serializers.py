from rest_framework import serializers

from products.models import Product


class InventorySerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(
        source="name",
        read_only=True
    )

    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    stock_status = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "product_name",
            "category_name",
            "price",
            "stock",
            "is_active",
            "stock_status",
        ]

        read_only_fields = [
            "id",
            "product_name",
            "category_name",
            "price",
            "stock_status",
        ]

    def get_stock_status(self, obj):

        if obj.stock == 0:
            return "OUT_OF_STOCK"

        if obj.stock <= 5:
            return "LOW_STOCK"

        return "IN_STOCK"

    def validate_stock(self, value):

        if value < 0:
            raise serializers.ValidationError(
                "Stock cannot be negative."
            )

        return value

class StockAdjustmentSerializer(serializers.Serializer):

    quantity = serializers.IntegerField()

    reason = serializers.CharField(
        max_length=255
    )

    def validate_quantity(self, value):

        if value == 0:
            raise serializers.ValidationError(
                "Adjustment quantity cannot be zero."
            )

        return value

    def validate_reason(self, value):

        if not value.strip():
            raise serializers.ValidationError(
                "Reason cannot be empty."
            )

        return value.strip()