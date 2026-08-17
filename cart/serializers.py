from rest_framework import serializers

from .models import Cart, CartItem
from products.models import Product


class CartProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "stock",
            "is_active",
            "category_name",
        ]


class CartItemSerializer(serializers.ModelSerializer):
    product_details = CartProductSerializer(
        source="product",
        read_only=True
    )

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product",
            "product_details",
            "quantity",
        ]

        read_only_fields = [
            "id",
            "product_details",
        ]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Quantity must be greater than zero."
            )

        return value


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Cart
        fields = [
            "id",
            "items",
            "created_at",
            "updated_at",
        ]