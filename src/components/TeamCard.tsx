import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import type { PicklistTeam } from '../types';

interface TeamCardProps {
  team: PicklistTeam;
  onRemove: (teamNumber: number) => void;
  onClick: (team: PicklistTeam) => void;
}

function epaColor(epa: number): string {
  if (epa >= 60) return '#22c55e';
  if (epa >= 45) return '#3b82f6';
  if (epa >= 30) return '#8b5cf6';
  if (epa >= 15) return '#f59e0b';
  return '#6b7280';
}

function rankBadgeStyle(rank: number) {
  if (rank === 1) return { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', text: '#000' };
  if (rank === 2) return { bg: 'linear-gradient(135deg, #9ca3af, #6b7280)', text: '#000' };
  if (rank === 3) return { bg: 'linear-gradient(135deg, #92400e, #78350f)', text: '#fbbf24' };
  return { bg: '#1e1e35', text: '#9ca3af' };
}

export function TeamCard({ team, onRemove, onClick }: TeamCardProps) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: team.teamNumber, disabled: team.loading });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  const badge = rankBadgeStyle(team.rank);

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: isDragging ? '#1e1e35' : '#16162a',
        border: `1px solid ${isDragging ? '#8b5cf6' : '#252542'}`,
        borderRadius: '12px',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      className="flex items-center gap-3 px-3 py-3 group"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        style={{ color: '#374151', cursor: team.loading ? 'default' : 'grab' }}
        className="flex-shrink-0 hover:text-purple-400 transition-colors"
      >
        <GripVertical size={18} />
      </div>

      {/* Rank badge */}
      <div
        style={{
          background: badge.bg,
          color: badge.text,
          borderRadius: '8px',
          minWidth: '32px',
          height: '32px',
        }}
        className="flex-shrink-0 flex items-center justify-center text-xs font-bold"
      >
        {team.rank}
      </div>

      {/* Team info */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => !team.loading && !team.error && onClick(team)}
      >
        {team.loading ? (
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" style={{ color: '#8b5cf6' }} />
            <span style={{ color: '#9ca3af' }} className="text-sm">
              Loading team {team.teamNumber}…
            </span>
          </div>
        ) : team.error ? (
          <div className="flex items-center gap-2">
            <AlertCircle size={14} style={{ color: '#ef4444' }} />
            <span style={{ color: '#ef4444' }} className="text-sm">
              #{team.teamNumber} — {team.error}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  style={{ color: '#8b5cf6' }}
                  className="text-xs font-bold tracking-wide"
                >
                  #{team.teamNumber}
                </span>
                {team.state && (
                  <span
                    style={{
                      background: '#1e1e35',
                      color: '#9ca3af',
                      borderRadius: '4px',
                    }}
                    className="text-xs px-1.5 py-0.5"
                  >
                    {team.state}
                  </span>
                )}
              </div>
              <p
                className="text-sm font-medium truncate mt-0.5"
                style={{ color: '#e2e8f0' }}
              >
                {team.name}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* EPA display */}
      {!team.loading && !team.error && (
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-3 text-xs" style={{ color: '#6b7280' }}>
            <span title="Auto EPA">A: <span style={{ color: '#60a5fa' }}>{team.epaAuto.toFixed(1)}</span></span>
            <span title="Teleop EPA">T: <span style={{ color: '#a78bfa' }}>{team.epaTeleop.toFixed(1)}</span></span>
            <span title="Endgame EPA">E: <span style={{ color: '#34d399' }}>{team.epaEndgame.toFixed(1)}</span></span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold" style={{ color: epaColor(team.epaTotal) }}>
              {team.epaTotal.toFixed(1)}
            </div>
            <div style={{ color: '#6b7280' }} className="text-xs">EPA</div>
          </div>
          <ChevronRight
            size={14}
            style={{ color: '#374151' }}
            className="group-hover:text-purple-400 transition-colors cursor-pointer"
            onClick={() => onClick(team)}
          />
        </div>
      )}

      {/* Remove button */}
      <button
        onClick={() => onRemove(team.teamNumber)}
        style={{ color: '#374151' }}
        className="flex-shrink-0 hover:text-red-400 transition-colors ml-1"
      >
        <X size={15} />
      </button>
    </div>
  );
}
