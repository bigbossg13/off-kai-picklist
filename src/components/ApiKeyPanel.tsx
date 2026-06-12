import { useState } from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';

interface ApiKeyPanelProps {
  apiKey: string;
  onChange: (key: string) => void;
  tbaKey: string;
  onTbaKeyChange: (key: string) => void;
  builtInTbaKey: boolean;
}

function KeyField({
  label,
  badge,
  value,
  onChange,
}: {
  label: string;
  badge: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(!value);
  const [draft, setDraft] = useState(value);
  const [show, setShow] = useState(false);

  const handleSave = () => {
    onChange(draft.trim());
    setEditing(false);
  };

  const masked = value ? '•'.repeat(Math.min(value.length, 20)) : '';

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <Key size={12} style={{ color: '#8b5cf6' }} />
        <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{label}</span>
        <span style={{ background: '#1e1e35', color: '#6b7280', fontSize: '10px', padding: '1px 6px', borderRadius: '4px' }}>
          {badge}
        </span>
      </div>

      {editing ? (
        <>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type={show ? 'text' : 'password'}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="Paste key…"
                autoFocus
                style={{
                  width: '100%',
                  background: '#0f0f23',
                  border: '1px solid #252542',
                  color: '#e2e8f0',
                  borderRadius: '8px',
                  padding: '5px 30px 5px 8px',
                  fontSize: '11px',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                style={{ position: 'absolute', right: '7px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0 }}
              >
                {show ? <EyeOff size={12} /> : <Eye size={12} />}
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
                padding: '5px 10px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: draft.trim() ? 'pointer' : 'not-allowed',
                whiteSpace: 'nowrap',
              }}
            >
              Save
            </button>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#6b7280', fontSize: '11px', fontFamily: 'monospace', flex: 1 }}>
            {masked}
          </span>
          <button
            type="button"
            onClick={() => { setDraft(value); setEditing(true); }}
            style={{ background: '#1e1e35', border: '1px solid #252542', color: '#9ca3af', borderRadius: '6px', padding: '2px 7px', fontSize: '10px', cursor: 'pointer' }}
          >
            Change
          </button>
        </div>
      )}
    </div>
  );
}

export function ApiKeyPanel({ apiKey, onChange, tbaKey, onTbaKeyChange, builtInTbaKey }: ApiKeyPanelProps) {
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
      <p style={{ color: '#6b7280', fontSize: '11px', margin: '0 0 4px' }}>
        Leave blank to try without keys first.
      </p>

      <KeyField
        label="Statbotics API Key"
        badge="optional"
        value={apiKey}
        onChange={onChange}
      />

      {builtInTbaKey ? (
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Key size={12} style={{ color: '#8b5cf6' }} />
          <span style={{ color: '#6b7280', fontSize: '12px' }}>TBA API Key</span>
          <span style={{ background: '#14291a', color: '#22c55e', fontSize: '10px', padding: '1px 6px', borderRadius: '4px' }}>
            ✓ configured
          </span>
        </div>
      ) : (
        <KeyField
          label="TBA API Key"
          badge="for OPR fallback"
          value={tbaKey}
          onChange={onTbaKeyChange}
        />
      )}
    </div>
  );
}
