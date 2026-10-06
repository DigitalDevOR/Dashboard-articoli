import express from "express";
import requestHasValidAccessToken from "../middlewares/jwt.middleware";
import { authorizePermission } from "../middlewares/userAccess.middleware";
import { getPermissionById, getPermissions } from "../controllers/permission.controller";

const router = express.Router();

router.get("/", requestHasValidAccessToken, authorizePermission("permission:assign"), getPermissions);
router.get("/:permissionId", requestHasValidAccessToken, authorizePermission("permission:assign"), getPermissionById);

export default router;