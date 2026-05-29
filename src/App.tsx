import { useState } from 'react';
import { Header } from './components/Header';
import { ImportPanel } from './components/ImportPanel';
import { PicklistView } from './components/PicklistView';
import { usePicklist } from './hooks/usePicklist';

export default function App() {
  const [year, setYear] = useState(2025);
  const [loading, setLoading] = useState(false);
  const { teams, addTeams, removeTeam, reorderTeams, resetToEPARanking, clearAll } = usePicklist(year);

  const handleImport = async (input: string) => {
    setLoading(true);
    try {
      await addTeams(input);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    clearAll();
  };

  const loadedTeams = teams.filter(t => !t.loading && !t.error);

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f23' }}>
      <Header teamCount={teams.length} year={year} onYearChange={handleYearChange} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Sidebar */}
          <div style={{ width: '280px', flexShrink: 0 }}>
            <div style={{ position: 'sticky', top: '80px' }}>
              <ImportPanel onImport={handleImport} loading={loading} />

              {teams.length > 0 && (
                <div
                  style={{
                    background: '#16162a',
                    border: '1px solid #252542',
                    borderRadius: '16px',
                    marginTop: '16px',
                    padding: '16px',
                  }}
                >
                  <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '12px', margin: '0 0 12px' }}>
                    Summary
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#9ca3af' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total teams</span>
                      <span style={{ color: '#fff', fontWeight: 500 }}>{teams.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Loaded</span>
                      <span style={{ color: '#22c55e', fontWeight: 500 }}>{loadedTeams.length}</span>
                    </div>
                    {teams.some(t => t.loading) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Loading</span>
                        <span style={{ color: '#f59e0b', fontWeight: 500 }}>
                          {teams.filter(t => t.loading).length}
                        </span>
                      </div>
                    )}
                    {teams.some(t => t.error) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Errors</span>
                        <span style={{ color: '#ef4444', fontWeight: 500 }}>
                          {teams.filter(t => t.error).length}
                        </span>
                      </div>
                    )}
                    {loadedTeams.length > 0 && (
                      <>
                        <div style={{ borderTop: '1px solid #252542', paddingTop: '8px', marginTop: '4px' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Top EPA</span>
                          <span style={{ color: '#a78bfa', fontWeight: 500 }}>
                            {Math.max(...loadedTeams.map(t => t.epaTotal)).toFixed(1)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Avg EPA</span>
                          <span style={{ color: '#fff', fontWeight: 500 }}>
                            {(loadedTeams.reduce((s, t) => s + t.epaTotal, 0) / loadedTeams.length).toFixed(1)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <PicklistView
              teams={teams}
              onRemove={removeTeam}
              onReorder={reorderTeams}
              onResetRanking={resetToEPARanking}
              onClearAll={clearAll}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
