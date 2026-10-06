export interface CreateUserSiteAccessInput {
  siteId: string;
  role: string;
  additionalPermissions?: string[];
}

export interface CreateUserBody {
  nome: string;
  cognome: string;
  email: string;
  password: string;
  isActive?: boolean;
  siteAccess?: CreateUserSiteAccessInput;
}

export interface UpdateUser{
  userId: string;
  nome?: string;
  cognome?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  siteAccess?: CreateUserSiteAccessInput;
}