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