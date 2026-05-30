import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImportPanel } from './components/ImportPanel';
import { PicklistView } from './components/PicklistView';
import { SavedPicklistsPanel } from './components/SavedPicklistsPanel';
import { usePicklist } from './hooks/usePicklist';
import { usePicklistStorage } from './hooks/usePicklistStorage';
import type { SavedPicklist } from './types';

export default function App() {
  const [year, setYear] = useState(2026);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const { teams, setTeams, addTeams, removeTeam, cyclePicked, reorderTeams, resetToEPARanking, clearAll } =
    usePicklist(year);
  const { saved, savePicklist, updatePicklist, deletePicklist } = usePicklistStorage();

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
    setActiveId(null);
  };

  const handleSave = useCallback((name: string) => {
    const id = savePicklist(name, year, teams);
    setActiveId(id);
  }, [savePicklist, year, teams]);

  const handleUpdate = useCallback((id: string) => {
    const entry = saved.find(p => p.id === id);
    updatePicklist(id, entry?.name ?? 'Untitled', year, teams);
  }, [updatePicklist, saved, year, teams]);

  const handleLoad = useCallback((picklist: SavedPicklist) => {
    setYear(picklist.year);
    setTeams(picklist.teams);
    setActiveId(picklist.id);
  }, [setTeams]);

  const handleDelete = useCallback((id: string) => {
    deletePicklist(id);
    if (activeId === id) setActiveId(null);
  }, [deletePicklist, activeId]);

  const loadedTeams = teams.filter(t => !t.loading && !t.error);
  const draftedCount = teams.filter(t => t.pickedCount > 0).length;
  const availableCount = loadedTeams.filter(t => t.pickedCount === 0).length;

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f23' }}>
      <Header teamCount={teams.length} year={year} onYearChange={handleYearChange} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Sidebar */}
          <div style={{ width: '280px', flexShrink: 0 }}>
            <div style={{ position: 'sticky', top: '80px', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
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
                  <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 600, margin: '0 0 12px' }}>
                    Summary
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#9ca3af' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total teams</span>
                      <span style={{ color: '#fff', fontWeight: 500 }}>{teams.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Available</span>
                      <span style={{ color: '#22c55e', fontWeight: 500 }}>{availableCount}</span>
                    </div>
                    {draftedCount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Picked</span>
                        <span style={{ color: '#6b7280', fontWeight: 500 }}>{draftedCount}</span>
                      </div>
                    )}
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

              <SavedPicklistsPanel
                saved={saved}
                currentTeams={teams}
                activeId={activeId}
                onSave={handleSave}
                onUpdate={handleUpdate}
                onLoad={handleLoad}
                onDelete={handleDelete}
              />
            </div>
          </div>

          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <PicklistView
              teams={teams}
              onRemove={removeTeam}
              onCyclePicked={(num, dpMode) => cyclePicked(num, dpMode)}
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
