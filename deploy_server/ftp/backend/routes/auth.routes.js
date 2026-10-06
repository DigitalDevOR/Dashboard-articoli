"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_controller_1 = require("../controllers/auth.controller");
const jwt_middleware_1 = __importDefault(require("../middlewares/jwt.middleware"));
router.post("/login", auth_controller_1.login);
router.get("/me", jwt_middleware_1.default, auth_controller_1.getCurrentUser);
router.post("/logout", auth_controller_1.logout);
exports.default = router;
