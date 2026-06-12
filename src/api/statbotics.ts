import type { StatboticsTeamYear, StatboticsTeam } from '../types';

const BASE = 'https://api.statbotics.io/v3';

function headers(apiKey: string): HeadersInit {
  return apiKey ? { 'X-API-Key': apiKey } : {};
}

export async function fetchTeamYear(team: number, year: number, apiKey: string): Promise<StatboticsTeamYear> {
  const res = await fetch(`${BASE}/team_year/${team}/${year}`, { headers: headers(apiKey) });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Invalid or missing API key — add your Statbotics key in settings');
    if (res.status === 404) throw new Error(`Team ${team} not found for ${year}`);
    throw new Error(`API error ${res.status}`);
  }
  return res.json();
}

export async function fetchTeam(team: number, apiKey: string): Promise<StatboticsTeam> {
  const res = await fetch(`${BASE}/team/${team}`, { headers: headers(apiKey) });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Invalid or missing API key');
    if (res.status === 404) throw new Error(`Team ${team} not found`);
    throw new Error(`API error ${res.status}`);
  }
  return res.json();
}
