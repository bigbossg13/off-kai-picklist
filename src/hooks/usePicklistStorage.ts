import { useState, useCallback } from 'react';
import type { SavedPicklist, PicklistTeam } from '../types';

const STORAGE_KEY = 'off-kai-picklists';

// Normalise teams loaded from localStorage — handles the old drafted:boolean
// field that existed before pickedCount was introduced.
function normaliseTeam(t: PicklistTeam & { drafted?: boolean }): PicklistTeam {
  if (t.pickedCount === undefined) {
    return { ...t, pickedCount: t.drafted ? 1 : 0 };
  }
  return t as PicklistTeam;
}

function load(): SavedPicklist[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: SavedPicklist[] = JSON.parse(raw);
    return parsed.map(p => ({ ...p, teams: p.teams.map(normaliseTeam) }));
  } catch {
    return [];
  }
}

function persist(lists: SavedPicklist[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export function usePicklistStorage() {
  const [saved, setSaved] = useState<SavedPicklist[]>(load);

  const savePicklist = useCallback((name: string, year: number, teams: PicklistTeam[]) => {
    const entry: SavedPicklist = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim() || 'Untitled',
      year,
      savedAt: Date.now(),
      teams,
    };
    setSaved(prev => {
      const updated = [entry, ...prev];
      persist(updated);
      return updated;
    });
    return entry.id;
  }, []);

  const updatePicklist = useCallback((id: string, name: string, year: number, teams: PicklistTeam[]) => {
    setSaved(prev => {
      const updated = prev.map(p =>
        p.id === id ? { ...p, name: name.trim() || 'Untitled', year, teams, savedAt: Date.now() } : p
      );
      persist(updated);
      return updated;
    });
  }, []);

  const deletePicklist = useCallback((id: string) => {
    setSaved(prev => {
      const updated = prev.filter(p => p.id !== id);
      persist(updated);
      return updated;
    });
  }, []);

  return { saved, savePicklist, updatePicklist, deletePicklist };
}
