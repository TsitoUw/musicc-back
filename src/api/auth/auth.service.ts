import { CResponse, STATUS_CODES } from "../../shared/Response"
import { PrismaClient } from "@prisma/client";
import { isEmail, isValidString } from "../../shared/validation";
import { LoginDto } from "./auth.dto";
import Jwt, { Secret } from "jsonwebtoken"; "jsonwebtoken"
import bcrypt from "bcrypt";
import { Request } from "express";

const prisma = new PrismaClient()

// types for user
export interface UserAttributes {
  id: string;
  name?: string;
  artistname: string;
  username: string;
  photo?: string;
  email: string;
  password?: string;
}

export const login = async (body: LoginDto) => {
  //Verify if there request data is as what we exept
  if (!body) return new CResponse(STATUS_CODES.EXPECTATION_FAILED);
  if (!isValidString(body.uid)) return new CResponse(STATUS_CODES.EXPECTATION_FAILED, "Invalid email given");
  if (!isValidString(body.password)) return new CResponse(STATUS_CODES.EXPECTATION_FAILED, "Invalid password given");

  // find the user
  let user: UserAttributes | null;
  try {
    user = (await prisma.users.findUnique({ where: { email: body.uid }, select: { id: true, name: true, artistname: true, username: true, photo: true, email: true, password: true } })) as UserAttributes;
  } catch (error) {
    return new CResponse(STATUS_CODES.INTERNAL_SERVER_ERROR, error)
  }

  if(!user){
    try {
      user = (await prisma.users.findUnique({ where: { username: body.uid }, select: { id: true, name: true, artistname: true, username: true, photo: true, email: true, password: true } })) as UserAttributes;
      if(!user) return new CResponse(STATUS_CODES.NOT_FOUND, "User not found")
    } catch (error) {
      return new CResponse(STATUS_CODES.INTERNAL_SERVER_ERROR, error)
    }
  }

  const passwordMatch = await bcrypt.compare(body.password, user.password as string);
  if (!passwordMatch) return new CResponse(STATUS_CODES.BAD_REQUEST, "Password not matching");

  // generating access token and refresh token
  const payload = { id: user.id };
  const accessToken = generateAccessToken(payload)
  const refreshToken = Jwt.sign(payload, (process.env.REFRESH_TOKEN_SECRET as Secret));
  try {
    await prisma.refreshTokens.create({ data: { token: refreshToken } });
  } catch (error) {
    return new CResponse(STATUS_CODES.INTERNAL_SERVER_ERROR, error)
  }

  delete user.password

  return new CResponse(STATUS_CODES.SUCCESS, { user, accessToken, refreshToken });
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
    if (!savedRT) return new CResponse(STATUS_CODES.FORBIDEN)
  } catch (error) {
    return new CResponse(STATUS_CODES.INTERNAL_SERVER_ERROR, error);
  }
  let verified: string | Jwt.JwtPayload

  // verify the request refresh token to get the data inside
  try {
    verified = Jwt.verify(reqRefreshToken, (process.env.REFRESH_TOKEN_SECRET as Secret))
  } catch (error) {
    return new CResponse(STATUS_CODES.FORBIDEN);
  }

  const accessToken = generateAccessToken({ id: (verified as { id: string, iat: number }).id })
  return new CResponse(STATUS_CODES.SUCCESS, { accessToken })
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
  if (!body.token) return new CResponse(401, "No refresh token given");
  const reqRT = body.token;

  try {
    const savedRT = await prisma.refreshTokens.delete({ where: { token: reqRT } });
    if (!savedRT) new CResponse(STATUS_CODES.FORBIDEN);
    return new CResponse(STATUS_CODES.NO_CONTENT);
  } catch (error) {
    return new CResponse(STATUS_CODES.INTERNAL_SERVER_ERROR, error);
  }
}