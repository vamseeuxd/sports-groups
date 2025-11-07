export interface IGroup {
  name: string;
  id?: string;
}

export interface IGroupRole extends IGroup {
  role: string;
}

export interface IUser {
  email: string;
  groupId: string;
  role: 'admin' | 'member';
  id?: string;
}

export interface ITournament {
  name: string;
  startDate: Date;
  sport: string;
  description: string;
  groupId: string;
  id?: string;
}

export const SPORTS_OPTIONS = [
  'Football', 'Basketball', 'Tennis', 'Cricket', 'Baseball', 
  'Soccer', 'Volleyball', 'Badminton', 'Table Tennis', 'Golf'
];

export interface IPlayerRegistration {
  tournamentId: string;
  playerName: string;
  playerEmail: string;
  gender: 'male' | 'female' | 'other';
  mobileNumber: string;
  registrationDate: Date;
  status?: 'pending' | 'approved' | 'rejected';
  id?: string;
}

export interface ITeam {
  name: string;
  tournamentId: string;
  playerIds: string[];
  captainId?: string;
  id?: string;
}

export interface ITeamPlayer {
  id: string;
  playerName: string;
  playerEmail: string;
  isCaptain?: boolean;
}

export interface IKnockoutMatch {
  id: string;
  tournamentId: string;
  round: number;
  position: number;
  team1?: ITeam;
  team2?: ITeam;
  winner?: ITeam;
  status: 'pending' | 'in-progress' | 'completed';
  scheduledDate?: Date;
  nextMatchId?: string;
}

export interface IKnockoutTournament {
  tournamentId: string;
  teams: ITeam[];
  matches: IKnockoutMatch[];
  totalRounds: number;
  currentRound: number;
  status: 'draft' | 'active' | 'completed';
  id?: string;
}