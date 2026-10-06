"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadGettyImage = exports.getGettyAccessToken = void 0;
const axios_1 = __importDefault(require("axios"));
let cachedAccessToken = null;
let accessTokenExpiresAt = 0;
const getGettyAccessToken = () => __awaiter(void 0, void 0, void 0, function* () {
    if (cachedAccessToken &&
        Date.now() < accessTokenExpiresAt) {
        return cachedAccessToken;
    }
    const apiKey = process.env.GETTY_API_KEY || 'f3ytg2zzar8y4bdu4uqw7quk';
    const apiSecret = process.env.GETTY_API_SECRET || 'TRp3pR9NpvuiJCv4rUVh';
    if (!apiKey || !apiSecret) {
        throw new Error("Credenziali Getty mancanti");
    }
    const body = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: apiKey,
        client_secret: apiSecret,
    });
    const response = yield axios_1.default.post("https://api.gettyimages.com/oauth2/token", body, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    const { access_token, expires_in, } = response.data;
    if (!access_token) {
        throw new Error("Getty non ha restituito un access token");
    }
    cachedAccessToken = access_token;
    accessTokenExpiresAt =
        Date.now() + (expires_in - 60) * 1000;
    return cachedAccessToken;
});
exports.getGettyAccessToken = getGettyAccessToken;
const downloadGettyImage = (downloadUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = yield (0, exports.getGettyAccessToken)();
    const response = yield axios_1.default.post(downloadUrl, null, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Api-Key": process.env.GETTY_API_KEY || 'f3ytg2zzar8y4bdu4uqw7quk',
        },
        responseType: "arraybuffer",
    });
    if (response.headers["content-type"] !== "image/jpeg") {
        throw new Error(`Getty ha restituito un content-type inatteso: ${response.headers["content-type"]}`);
    }
    return Buffer.from(response.data);
});
exports.downloadGettyImage = downloadGettyImage;
