import React, { useState, useEffect } from 'react';

export default function UserProfile({ dark, user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSolution, setSelectedSolution] = useState(null);

  // Փոփոխականների սահմանումը հենց սկզբում, որպեսզի բոլոր return-ները տեսնեն դրանք
  const panelBg = dark ? '#1e293b' : 'white';
  const textColor = dark ? '#f1f5f9' : '#1e293b';
  const borderColor = dark ? '#334155' : '#e2e8f0';

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://127.0.0.1:8000/api/profile-stats/', { credentials: 'include' });
        
        if (res.status === 401) {
          setError("stats_auth_error");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Վիճակագրության բեռնման սխալ:", err);
        setError("server_error");
      }
      setLoading(false);
    };
    fetchStats();
  }, [user]);

  // 1. Բեռնման վիճակ
  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px', color: '#64748b' }}>Բեռնվում է...</div>;

  // 2. Ավտորիզացիայի սխալ (401) կամ տվյալների բացակայություն
  if (error === "stats_auth_error" || !stats) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', padding: '60px', background: panelBg, borderRadius: '24px', border: `1px solid ${borderColor}`, maxWidth: '800px', margin: '100px auto' }}>
        <h2 style={{ color: textColor, marginBottom: '20px' }}>🔒 Մուտքը սահմանափակ է</h2>
        <p style={{ color: '#64748b', fontSize: '16px' }}>Պրոֆիլի տվյալները և վիճակագրությունը տեսնելու համար խնդրում ենք նախ մուտք գործել համակարգ:</p>
      </div>
    );
  }

  // 3. Գրաֆիկի հաշվարկ (Միայն եթե stats-ը կա)
  const percentage = Math.round((stats.global_progress.solved / stats.global_progress.total) * 100) || 0;
  const strokeDasharray = `${percentage} ${100 - percentage}`;

  return (
    <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px', paddingBottom: '50px' }}>
      
      {/* HEADER: USER INFO */}
      <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '40px', borderRadius: '24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
              <circle cx="18" cy="18" r="16" fill="none" stroke="white" strokeWidth="3" strokeDasharray={strokeDasharray} strokeDashoffset="0" strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{percentage}%</div>
            </div>
          </div>
          
          <div>
            <h1 style={{ margin: 0, fontSize: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <span style={{ fontSize: '28px' }}>👤</span> {stats.user_info.username}
            </h1>
            <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '18px' }}>Կարգավիճակ՝ <strong>{stats.user_info.rank}</strong></p>
            <p style={{ margin: '5px 0 0 0', opacity: 0.7, fontSize: '14px' }}>Հարթակում է սկսած՝ {stats.user_info.date_joined}</p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '56px', fontWeight: 'bold', lineHeight: '1' }}>{stats.global_progress.solved}</div>
          <div style={{ fontSize: '14px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '2px', marginTop: '5px' }}>ԼՈՒԾՎԱԾ ԽՆԴԻՐՆԵՐ</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* 📊 Ըստ բարդության */}
          <div style={{ background: panelBg, padding: '30px', borderRadius: '20px', border: `1px solid ${borderColor}`, boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '25px', color: textColor, display: 'flex', alignItems: 'center', gap: '10px' }}>📊 Ըստ բարդության</h3>
            {Object.entries(stats.difficulty_stats).map(([level, data]) => (
              <div key={level} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                  <span style={{ fontWeight: 'bold', color: level === 'Easy' ? '#10b981' : (level === 'Medium' ? '#f59e0b' : '#ef4444') }}>{level}</span>
                  <span style={{ color: '#64748b' }}>{data.solved} / {data.total}</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: dark ? '#0f172a' : '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${(data.solved / data.total) * 100 || 0}%`, height: '100%', background: level === 'Easy' ? '#10b981' : (level === 'Medium' ? '#f59e0b' : '#ef4444'), transition: 'width 1s ease-in-out' }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* 📂 Ըստ թեմաների */}
          <div style={{ background: panelBg, padding: '30px', borderRadius: '20px', border: `1px solid ${borderColor}`, boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '25px', color: textColor, display: 'flex', alignItems: 'center', gap: '10px' }}>📂 Ըստ թեմաների</h3>
            {Object.entries(stats.topic_stats).map(([topic, data]) => (
              <div key={topic} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${borderColor}`, fontSize: '15px' }}>
                <span style={{ color: textColor }}>{topic}</span>
                <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{data.solved} / {data.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 🕒 Վերջին ակտիվությունը */}
        <div style={{ background: panelBg, padding: '30px', borderRadius: '20px', border: `1px solid ${borderColor}`, boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '25px', color: textColor, display: 'flex', alignItems: 'center', gap: '10px' }}>🕒 Վերջին ակտիվությունը</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {stats.recent_activity.length > 0 ? stats.recent_activity.map((activity, idx) => (
              <div key={idx} style={{ padding: '20px', borderRadius: '16px', background: dark ? '#0f172a' : '#f8fafc', border: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: textColor, fontSize: '16px', marginBottom: '6px' }}>{activity.title}</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>{activity.topic} • {activity.solved_at}</div>
                </div>
                <button onClick={() => setSelectedSolution(activity)} style={{ background: '#3b82f615', color: '#3b82f6', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Դիտել կոդը</button>
              </div>
            )) : (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '60px', fontSize: '16px' }}>Դեռևս լուծված խնդիրներ չկան:</div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL FOR CODE VIEWING */}
      {selectedSolution && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: panelBg, width: '100%', maxWidth: '900px', maxHeight: '85vh', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '20px 30px', borderBottom: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: dark ? '#1e293b' : '#f8fafc' }}>
              <h3 style={{ margin: 0, color: textColor }}>{selectedSolution.title} — Իմ Լուծումը</h3>
              <button onClick={() => setSelectedSolution(null)} style={{ background: '#ef444420', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: '#ef4444', cursor: 'pointer', fontSize: '20px' }}>&times;</button>
            </div>
            <pre style={{ flex: 1, margin: 0, padding: '30px', overflow: 'auto', background: '#0f172a', color: '#38bdf8', fontFamily: 'monospace', fontSize: '15px', lineHeight: '1.7', textAlign: 'left' }}>
              {selectedSolution.solution_code}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}