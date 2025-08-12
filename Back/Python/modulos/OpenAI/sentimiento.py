from agents import Agent, Runner
import asyncio
from collections import Counter, defaultdict
import re

#Hora de definir un agente de clasificación

prompt = """
Quiero que actúes como un clasificador de reseñas y comentarios en el contexto de evaluación de riesgo de pequeñas y medianas empresas (PYMEs).
Tu tarea es analizar el texto que te entregaré y clasificarlo en una categoría principal y una subcategoría específica, usando este formato exacto:

[CategoríaGrande] : [Subcategoría]

Y sí la categoría grande es Negativo y la subcategoría no es general, es decir

Negativo : [Subcategoría no general]

vas a agregar obligatoriamente una tercera sección que explique en síntesis la razón

Negativo : [Subcategoría no general] : [Razón de esta review]

Las categorías grandes posibles son:

Positivo

Negativo

Neutral

Dentro de cada categoría grande, las subcategorías son:

POSITIVE

Recomendación directa → Cliente aconseja explícitamente ir o usar el servicio.

Reconocimiento de calidad → Elogia la calidad de productos o servicios.

Atención destacada → Elogia el trato del personal.

Rapidez / cumplimiento → Cumplió o superó los plazos de entrega.

Relación calidad-precio → Cliente percibe que el precio es justo o mejor de lo esperado.

General → Es claramente positivo, pero no encaja en ninguna subcategoría anterior.

NEGATIVE

Reproche / llamado de atención → Cliente pide que se corrija algo.

Queja de calidad → Producto o servicio no cumplió expectativas.

Problema de atención → Mal trato o descuido del personal.

Incumplimiento / retraso → No se cumplió con plazos o compromisos.

Problema de precio → Cliente percibe sobreprecio o cobro indebido.

Fraude / engaño → Cliente percibe estafa o publicidad engañosa.

General → Es claramente negativo, pero no encaja en ninguna subcategoría anterior.

NEUTRAL

Consulta / interés → Pregunta sobre productos o servicios.

Información factual → Describe un hecho sin juicio emocional.

Comparativa → Compara con otro negocio sin tono claramente positivo o negativo.

Narrativa de experiencia → Relata algo que ocurrió, sin juicio claro.
Considera que si es una narrativa es buena (Ej: tuve una experiencia linda ayer), entonces es positiva, considera que si una narrativa es mala (fui ayer y tenía un olor desagradable...) entonces es negativo

General → Es claramente neutral, pero no encaja en ninguna subcategoría anterior.

Reglas importantes:

Siempre responde en el formato exacto: [CategoríaGrande] : [Subcategoría].

Usa solo las subcategorías listadas.

Si el texto no deja clara la intención, clasifica como Neutral → General.

Cuando la clasificación es negativo con una subcategoría, el resultado final quedará así

Negativo : Queja de calidad : Razón

Siendo esta una regla obligatoria que tienes que respetar

Ejemplos:

"Recomiendo totalmente este restaurante, es excelente" → Positivo : Recomendación directa

"Me entregaron el pedido tarde y sin disculpas" → Negativo : Incumplimiento / retraso

"¿Venden repuestos para motos?" → Neutral : Consulta / interés

"Buena experiencia en general" → Positivo : General

"Mala atención en general" → Negativo : General

Si te entrego una lista de textos para clasificar, responde con una lista numerada en orden, donde cada número corresponde a la clasificación del texto en esa posición. Por ejemplo:

Positivo : Recomendación directa

Negativo : Queja de calidad

Neutral : Consulta / interés

No agregues explicaciones adicionales, solo la lista de clasificaciones.
Es crucial que utilices la numeración

"""

clasificador = Agent(name="Clasificador", instructions=prompt, model="gpt-5-nano")


#Vamos a definir otro agente un resumidor
promptResumidor = """
Quiero que actúes como un asesor empresarial. Vas a recibir dos cosas, un diccionario que representa el resultado de clasificación emocional en subcategorías y la razón de las reviews negativas.

Estas son las categorías 


POSITIVE

Recomendación directa → Cliente aconseja explícitamente ir o usar el servicio.

Reconocimiento de calidad → Elogia la calidad de productos o servicios.

Atención destacada → Elogia el trato del personal.

Rapidez / cumplimiento → Cumplió o superó los plazos de entrega.

Relación calidad-precio → Cliente percibe que el precio es justo o mejor de lo esperado.

General → Es claramente positivo, pero no encaja en ninguna subcategoría anterior.

NEGATIVE

Reproche / llamado de atención → Cliente pide que se corrija algo.

Queja de calidad → Producto o servicio no cumplió expectativas.

Problema de atención → Mal trato o descuido del personal.

Incumplimiento / retraso → No se cumplió con plazos o compromisos.

Problema de precio → Cliente percibe sobreprecio o cobro indebido.

Fraude / engaño → Cliente percibe estafa o publicidad engañosa.

General → Es claramente negativo, pero no encaja en ninguna subcategoría anterior.

NEUTRAL

Consulta / interés → Pregunta sobre productos o servicios.

Información factual → Describe un hecho sin juicio emocional.

Comparativa → Compara con otro negocio sin tono claramente positivo o negativo.

Narrativa de experiencia → Relata algo que ocurrió, sin juicio claro.
Considera que si es una narrativa es buena (Ej: tuve una experiencia linda ayer), entonces es positiva, considera que si una narrativa es mala (fui ayer y tenía un olor desagradable...) entonces es negativo

General → Es claramente neutral, pero no encaja en ninguna subcategoría anterior.

Y el resumen es un texto que tiene múltiples razones para reviews negativas.

Tu propósito es ofrecer las áreas de mejora de esta manera.

1. Vas a reconocer lo que ya se hace positivamente, por ejemplo, si alguien tiene mucho reconocimiento de calidad lo reconocerás, pero vas a recomendar posibles campañas para aumentar las recomendaciones directas. Es decir, viendo los resultados de clasificación, ofrecerás áreas de mejora.
2. Con el resumen de problemas vas a sintetizar en razones comunes y su área de mejora
3. Presentarás cada área de mejora en una bulleted list, enlistando cada una y la recomendación



"""

