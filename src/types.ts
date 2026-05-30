export interface EPABreakdown {
  mean: number;
  sd: number;
}

export interface TeamEPA {
  total_points: EPABreakdown;
  unitless: EPABreakdown;
  norm: EPABreakdown;
  auto: EPABreakdown;
  teleop: EPABreakdown;
  endgame: EPABreakdown;
  auto_notes?: EPABreakdown;
  teleop_notes?: EPABreakdown;
  rp_1?: EPABreakdown;
  rp_2?: EPABreakdown;
}

export interface TeamRecord {
  season: {
    wins: number;
    losses: number;
    ties: number;
    count: number;
    winrate: number;
  };
}

export interface StatboticsTeamYear {
  team: number;
  year: number;
  name: string;
  epa: TeamEPA;
  record: TeamRecord;
  district: string | null;
  state: string | null;
  country: string | null;
  is_competing: boolean;
}

export interface StatboticsTeam {
  team: number;
  name: string;
  state: string | null;
  country: string | null;
  district: string | null;
  rookie_year: number | null;
}

export interface SavedPicklist {
  id: string;
  name: string;
  year: number;
  savedAt: number;
  teams: PicklistTeam[];
}

export interface PicklistTeam {
  teamNumber: number;
  name: string;
  epaTotal: number;
  epaAuto: number;
  epaTeleop: number;
  epaEndgame: number;
  epaSD: number;
  wins: number;
  losses: number;
  state: string | null;
  country: string | null;
  loading: boolean;
  error: string | null;
  rank: number;
  manualRank?: number;
  pickedCount: number; // 0 = available, 1 = picked, 2 = double-picked
}
