import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, ChevronRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import type { PicklistTeam } from '../types';

interface TeamCardProps {
  team: PicklistTeam;
  doublePickMode: boolean;
  onRemove: (teamNumber: number) => void;
  onCyclePicked: (teamNumber: number) => void;
  onClick: (team: PicklistTeam) => void;
}

function epaColor(epa: number): string {
  if (epa >= 60) return '#22c55e';
  if (epa >= 45) return '#3b82f6';
  if (epa >= 30) return '#8b5cf6';
  if (epa >= 15) return '#f59e0b';
  return '#6b7280';
}

function rankBadgeStyle(rank: number, pickedCount: number) {
  if (pickedCount > 0) return { bg: '#1e1e35', text: '#374151' };
  if (rank === 1) return { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', text: '#000' };
  if (rank === 2) return { bg: 'linear-gradient(135deg, #9ca3af, #6b7280)', text: '#000' };
  if (rank === 3) return { bg: 'linear-gradient(135deg, #92400e, #78350f)', text: '#fbbf24' };
  return { bg: '#1e1e35', text: '#9ca3af' };
}

export function TeamCard({ team, doublePickMode, onRemove, onCyclePicked, onClick }: TeamCardProps) {
  const isPicked = team.pickedCount > 0;
  const isDoublePicked = team.pickedCount >= 2;

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: team.teamNumber, disabled: team.loading || isPicked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  const badge = rankBadgeStyle(team.rank, team.pickedCount);
  const cardOpacity = isDoublePicked ? 0.35 : isPicked ? 0.5 : 1;

  const pickedLabel = isDoublePicked ? 'PICKED 2×' : 'PICKED';
  const checkColor = isDoublePicked ? '#f59e0b' : isPicked ? '#16a34a' : '#374151';
  const checkTitle = isPicked
    ? (doublePickMode ? (isDoublePicked ? 'Undo picks' : 'Pick again (2×)') : 'Undo pick')
    : 'Mark as picked';

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: isPicked ? '#111121' : isDragging ? '#1e1e35' : '#16162a',
        border: `1px solid ${isPicked ? '#1a1a2e' : isDragging ? '#8b5cf6' : '#252542'}`,
        borderRadius: '12px',
        opacity: cardOpacity,
        transition: 'border-color 0.15s, background 0.15s, opacity 0.2s',
      }}
      className="flex items-center gap-3 px-3 py-3 group"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        style={{ color: isPicked ? '#1f2937' : '#374151', cursor: (team.loading || isPicked) ? 'default' : 'grab' }}
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
        {isPicked ? '–' : team.rank}
      </div>

      {/* Team info */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => !team.loading && !team.error && !isPicked && onClick(team)}
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
                  style={{ color: isPicked ? '#374151' : '#8b5cf6' }}
                  className="text-xs font-bold tracking-wide"
                >
                  #{team.teamNumber}
                </span>
                {isPicked && (
                  <span
                    style={{
                      background: isDoublePicked ? 'rgba(245,158,11,0.15)' : '#1e1e35',
                      color: isDoublePicked ? '#f59e0b' : '#4b5563',
                      border: isDoublePicked ? '1px solid rgba(245,158,11,0.3)' : 'none',
                      borderRadius: '4px',
                    }}
                    className="text-xs px-1.5 py-0.5 font-semibold"
                  >
                    {pickedLabel}
                  </span>
                )}
                {!isPicked && team.state && (
                  <span
                    style={{ background: '#1e1e35', color: '#9ca3af', borderRadius: '4px' }}
                    className="text-xs px-1.5 py-0.5"
                  >
                    {team.state}
                  </span>
                )}
              </div>
              <p
                className="text-sm font-medium truncate mt-0.5"
                style={{
                  color: isPicked ? '#374151' : '#e2e8f0',
                  textDecoration: isPicked ? 'line-through' : 'none',
                }}
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
          {!isPicked && (
            <div className="hidden sm:flex items-center gap-3 text-xs" style={{ color: '#6b7280' }}>
              <span title="Auto EPA">A: <span style={{ color: '#60a5fa' }}>{team.epaAuto.toFixed(1)}</span></span>
              <span title="Teleop EPA">T: <span style={{ color: '#a78bfa' }}>{team.epaTeleop.toFixed(1)}</span></span>
              <span title="Endgame EPA">E: <span style={{ color: '#34d399' }}>{team.epaEndgame.toFixed(1)}</span></span>
            </div>
          )}
          <div className="text-right">
            <div
              className="text-lg font-bold"
              style={{ color: isPicked ? '#374151' : epaColor(team.epaTotal) }}
            >
              {team.epaTotal.toFixed(1)}
            </div>
            <div style={{ color: '#4b5563' }} className="text-xs">EPA</div>
          </div>
          {!isPicked && (
            <ChevronRight
              size={14}
              style={{ color: '#374151' }}
              className="group-hover:text-purple-400 transition-colors cursor-pointer"
              onClick={() => onClick(team)}
            />
          )}
        </div>
      )}

      {/* Pick cycle button */}
      {!team.loading && !team.error && (
        <button
          onClick={() => onCyclePicked(team.teamNumber)}
          title={checkTitle}
          style={{
            color: checkColor,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            flexShrink: 0,
          }}
          className="transition-colors hover:opacity-80"
        >
          <CheckCircle2 size={16} />
        </button>
      )}

      {/* Remove button */}
      <button
        onClick={() => onRemove(team.teamNumber)}
        style={{ color: '#374151', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
        className="flex-shrink-0 hover:text-red-400 transition-colors"
      >
        <X size={15} />
      </button>
    </div>
  );
}
