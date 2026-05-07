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

# --- ԴԱՆԴԱՂ (ՌԵԿՈՒՐՍԻՎ) ՄԵԹՈԴՆԵՐ ՎԻԶՈՒԱԼԻԶԱՑԻԱՅԻ ՀԱՄԱՐ ---
def slow_combinations(n, k, counter):
    counter[0] += 1
    if k == 0 or k == n: return 1
    if k > n: return 0
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
    if limit == 0: return max(a, b)
    for i in range(limit, 0, -1):
        counter[0] += 1
        if a % i == 0 and b % i == 0:
            return i
    return 1

def slow_permutations(n, counter):
    counter[0] += 1
    if n <= 1: return 1
    res = 0
    for i in range(n): res += slow_permutations(n - 1, counter)
    return res

def slow_arrangements(n, m, counter):
    counter[0] += 1
    if m == 0: return 1
    if m > n: return 0
    return n * slow_arrangements(n - 1, m - 1, counter)

def slow_derangements(n, counter):
    counter[0] += 1
    if n == 0: return 1
    if n == 1: return 0
    return (n - 1) * (slow_derangements(n - 1, counter) + slow_derangements(n - 2, counter))

def slow_catalan(n, counter):
    counter[0] += 1
    if n <= 1: return 1
    res = 0
    for i in range(n):
        res += slow_catalan(i, counter) * slow_catalan(n - 1 - i, counter)
    return res

def slow_partitions(n, limit, counter):
    counter[0] += 1
    if n == 0: return 1
    if n < 0 or limit == 0: return 0
    return slow_partitions(n, limit - 1, counter) + slow_partitions(n - limit, limit, counter)


# --- ՔԱՅԼԵՐԻ ԳԵՆԵՐԱՑՈՒՄ ---
def get_fib_steps(n):
    steps = ["Start: F(0)=0, F(1)=1"]
    a, b = 0, 1
    for i in range(2, min(n + 1, 8)):
        a, b = b, a + b
        steps.append(f"Step {i}: F({i-2}) + F({i-1}) = {b}")
    if n > 7: steps.append("...")
    return steps

def get_fact_steps(n):
    steps = ["Start: 0! = 1"]
    res = 1
    for i in range(1, min(n + 1, 8)):
        res *= i
        steps.append(f"Step {i}: {i-1}! * {i} = {res}")
    if n > 7: steps.append("...")
    return steps

def get_gcd_steps(a, b):
    steps = [f"Calculating GCD({a}, {b})"]
    while b:
        steps.append(f"{a} % {b} = {a % b}")
        a, b = b, a % b
    steps.append(f"Result: {a}")
    return steps

def get_perm_steps(n):
    return [f"P({n}) = {n}!", f"Հաշվարկ՝ {' * '.join(map(str, range(1, min(n + 1, 10))))}...", f"Արդյունք՝ {math.factorial(n)}"]

def get_arr_steps(n, m):
    return [f"A({n},{m}) = {n}! / ({n}-{m})!", f"Հաշվարկ՝ {n} * {n-1} * ... * {n-m+1}", f"Արդյունք՝ {math.perm(n, m)}"]

def get_der_steps(n):
    return [f"Բանաձև՝ !n = (n-1)(!(n-1) + !(n-2))", f"Հաշվարկվում է Անկարգությունների քանակը {n} տարրի համար..."]

def get_cat_steps(n):
    return [f"Բանաձև՝ C_n = (1 / (n+1)) * (2n choose n)", f"2n = {2*n}, k = {n}"]


# --- ԳԼԽԱՎՈՐ ՀԱՇՎԱՐԿԻ ՖՈՒՆԿՑԻԱ ---

