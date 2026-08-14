from rest_framework import serializers
from .models import Product, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Price must be greater than zero."
            )
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Stock cannot be negative."
            )
        return value

    def validate(self, data):
        if data.get("is_active") and data.get("stock", 0) == 0:
            raise serializers.ValidationError(
                "A product cannot be active when stock is zero."
            )
        return data

    class Meta:
        model = Product
        fields = "__all__"