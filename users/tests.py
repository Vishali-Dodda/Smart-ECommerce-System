from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


class AuthenticationTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="TestPassword123"
        )

        self.admin = User.objects.create_user(
            username="testadmin",
            password="AdminPassword123",
            is_staff=True
        )

        self.login_url = "/api/auth/login/"
        self.refresh_url = "/api/auth/token/refresh/"

    def test_user_can_login(self):
        response = self.client.post(
            self.login_url,
            {
                "username": "testuser",
                "password": "TestPassword123"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_invalid_login_fails(self):
        response = self.client.post(
            self.login_url,
            {
                "username": "testuser",
                "password": "WrongPassword"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    def test_refresh_token_returns_access_token(self):
        login_response = self.client.post(
            self.login_url,
            {
                "username": "testuser",
                "password": "TestPassword123"
            },
            format="json"
        )

        refresh_token = login_response.data["refresh"]

        response = self.client.post(
            self.refresh_url,
            {
                "refresh": refresh_token
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertIn("access", response.data)