import time 
import math
import tracemalloc 
import random

# --- ՏԵՔՍՏԻ ՈՐՈՆՄԱՆ ԱԼԳՈՐԻԹՄՆԵՐ ---
def naive_search(pat, txt, counter):
    M, N = len(pat), len(txt)
    for i in range(N - M + 1):
        j = 0
        while j < M:
            counter[0] += 1
            if txt[i + j] != pat[j]: break
            j += 1
        if j == M: pass

def compute_lps(pat, M, lps):
    length = 0
    lps[0] = 0
    i = 1
    while i < M:
        if pat[i] == pat[length]:
            length += 1
            lps[i] = length
            i += 1
        else:
            if length != 0: length = lps[length-1]
            else:
                lps[i] = 0
                i += 1

def kmp_search(pat, txt):
    M, N = len(pat), len(txt)
    lps = [0] * M
    compute_lps(pat, M, lps)
    i = j = 0
    while i < N:
        if pat[j] == txt[i]:
            i += 1
            j += 1
        if j == M: j = lps[j-1]
        elif i < N and pat[j] != txt[i]:
            if j != 0: j = lps[j-1]
            else: i += 1

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

def bubble_sort(arr, counter):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            counter[0] += 1
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

def slow_gcd(a, b, counter):
    limit = min(a, b)
    for i in range(limit, 0, -1):
        counter[0] += 1
        if a % i == 0 and b % i == 0:
            return i
    return 1

def get_fib_steps(n):
    steps = ["Start: F(0)=0, F(1)=1"]
    a, b = 0, 1
    for i in range(2, min(n + 1, 15)):
        a, b = b, a + b
        steps.append(f"Step {i}: F({i-2}) + F({i-1}) = {b}")
    return steps

def get_fact_steps(n):
    steps = ["Start: 0! = 1"]
    res = 1
    for i in range(1, min(n + 1, 15)):
        res *= i
        steps.append(f"Step {i}: {i-1}! * {i} = {res}")
    return steps

def get_sorting_steps(n):
    return [
        f"Generated {n} random elements",
        "Quick Sort: Divide & Conquer (O(n log n))",
        "Bubble Sort: Nested Loops (O(n²))",
        f"Max potential comparisons: {n*n}"
    ]

def get_gcd_steps(a, b):
    steps = [f"Calculating GCD({a}, {b})"]
    while b:
        steps.append(f"{a} % {b} = {a % b}")
        a, b = b, a % b
    steps.append(f"Result: {a}")
    return steps

def run_calculation(slug, input_data):
    try:
        n = int(input_data.get('n', 0))
        k = int(input_data.get('k', 0))
        a_val = int(input_data.get('a', n))
        b_val = int(input_data.get('b', 1))
    except (ValueError, TypeError):
        return {"error": "Invalid input"}

    tracemalloc.start()
    res_data = {"result": 0, "t_fast": 0, "t_slow": 0, "steps": []}
    counter = [0]

    if slug == 'fibonacci':
        t_start = time.perf_counter()
        phi = (1 + math.sqrt(5)) / 2
        res_data["result"] = int(round(math.pow(phi, n) / math.sqrt(5)))
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["steps"] = get_fib_steps(n)
        if n <= 35:
            t_start = time.perf_counter()
            slow_fibonacci(n, counter)
            res_data["t_slow"] = (time.perf_counter() - t_start) * 1000

    elif slug == 'factorial':
        t_start = time.perf_counter()
        res_data["result"] = math.factorial(n)
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["steps"] = get_fact_steps(n)
        if n <= 900:
            t_start = time.perf_counter()
            slow_factorial(n, counter)
            res_data["t_slow"] = (time.perf_counter() - t_start) * 1000

    elif slug == 'sorting':
        arr = [random.randint(1, 1000) for _ in range(n)]
        t_start = time.perf_counter()
        sorted(arr)
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["result"] = "Array Sorted"
        res_data["steps"] = get_sorting_steps(n)
        if n <= 1000:
            t_start = time.perf_counter()
            bubble_sort(arr.copy(), counter)
            res_data["t_slow"] = (time.perf_counter() - t_start) * 1000

    elif slug == 'string_search':
        txt = "A" * n
        pat = "A" * (n // 2) + "B" 
        
        t_s = time.perf_counter()
        kmp_search(pat, txt)
        fast_time = (time.perf_counter() - t_s) * 1000
        
        res_data["t_fast"] = max(fast_time, 0.0001) 
        res_data["result"] = "Որոնված է"
        res_data["steps"] = [
            "📚 Տեսություն: Knuth-Morris-Pratt (KMP)", 
            "LPS զանգվածի կառուցում: O(M)", 
            f"Տեքստ: {n} նիշ, Շաբլոն: {len(pat)} նիշ"
        ]
        if n <= 20000:
            t_s = time.perf_counter()
            naive_search(pat, txt, counter)
            res_data["t_slow"] = (time.perf_counter() - t_s) * 1000

    elif slug == 'gcd':
        t_start = time.perf_counter()
        res_data["result"] = math.gcd(a_val, b_val)
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["steps"] = get_gcd_steps(a_val, b_val)
        if a_val <= 1000000:
            t_start = time.perf_counter()
            slow_gcd(a_val, b_val, counter)
            res_data["t_slow"] = (time.perf_counter() - t_start) * 1000

    else: # combinations
        t_start = time.perf_counter()
        res_data["result"] = math.comb(n, k) if hasattr(math, 'comb') else 0
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["steps"] = [
            f"Բանաձև: C({n}, {k}) = {n}! / ({k}! * ({n}-{k})!)",
            f"Հաշվարկվում է համարիչը: {n}! = {math.factorial(n)}",
            f"Հաշվարկվում է հայտարարը: {k}! * {n-k}! = {math.factorial(k) * math.factorial(n-k)}",
            f"Վերջնական հաշվարկ: {math.factorial(n)} / {math.factorial(k) * math.factorial(n-k)}"
        ]
        if n <= 22:
            t_start = time.perf_counter()
            slow_combinations(n, k, counter)
            res_data["t_slow"] = (time.perf_counter() - t_start) * 1000

    current, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    return {
        "result": str(res_data["result"]),
        "time_fast_ms": round(res_data["t_fast"], 6),
        "time_slow_ms": round(res_data["t_slow"], 4),
        "memory_kb": round(peak / 1024, 2), 
        "steps": res_data["steps"],
        "steps_count": counter[0],
        "n": n
    }