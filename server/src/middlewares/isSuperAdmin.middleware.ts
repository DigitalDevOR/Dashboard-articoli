import { Response, Request, NextFunction } from 'express';
import { RequestWithAccessToken } from '../types/express.types';
import User from '../models/user.model';

const isSuperAdmin = async (req: RequestWithAccessToken, res: Response, next: NextFunction) => {
    const userRequest = req.userDecoded;

    if (!userRequest) {
        return res.status(401).json({
            message: "Accesso negato. Utente non autenticato.",
        });
    }

    const user = await User.findById(userRequest.sub);

    if (!user || !user.isSuperAdmin) {
        return res.status(403).json({
            message: "Accesso negato. Utente non autorizzato.",
        });
    }

    next();
}

export default isSuperAdmin;