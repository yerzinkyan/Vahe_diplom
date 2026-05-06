import React, { useState, useEffect } from 'react';
import './UserProfile.css'; // ՆՈՐ CSS ՖԱՅԼԻ ՄԻԱՑՈՒՄ

export default function UserProfile({ dark, user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSolution, setSelectedSolution] = useState(null);

  const panelBg = dark ? '#1e293b' : 'white';
  const textColor = dark ? '#f1f5f9' : '#1e293b';
  const borderColor = dark ? '#334155' : '#e2e8f0';

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch('http://127.0.0.1:8000/api/profile-stats/', { 
          credentials: 'include' 
        });
        
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

  if (loading) {
    return <div className="profile-loading">Բեռնվում է...</div>;
  }

  if (error === "stats_auth_error" || !stats) {
    return (
      <div 
        className="profile-restricted"
        style={{ background: panelBg, border: `1px solid ${borderColor}` }}
      >
        <h2 style={{ color: textColor, marginBottom: '20px' }}>🔒 Մուտքը սահմանափակ է</h2>
        <p>Պրոֆիլի տվյալները և վիճակագրությունը տեսնելու համար խնդրում ենք նախ մուտք գործել համակարգ:</p>
      </div>
    );
  }

  const percentage = Math.round((stats.global_progress.solved / stats.global_progress.total) * 100) || 0;
  const strokeDasharray = `${percentage} ${100 - percentage}`;

  return (
    <div className="fade-in profile-container">
      
      {/* HEADER: USER INFO */}
      <div className="profile-header">
        <div className="profile-header-left">
          <div className="profile-svg-wrapper">
            <svg className="profile-svg" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
              <circle 
                cx="18" cy="18" r="16" 
                fill="none" 
                stroke="white" 
                strokeWidth="3" 
                strokeDasharray={strokeDasharray} 
                strokeDashoffset="0" 
                strokeLinecap="round" 
                style={{ transition: 'stroke-dasharray 1s ease' }} 
              />
            </svg>
            <div className="profile-percentage">
              <div>{percentage}%</div>
            </div>
          </div>
          
          <div>
            <h1 className="profile-username">
               <span style={{ fontSize: '28px' }}>👤</span> {stats.user_info.username}
            </h1>
            <p className="profile-rank">
              Կարգավիճակ՝ <strong>{stats.user_info.rank}</strong>
            </p>
            <p className="profile-date">
              Հարթակում է սկսած՝ {stats.user_info.date_joined}
            </p>
          </div>
        </div>

        <div className="profile-header-right">
          <div className="profile-solved-count">{stats.global_progress.solved}</div>
          <div className="profile-solved-label">ԼՈՒԾՎԱԾ ԽՆԴԻՐՆԵՐ</div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-col">
          
          {/* 📊 Ըստ բարդության */}
          <div className="profile-card" style={{ background: panelBg, border: `1px solid ${borderColor}` }}>
            <h3 className="profile-card-title" style={{ color: textColor }}>
              📊 Ըստ բարդության
            </h3>
            
            {Object.entries(stats.difficulty_stats).map(([level, data]) => {
              const levelColor = level === 'Easy' ? '#10b981' : (level === 'Medium' ? '#f59e0b' : '#ef4444');
              return (
                <div key={level} className="diff-row">
                  <div className="diff-labels">
                    <span style={{ fontWeight: 'bold', color: levelColor }}>{level}</span>
                    <span className="diff-count">{data.solved} / {data.total}</span>
                  </div>
                  <div className="diff-bar-bg" style={{ background: dark ? '#0f172a' : '#f1f5f9' }}>
                    <div 
                      className="diff-bar-fill"
                      style={{ 
                        width: `${(data.solved / data.total) * 100 || 0}%`, 
                        background: levelColor 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 📂 Ըստ թեմաների */}
          <div className="profile-card" style={{ background: panelBg, border: `1px solid ${borderColor}` }}>
            <h3 className="profile-card-title" style={{ color: textColor }}>
              📂 Ըստ թեմաների
            </h3>
            
            {Object.entries(stats.topic_stats).map(([topic, data]) => (
              <div 
                key={topic} 
                className="topic-row"
                style={{ borderBottom: `1px solid ${borderColor}` }}
              >
                <span style={{ color: textColor }}>{topic}</span>
                <span className="topic-count">{data.solved} / {data.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 🕒 Վերջին ակտիվությունը */}
        <div className="profile-card" style={{ background: panelBg, border: `1px solid ${borderColor}` }}>
          <h3 className="profile-card-title" style={{ color: textColor }}>
            🕒 Վերջին ակտիվությունը
          </h3>
          
          <div className="activity-list">
            {stats.recent_activity.length > 0 ? (
              stats.recent_activity.map((activity, idx) => (
                <div 
                  key={idx} 
                  className="activity-item"
                  style={{ background: dark ? '#0f172a' : '#f8fafc', border: `1px solid ${borderColor}` }}
                >
                  <div>
                    <div className="activity-title" style={{ color: textColor }}>
                      {activity.title}
                    </div>
                    <div className="activity-meta">
                      {activity.topic} • {activity.solved_at}
                    </div>
                  </div>
                  <button className="btn-view-code" onClick={() => setSelectedSolution(activity)}>
                    Դիտել կոդը
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">Դեռևս լուծված խնդիրներ չկան:</div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL FOR CODE VIEWING */}
      {selectedSolution && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ background: panelBg }}>
            <div 
              className="modal-header"
              style={{ borderBottom: `1px solid ${borderColor}`, background: dark ? '#1e293b' : '#f8fafc' }}
            >
              <h3 className="modal-title" style={{ color: textColor }}>
                {selectedSolution.title} — Իմ Լուծումը
              </h3>
              <button className="btn-close" onClick={() => setSelectedSolution(null)}>
                &times;
              </button>
            </div>
            <pre className="code-preview">
              {selectedSolution.solution_code}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}