import type { StatboticsTeamYear, StatboticsTeam } from '../types';

const BASE = 'https://api.statbotics.io/v3';

export async function fetchTeamYear(team: number, year: number): Promise<StatboticsTeamYear> {
  const res = await fetch(`${BASE}/team_year/${team}/${year}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Team ${team} not found for ${year}`);
    throw new Error(`API error ${res.status}`);
  }
  return res.json();
}

export async function fetchTeam(team: number): Promise<StatboticsTeam> {
  const res = await fetch(`${BASE}/team/${team}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Team ${team} not found`);
    throw new Error(`API error ${res.status}`);
  }
  return res.json();
}
