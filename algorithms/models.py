from django.db import models
from django.contrib.auth.models import User

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


from django.db import models

class Problem(models.Model):
    DIFFICULTY_CHOICES = [
        ('Easy', '🟢 Հեշտ'),
        ('Medium', '🟡 Միջին'),
        ('Hard', '🔴 Բարդ'),
    ]
    
    # --- ՆՈՐ ԴԱՇՏ: Ալգորիթմների բաժիններ ---
    TOPIC_CHOICES = [
        ('Կոմբինատորիկա', 'Կոմբինատորիկա'),
        ('Դինամիկ Ծրագրավորում', 'Դինամիկ Ծրագրավորում'),
        ('Գրաֆների Տեսություն', 'Գրաֆների Տեսություն'),
        ('Տեսակավորում և Որոնում', 'Տեսակավորում և Որոնում'),
        ('Մաթեմատիկա', 'Մաթեմատիկա'),
    ]

    title = models.CharField(max_length=255, verbose_name="Խնդրի Վերնագիր")
    slug = models.SlugField(unique=True, help_text="Օրինակ՝ combinations")
    
    # Ավելացնում ենք բաժինը
    topic = models.CharField(max_length=100, choices=TOPIC_CHOICES, default='Կոմբինատորիկա', verbose_name="Ալգորիթմի Բաժին")
    
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='Medium')
    
    description = models.TextField(verbose_name="Խնդրի Պահանջը")
    constraints = models.TextField(verbose_name="Սահմանափակումներ")
    starter_code = models.TextField(verbose_name="Սկզբնական կոդ")
    test_cases = models.JSONField(verbose_name="Թեստեր (JSON)")

    def __str__(self):
        return f"{self.title} ({self.topic})"
    
class SolvedProblem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Օգտատեր")
    problem = models.ForeignKey('Problem', on_delete=models.CASCADE, verbose_name="Խնդիր")
    solution_code = models.TextField(blank=True, null=True, verbose_name="Լուծման կոդ") # ՆՈՐ ԴԱՇՏ
    solved_at = models.DateTimeField(auto_now_add=True, verbose_name="Լուծման ամսաթիվ")

    class Meta:
        unique_together = ('user', 'problem')

    def __str__(self):
        return f"{self.user.username} - {self.problem.title} ✅"