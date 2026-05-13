from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view()),
    path('logout/', views.LogoutView.as_view()),
    path('me/', views.MeView.as_view()),
    path('me/change-password/', views.ChangePasswordView.as_view()),
    path('cloudinary/sign/', views.CloudinarySignView.as_view()),
]
