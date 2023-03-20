import path, { extname } from "path";
import * as fs from 'fs';
import { Request, Response } from "express";
import sharp from "sharp";
import { promisify } from "util";
import { pipeline } from "stream";


export default function imageUploader(req: Request, res: Response, type: "artwork" | "profilepic", finalname: string): void {
  const pipelineAsync = promisify(pipeline);
  const filename = finalname;
  const filepath = path.join("/public", filename);
  const writable = fs.createWriteStream(filepath);
  req.pipe(writable);

  writable.on('finish', async () => {
    try {
      const image = sharp(filepath);
      image.resize({ width: 1000, height: 1000, fit: "cover" });

      image.jpeg({ quality: 70 });
      const processedfname = filename.replace(extname(finalname), ".jpeg")
      const newfp = path.join("/public", processedfname);
      await pipelineAsync(image, fs.createWriteStream(newfp))

      res.send(processedfname);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error processing image');
    } finally {
      fs.unlink(filepath, err => {
        if (err) console.error(err)
      })
    }
  });
}