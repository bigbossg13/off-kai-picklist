import type { StatboticsTeamYear, StatboticsTeam } from '../types';

const TEAM_YEARS_URL =
  'https://raw.githubusercontent.com/avgupta456/statbotics-csvs/main/v3/team_years.csv';
const TEAMS_URL =
  'https://raw.githubusercontent.com/avgupta456/statbotics-csvs/main/v3/teams.csv';

type Row = Record<string, string>;

function parseCSV(text: string): Row[] {
  const lines = text.split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',');
  const rows: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(',');
    const row: Row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] ?? '').trim();
    });
    rows.push(row);
  }
  return rows;
}

// Singletons — downloaded at most once per page load
let teamYearsPromise: Promise<Row[]> | null = null;
let teamsPromise: Promise<Row[]> | null = null;

async function getTeamYears(): Promise<Row[]> {
  if (!teamYearsPromise) {
    teamYearsPromise = fetch(TEAM_YEARS_URL)
      .then(r => {
        if (!r.ok) throw new Error(`CSV fetch failed: ${r.status}`);
        return r.text();
      })
      .then(text => {
        const rows = parseCSV(text);
        if (rows.length > 0) {
          console.log('[statbotics-csvs] team_years columns:', Object.keys(rows[0]).join(', '));
        }
        return rows;
      });
  }
  return teamYearsPromise;
}

async function getTeams(): Promise<Row[]> {
  if (!teamsPromise) {
    teamsPromise = fetch(TEAMS_URL)
      .then(r => {
        if (!r.ok) throw new Error(`CSV fetch failed: ${r.status}`);
        return r.text();
      })
      .then(parseCSV);
  }
  return teamsPromise;
}

function n(v: string | undefined): number {
  const x = parseFloat(v ?? '');
  return isNaN(x) ? 0 : x;
}

// Try multiple possible column name variants, return first non-zero hit
function pick(row: Row, ...keys: string[]): number {
  for (const k of keys) {
    const v = n(row[k]);
    if (v !== 0) return v;
  }
  return 0;
}

function nullStr(v: string | undefined): string | null {
  if (!v || v === 'NULL' || v === '') return null;
  return v;
}

export async function csvFetchTeamYear(
  team: number,
  year: number,
): Promise<StatboticsTeamYear> {
  const rows = await getTeamYears();
  // Try the requested year, then fall back to the most recent year available for this team
  const teamRows = rows.filter(r => Number(r.team) === team);
  if (teamRows.length === 0) throw new Error(`Team ${team} not found`);
  let row = teamRows.find(r => Number(r.year) === year);
  if (!row) {
    // Use the most recent year available
    row = teamRows.sort((a, b) => Number(b.year) - Number(a.year))[0];
  }

  // Column names are our best-guess mapping from the DB schema.
  // epa_mean / epa_sd map to total_points; auto/teleop/endgame follow the same pattern.
  return {
    team,
    year,
    name: row.name ?? `Team ${team}`,
    state: nullStr(row.state),
    country: nullStr(row.country),
    district: nullStr(row.district),
    is_competing: false,
    epa: {
      total_points: {
        mean: pick(row, 'epa_mean', 'total_epa_mean', 'epa_end', 'epa', 'norm_epa'),
        sd:   pick(row, 'epa_sd',   'total_epa_sd'),
      },
      unitless: { mean: 0, sd: 0 },
      norm:     { mean: 0, sd: 0 },
      auto:     { mean: pick(row, 'auto_epa_mean',    'auto_epa'),     sd: 0 },
      teleop:   { mean: pick(row, 'teleop_epa_mean',  'teleop_epa'),   sd: 0 },
      endgame:  { mean: pick(row, 'endgame_epa_mean', 'endgame_epa'),  sd: 0 },
    },
    record: {
      season: {
        wins: n(row.wins),
        losses: n(row.losses),
        ties: n(row.ties),
        count: n(row.count),
        winrate: n(row.winrate),
      },
    },
  };
}

export async function csvFetchTeam(team: number): Promise<StatboticsTeam> {
  const rows = await getTeams();
  const row = rows.find(r => Number(r.team) === team);
  if (!row) throw new Error(`Team ${team} not found`);
  return {
    team,
    name: row.name ?? `Team ${team}`,
    state: nullStr(row.state),
    country: nullStr(row.country),
    district: nullStr(row.district),
    rookie_year: row.rookie_year ? Number(row.rookie_year) : null,
  };
}
