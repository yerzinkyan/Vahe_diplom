from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Միացնում ենք մեր ալգորիթմների հասցեները գլխավոր համակարգին
    path('', include('algorithms.urls')), 
]