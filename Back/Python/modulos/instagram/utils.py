import os
import requests
from dotenv import load_dotenv
from pprint import pprint

#API:
#https://rapidapi.com/social-lens-social-lens-default/api/instagram-social-api
# 500 gratuitas

load_dotenv()


RAPID_API_KEY = os.getenv("RAPID_API_KEY")
if not RAPID_API_KEY:
    raise ValueError("No se encontró la clave RAPID_API_KEY en las variables de entorno")

async def obtener_engagement_instagram(username_or_url):
    """
    Realiza una petición GET a la API de Instagram Social API vía RapidAPI para obtener los posts 
    públicos del usuario o URL especificado.

    Extrae la cantidad de likes y comentarios de cada post, calcula el engagement sumando ambos valores,
    y devuelve una lista con el engagement total por cada publicación.

    Parámetros:
    - username_or_url (str): nombre de usuario de Instagram, ID o URL de perfil a consultar.

    Retorna:
    - List[int]: lista con el engagement (likes + comentarios) de cada post.
    
    Lanza ValueError si no se encuentra la clave RAPID_API_KEY en las variables de entorno.
    Maneja errores de conexión o parsing JSON retornando lista vacía y mostrando mensaje de error.
    """
    global RAPID_API_KEY    

    url = f"https://instagram-social-api.p.rapidapi.com/v1/posts?username_or_id_or_url={username_or_url}"
    headers = {
        "x-rapidapi-host": "instagram-social-api.p.rapidapi.com",
        "x-rapidapi-key": RAPID_API_KEY,
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()

        items = data.get("data", {}).get("items", [])
        engagement_list = []
        for post in items:
            likes = post.get("like_count", 0)
            comments = post.get("comment_count", 0)
            engagement_list.append(likes + comments)

        return engagement_list

    except requests.RequestException as e:
        print(f"Error en la petición HTTP: {e}")
        return []
    except ValueError as e:
        print(f"Error al procesar JSON: {e}")
        return []
    



async def obtener_seguidores(username: str) -> int:
    """
    Realiza una solicitud GET a la API de Instagram Social API para obtener la cantidad total 
    de seguidores de un usuario especificado por su nombre de usuario.

    Parámetros:
    -----------
    username : str
        Nombre de usuario de Instagram cuyo número de seguidores se desea obtener.
        También puede ser la url de usuario

    Retorna:
    --------
    int
        La cantidad total de seguidores del usuario. Si no se encuentra la información, retorna 0.

    Excepciones:
    ------------
    Lanza excepciones relacionadas con la solicitud HTTP si la respuesta es errónea.
    """
        
    global RAPID_API_KEY
    url = f'https://instagram-social-api.p.rapidapi.com/v1/info?username_or_id_or_url={username}'
    headers = {
        'x-rapidapi-host': 'instagram-social-api.p.rapidapi.com',
        'x-rapidapi-key': RAPID_API_KEY
    }
    
    response = requests.get(url, headers=headers)
    response.raise_for_status()  # para lanzar error si algo falla
    
    data = response.json()
    # El número de seguidores está en data['data']['about']['follower_count']
    seguidores = data.get('data', {}).get('follower_count', None)
    
    if seguidores is None:
        return 0
    return seguidores


async def obtener_engagement_promedio(username: str) -> float:
    """
    Obtiene el engagement promedio de un usuario, tomando en cuenta cada post.

    :param username: Usuario de instagram, también puede ser url
    :return: Engagement promedio por post
    """
    engagement_raw = await obtener_engagement_instagram(username)

    cantidad_seguidores = await obtener_seguidores(username)
    cantidad_seguidores = int(cantidad_seguidores)


    if cantidad_seguidores == 0 or not engagement_raw:
        return 0.0
    
    promedio_engagement = sum(engagement_raw) / len(engagement_raw)
    engagement_promedio_normalizado = promedio_engagement / cantidad_seguidores
    
    return engagement_promedio_normalizado

#print(obtener_engagement_promedio("elarbolitodeli"))

async def score_interpolacion(engagement_rate: float, ideal: float = 0.014) -> float:
    if engagement_rate < 0:
        return 0
    ratio = engagement_rate / ideal
    if ratio >= 1:
        return 5
    else:
        return ratio * 5

