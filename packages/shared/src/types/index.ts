export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CloudinaryImageDto {
  mediaAssetId?: string;
  publicId: string;
  secureUrl: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  alt: string;
  caption?: string;
  order: number;
  isFeatured: boolean;
  folder: string;
  version?: number;
  createdAt?: string;
}

export interface AuthUserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  avatar?: CloudinaryImageDto;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokensDto {
  accessToken: string;
  expiresIn: string;
  user: AuthUserDto;
}

export interface AuthResult extends AuthTokensDto {
  refreshToken: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  type: 'access';
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: 'refresh';
  iat?: number;
  exp?: number;
}
