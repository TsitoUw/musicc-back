import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import api from "./api";
import checkPublicDir from "../check"

// using environnement variable (.env)
dotenv.config()

// setting port 
const PORT: number = Number(process.env.PORT as string) || 8001;

const app = express()

app.use(cors({origin:'*'}));
app.use(express.json())
app.use(express.static('/public'))

app.use("/api/auth", api.auth);
app.use("/api/users", api.users);
app.use("/api/songs", api.songs);

// listening to the req on the PORT
app.listen(PORT,()=>{ console.log(`Server running at http://localhost:${PORT}`); });