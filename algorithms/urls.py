from django.urls import path
from . import views

urlpatterns = [
    path('api/algorithms/', views.get_algorithms, name='get_algorithms'),
    path('api/history/<str:slug>/', views.get_algorithm_history, name='get_algorithm_history'), # ՆՈՐ ԳԻԾԸ
    path('api/combinations/', views.combinations_api, name='combinations_api'),
    path('api/execute/', views.execute_code, name='execute_code'),
    path('api/problems/', views.get_problems, name='get_problems'),
    path('api/login/', views.api_login, name='api_login'),
    path('api/check-auth/', views.check_auth, name='check_auth'),
    path('api/register/', views.api_register, name='api_register'),
    path('api/logout/', views.api_logout, name='api_logout'),
    path('api/profile-stats/', views.get_profile_stats, name='profile_stats'),
]