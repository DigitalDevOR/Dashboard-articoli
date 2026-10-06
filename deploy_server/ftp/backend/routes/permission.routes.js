"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwt_middleware_1 = __importDefault(require("../middlewares/jwt.middleware"));
const userAccess_middleware_1 = require("../middlewares/userAccess.middleware");
const permission_controller_1 = require("../controllers/permission.controller");
const router = express_1.default.Router();
router.get("/", jwt_middleware_1.default, (0, userAccess_middleware_1.authorizePermission)("permission:assign"), permission_controller_1.getPermissions);
router.get("/:permissionId", jwt_middleware_1.default, (0, userAccess_middleware_1.authorizePermission)("permission:assign"), permission_controller_1.getPermissionById);
exports.default = router;
