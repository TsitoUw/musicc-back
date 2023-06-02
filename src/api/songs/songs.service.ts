import { Request, RequestParamHandler, Response } from "express";
import fileUpload from "../../shared/fileUpload";
import { CResponse, STATUS_CODES } from "../../shared/Response";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { streamMedia } from "../../shared/streamMedia";

const prisma = new PrismaClient()

export async function storeAudioFile(req: Request, res: Response) {
  fileUpload(req, res, "audio");
}

export async function storeArtworkFile(req: Request, res: Response) {
  fileUpload(req, res, "artwork");
}

export async function store(body: Request["body"]) {
  const ownerId = body.ownerId;
  if (!ownerId) return new CResponse(417, "Field 'ownerId' is required");
  const filename = body.filename
  if (!filename) return new CResponse(417, "Field 'filename' is required")
  const artist = body.artist;
  if (!artist) return new CResponse(417, "Field 'artist' is required")
  const title = body.title;
  if (!title) return new CResponse(417, "Field 'title' is required");

  const description = body.description ? body.description : null;
  const releaseDate = body.releaseDate ? body.releaseDate : null;
  const artwork = body.artwork ? body.artwork : null;

  const data = {
    ownerId: ownerId as string,
    artist: artist as string,
    title: title as string,
    filename: filename as string,
    description: description as string | null,
    releaseDate: new Date(releaseDate) as Date | null,
    artwork: artwork as string | null,
  }

  try {
    const song = await prisma.songs.create({ data: data });
    return new CResponse(STATUS_CODES.CREATED, { message: "Song saved", song });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) return new CResponse(STATUS_CODES.BAD_REQUEST, error)
    return new CResponse(STATUS_CODES.INTERNAL_SERVER_ERROR, error);
  }
}

export function streamAudio(req: Request, res: Response) {
  if (!req.params.filename) return res.status(400).json({ error: { message: "Filename should be given in params" } });
  streamMedia(req, res, "audio", req.params.filename);
}

export async function get(params?: Request['query']) {

  const byUserQuery = {
    owner: {
      username: {
        equals: params?.user
      }
    }
  }

  const seacrchQuery = {
    OR: [
      {
        artist: {
          contains: params?.search as string,
          mode: 'insensitive',
        }
      },
      {
        title: {
          contains: params?.search as string,
          mode: 'insensitive',
        }
      },

    ],
  }

  const query = params?.search ? seacrchQuery : params?.user ? byUserQuery : undefined

  try {
    const songs = await prisma.songs.findMany({
      select: {
        id: true,
        artist: true,
        title: true,
        artwork: true,
        description: true,
        filename: true,
        owner: {
          select: {
            username: true,
            artistname: true,
          }
        },
        _count: { select: { comments: true, favoritedBy: true } }
      },
      where: {

        ...query as any
      }
    });
    return new CResponse(STATUS_CODES.SUCCESS, { songs });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) return new CResponse(STATUS_CODES.BAD_REQUEST, error);
    return new CResponse(STATUS_CODES.INTERNAL_SERVER_ERROR, error);
  }
}