import { X, Trophy, Zap, Target, Shield } from 'lucide-react';
import type { PicklistTeam } from '../types';

interface TeamDetailModalProps {
  team: PicklistTeam;
  rank: number;
  onClose: () => void;
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span style={{ color: '#9ca3af' }} className="text-xs">{label}</span>
        <span style={{ color }} className="text-xs font-bold">{value.toFixed(2)}</span>
      </div>
      <div style={{ background: '#0f0f23', borderRadius: '4px', height: '6px' }}>
        <div
          style={{
            width: `${pct}%`,
            background: color,
            borderRadius: '4px',
            height: '100%',
            transition: 'width 0.5s ease',
          }}
        />
      </div>
    </div>
  );
}

export function TeamDetailModal({ team, rank, onClose }: TeamDetailModalProps) {
  const total = team.epaAuto + team.epaTeleop + team.epaEndgame || 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#16162a',
          border: '1px solid #252542',
          borderRadius: '20px',
          maxWidth: '480px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(59,130,246,0.2))',
            borderBottom: '1px solid #252542',
            borderRadius: '20px 20px 0 0',
          }}
          className="p-6 flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                style={{ background: '#7c3aed', color: '#fff', borderRadius: '6px' }}
                className="text-xs font-bold px-2 py-0.5"
              >
                #{rank} Overall
              </span>
            </div>
            <h2 className="text-white text-2xl font-bold">Team {team.teamNumber}</h2>
            <p style={{ color: '#9ca3af' }} className="text-sm mt-0.5">{team.name}</p>
            {(team.state || team.country) && (
              <p style={{ color: '#6b7280' }} className="text-xs mt-1">
                {[team.state, team.country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ color: '#6b7280', background: '#1e1e35', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            className="p-2 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Total EPA */}
          <div className="text-center">
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.15))',
                border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: '16px',
              }}
              className="inline-block px-8 py-4"
            >
              <div className="text-4xl font-bold" style={{ color: '#a78bfa' }}>
                {team.epaTotal.toFixed(2)}
              </div>
              <div style={{ color: '#6b7280' }} className="text-sm mt-1">Total EPA</div>
              {team.epaSD > 0 && (
                <div style={{ color: '#4b5563' }} className="text-xs mt-0.5">
                  ± {team.epaSD.toFixed(2)} SD
                </div>
              )}
            </div>
          </div>

          {/* EPA Breakdown */}
          <div
            style={{ background: '#0f0f23', borderRadius: '14px', border: '1px solid #1e1e35' }}
            className="p-4 space-y-4"
          >
            <h3 className="text-white text-sm font-semibold flex items-center gap-2">
              <Zap size={14} style={{ color: '#8b5cf6' }} />
              EPA Breakdown
            </h3>
            <StatBar label="Autonomous" value={team.epaAuto} max={total} color="#60a5fa" />
            <StatBar label="Teleoperated" value={team.epaTeleop} max={total} color="#a78bfa" />
            <StatBar label="Endgame" value={team.epaEndgame} max={total} color="#34d399" />
          </div>

          {/* Component proportions */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Auto', value: team.epaAuto, icon: Target, color: '#60a5fa' },
              { label: 'Teleop', value: team.epaTeleop, icon: Zap, color: '#a78bfa' },
              { label: 'Endgame', value: team.epaEndgame, icon: Shield, color: '#34d399' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                style={{ background: '#0f0f23', border: '1px solid #1e1e35', borderRadius: '12px' }}
                className="p-3 text-center"
              >
                <Icon size={16} style={{ color }} className="mx-auto mb-1" />
                <div className="text-lg font-bold" style={{ color }}>{value.toFixed(1)}</div>
                <div style={{ color: '#6b7280' }} className="text-xs">{label}</div>
              </div>
            ))}
          </div>

          {/* Season Record */}
          {(team.wins > 0 || team.losses > 0) && (
            <div
              style={{ background: '#0f0f23', borderRadius: '14px', border: '1px solid #1e1e35' }}
              className="p-4"
            >
              <h3 className="text-white text-sm font-semibold flex items-center gap-2 mb-3">
                <Trophy size={14} style={{ color: '#f59e0b' }} />
                2025 Season Record
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: '#22c55e' }}>{team.wins}</div>
                  <div style={{ color: '#6b7280' }} className="text-xs">Wins</div>
                </div>
                <div style={{ color: '#374151' }} className="text-xl font-light">–</div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: '#ef4444' }}>{team.losses}</div>
                  <div style={{ color: '#6b7280' }} className="text-xs">Losses</div>
                </div>
                <div style={{ color: '#374151' }} className="flex-1 text-right text-sm" >
                  {team.wins + team.losses > 0
                    ? `${((team.wins / (team.wins + team.losses)) * 100).toFixed(0)}% WR`
                    : ''}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
