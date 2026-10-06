"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const jwt_middleware_1 = __importDefault(require("../middlewares/jwt.middleware"));
const userAccess_middleware_1 = require("../middlewares/userAccess.middleware");
const user_controller_1 = require("../controllers/user.controller");
router.get("/", jwt_middleware_1.default, userAccess_middleware_1.authorizeUserRead, user_controller_1.getUsers);
router.post("/create-user", jwt_middleware_1.default, userAccess_middleware_1.authorizeUserCreation, user_controller_1.createUser);
router.post("/update-user", jwt_middleware_1.default, userAccess_middleware_1.authorizeUserUpdate, user_controller_1.updateUser);
router.delete("/:userId", jwt_middleware_1.default, userAccess_middleware_1.authorizeUserDeletion, user_controller_1.deleteUser);
/*
    {
        "oldPassword": "vecchiaPassword",
        "password": "nuovaPassword"
    }
*/
router.post("/update-user-password", jwt_middleware_1.default, user_controller_1.updateUserPassword);
/*
    {
        "email": "nuovaemail@example.com"
    }
*/
router.post("/update-user-email", jwt_middleware_1.default, user_controller_1.updateUserEmail);
exports.default = router;
