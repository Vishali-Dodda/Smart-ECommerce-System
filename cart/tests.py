from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from products.models import Category, Product
from .models import Cart, CartItem


User = get_user_model()


class CartAPITests(APITestCase):

    def setUp(self):
        self.customer = User.objects.create_user(
            username="cart_customer",
            password="TestOnlyPassword123!"
        )

        self.other_customer = User.objects.create_user(
            username="other_customer",
            password="TestOnlyPassword123!"
        )

        self.category = Category.objects.create(
            name="Electronics"
        )

        self.product = Product.objects.create(
            name="Test Laptop",
            description="Cart test product",
            price=50000,
            stock=10,
            is_active=True,
            category=self.category
        )

        self.inactive_product = Product.objects.create(
            name="Inactive Product",
            description="Inactive test product",
            price=1000,
            stock=10,
            is_active=False,
            category=self.category
        )

        self.cart_url = "/api/cart/"
        self.cart_items_url = "/api/cart/items/"

        self.client.force_authenticate(
            user=self.customer
        )

    def test_customer_can_view_cart(self):
        response = self.client.get(
            self.cart_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertIn(
            "items",
            response.data
        )

    def test_customer_can_add_product_to_cart(self):
        response = self.client.post(
            self.cart_items_url,
            {
                "product": self.product.id,
                "quantity": 2
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertEqual(
            response.data["quantity"],
            2
        )

        self.assertTrue(
            CartItem.objects.filter(
                cart__user=self.customer,
                product=self.product
            ).exists()
        )

    def test_invalid_product_is_rejected(self):
        response = self.client.post(
            self.cart_items_url,
            {
                "product": 9999,
                "quantity": 1
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )

    def test_inactive_product_is_rejected(self):
        response = self.client.post(
            self.cart_items_url,
            {
                "product": self.inactive_product.id,
                "quantity": 1
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_quantity_greater_than_stock_is_rejected(self):
        response = self.client.post(
            self.cart_items_url,
            {
                "product": self.product.id,
                "quantity": 20
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_zero_quantity_is_rejected(self):
        response = self.client.post(
            self.cart_items_url,
            {
                "product": self.product.id,
                "quantity": 0
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_customer_can_update_cart_item(self):
        cart = Cart.objects.create(
            user=self.customer
        )

        cart_item = CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=2
        )

        url = f"/api/cart/items/{cart_item.id}/"

        response = self.client.patch(
            url,
            {
                "quantity": 5
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        cart_item.refresh_from_db()

        self.assertEqual(
            cart_item.quantity,
            5
        )

    def test_customer_can_delete_cart_item(self):
        cart = Cart.objects.create(
            user=self.customer
        )

        cart_item = CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=2
        )

        url = f"/api/cart/items/{cart_item.id}/delete/"

        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT
        )

        self.assertFalse(
            CartItem.objects.filter(
                id=cart_item.id
            ).exists()
        )

    def test_customer_cannot_access_another_users_cart_item(self):
        other_cart = Cart.objects.create(
            user=self.other_customer
        )

        cart_item = CartItem.objects.create(
            cart=other_cart,
            product=self.product,
            quantity=2
        )

        url = f"/api/cart/items/{cart_item.id}/"

        response = self.client.patch(
            url,
            {
                "quantity": 5
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )