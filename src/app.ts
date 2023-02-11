import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import api from "./api";
import { streamMedia } from "./shared/streamMedia";

// using environnement variable (.env)
dotenv.config()

// setting port 
const PORT: number = parseInt(process.env.PORT as string) || 8000;

const app = express()

app.use(cors());
app.use(express.json())
app.use(express.static('public'))

app.use("/api/auth", api.auth);
app.use("/api/users", api.users);
app.use("/someSong/:filename",(req:Request,res:Response)=>{
  streamMedia(req,res,"audio",req.params.filename);
})

app.use("/",(req:Request,res:Response)=>{res.send("Server running")});
// listening to the req on the PORT
app.listen(PORT,()=>{ console.log(`Server running at http://localhost:${PORT}`); });