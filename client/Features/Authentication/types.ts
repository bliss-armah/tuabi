export interface LoginFormData {
  phoneNumber: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  phoneNumber: string;
  password: string;
  email?: string;
}

export interface LoginResponse {
  data: LoginResponseData;
}

interface LoginResponseData {
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
  phoneNumber: string;
  email?: string;
}
