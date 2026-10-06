"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.isJwtError = exports.isTokenExpiredError = exports.decodeToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const getAccessTokenSecret = () => {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
        throw new Error("JWT_ACCESS_SECRET non configurato nelle variabili d'ambiente");
    }
    return secret;
};
const getRefreshTokenSecret = () => {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
        throw new Error("JWT_REFRESH_SECRET non configurato nelle variabili d'ambiente");
    }
    return secret;
};
const getAccessTokenExpiration = () => {
    return (process.env.JWT_ACCESS_EXPIRES_IN ||
        "15m");
};
const getRefreshTokenExpiration = () => {
    return (process.env.JWT_REFRESH_EXPIRES_IN ||
        "7d");
};
const generateAccessToken = (userId) => {
    const payload = {
        sub: userId,
        type: "access",
    };
    return jsonwebtoken_1.default.sign(payload, getAccessTokenSecret(), {
        expiresIn: getAccessTokenExpiration(),
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId) => {
    const payload = {
        sub: userId,
        type: "refresh",
    };
    return jsonwebtoken_1.default.sign(payload, getRefreshTokenSecret(), {
        expiresIn: getRefreshTokenExpiration(),
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, getAccessTokenSecret());
    if (!decoded.sub ||
        decoded.type !== "access") {
        throw new jsonwebtoken_1.JsonWebTokenError("Access token non valido");
    }
    return decoded;
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, getRefreshTokenSecret());
    if (!decoded.sub ||
        decoded.type !== "refresh") {
        throw new jsonwebtoken_1.JsonWebTokenError("Refresh token non valido");
    }
    return decoded;
};
exports.verifyRefreshToken = verifyRefreshToken;
const decodeToken = (token) => {
    const decoded = jsonwebtoken_1.default.decode(token);
    if (!decoded ||
        typeof decoded === "string") {
        return null;
    }
    return decoded;
};
exports.decodeToken = decodeToken;
const isTokenExpiredError = (error) => {
    return error instanceof jsonwebtoken_1.TokenExpiredError;
};
exports.isTokenExpiredError = isTokenExpiredError;
const isJwtError = (error) => {
    return error instanceof jsonwebtoken_1.JsonWebTokenError;
};
exports.isJwtError = isJwtError;
