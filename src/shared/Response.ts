import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { Response } from "express";

/**
 * Custom Response that handle object|string|Error data
 * and convert them to an appropriate object
 * 
 * Error need to be casted as Error :')
 * 
 * @param status Status Code
 * @param payload data to return to or string for just a message and Error object
 */
export class CResponse {
  status: number;
  data?: object;
  message?: string;
  error?: object | string;
  constructor(status: number, payload?: object | string | unknown) {
    this.status = status;
    if (payload && typeof payload === "object" && status < 300) this.data = payload;
    if (payload && typeof payload === "string" && status < 300) this.message = payload
    if (payload && status >= 300 && typeof payload !== "string") this.error = { ...payload as Error, message: (payload as Error).message };
    if (payload && status >= 300 && typeof payload === "string") this.error = {message: payload}
  }
}

/**
 * Sending appropriate response
 * 
 * @param response Take Express response object
 * @param payload Take CustomReponse 
 */
export function sendResponse(response: Response, payload: CResponse) {
  const status: number = payload.status;

  if ("data" in payload || "message" in payload || "error" in payload) response.status(status).json({ ...payload, ...payload.data, data:undefined, status: undefined });
  else response.sendStatus(status);
}

export const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHENTICATED: 401,
  FORBIDEN: 403,
  NOT_FOUND: 404,
  EXPECTATION_FAILED: 417,
  INTERNAL_SERVER_ERROR: 500
}