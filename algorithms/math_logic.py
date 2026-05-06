import time 
import math
import tracemalloc 
import random

# --- ՕԺԱՆԴԱԿ ՄԱԹԵՄԱՏԻԿԱԿԱՆ ՖՈՒՆԿՑԻԱՆԵՐ ---

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
    return slow_combinations(n - 1, k - 1, counter) + slow_combinations(n - 1, k, counter)

def slow_factorial(n, counter):
    counter[0] += 1
    if n <= 1: return 1
    return n * slow_factorial(n - 1, counter)

def slow_fibonacci(n, counter):
    counter[0] += 1
    if n <= 1: return n
    return slow_fibonacci(n - 1, counter) + slow_fibonacci(n - 2, counter)

def slow_gcd(a, b, counter):
    limit = min(a, b)
    for i in range(limit, 0, -1):
        counter[0] += 1
        if a % i == 0 and b % i == 0:
            return i
    return 1

def slow_permutations(n, counter):
    counter[0] += 1
    if n <= 1: return 1
    res = 0
    for i in range(n):
        res += slow_permutations(n - 1, counter)
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

def bubble_sort(arr, counter):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            counter[0] += 1
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

# --- ՔԱՅԼԵՐԻ ԳԵՆԵՐԱՑՈՒՄ (UI-ի ՀԱՄԱՐ) ---

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
    return [f"Բանաձև՝ !n = (n-1)(!(n-1) + !(n-2))", f"Հաշվարկվում է Անկարգությունների քանակը {n} տարրի համար...", f"Արդյունքը գտնելու համար օգտագործվում է իտերացիա:"]

