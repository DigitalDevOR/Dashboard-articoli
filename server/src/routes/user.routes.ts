import express from "express";
const router = express.Router();
import requestHasValidAccessToken from "../middlewares/jwt.middleware";
import {
    authorizeUserCreation,
    authorizeUserDeletion,
    authorizeUserRead,
    authorizeUserUpdate,
} from "../middlewares/userAccess.middleware";
import { createUser, deleteUser, getUsers, updateUser, updateUserPassword, updateUserEmail } from "../controllers/user.controller";


router.get("/", requestHasValidAccessToken, authorizeUserRead, getUsers);
router.post("/create-user", requestHasValidAccessToken, authorizeUserCreation, createUser);
router.post("/update-user", requestHasValidAccessToken, authorizeUserUpdate, updateUser);
router.delete("/:userId", requestHasValidAccessToken, authorizeUserDeletion, deleteUser);

/* 
    {
        "oldPassword": "vecchiaPassword",
        "password": "nuovaPassword"
    }
*/
router.post("/update-user-password", requestHasValidAccessToken, updateUserPassword);

/* 
    {
        "email": "nuovaemail@example.com"
    }
*/
router.post("/update-user-email", requestHasValidAccessToken, updateUserEmail);

export default router;