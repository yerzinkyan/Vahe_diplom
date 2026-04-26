import time 
import math
import tracemalloc # Նոր՝ Հիշողության չափման համար

def slow_combinations(n, k, counter):
    counter[0] += 1
    if k == 0 or k == n: return 1
    return slow_combinations(n - 1, k - 1, counter) + slow_combinations(n - 1, k, counter)

def slow_factorial(n, counter):
    counter[0] += 1
    if n <= 1: return 1
    return n * slow_factorial(n - 1, counter)

def slow_fibonacci(n, counter):
    counter[0] += 1
    if n <= 1: return n
    return slow_fibonacci(n - 1, counter) + slow_fibonacci(n - 2, counter)

def run_calculation(slug, input_data):
    n = int(input_data.get('n', 0))
    k = int(input_data.get('k', 0))
    
    # Սկսում ենք հիշողության չափումը
    tracemalloc.start()
    
    res_data = {}
    
    if slug == 'fibonacci':
        # Արագ
        t_start = time.time()
        phi = (1 + math.sqrt(5)) / 2
        result = int(round(math.pow(phi, n) / math.sqrt(5)))
        t_fast = (time.time() - t_start) * 1000
        
        # Դանդաղ (պաշտպանությամբ)
        counter = [0]
        t_slow = 0
        if n <= 33:
            t_start = time.time()
            slow_fibonacci(n, counter)
            t_slow = (time.time() - t_start) * 1000
            
        res_data = {"result": result, "t_fast": t_fast, "t_slow": t_slow, "steps": counter[0]}

    elif slug == 'factorial':
        t_start = time.time()
        result = math.factorial(n)
        t_fast = (time.time() - t_start) * 1000
        
        counter = [0]
        t_slow = 0
        if n <= 900:
            t_start = time.time()
            slow_factorial(n, counter)
            t_slow = (time.time() - t_start) * 1000
        res_data = {"result": result, "t_fast": t_fast, "t_slow": t_slow, "steps": counter[0]}

    else: # combinations
        t_start = time.time()
        result = math.comb(n, k) if hasattr(math, 'comb') else 0
        t_fast = (time.time() - t_start) * 1000
        
        counter = [0]
        t_slow = 0
        if n <= 25:
            t_start = time.time()
            slow_combinations(n, k, counter)
            t_slow = (time.time() - t_start) * 1000
        res_data = {"result": result, "t_fast": t_fast, "t_slow": t_slow, "steps": counter[0]}

    # Վերջացնում ենք հիշողության չափումը
    current, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    return {
        "result": res_data["result"],
        "time_fast_ms": round(res_data["t_fast"], 4),
        "time_slow_ms": round(res_data["t_slow"], 4),
        "memory_kb": round(peak / 1024, 2), # Պիկային հիշողությունը KB-ով
        "steps": res_data["steps"]
    }