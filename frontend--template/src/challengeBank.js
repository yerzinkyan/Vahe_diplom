// Օժանդակ մաթեմատիկական ֆունկցիաներ
const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));
const gcd = (a, b) => (!b ? a : gcd(b, a % b));
const combinations = (n, k) => Math.round(factorial(n) / (factorial(k) * factorial(n - k)));
const arrangements = (n, k) => Math.round(factorial(n) / factorial(n - k));

// Անկարգությունների (Derangements) հաշվարկման ֆունկցիա (!n)
const derangementsMemo = (n) => {
  if (n === 0) return 1;
  if (n === 1) return 0;
  let prev2 = 1, prev1 = 0, current = 0;
  for (let i = 2; i <= n; i++) {
    current = (i - 1) * (prev1 + prev2);
    prev2 = prev1;
    prev1 = current;
  }
  return current;
};

// Թվի տրոհումների (Partitions) քանակի հաշվարկ
const partitionCount = (n) => {
  let dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  for (let i = 1; i <= n; i++) {
    for (let j = i; j <= n; j++) {
      dp[j] += dp[j - i];
    }
  }
  return dp[n];
};

export const generateRandomChallenge = (algoId) => {
  let challenge = null;

  switch (algoId) {
    case 'permutations': {
      const templates = [
        {
          level: '🟢 Հեշտ',
          gen: () => {
            const n = 5;
            return {
              q: `Քանի՞ եղանակով կարող են ${n} հոգին հերթ կանգնել տոմսարկղի մոտ:`,
              ans: factorial(n), n: n
            };
          }
        },
        {
          level: '🟡 Միջին',
          gen: () => {
            const n = 7;
            return {
              q: `Դարակի վրա պետք է շարել ${n} տարբեր գույնի ծաղկամաններ: Քանի՞ տարբերակ կա դա անելու համար:`,
              ans: factorial(n), n: n
            };
          }
        }
      ];
      const selected = templates[Math.floor(Math.random() * templates.length)];
      const data = selected.gen();
      challenge = { question: data.q, correctAnswer: data.ans, level: selected.level, n: data.n };
      break;
    }

    case 'arrangements': {
      const templates = [
        {
          level: '🟡 Միջին',
          gen: () => {
            const n = 10; const k = 2;
            return {
              q: `Մրցույթին մասնակցում է ${n} հոգի: Քանի՞ ձևով կարող են բաշխվել ոսկե և արծաթե մեդալները:`,
              ans: arrangements(n, k), n: n, k: k
            };
          }
        },
        {
          level: '🔴 Բարդ',
          gen: () => {
            const n = 9; const k = 3;
            return {
              q: `Հեռախոսի գաղտնաբառը բաղկացած է ${k} նիշից, որոնք ընտրված են {1...${n}} թվերից առանց կրկնության: Քանի՞ հնարավոր գաղտնաբառ կա:`,
              ans: arrangements(n, k), n: n, k: k
            };
          }
        }
      ];
      const selected = templates[Math.floor(Math.random() * templates.length)];
      const data = selected.gen();
      challenge = { question: data.q, correctAnswer: data.ans, level: selected.level, n: data.n, k: data.k };
      break;
    }

    case 'fibonacci': {
      const templates = [
        {
          level: '🟡 Միջին',
          gen: () => {
            const n = Math.floor(Math.random() * 5) + 6;
            let a = 0, b = 1;
            for(let i=2; i<=n; i++) { [a, b] = [b, a+b]; }
            return {
              q: `Աստիճաններով բարձրանալիս մարդը կարող է քայլել 1 կամ 2 աստիճան միանգամից: Քանի՞ եղանակով նա կարող է բարձրանալ ${n}-րդ աստիճանին:`,
              ans: b, n: n
            };
          }
        },
        {
          level: '🟢 Հեշտ',
          gen: () => {
            const n = 8;
            let a = 0, b = 1;
            for(let i=1; i<n; i++) { [a, b] = [b, a+b]; }
            return {
              q: `Ֆիբոնաչիի հաջորդականության մեջ ո՞րն է ${n}-րդ թիվը (սկսած 0, 1, 1, 2...):`,
              ans: a, n: n
            };
          }
        }
      ];
      const selected = templates[Math.floor(Math.random() * templates.length)];
      const data = selected.gen();
      challenge = { question: data.q, correctAnswer: data.ans, level: selected.level, n: data.n };
      break;
    }

    case 'factorial': {
      const templates = [
        {
          level: '🟢 Հեշտ',
          gen: () => {
            const n = 6;
            return {
              q: `Ո՞րն է ${n}-ի ֆակտորիալը (${n}!):`,
              ans: factorial(n), n: n
            };
          }
        }
      ];
      const selected = templates[Math.floor(Math.random() * templates.length)];
      const data = selected.gen();
      challenge = { question: data.q, correctAnswer: data.ans, level: selected.level, n: data.n };
      break;
    }

    case 'combinations': {
      const templates = [
        {
          level: '🟢 Հեշտ',
          gen: () => {
            const n = 5; const k = 2;
            return {
              q: `${n} տարբեր գրքերից պետք է ընտրել ${k}-ը: Քանի՞ հնարավոր տարբերակ կա ընտրություն կատարելու համար:`,
              ans: combinations(n, k), n: n, k: k
            };
          }
        }
      ];
      const selected = templates[Math.floor(Math.random() * templates.length)];
      const data = selected.gen();
      challenge = { question: data.q, correctAnswer: data.ans, level: selected.level, n: data.n, k: data.k };
      break;
    }

    case 'gcd': {
      const a = 48, b = 18;
      challenge = { 
        question: `Գտեք ${a} և ${b} թվերի Ամենամեծ Ընդհանուր Բաժանարարը (ՀԱԲ):`, 
        correctAnswer: gcd(a, b), level: '🟢 Հեշտ', a: a, b: b 
      };
      break;
    }

    case 'sorting': {
      const n = 100;
      challenge = { 
        question: `Ունենք ${n} էլեմենտից բաղկացած հակառակ դասավորված զանգված: Քանի՞ համեմատում կանի Bubble Sort-ը վատագույն դեպքում:`, 
        correctAnswer: (n * (n - 1)) / 2, level: '🟡 Միջին', n: n 
      };
      break;
    }

    case 'string_search': {
      const n = 500;
      challenge = { 
        question: `KMP ալգորիթմի ժամանակային բարդությունը O(N+M) է: Եթե N=${n} և M=20, մոտավորապես քանի՞ հիմնական գործողություն կկատարվի:`, 
        correctAnswer: n + 20, level: '🟡 Միջին', n: n 
      };
      break;
    }

    // --- ՆՈՐ ԱՎԵԼԱՑՎԱԾ 4 ԱԼԳՈՐԻԹՄՆԵՐԸ ---

    case 'derangements': {
      const n = 5;
      challenge = { 
        level: '🔴 Բարդ', 
        question: `${n} հոգի նամակներ են գրում միմյանց: Քանի՞ եղանակով կարելի է նամակները բաժանել այնպես, որ ոչ ոք իր նամակը չստանա:`, 
        correctAnswer: derangementsMemo(n), n: n 
      };
      break;
    }

    case 'catalan': {
      const n = 3;
      const catVal = combinations(2 * n, n) / (n + 1);
      challenge = { 
        level: '🟡 Միջին', 
        question: `Ունենք n=${n} զույգ փակագծեր: Քանի՞ ճիշտ փակագծային հաջորդականություն կարելի է կազմել դրանցով:`, 
        correctAnswer: catVal, n: n 
      };
      break;
    }

    case 'rep_combinatorics': {
      challenge = { 
        level: '🟢 Հեշտ', 
        question: `Քանի՞ տարբեր բառ կարելի է ստանալ «ԱՐԱՐԱՏ» բառի տառերի տեղափոխությունից:`, 
        correctAnswer: 60, // 6! / (3! * 2!)
        n: 6 
      };
      break;
    }

    case 'partitions': {
      const n = 5;
      challenge = {
        level: '🔴 Բարդ',
        question: `Քանի՞ տարբեր եղանակով կարելի է ${n} թիվը ներկայացնել դրական ամբողջ թվերի գումարի տեսքով (Տրոհումներ):`,
        correctAnswer: partitionCount(n), n: n
      };
      break;
    }

    default:
      challenge = { question: "Այս մոդուլի համար դեռ խնդիրներ չկան:", correctAnswer: null, level: '' };
  }

  return challenge;
};