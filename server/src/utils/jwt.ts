import jwt, {
  JwtPayload,
  SignOptions,
  TokenExpiredError,
  JsonWebTokenError,
} from "jsonwebtoken";

import { AccessTokenPayload } from "../types/auth.types";

export interface RefreshTokenPayload extends JwtPayload {
  sub: string;
  type: "refresh";
}

const getAccessTokenSecret = (): string => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_ACCESS_SECRET non configurato nelle variabili d'ambiente"
    );
  }

  return secret;
};

const getRefreshTokenSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_REFRESH_SECRET non configurato nelle variabili d'ambiente"
    );
  }

  return secret;
};

const getAccessTokenExpiration = (): SignOptions["expiresIn"] => {
  return (process.env.JWT_ACCESS_EXPIRES_IN ||
    "15m") as SignOptions["expiresIn"];
};

const getRefreshTokenExpiration = (): SignOptions["expiresIn"] => {
  return (process.env.JWT_REFRESH_EXPIRES_IN ||
    "7d") as SignOptions["expiresIn"];
};

export const generateAccessToken = (
  userId: string
): string => {
  const payload: AccessTokenPayload = {
    sub: userId,
    type: "access",
  };

  return jwt.sign(
    payload,
    getAccessTokenSecret(),
    {
      expiresIn: getAccessTokenExpiration(),
    }
  );
};

export const generateRefreshToken = (
  userId: string
): string => {
  const payload: RefreshTokenPayload = {
    sub: userId,
    type: "refresh",
  };

  return jwt.sign(
    payload,
    getRefreshTokenSecret(),
    {
      expiresIn: getRefreshTokenExpiration(),
    }
  );
};

export const verifyAccessToken = (
  token: string
): AccessTokenPayload => {
  const decoded = jwt.verify(
    token,
    getAccessTokenSecret()
  ) as AccessTokenPayload;

  if (
    !decoded.sub ||
    decoded.type !== "access"
  ) {
    throw new JsonWebTokenError(
      "Access token non valido"
    );
  }

  return decoded;
};

export const verifyRefreshToken = (
  token: string
): RefreshTokenPayload => {
  const decoded = jwt.verify(
    token,
    getRefreshTokenSecret()
  ) as RefreshTokenPayload;

  if (
    !decoded.sub ||
    decoded.type !== "refresh"
  ) {
    throw new JsonWebTokenError(
      "Refresh token non valido"
    );
  }

  return decoded;
};

export const decodeToken = (
  token: string
): JwtPayload | null => {
  const decoded = jwt.decode(token);

  if (
    !decoded ||
    typeof decoded === "string"
  ) {
    return null;
  }

  return decoded;
};

export const isTokenExpiredError = (
  error: unknown
): error is TokenExpiredError => {
  return error instanceof TokenExpiredError;
};

export const isJwtError = (
  error: unknown
): error is JsonWebTokenError => {
  return error instanceof JsonWebTokenError;
};