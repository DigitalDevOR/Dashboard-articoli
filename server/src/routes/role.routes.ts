import express from 'express';
const router = express.Router();
import { addPermissionsToRole, getRoles, removePermissionsFromRole } from '../controllers/role.controller';
import requestHasValidAccessToken from '../middlewares/jwt.middleware';
import { authorizePermission } from '../middlewares/userAccess.middleware';
/*
    {
        "roleId": "68bd50789a12e34567890125",
        "permissionIds": [
            "68bd50c19a12e34567890126",
            "68bd50d59a12e34567890127"
        ]
    }
*/
router.post('/add-permissions-role', requestHasValidAccessToken, authorizePermission('permission:assign'), addPermissionsToRole);
router.post('/remove-permissions-role', requestHasValidAccessToken, authorizePermission('permission:assign'), removePermissionsFromRole);
router.get('/', requestHasValidAccessToken, authorizePermission('permission:assign'), getRoles);

export default router;