Mejorador = Agent(name="Mejorador", instructions=prompt, model="gpt-5-nano")

async def clasificar(texto):
    """
    Función que clasifica con IA un texto en las siguientes categorías

POSITIVE

Recomendación directa → Cliente aconseja explícitamente ir o usar el servicio.

Reconocimiento de calidad → Elogia la calidad de productos o servicios.

Atención destacada → Elogia el trato del personal.

Rapidez / cumplimiento → Cumplió o superó los plazos de entrega.

Relación calidad-precio → Cliente percibe que el precio es justo o mejor de lo esperado.

General → Es claramente positivo, pero no encaja en ninguna subcategoría anterior.

NEGATIVE

Reproche / llamado de atención → Cliente pide que se corrija algo.

Queja de calidad → Producto o servicio no cumplió expectativas.

Problema de atención → Mal trato o descuido del personal.

Incumplimiento / retraso → No se cumplió con plazos o compromisos.

Problema de precio → Cliente percibe sobreprecio o cobro indebido.

Fraude / engaño → Cliente percibe estafa o publicidad engañosa.

General → Es claramente negativo, pero no encaja en ninguna subcategoría anterior.

NEUTRAL

Consulta / interés → Pregunta sobre productos o servicios.

Información factual → Describe un hecho sin juicio emocional.

Comparativa → Compara con otro negocio sin tono claramente positivo o negativo.

Narrativa de experiencia → Relata algo que ocurrió, sin juicio claro.
Considera que si es una narrativa es buena (Ej: tuve una experiencia linda ayer), entonces es positiva, considera que si una narrativa es mala (fui ayer y tenía un olor desagradable...) entonces es negativo

General → Es claramente neutral, pero no encaja en ninguna subcategoría anterior.

    :param texto: Texto de una review, o texto numerado de múltiples reviews
    :retun: Texto con la clasificación, si es que se envió reviews numeradas entonces el texto es una numeración con la clasificación respectiva
    """
    result = await Runner.run(clasificador, f"Por favor, clasifica estos en una de las categorías dadas anteriormente, respondeme únicamente con la clasificación de cada texto con su lista numerada correspondiente en el formato dado. Este es el texto: {texto}", )
    return result.final_output
# Funciona muy bien, pero para implementarla, hay que hacer una arquitectura, asincronica con muchas requests
#print(asyncio.run(clasificar("""

async def contar_desde_texto(texto):
    """
    Procesa un texto con líneas numeradas del estilo:
    "1. Negativo : Fraude / engaño"
    o
    "2. Negativo : Fraude / engaño : La empresa no cumple con pagos"
    
    Devuelve conteo por categoría y subcategoría, y un resumen con todas las razones.
    """
    # Captura: número, categoría, subcategoría, y opcional razón (después de otro ":")
    patron = re.compile(r'^\s*(\d+)\.\s*([A-Za-z]+)\s*:\s*([^:]+)(?:\s*:\s*(.+))?$')

    conteo_cat = Counter()
    conteo_subcat = defaultdict(Counter)
    razones = []

    for linea in texto.splitlines():
        linea = linea.strip()
        if not linea:
            continue
        m = patron.match(linea)
        if m:
            numero = int(m.group(1))  # aunque no es necesario para contar
            categoria = m.group(2).capitalize()
            subcategoria = m.group(3).strip()
            razon = m.group(4).strip() if m.group(4) else None
            
            conteo_cat[categoria] += 1
            conteo_subcat[categoria][subcategoria] += 1
            
            if razon:
                razones.append(f"{categoria} : {subcategoria} : {razon}")
        else:
            # línea no parseada
            pass

    resumen = "; ".join(razones) if razones else ""

    return dict(conteo_cat), {k: dict(v) for k,v in conteo_subcat.items()}, resumen

async def Mejorar (diccionario, resumen):
    global Mejorador
    result = await Runner.run(Mejorador, f"Por favor, dame la bulleted list de las áreas de mejora y recomendaciones respectivas, este el resultado de la clasificación emocional: {diccionario} y este es la razón de las reviews negativas {resumen}", )
    return result.final_output

async def calcular_puntaje(totales, detalles):
    # Ponderación base sobre 25, según porcentaje positivo vs total
    total_reviews = totales.get('Negativo', 0) + totales.get('Positivo', 0) + totales.get('Neutral', 0)
    if total_reviews == 0:
        return 0  # evitar división por cero

    base_score = 25 * (totales.get('Positivo', 0) / total_reviews)

    # Penalizaciones por categorías negativas específicas
    penalizaciones = {
        "Reproche / llamado de atención": -1,
        "Incumplimiento / retraso": -2,
        "Fraude / engaño": -20
    }

    penal_total = 0
    negativos = detalles.get('Negativo', {})

    for categoria, penal in penalizaciones.items():
        cantidad = negativos.get(categoria, 0)
        penal_total += cantidad * penal

    # Limitar la penalización a un máximo de -70
    penal_total = max(penal_total, -70)

    # Puntaje final sumando penalizaciones
    puntaje_final = base_score + penal_total

    # No dejar puntaje menor a 0
    puntaje_final = max(puntaje_final, 0)

    return puntaje_final
