const BASE = 'https://www.thebluealliance.com/api/v3';

async function tbaFetch(path: string, apiKey: string): Promise<Response> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'X-TBA-Auth-Key': apiKey },
    mode: 'cors',
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error(`TBA auth error ${res.status} — check your TBA API key`);
    }
    if (res.status === 404) return res;
    throw new Error(`TBA API error ${res.status}`);
  }
  return res;
}

interface TBAEventSimple {
  key: string;
  end_date: string; // "YYYY-MM-DD"
  event_type: number;
}

interface TBAOprs {
  oprs: Record<string, number>;
  dprs: Record<string, number>;
  ccwms: Record<string, number>;
}

export interface TBATeamOPR {
  opr: number;
  eventKey: string;
}

export async function fetchTeamOPR(
  team: number,
  year: number,
  apiKey: string,
): Promise<TBATeamOPR | null> {
  if (!apiKey) return null;

  const eventsRes = await tbaFetch(`/team/frc${team}/events/${year}/simple`, apiKey);
  if (eventsRes.status === 404) return null;
  const events: TBAEventSimple[] = await eventsRes.json();
  if (!events || events.length === 0) return null;

  // Sort by end_date descending, prefer official events (type 0-6) over offseason
  const sorted = [...events]
    .filter(e => e.event_type <= 6)
    .sort((a, b) => b.end_date.localeCompare(a.end_date));

  // Fall back to offseason events if no official events
  const candidates = sorted.length > 0 ? sorted : [...events].sort((a, b) => b.end_date.localeCompare(a.end_date));
  if (candidates.length === 0) return null;

  const teamKey = `frc${team}`;
  for (const event of candidates.slice(0, 3)) {
    const oprsRes = await tbaFetch(`/event/${event.key}/oprs`, apiKey);
    if (oprsRes.status === 404) continue;
    const data: TBAOprs = await oprsRes.json();
    if (data?.oprs?.[teamKey] !== undefined) {
      return { opr: data.oprs[teamKey], eventKey: event.key };
    }
  }
  return null;
}
