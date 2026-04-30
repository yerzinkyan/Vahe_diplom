// Օգնող մաթեմատիկական ֆունկցիաներ
const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));
const gcd = (a, b) => (!b ? a : gcd(b, a % b));

export const generateRandomChallenge = (algoId) => {
  let challenge = null;

  switch (algoId) {
    case 'combinations': {
      const templates = [
        {
          level: '🟢 Հեշտ',
          gen: () => {
            const n = Math.floor(Math.random() * 5) + 5; // 5-ից 9
            const k = Math.floor(Math.random() * 2) + 2; // 2 կամ 3
            return {
              q: `Պիցցերիայում կա ${n} տեսակի հավելում: Դու ուզում ես պատվիրել պիցցա ճիշտ ${k} հավելումով: Քանի՞ տարբեր պիցցա կարող ես հավաքել:`,
              ans: Math.round(factorial(n) / (factorial(k) * factorial(n - k))),
              n: n, k: k
            };
          }
        },
        {
          level: '🟡 Միջին',
          gen: () => {
            const n = Math.floor(Math.random() * 10) + 10; // 10-19
            const k = 4;
            return {
              q: `ՏՏ ընկերությունում կա ${n} ծրագրավորող: Անհրաժեշտ է ընտրել ${k} հոգանոց արագ արձագանքման թիմ: Ընտրության քանի՞ հնարավորություն կա:`,
              ans: Math.round(factorial(n) / (factorial(k) * factorial(n - k))),
              n: n, k: k
            };
          }
        },
        {
          level: '🔴 Բարդ',
          gen: () => {
            const n = Math.floor(Math.random() * 10) + 25; // 25-34
            const k = 5;
            return {
              q: `Խաղատանը կա ${n} խաղաքարտանոց կապուկ: Դիլերը ձեզ տալիս է ${k} քարտ: Քանի՞ հնարավոր յուրահատուկ «ձեռք» (hand) կարող եք ունենալ:`,
              ans: Math.round(factorial(n) / (factorial(k) * factorial(n - k))),
              n: n, k: k
            };
          }
        }
      ];
      const selected = templates[Math.floor(Math.random() * templates.length)];
      const data = selected.gen();
      // Ավելացված են n և k արժեքները
      challenge = { question: data.q, correctAnswer: data.ans, level: selected.level, n: data.n, k: data.k };
      break;
    }

    case 'factorial': {
      const templates = [
        {
          level: '🟢 Հեշտ',
          gen: () => {
            const n = Math.floor(Math.random() * 3) + 4; // 4-6
            return {
              q: `Գրադարակի վրա պետք է շարել ${n} տարբեր գրքեր: Քանի՞ տարբեր հերթականությամբ է դա հնարավոր անել:`,
              ans: factorial(n),
              n: n
            };
          }
        },
        {
          level: '🟡 Միջին',
          gen: () => {
            const n = Math.floor(Math.random() * 3) + 7; // 7-9
            return {
              q: `Բանկի չհրկիզվող պահարանի կոդը բաղկացած է ${n} տարբեր թվանշաններից: Եթե դուք մոռացել եք հերթականությունը, առավելագույնը քանի՞ տարբերակ պետք է փորձեք:`,
              ans: factorial(n),
              n: n
            };
          }
        }
      ];
      const selected = templates[Math.floor(Math.random() * templates.length)];
      const data = selected.gen();
      // Ավելացված է n արժեքը
      challenge = { question: data.q, correctAnswer: data.ans, level: selected.level, n: data.n };
      break;
    }

    case 'gcd': {
      const templates = [
        {
          level: '🟢 Հեշտ',
          gen: () => {
            const a = Math.floor(Math.random() * 20) + 30; // 30-49
            const b = Math.floor(Math.random() * 10) + 10; // 10-19
            return {
              q: `Ունենք երկու ժապավեն՝ ${a} սմ և ${b} սմ երկարությամբ: Ո՞րն է ամենամեծ երկարությունը, որով կարող ենք երկուսն էլ կտրել առանց մնացորդի:`,
              ans: gcd(a, b),
              a: a, b: b
            };
          }
        },
        {
          level: '🟡 Միջին',
          gen: () => {
            const multipliers = [12, 15, 24];
            const m = multipliers[Math.floor(Math.random() * multipliers.length)];
            const a = (Math.floor(Math.random() * 5) + 5) * m; 
            const b = (Math.floor(Math.random() * 4) + 2) * m;
            return {
              q: `Սենյակի հատակը ունի ${a} սմ երկարություն և ${b} սմ լայնություն: Ի՞նչ առավելագույն կողմով հավասար քառակուսի սալիկներ են պետք հատակը իդեալական ծածկելու համար:`,
              ans: gcd(a, b),
              a: a, b: b
            };
          }
        }
      ];
      const selected = templates[Math.floor(Math.random() * templates.length)];
      const data = selected.gen();
      // Ավելացված են a և b արժեքները
      challenge = { question: data.q, correctAnswer: data.ans, level: selected.level, a: data.a, b: data.b };
      break;
    }

    case 'fibonacci': {
      const templates = [
        {
          level: '🟡 Միջին',
          gen: () => {
            const n = Math.floor(Math.random() * 5) + 6; // 6-10
            let a = 0, b = 1;
            for(let i=2; i<=n; i++) { [a, b] = [b, a+b]; }
            return {
              q: `Աստիճաններով բարձրանալիս մարդը կարող է քայլել 1 կամ 2 աստիճան միանգամից: Քանի՞ տարբեր եղանակով նա կարող է բարձրանալ ${n}-րդ աստիճանին:`,
              ans: b,
              n: n
            };
          }
        }
      ];
      const selected = templates[Math.floor(Math.random() * templates.length)];
      const data = selected.gen();
      challenge = { question: data.q, correctAnswer: data.ans, level: selected.level, n: data.n };
      break;
    }

    case 'sorting': {
      const templates = [
        {
          level: '🟡 Միջին',
          gen: () => {
            const n = Math.floor(Math.random() * 50) + 50; 
            return {
              q: `Ունենք զանգված բաղկացած ${n} էլեմենտից, որը դասավորված է լրիվ հակառակ հերթականությամբ: Առավելագույնը քանի՞ համեմատում (comparisons) կկատարի Դանդաղ (Bubble Sort) ալգորիթմը:`,
              ans: (n * (n - 1)) / 2,
              n: n
            };
          }
        }
      ];
      const selected = templates[Math.floor(Math.random() * templates.length)];
      const data = selected.gen();
      challenge = { question: data.q, correctAnswer: data.ans, level: selected.level, n: data.n };
      break;
    }

    case 'string_search': {
      const templates = [
        {
          level: '🔴 Բարդ',
          gen: () => {
            const n = Math.floor(Math.random() * 500) + 1000; 
            const m = Math.floor(Math.random() * 10) + 5;
            return {
              q: `Տեքստի երկարությունը ${n} նիշ է, իսկ փնտրվող բառինը՝ ${m}: Ո՞րն է դանդաղ (Naive) ալգորիթմի կատարած համեմատումների առավելագույն քանակը վատագույն դեպքում (Worst Case):`,
              ans: (n - m + 1) * m,
              n: n
            };
          }
        }
      ];
      const selected = templates[Math.floor(Math.random() * templates.length)];
      const data = selected.gen();
      challenge = { question: data.q, correctAnswer: data.ans, level: selected.level, n: data.n };
      break;
    }

    default:
      challenge = { question: "Այս մոդուլի համար դեռ խնդիրներ չկան:", correctAnswer: null, level: '' };
  }

  return challenge;
};