import { Request, Response, NextFunction } from "express";
import {
  verifyAccessToken,
} from "../utils/jwt";

import { RequestWithAccessToken } from "../types/express.types";


const requestHasValidAccessToken = (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies?.accessToken;

  if (!req.cookies?.accessToken) {
    return res.status(401).json({
      message: "Accesso negato. Token mancante.",
    });
  }

  try {
    const decodedToken = verifyAccessToken(accessToken);

    req.userDecoded = decodedToken;

    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Accesso negato. Token non valido.",
    });
  }
};

export default requestHasValidAccessToken;