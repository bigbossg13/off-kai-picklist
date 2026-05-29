import { useState, useCallback } from 'react';
import type { PicklistTeam } from '../types';
import { fetchTeamYear, fetchTeam } from '../api/statbotics';

export function usePicklist(year: number) {
  const [teams, setTeams] = useState<PicklistTeam[]>([]);

  const parseTeamNumbers = (input: string): number[] => {
    const nums = input
      .split(/[\s,;\n\r]+/)
      .map(s => s.trim())
      .filter(s => /^\d+$/.test(s))
      .map(Number)
      .filter(n => n > 0 && n < 100000);
    return [...new Set(nums)];
  };

  const addTeams = useCallback(async (input: string) => {
    const nums = parseTeamNumbers(input);
    if (nums.length === 0) return;

    const existing = new Set(teams.map(t => t.teamNumber));
    const newNums = nums.filter(n => !existing.has(n));
    if (newNums.length === 0) return;

    const placeholders: PicklistTeam[] = newNums.map(num => ({
      teamNumber: num,
      name: `Team ${num}`,
      epaTotal: 0,
      epaAuto: 0,
      epaTeleop: 0,
      epaEndgame: 0,
      epaSD: 0,
      wins: 0,
      losses: 0,
      state: null,
      country: null,
      loading: true,
      error: null,
      rank: 0,
      drafted: false,
    }));

    setTeams(prev => {
      const updated = [...prev, ...placeholders];
      return rerank(updated);
    });

    await Promise.allSettled(
      newNums.map(async (num) => {
        try {
          const [ty, team] = await Promise.allSettled([
            fetchTeamYear(num, year),
            fetchTeam(num),
          ]);

          const tyData = ty.status === 'fulfilled' ? ty.value : null;
          const teamData = team.status === 'fulfilled' ? team.value : null;

          setTeams(prev => {
            const updated = prev.map(t => {
              if (t.teamNumber !== num) return t;
              if (!tyData) {
                return {
                  ...t,
                  loading: false,
                  error: ty.status === 'rejected' ? (ty.reason as Error).message : 'No data',
                  name: teamData?.name ?? t.name,
                  state: teamData?.state ?? null,
                  country: teamData?.country ?? null,
                };
              }
              return {
                ...t,
                loading: false,
                error: null,
                name: tyData.name ?? teamData?.name ?? t.name,
                epaTotal: tyData.epa?.total_points?.mean ?? 0,
                epaAuto: tyData.epa?.auto?.mean ?? 0,
                epaTeleop: tyData.epa?.teleop?.mean ?? 0,
                epaEndgame: tyData.epa?.endgame?.mean ?? 0,
                epaSD: tyData.epa?.total_points?.sd ?? 0,
                wins: tyData.record?.season?.wins ?? 0,
                losses: tyData.record?.season?.losses ?? 0,
                state: tyData.state ?? teamData?.state ?? null,
                country: tyData.country ?? teamData?.country ?? null,
              };
            });
            return rerank(updated);
          });
        } catch (err) {
          setTeams(prev => {
            const updated = prev.map(t =>
              t.teamNumber === num
                ? { ...t, loading: false, error: (err as Error).message }
                : t
            );
            return rerank(updated);
          });
        }
      })
    );
  }, [teams, year]);

  const removeTeam = useCallback((teamNumber: number) => {
    setTeams(prev => rerank(prev.filter(t => t.teamNumber !== teamNumber)));
  }, []);

  const toggleDrafted = useCallback((teamNumber: number) => {
    setTeams(prev => prev.map(t =>
      t.teamNumber === teamNumber ? { ...t, drafted: !t.drafted } : t
    ));
  }, []);

  const reorderTeams = useCallback((orderedTeams: PicklistTeam[]) => {
    setTeams(orderedTeams.map((t, i) => ({ ...t, rank: i + 1, manualRank: i + 1 })));
  }, []);

  const resetToEPARanking = useCallback(() => {
    setTeams(prev => {
      const sorted = [...prev].sort((a, b) => b.epaTotal - a.epaTotal);
      return sorted.map((t, i) => ({ ...t, rank: i + 1, manualRank: undefined }));
    });
  }, []);

  const clearAll = useCallback(() => {
    setTeams([]);
  }, []);

  return { teams, setTeams, addTeams, removeTeam, toggleDrafted, reorderTeams, resetToEPARanking, clearAll };
}

function rerank(teams: PicklistTeam[]): PicklistTeam[] {
  const loaded = teams.filter(t => !t.loading && !t.error);
  const loading = teams.filter(t => t.loading);
  const errored = teams.filter(t => !t.loading && t.error);

  const sortedLoaded = [...loaded].sort((a, b) => {
    if (a.manualRank !== undefined && b.manualRank !== undefined) {
      return a.manualRank - b.manualRank;
    }
    return b.epaTotal - a.epaTotal;
  });

  const all = [...sortedLoaded, ...loading, ...errored];
  return all.map((t, i) => ({ ...t, rank: i + 1 }));
}
