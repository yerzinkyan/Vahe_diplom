import { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { generateRandomChallenge } from './challengeBank';
import './App_design.css'; // ՆՈՐ CSS ՖԱՅԼԻ ՄԻԱՑՈՒՄ
import CodeWorkspace from './CodeWorkspace'; 

const ALGORITHMS_DATA = {
  knapsack: { 
    id: 'knapsack', title: 'Օպտիմիզացիա', icon: '🎒', desc: 'Knapsack Problem (DP)', inputs: [], chartType: 'none', colors: { opt: '#4f46e5', slow: '#94a3b8' }, complexity: { fast: 'O(NW)', slow: 'O(2ⁿ)' }, viewKey: 'allocator' 
  },
  fibonacci: { 
    id: 'fibonacci', title: 'Ֆիբոնաչի', icon: '🌀', desc: 'Ոսկե հատում vs Ռեկուրսիա', inputs: ['n'], chartType: 'line', colors: { opt: '#10b981', slow: '#ef4444' }, complexity: { fast: 'O(1)', slow: 'O(2ⁿ)' },
  },
  factorial: { 
    id: 'factorial', title: 'Ֆակտորիալ', icon: '❗', desc: 'Loop vs Recursion', inputs: ['n'], chartType: 'bar', colors: { opt: '#3b82f6', slow: '#f97316' }, complexity: { fast: 'O(n)', slow: 'O(n)' },
  },
  combinations: { 
    id: 'combinations', title: 'Զուգորդություն', icon: '🎲', desc: 'Բանաձև vs Պասկալի եռանկյուն', inputs: ['n', 'k'], chartType: 'area', colors: { opt: '#8b5cf6', slow: '#ec4899' }, complexity: { fast: 'O(k)', slow: 'O(2ⁿ)' },
  },
  sorting: { 
    id: 'sorting', title: 'Տեսակավորում', icon: '📊', desc: 'Quick Sort vs Bubble Sort', inputs: ['n'], chartType: 'bar', colors: { opt: '#06b6d4', slow: '#f43f5e' }, complexity: { fast: 'O(n log n)', slow: 'O(n²)' },
  },
  gcd: { 
    id: 'gcd', title: 'ՀԱԲ (GCD)', icon: '➗', desc: 'Էվկլիդես vs Գծային որոնում', inputs: ['a', 'b'], chartType: 'line', colors: { opt: '#10b981', slow: '#f59e0b' }, complexity: { fast: 'O(log n)', slow: 'O(n)' },
  },
  string_search: { 
    id: 'string_search', title: 'Տեքստի Որոնում', icon: '🔍', desc: 'KMP vs Պարզ որոնում', inputs: ['n'], chartType: 'area', colors: { opt: '#8b5cf6', slow: '#ec4899' }, complexity: { fast: 'O(N+M)', slow: 'O(N×M)' },
  },
  permutations: { 
    id: 'permutations', title: 'Տեղափոխություններ', icon: '🔄', desc: 'P(n) = n!', inputs: ['n'], chartType: 'line', colors: { opt: '#10b981', slow: '#f43f5e' }, complexity: { fast: 'O(n)', slow: 'O(n!)' },
  },
  arrangements: { 
    id: 'arrangements', title: 'Կարգավորություններ', icon: '📊', desc: 'Հաջորդականությունը կարևոր է', inputs: ['n', 'k'], chartType: 'area', colors: { opt: '#3b82f6', slow: '#f97316' }, complexity: { fast: 'O(k)', slow: 'O(A(n,k))' },
  },
  rep_combinatorics: { 
    id: 'rep_combinatorics', title: 'Կրկնություններով Կոմբինատորիկա', icon: '🔢', 
    desc: 'Տեղափոխություններ և զուգորդություններ կրկնվող տարրերով', 
    inputs: ['n', 'k'], chartType: 'bar', colors: { opt: '#10b981', slow: '#f43f5e' }, 
    complexity: { fast: 'O(k)', slow: 'O(n^k)' } 
  },
  partitions: { 
    id: 'partitions', title: 'Տրոհումներ', icon: '🍰', 
    desc: 'Թվերի և բազմությունների տրոհում (Partitions)', 
    inputs: ['n', 'k'], chartType: 'line', colors: { opt: '#8b5cf6', slow: '#ec4899' }, 
    complexity: { fast: 'O(n*k)', slow: 'O(exp(√n))' } 
  },
  derangements: { 
    id: 'derangements', title: 'Անկարգություններ', icon: '💌', 
    desc: 'Derangements (!n) - Խառնված նամակների խնդիրը', 
    inputs: ['n'], chartType: 'area', colors: { opt: '#06b6d4', slow: '#f59e0b' }, 
    complexity: { fast: 'O(n)', slow: 'O(n!)' } 
  },
  catalan: { 
    id: 'catalan', title: 'Կատալանի Թվեր', icon: '🌳', 
    desc: 'Ճիշտ փակագծեր և բինար ծառերի քանակ', 
    inputs: ['n'], chartType: 'line', colors: { opt: '#3b82f6', slow: '#ef4444' }, 
    complexity: { fast: 'O(n)', slow: 'O(3^n)' } 
  },
};

function ComplexityBadge({ fast, slow, optColor, slowColor }) {
  return (
    <div className="complexity-badge-wrapper">
      <div className="complexity-item" style={{ background: optColor + '18', border: `1.5px solid ${optColor}` }}>
        <span className="complexity-label" style={{ color: optColor }}>ՕՊՏԻՄԱԼ</span>
        <span className="complexity-value" style={{ color: optColor }}>{fast}</span>
      </div>
      <span style={{ color: '#94a3b8', fontWeight: 700 }}>vs</span>
      <div className="complexity-item" style={{ background: slowColor + '18', border: `1.5px solid ${slowColor}` }}>
        <span className="complexity-label" style={{ color: slowColor }}>ՈՉ ՕՊՏԻՄԱԼ</span>
        <span className="complexity-value" style={{ color: slowColor }}>{slow}</span>
      </div>
    </div>
  );
}

function SpeedupBadge({ timeFast, timeSlow, optColor }) {
  if (!timeSlow || timeSlow === 0 || !timeFast || timeFast === 0) return null;
  const ratio = (timeSlow / timeFast).toFixed(1);
  if (ratio < 1.1) return null;
  return (
    <div className="speedup-badge" style={{ background: `linear-gradient(135deg, ${optColor}22, ${optColor}11)`, border: `2px solid ${optColor}` }}>
      <span className="speedup-ratio" style={{ color: optColor }}>{ratio}x</span>
      <div>
        <div className="speedup-title" style={{ color: optColor }}>ԱՐԱԳ ՄԵԹՈԴՆ ԱՎԵԼԻ ԱՐԱԳ Է</div>
        <div className="speedup-subtitle">{timeFast.toFixed(4)} ms vs {timeSlow.toFixed(4)} ms</div>
      </div>
      <span style={{ fontSize: '22px' }}>⚡</span>
    </div>
  );
}

function ProgressBar({ progress, color, dark }) {
  return (
    <div className="progress-container" style={{ background: dark ? '#334155' : '#e2e8f0' }}>
      <div 
        className="progress-bar" 
        style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)`, boxShadow: `0 0 8px ${color}66` }} 
      />
    </div>
  );
}

function ResourceAllocator({ dark }) {
  const [items, setItems] = useState([
    { id: 1, name: '💻 Նոութբուք', weight: 3, value: 1500 },
    { id: 2, name: '📷 Տեսախցիկ', weight: 2, value: 800 },
    { id: 3, name: '🚁 Դրոն', weight: 4, value: 1200 },
    { id: 4, name: '📱 Պլանշետ', weight: 1, value: 500 }
  ]);
  const [capacity, setCapacity] = useState(6);
  const [result, setResult] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', weight: '', value: '' });

  const optimizeResources = () => {
    const n = items.length;
    const W = parseInt(capacity);
    if (!W || W <= 0) return alert("Մուտքագրեք վավեր տարողունակություն");

    const dp = Array(n + 1).fill().map(() => Array(W + 1).fill(0));

    for (let i = 1; i <= n; i++) {
      for (let w = 1; w <= W; w++) {
        const item = items[i - 1];
        if (item.weight <= w) {
          dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - item.weight] + item.value);
        } else {
          dp[i][w] = dp[i - 1][w];
        }
      }
    }

    let resValue = dp[n][W];
    let w = W;
    let selected = [];
    let calcSteps = [];

    for (let i = n; i > 0 && resValue > 0; i--) {
      if (resValue !== dp[i - 1][w]) {
        const item = items[i - 1];
        selected.push(item);
        calcSteps.push(`Ընտրվեց: ${item.name} (Քաշը: ${item.weight}, Արժեքը: ֏${item.value})`);
        resValue -= item.value;
        w -= item.weight;
      }
    }

    setResult({
      maxValue: dp[n][W],
      usedWeight: W - w,
      selectedItems: selected,
      steps: calcSteps
    });
  };

  const addItem = () => {
    if (!newItem.name || !newItem.weight || !newItem.value) return;
    setItems([...items, { id: Date.now(), name: newItem.name, weight: parseInt(newItem.weight), value: parseInt(newItem.value) }]);
    setNewItem({ name: '', weight: '', value: '' });
    setResult(null); 
  };

  const removeItem = (id) => {
    setItems(items.filter(i => i.id !== id));
    setResult(null);
  };

  return (
    <div className="fade-in ra-container">
      <div className="ra-header-text">
        <h2 style={{ color: dark ? '#f1f5f9' : '#1e293b', fontSize: '32px', margin: 0 }}>🎒 Ռեսուրսների Դինամիկ Օպտիմիզացիա</h2>
        <p style={{ color: '#64748b', fontSize: '18px' }}>Ստեղծիր քո սեփական կոմբինատորային բազան և գտիր լավագույն համադրությունը</p>
      </div>

      <div className="ra-grid">
        <div className="ra-panel" style={{ background: dark ? '#1e293b' : 'white' }}>
          <div className="ra-panel-header">
            <h3 style={{ margin: 0, color: dark ? 'white' : '#1e293b' }}>Տվյալների Բազա</h3>
            <div className="ra-input-group">
              <span style={{ fontWeight: 800, color: '#4f46e5' }}>ՄԱՔՍԻՄԱԼ ՔԱՇ.</span>
              <input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} className="input-box" style={{ width: '80px', background: dark ? '#0f172a' : 'white', color: dark ? 'white' : 'black' }} />
            </div>
          </div>

          <div className="ra-table-container" style={{ border: `1px solid ${dark ? '#334155' : '#e2e8f0'}` }}>
            <table className="ra-table" style={{ color: dark ? '#cbd5e1' : '#334155' }}>
              <thead style={{ background: dark ? '#0f172a' : '#f8fafc', borderBottom: `2px solid ${dark ? '#334155' : '#e2e8f0'}` }}>
                <tr>
                  <th className="ra-th">Անվանում</th>
                  <th className="ra-th">Քաշ (կգ)</th>
                  <th className="ra-th">Արժեք (֏)</th>
                  <th className="ra-th"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${dark ? '#334155' : '#e2e8f0'}` }}>
                    <td className="ra-td">{item.name}</td>
                    <td className="ra-td">{item.weight}</td>
                    <td className="ra-td">{item.value}</td>
                    <td className="ra-td" style={{ textAlign: 'right' }}>
                      <button onClick={() => removeItem(item.id)} className="ra-remove-btn">✖</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ra-input-group">
            <input type="text" placeholder="Անուն..." value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="input-box" style={{ flex: 1, background: dark ? '#0f172a' : 'white', color: dark ? 'white' : 'black' }} />
            <input type="number" placeholder="Քաշ..." value={newItem.weight} onChange={e => setNewItem({...newItem, weight: e.target.value})} className="input-box" style={{ width: '90px', background: dark ? '#0f172a' : 'white', color: dark ? 'white' : 'black' }} />
            <input type="number" placeholder="Արժեք..." value={newItem.value} onChange={e => setNewItem({...newItem, value: e.target.value})} className="input-box" style={{ width: '90px', background: dark ? '#0f172a' : 'white', color: dark ? 'white' : 'black' }} />
            <button className="btn-outline" onClick={addItem} style={{ padding: '10px 15px' }}>➕</button>
          </div>
          
          <button className="btn-main ra-optimize-btn" onClick={optimizeResources}>⚡ Վերլուծել և Օպտիմալացնել</button>
        </div>

        <div className="ra-panel" style={{ background: dark ? '#0f172a' : '#1e293b', color: 'white', border: dark ? '1px solid #334155' : 'none' }}>
          <h3 className="ra-result-header" style={{ color: '#38bdf8', borderBottom: '1px solid #334155' }}>📊 Վերլուծության Արդյունքը</h3>
          
          {result ? (
            <div className="fade-in">
              <div className="ra-summary-box" style={{ background: '#10b98122', border: '1px solid #10b981' }}>
                <div>
                  <div style={{ color: '#10b981', fontSize: '12px', fontWeight: 800 }}>ԸՆԴՀԱՆՈՒՐ ԱՐԺԵՔ</div>
                  <h2 style={{ margin: '5px 0 0 0', color: 'white' }}>֏ {result.maxValue}</h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#10b981', fontSize: '12px', fontWeight: 800 }}>ՕԳՏԱԳՈՐԾՎԱԾ ՔԱՇ</div>
                  <h2 style={{ margin: '5px 0 0 0', color: 'white' }}>{result.usedWeight} / {capacity} կգ</h2>
                </div>
              </div>

              <h4 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Ընտրված Կոմբինացիան ({result.selectedItems.length} տարր)</h4>
              <ul className="ra-list">
                {result.selectedItems.map((item, idx) => (
                  <li key={idx} className="ra-list-item" style={{ background: dark ? '#1e293b' : '#334155' }}>
                    <span>{item.name}</span>
                    <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>+ ֏{item.value}</span>
                  </li>
                ))}
              </ul>

              <h4 style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Ալգորիթմի Քայլերը</h4>
              <div className="ra-steps" style={{ color: '#cbd5e1', background: dark ? '#1e293b' : '#334155' }}>
                {result.steps.map((step, idx) => <div key={idx}>[{idx + 1}] {step}</div>)}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#64748b', marginTop: '60px' }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>⚖️</div>
              <p>Սահմանեք պարամետրերը և սեղմեք «Օպտիմալացնել»՝ կոմբինատորային վերլուծությունը սկսելու համար։</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AlgorithmPage({ algoInfo, onBack, dark }) {
  const [inputs, setInputs] = useState(Object.fromEntries(algoInfo.inputs.map(k => [k, ''])));
  const [results, setResults] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('lab');
  const [algoDetails, setAlgoDetails] = useState(null);
  const [benchmarkProgress, setBenchmarkProgress] = useState(0);
  const [benchmarkTotal, setBenchmarkTotal] = useState(0);
  
  const [challenge, setChallenge] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [challengeStatus, setChallengeStatus] = useState(null);

  const panelBg = dark ? '#1e293b' : 'white';
  const textColor = dark ? '#f1f5f9' : '#1e293b';
  const borderColor = dark ? '#334155' : '#f1f5f9';
  const subtextColor = dark ? '#94a3b8' : '#64748b';

  useEffect(() => {
    const initial = {};
    algoInfo.inputs.forEach(k => initial[k] = "");
    setInputs(initial);
    setResults(null);
    setChallenge(null);
    if(activeTab === 'exam') setActiveTab('lab');
    fetchHistory();
    fetchAlgoDetails();
  }, [algoInfo.id]);

  const fetchAlgoDetails = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/algorithms/`);
      const data = await res.json();
      setAlgoDetails(data.find(a => a.slug === algoInfo.id));
    } catch (e) { console.error(e); }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/history/${algoInfo.id}/`);
      if (res.ok) {
        const data = await res.json();
        const sortedData = data.map(i => ({...i, n: parseInt(i.n)})).sort((a,b) => a.n - b.n);
        setHistoryData(sortedData);
      }
    } catch (e) { console.error(e); }
  };

  const handleCalculate = async (customInputs = null) => {
    setIsLoading(true);
    const finalInputs = customInputs || inputs;
    const query = new URLSearchParams({ algo: algoInfo.id, ...finalInputs }).toString();
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/combinations/?${query}`);
      const data = await res.json();
      if (!customInputs) setResults(data);
      await fetchHistory();
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  const runAutoBenchmark = async () => {
    setIsLoading(true);
    window.stopNow = false;

    let testValues = [];
    if (algoInfo.id === 'string_search') {
      testValues = [1000, 3000, 5000, 7000, 9000, 11000, 13000, 15000];
    } else {
      const limit = parseInt(inputs.n) || 15;
      const maxLimit = Math.min(limit, 30);
      for (let i = 1; i <= maxLimit; i++) testValues.push(i);
    }

    setBenchmarkTotal(testValues.length);
    setBenchmarkProgress(0);
    for (let i = 0; i < testValues.length; i++) {
      if (window.stopNow) break;
      let val = testValues[i];
      let autoIn = { n: val };

      if (algoInfo.inputs.includes('k')) autoIn.k = Math.floor(val / 2);
      if (algoInfo.inputs.includes('b')) { autoIn.a = val * 10; autoIn.b = 5; }

      await handleCalculate(autoIn);
      setBenchmarkProgress(i + 1);
    }
    setIsLoading(false);
    setBenchmarkProgress(0);
    setActiveTab('analytics');
  };

  const generateChallenge = () => {
    setUserAnswer('');
    setChallengeStatus(null);
    const newChallenge = generateRandomChallenge(algoInfo.id);
    setChallenge(newChallenge);
  };

  const exportToCSV = () => {
    if (historyData.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    
    csvContent += `ԱԼԳՈՐԻԹՄԱԿԱՆ ՎԵՐԼՈՒԾՈՒԹՅԱՆ ՀԱՇՎԵՏՎՈՒԹՅՈՒՆ\n\n`;
    csvContent += `Մոդուլ:;${algoInfo.title}\n`;
    csvContent += `Օպտիմալ մեթոդ (Time):;${algoInfo.complexity.fast}\n`;
    csvContent += `Ոչ օպտիմալ մեթոդ (Time):;${algoInfo.complexity.slow}\n`;
    csvContent += `Ամսաթիվ:;${new Date().toLocaleDateString('hy-AM')}\n\n`;

    csvContent += "Մուտքային տվյալ (N);Օպտիմալ Ժամանակ (միլիվայրկյան);Ոչ Օպտիմալ Ժամանակ (միլիվայրկյան)\n";

    historyData.forEach(row => {
      const optTime = row["Օպտիմալ"] !== undefined ? row["Օպտիմալ"].toFixed(6) : "N/A";
      const slowTime = row["Ոչ Օպտիմալ"] !== null && row["Ոչ Օպտիմալ"] !== undefined 
                       ? row["Ոչ Օպտիմալ"].toFixed(6) 
                       : "Դադարեցված է (Ծանրաբեռնվածություն)";
      
      csvContent += `${row.n};${optTime};${slowTime}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `${algoInfo.id}_benchmark_${dateStr}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isSafetyLimitExceeded = () => {
    const nVal = parseInt(inputs.n);
    if (!nVal) return false;
    if (algoInfo.id === 'fibonacci' && nVal > 35) return true;
    if (algoInfo.id === 'factorial' && nVal > 900) return true;
    if (algoInfo.id === 'combinations' && nVal > 22) return true;
    if (algoInfo.id === 'sorting' && nVal > 1000) return true;
    if (algoInfo.id === 'gcd' && inputs.a > 1000000) return true;
    if (algoInfo.id === 'permutations' && nVal > 10) return true;
    if (algoInfo.id === 'arrangements' && nVal > 11) return true;
    return false;
  };

  const renderChart = () => {
    const width = Math.max(1000, historyData.length * 60);
    const { opt, slow } = algoInfo.colors;
    const props = { width, height: 400, data: historyData, margin: { top: 20, right: 50, left: 20, bottom: 20 } };
    const Chart = algoInfo.chartType === 'bar' ? BarChart : (algoInfo.chartType === 'area' ? AreaChart : LineChart);
    const tooltipStyle = { borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', background: dark ? '#0f172a' : 'white', color: dark ? '#f1f5f9' : '#1e293b' };

    return (
      <Chart {...props}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? '#334155' : '#e2e8f0'} />
        <XAxis dataKey="n" interval={0} stroke="#64748b" />
        <YAxis yAxisId="left" stroke={slow} orientation="left" />
        <YAxis yAxisId="right" stroke={opt} orientation="right" />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend verticalAlign="top" height={36}/>
        {algoInfo.chartType === 'bar' ? (
          <><Bar yAxisId="right" dataKey="Օպտիմալ" fill={opt} radius={[4, 4, 0, 0]} /><Bar yAxisId="left" dataKey="Ոչ Օպտիմալ" fill={slow} radius={[4, 4, 0, 0]} /></>
        ) : algoInfo.chartType === 'area' ? (
          <><Area yAxisId="right" dataKey="Օպտիմալ" fill={opt} stroke={opt} fillOpacity={0.3} /><Area yAxisId="left" dataKey="Ոչ Օպտիմալ" fill={slow} stroke={slow} fillOpacity={0.3} /></>
        ) : (
          <><Line yAxisId="right" type="monotone" dataKey="Օպտիմալ" stroke={opt} strokeWidth={3} dot={{ r: 4 }} /><Line yAxisId="left" type="monotone" dataKey="Ոչ Օպտիմալ" stroke={slow} strokeWidth={3} dot={{ r: 4 }} /></>
        )}
      </Chart>
    );
  };

  const progressPct = benchmarkTotal > 0 ? (benchmarkProgress / benchmarkTotal) * 100 : 0;
  
  return (
    <div className="fade-in">
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{ margin: 0, color: textColor, fontSize: '28px' }}>{algoInfo.icon} {algoInfo.title}</h2>
        <p style={{ color: subtextColor, margin: '5px 0 0 0', fontSize: '15px' }}>Անկախ լաբորատոր մոդուլ</p>
      </div>

      <div className="algo-panel" style={{ background: panelBg, color: textColor, border: `1px solid ${borderColor}`, textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '20px', marginBottom: '20px', borderBottom: `1px solid ${dark ? '#334155' : '#f1f5f9'}` }}>
          <span style={{ color: subtextColor, fontSize: '13px', fontWeight: '800', letterSpacing: '1px' }}>ԲԱՐԴՈՒԹՅՈՒՆ</span>
          <ComplexityBadge
            fast={algoInfo.complexity.fast}
            slow={algoInfo.complexity.slow}
            optColor={algoInfo.colors.opt}
            slowColor={algoInfo.colors.slow}
          />
        </div>
        
        <div className="algo-header-flex">
          <h4 style={{ margin: 0, color: textColor, fontSize: '18px' }}>Վերջին հաշվարկների ամփոփում</h4>
          <button onClick={exportToCSV} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            📥 Ներբեռնել որպես CSV
          </button>
        </div>
      </div>

      <div className="grid-container">
        <div className="algo-panel" style={{ background: panelBg, color: textColor, border: `1px solid ${borderColor}` }}>
          <h3 style={{ borderBottom: `2px solid ${dark ? '#334155' : '#f1f5f9'}`, paddingBottom: '10px', color: dark ? '#38bdf8' : '#1e293b', margin: '0 0 15px 0' }}>📖 Տեսական Մաս</h3>
          <p style={{ color: subtextColor, margin: '0 0 10px 0' }}><strong style={{color: algoInfo.colors.opt}}>Օպտիմալ:</strong> {algoDetails?.fast_explanation || 'Բեռնվում է...'}</p>
          <code className="code-block" style={dark ? {background: '#0f172a', color: '#38bdf8', border: '1px solid #334155'} : {}}>{algoDetails?.fast_formula}</code>
          <p style={{ marginTop: '15px', color: subtextColor }}><strong style={{color: algoInfo.colors.slow}}>Ոչ օպտիմալ:</strong> {algoDetails?.slow_explanation}</p>
          <code className="code-block" style={dark ? {background: '#0f172a', color: '#f87171', border: '1px solid #334155'} : {background: '#fff1f2', color: '#be123c'}}>{algoDetails?.slow_formula}</code>
        </div>
        <div className="algo-panel" style={{ background: dark ? '#0f172a' : '#1e293b', color: '#f8fafc', border: dark ? '1px solid #334155' : 'none' }}>
          <h3 style={{ color: '#38bdf8', borderBottom: '1px solid #334155', paddingBottom: '10px', margin: '0 0 15px 0' }}>🔢 Հաշվարկի Քայլերը (N={results?.n || '?'})</h3>
          <div>
            {results?.steps?.map((s, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #334155' }}>
                {s}
              </div>
            ))}
            {!results && <p style={{color: '#475569', fontStyle: 'italic'}}>Հաշվարկ կատարելուց հետո կերևան քայլերը...</p>}
          </div>
        </div>
      </div>

      <div className="nav-tabs">
        <button className={`nav-tab ${activeTab === 'lab' ? 'active' : ''}`} onClick={() => setActiveTab('lab')} style={activeTab !== 'lab' && dark ? {background: '#334155', color: '#94a3b8'} : {}}>🧮 Լաբորատորիա</button>
        <button className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')} style={activeTab !== 'analytics' && dark ? {background: '#334155', color: '#94a3b8'} : {}}>📈 Անալիզ և Գրաֆիկ</button>
        <button className={`nav-tab ${activeTab === 'exam' ? 'active' : ''}`} onClick={() => {setActiveTab('exam'); generateChallenge();}} style={activeTab !== 'exam' && dark ? {background: '#334155', color: '#94a3b8'} : {}}>🎓 Քննական Ռեժիմ</button>
      </div>

      {activeTab === 'lab' && (
        <div className="algo-panel" style={{ background: panelBg, color: textColor, border: `1px solid ${borderColor}` }}>
          <div className="lab-inputs-row">
            {algoInfo.inputs.map(k => (
              <div key={k}>
                <label className="input-label-static" style={{ color: subtextColor }}>{k.toUpperCase()} ԱՐԺԵՔ</label>
                <input type="number" className="input-box" placeholder={k} value={inputs[k] ?? ''} onChange={e => setInputs({...inputs, [k]: e.target.value})}
                  style={dark ? {background: '#0f172a', color: '#f1f5f9', border: '2px solid #334155'} : {}} />
              </div>
            ))}
            {!isLoading ? (
              <>
                <button className="btn-main" onClick={() => handleCalculate()}>⚡ Հաշվել</button>
                <button className="btn-outline" onClick={runAutoBenchmark} style={dark ? {background: '#1e293b', color: '#818cf8', border: '2px solid #334155'} : {}}>🚀 Ավտո-Բենչմարկ</button>
                {isSafetyLimitExceeded() && (
                <div style={{ marginTop: '12px', color: '#f59e0b', fontSize: '13px', fontWeight: 'bold', background: '#fef3c7', padding: '10px 15px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                  ⚠️ Տվյալների մեծ չափի պատճառով դանդաղ մեթոդը (O(2ⁿ) կամ O(n²)) ավտոմատ կանջատվի՝ սերվերի անվտանգությունն ապահովելու համար:
                </div>
                )}
              </>
            ) : (
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{fontSize: '12px', fontWeight: 700, color: algoInfo.colors.opt}}>
                    Հաշվարկվում է... {benchmarkProgress}/{benchmarkTotal}
                  </span>
                  <button className="btn-main stop-btn" onClick={() => window.stopNow = true} style={{padding: '8px 16px', fontSize: '13px'}}>🛑 Կանգ</button>
                </div>
                <ProgressBar progress={progressPct} color={algoInfo.colors.opt} dark={dark} />
              </div>
            )}
          </div>
          
          {results && (
            <>
              <div className="results-grid" style={{ background: dark ? '#0f172a' : '#1e293b', color: 'white' }}>
                <div className="result-col">
                  <span className="result-label-static" style={{color: '#94a3b8'}}>ՀԻՇՈՂՈՒԹՅՈՒՆ</span>
                  <h3 className="result-h3">{results.memory_kb} KB</h3>
                </div>
                <div className="result-col" style={{borderLeft: '1px solid #334155', borderRight: '1px solid #334155'}}>
                  <span className="result-label-static" style={{color: '#94a3b8'}}>ԺԱՄԱՆԱԿ (ԱՐԱԳ)</span>
                  <h3 className="result-h3" style={{color: algoInfo.colors.opt}}>{Number(results.time_fast_ms).toFixed(4)} ms</h3>
                </div>
                <div className="result-col">
                  <span className="result-label-static" style={{color: '#94a3b8'}}>ԱՐԴՅՈՒՆՔ</span>
                  <h3 className="result-h3">{results.result}</h3>
                </div>
              </div>
              <SpeedupBadge timeFast={results.time_fast_ms} timeSlow={results.time_slow_ms} optColor={algoInfo.colors.opt} />
            </>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="algo-panel" style={{ background: panelBg, color: textColor, border: `1px solid ${borderColor}` }}>
          <h3 style={{ marginBottom: '20px', color: textColor }}>Անալիտիկ Վիզուալիզացիա</h3>
          <div className="chart-wrapper" style={{ border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, background: dark ? '#0f172a' : 'white' }}>
            <div style={{ width: 'max-content', padding: '10px' }}>{renderChart()}</div>
          </div>
          <p style={{ color: subtextColor, fontSize: '12px', marginTop: '10px' }}>* Յուրաքանչյուր կետ ներկայացնում է հաշվարկի ժամանակը տվյալ N-ի դեպքում:</p>
        </div>
      )}

      {activeTab === 'exam' && (
        <div className="algo-panel fade-in exam-container" style={{ background: panelBg, color: textColor, border: `1px solid ${borderColor}` }}>
          <h2 style={{color: algoInfo.colors.opt, fontSize: '24px', marginBottom: '10px'}}>Պրակտիկ Խնդիր</h2>
          <div style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', color: subtextColor}}>{challenge?.level}</div>
          <p className="exam-question" style={{color: subtextColor}}>
            {challenge?.question}
          </p>

          {challenge?.correctAnswer !== null ? (
            <div className="exam-actions">
              <input 
                type="number" 
                placeholder="Քո պատասխանը..." 
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="exam-input"
                style={{ border: `2px solid ${algoInfo.colors.opt}`, background: dark ? '#0f172a' : 'white', color: textColor }}
              />
              <button 
                className="btn-main"
                onClick={() => {
                  if (parseInt(userAnswer) === challenge.correctAnswer) setChallengeStatus('correct');
                  else setChallengeStatus('wrong');
                }}
                style={{background: algoInfo.colors.opt, boxShadow: `0 4px 15px ${algoInfo.colors.opt}66`}}
              >
                ✔️ Ստուգել
              </button>
              <button className="btn-outline" onClick={generateChallenge} style={{borderColor: '#94a3b8', color: '#64748b'}}>
                🔄 Ուրիշ խնդիր
              </button>
            </div>
          ) : (
             <button className="btn-outline" onClick={() => setActiveTab('lab')}>Վերադառնալ Լաբորատորիա</button>
          )}

          {challengeStatus === 'correct' && (
            <div className="fade-in exam-feedback" style={{ background: '#ecfdf5', border: '2px solid #10b981', color: '#047857' }}>
              <h3 style={{margin: '0 0 10px 0'}}>🎉 Կեցցե՜ս, ճշգրիտ է:</h3>
              <p style={{margin: 0}}>Դու գտար ճիշտ պատասխանը ({challenge.correctAnswer}): Շարունակիր նույն ոգով:</p>
            </div>
          )}

          {challengeStatus === 'wrong' && (
            <div className="fade-in exam-feedback" style={{ background: '#fef2f2', border: '2px solid #ef4444', color: '#b91c1c' }}>
              <h3 style={{margin: '0 0 10px 0'}}>❌ Ավաղ, սխալ է:</h3>
              <p style={{margin: 0, marginBottom: '15px'}}>Ճիշտ պատասխանն էր՝ <strong>{challenge.correctAnswer}</strong>:</p>
              <button 
                onClick={() => {
                  let testInputs = { ...inputs };
                  if (challenge.n !== undefined) testInputs.n = challenge.n.toString();
                  if (challenge.k !== undefined) testInputs.k = challenge.k.toString();
                  if (challenge.a !== undefined) testInputs.a = challenge.a.toString();
                  if (challenge.b !== undefined) testInputs.b = challenge.b.toString();
                  
                  setInputs(testInputs); 
                  setActiveTab('lab');   
                  setTimeout(() => handleCalculate(testInputs), 300); 
                }}
                style={{background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}
              >
                🤖 Թողնել սերվերը հաշվի
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  const [view, setView] = useState('home');
  const [dark, setDark] = useState(false);

  const bg = dark ? '#0f172a' : '#f8fafc';
  const cardBorder = dark ? '#334155' : '#f1f5f9';
  const cardBg = dark ? '#1e293b' : 'white';
  const headingColor = dark ? '#f1f5f9' : '#1e293b';
  const subtextColor = dark ? '#94a3b8' : '#64748b';

  return (
    <div className="app-main-container" style={{ backgroundColor: bg }}>
      <div className="app-wrapper">
        <header className="main-app-header">
          <button 
            className="dark-toggle" 
            onClick={() => setDark(!dark)} 
            style={{ position: 'absolute', right: 0, top: 0, background: dark ? '#1e293b' : 'white', border: `2px solid ${dark ? '#334155' : '#e2e8f0'}`, color: dark ? '#f1f5f9' : '#475569' }}
          >
            {dark ? '☀️ Լույս' : '🌙 Մութ'}
          </button>
          
          <div className="header-flex">
            <div>
              <h1 style={{ color: headingColor, margin: 0, fontSize: '32px' }}>Գիտական Լաբորատորիա 🔬</h1>
              <p style={{ color: subtextColor, marginTop: '15px', fontSize: '18px' }}>Ալգորիթմների և տվյալների կառույցների վերլուծության հարթակ</p>
            </div>
            
            {view !== 'home' && (
              <button className="btn-back" onClick={() => setView('home')} style={{ marginRight: '120px', marginBottom: '25px'}}>
                🏠 Գլխավոր Էջ
              </button>
            )}
          </div>
        </header>

        {view === 'home' && (
          <div className="grid-container fade-in">
            <div 
              className="algo-card" 
              onClick={() => setView('workspace')} 
              style={{ background: dark ? '#0f172a' : '#10b981', border: `2px solid ${dark ? '#10b981' : 'transparent'}`, gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '20px' }}
            >
              <div style={{ fontSize: '60px' }}>👨‍💻</div>
              <div>
                <h3 style={{ color: 'white', fontSize: '24px', margin: '0 0 10px 0' }}>Ալգորիթմների Լաբորատորիա (IDE)</h3>
                <p style={{ color: '#ecfdf5', margin: 0, fontSize: '15px' }}>Գրիր քո սեփական Python կոդը անմիջապես բրաուզերում և վերլուծիր դրա արդյունավետությունը:</p>
              </div>
              <div style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', color: 'white', padding: '10px 20px', borderRadius: '12px', fontWeight: 800 }}>ԲԱՑԵԼ IDE-ն ➔</div>
            </div>

            {Object.values(ALGORITHMS_DATA).map(a => (
              <div key={a.id} className="algo-card" onClick={() => setView(a.viewKey || a.id)} style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <div className="algo-card-icon" style={{ background: dark ? '#1e3a5f' : '#f5f3ff' }}>{a.icon}</div>
                <h3 className="algo-card-title" style={{ color: headingColor }}>{a.title}</h3>
                <p className="algo-card-desc" style={{ color: subtextColor }}>{a.desc}</p>
                <div style={{ display: 'flex', gap: '8px', margin: '15px 0' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, background: a.colors.opt + '22', color: a.colors.opt, padding: '5px 10px', borderRadius: '8px', fontFamily: 'monospace' }}>{a.complexity.fast}</span>
                  <span style={{ fontSize: '12px', color: subtextColor, display: 'flex', alignItems: 'center' }}>vs</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, background: a.colors.slow + '22', color: a.colors.slow, padding: '5px 10px', borderRadius: '8px', fontFamily: 'monospace' }}>{a.complexity.slow}</span>
                </div>
                <div className="algo-card-link" style={{ color: '#4f46e5' }}>ՄՏՆԵԼ ՄՈԴՈՒԼ ➔</div>
              </div>
            ))}
          </div>
        )}

        {view === 'allocator' && <ResourceAllocator dark={dark} />}
        {view === 'workspace' && <CodeWorkspace dark={dark} />}
        
        {view !== 'home' && view !== 'allocator' && ALGORITHMS_DATA[view] && (
          <AlgorithmPage algoInfo={ALGORITHMS_DATA[view]} onBack={() => setView('home')} dark={dark} />
        )}
      </div>
    </div>
  );
}

export default App;