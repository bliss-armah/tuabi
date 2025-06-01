
export interface LoginFormData {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: tokenData;
  user: userData;
}

interface tokenData {
  access_token: string;
  expires_in: number;
}

interface userData {
  id: number;
  name: string;
  email: string;
}
