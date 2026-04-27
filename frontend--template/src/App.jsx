import { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

const ALGORITHMS_DATA = {
  fibonacci: { id: 'fibonacci', title: 'Ֆիբոնաչի', icon: '🌀', desc: 'Ոսկե հատում vs Ռեկուրսիա', inputs: ['n'], chartType: 'line', colors: { opt: '#10b981', slow: '#ef4444' } },
  factorial: { id: 'factorial', title: 'Ֆակտորիալ', icon: '❗', desc: 'Loop vs Recursion', inputs: ['n'], chartType: 'bar', colors: { opt: '#3b82f6', slow: '#f97316' } },
  combinations: { id: 'combinations', title: 'Զուգորդություն', icon: '🎲', desc: 'Բանաձև vs Պասկալի եռանկյուն', inputs: ['n', 'k'], chartType: 'area', colors: { opt: '#8b5cf6', slow: '#ec4899' } },
  sorting: { id: 'sorting', title: 'Տեսակավորում', icon: '📊', desc: 'Quick Sort vs Bubble Sort', inputs: ['n'], chartType: 'bar', colors: { opt: '#06b6d4', slow: '#f43f5e' } },
  gcd: { id: 'gcd', title: 'ՀԱԲ (GCD)', icon: '➗', desc: 'Էվկլիդես vs Գծային որոնում', inputs: ['a', 'b'], chartType: 'line', colors: { opt: '#10b981', slow: '#f59e0b' } }
};

function AlgorithmPage({ algoInfo, onBack }) {
  const [inputs, setInputs] = useState({});
  const [results, setResults] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('lab');
  const [algoDetails, setAlgoDetails] = useState(null);

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
    setIsLoading(true);
    window.stopNow = false;
    for (let i = 1; i <= limit; i++) {
      if (window.stopNow) break;
      const autoIn = { n: i };
      if (algoInfo.inputs.includes('k')) autoIn.k = Math.floor(i / 2);
      if (algoInfo.inputs.includes('b')) { autoIn.a = i * 10; autoIn.b = 5; }
      await handleCalculate(autoIn);
    }
    setIsLoading(false);
    setActiveTab('analytics');
  };

  const renderChart = () => {
    const width = Math.max(1000, historyData.length * 60);
    const { opt, slow } = algoInfo.colors;
    const props = { width, height: 400, data: historyData, margin: { top: 20, right: 50, left: 20, bottom: 20 } };
    const Chart = algoInfo.chartType === 'bar' ? BarChart : (algoInfo.chartType === 'area' ? AreaChart : LineChart);
    
    return (
      <Chart {...props}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="n" interval={0} stroke="#64748b" />
        <YAxis yAxisId="left" stroke={slow} orientation="left" />
        <YAxis yAxisId="right" stroke={opt} orientation="right" />
        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
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

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
        <button onClick={onBack} className="btn-back">⬅️ Գլխավոր Էջ</button>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b' }}>{algoInfo.icon} {algoInfo.title}</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Անկախ լաբորատոր մոդուլ</p>
        </div>
      </div>

      <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', margin: '20px 0' }}>
        <div className="panel theory-panel">
          <h3 style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>📖 Տեսական Մաս</h3>
          <p><strong>Օպտիմալ:</strong> {algoDetails?.fast_explanation || 'Բեռնվում է...'}</p>
          <code className="code-block">{algoDetails?.fast_formula}</code>
          <p style={{ marginTop: '15px' }}><strong>Ոչ օպտիմալ:</strong> {algoDetails?.slow_explanation}</p>
          <code className="code-block" style={{background: '#fff1f2', color: '#be123c'}}>{algoDetails?.slow_formula}</code>
        </div>
        <div className="panel steps-panel" style={{ background: '#1e293b', color: '#f8fafc' }}>
          <h3 style={{ color: '#38bdf8', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>🔢 Հաշվարկի Քայլերը (N={results?.n || '?'})</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '14px', fontFamily: 'Fira Code, monospace' }}>
            {results?.steps?.map((s, i) => (
              <div key={i} style={{borderLeft: '2px solid #38bdf8', paddingLeft: '15px', marginBottom: '8px', color: '#cbd5e1'}}>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="nav-tabs">
        <button className={`nav-tab ${activeTab === 'lab' ? 'active' : ''}`} onClick={() => setActiveTab('lab')}>🧮 Լաբորատորիա</button>
        <button className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>📈 Անալիզ և Գրաֆիկ</button>
      </div>

      {activeTab === 'lab' && (
        <div className="panel">
          <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {algoInfo.inputs.map(k => (
              <div key={k}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '5px' }}>{k.toUpperCase()} ԱՐԺԵՔ</label>
                <input type="number" className="input-box" placeholder={k} value={inputs[k]} onChange={e => setInputs({...inputs, [k]: e.target.value})} />
              </div>
            ))}
            {!isLoading ? (
              <>
                <button className="btn-main" onClick={() => handleCalculate()}>⚡ Հաշվել</button>
                <button className="btn-outline" onClick={runAutoBenchmark}>🚀 Ավտո-Բենչմարկ</button>
              </>
            ) : (
              <button className="btn-main stop-btn" onClick={() => window.stopNow = true}>🛑 Կանգնեցնել</button>
            )}
          </div>
          {results && (
            <div style={{ display: 'flex', background: '#1e293b', color: 'white', padding: '25px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
              <div style={{flex: 1}}><span style={{color: '#94a3b8', fontSize: '12px', display: 'block'}}>ՀԻՇՈՂՈՒԹՅՈՒՆ</span><h3 style={{margin: '5px 0 0 0'}}>{results.memory_kb} KB</h3></div>
              <div style={{flex: 1, borderLeft: '1px solid #334155', borderRight: '1px solid #334155'}}><span style={{color: '#94a3b8', fontSize: '12px', display: 'block'}}>ԺԱՄԱՆԱԿ (ԱՐԱԳ)</span><h3 style={{margin: '5px 0 0 0', color: algoInfo.colors.opt}}>{results.time_fast_ms} ms</h3></div>
              <div style={{flex: 1}}><span style={{color: '#94a3b8', fontSize: '12px', display: 'block'}}>ԱՐԴՅՈՒՆՔ</span><h3 style={{margin: '5px 0 0 0'}}>{results.result}</h3></div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="panel">
          <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Անալիտիկ Վիզուալիզացիա</h3>
          <div style={{ width: '100%', overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: 'max-content', padding: '10px' }}>{renderChart()}</div>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '15px', fontStyle: 'italic' }}>* Յուրաքանչյուր կետ ներկայացնում է հաշվարկի ժամանակը տվյալ N-ի դեպքում:</p>
        </div>
      )}
    </div>
  );
}

function App() {
  const [view, setView] = useState('home');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .panel { background: white; padding: 30px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #f1f5f9; }
        
        .btn-main { background: #4f46e5; color: white; padding: 12px 28px; border-radius: 14px; border: none; cursor: pointer; font-weight: 700; transition: all 0.2s; box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.39); }
        .btn-main:hover { background: #4338ca; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(79, 70, 229, 0.23); }
        .btn-main:active { transform: translateY(0); }
        
        .btn-outline { background: white; color: #4f46e5; border: 2px solid #e2e8f0; padding: 10px 24px; border-radius: 14px; cursor: pointer; font-weight: 700; transition: all 0.2s; }
        .btn-outline:hover { border-color: #4f46e5; background: #f5f3ff; }
        
        .btn-back { background: #f1f5f9; color: #475569; padding: 10px 20px; border-radius: 12px; border: none; cursor: pointer; font-weight: 700; transition: 0.2s; }
        .btn-back:hover { background: #e2e8f0; color: #1e293b; }
        
        .stop-btn { background: #ef4444 !important; box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.39) !important; }
        .stop-btn:hover { background: #dc2626 !important; }

        .input-box { width: 100px; padding: 12px; border-radius: 12px; border: 2px solid #e2e8f0; outline: none; transition: 0.2s; font-weight: 700; color: #1e293b; }
        .input-box:focus { border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
        
        .code-block { display: block; background: #f8fafc; padding: 12px; border-radius: 10px; font-family: 'Fira Code', monospace; font-size: 14px; margin: 10px 0; border: 1px solid #e2e8f0; color: #334155; }
        
        .nav-tabs { display: flex; gap: 12px; margin-bottom: 20px; }
        .nav-tab { padding: 12px 24px; font-weight: 700; color: #64748b; cursor: pointer; border: none; background: #f1f5f9; border-radius: 14px; transition: 0.3s; }
        .nav-tab.active { background: #4f46e5; color: white; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3); }

        .algo-card { background: white; padding: 30px; border-radius: 28px; border: 1px solid #f1f5f9; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .algo-card:hover { transform: translateY(-8px); border-color: #4f46e5; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <header style={{ marginBottom: '50px', textAlign: 'center' }}>
          <h1 style={{ color: '#1e293b', fontWeight: 900, fontSize: '38px', letterSpacing: '-1px', margin: '0 0 10px 0' }}>Գիտական Լաբորատորիա 🔬</h1>
          <p style={{ color: '#64748b', fontSize: '18px' }}>Ալգորիթմների և տվյալների կառույցների վերլուծության հարթակ</p>
        </header>

        {view === 'home' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }} className="fade-in">
            {Object.values(ALGORITHMS_DATA).map(a => (
              <div key={a.id} className="algo-card" onClick={() => setView(a.id)}>
                <div style={{ fontSize: '45px', marginBottom: '20px', background: '#f5f3ff', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px' }}>{a.icon}</div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '22px', color: '#1e293b' }}>{a.title}</h3>
                <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '15px' }}>{a.desc}</p>
                <div style={{ marginTop: '20px', color: '#4f46e5', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>ՄՏՆԵԼ ՄՈԴՈՒԼ ➔</div>
              </div>
            ))}
          </div>
        ) : <AlgorithmPage algoInfo={ALGORITHMS_DATA[view]} onBack={() => setView('home')} />}
      </div>
    </div>
  );
}
export default App;