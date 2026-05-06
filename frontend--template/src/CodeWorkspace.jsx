import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import UserProfile from './UserProfile';
import './CodeWorkspace.css'; // ՆՈՐ CSS ՖԱՅԼԻ ՄԻԱՑՈՒՄ

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
        const authRes = await fetch('http://127.0.0.1:8000/api/check-auth/', { 
          credentials: 'include' 
        });
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
      const res = await fetch('http://127.0.0.1:8000/api/problems/', { 
        credentials: 'include' 
      });
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
        body: JSON.stringify({ 
          code: code, 
          problem_slug: selectedProblem.slug 
        })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setOutput(`${data.output}\n\n[📊 ՉԱՓԱԳՐՈՒՄ]\n⏱ Ժամանակ: ${data.time_ms} ms\n💾 Հիշողություն: ${data.memory_kb} KB`);
        
        if (data.output.includes("ԲԱՐԵՀԱՋՈՂ ԱՆՑԱՆ")) {
          setProblems(prev => prev.map(p => 
            p.id === selectedProblem.id ? { ...p, is_solved: true, saved_code: code } : p
          ));
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
    <div className="fade-in cw-container">
      
      {/* Header */}
      <div className="cw-header" style={{ background: panelBg, border: `1px solid ${borderColor}` }}>
        <div className="cw-header-left">
          <h2 className="cw-title" style={{ color: textColor }}>
            <span className="cw-title-icon">🧪</span> Լաբորատորիա
          </h2>

          <div className="cw-nav-group" style={{ background: dark ? '#0f172a' : '#f1f5f9' }}>
            <button 
              className="cw-nav-btn"
              onClick={() => setActivePage('lab')}
              style={{ 
                background: activePage === 'lab' ? '#3b82f6' : 'transparent', 
                color: activePage === 'lab' ? 'white' : '#64748b'
              }}
            >
              💻 Կոդավորում
            </button>
            <button 
              className="cw-nav-btn"
              onClick={() => setActivePage('profile')}
              style={{ 
                background: activePage === 'profile' ? '#3b82f6' : 'transparent', 
                color: activePage === 'profile' ? 'white' : '#64748b'
              }}
            >
              👤 Իմ Պրոֆիլը
            </button>
          </div>
        </div>
        
        <div className="cw-header-right">
          {activePage === 'lab' && (
            <select 
              className="input-box cw-select" 
              value={selectedProblem?.id || ''}
              onChange={(e) => handleSelectProblem(problems.find(p => p.id === parseInt(e.target.value)))}
              style={{ 
                background: dark ? '#0f172a' : '#f8fafc', 
                color: textColor, 
                border: `1px solid ${borderColor}`
              }}
            >
              {Object.entries(groupedProblems).map(([name, list]) => (
                <optgroup key={name} label={`📂 ${name}`}>
                  {list.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.is_solved ? '✅' : '📄'} &nbsp;{p.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}

          {user ? (
            <div className="cw-user-badge" style={{ background: dark ? '#0f172a' : '#f1f5f9', border: `1px solid ${borderColor}` }}>
              <span className="cw-user-name">{user}</span>
              <button className="cw-logout-btn" onClick={handleLogout}>Ելք</button>
            </div>
          ) : (
            <button 
              className="cw-login-btn"
              onClick={() => {
                setShowAuthModal(true); 
                setAuthStep('choice');
              }} 
            >
              Մուտք
            </button>
          )}

          {activePage === 'lab' && (
            <button 
              className="cw-run-btn" 
              onClick={handleRunCode} 
              disabled={isRunning} 
              style={{ background: isRunning ? '#64748b' : '#10b981' }}
            >
              {isRunning ? '⏱...' : '▶ Գործարկել'}
            </button>
          )}
        </div>
      </div>

      <div className="cw-main-area">
        {activePage === 'lab' ? (
          <div className="cw-lab-grid">
            
            {/* Left Panel */}
            <div className="cw-left-panel" style={{ background: panelBg, border: `1px solid ${borderColor}` }}>
              <div className="cw-tabs-header" style={{ background: dark ? '#0f172a' : '#f8fafc', borderBottom: `1px solid ${borderColor}` }}>
                <button 
                  className="cw-tab-btn"
                  onClick={() => setActiveTab('description')} 
                  style={{ 
                    background: activeTab === 'description' ? panelBg : 'transparent', 
                    color: activeTab === 'description' ? '#3b82f6' : '#64748b', 
                    borderBottom: activeTab === 'description' ? '2px solid #3b82f6' : '2px solid transparent' 
                  }}
                >
                  📝 Նկարագրություն
                </button>
                <button 
                  className="cw-tab-btn"
                  onClick={() => setActiveTab('testcases')} 
                  style={{ 
                    background: activeTab === 'testcases' ? panelBg : 'transparent', 
                    color: activeTab === 'testcases' ? '#3b82f6' : '#64748b', 
                    borderBottom: activeTab === 'testcases' ? '2px solid #3b82f6' : '2px solid transparent' 
                  }}
                >
                  🔍 Թեստեր ({selectedProblem?.test_cases?.length || 0})
                </button>
              </div>

              <div className="cw-panel-content">
                {selectedProblem ? (
                  activeTab === 'description' ? (
                    <div className="cw-problem-desc" style={{ color: textColor }}>
                      <style>{`
                        .cw-problem-desc pre {
                            white-space: pre-wrap !important;
                            word-break: break-word !important;
                            background-color: ${dark ? '#0f172a' : '#f8fafc'} !important;
                            padding: 15px !important;
                            border-radius: 10px !important;
                            border: 1px solid ${borderColor} !important;
                            font-family: monospace;
                        }
                      `}</style>
                      <h2 className="cw-problem-title" style={{ borderBottom: `1px solid ${borderColor}` }}>
                        {selectedProblem.title}
                      </h2>
                      <div dangerouslySetInnerHTML={{ __html: selectedProblem.description }} />
                      
                      <div className="cw-constraints-box" style={{ background: dark ? '#0f172a' : '#f1f5f9', border: `1px solid ${borderColor}` }}>
                        <h4 className="cw-constraints-title">⚠️ Սահմանափակումներ:</h4>
                        <div className="cw-constraints-code" dangerouslySetInnerHTML={{ __html: selectedProblem.constraints }} />
                      </div>
                    </div>
                  ) : (
                    <div className="cw-tests-container">
                      <div className="cw-test-buttons">
                        {selectedProblem.test_cases.map((_, idx) => (
                          <button 
                            key={idx} 
                            className="cw-test-btn"
                            onClick={() => setActiveTestIndex(idx)} 
                            style={{ 
                              border: `1px solid ${activeTestIndex === idx ? '#3b82f6' : borderColor}`, 
                              background: activeTestIndex === idx ? '#3b82f615' : 'transparent', 
                              color: activeTestIndex === idx ? '#3b82f6' : '#64748b'
                            }}
                          >
                            Թեստ {idx + 1}
                          </button>
                        ))}
                      </div>
                      
                      <div className="cw-test-details" style={{ background: dark ? '#0f172a' : '#f8fafc', border: `1px solid ${borderColor}` }}>
                        <div>
                          <span className="cw-test-label">ՄՈՒՏՔ (INPUT):</span>
                          <pre className="cw-test-pre" style={{ background: dark ? '#1e293b' : 'white', border: `1px solid ${borderColor}` }}>
                            {selectedProblem.test_cases[activeTestIndex].inputs}
                          </pre>
                        </div>
                        <div>
                          <span className="cw-test-label">ՍՊԱՍՎՈՂ (EXPECTED):</span>
                          <pre className="cw-test-pre expected" style={{ background: dark ? '#1e293b' : '#ecfdf5' }}>
                            {selectedProblem.test_cases[activeTestIndex].expected}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="cw-empty-state">Ընտրեք խնդիր...</div>
                )}
              </div>
            </div>

            {/* Right Panel */}
            <div className="cw-right-panel">
              <div className="cw-editor-container" style={{ background: panelBg, border: `1px solid ${borderColor}` }}>
                <div className="cw-panel-top-bar" style={{ borderBottom: `1px solid ${borderColor}`, background: dark ? '#0f172a' : '#f8fafc' }}>
                  <span className="cw-mac-dot red"></span>
                  <span className="cw-mac-dot yellow"></span>
                  <span className="cw-mac-dot green"></span>
                </div>
                <Editor 
                  height="100%" 
                  language="python" 
                  theme={dark ? 'vs-dark' : 'light'} 
                  value={code} 
                  onChange={(v) => setCode(v)} 
                  options={{ fontSize: 16, minimap: { enabled: false } }} 
                />
              </div>
              
              <div className="cw-terminal-container" style={{ background: panelBg, border: `1px solid ${borderColor}` }}>
                <div className="cw-terminal-header" style={{ borderBottom: `1px solid ${borderColor}`, background: dark ? '#0f172a' : '#f8fafc' }}>
                  ⌨️ Տերմինալ
                </div>
                <div className="cw-terminal-output">
                  {output || '> Սպասում է...'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <UserProfile dark={dark} user={user} key={user} />
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="cw-modal-overlay">
          <div className="cw-modal-content" style={{ background: panelBg, border: `1px solid ${borderColor}` }}>
            <h2 className="cw-modal-title" style={{ color: textColor }}>
              {authStep === 'choice' ? 'Բարի գալուստ 👋' : (authStep === 'login' ? 'Մուտք' : 'Գրանցում')}
            </h2>
            
            {authStep === 'choice' ? (
              <div className="cw-auth-choices">
                <button className="cw-auth-btn-primary" onClick={() => setAuthStep('login')}>Մուտք</button>
                <button className="cw-auth-btn-outline" onClick={() => setAuthStep('register')}>Գրանցվել</button>
                <button className="cw-auth-btn-ghost" onClick={() => setShowAuthModal(false)}>Շարունակել որպես հյուր</button>
              </div>
            ) : (
              <form className="cw-auth-form" onSubmit={(e) => handleAuthSubmit(e, authStep)}>
                <input 
                  type="text" 
                  className="cw-auth-input"
                  placeholder="Մուտքանուն" 
                  value={authForm.username} 
                  onChange={(e) => setAuthForm({...authForm, username: e.target.value})} 
                  style={{ border: `1px solid ${borderColor}`, background: dark ? '#0f172a' : 'white', color: textColor }} 
                  required 
                />
                <input 
                  type="password" 
                  className="cw-auth-input"
                  placeholder="Գաղտնաբառ" 
                  value={authForm.password} 
                  onChange={(e) => setAuthForm({...authForm, password: e.target.value})} 
                  style={{ border: `1px solid ${borderColor}`, background: dark ? '#0f172a' : 'white', color: textColor }} 
                  required 
                />
                <div className="cw-auth-actions">
                  <button type="button" className="cw-auth-back" onClick={() => setAuthStep('choice')}>Հետ</button>
                  <button type="submit" className="cw-auth-submit">{authStep === 'login' ? 'Մտնել' : 'Գրանցվել'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}