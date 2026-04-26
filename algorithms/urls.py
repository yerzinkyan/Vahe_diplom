from django.urls import path
from . import views

urlpatterns = [
    path('api/algorithms/', views.get_algorithms, name='get_algorithms'),
    path('api/history/<str:slug>/', views.get_algorithm_history, name='get_algorithm_history'), # ՆՈՐ ԳԻԾԸ
    path('api/combinations/', views.combinations_api, name='combinations_api'),
]