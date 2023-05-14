import { existsSync, mkdirSync } from "fs";
import path from "path";

export default function checkPublicDir(){
  if(!existsSync(path.join(__dirname, '/public'))){
    mkdirSync(path.join(__dirname, "/public"))
  }
  
  if(!existsSync(path.join(__dirname, '/public', "artwork"))){
    mkdirSync(path.join(__dirname, "/public", "artwork"))
  }
  
  if(!existsSync(path.join(__dirname, '/public', "profilepic"))){
    mkdirSync(path.join(__dirname, "/public", "profilepic"))
  }
  
  if(!existsSync(path.join(__dirname, '/public', "audio"))){
    mkdirSync(path.join(__dirname, "/public", "audio"))
  }
}