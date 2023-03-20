import { Request, Response } from "express";
import * as fs from "fs"
import path from "path";

export function getSource(type: "audio" | "video", filename: string) {
  const filePath = `${__dirname}/public/${type}/${filename}`;
  if (!fs.existsSync(filePath)) throw new Error(`file: "${filename}" doesn't exist!`);
  const fileSize = fs.statSync(filePath).size

  return { filePath, fileSize }
}

export function getContentLength(range: string, fileSize: number, multiplicator?: number) {
  const CHUNK_SIZE = multiplicator ? multiplicator * (10 ** 6) : 10 ** 6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, fileSize - 1);

  const contentLength = end - start + 1;

  return { contentLength, start, end };
}

export function setHeaders(type: "audio" | "video", filePath: string, start: number, end: number, fileSize: number, contentLength: number) {
  const extname = path.extname(filePath);
  let contentType: string;
  switch (type) {
    case "audio":
      contentType = "audio/" + extname.slice(1)
      break;
    case "video":
      contentType = "video/" + extname.slice(1)
  }
  return {
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": contentType,
  }
}

export function getRange(req: Request, res: Response) {
  const range = req.headers.range;
  if (!range) throw new Error("Requires Range header");
  return range;
}

export function streamMedia(req: Request, res: Response, type: "audio" | "video", filename: string, chunkSizeMultiplicator?: number) {
  try {
    const { filePath, fileSize } = getSource(type, filename);
    const { contentLength, start, end } = getContentLength(getRange(req, res), fileSize, chunkSizeMultiplicator)

    res.writeHead(206, setHeaders(type, filePath, start, end, fileSize, contentLength));
    const mediaStream = fs.createReadStream(filePath, { start, end });
    mediaStream.pipe(res);

  } catch (error) {
    res.status(400).json((error as Error).message)
  }
}