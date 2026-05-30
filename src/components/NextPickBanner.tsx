import { ArrowRight, Zap } from 'lucide-react';
import type { PicklistTeam } from '../types';

interface NextPickBannerProps {
  teams: PicklistTeam[];
  doublePickMode: boolean;
  onPick: (teamNumber: number) => void;
}

function epaColor(epa: number): string {
  if (epa >= 60) return '#22c55e';
  if (epa >= 45) return '#3b82f6';
  if (epa >= 30) return '#8b5cf6';
  if (epa >= 15) return '#f59e0b';
  return '#6b7280';
}

export function NextPickBanner({ teams, doublePickMode, onPick }: NextPickBannerProps) {
  const maxPicks = doublePickMode ? 2 : 1;
  const available = teams
    .filter(t => !t.loading && !t.error && t.pickedCount < maxPicks)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 3);

  if (available.length === 0) return null;

  const [top, ...rest] = available;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(59,130,246,0.08))',
        border: '1px solid rgba(139,92,246,0.3)',
        borderRadius: '14px',
        padding: '14px 16px',
        marginBottom: '4px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <Zap size={13} style={{ color: '#8b5cf6' }} />
        <span style={{ color: '#8b5cf6', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Next Available
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Primary next pick */}
        <button
          onClick={() => onPick(top.teamNumber)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(139,92,246,0.5)',
            borderRadius: '10px',
            padding: '8px 14px',
            cursor: 'pointer',
            flex: '1',
            minWidth: '180px',
            textAlign: 'left',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#a78bfa', fontSize: '12px', fontWeight: 700 }}>
                #{top.teamNumber}
              </span>
              {top.state && (
                <span style={{ color: '#4b5563', fontSize: '11px' }}>{top.state}</span>
              )}
            </div>
            <div style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 600, marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
              {top.name}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ color: epaColor(top.epaTotal), fontSize: '20px', fontWeight: 800, lineHeight: 1 }}>
              {top.epaTotal.toFixed(1)}
            </div>
            <div style={{ color: '#6b7280', fontSize: '10px' }}>EPA</div>
          </div>
          <ArrowRight size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} />
        </button>

        {/* 2nd and 3rd picks */}
        {rest.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {rest.map((t, i) => (
              <button
                key={t.teamNumber}
                onClick={() => onPick(t.teamNumber)}
                title={`Pick ${t.name}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  background: 'rgba(30,30,53,0.6)',
                  border: '1px solid #252542',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  minWidth: '120px',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <span style={{ color: '#6b7280', fontSize: '10px', fontWeight: 600 }}>
                    {i + 2}
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '10px' }}>#{t.teamNumber}</span>
                </div>
                <div style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                  {t.name}
                </div>
                <div style={{ color: epaColor(t.epaTotal), fontSize: '13px', fontWeight: 700, marginTop: '2px' }}>
                  {t.epaTotal.toFixed(1)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
