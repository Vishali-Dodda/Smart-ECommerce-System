from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from products.models import Category, Product


User = get_user_model()


class InventoryAPITests(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_user(
            username="inventory_admin",
            password="AdminOnlyPassword123!",
            is_staff=True
        )

        self.customer = User.objects.create_user(
            username="inventory_customer",
            password="TestOnlyPassword123!"
        )

        self.category = Category.objects.create(
            name="Electronics"
        )

        self.product = Product.objects.create(
            name="Inventory Laptop",
            description="Inventory test product",
            price=50000,
            stock=20,
            is_active=True,
            category=self.category
        )

        self.inventory_url = "/api/inventory/"

    def authenticate_admin(self):
        self.client.force_authenticate(
            user=self.admin
        )

    def authenticate_customer(self):
        self.client.force_authenticate(
            user=self.customer
        )

    def test_admin_can_view_inventory(self):
        self.authenticate_admin()

        response = self.client.get(
            self.inventory_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    def test_admin_can_view_product_inventory(self):
        self.authenticate_admin()

        response = self.client.get(
            f"{self.inventory_url}{self.product.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data["stock"],
            20
        )

        self.assertEqual(
            response.data["stock_status"],
            "IN_STOCK"
        )

    def test_admin_can_update_stock(self):
        self.authenticate_admin()

        response = self.client.patch(
            f"{self.inventory_url}{self.product.id}/",
            {
                "stock": 30
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.product.refresh_from_db()

        self.assertEqual(
            self.product.stock,
            30
        )

    def test_negative_stock_is_rejected(self):
        self.authenticate_admin()

        response = self.client.patch(
            f"{self.inventory_url}{self.product.id}/",
            {
                "stock": -5
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.product.refresh_from_db()

        self.assertEqual(
            self.product.stock,
            20
        )

    def test_low_stock_status(self):
        self.product.stock = 5
        self.product.save()

        self.authenticate_admin()

        response = self.client.get(
            f"{self.inventory_url}{self.product.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data["stock_status"],
            "LOW_STOCK"
        )

    def test_out_of_stock_status(self):
        self.product.stock = 0
        self.product.save()

        self.authenticate_admin()

        response = self.client.get(
            f"{self.inventory_url}{self.product.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data["stock_status"],
            "OUT_OF_STOCK"
        )

    def test_customer_cannot_view_inventory(self):
        self.authenticate_customer()

        response = self.client.get(
            self.inventory_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_customer_cannot_update_inventory(self):
        self.authenticate_customer()

        response = self.client.patch(
            f"{self.inventory_url}{self.product.id}/",
            {
                "stock": 50
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

        self.product.refresh_from_db()

        self.assertEqual(
            self.product.stock,
            20
        )

    def test_admin_can_increase_stock(self):
        self.authenticate_admin()

        response = self.client.post(
            f"{self.inventory_url}{self.product.id}/adjust/",
            {
                "quantity": 10,
                "reason": "New stock received"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data["previous_stock"],
            20
        )

        self.assertEqual(
            response.data["adjustment"],
            10
        )

        self.assertEqual(
            response.data["new_stock"],
            30
        )

        self.product.refresh_from_db()

        self.assertEqual(
            self.product.stock,
            30
        )

    def test_admin_can_decrease_stock(self):
        self.authenticate_admin()

        response = self.client.post(
            f"{self.inventory_url}{self.product.id}/adjust/",
            {
                "quantity": -5,
                "reason": "Damaged items"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data["new_stock"],
            15
        )

        self.product.refresh_from_db()

        self.assertEqual(
            self.product.stock,
            15
        )

    def test_zero_adjustment_is_rejected(self):
        self.authenticate_admin()

        response = self.client.post(
            f"{self.inventory_url}{self.product.id}/adjust/",
            {
                "quantity": 0,
                "reason": "Testing"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_adjustment_cannot_make_stock_negative(self):
        self.authenticate_admin()

        response = self.client.post(
            f"{self.inventory_url}{self.product.id}/adjust/",
            {
                "quantity": -100,
                "reason": "Invalid stock removal"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.product.refresh_from_db()

        self.assertEqual(
            self.product.stock,
            20
        )

    def test_adjustment_requires_reason(self):
        self.authenticate_admin()

        response = self.client.post(
            f"{self.inventory_url}{self.product.id}/adjust/",
            {
                "quantity": 5,
                "reason": ""
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_customer_cannot_adjust_stock(self):
        self.authenticate_customer()

        response = self.client.post(
            f"{self.inventory_url}{self.product.id}/adjust/",
            {
                "quantity": 10,
                "reason": "Unauthorized adjustment"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

        self.product.refresh_from_db()

        self.assertEqual(
            self.product.stock,
            20
        )