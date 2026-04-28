import { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import './visual.css';

const ALGORITHMS_DATA = {
  fibonacci: { id: 'fibonacci', title: 'Ֆիբոնաչի', icon: '🌀', desc: 'Ոսկե հատում vs Ռեկուրսիա', inputs: ['n'], chartType: 'line', colors: { opt: '#10b981', slow: '#ef4444' }, complexity: { fast: 'O(1)', slow: 'O(2ⁿ)' } },
  factorial: { id: 'factorial', title: 'Ֆակտորիալ', icon: '❗', desc: 'Loop vs Recursion', inputs: ['n'], chartType: 'bar', colors: { opt: '#3b82f6', slow: '#f97316' }, complexity: { fast: 'O(n)', slow: 'O(n)' } },
  combinations: { id: 'combinations', title: 'Զուգորդություն', icon: '🎲', desc: 'Բանաձև vs Պասկալի եռանկյուն', inputs: ['n', 'k'], chartType: 'area', colors: { opt: '#8b5cf6', slow: '#ec4899' }, complexity: { fast: 'O(k)', slow: 'O(2ⁿ)' } },
  sorting: { id: 'sorting', title: 'Տեսակավորում', icon: '📊', desc: 'Quick Sort vs Bubble Sort', inputs: ['n'], chartType: 'bar', colors: { opt: '#06b6d4', slow: '#f43f5e' }, complexity: { fast: 'O(n log n)', slow: 'O(n²)' } },
  gcd: { id: 'gcd', title: 'ՀԱԲ (GCD)', icon: '➗', desc: 'Էվկլիդես vs Գծային որոնում', inputs: ['a', 'b'], chartType: 'line', colors: { opt: '#10b981', slow: '#f59e0b' }, complexity: { fast: 'O(log n)', slow: 'O(n)' } }
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
      <div className="progress-bar" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)`, boxShadow: `0 0 8px ${color}66` }} />
    </div>
  );
}

function AlgorithmPage({ algoInfo, onBack, dark }) {
  const [inputs, setInputs] = useState(
    Object.fromEntries(algoInfo.inputs.map(k => [k, '']))
  );
  const [results, setResults] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('lab');
  const [algoDetails, setAlgoDetails] = useState(null);
  const [benchmarkProgress, setBenchmarkProgress] = useState(0);
  const [benchmarkTotal, setBenchmarkTotal] = useState(0);

  const panel = { background: dark ? '#1e293b' : 'white', color: dark ? '#f1f5f9' : '#1e293b', border: dark ? '1px solid #334155' : '1px solid #f1f5f9' };
  const subtext = { color: dark ? '#94a3b8' : '#64748b' };

  useEffect(() => {
    const initial = {};
    algoInfo.inputs.forEach(k => initial[k] = "");
    setInputs(initial);
    setResults(null);
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
    const limit = parseInt(inputs.n) || 15;
    setBenchmarkTotal(limit);
    setBenchmarkProgress(0);
    setIsLoading(true);
    window.stopNow = false;
    for (let i = 1; i <= limit; i++) {
      if (window.stopNow) break;
      const autoIn = { n: i };
      if (algoInfo.inputs.includes('k')) autoIn.k = Math.floor(i / 2);
      if (algoInfo.inputs.includes('b')) { autoIn.a = i * 10; autoIn.b = 5; }
      await handleCalculate(autoIn);
      setBenchmarkProgress(i);
    }
    setIsLoading(false);
    setBenchmarkProgress(0);
    setActiveTab('analytics');
  };

  const isSafetyLimitExceeded = () => {
    const nVal = parseInt(inputs.n);
    if (!nVal) return false;
    if (algoInfo.id === 'fibonacci' && nVal > 35) return true;
    if (algoInfo.id === 'factorial' && nVal > 900) return true;
    if (algoInfo.id === 'combinations' && nVal > 22) return true;
    if (algoInfo.id === 'sorting' && nVal > 1000) return true;
    if (algoInfo.id === 'gcd' && inputs.a > 1000000) return true;
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
      <div className='header'>
        <button onClick={onBack} className="btn-back">⬅️ Գլխավոր Էջ</button>
        <div>
          <h2 style={{ margin: 0, color: dark ? '#f1f5f9' : '#1e293b' }}>{algoInfo.icon} {algoInfo.title}</h2>
          <p className="p" style={subtext}>Անկախ լաբորատոր մոդուլ</p>
        </div>
      </div>

      <div className="panel" style={panel}>
        <div className='level'>
          <span style={subtext}>ԲԱՐԴՈՒԹՅՈՒՆ</span>
          <ComplexityBadge
            fast={algoInfo.complexity.fast}
            slow={algoInfo.complexity.slow}
            optColor={algoInfo.colors.opt}
            slowColor={algoInfo.colors.slow}
          />
        </div>
      </div>

      <div className="grid-container">
        <div className="panel" style={panel}>
          <h3 style={{ borderBottom: `2px solid ${dark ? '#334155' : '#f1f5f9'}`, paddingBottom: '10px', color: dark ? '#38bdf8' : '#1e293b' }}>📖 Տեսական Մաս</h3>
          <p className="p" style={subtext}><strong style={{color: algoInfo.colors.opt}}>Օպտիմալ:</strong> {algoDetails?.fast_explanation || 'Բեռնվում է...'}</p>
          <code className="code-block" style={dark ? {background: '#0f172a', color: '#38bdf8', border: '1px solid #334155'} : {}}>{algoDetails?.fast_formula}</code>
          <p className="p" style={{ marginTop: '15px', ...subtext }}><strong style={{color: algoInfo.colors.slow}}>Ոչ օպտիմալ:</strong> {algoDetails?.slow_explanation}</p>
          <code className="code-block" style={dark ? {background: '#0f172a', color: '#f87171', border: '1px solid #334155'} : {background: '#fff1f2', color: '#be123c'}}>{algoDetails?.slow_formula}</code>
        </div>
        <div className="panel" style={{ background: dark ? '#0f172a' : '#1e293b', color: '#f8fafc', border: dark ? '1px solid #334155' : 'none' }}>
          <h3 style={{ color: '#38bdf8', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>🔢 Հաշվարկի Քայլերը (N={results?.n || '?'})</h3>
          <div className="steps-list-container">
            {results?.steps?.map((s, i) => (
              <div key={i} className="step-row">
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
      </div>

      {activeTab === 'lab' && (
        <div className="panel" style={panel}>
          <div className="lab-inputs-row">
            {algoInfo.inputs.map(k => (
              <div key={k}>
                <label className="input-label-static" style={subtext}>{k.toUpperCase()} ԱՐԺԵՔ</label>
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
              <div className="progress-section">
                <div className="progress-header">
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
                  <h3 className="result-h3" style={{color: algoInfo.colors.opt}}>{results.time_fast_ms} ms</h3>
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
        <div className="panel" style={panel}>
          <h3 style={{ marginBottom: '20px', color: dark ? '#f1f5f9' : '#1e293b' }}>Անալիտիկ Վիզուալիզացիա</h3>
          <div className="chart-wrapper" style={{ border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, background: dark ? '#0f172a' : 'white' }}>
            <div style={{ width: 'max-content', padding: '10px' }}>{renderChart()}</div>
          </div>
          <p className="chart-note" style={subtext}>* Յուրաքանչյուր կետ ներկայացնում է հաշվարկի ժամանակը տվյալ N-ի դեպքում:</p>
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
    <div style={{ minHeight: '100vh', backgroundColor: bg, padding: '40px 20px', fontFamily: 'Inter, sans-serif', transition: 'background 0.3s' }}>
      <style>{`
        .fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .btn-main { background: #4f46e5; color: white; padding: 12px 28px; border-radius: 14px; border: none; cursor: pointer; font-weight: 700; transition: all 0.2s; box-shadow: 0 4px 14px 0 rgba(79,70,229,0.39); }
        .btn-main:hover { background: #4338ca; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(79,70,229,0.23); }
        .btn-main:active { transform: translateY(0); }
        .btn-outline { background: white; color: #4f46e5; border: 2px solid #e2e8f0; padding: 10px 24px; border-radius: 14px; cursor: pointer; font-weight: 700; transition: all 0.2s; }
        .btn-outline:hover { border-color: #4f46e5; background: #f5f3ff; }
        .btn-back { background: #f1f5f9; color: #475569; padding: 10px 20px; border-radius: 12px; border: none; cursor: pointer; font-weight: 700; transition: 0.2s; }
        .btn-back:hover { background: #e2e8f0; color: #1e293b; }
        .stop-btn { background: #ef4444 !important; box-shadow: 0 4px 14px 0 rgba(239,68,68,0.39) !important; }
        .stop-btn:hover { background: #dc2626 !important; }
        .input-box { width: 100px; padding: 12px; border-radius: 12px; border: 2px solid #e2e8f0; outline: none; transition: 0.2s; font-weight: 700; color: #1e293b; }
        .input-box:focus { border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79,70,229,0.1); }
        .code-block { display: block; background: #f8fafc; padding: 12px; border-radius: 10px; font-family: 'Fira Code', monospace; font-size: 14px; margin: 10px 0; border: 1px solid #e2e8f0; color: #334155; }
        .nav-tabs { display: flex; gap: 12px; margin-bottom: 20px; }
        .nav-tab { padding: 12px 24px; font-weight: 700; color: #64748b; cursor: pointer; border: none; background: #f1f5f9; border-radius: 14px; transition: 0.3s; }
        .nav-tab.active { background: #4f46e5; color: white; box-shadow: 0 10px 15px -3px rgba(79,70,229,0.3); }
        .algo-card { padding: 30px; border-radius: 28px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .algo-card:hover { transform: translateY(-8px); border-color: #4f46e5 !important; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
        .dark-toggle { cursor: pointer; background: none; border: 2px solid #e2e8f0; border-radius: 50px; padding: 8px 18px; font-size: 18px; transition: 0.2s; }
        .dark-toggle:hover { border-color: #4f46e5; }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <header className="main-app-header">
          <button className="dark-toggle" onClick={() => setDark(!dark)} style={{ position: 'absolute', right: 0, top: 0, background: dark ? '#1e293b' : 'white', border: `2px solid ${dark ? '#334155' : '#e2e8f0'}`, color: dark ? '#f1f5f9' : '#475569' }}>
            {dark ? '☀️ Լույս' : '🌙 Մութ'}
          </button>
          <h1 className="main-app-title" style={{ color: headingColor }}>Գիտական Լաբորատորիա 🔬</h1>
          <p className="main-app-subtitle" style={{ color: subtextColor }}>Ալգորիթմների և տվյալների կառույցների վերլուծության հարթակ</p>
        </header>

        {view === 'home' ? (
          <div className="grid-container fade-in">
            {Object.values(ALGORITHMS_DATA).map(a => (
              <div key={a.id} className="algo-card" onClick={() => setView(a.id)} style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <div className="algo-card-icon" style={{ background: dark ? '#1e3a5f' : '#f5f3ff' }}>{a.icon}</div>
                <h3 className="algo-card-title" style={{ color: headingColor }}>{a.title}</h3>
                <p className="algo-card-desc" style={{ color: subtextColor }}>{a.desc}</p>
                <div style={{ display: 'flex', gap: '8px', margin: '10px 0' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, background: a.colors.opt + '22', color: a.colors.opt, padding: '3px 10px', borderRadius: '8px', fontFamily: 'monospace' }}>{a.complexity.fast}</span>
                  <span style={{ fontSize: '12px', color: subtextColor }}>vs</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, background: a.colors.slow + '22', color: a.colors.slow, padding: '3px 10px', borderRadius: '8px', fontFamily: 'monospace' }}>{a.complexity.slow}</span>
                </div>
                <div className="algo-card-link" style={{ color: '#4f46e5' }}>ՄՏՆԵԼ ՄՈԴՈՒԼ ➔</div>
              </div>
            ))}
          </div>
        ) : <AlgorithmPage algoInfo={ALGORITHMS_DATA[view]} onBack={() => setView('home')} dark={dark} />}
      </div>
    </div>
  );
}
export default App;