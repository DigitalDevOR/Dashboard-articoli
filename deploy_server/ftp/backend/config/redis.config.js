"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = void 0;
exports.redisConnection = {
    host: (_a = process.env.REDIS_HOST) !== null && _a !== void 0 ? _a : "localhost",
    port: Number((_b = process.env.REDIS_PORT) !== null && _b !== void 0 ? _b : 6379),
};
