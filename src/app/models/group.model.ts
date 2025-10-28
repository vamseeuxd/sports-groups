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