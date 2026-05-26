from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from oauth2_provider.models import Application

User = get_user_model()


class RegisterLoginSmokeTest(TestCase):
    """Smoke test: register then login with OAuth2 token endpoint."""

    def setUp(self):
        self.client = APIClient()
        # Create OAuth2 Application for token endpoint
        # Password grant needs a user owner
        admin_user = User.objects.create_user(
            username='admin_app_owner',
            password='admin123',
            is_staff=True
        )
        self.application = Application.objects.create(
            name="Test App",
            user=admin_user,
            client_type=Application.CLIENT_PUBLIC,
            authorization_grant_type=Application.GRANT_PASSWORD,
        )

    def test_register_and_login(self):
        """Register user letuankhoi1, then login via /o/token/"""

        # Step 1: Register
        register_data = {
            'username': 'letuankhoi1',
            'password': 'letuankhoi',
            'email': 'tuankhoi123@gmail.com',
            'is_customer': True,
        }

        response = self.client.post('/api/accounts/register/', register_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['username'], 'letuankhoi1')

        # Verify user exists in DB
        user = User.objects.get(username='letuankhoi1')
        self.assertTrue(user.check_password('letuankhoi'))

        # Step 2: Login via OAuth2 token endpoint
        # Public client: no client_secret
        token_data = {
            'grant_type': 'password',
            'username': 'letuankhoi1',
            'password': 'letuankhoi',
            'client_id': self.application.client_id,
        }

        response = self.client.post('/o/token/', token_data)
        print(f"Token response status: {response.status_code}")
        print(f"Token response body: {response.content}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        import json
        token_response = json.loads(response.content)
        self.assertIn('access_token', token_response)
        self.assertIn('refresh_token', token_response)

        # Step 3: Use token to access protected endpoint
        access_token = token_response['access_token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        response = self.client.get('/api/accounts/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'letuankhoi1')
