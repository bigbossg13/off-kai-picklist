import { Trophy, Zap } from 'lucide-react';

interface HeaderProps {
  teamCount: number;
  year: number;
  onYearChange: (year: number) => void;
}

export function Header({ teamCount, year, onYearChange }: HeaderProps) {
  const years = [2025, 2024, 2023, 2022, 2020, 2019];

  return (
    <header
      style={{
        background: 'linear-gradient(90deg, #0f0f23 0%, #16162a 50%, #0f0f23 100%)',
        borderBottom: '1px solid #252542',
      }}
      className="sticky top-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
          >
            <Trophy size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl leading-none">Off-Kai Picklist</h1>
            <p style={{ color: '#6b7280' }} className="text-xs mt-0.5">
              FRC Fantasy Draft Tool
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {teamCount > 0 && (
            <div className="flex items-center gap-1.5" style={{ color: '#8b5cf6' }}>
              <Zap size={14} />
              <span className="text-sm font-medium">{teamCount} teams</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <label style={{ color: '#9ca3af' }} className="text-sm">Season</label>
            <select
              value={year}
              onChange={e => onYearChange(Number(e.target.value))}
              style={{
                background: '#1e1e35',
                border: '1px solid #252542',
                color: '#e2e8f0',
              }}
              className="rounded-lg px-3 py-1.5 text-sm outline-none cursor-pointer"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
