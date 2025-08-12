from models import *
from fastapi.responses import StreamingResponse
from fastapi import FastAPI, HTTPException, Depends, Body
from pydantic import BaseModel
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from modulos.instagram.utils import score_interpolacion, obtener_engagement_promedio
from modulos.maps.utils import obtener_reviews_formateadas
from modulos.OpenAI.sentimiento import clasificar, calcular_puntaje, Mejorar, contar_desde_texto
from modulos.financiero.utils import DeterminarActivoPasivoPatrimonio, score_balance, ganancia_promedio_mensual, score_flujo_caja
import json
import uuid
from fastapi import BackgroundTasks

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

# Diccionario en memoria para simular un sistema de tickets y estados
tickets_status = {}

async def proceso_asincronico(ticket_id: str, data: ProcessRequest):

    igUser = data.instagramUsername
    engagement_rate = await obtener_engagement_promedio(igUser)
    scoreInstagram = await score_interpolacion(engagement_rate)

    resultadosInstagramn = {"score": scoreInstagram, "engagement":engagement_rate}

    
    #Código para obtener reviews y analizarlas en el clasificador de sentimientos
    lista = obtener_reviews_formateadas(data.placeID)
    textoFormated = ""
    contador = 1
    for review in lista:
        try:
            print(contador)
            reviewText = review.get("review_text", None)

            if reviewText != None and reviewText != "":
                textoFormated += f"\n{contador}. {reviewText}\n"
                contador += 1
        except Exception as e:
            print(f"algo fallo {e}")
    
    clasificacion = await clasificar(textoFormated)
    totales, subcategorias, resumen = await contar_desde_texto(clasificacion)
    areasMejora = await Mejorar(str(totales) + str(subcategorias), resumen)
    scoreMapsTwitter = await calcular_puntaje(totales, subcategorias )

    negativoCount = {"count":totales.get("Negativo", 0)} | subcategorias.get("Negativo", {})
    positivoCount = {"count":totales.get("Positivo", 0)} | subcategorias.get("Positivo", {})
    resultadosMapsTwitter = {"negativo": negativoCount, "positivo": positivoCount, "neutral": totales.get("Neutral", 0), "retroalimentacion":areasMejora, "score": scoreMapsTwitter}
       

    activo, pasivo, patrimonio = await DeterminarActivoPasivoPatrimonio(data.balance)
    scorePatrimonio = await score_balance(data.cantidad, patrimonio)
    resultadosPatrimonio = {"count":patrimonio, "score": scorePatrimonio},

    gananciaPromedio = await ganancia_promedio_mensual(data.historico)
    scoreHistorico = await score_flujo_caja(data.cantidad, data.duracion, gananciaPromedio)
    resultadosFlujoe = {"ingresos": gananciaPromedio, "egresos": 123, "score": scoreHistorico}

    resultadosFinal = {"instagram":resultadosInstagramn, "maps-twitter": resultadosMapsTwitter, "patrimonio":resultadosPatrimonio, "balance":patrimonio, "flujo": resultadosFlujoe}
    tickets_status[ticket_id] = {"status": "completed", "result": resultadosFinal}


@app.post('/iniciar-proceso')
async def iniciar_proceso(data: ProcessRequest, background_tasks: BackgroundTasks):
    ticket_id = str(uuid.uuid4())
    tickets_status[ticket_id] = {"status": "processing"}

    # Se lanza el proceso en background para no bloquear el request
    background_tasks.add_task(proceso_asincronico, ticket_id, data)

    return {"ticket": ticket_id, "message": "Proceso iniciado"}

@app.get('/estado-proceso/{ticket_id}')
async def estado_proceso(ticket_id: str):
    status_info = tickets_status.get(ticket_id)
    if not status_info:
        return {"estatus": "pendiente", "message": "Ticket no encontrado aún, por favor intenta de nuevo más tarde."}
    return {
        "estatus": status_info.get("status", "pendiente"),
        "result": status_info.get("result", None)
    }