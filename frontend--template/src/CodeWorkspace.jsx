import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import UserProfile from './UserProfile';

export default function CodeWorkspace({ dark }) {
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  
  const [activeTab, setActiveTab] = useState('description');
  const [activeTestIndex, setActiveTestIndex] = useState(0);

  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState('choice'); 
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [activePage, setActivePage] = useState('lab'); 

  useEffect(() => {
    const initialize = async () => {
      try {
        const authRes = await fetch('http://127.0.0.1:8000/api/check-auth/', { credentials: 'include' });
        const authData = await authRes.json();
        
        if (authData.is_authenticated) {
          setUser(authData.username);
        } else {
          setUser(null);
        }
        await fetchProblems();
      } catch (err) {
        console.error("Սերվերի հետ կապի խնդիր:", err);
      }
    };
    initialize();
  }, [user]);

  const fetchProblems = async (currentProblemId = null) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/problems/', { credentials: 'include' });
      const data = await res.json();
      setProblems(data);
      
      if (data.length > 0) {
        const targetId = currentProblemId || (selectedProblem ? selectedProblem.id : data[0].id);
        const freshProblem = data.find(p => p.id === targetId) || data[0];
        
        setSelectedProblem(freshProblem);
        setCode(freshProblem.saved_code || freshProblem.starter_code || '# Գրեք ձեր ալգորիթմը այստեղ\n');
      }
    } catch (err) {
      setOutput('❌ Չհաջողվեց բեռնել խնդիրները:');
    }
  };

  const handleSelectProblem = (problem) => {
    setSelectedProblem(problem);
    setCode(problem.saved_code || problem.starter_code || '# Գրեք ձեր ալգորիթմը այստեղ\n');
    setOutput('');
    setActiveTestIndex(0);
  };

  const handleRunCode = async () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    setOutput('Աշխատում է...');
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/execute/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: code, problem_slug: selectedProblem.slug })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setOutput(`${data.output}\n\n[📊 ՉԱՓԱԳՐՈՒՄ]\n⏱ Ժամանակ: ${data.time_ms} ms\n💾 Հիշողություն: ${data.memory_kb} KB`);
        if (data.output.includes("ԲԱՐԵՀԱՋՈՂ ԱՆՑԱՆ")) {
          setProblems(prev => prev.map(p => p.id === selectedProblem.id ? { ...p, is_solved: true, saved_code: code } : p));
          setSelectedProblem(prev => ({ ...prev, is_solved: true, saved_code: code }));
        }
      } else {
        setOutput(`❌ ՍԽԱԼ:\n\n${data.output}`);
      }
    } catch (err) {
      setOutput('❌ Սերվերի հետ կապի խափանում:');
    }
    setIsRunning(false);
  };

  const handleAuthSubmit = async (e, type) => {
    e.preventDefault();
    const endpoint = type === 'login' ? 'api/login/' : 'api/register/';
    try {
      const res = await fetch(`http://127.0.0.1:8000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setProblems([]); 
        setSelectedProblem(null);
        setCode('');
        setOutput('');
        setUser(data.username);
        setShowAuthModal(false);
        setAuthForm({ username: '', password: '' });
      } else {
        alert(data.message || 'Սխալ տվյալներ');
      }
    } catch (err) {
      alert('Սերվերի հետ կապի խնդիր:');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://127.0.0.1:8000/api/logout/', {
        method: 'POST',
        credentials: 'include'
      });
      setProblems([]);
      setSelectedProblem(null);
      setCode('');
      setOutput('');
      setUser(null); 
    } catch (err) {
      console.error('Ելքի սխալ:', err);
    }
  };

  const panelBg = dark ? '#1e293b' : 'white';
  const textColor = dark ? '#f1f5f9' : '#1e293b';
  const borderColor = dark ? '#334155' : '#e2e8f0';

  const groupedProblems = problems.reduce((groups, problem) => {
    const topic = problem.topic || 'Այլ Խնդիրներ';
    if (!groups[topic]) groups[topic] = [];
    groups[topic].push(problem);
    return groups;
  }, {});

  return (
    <div className="fade-in" style={{ maxWidth: '1250px', margin: '20px auto', minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: '30px', position: 'relative' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: panelBg, padding: '20px 30px', borderRadius: '16px', border: `1px solid ${borderColor}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
            <h2 style={{ margin: 0, color: textColor, fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '26px' }}>🧪</span> Լաբորատորիա
            </h2>

            <div style={{ display: 'flex', gap: '10px', marginLeft: '20px', background: dark ? '#0f172a' : '#f1f5f9', padding: '5px', borderRadius: '12px', marginRight: '15px' }}>
              <button 
                onClick={() => setActivePage('lab')}
                style={{ padding: '8px 15px', borderRadius: '8px', border: 'none', background: activePage === 'lab' ? '#3b82f6' : 'transparent', color: activePage === 'lab' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'}}
              >
                💻 Կոդավորում
              </button>
              <button 
                onClick={() => setActivePage('profile')}
                style={{ padding: '8px 15px', borderRadius: '8px', border: 'none', background: activePage === 'profile' ? '#3b82f6' : 'transparent', color: activePage === 'profile' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
              >
                👤 Իմ Պրոֆիլը
              </button>
            </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {activePage === 'lab' && (
              <select 
                  className="input-box" 
                  value={selectedProblem?.id || ''}
                  onChange={(e) => handleSelectProblem(problems.find(p => p.id === parseInt(e.target.value)))}
                  style={{ width: '280px', padding: '10px 15px', borderRadius: '10px', background: dark ? '#0f172a' : '#f8fafc', color: textColor, border: `1px solid ${borderColor}`, fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
              >
                  {Object.entries(groupedProblems).map(([name, list]) => (
                      <optgroup key={name} label={`📂 ${name}`}>
                          {list.map(p => (
                              <option key={p.id} value={p.id}>{p.is_solved ? '✅' : '📄'} &nbsp;{p.title}</option>
                          ))}
                      </optgroup>
                  ))}
              </select>
            )}

            {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: dark ? '#0f172a' : '#f1f5f9', padding: '6px 15px', borderRadius: '10px', border: `1px solid ${borderColor}` }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '14px' }}>{user}</span>
                    <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>Ելք</button>
                </div>
            ) : (
                <button onClick={() => {setShowAuthModal(true); setAuthStep('choice');}} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Մուտք</button>
            )}

            {activePage === 'lab' && (
              <button className="btn-main" onClick={handleRunCode} disabled={isRunning} style={{ background: isRunning ? '#64748b' : '#10b981', padding: '10px 25px', borderRadius: '10px', border: 'none', color: 'white', fontWeight: 'bold', cursor: isRunning ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
                  {isRunning ? '⏱...' : '▶ Գործարկել'}
              </button>
            )}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activePage === 'lab' ? (
          <div style={{ display: 'flex', gap: '30px', flex: 1, overflow: 'hidden' }}>
            <div style={{ flex: '1.2', background: panelBg, borderRadius: '16px', border: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', background: dark ? '#0f172a' : '#f8fafc', borderBottom: `1px solid ${borderColor}` }}>
                <button onClick={() => setActiveTab('description')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'description' ? panelBg : 'transparent', color: activeTab === 'description' ? '#3b82f6' : '#64748b', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', borderBottom: activeTab === 'description' ? '2px solid #3b82f6' : '2px solid transparent' }}>📝 Նկարագրություն</button>
                <button onClick={() => setActiveTab('testcases')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'testcases' ? panelBg : 'transparent', color: activeTab === 'testcases' ? '#3b82f6' : '#64748b', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', borderBottom: activeTab === 'testcases' ? '2px solid #3b82f6' : '2px solid transparent' }}>🔍 Թեստեր ({selectedProblem?.test_cases?.length || 0})</button>
              </div>

              <div style={{ padding: '25px', overflowY: 'auto', overflowX: 'hidden', flex: 1 }}>
                {selectedProblem ? (
                  activeTab === 'description' ? (
                    <div className="problem-description" style={{ textAlign: 'left', lineHeight: '1.7', fontSize: '16px', color: textColor }}>
                      <style>{`
                        .problem-description pre {
                            white-space: pre-wrap !important;
                            word-break: break-word !important;
                            background-color: ${dark ? '#0f172a' : '#f8fafc'} !important;
                            padding: 15px !important;
                            border-radius: 10px !important;
                            border: 1px solid ${borderColor} !important;
                            font-family: monospace;
                        }
                      `}</style>
                      <h2 style={{ marginTop: 0, marginBottom: '20px', borderBottom: `1px solid ${borderColor}`, paddingBottom: '15px' }}>{selectedProblem.title}</h2>
                      <div dangerouslySetInnerHTML={{ __html: selectedProblem.description }} />
                      <div style={{ marginTop: '30px', background: dark ? '#0f172a' : '#f1f5f9', padding: '20px', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
                        <h4 style={{ margin: '0 0 10px 0' }}>⚠️ Սահմանափակումներ:</h4>
                        <div style={{ fontFamily: 'monospace' }} dangerouslySetInnerHTML={{ __html: selectedProblem.constraints }} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {selectedProblem.test_cases.map((_, idx) => (
                          <button key={idx} onClick={() => setActiveTestIndex(idx)} style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${activeTestIndex === idx ? '#3b82f6' : borderColor}`, background: activeTestIndex === idx ? '#3b82f615' : 'transparent', color: activeTestIndex === idx ? '#3b82f6' : '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>Թեստ {idx + 1}</button>
                        ))}
                      </div>
                      <div style={{ background: dark ? '#0f172a' : '#f8fafc', padding: '20px', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
                        <div style={{ marginBottom: '15px' }}>
                          <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>ՄՈՒՏՔ (INPUT):</span>
                          <pre style={{ margin: '5px 0', padding: '12px', background: dark ? '#1e293b' : 'white', borderRadius: '8px', border: `1px solid ${borderColor}`, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{selectedProblem.test_cases[activeTestIndex].inputs}</pre>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>ՍՊԱՍՎՈՂ (EXPECTED):</span>
                          <pre style={{ margin: '5px 0', padding: '12px', background: dark ? '#1e293b' : '#ecfdf5', borderRadius: '8px', color: '#10b981', border: '1px solid #10b98144', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{selectedProblem.test_cases[activeTestIndex].expected}</pre>
                        </div>
                      </div>
                    </div>
                  )
                ) : <div style={{ textAlign: 'center', marginTop: '50px' }}>Ընտրեք խնդիր...</div>}
              </div>
            </div>

            <div style={{ flex: '1.8', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ flex: '1.4', background: panelBg, borderRadius: '16px', border: `1px solid ${borderColor}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ padding: '10px 20px', borderBottom: `1px solid ${borderColor}`, background: dark ? '#0f172a' : '#f8fafc', display: 'flex', gap: '8px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></span>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></span>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></span>
                </div>
                <Editor height="100%" language="python" theme={dark ? 'vs-dark' : 'light'} value={code} onChange={(v) => setCode(v)} options={{ fontSize: 16, minimap: { enabled: false } }} />
              </div>
              <div style={{ flex: '1', minHeight: '250px', background: panelBg, borderRadius: '16px', border: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '10px 20px', borderBottom: `1px solid ${borderColor}`, background: dark ? '#0f172a' : '#f8fafc', fontWeight: 'bold', fontSize: '13px', color: '#64748b' }}>⌨️ Տերմինալ</div>
                <div style={{ flex: '1', padding: '20px', background: '#0f172a', color: '#38bdf8', fontFamily: 'monospace', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>{output || '> Սպասում է...'}</div>
              </div>
            </div>
          </div>
        ) : (
          <UserProfile dark={dark} user={user} key={user} />
        )}
      </div>

      {showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: panelBg, padding: '40px', borderRadius: '20px', width: '350px', border: `1px solid ${borderColor}`, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <h2 style={{ textAlign: 'center', color: textColor }}>{authStep === 'choice' ? 'Բարի գալուստ 👋' : (authStep === 'login' ? 'Մուտք' : 'Գրանցում')}</h2>
            {authStep === 'choice' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <button onClick={() => setAuthStep('login')} style={{ padding: '12px', borderRadius: '10px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Մուտք</button>
                <button onClick={() => setAuthStep('register')} style={{ padding: '12px', borderRadius: '10px', border: `2px solid #3b82f6`, background: 'transparent', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer' }}>Գրանցվել</button>
                <button onClick={() => setShowAuthModal(false)} style={{ padding: '10px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>Շարունակել որպես հյուր</button>
              </div>
            ) : (
              <form onSubmit={(e) => handleAuthSubmit(e, authStep)} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <input type="text" placeholder="Մուտքանուն" value={authForm.username} onChange={(e) => setAuthForm({...authForm, username: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: dark ? '#0f172a' : 'white', color: textColor }} required />
                <input type="password" placeholder="Գաղտնաբառ" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: dark ? '#0f172a' : 'white', color: textColor }} required />
                <div style={{ display: 'flex', gap: '10px' }}>
                  {/* ԱՅՍՏԵՂ ԱՎԵԼԱՑՐԻՆՔ CURSOR: POINTER */}
                  <button type="button" onClick={() => setAuthStep('choice')} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#64748b', color: 'white', border: 'none', cursor: 'pointer' }}>Հետ</button>
                  <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#10b981', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{authStep === 'login' ? 'Մտնել' : 'Գրանցվել'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}