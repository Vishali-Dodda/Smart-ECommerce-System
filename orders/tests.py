from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from cart.models import Cart, CartItem
from products.models import Category, Product

from .models import Order, OrderItem


User = get_user_model()


class OrderAPITests(APITestCase):

    def setUp(self):
        self.customer = User.objects.create_user(
            username="order_customer",
            password="TestOnlyPassword123!"
        )

        self.other_customer = User.objects.create_user(
            username="other_order_customer",
            password="TestOnlyPassword123!"
        )

        self.admin = User.objects.create_user(
            username="order_admin",
            password="AdminOnlyPassword123!",
            is_staff=True
        )

        self.category = Category.objects.create(
            name="Electronics"
        )

        self.product = Product.objects.create(
            name="Test Laptop",
            description="Order test product",
            price=50000,
            stock=10,
            is_active=True,
            category=self.category
        )

        self.inactive_product = Product.objects.create(
            name="Inactive Product",
            description="Inactive order product",
            price=1000,
            stock=10,
            is_active=False,
            category=self.category
        )

        self.create_order_url = "/api/orders/create/"
        self.orders_url = "/api/orders/"

    def authenticate_customer(self):
        self.client.force_authenticate(
            user=self.customer
        )

    def authenticate_admin(self):
        self.client.force_authenticate(
            user=self.admin
        )

    def add_product_to_customer_cart(self, quantity=1):
        cart, created = Cart.objects.get_or_create(
            user=self.customer
        )

        return CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=quantity
        )

    def test_empty_cart_cannot_create_order(self):
        self.authenticate_customer()

        response = self.client.post(
            self.create_order_url,
            {},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_customer_can_create_order(self):
        self.add_product_to_customer_cart(
            quantity=2
        )

        self.authenticate_customer()

        response = self.client.post(
            self.create_order_url,
            {},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertEqual(
            Order.objects.count(),
            1
        )

        order = Order.objects.first()

        self.assertEqual(
            order.status,
            "PENDING"
        )

        self.assertEqual(
            order.total_amount,
            100000
        )

    def test_order_item_is_created(self):
        self.add_product_to_customer_cart(
            quantity=2
        )

        self.authenticate_customer()

        response = self.client.post(
            self.create_order_url,
            {},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        order = Order.objects.first()

        self.assertEqual(
            OrderItem.objects.filter(
                order=order
            ).count(),
            1
        )

        item = OrderItem.objects.get(
            order=order
        )

        self.assertEqual(
            item.product,
            self.product
        )

        self.assertEqual(
            item.quantity,
            2
        )

        self.assertEqual(
            item.price,
            self.product.price
        )

        self.assertEqual(
            item.subtotal,
            100000
        )

    def test_order_reduces_product_stock(self):
        self.add_product_to_customer_cart(
            quantity=3
        )

        self.authenticate_customer()

        response = self.client.post(
            self.create_order_url,
            {},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.product.refresh_from_db()

        self.assertEqual(
            self.product.stock,
            7
        )

    def test_order_clears_cart(self):
        self.add_product_to_customer_cart(
            quantity=2
        )

        self.authenticate_customer()

        response = self.client.post(
            self.create_order_url,
            {},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        cart = Cart.objects.get(
            user=self.customer
        )

        self.assertEqual(
            cart.items.count(),
            0
        )

    def test_order_fails_when_stock_is_insufficient(self):
        self.add_product_to_customer_cart(
            quantity=20
        )

        self.authenticate_customer()

        response = self.client.post(
            self.create_order_url,
            {},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertEqual(
            Order.objects.count(),
            0
        )

    def test_order_fails_for_inactive_product(self):
        cart = Cart.objects.create(
            user=self.customer
        )

        CartItem.objects.create(
            cart=cart,
            product=self.inactive_product,
            quantity=1
        )

        self.authenticate_customer()

        response = self.client.post(
            self.create_order_url,
            {},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertEqual(
            Order.objects.count(),
            0
        )

    def test_customer_can_view_own_orders(self):
        order = Order.objects.create(
            user=self.customer,
            status="PENDING",
            total_amount=50000
        )

        self.authenticate_customer()

        response = self.client.get(
            self.orders_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data["count"],
            1
        )

    def test_customer_cannot_view_another_users_order(self):
        order = Order.objects.create(
            user=self.other_customer,
            status="PENDING",
            total_amount=50000
        )

        self.authenticate_customer()

        url = f"/api/orders/{order.id}/"

        response = self.client.get(
            url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )

    def test_customer_can_cancel_pending_order(self):
        self.add_product_to_customer_cart(
            quantity=2
        )

        self.authenticate_customer()

        create_response = self.client.post(
            self.create_order_url,
            {},
            format="json"
        )

        self.assertEqual(
            create_response.status_code,
            status.HTTP_201_CREATED
        )

        order_id = create_response.data["id"]

        self.product.refresh_from_db()

        self.assertEqual(
            self.product.stock,
            8
        )

        cancel_url = (
            f"/api/orders/{order_id}/cancel/"
        )

        response = self.client.patch(
            cancel_url,
            {},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data["status"],
            "CANCELLED"
        )

        self.product.refresh_from_db()

        self.assertEqual(
            self.product.stock,
            10
        )

    def test_cancelled_order_cannot_be_cancelled_again(self):
        self.add_product_to_customer_cart(
            quantity=1
        )

        self.authenticate_customer()

        create_response = self.client.post(
            self.create_order_url,
            {},
            format="json"
        )

        order_id = create_response.data["id"]

        cancel_url = (
            f"/api/orders/{order_id}/cancel/"
        )

        first_response = self.client.patch(
            cancel_url,
            {},
            format="json"
        )

        self.assertEqual(
            first_response.status_code,
            status.HTTP_200_OK
        )

        second_response = self.client.patch(
            cancel_url,
            {},
            format="json"
        )

        self.assertEqual(
            second_response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_admin_can_confirm_pending_order(self):
        order = Order.objects.create(
            user=self.customer,
            status="PENDING",
            total_amount=50000
        )

        self.authenticate_admin()

        url = (
            f"/api/orders/admin/{order.id}/"
        )

        response = self.client.patch(
            url,
            {
                "status": "CONFIRMED"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        order.refresh_from_db()

        self.assertEqual(
            order.status,
            "CONFIRMED"
        )

    def test_admin_can_ship_confirmed_order(self):
        order = Order.objects.create(
            user=self.customer,
            status="CONFIRMED",
            total_amount=50000
        )

        self.authenticate_admin()

        url = (
            f"/api/orders/admin/{order.id}/"
        )

        response = self.client.patch(
            url,
            {
                "status": "SHIPPED"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        order.refresh_from_db()

        self.assertEqual(
            order.status,
            "SHIPPED"
        )

    def test_admin_can_deliver_shipped_order(self):
        order = Order.objects.create(
            user=self.customer,
            status="SHIPPED",
            total_amount=50000
        )

        self.authenticate_admin()

        url = (
            f"/api/orders/admin/{order.id}/"
        )

        response = self.client.patch(
            url,
            {
                "status": "DELIVERED"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        order.refresh_from_db()

        self.assertEqual(
            order.status,
            "DELIVERED"
        )

    def test_admin_cannot_cancel_using_status_update(self):
        order = Order.objects.create(
            user=self.customer,
            status="PENDING",
            total_amount=50000
        )

        self.authenticate_admin()

        url = (
            f"/api/orders/admin/{order.id}/"
        )

        response = self.client.patch(
            url,
            {
                "status": "CANCELLED"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )