from agents import Agent, Runner
import asyncio
from collections import Counter, defaultdict
import re

#Hora de definir un agente de clasificación

prompt = """
Quiero que actúes como un clasificador de reseñas y comentarios en el contexto de evaluación de riesgo de pequeñas y medianas empresas (PYMEs).
Tu tarea es analizar el texto que te entregaré y clasificarlo en una categoría principal y una subcategoría específica, usando este formato exacto:

[CategoríaGrande] : [Subcategoría]

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
    Devuelve conteo por categoría y subcategoría.
    """
    patron = re.compile(r'^\s*(\d+)\.\s*([A-Za-z]+)\s*:\s*(.+)$')
    conteo_cat = Counter()
    conteo_subcat = defaultdict(Counter)
    
    for linea in texto.splitlines():
        linea = linea.strip()
        if not linea:
            continue
        m = patron.match(linea)
        if m:
            numero = int(m.group(1))  # aunque no es necesario para contar
            categoria = m.group(2).capitalize()
            subcategoria = m.group(3).strip()
            
            conteo_cat[categoria] += 1
            conteo_subcat[categoria][subcategoria] += 1
        else:
            # Si la línea no coincide, la ignoramos o la puedes imprimir para debug
            # print(f"Línea no parseada: {linea}")
            pass
    
    return dict(conteo_cat), {k: dict(v) for k,v in conteo_subcat.items()}


