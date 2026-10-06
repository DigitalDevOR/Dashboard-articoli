"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.articleQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_config_1 = require("../config/redis.config");
exports.articleQueue = new bullmq_1.Queue("articles", {
    connection: redis_config_1.redisConnection,
});
