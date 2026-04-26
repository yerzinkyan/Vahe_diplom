from django.contrib import admin
from .models import CalculationHistory, Algorithm

@admin.register(Algorithm)
class AlgorithmAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'fast_method_name')

@admin.register(CalculationHistory)
class CalculationHistoryAdmin(admin.ModelAdmin):
    # ԱՅՍՏԵՂ փոխեցինք n_value և k_value-ն input_data-ով
    list_display = ('algorithm', 'input_data', 'time_fast_ms', 'time_slow_ms', 'created_at')