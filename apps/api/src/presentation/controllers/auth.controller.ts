import { Request, Response, RequestHandler } from 'express';
import { REFRESH_TOKEN_COOKIE } from '@sk-makeup/shared';
import { authService } from '../../container';
import { asyncHandler } from '../../utils/async-handler';
import { sendSuccess } from '../../utils/response';
import { getAuthContext } from '../../utils/request';
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  stripRefreshToken,
} from '../utils/cookie.utils';

export const login: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body, getAuthContext(req));
  setRefreshTokenCookie(res, result.refreshToken);
  sendSuccess(res, stripRefreshToken(result));
});

export const refresh: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE] || req.body.refreshToken;

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      error: { code: 'REFRESH_TOKEN_REQUIRED', message: 'Refresh token required' },
    });
    return;
  }

  const result = await authService.refresh(refreshToken, getAuthContext(req));
  setRefreshTokenCookie(res, result.refreshToken);
  sendSuccess(res, stripRefreshToken(result));
});

export const logout: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
  await authService.logout(refreshToken, req.user?.id);
  clearRefreshTokenCookie(res);
  sendSuccess(res, { message: 'Logged out successfully' });
});

export const logoutAll: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await authService.logoutAll(req.user!.id);
  clearRefreshTokenCookie(res);
  sendSuccess(res, { message: 'Logged out from all devices' });
});

export const me: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.id);
  sendSuccess(res, user);
});

export const changePassword: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await authService.changePassword(req.user!.id, req.body);
  clearRefreshTokenCookie(res);
  sendSuccess(res, { message: 'Password changed successfully. Please log in again.' });
});

export const forgotPassword: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  sendSuccess(res, {
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
});

export const resetPassword: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body.token, req.body.password);
  sendSuccess(res, { message: 'Password reset successfully. Please log in.' });
});
