import { useState } from 'react';
import { Save, FolderOpen, Trash2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import type { SavedPicklist, PicklistTeam } from '../types';

interface SavedPicklistsPanelProps {
  saved: SavedPicklist[];
  currentTeams: PicklistTeam[];
  activeId: string | null;
  onSave: (name: string) => void;
  onUpdate: (id: string) => void;
  onLoad: (picklist: SavedPicklist) => void;
  onDelete: (id: string) => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function SavedPicklistsPanel({
  saved,
  currentTeams,
  activeId,
  onSave,
  onUpdate,
  onLoad,
  onDelete,
}: SavedPicklistsPanelProps) {
  const [name, setName] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSave = () => {
    onSave(name);
    setName('');
  };

  const loadedCount = currentTeams.filter(t => !t.loading && !t.error).length;

  return (
    <div
      style={{
        background: '#16162a',
        border: '1px solid #252542',
        borderRadius: '16px',
        marginTop: '16px',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={14} style={{ color: '#8b5cf6' }} />
          Saved Picklists
          {saved.length > 0 && (
            <span style={{ background: '#252542', color: '#9ca3af', borderRadius: '10px', fontSize: '11px', padding: '1px 7px' }}>
              {saved.length}
            </span>
          )}
        </span>
        {collapsed
          ? <ChevronDown size={14} style={{ color: '#6b7280' }} />
          : <ChevronUp size={14} style={{ color: '#6b7280' }} />
        }
      </button>

      {!collapsed && (
        <div style={{ padding: '0 16px 16px' }}>
          {/* Save / Update controls */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadedCount > 0 && handleSave()}
              placeholder="Picklist name…"
              style={{
                flex: 1,
                background: '#0f0f23',
                border: '1px solid #252542',
                color: '#e2e8f0',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '13px',
                outline: 'none',
                minWidth: 0,
              }}
            />
            <button
              onClick={handleSave}
              disabled={loadedCount === 0}
              title="Save as new picklist"
              style={{
                background: loadedCount > 0 ? 'linear-gradient(135deg, #7c3aed, #3b82f6)' : '#252542',
                color: loadedCount > 0 ? '#fff' : '#4b5563',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: loadedCount > 0 ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              Save
            </button>
            {activeId && (
              <button
                onClick={() => onUpdate(activeId)}
                title="Overwrite current saved picklist"
                style={{
                  background: '#1e1e35',
                  color: '#a78bfa',
                  border: '1px solid #3b2f6e',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                Update
              </button>
            )}
          </div>

          {/* Saved list */}
          {saved.length === 0 ? (
            <p style={{ color: '#4b5563', fontSize: '12px', textAlign: 'center', padding: '8px 0' }}>
              No saved picklists yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {saved.map(p => (
                <div
                  key={p.id}
                  style={{
                    background: p.id === activeId ? 'rgba(124,58,237,0.1)' : '#0f0f23',
                    border: `1px solid ${p.id === activeId ? 'rgba(139,92,246,0.4)' : '#1e1e35'}`,
                    borderRadius: '10px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: p.id === activeId ? '#a78bfa' : '#e2e8f0', fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </div>
                    <div style={{ color: '#4b5563', fontSize: '11px', display: 'flex', gap: '6px', marginTop: '2px' }}>
                      <span>{p.teams.filter(t => !t.loading && !t.error).length} teams</span>
                      <span>·</span>
                      <span>{p.year}</span>
                      <span>·</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={10} />
                        {timeAgo(p.savedAt)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onLoad(p)}
                    title="Load this picklist"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '2px' }}
                    className="hover:text-purple-400"
                  >
                    <FolderOpen size={14} />
                  </button>

                  {confirmDelete === p.id ? (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => { onDelete(p.id); setConfirmDelete(null); }}
                        style={{ background: '#7f1d1d', border: 'none', borderRadius: '4px', color: '#fca5a5', cursor: 'pointer', fontSize: '10px', padding: '2px 6px' }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        style={{ background: '#1e1e35', border: 'none', borderRadius: '4px', color: '#9ca3af', cursor: 'pointer', fontSize: '10px', padding: '2px 6px' }}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(p.id)}
                      title="Delete"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: '2px' }}
                      className="hover:text-red-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
