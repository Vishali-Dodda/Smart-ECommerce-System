from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, Product


User = get_user_model()


class ProductAPITests(APITestCase):

    def setUp(self):
        self.customer = User.objects.create_user(
            username="test_customer",
            password="TestOnlyPassword123!"
        )

        self.admin = User.objects.create_user(
            username="test_admin",
            password="AdminOnlyPassword123!",
            is_staff=True
        )

        self.category = Category.objects.create(
            name="Electronics"
        )

        self.products_url = "/api/products/"

    def authenticate_as_customer(self):
        self.client.force_authenticate(
            user=self.customer
        )

    def authenticate_as_admin(self):
        self.client.force_authenticate(
            user=self.admin
        )

    def test_customer_can_view_products(self):
        Product.objects.create(
            name="Test Laptop",
            description="Test product",
            price=50000,
            stock=10,
            is_active=True,
            category=self.category
        )

        self.authenticate_as_customer()

        response = self.client.get(
            self.products_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    def test_admin_can_create_product(self):
        self.authenticate_as_admin()

        response = self.client.post(
            self.products_url,
            {
                "name": "Test Laptop",
                "description": "Test product",
                "price": 50000,
                "stock": 10,
                "is_active": True,
                "category": self.category.id
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertEqual(
            Product.objects.count(),
            1
        )

    def test_customer_cannot_create_product(self):
        self.authenticate_as_customer()

        response = self.client.post(
            self.products_url,
            {
                "name": "Unauthorized Product",
                "description": "Should fail",
                "price": 1000,
                "stock": 10,
                "is_active": True,
                "category": self.category.id
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_negative_price_is_rejected(self):
        self.authenticate_as_admin()

        response = self.client.post(
            self.products_url,
            {
                "name": "Invalid Product",
                "description": "Invalid price",
                "price": -100,
                "stock": 10,
                "is_active": True,
                "category": self.category.id
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_negative_stock_is_rejected(self):
        self.authenticate_as_admin()

        response = self.client.post(
            self.products_url,
            {
                "name": "Invalid Product",
                "description": "Invalid stock",
                "price": 1000,
                "stock": -5,
                "is_active": True,
                "category": self.category.id
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )


class CategoryAPITests(APITestCase):

    def setUp(self):
        self.customer = User.objects.create_user(
            username="category_customer",
            password="TestOnlyPassword123!"
        )

        self.category_url = "/api/categories/"

    def test_customer_can_view_categories(self):
        Category.objects.create(
            name="Electronics"
        )

        self.client.force_authenticate(
            user=self.customer
        )

        response = self.client.get(
            self.category_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )