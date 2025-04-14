export enum UserRole {
    ADMIN = 'admin',
    TEACHER = 'teacher',
  }
  
  export interface LoginFormData {
    username: string;
    password: string;
    sessionId: string;
  }
  
  export interface LoginResponse {
    nextStep: string;
    success: string;
  }
  
  export interface OtpRequestData {
    otp: string;
    sessionId: string;
    username: string;
  }
  
  export interface PasswordRequestData {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
  
  interface tokenData {
    accessToken: string;
    tokenExpiry: number;
    refreshToken: string;
  }
  
  interface userData {
    firstName: string;
    lastName: string;
    displayName: string;
    roles: UserRole[];
  }
  
  export interface OtpResponse {
    token: tokenData;
    user: userData;
  }
  
  export interface Token {
    accessToken: string;
    expiresIn: number;
    tokenType: string;
    scope: string;
    refreshToken: string;
  }
  
  export interface School {
    id: number;
    name: string;
    displayName: string;
    phoneNumber: string;
    address: string;
    email: string;
    website: string;
    logo: string | null;
  }
  
  export interface User {
    username: string;
    firstName: string;
    lastName: string;
    id: number;
    school: School;
    roles: string[];
    staff?: {
      id: number;
      staffNumber: string;
    };
  }
  
  export interface AuthResponse {
    token: Token;
    user: User;
    nextAction: string;
  }
  