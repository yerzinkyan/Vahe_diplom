from django.http import JsonResponse
from .models import CalculationHistory, Algorithm
from .math_logic import run_calculation # Նոր ֆունկցիայի անունը

# views.py-ի մեջ ուղղիր այս ֆունկցիան
def get_algorithms(request):
    algorithms = list(Algorithm.objects.values(
        'id', 'title', 'slug', 'fast_method_name', 'slow_method_name', 
        'required_inputs', 'fast_explanation', 'fast_formula', 
        'slow_explanation', 'slow_formula' # Ավելացրինք այս դաշտերը
    ))
    return JsonResponse(algorithms, safe=False)

def combinations_api(request):
    input_data = {}
    for key, value in request.GET.items():
        if key != 'algo':
            try:
                input_data[key] = int(value)
            except ValueError:
                input_data[key] = value

    algorithm_slug = request.GET.get('algo', 'combinations')
    data = run_calculation(algorithm_slug, input_data)
    
    if "error" not in data:
        algo_obj = Algorithm.objects.filter(slug=algorithm_slug).first()
        if algo_obj:
            slow_time = data["time_slow_ms"] if isinstance(data["time_slow_ms"], (int, float)) else 0.0
            CalculationHistory.objects.create(
                algorithm=algo_obj,
                input_data=input_data,
                time_fast_ms=data["time_fast_ms"],
                time_slow_ms=slow_time
            )
            
            # Ուղարկում ենք ՏԵՔՍՏԵՐՆ ու ԲԱՆԱՁԵՎԵՐԸ բազայից React-ին
            data['title'] = algo_obj.title
            data['fast_name'] = algo_obj.fast_method_name
            data['slow_name'] = algo_obj.slow_method_name
            data['fast_formula'] = algo_obj.fast_formula
            data['fast_explanation'] = algo_obj.fast_explanation
            data['slow_formula'] = algo_obj.slow_formula
            data['slow_explanation'] = algo_obj.slow_explanation

    return JsonResponse(data)

def get_algorithm_history(request, slug):
    # Վերցնում ենք այս ալգորիթմի բոլոր հաշվարկները բազայից
    history_records = CalculationHistory.objects.filter(algorithm__slug=slug)
    
    data = []
    for record in history_records:
        n_val = record.input_data.get('n')
        
        # Վերցնում ենք բոլոր հաշվարկները, որոնք ունեն N արժեք
        if n_val is not None:
            data.append({
                "n": int(n_val),
                "Օպտիմալ": record.time_fast_ms,
                # Եթե դանդաղը 0 է կամ None (այսինքն չի հաշվարկվել), ուղարկում ենք None, որ գրաֆիկը չխառնվի
                "Ոչ Օպտիմալ": record.time_slow_ms if record.time_slow_ms and record.time_slow_ms > 0 else None
            })
            
    # Դասավորում ենք ըստ N-ի մեծացման
    data = sorted(data, key=lambda x: x['n'])
    
    # Մաքրում ենք կրկնվող N-երը (եթե նույն N-ը մի քանի անգամ է հաշվարկվել)
    unique_data = {item['n']: item for item in data}.values()
    
    # ՈՒՂՂՈՒՄ. Հեռացրել ենք [-20:] սահմանափակումը, որպեսզի բոլոր տվյալները ուղարկվեն
    return JsonResponse(list(unique_data), safe=False)