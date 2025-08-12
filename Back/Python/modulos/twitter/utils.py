import os
import requests
from dotenv import load_dotenv

#API: https://rapidapi.com/davethebeast/api/twitter241
# 500 requests gratuitas

load_dotenv()
RAPID_API_KEY = os.getenv("RAPID_API_KEY")
if not RAPID_API_KEY:
    raise ValueError("No se encontró la clave RAPID_API_KEY en el archivo .env")


def buscar_tweets(query, count=5, language="es", search_type="Latest"):
    global RAPID_API_KEY
    """
    Busca tweets utilizando la API de Twitter a través de RapidAPI.

    Parámetros:
        query (str): Texto o palabras clave a buscar en Twitter.
        count (int, opcional): Número máximo de tweets a devolver. 
                                Por defecto es 5.
        language (str, opcional): Idioma de los tweets (por ejemplo, "es", "en"). 
                                   Por defecto es "es".
        search_type (str, opcional): Tipo de búsqueda ("Latest", "Top", "Users"). 
                                     Usar "Latest" para obtener tweets recientes. 
                                     Por defecto es "Latest".

    Retorna:
        list[dict]: Lista de diccionarios, cada uno con la información de un tweet:
            - usuario (str): Nombre de usuario con @.
            - nombre (str): Nombre del perfil.
            - texto (str): Contenido completo del tweet.
            - fecha (str): Fecha de creación del tweet.
            - likes (int): Número de 'me gusta'.
            - retweets (int): Número de retweets.

    Excepciones:
        ValueError: Si no se encuentra la clave RAPID_API_KEY en el archivo .env.
        requests.RequestException: Si ocurre un error en la solicitud HTTP.
        Exception: Para errores al procesar la respuesta de la API.

    Nota:
        Esta función filtra únicamente resultados que sean tweets reales
        (itemType = 'TimelineTweet') e ignora módulos de usuarios o cursores.
    """
    
    url = "https://twitter241.p.rapidapi.com/search-v2"

    params = {
        "type": search_type,   # "Latest" para evitar solo módulos de usuarios
        "count": count,
        "query": query,
        "language": language
    }

    headers = {
        "x-rapidapi-host": "twitter241.p.rapidapi.com",
        "x-rapidapi-key": RAPID_API_KEY
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()

        tweets = []
        # Recorrer entries y filtrar solo tweets reales
        instructions = data.get("result", {}).get("timeline", {}).get("instructions", [])
        for instruction in instructions:
            if instruction.get("type") != "TimelineAddEntries":
                continue

            for entry in instruction.get("entries", []):
                content = entry.get("content", {})
                item_content = content.get("itemContent", {})

                if item_content.get("itemType") == "TimelineTweet":
                    tweet_data = item_content.get("tweet_results", {}).get("result", {})
                    legacy = tweet_data.get("legacy", {})
                    user_info = tweet_data.get("core", {}).get("user_results", {}).get("result", {}).get("legacy", {})

                    tweets.append({
                        "usuario": f"@{user_info.get('screen_name')}",
                        "nombre": user_info.get("name"),
                        "texto": legacy.get("full_text"),
                        "fecha": legacy.get("created_at"),
                        "likes": legacy.get("favorite_count"),
                        "retweets": legacy.get("retweet_count")
                    })

        return tweets

    except requests.RequestException as e:
        print(f"Error en la solicitud: {e}")
        return []
    except Exception as e:
        print(f"Error procesando datos: {e}")
        return []

