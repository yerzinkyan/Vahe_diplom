from django.http import JsonResponse
from .models import CalculationHistory, Algorithm, Problem, SolvedProblem
from .math_logic import run_calculation 
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User # ԱՎԵԼԱՑՐՈՒ ՍԱ
from django.db import IntegrityError        # ԱՎԵԼԱՑՐՈՒ ՍԱ
import json
import subprocess
import tempfile
import os
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt # Առայժմ անջատում ենք CSRF-ը, որ React-ից հեշտ լինի
def api_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({'status': 'success', 'username': user.username})
            else:
                return JsonResponse({'status': 'error', 'message': 'Սխալ մուտքանուն կամ գաղտնաբառ'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Միայն POST հարցումներ'}, status=405)

@csrf_exempt
def api_register(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                return JsonResponse({'status': 'error', 'message': 'Լրացրեք բոլոր դաշտերը'}, status=400)
            
            user = User.objects.create_user(username=username, password=password)
            login(request, user)
            
            return JsonResponse({'status': 'success', 'username': user.username})
        except IntegrityError:
            return JsonResponse({'status': 'error', 'message': 'Այս մուտքանունով օգտատեր արդեն գոյություն ունի'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
    return JsonResponse({'status': 'error', 'message': 'Միայն POST հարցումներ'}, status=405)

def check_auth(request):
    if request.user.is_authenticated:
        return JsonResponse({'is_authenticated': True, 'username': request.user.username})
    return JsonResponse({'is_authenticated': False})

@csrf_exempt
def api_logout(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error', 'message': 'Միայն POST հարցումներ'}, status=405)

def get_algorithms(request):
    algorithms = list(Algorithm.objects.values(
        'id', 'title', 'slug', 'fast_method_name', 'slow_method_name', 
        'required_inputs', 'fast_explanation', 'fast_formula', 
        'slow_explanation', 'slow_formula' 
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
            
            data['title'] = algo_obj.title
            data['fast_name'] = algo_obj.fast_method_name
            data['slow_name'] = algo_obj.slow_method_name
            data['fast_formula'] = algo_obj.fast_formula
            data['fast_explanation'] = algo_obj.fast_explanation
            data['slow_formula'] = algo_obj.slow_formula
            data['slow_explanation'] = algo_obj.slow_explanation

    return JsonResponse(data)

def get_algorithm_history(request, slug):
    history_records = CalculationHistory.objects.filter(algorithm__slug=slug)
    
    data = []
    for record in history_records:
        n_val = record.input_data.get('n')
        
        if n_val is not None:
            data.append({
                "n": int(n_val),
                "Օպտիմալ": record.time_fast_ms,
                "Ոչ Օպտիմալ": record.time_slow_ms if record.time_slow_ms and record.time_slow_ms > 0 else None
            })
    data = sorted(data, key=lambda x: x['n'])
    unique_data = {item['n']: item for item in data}.values()

    return JsonResponse(list(unique_data), safe=False)

@csrf_exempt
def execute_code(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_code = data.get('code', '')
        problem_slug = data.get('problem_slug', '')

        # 1. Գտնում ենք խնդիրը բազայից
        try:
            problem = Problem.objects.get(slug=problem_slug)
        except Problem.DoesNotExist:
            return JsonResponse({'status': 'error', 'output': '❌ Խնդիրը չի գտնվել սերվերում:'})

        test_cases = problem.test_cases

        # 2. Ստեղծում ենք ժամանակավոր ֆայլ
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False, encoding='utf-8') as f:
            # Գրում ենք ուսանողի կոդը
            f.write(user_code)
            f.write("\n\nimport time, tracemalloc\n")
            f.write("if __name__ == '__main__':\n")
            f.write("    tracemalloc.start()\n")
            f.write("    t0 = time.perf_counter()\n")
            f.write("    all_passed = True\n")
            
            # 3. ԴԻՆԱՄԻԿ ԹԵՍՏԱՎՈՐՈՒՄ (Խելացի տպագրությամբ)
            for i, tc in enumerate(test_cases):
                inputs = tc['inputs']
                expected = tc['expected']
                
                # Եթե նախորդ թեստը սխալ էր, մյուսները չենք ստուգում
                f.write(f"    if all_passed:\n")
                f.write(f"        try:\n")
                f.write(f"            res = solve({inputs})\n")
                
                # Ստուգում ենք արդյունքը (հեռացնում ենք բացատները ճիշտ համեմատման համար)
                f.write(f"            if str(res).replace(' ', '') != str({expected}).replace(' ', ''):\n")
                f.write(f"                print('\\n' + '❌'*15)\n")
                f.write(f"                print(f'  ՍԽԱԼ ԱՐԴՅՈՒՆՔ (ԹԵՍՏ {i+1})')\n")
                f.write(f"                print('-'*30)\n")
                f.write(f"                print(f'📥 ՄՈՒՏՔ (Input):\\n   {inputs}\\n')\n")
                f.write(f"                print(f'🎯 ՍՊԱՍՎՈՒՄ ԷՐ (Expected):\\n   {expected}\\n')\n")
                f.write(f"                print(f'🛑 ՁԵՐ ԿՈԴԸ ՏՎԵՑ:\\n   {{res}}')\n")
                f.write(f"                print('❌'*15 + '\\n')\n")
                f.write(f"                all_passed = False\n")
                
                f.write(f"        except Exception as e:\n")
                # Եթե ուսանողի կոդը Error տվեց (օրինակ՝ զրոյի բաժանում կամ սխալ փոփոխական)
                f.write(f"            print('\\n' + '⚠️'*15)\n")
                f.write(f"            print(f'  ԾՐԱԳՐԱՅԻՆ ՍԽԱԼ (ԹԵՍՏ {i+1})')\n")
                f.write(f"            print('-'*30)\n")
                f.write(f"            print(f'📥 ՄՈՒՏՔ (Input):\\n   {inputs}\\n')\n")
                f.write(f"            print(f'❌ ՍԽԱԼԻ ՏԵՔՍՏԸ:\\n   {{e}}')\n")
                f.write(f"            print('⚠️'*15 + '\\n')\n")
                f.write(f"            all_passed = False\n")
            
            f.write("    if all_passed:\n")
            f.write("        print('\\n✅ ՇՆՈՐՀԱՎՈՐՈՒՄ ԵՆՔ: ԲՈԼՈՐ ԹԵՍՏԵՐԸ ԲԱՐԵՀԱՋՈՂ ԱՆՑԱՆ!')\n")
            
            f.write("    t1 = time.perf_counter()\n")
            f.write("    _, peak = tracemalloc.get_traced_memory()\n")
            f.write("    tracemalloc.stop()\n")
            
            f.write("    print(f'\\n---METRICS---')\n")
            f.write("    print(f'TIME:{((t1-t0)*1000):.4f}')\n")
            f.write("    print(f'MEMORY:{(peak/1024):.2f}')\n")
            
            temp_name = f.name

        # 4. Աշխատացնում ենք ֆայլը առանձին պրոցեսով (UTF-8 կոդավորմամբ)
        try:
            custom_env = os.environ.copy()
            custom_env['PYTHONIOENCODING'] = 'utf-8'

            process = subprocess.run(
                ['python', temp_name],
                capture_output=True,
                text=True,
                encoding='utf-8',
                env=custom_env,
                timeout=2
            )
            
            output = process.stdout
            error = process.stderr
            
            if error:
                return JsonResponse({'status': 'error', 'output': f"❌ ՍԻՆՏԱՔՍԱՅԻՆ ՍԽԱԼ:\n\n{error}"})
                
            parts = output.split('---METRICS---')
            console_out = parts[0].strip()
            
            if "ԲԱՐԵՀԱՋՈՂ ԱՆՑԱՆ" in console_out:
                if request.user.is_authenticated:
                    # Գտնում ենք գրառումը (կամ ստեղծում նորը) և պահպանում վերջին աշխատող կոդը
                    solved_obj, created = SolvedProblem.objects.get_or_create(user=request.user, problem=problem)
                    solved_obj.solution_code = user_code
                    solved_obj.save()
                else:
                    # Եթե տերմինալում սա տեսնես, ուրեմն Cookie-ների խնդիրը դեռ կա
                    print("\n⚠️ ԶԳՈՒՇԱՑՈՒՄ: Օգտատերը ճանաչված չէ, արդյունքը բազայում ՉԻ ՊԱՀՎԻ:")

            time_ms = "0.0"
            memory_kb = "0.0"
            
            if len(parts) > 1:
                metrics_str = parts[1].strip()
                m_lines = metrics_str.split('\n')
                time_ms = m_lines[0].split(':')[1]
                memory_kb = m_lines[1].split(':')[1]

            return JsonResponse({
                'status': 'success',
                'output': console_out,
                'time_ms': time_ms,
                'memory_kb': memory_kb
            })

        except subprocess.TimeoutExpired:
            return JsonResponse({'status': 'timeout', 'output': '❌ Time Limit Exceeded!\nԿոդի աշխատանքը գերազանցեց 2 վայրկյանը: Հավանաբար ունեք անվերջ ցիկլ կամ շատ դանդաղ ալգորիթմ:'})
        finally:
            if os.path.exists(temp_name):
                os.remove(temp_name)
    
    return JsonResponse({'error': 'Only POST method is allowed'}, status=400)

def get_problems(request):
    problems = Problem.objects.all()
    solved_data = {} # Սարքում ենք բառարան՝ ID -> Կոդ
    
    if request.user.is_authenticated:
        solved_records = SolvedProblem.objects.filter(user=request.user)
        for record in solved_records:
            solved_data[record.problem_id] = record.solution_code

    data = []
    for p in problems:
        data.append({
            'id': p.id,
            'title': p.title,
            'slug': p.slug,
            'topic': p.topic,
            'difficulty': p.difficulty,
            'description': p.description,
            'constraints': p.constraints,
            'starter_code': p.starter_code,
            'test_cases': p.test_cases,
            'is_solved': p.id in solved_data,
            'saved_code': solved_data.get(p.id, None)  # ՆՈՐ: Ուղարկում ենք լուծումը
        })
    return JsonResponse(data, safe=False)


def get_profile_stats(request):
    # Ստուգում ենք, որ հյուրերը չկարողանան տեսնել սա
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Ավտորիզացված չեք'}, status=401)
    
    user = request.user
    
    # Ընդհանուր խնդիրների քանակը
    total_problems = Problem.objects.count()
    
    # Տվյալ օգտատիրոջ լուծած խնդիրները՝ դասավորված ըստ ամսաթվի (նորերը սկզբում)
    solved_records = SolvedProblem.objects.filter(user=user).select_related('problem').order_by('-solved_at')
    solved_count = solved_records.count()
    
    # Ստեղծում ենք բազա ըստ բարդության
    difficulty_stats = {
        'Easy': {'total': Problem.objects.filter(difficulty='Easy').count(), 'solved': 0},
        'Medium': {'total': Problem.objects.filter(difficulty='Medium').count(), 'solved': 0},
        'Hard': {'total': Problem.objects.filter(difficulty='Hard').count(), 'solved': 0},
    }
    
    # Ստեղծում ենք բազա ըստ թեմաների (ավտոմատ վերցնում է բոլոր առկա թեմաները)
    topic_stats = {}
    for p in Problem.objects.all():
        if p.topic not in topic_stats:
            topic_stats[p.topic] = {'total': 0, 'solved': 0}
        topic_stats[p.topic]['total'] += 1
        
    # Հաշվարկում ենք յուզերի լուծածները և հավաքում վերջին ակտիվությունը
    recent_activity = []
    for record in solved_records:
        p = record.problem
        
        # Ավելացնում ենք ըստ բարդության
        if p.difficulty in difficulty_stats:
            difficulty_stats[p.difficulty]['solved'] += 1
            
        # Ավելացնում ենք ըստ թեմայի
        if p.topic in topic_stats:
            topic_stats[p.topic]['solved'] += 1
            
        # Պահում ենք միայն վերջին 5 լուծումները արխիվի համար
        if len(recent_activity) < 5:
            recent_activity.append({
                'id': p.id,
                'title': p.title,
                'difficulty': p.difficulty,
                'topic': p.topic,
                'solved_at': record.solved_at.strftime("%Y-%m-%d %H:%M"),
                'solution_code': record.solution_code
            })
            
    # Որոշում ենք յուզերի կոչումը
    if solved_count == 0:
        rank = 'Նորեկ'
    elif solved_count < 5:
        rank = 'Սկսնակ'
    elif solved_count < 15:
        rank = 'Առաջադեմ'
    else:
        rank = 'Ալգորիթմների Վարպետ 🏆'

    user_info = {
        'username': user.username,
        'date_joined': user.date_joined.strftime("%Y-%m-%d"),
        'rank': rank
    }
    
    # Ուղարկում ենք ամեն ինչ մեկ JSON-ով
    return JsonResponse({
        'user_info': user_info,
        'global_progress': {'total': total_problems, 'solved': solved_count},
        'difficulty_stats': difficulty_stats,
        'topic_stats': topic_stats,
        'recent_activity': recent_activity
    })