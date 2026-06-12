import { useState } from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';

interface ApiKeyPanelProps {
  apiKey: string;
  onChange: (key: string) => void;
}

export function ApiKeyPanel({ apiKey, onChange }: ApiKeyPanelProps) {
  const [editing, setEditing] = useState(!apiKey);
  const [draft, setDraft] = useState(apiKey);
  const [show, setShow] = useState(false);

  const handleSave = () => {
    onChange(draft.trim());
    setEditing(false);
  };

  const masked = apiKey ? '•'.repeat(Math.min(apiKey.length, 20)) : '';

  return (
    <div
      style={{
        background: '#16162a',
        border: '1px solid #252542',
        borderRadius: '16px',
        padding: '14px 16px',
        marginTop: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <Key size={13} style={{ color: '#8b5cf6' }} />
        <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>Statbotics API Key</span>
        <span style={{ background: '#1e1e35', color: '#6b7280', fontSize: '10px', padding: '1px 6px', borderRadius: '4px' }}>
          optional
        </span>
      </div>

      {editing ? (
        <>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type={show ? 'text' : 'password'}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="Paste your API key…"
                autoFocus
                style={{
                  width: '100%',
                  background: '#0f0f23',
                  border: '1px solid #252542',
                  color: '#e2e8f0',
                  borderRadius: '8px',
                  padding: '6px 32px 6px 10px',
                  fontSize: '12px',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0 }}
              >
                {show ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={!draft.trim()}
              style={{
                background: draft.trim() ? 'linear-gradient(135deg, #7c3aed, #3b82f6)' : '#252542',
                color: draft.trim() ? '#fff' : '#4b5563',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: draft.trim() ? 'pointer' : 'not-allowed',
                whiteSpace: 'nowrap',
              }}
            >
              Save
            </button>
          </div>
          <p style={{ color: '#4b5563', fontSize: '11px', margin: 0 }}>
            Only needed if you get a 401/403 error. Leave blank to try without one first.
          </p>
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#6b7280', fontSize: '12px', fontFamily: 'monospace', flex: 1 }}>
            {masked}
          </span>
          <button
            type="button"
            onClick={() => { setDraft(apiKey); setEditing(true); }}
            style={{ background: '#1e1e35', border: '1px solid #252542', color: '#9ca3af', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}
          >
            Change
          </button>
        </div>
      )}
    </div>
  );
}
