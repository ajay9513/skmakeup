import { AuthUserDto, AuthResult } from '@sk-makeup/shared';
import { LoginInput, ChangePasswordInput } from '@sk-makeup/shared';
export interface AuthContext {
  ipAddress?: string;
  userAgent?: string;
}

export interface IAuthService {
  login(input: LoginInput, context: AuthContext): Promise<AuthResult>;
  refresh(refreshToken: string, context: AuthContext): Promise<AuthResult>;
  logout(refreshToken: string, userId?: string): Promise<void>;
  logoutAll(userId: string): Promise<void>;
  getMe(userId: string): Promise<AuthUserDto>;
  changePassword(userId: string, input: ChangePasswordInput): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<void>;
}

export interface IJwtService {
  generateAccessToken(payload: { sub: string; email: string; role: string }): string;
  generateRefreshToken(payload: { sub: string; jti: string }): string;
  verifyAccessToken(token: string): { sub: string; email: string; role: string };
  verifyRefreshToken(token: string): { sub: string; jti: string };
  getAccessTokenExpiresIn(): string;
  hashToken(token: string): string;
  getRefreshTokenExpiryDate(): Date;
  getTokenIssuedAt(token: string): number | undefined;
}
export interface IEmailService {
  sendPasswordResetEmail(to: string, resetToken: string, userName: string): Promise<void>;
  sendWelcomeEmail(to: string, userName: string): Promise<void>;
  isConfigured(): boolean;
}
