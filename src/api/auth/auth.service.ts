import { CResponse } from "../../shared/Response"
import { PrismaClient } from "@prisma/client";
import { isEmail, isValidString } from "./auth.utils";
import { LoginDto } from "./auth.dto";
import Jwt, { JwtPayload, Secret, VerifyOptions } from "jsonwebtoken"; "jsonwebtoken"
import bcrypt from "bcrypt";
import { Request } from "express";

const prisma = new PrismaClient()

// types for finding user
export interface UserPartial {
  id: string;
  email: string;
  password?: string;
}

export const login = async (body: LoginDto) => {
  //Verify if there request data is as what we exept
  if (!body) return new CResponse(417);
  if (!isEmail(body.email)) return new CResponse(417);
  if (!isValidString(body.password, 3)) return new CResponse(417);

  // find the user
  let user: UserPartial | null;
  try {
    user = (await prisma.users.findUnique({ where: { email: body.email }, select: { id: true, email: true, password: true } })) as UserPartial;
    if (!user) return new CResponse(400);
  } catch (error) {
    return new CResponse(500)
  }

  const passwordMatch = await bcrypt.compare(body.password, user.password as string);
  if (!passwordMatch) return new CResponse(400);

  // generating access token and refresh token
  const payload = { id: user.id };
  const accessToken = generateAccessToken(payload)
  const refreshToken = Jwt.sign(payload, (process.env.REFRESH_TOKEN_SECRET as Secret));
  try {
    await prisma.refreshTokens.create({ data: { token: refreshToken } });
  } catch (error) {
    return new CResponse(500, error)
  }

  return new CResponse(200, { accessToken, refreshToken });
}

/**
 * send new access token as it expires depending on the refresh token given
 */
export const refreshToken = async (body: Request["body"]) => {
  if (!body.token) return new CResponse(401, "No refresh token given");
  const reqRefreshToken = body.token;

  // verify if the refresh token exist in the database
  try {
    const savedRT = await prisma.refreshTokens.findUnique({ where: { token: reqRefreshToken }, select: { token: true } });
    if (!savedRT) return new CResponse(403)
  } catch (error) {
    return new CResponse(500, error);
  }
  let verified:string|Jwt.JwtPayload
  
  // verify the request refresh token to get the data inside
  try {
    verified = Jwt.verify(reqRefreshToken, (process.env.REFRESH_TOKEN_SECRET as Secret))
  } catch (error) {
    return new CResponse(403);
  }

  const accessToken = generateAccessToken({id: (verified as {id:string, iat:number}).id})
  return new CResponse(200, {accessToken})
}

/**
 * 
 * generating access token expires time is defined in .env
 * 
 * @param payload {id:string}
 * @returns 
 */
function generateAccessToken(payload: { id: string }) {
  return Jwt.sign(payload, (process.env.ACCESS_TOKEN_SECRET as Secret), { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION || "15m" })
}

export const logout = async (body: Request["body"]) => {
  if(!body.token) return new CResponse(401, "No refresh token given");
  const reqRT = body.token;

  try {
    const savedRT = await prisma.refreshTokens.delete({where:{token:reqRT}});
    if(!savedRT) new CResponse(403);
    return new CResponse(204);
  } catch (error) {
    return new CResponse(500);
  }
}