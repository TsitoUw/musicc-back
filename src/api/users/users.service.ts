import { Request } from "express";
import { CResponse, STATUS_CODES } from "../../shared/Response";
import { isEmail, isValidString } from "../../shared/validation";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
const prisma = new PrismaClient()

export interface signupAttribute {
  artistname:string;
  username:string;
  name?:string;
  password:string;
  email:string;
}

export async function signup(body: Request["body"]) {
  if (!body) return new CResponse(STATUS_CODES.EXPECTATION_FAILED, "No body given");
  if (!isValidString(body.artistname, 2)) return new CResponse(STATUS_CODES.EXPECTATION_FAILED, "Firstname should be atleast 2 character");
  if (body.name && !isValidString(body.name, 2)) return new CResponse(STATUS_CODES.EXPECTATION_FAILED, "Lastname should be atleast 2 character");
  if (!isValidString(body.username, 4)) return new CResponse(STATUS_CODES.EXPECTATION_FAILED, "Username should be atleast 4 character");
  if (!isEmail(body.email)) return new CResponse(STATUS_CODES.EXPECTATION_FAILED, "Invalid email given");
  if (!isValidString(body.password, 4)) return new CResponse(STATUS_CODES.EXPECTATION_FAILED, "Password should be atleast 4 character");
  if (!isValidString(body.passwordConfirmation, 4) || body.password !== body.passwordConfirmation) return new CResponse(STATUS_CODES.EXPECTATION_FAILED, "Password not matching");

  const cryptedpw = await bcrypt.hash(body.password, 10);

  const data:signupAttribute = {
    name: body.name as string,
    artistname: body.artistname as string,
    username: body.username as string,
    email: body.email as string,
    password: cryptedpw
  }

  if(!body.name) delete data.name;

  let user: {};
  try {
    user = await prisma.users.create({
      data: data, select: {
        id: true,
        email: true,
        photo: true,
        username: true,
        name: true,
        artistname: true,
      }
    })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) return new CResponse(STATUS_CODES.BAD_REQUEST, error)
    return new CResponse(STATUS_CODES.INTERNAL_SERVER_ERROR, error);
  }

  return new CResponse(STATUS_CODES.CREATED, { user });
}

export async function getOne(params: Request["params"]) {
  if (!isValidString(params.uid)) return new CResponse(STATUS_CODES.EXPECTATION_FAILED, "No user identifiend given in params");
  // uid mean unique identifier wich is id/username/email in this case
  // but we only need id/username here
  const uid = params.uid;
  let user: {} | null;
  // find by username (slug)
  try {
    user = await prisma.users.findUnique({
      where: {
        username: uid
      }, select: {
        id: true,
        email: true,
        photo: true,
        username: true,
        name: true,
        artistname: true,
      }
    });
    if(user!==null) return new CResponse(STATUS_CODES.SUCCESS, { user })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) return new CResponse(STATUS_CODES.BAD_REQUEST, error)
    return new CResponse(STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
  
  // find by id if the bellow querry doesn't find it
  try {
    user = await prisma.users.findUnique({
      where: {
        id: uid
      }, select: {
        id: true,
        email: true,
        photo: true,
        username: true,
        name: true,
        artistname: true,
      }
    });
    if(user!==null) return new CResponse(STATUS_CODES.SUCCESS, { user })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) return new CResponse(STATUS_CODES.BAD_REQUEST, error)
    return new CResponse(STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
  
  return new CResponse(STATUS_CODES.NOT_FOUND, "User not found")
}