from django.contrib import admin
from django.utils.html import format_html
from .models import Algorithm, CalculationHistory

@admin.register(Algorithm)
class AlgorithmAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'fast_method_name', 'history_count_display')
    search_fields = ('title', 'slug')
    
    fieldsets = (
        ("Հիմնական", {
            'fields': ('title', 'slug', 'required_inputs')
        }),
        ("Օպտիմալ Մեթոդ", {
            'fields': ('fast_method_name', 'fast_formula', 'fast_explanation'),
        }),
        ("Ոչ Օպտիմալ Մեթոդ", {
            'fields': ('slow_method_name', 'slow_formula', 'slow_explanation'),
        }),
    )

    def history_count_display(self, obj):
        count = obj.calculationhistory_set.count()
        return format_html('<b>{} հաշվարկ</b>', count)
    history_count_display.short_description = 'Պատմություն'

@admin.register(CalculationHistory)
class CalculationHistoryAdmin(admin.ModelAdmin):
    list_display = ('algorithm', 'display_inputs', 'time_fast_ms', 'time_slow_ms', 'created_at')
    list_filter = ('algorithm', 'created_at')
    readonly_fields = ('algorithm', 'input_data', 'time_fast_ms', 'time_slow_ms', 'created_at')

    def display_inputs(self, obj):
        inputs = obj.input_data
        if isinstance(inputs, dict):
            return ", ".join([f"{k}={v}" for k, v in inputs.items()])
        return str(inputs)
    display_inputs.short_description = 'Մուտքային տվյալներ'

admin.site.site_header = "Գիտական Լաբորատորիա | Control Panel"
admin.site.site_title = "Admin"
admin.site.index_title = "Նախագծի Կառավարում"