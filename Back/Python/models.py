from models import *
from fastapi.responses import StreamingResponse
from fastapi import FastAPI, HTTPException, Depends, Body
from pydantic import BaseModel
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
import json

app = FastAPI()



origins = ["http://127.0.0.1:5500", 
           "http://0.0.0.0:8000",
           "http://localhost:3000",
           "http://localhost:3001",
           "http://192.168.100.92:5500"]  # Adjust as per your CORS needs

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


@app.get('/')
async def index():
    return {'message': '¡Creencia en línea!'}

