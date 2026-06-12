import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Search, Download, RotateCcw, Trash2, Copy } from 'lucide-react';
import { TeamCard } from './TeamCard';
import { TeamDetailModal } from './TeamDetailModal';
import { NextPickBanner } from './NextPickBanner';
import type { PicklistTeam } from '../types';

interface PicklistViewProps {
  teams: PicklistTeam[];
  doublePickMode: boolean;
  onDoublePickModeChange: (v: boolean) => void;
  onRemove: (teamNumber: number) => void;
  onCyclePicked: (teamNumber: number) => void;
  onReorder: (teams: PicklistTeam[]) => void;
  onResetRanking: () => void;
  onClearAll: () => void;
}

export function PicklistView({ teams, doublePickMode, onDoublePickModeChange, onRemove, onCyclePicked, onReorder, onResetRanking, onClearAll }: PicklistViewProps) {
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<PicklistTeam | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filtered = search
    ? teams.filter(t =>
        t.teamNumber.toString().includes(search) ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.state ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : teams;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = teams.findIndex(t => t.teamNumber === active.id);
    const newIdx = teams.findIndex(t => t.teamNumber === over.id);
    onReorder(arrayMove(teams, oldIdx, newIdx));
  };

  const handlePickFromBanner = (teamNumber: number) => {
    onCyclePicked(teamNumber);
  };

  const [copied, setCopied] = useState(false);

  const copyForDiscord = () => {
    const available = teams.filter(t => !t.loading && !t.error && t.pickedCount === 0);
    const text = available.map(t => t.teamNumber).join(', ');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const exportCSV = () => {
    const rows = [
      ['Rank', 'Team Number', 'Name', 'State', 'Total EPA', 'Auto EPA', 'Teleop EPA', 'Endgame EPA', 'Wins', 'Losses', 'Picked'],
      ...teams
        .filter(t => !t.loading && !t.error)
        .map(t => [
          t.rank, t.teamNumber, t.name, t.state ?? '', t.epaTotal.toFixed(2),
          t.epaAuto.toFixed(2), t.epaTeleop.toFixed(2), t.epaEndgame.toFixed(2),
          t.wins, t.losses, t.pickedCount > 0 ? `${t.pickedCount}×` : '',
        ]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'frc-picklist.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (teams.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(59,130,246,0.1))',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '20px',
          }}
          className="px-12 py-10"
        >
          <div className="text-5xl mb-4">🤖</div>
          <h3 className="text-white text-xl font-semibold mb-2">No teams yet</h3>
          <p style={{ color: '#6b7280' }} className="text-sm max-w-xs">
            Import team numbers on the left to fetch EPA data and build your picklist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Next pick banner */}
      <NextPickBanner
        teams={teams}
        doublePickMode={doublePickMode}
        onPick={handlePickFromBanner}
      />

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search
            size={14}
            style={{ color: '#6b7280', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search teams…"
            style={{
              background: '#16162a',
              border: '1px solid #252542',
              color: '#e2e8f0',
              borderRadius: '10px',
              width: '100%',
              paddingLeft: '34px',
            }}
            className="py-2 pr-3 text-sm outline-none placeholder-gray-600 focus:border-purple-500"
          />
        </div>

        {/* Double-pick toggle */}
        <button
          onClick={() => onDoublePickModeChange(!doublePickMode)}
          title="Allow teams to be picked twice"
          style={{
            background: doublePickMode ? 'rgba(245,158,11,0.15)' : '#1e1e35',
            border: `1px solid ${doublePickMode ? 'rgba(245,158,11,0.5)' : '#252542'}`,
            color: doublePickMode ? '#f59e0b' : '#9ca3af',
            borderRadius: '10px',
            cursor: 'pointer',
          }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors"
        >
          <Copy size={13} />
          2× Picks {doublePickMode ? 'ON' : 'OFF'}
        </button>

        <button
          onClick={onResetRanking}
          style={{
            background: '#1e1e35',
            border: '1px solid #252542',
            color: '#9ca3af',
            borderRadius: '10px',
            cursor: 'pointer',
          }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs hover:text-white hover:border-purple-500 transition-colors"
        >
          <RotateCcw size={13} />
          Reset to EPA
        </button>
        <button
          onClick={exportCSV}
          style={{
            background: '#1e1e35',
            border: '1px solid #252542',
            color: '#9ca3af',
            borderRadius: '10px',
            cursor: 'pointer',
          }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs hover:text-white hover:border-purple-500 transition-colors"
        >
          <Download size={13} />
          Export CSV
        </button>
        <button
          onClick={copyForDiscord}
          style={{
            background: copied ? 'rgba(88,101,242,0.2)' : '#1e1e35',
            border: `1px solid ${copied ? 'rgba(88,101,242,0.6)' : '#252542'}`,
            color: copied ? '#818cf8' : '#9ca3af',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs hover:text-white hover:border-purple-500 transition-colors"
        >
          <Copy size={13} />
          {copied ? 'Copied!' : 'Copy for Discord'}
        </button>
        <button
          onClick={onClearAll}
          style={{
            background: '#1e1e35',
            border: '1px solid #252542',
            color: '#6b7280',
            borderRadius: '10px',
            cursor: 'pointer',
          }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs hover:text-red-400 hover:border-red-900 transition-colors"
        >
          <Trash2 size={13} />
          Clear
        </button>
      </div>

      {/* Column headers */}
      <div
        style={{ color: '#4b5563' }}
        className="flex items-center gap-3 px-3 text-xs uppercase tracking-wider"
      >
        <div className="w-5" />
        <div className="w-8 text-center">Rank</div>
        <div className="flex-1">Team</div>
        <div className="hidden sm:block text-right pr-20">A / T / E</div>
        <div className="w-16 text-right">EPA</div>
        <div className="w-5" />
        <div className="w-5" />
      </div>

      {/* Sortable list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={teams.filter(t => t.pickedCount === 0).map(t => t.teamNumber)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {(search ? filtered : teams).map(team => (
              <TeamCard
                key={team.teamNumber}
                team={team}
                doublePickMode={doublePickMode}
                onRemove={onRemove}
                onCyclePicked={onCyclePicked}
                onClick={setSelectedTeam}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {search && filtered.length === 0 && (
        <div className="text-center py-8" style={{ color: '#6b7280' }}>
          No teams match "{search}"
        </div>
      )}

      {selectedTeam && (
        <TeamDetailModal
          team={selectedTeam}
          rank={selectedTeam.rank}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </div>
  );
}
