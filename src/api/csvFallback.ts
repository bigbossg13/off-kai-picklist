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
    headers.forEach((h, idx) => { row[h.trim()] = (values[idx] ?? '').trim(); });
    rows.push(row);
  }
  return rows;
}

let teamYearsPromise: Promise<Row[]> | null = null;
let teamsPromise: Promise<Row[]> | null = null;

function getTeamYears(): Promise<Row[]> {
  if (!teamYearsPromise) {
    teamYearsPromise = fetch(TEAM_YEARS_URL)
      .then(r => { if (!r.ok) throw new Error(`CSV ${r.status}`); return r.text(); })
      .then(parseCSV);
  }
  return teamYearsPromise;
}

function getTeams(): Promise<Row[]> {
  if (!teamsPromise) {
    teamsPromise = fetch(TEAMS_URL)
      .then(r => { if (!r.ok) throw new Error(`CSV ${r.status}`); return r.text(); })
      .then(parseCSV);
  }
  return teamsPromise;
}

function n(v: string | undefined) {
  const x = parseFloat(v ?? '');
  return isNaN(x) ? 0 : x;
}

function s(v: string | undefined): string | null {
  return !v || v === 'NULL' ? null : v;
}

export async function csvFetchTeamYear(team: number, year: number): Promise<StatboticsTeamYear> {
  const rows = await getTeamYears();
  const teamRows = rows.filter(r => Number(r.team) === team);
  if (teamRows.length === 0) throw new Error(`Team ${team} not found`);
  // Use requested year, or fall back to most recent available
  const row = teamRows.find(r => Number(r.year) === year)
    ?? teamRows.sort((a, b) => Number(b.year) - Number(a.year))[0];

  // Confirmed column names from CSV header (v3):
  // epa = unitless EPA; total points = auto_epa + teleop_epa + endgame_epa
  const autoEpa    = n(row.auto_epa);
  const telepEpa   = n(row.teleop_epa);
  const endgameEpa = n(row.endgame_epa);

  return {
    team,
    year: Number(row.year),
    name: row.name ?? `Team ${team}`,
    state: s(row.state),
    country: s(row.country),
    district: s(row.district),
    is_competing: false,
    epa: {
      total_points: { mean: autoEpa + telepEpa + endgameEpa, sd: n(row.epa_sd) },
      unitless:     { mean: n(row.epa), sd: n(row.epa_sd) },
      norm:         { mean: 0, sd: 0 },
      auto:         { mean: autoEpa,    sd: n(row.auto_epa_sd) },
      teleop:       { mean: telepEpa,   sd: n(row.teleop_epa_sd) },
      endgame:      { mean: endgameEpa, sd: n(row.endgame_epa_sd) },
    },
    record: {
      season: {
        wins: n(row.wins), losses: n(row.losses),
        ties: n(row.ties), count: n(row.count), winrate: n(row.winrate),
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
    state: s(row.state),
    country: s(row.country),
    district: s(row.district),
    rookie_year: row.rookie_year ? Number(row.rookie_year) : null,
  };
}
