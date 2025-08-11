import os
import requests
from dotenv import load_dotenv
from pprint import pprint

# Cargar variables del archivo .env
#Módulo para obtener reviews de un lugar con un place id
#API: https://rapidapi.com/letscrape-6bRBa3QguO5/api/local-business-data
# 500 000 Request gratuitas 

load_dotenv()

RAPID_API_KEY = os.getenv("RAPID_API_KEY")
if not RAPID_API_KEY:
    raise ValueError("No se encontró la clave RAPID_API_KEY en el archivo .env")

def obtener_reviews(place_id: str):
    global RAPID_API_KEY
    """
    Obtiene las reseñas de un negocio desde la API de RapidAPI usando su business_id (place_id).
    El límite está fijado en 1000 reseñas.
    
    :param place_id: ID del negocio en formato Google Place (business_id)
    :return: JSON con los datos de las reseñas o None si ocurre un error
    """
    

    url = "https://local-business-data.p.rapidapi.com/business-reviews-v2"
    params = {
        "business_id": place_id,
        "limit": 100,
        "translate_reviews": "false",
        "sort_by": "most_relevant",
        "language": "es"
    }
    headers = {
        "x-rapidapi-host": "local-business-data.p.rapidapi.com",
        "x-rapidapi-key": RAPID_API_KEY
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()  # Lanza error si el status no es 200
        return response.json()
    except requests.RequestException as e:
        print(f"Error en la solicitud: {e}")
        return None
    
def formatear_reviews(api_response):
    """
    Regresa la respuesta de la API de modo que cada elemento es una review:

    {
    "review_text": review_text,
    "rating": rating,
    "fecha": fecha
    }

    :param api_response: Respuesta de la API de rewiews de local business
    :return: Lista de reviews
        """
    reviews_list = []

    try:
        reviews = api_response.get("data", {}).get("reviews", [])
    except Exception as e:
        print(f"Error al acceder a las reseñas: {e}")
        return reviews_list  # Lista vacía si falla

    for r in reviews:
        try:
            review_text = r.get("review_text") or ""
            rating = r.get("rating") or None
            fecha = r.get("review_datetime_utc") or None

            reviews_list.append({
                "review_text": review_text,
                "rating": rating,
                "fecha": fecha
            })
        except Exception as e:
            print(f"Error procesando una reseña: {e}")
            continue  # Saltar al siguiente review si falla

    return reviews_list

def obtener_reviews_formateadas(place_id):
    responseAPI = obtener_reviews(place_id)
    contenido = formatear_reviews(responseAPI)
    return contenido

#Código para obtener reviews y analizarlas en el clasificador de sentimientos
#lista = obtener_reviews_formateadas("ChIJA-CS4I2a1ZER-b8jGs3iaXo")
#textoFormated = ""
#contador = 1
#for i in range(0, 100):
#    try:
#        print(contador)
#        review = lista[i]
#        reviewText = review.get("review_text", None)
#
#        if reviewText != None and reviewText != "":
#            textoFormated += f"\n{contador}. {reviewText}\n"
#            contador += 1
#    except Exception as e:
#        print(f"algo fallo {e}")
#
#print(textoFormated)
