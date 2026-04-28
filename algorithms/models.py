from django.db import models

class Algorithm(models.Model):
    title = models.CharField(max_length=100)
    slug = models.CharField(max_length=50)
    required_inputs = models.CharField(max_length=100, default="n,k") 
    
    fast_method_name = models.CharField(max_length=150)
    slow_method_name = models.CharField(max_length=150)

    fast_formula = models.CharField(max_length=255, default="", blank=True, verbose_name="Արագի բանաձև")
    fast_explanation = models.TextField(default="", blank=True, verbose_name="Արագի բացատրություն")
    
    slow_formula = models.CharField(max_length=255, default="", blank=True, verbose_name="Դանդաղի բանաձև")
    slow_explanation = models.TextField(default="", blank=True, verbose_name="Դանդաղի բացատրություն")

    def __str__(self):
        return self.title

class CalculationHistory(models.Model):
    algorithm = models.ForeignKey(Algorithm, on_delete=models.CASCADE)
    input_data = models.JSONField(default=dict) 
    time_fast_ms = models.FloatField()
    time_slow_ms = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)