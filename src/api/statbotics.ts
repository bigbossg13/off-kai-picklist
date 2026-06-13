import type { StatboticsTeamYear, StatboticsTeam } from '../types';
import { csvFetchTeamYear, csvFetchTeam } from './csvFallback';

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
  try {
    const res = await apiFetch(`${BASE}/team_year/${team}/${year}`, apiKey);
    if (res.status === 404) return csvFetchTeamYear(team, year);
    return res.json();
  } catch {
    return csvFetchTeamYear(team, year);
  }
}

export async function fetchTeam(team: number, apiKey: string): Promise<StatboticsTeam> {
  try {
    const res = await apiFetch(`${BASE}/team/${team}`, apiKey);
    if (res.status === 404) return csvFetchTeam(team);
    return res.json();
  } catch {
    return csvFetchTeam(team);
  }
}