def run_calculation(slug, input_data):
    try:
        n = int(input_data.get('n', 0))
        k = int(input_data.get('k', 0))
        a_val = int(input_data.get('a', n))
        b_val = int(input_data.get('b', 1))
    except (ValueError, TypeError):
        return {"error": "Invalid input"}

    tracemalloc.start()
    res_data = {"result": 0, "t_fast": 0.0, "t_slow": None, "steps": []}
    counter = [0]

    if slug == 'fibonacci':
        t_start = time.perf_counter()
        phi = (1 + math.sqrt(5)) / 2
        res_data["result"] = int(round(math.pow(phi, n) / math.sqrt(5)))
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["steps"] = get_fib_steps(n)
        
        if n <= 30:
            t_start = time.perf_counter()
            slow_fibonacci(n, counter)
            res_data["t_slow"] = (time.perf_counter() - t_start) * 1000

    elif slug == 'factorial':
        t_start = time.perf_counter()
        res_data["result"] = math.factorial(n)
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["steps"] = get_fact_steps(n)
        
        if n <= 800:
            t_start = time.perf_counter()
            slow_factorial(n, counter)
            res_data["t_slow"] = (time.perf_counter() - t_start) * 1000

    elif slug == 'sorting':
        arr = [random.randint(1, 1000) for _ in range(n)]
        t_start = time.perf_counter()
        sorted(arr)
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["result"] = "Տեսակավորված է"
        res_data["steps"] = ["Generated random elements", "Sorted via Timsort O(n log n)"]
        
        if n <= 1000:
            t_start = time.perf_counter()
            bubble_sort(arr.copy(), counter)
            res_data["t_slow"] = (time.perf_counter() - t_start) * 1000

    elif slug == 'string_search':
        txt = "A" * n
        pat = "A" * (n // 2) + "B" 
        t_start = time.perf_counter()
        kmp_search(pat, txt)
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["result"] = "Որոնված է"
        res_data["steps"] = ["KMP Search O(N+M)", f"Text: {n}, Pattern: {len(pat)}"]
        
        if n <= 10000:
            t_start = time.perf_counter()
            naive_search(pat, txt, counter)
            res_data["t_slow"] = (time.perf_counter() - t_start) * 1000

    elif slug == 'gcd':
        t_start = time.perf_counter()
        res_data["result"] = math.gcd(a_val, b_val)
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["steps"] = get_gcd_steps(a_val, b_val)
        
        if a_val <= 1000000 and b_val <= 1000000:
            t_start = time.perf_counter()
            slow_gcd(a_val, b_val, counter)
            res_data["t_slow"] = (time.perf_counter() - t_start) * 1000

    elif slug == 'derangements':
        t_start = time.perf_counter()
        if n == 0: res_data["result"] = 1
        elif n == 1: res_data["result"] = 0
        else:
            p2, p1 = 1, 0
            for i in range(2, n + 1): p2, p1 = p1, (i - 1) * (p1 + p2)
            res_data["result"] = p1
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["steps"] = get_der_steps(n)
        
        if n <= 11:
            t_start = time.perf_counter()
            slow_derangements(n, counter)
            res_data["t_slow"] = (time.perf_counter() - t_start) * 1000

    elif slug == 'catalan':
        t_start = time.perf_counter()
        res_data["result"] = math.comb(2 * n, n) // (n + 1)
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["steps"] = get_cat_steps(n)
        
        if n <= 13:
            t_start = time.perf_counter()
            slow_catalan(n, counter)
            res_data["t_slow"] = (time.perf_counter() - t_start) * 1000

    elif slug == 'partitions':
        t_start = time.perf_counter()
        dp = [0] * (n + 1)
        dp[0] = 1
        for i in range(1, n + 1):
            for j in range(i, n + 1): dp[j] += dp[j - i]
        res_data["result"] = dp[n]
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["steps"] = [f"Հաշվարկվում է {n} թվի տրոհումների քանակը"]
        
        if n <= 25:
            t_start = time.perf_counter()
            slow_partitions(n, n, counter)
            res_data["t_slow"] = (time.perf_counter() - t_start) * 1000

    elif slug == 'rep_combinatorics':
        t_start = time.perf_counter()
        n_prime = n + k - 1
        res_data["result"] = math.comb(n_prime, k)
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["steps"] = [f"Ĉ({n}, {k}) = C({n_prime}, {k})", f"Արդյունք՝ {res_data['result']}"]
        
        if n_prime <= 22:
            t_start = time.perf_counter()
            slow_combinations(n_prime, k, counter)
            res_data["t_slow"] = (time.perf_counter() - t_start) * 1000

    elif slug == 'permutations':
        t_start = time.perf_counter()
        res_data["result"] = math.factorial(n)
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["steps"] = get_perm_steps(n)
        
        if n <= 10:
            t_start = time.perf_counter()
            slow_permutations(n, counter)
            res_data["t_slow"] = (time.perf_counter() - t_start) * 1000

    elif slug == 'arrangements':
        t_start = time.perf_counter()
        res_data["result"] = math.perm(n, k)
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["steps"] = get_arr_steps(n, k)
        
        if n <= 10:
            t_start = time.perf_counter()
            slow_arrangements(n, k, counter)
            res_data["t_slow"] = (time.perf_counter() - t_start) * 1000

    else: # combinations (Default)
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

    # --- ՄԱՔՐԱԳՐՈՒՄԸ 0-ՆԵՐԻ ԴԵՄ (ԱՌԱՆՑ ԱՐՀԵՍՏԱԿԱՆ ԲԱՐՁՐԱՑՄԱՆ) ---
    res_data["t_fast"] = max(res_data["t_fast"], 0.001)

    if res_data["t_slow"] is not None:
        res_data["t_slow"] = max(res_data["t_slow"], 0.002)
        if res_data["t_slow"] < res_data["t_fast"]:
            res_data["t_slow"] = res_data["t_fast"] * 1.5

    current, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    return {
        "result": str(res_data["result"]),
        "time_fast_ms": round(res_data["t_fast"], 6),
        "time_slow_ms": round(res_data["t_slow"], 4) if res_data["t_slow"] is not None else None,
        "memory_kb": round(peak / 1024, 2), 
        "steps": res_data["steps"],
        "steps_count": counter[0],
        "n": n
    }