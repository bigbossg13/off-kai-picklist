import { useState, useCallback } from 'react';
import type { PicklistTeam } from '../types';
import { fetchTeamYear, fetchTeam } from '../api/statbotics';
import { fetchTeamOPR } from '../api/tba';

export function usePicklist(year: number, apiKey: string, tbaKey: string) {
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
      pickedCount: 0,
    }));

    setTeams(prev => {
      const updated = [...prev, ...placeholders];
      return rerank(updated);
    });

    await Promise.allSettled(
      newNums.map(async (num) => {
        try {
          const [ty, team] = await Promise.allSettled([
            fetchTeamYear(num, year, apiKey),
            fetchTeam(num, apiKey),
          ]);

          const tyData = ty.status === 'fulfilled' ? ty.value : null;
          const teamData = team.status === 'fulfilled' ? team.value : null;
          const hasEPA = !!tyData && (tyData.epa?.total_points?.mean ?? 0) > 0;

          // Fetch OPR from TBA if EPA is missing or zero
          let opr: number | undefined;
          if (!hasEPA && tbaKey) {
            const oprResult = await fetchTeamOPR(num, year, tbaKey).catch(() => null);
            if (oprResult) opr = oprResult.opr;
          }

          setTeams(prev => {
            const updated = prev.map(t => {
              if (t.teamNumber !== num) return t;
              if (!tyData) {
                return {
                  ...t,
                  loading: false,
                  error: opr !== undefined ? null : (ty.status === 'rejected' ? (ty.reason as Error).message : 'No data'),
                  name: teamData?.name ?? t.name,
                  state: teamData?.state ?? null,
                  country: teamData?.country ?? null,
                  opr,
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
                opr,
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

  // Cycles: 0 → 1 → 0 (single-pick) or 0 → 1 → 2 → 0 (double-pick)
  const cyclePicked = useCallback((teamNumber: number, doublePickMode: boolean) => {
    setTeams(prev => prev.map(t => {
      if (t.teamNumber !== teamNumber) return t;
      const max = doublePickMode ? 2 : 1;
      return { ...t, pickedCount: t.pickedCount >= max ? 0 : t.pickedCount + 1 };
    }));
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

  return { teams, setTeams, addTeams, removeTeam, cyclePicked, reorderTeams, resetToEPARanking, clearAll };
}

function rerank(teams: PicklistTeam[]): PicklistTeam[] {
  const loaded = teams.filter(t => !t.loading && !t.error);
  const loading = teams.filter(t => t.loading);
  const errored = teams.filter(t => !t.loading && t.error);

  const sortedLoaded = [...loaded].sort((a, b) => {
    if (a.manualRank !== undefined && b.manualRank !== undefined) {
      return a.manualRank - b.manualRank;
    }
    const scoreA = a.epaTotal > 0 ? a.epaTotal : (a.opr ?? 0);
    const scoreB = b.epaTotal > 0 ? b.epaTotal : (b.opr ?? 0);
    return scoreB - scoreA;
  });

  const all = [...sortedLoaded, ...loading, ...errored];
  return all.map((t, i) => ({ ...t, rank: i + 1 }));
}
