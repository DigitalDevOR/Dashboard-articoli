import { Request, Response } from "express";
import mongoose from "mongoose";

import Role from "../models/roles.model";
import Permission from "../models/permission.model";

export const getRoles = async (_req: Request, res: Response) => {
    try {
        const roles = await Role.find()
            .populate("permissions")
            .sort({ roleName: 1 });

        return res.status(200).json({ roles });
    } catch (error) {
        console.error("Errore durante il recupero dei ruoli:", error);
        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
};


export const addPermissionsToRole = async (
    req: Request,
    res: Response
) => {
    try {
        const { roleId, permissionIds } = req.body;

        if (!mongoose.Types.ObjectId.isValid(roleId)) {
            return res.status(400).json({
                message: "ID ruolo non valido.",
            });
        }

        if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
            return res.status(400).json({
                message: "Devi specificare almeno un permissionId.",
            });
        }

        const uniquePermissionIds = [...new Set(permissionIds)];

        const invalidPermissionIds = uniquePermissionIds.filter(
            (permissionId) =>
                !mongoose.Types.ObjectId.isValid(permissionId)
        );

        if (invalidPermissionIds.length > 0) {
            return res.status(400).json({
                message: "Uno o più permissionId non sono validi.",
                invalidPermissionIds,
            });
        }

        const role = await Role.findById(roleId);

        if (!role) {
            return res.status(404).json({
                message: "Ruolo non trovato.",
            });
        }

        const permissions = await Permission.find({
            _id: {
                $in: uniquePermissionIds,
            },
        });

        if (permissions.length !== uniquePermissionIds.length) {
            return res.status(404).json({
                message: "Uno o più permessi non esistono.",
            });
        }

        const updatedRole = await Role.findByIdAndUpdate(
            roleId,
            {
                $addToSet: {
                    permissions: {
                        $each: uniquePermissionIds.map(
                            (permissionId) =>
                                new mongoose.Types.ObjectId(permissionId)
                        ),
                    },
                },
            },
            {
                new: true,
            }
        ).populate("permissions");

        return res.status(200).json({
            message: "Permessi associati correttamente.",
            role: updatedRole,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
};


export const removePermissionsFromRole = async (
    req: Request,
    res: Response
) => {
    try {
        const { roleId, permissionIds } = req.body;

        if (!mongoose.Types.ObjectId.isValid(roleId)) {
            return res.status(400).json({
                message: "ID ruolo non valido.",
            });
        }

        if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
            return res.status(400).json({
                message: "Devi specificare almeno un permissionId.",
            });
        }

        const uniquePermissionIds = [...new Set(permissionIds)];

        const invalidPermissionIds = uniquePermissionIds.filter(
            (permissionId) =>
                !mongoose.Types.ObjectId.isValid(permissionId)
        );

        if (invalidPermissionIds.length > 0) {
            return res.status(400).json({
                message: "Uno o più permissionId non sono validi.",
                invalidPermissionIds,
            });
        }

        const role = await Role.findById(roleId);

        if (!role) {
            return res.status(404).json({
                message: "Ruolo non trovato.",
            });
        }

        const updatedRole = await Role.findByIdAndUpdate(
            roleId,
            {
                $pull: {
                    permissions: {
                        $in: uniquePermissionIds.map(
                            (permissionId) =>
                                new mongoose.Types.ObjectId(permissionId)
                        ),
                    },
                },
            },
            {
                new: true,
            }
        ).populate("permissions");

        return res.status(200).json({
            message: "Permessi dissociati correttamente.",
            role: updatedRole,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Errore interno del server.",
        });
    }
}; 