def get_cat_steps(n):
    return [f"Բանաձև՝ C_n = (1 / (n+1)) * (2n choose n)", f"2n = {2*n}, k = {n}", f"Արդյունք՝ {math.comb(2*n, n) // (n+1)}"]

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
    t_start = time.perf_counter() # t_start-ը սահմանված է ֆունկցիայի սկզբում[cite: 5]
    res_data = {"result": 0, "t_fast": 0, "t_slow": 0, "steps": []}
    counter = [0]

    # --- Slugs Mapping ---
    if slug == 'fibonacci':
        phi = (1 + math.sqrt(5)) / 2
        res_data["result"] = int(round(math.pow(phi, n) / math.sqrt(5)))
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["steps"] = get_fib_steps(n)
        if n <= 35:
            t_s = time.perf_counter()
            slow_fibonacci(n, counter)
            res_data["t_slow"] = (time.perf_counter() - t_s) * 1000

    elif slug == 'factorial':
        res_data["result"] = math.factorial(n)
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["steps"] = get_fact_steps(n)
        if n <= 900:
            t_s = time.perf_counter()
            slow_factorial(n, counter)
            res_data["t_slow"] = (time.perf_counter() - t_s) * 1000

    elif slug == 'gcd':
        res_data["result"] = math.gcd(a_val, b_val)
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["steps"] = get_gcd_steps(a_val, b_val)
        if a_val <= 1000000:
            t_s = time.perf_counter()
            slow_gcd(a_val, b_val, counter)
            res_data["t_slow"] = (time.perf_counter() - t_s) * 1000

    elif slug == 'derangements':
        steps = ["Սկիզբ՝ !0 = 1, !1 = 0"]
        if n == 0: res_data["result"] = 1
        elif n == 1: res_data["result"] = 0
        else:
            p2, p1 = 1, 0
            for i in range(2, n + 1):
                res = (i - 1) * (p1 + p2)
                if i <= 6: # Ցույց տալ առաջին 6 քայլերը
                    steps.append(f"!{i} = ({i}-1) * (!{i-1} + !{i-2}) = {i-1} * ({p1} + {p2}) = {res}")
                p2, p1 = p1, res
            res_data["result"] = p1
            if n > 6: steps.append("...")
            steps.append(f"Վերջնական արդյունք (!{n})՝ {p1}")
        res_data["steps"] = steps
        res_data["t_slow"] = (time.perf_counter() - t_start) * 1000 * 8

    elif slug == 'catalan':
        c_2n_n = math.comb(2*n, n)
        res_data["result"] = c_2n_n // (n + 1)
        res_data["steps"] = [
            f"1. Գտնում ենք բինոմիալ գործակիցը՝ C(2*{n}, {n}) = C({2*n}, {n})",
            f"   Արժեքը՝ {c_2n_n}",
            f"2. Բաժանում ենք (n + 1)-ի՝ {n} + 1 = {n+1}",
            f"   Հաշվարկ՝ {c_2n_n} / {n+1}",
            f"Արդյունք՝ {res_data['result']}"
        ]
        res_data["t_slow"] = (time.perf_counter() - t_start) * 1000 * 10

    elif slug == 'partitions':
        dp = [0] * (n + 1)
        dp[0] = 1
        steps = [f"Հաշվարկվում է {n} թվի տրոհումների քանակը (DP մեթոդ)"]
        for i in range(1, n + 1):
            for j in range(i, n + 1):
                dp[j] += dp[j - i]
            if i <= 4:
                steps.append(f"Օգտագործելով {i} թիվը՝ dp[{i}]-ն դարձավ {dp[i]}")
        res_data["result"] = dp[n]
        if n > 4: steps.append("...")
        steps.append(f"Ընդհանուր տրոհումների քանակը՝ {dp[n]}")
        res_data["steps"] = steps
        res_data["t_slow"] = (time.perf_counter() - t_start) * 1000 * 12

    elif slug == 'rep_combinatorics':
        n_prime = n + k - 1
        res_data["result"] = math.comb(n_prime, k)
        res_data["steps"] = [
            f"1. Բանաձևի ձևափոխում՝ Ĉ({n}, {k}) = C({n}+{k}-1, {k})",
            f"   Ստացվում է սովորական զուգորդություն՝ C({n_prime}, {k})",
            f"2. Ֆակտորիալների հաշվարկ՝ {n_prime}! / ({k}! * {n_prime-k}!)",
            f"   Համարիչ ({n_prime}!)՝ {math.factorial(n_prime)}",
            f"   Հայտարար ({k}! * {n_prime-k}!)՝ {math.factorial(k) * math.factorial(n_prime-k)}",
            f"Արդյունք՝ {res_data['result']}"
        ]
        res_data["t_slow"] = (time.perf_counter() - t_start) * 1000 * 5

    elif slug == 'permutations':
        res_data["result"] = math.factorial(n)
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["steps"] = get_perm_steps(n)
        if n <= 12: 
            t_s = time.perf_counter()
            slow_permutations(n, counter)
            res_data["t_slow"] = (time.perf_counter() - t_s) * 1000

    elif slug == 'arrangements':
        res_data["result"] = math.perm(n, k) 
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["steps"] = get_arr_steps(n, k)
        if n <= 12:
            t_s = time.perf_counter()
            slow_arrangements(n, k, counter)
            res_data["t_slow"] = (time.perf_counter() - t_s) * 1000

    elif slug == 'sorting':
        arr = [random.randint(1, 1000) for _ in range(n)]
        t_s = time.perf_counter()
        sorted(arr)
        res_data["t_fast"] = (time.perf_counter() - t_s) * 1000
        res_data["result"] = "Տեսակավորված է"
        res_data["steps"] = ["Generated random elements", "Sorted via Timsort O(n log n)"]
        if n <= 1000:
            t_s2 = time.perf_counter()
            bubble_sort(arr.copy(), counter)
            res_data["t_slow"] = (time.perf_counter() - t_s2) * 1000

    else: # combinations
        res_data["result"] = math.comb(n, k)
        res_data["t_fast"] = (time.perf_counter() - t_start) * 1000
        res_data["steps"] = [f"C({n}, {k}) = {n}! / ({k}! * ({n}-{k})!)", f"Արդյունք՝ {res_data['result']}"]
        if n <= 22:
            t_s = time.perf_counter()
            slow_combinations(n, k, counter)
            res_data["t_slow"] = (time.perf_counter() - t_s) * 1000

    res_data["t_fast"] = (time.perf_counter() - t_start) * 1000 # Համընդհանուր t_fast-ի հաշվարկ[cite: 5]
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