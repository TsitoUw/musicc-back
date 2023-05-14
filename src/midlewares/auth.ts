import { NextFunction, Request, Response } from "express";
import jwt, { GetPublicKeyOrSecret, Secret } from "jsonwebtoken";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as Secret | GetPublicKeyOrSecret, (err, payload) => {
    if (err) return res.status(403).json({ message: "token expired" });
    req.body = { ...req.body, payload }
    next();
  })
}