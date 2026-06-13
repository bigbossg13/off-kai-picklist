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
      .then(parseCSV);
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
      // total_points = sum of components; the bare `epa` column is unitless (~30s scale)
      total_points: {
        mean: n(row.auto_epa) + n(row.teleop_epa) + n(row.endgame_epa),
        sd:   n(row.epa_sd),
      },
      unitless: { mean: n(row.epa),           sd: n(row.epa_sd) },
      norm:     { mean: 0, sd: 0 },
      auto:     { mean: n(row.auto_epa),       sd: n(row.auto_epa_sd) },
      teleop:   { mean: n(row.teleop_epa),     sd: n(row.teleop_epa_sd) },
      endgame:  { mean: n(row.endgame_epa),    sd: n(row.endgame_epa_sd) },
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
