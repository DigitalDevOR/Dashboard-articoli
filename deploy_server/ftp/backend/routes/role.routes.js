"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const role_controller_1 = require("../controllers/role.controller");
const jwt_middleware_1 = __importDefault(require("../middlewares/jwt.middleware"));
const userAccess_middleware_1 = require("../middlewares/userAccess.middleware");
/*
    {
        "roleId": "68bd50789a12e34567890125",
        "permissionIds": [
            "68bd50c19a12e34567890126",
            "68bd50d59a12e34567890127"
        ]
    }
*/
router.post('/add-permissions-role', jwt_middleware_1.default, (0, userAccess_middleware_1.authorizePermission)('permission:assign'), role_controller_1.addPermissionsToRole);
router.post('/remove-permissions-role', jwt_middleware_1.default, (0, userAccess_middleware_1.authorizePermission)('permission:assign'), role_controller_1.removePermissionsFromRole);
router.get('/', jwt_middleware_1.default, (0, userAccess_middleware_1.authorizePermission)('permission:assign'), role_controller_1.getRoles);
exports.default = router;
