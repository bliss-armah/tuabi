export interface LoginFormData {
  identifier: string; // email or phone number
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
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
  email: string;
  phoneNumber: string;
}
