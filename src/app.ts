import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import api from "./api";

import { Prisma, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// using environnement variable (.env)
dotenv.config()

// setting port 
const PORT: number = parseInt(process.env.PORT as string) || 8000;

const app = express()

app.use(cors());
app.use(express.json())

app.use("/api/auth", api.auth);
app.use("/api/users", api.users);

// listening to the req on the PORT
app.listen(PORT, () => { console.log(`Server running at http://localhost:${PORT}`);  }) 