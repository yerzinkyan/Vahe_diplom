import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function App() {
  const [algorithms, setAlgorithms] = useState([]);
  const [selectedAlgo, setSelectedAlgo] = useState('');
  const [inputs, setInputs] = useState({});
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [historyData, setHistoryData] = useState([]); 
  
  // ՆՈՐԸ. Էջանցման State
  const [activeTab, setActiveTab] = useState('lab'); 

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/algorithms/')
      .then(res => res.json())
      .then(data => {
        setAlgorithms(data);
        if (data.length > 0) {
          setSelectedAlgo(data[0].slug);
          initInputs(data[0].required_inputs);
          fetchHistory(data[0].slug);
        }
      });
  }, []);

  const fetchHistory = async (slug) => {
    const res = await fetch(`http://127.0.0.1:8000/api/history/${slug}/`);
    if (res.ok) setHistoryData(await res.json());
  };

  const initInputs = (reqInputs) => {
    const obj = {};
    reqInputs.split(',').forEach(k => obj[k.trim()] = "");
    setInputs(obj);
    setResults(null);
  };

  const handleCalculate = async (customInputs = null) => {
    setIsLoading(true);
    const finalInputs = customInputs || inputs;
    const query = new URLSearchParams({ algo: selectedAlgo, ...finalInputs }).toString();
    const res = await fetch(`http://127.0.0.1:8000/api/combinations/?${query}`);
    const data = await res.json();
    if (!customInputs) setResults(data);
    setIsLoading(false);
    fetchHistory(selectedAlgo);
    return data;
  };

  const runAutoBenchmark = async () => {
    const limit = parseInt(inputs.n) || 20;
    setIsLoading(true);
    for (let i = 1; i <= limit; i++) {
      await handleCalculate({ n: i, k: Math.floor(i / 2) });
    }
    setIsLoading(false);
    setActiveTab('analytics'); // Բենչմարկից հետո ավտոմատ գնալ գրաֆիկների էջ
  };

  const exportToCSV = () => {
    const headers = ["N", "Optimal (ms)", "Recursive (ms)"];
    const rows = historyData.map(d => [d.n, d["Օպտիմալ"], d["Ոչ Օպտիմալ"]]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `analysis_${selectedAlgo}.csv`);
    link.click();
  };

  const generatePDF = () => {
    window.print();
  };

  const safeSlug = selectedAlgo ? selectedAlgo.toLowerCase() : '';

  const explanations = {
    combinations: {
      fast: { title: "Մաթեմատիկական Բանաձև", desc: "Օգտագործում է C(n, k) = n! / (k! * (n-k)!) հայտնի բանաձևը։ Արդյունքը ստացվում է ակնթարթորեն՝ շնորհիվ պարզ մաթեմատիկական գործողությունների (O(1))։" },
      slow: { title: "Ռեկուրսիվ Ճյուղավորում", desc: "Փորձում է գտնել լուծումը՝ ստուգելով բոլոր հնարավոր տարբերակները մեկ առ մեկ։ Բարդությունը էքսպոնենցիալ է՝ O(2^n)։" }
    },
    factorial: {
      fast: { title: "Գծային Հաշվարկ", desc: "Կիրառում է պրոցեսորի մակարդակով օպտիմիզացված ցիկլային բազմապատկում: Գործողությունն արվում է գծային ժամանակում՝ խնայելով հիշողությունը:" },
      slow: { title: "Ռեկուրսիվ Կանչեր", desc: "Ամեն մի թվի համար բացում է հիշողության նոր բլոկ (Call Stack)։ Մեծ թվերի դեպքում այն պարզապես լցնում է համակարգչի RAM-ը:" }
    },
    fibonacci: {
      fast: { title: "Բինեի Բանաձև (O(1))", desc: "Թիվը գտնվում է ակնթարթորեն՝ օգտագործելով «Ոսկե հատման» (1.618) մաթեմատիկական հաստատունը վայրկյանի միլիոներորդական մասում:" },
      slow: { title: "Կրկնվող Ռեկուրսիա", desc: "Ամեն մի թիվ գտնելու համար համակարգիչը հետ է գնում և զրոյից հաշվում նախորդները: Հանգեցնում է ռեսուրսների ահռելի վատնման:" }
    }
  };

  const activeExplanation = explanations[Object.keys(explanations).find(k => safeSlug.includes(k))] || explanations.combinations;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '40px 20px', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .panel { background: white; border-radius: 20px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-bottom: 30px; animation: fadeIn 0.4s ease-in-out; }
        .btn-main { background: #4f46e5; color: white; padding: 12px 24px; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; transition: 0.2s;}
        .btn-main:hover { background: #4338ca; }
        .btn-outline { background: white; color: #4f46e5; border: 2px solid #4f46e5; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 600; margin-left: 10px; transition: 0.2s;}
        .btn-outline:hover { background: #f8fafc; }
        
        /* Էջանցման դիզայն */
        .nav-tabs { display: flex; gap: 15px; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; overflow-x: auto;}
        .nav-tab { padding: 10px 20px; font-weight: 700; color: #64748b; cursor: pointer; border-radius: 10px; transition: 0.3s; background: transparent; border: none; font-size: 16px;}
        .nav-tab:hover { background: #e0e7ff; color: #4f46e5; }
        .nav-tab.active { background: #4f46e5; color: white; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3); }

        .explanation-card { padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; }
        .matrix-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .matrix-table th, .matrix-table td { padding: 15px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .matrix-table th { background: #f8fafc; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 13px;}
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media print {
          body { background: white; padding: 0; }
          .no-print { display: none !important; }
          .panel { box-shadow: none; border: 1px solid #e2e8f0; break-inside: avoid; margin-bottom: 20px; padding: 15px;}
        }
      `}</style>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, paddingBottom:'5px', color: '#1e293b', fontWeight: 800 }}>Գիտական Լաբորատորիա 🔬</h1>
            <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Ալգորիթմների և տվյալների կառույցների վերլուծություն</p>
          </div>
          <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
            <span style={{ padding: '8px 15px', background: '#dcfce7', color: '#166534', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }}>🟢 Core Engine: Կայուն</span>
          </div>
        </div>

        {/* ՆԱՎԻԳԱՑԻՈՆ ՄԵՆՅՈՒ (TABS) */}
        <div className="nav-tabs no-print">
          <button className={`nav-tab ${activeTab === 'lab' ? 'active' : ''}`} onClick={() => setActiveTab('lab')}>
            🧮 Լաբորատորիա
          </button>
          <button className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            📈 Վիզուալիզացիա
          </button>
          <button className={`nav-tab ${activeTab === 'theory' ? 'active' : ''}`} onClick={() => setActiveTab('theory')}>
            📚 Տեսություն
          </button>
        </div>

        {/* ======================= ԷՋ 1: ԼԱԲՈՐԱՏՈՐԻԱ ======================= */}
        {activeTab === 'lab' && (
          <div>
            <div className="panel no-print" style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <label style={{display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px'}}>ԱԼԳՈՐԻԹՄ</label>
                <select className="btn-outline" style={{margin: 0, width: '220px'}} value={selectedAlgo} onChange={(e) => {
                  setSelectedAlgo(e.target.value);
                  const a = algorithms.find(x => x.slug === e.target.value);
                  if(a) initInputs(a.required_inputs);
                }}>
                  {algorithms.map(a => <option key={a.id} value={a.slug}>{a.title}</option>)}
                </select>
              </div>
              {Object.keys(inputs).map(k => (
                <div key={k}>
                  <label style={{display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px'}}>{k.toUpperCase()}</label>
                  <input type="number" className="btn-outline" style={{margin: 0, width: '90px'}} value={inputs[k]} onChange={(e) => setInputs({...inputs, [k]: e.target.value})} />
                </div>
              ))}
              <button className="btn-main" onClick={() => handleCalculate()} disabled={isLoading}>
                {isLoading ? '⏳ ...' : 'Հաշվել'}
              </button>
              <button className="btn-outline" onClick={runAutoBenchmark} disabled={isLoading}>🚀 Auto-Benchmark</button>
            </div>

            {results ? (
              <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', textAlign: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white' }}>
                <div style={{ flex: 1, padding: '10px' }}><p style={{ margin: '0 0 5px 0', color: '#94a3b8', fontSize: '14px' }}>Peak Memory (RAM)</p><h2 style={{ margin: 0, color: '#38bdf8' }}>{results.memory_kb} <span style={{fontSize:'16px'}}>KB</span></h2></div>
                <div style={{ flex: 1, padding: '10px', borderLeft: '1px solid #334155', borderRight: '1px solid #334155' }}><p style={{ margin: '0 0 5px 0', color: '#94a3b8', fontSize: '14px' }}>Ծառի Ճյուղեր</p><h2 style={{ margin: 0, color: '#f43f5e' }}>{results.steps?.toLocaleString()}</h2></div>
                <div style={{ flex: 1, padding: '10px' }}><p style={{ margin: '0 0 5px 0', color: '#94a3b8', fontSize: '14px' }}>Վերջնական Արդյունք</p><h2 style={{ margin: 0, color: '#10b981' }}>{results.result}</h2></div>
              </div>
            ) : (
              <div className="panel" style={{ textAlign: 'center', color: '#94a3b8', padding: '50px 20px' }}>
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '15px' }}>🖥️</span>
                <h3>Տվյալներ դեռ չկան</h3>
                <p>Մուտքագրեք արժեքներ վերևի վահանակում և սեղմեք «Հաշվել» կամ «Auto-Benchmark»:</p>
              </div>
            )}
          </div>
        )}

        {/* ======================= ԷՋ 2: ՎԻԶՈՒԱԼԻԶԱՑԻԱ ======================= */}
        {activeTab === 'analytics' && (
          <div className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Ժամանակային (Տ) Բարդության Գրաֆիկ</h3>
              <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-outline" style={{borderColor: '#64748b', color: '#475569', margin: 0}} onClick={generatePDF}>📄 Զեկույց (PDF)</button>
                <button className="btn-outline" style={{borderColor: '#10b981', color: '#10b981', margin: 0}} onClick={exportToCSV}>📥 Տվյալներ (CSV)</button>
              </div>
            </div>
            
            {historyData.length > 0 ? (
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="n" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Օպտիմալ" stroke="#10b981" strokeWidth={3} dot={false} />
                    <Line connectNulls={false} type="monotone" dataKey="Ոչ Օպտիմալ" stroke="#ef4444" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
               <div style={{ textAlign: 'center', color: '#94a3b8', padding: '50px 20px' }}>
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '15px' }}>📊</span>
                <p>Գրաֆիկը կկառուցվի հաշվարկներն սկսելուց հետո:</p>
              </div>
            )}
          </div>
        )}

        {/* ======================= ԷՋ 3: ՏԵՍՈՒԹՅՈՒՆ ======================= */}
        {activeTab === 'theory' && (
          <div>
            <div className="panel">
              <h3 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>Ճարտարապետական Վերլուծություն</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div className="explanation-card" style={{ background: '#f0fdf4', borderLeft: '4px solid #10b981' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px' }}><span>⚡</span> {activeExplanation.fast.title}</h4>
                  <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: '1.6' }}>{activeExplanation.fast.desc}</p>
                </div>
                <div className="explanation-card" style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}><span>🐌</span> {activeExplanation.slow.title}</h4>
                  <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: '1.6' }}>{activeExplanation.slow.desc}</p>
                </div>
              </div>
            </div>

            <div className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#1e293b' }}>Ասիմպտոտիկ Բարդության Մատրիցա (Big-O)</h3>
                <button className="btn-outline no-print" style={{borderColor: '#64748b', color: '#475569', margin: 0}} onClick={generatePDF}>📄 Տպել</button>
              </div>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Ակադեմիական տեղեկատու տարբեր ալգորիթմների տեսական սահմանների վերաբերյալ։</p>
              <div style={{ overflowX: 'auto' }}>
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th>Ալգորիթմ</th>
                      <th>Մեթոդ</th>
                      <th>Ժամանակային Բարդություն</th>
                      <th>Հիշողություն (Space)</th>
                      <th>Արդյունավետություն</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Ֆիբոնաչի</strong></td>
                      <td>Բինեի բանաձև</td>
                      <td style={{ color: '#10b981', fontWeight: 'bold' }}>O(1)</td>
                      <td style={{ color: '#10b981', fontWeight: 'bold' }}>O(1)</td>
                      <td>Գերազանց</td>
                    </tr>
                    <tr>
                      <td><strong>Ֆիբոնաչի</strong></td>
                      <td>Ռեկուրսիա</td>
                      <td style={{ color: '#ef4444', fontWeight: 'bold' }}>O(2^n)</td>
                      <td style={{ color: '#f59e0b', fontWeight: 'bold' }}>O(n)</td>
                      <td>Անընդունելի մեծ թվերի համար</td>
                    </tr>
                    <tr>
                      <td><strong>Ֆակտորիալ</strong></td>
                      <td>Գծային ցիկլ</td>
                      <td style={{ color: '#f59e0b', fontWeight: 'bold' }}>O(n)</td>
                      <td style={{ color: '#10b981', fontWeight: 'bold' }}>O(1)</td>
                      <td>Լավ</td>
                    </tr>
                    <tr>
                      <td><strong>Զուգորդություն</strong></td>
                      <td>Դինամիկ / Բանաձևային</td>
                      <td style={{ color: '#f59e0b', fontWeight: 'bold' }}>O(n)</td>
                      <td style={{ color: '#10b981', fontWeight: 'bold' }}>O(1)</td>
                      <td>Լավ</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;