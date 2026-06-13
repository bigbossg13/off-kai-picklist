import type { StatboticsTeamYear, StatboticsTeam } from '../types';

const BASE = 'https://api.statbotics.io/v3';

async function apiFetch(url: string, apiKey: string): Promise<Response> {
  const res = await fetch(url, {
    headers: apiKey ? { 'X-API-Key': apiKey } : {},
    mode: 'cors',
  });
  if (!res.ok) {
    if (res.status === 404) return res;
    const body = await res.text().catch(() => '');
    throw new Error(`Statbotics error ${res.status}${body ? `: ${body.slice(0, 80)}` : ''}`);
  }
  return res;
}

export async function fetchTeamYear(team: number, year: number, apiKey: string): Promise<StatboticsTeamYear> {
  const res = await apiFetch(`${BASE}/team_year/${team}/${year}`, apiKey);
  if (res.status === 404) throw new Error(`Team ${team} not found for ${year}`);
  return res.json();
}

export async function fetchTeam(team: number, apiKey: string): Promise<StatboticsTeam> {
  const res = await apiFetch(`${BASE}/team/${team}`, apiKey);
  if (res.status === 404) throw new Error(`Team ${team} not found`);
  return res.json();
}
