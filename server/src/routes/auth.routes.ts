import express from "express";
const router = express.Router();
import { getCurrentUser, login, logout } from "../controllers/auth.controller";
import requestHasValidAccessToken from "../middlewares/jwt.middleware";

router.post("/login", login);
router.get("/me", requestHasValidAccessToken, getCurrentUser);
router.post("/logout", logout);

export default router;