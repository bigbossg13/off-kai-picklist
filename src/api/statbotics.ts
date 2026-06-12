import type { StatboticsTeamYear, StatboticsTeam } from '../types';

const BASE = 'https://api.statbotics.io/v3';

function buildHeaders(apiKey: string): HeadersInit {
  // Only send the key header if one has been configured
  return apiKey ? { 'X-API-Key': apiKey } : {};
}

async function apiFetch(url: string, apiKey: string): Promise<Response> {
  const res = await fetch(url, {
    headers: buildHeaders(apiKey),
    mode: 'cors',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    if (res.status === 401 || res.status === 403) {
      // If no key is set this is likely a CORS/Cloudflare block.
      // If a key is set, it may be invalid.
      if (apiKey) {
        throw new Error(`Auth error ${res.status} — check your API key`);
      } else {
        throw new Error(
          `Error ${res.status} from Statbotics — the API may require a key. ` +
          `Try adding one in the API Key panel. Details: ${body.slice(0, 80)}`
        );
      }
    }
    if (res.status === 404) return res; // let callers handle 404
    throw new Error(`Statbotics API error ${res.status}`);
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
