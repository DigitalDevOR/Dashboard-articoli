import { Request, Response, NextFunction } from "express";

// Extend Express Request interface to include adminId
declare global {
  namespace Express {
    interface Request {
      adminId?: string;
    }
  }
}

