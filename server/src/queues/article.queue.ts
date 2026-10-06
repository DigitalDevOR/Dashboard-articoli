import { Queue } from "bullmq";

import { redisConnection } from "../config/redis.config";
import { Article } from "../types/article.types";

export const articleQueue = new Queue<Article>("articles", {
  connection: redisConnection,
});