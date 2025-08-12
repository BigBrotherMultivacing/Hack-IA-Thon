import base64
import io
import pandas as pd
from agents import Agent, Runner
from modulos.OpenAI.read_balance import parse_pdf_accounts_precise
import re

prompt = """
Eres GrandFinance, el lector más avanzado de datos financieros, lo que vas a hacer es leer el estado financiero y responderás únicamente con

[Activo] [Pasivo] [Patrimonio]

Es crucial que utilices los corchetes, pues así el sistema sabrá donde está cada información
Activo, Pasivo y Patrimonio los tres son números que recibirás en el estado financiero.

Este es un ejemplo de resultado:

[1234.123] [10341.23] [-9107,107]

No es necesario que realices operaciones, vas a recibir la información completa.

No agregarás comentarios adicionales, respuestas, o cualquier tipo de texto que no sea el resultado con los tres corchetes
"""
detector = Agent(name="Detector", instructions=prompt, model="gpt-5-nano")

async def DeterminarActivoPasivoPatrimonio(estado64):
    global detector

    estadoSTR = await parse_pdf_accounts_precise(estado64)

    result = await Runner.run(detector, f"Por favor, dame el activo, pasivo y patrimonio, utilizando los corchetes respectivos para cada uno, en el formato. [Activo] [Pasivo] [Patrimonio]. Este es el estado financiero: {estadoSTR} " )
    cadena =  result.final_output
    matches = re.findall(r'\[([^\]]+)\]', cadena)

    if len(matches) == 3:
        activo = float(matches[0])
        pasivo = float(matches[1])
        patrimonio = float(matches[2])
    return activo, pasivo, patrimonio

async def score_balance(prestamo: float, patrimonio: float) -> float:
    """
    Calcula el puntaje del balance (máximo 40 pts) basado en patrimonio vs préstamo.

    Parámetros:
    - prestamo: monto solicitado
    - patrimonio: patrimonio neto de la empresa

    Retorna:
    - puntaje entre 0 y 40
    """
    max_penalizacion = -50.0  # máximo negativo permitido
    
    if patrimonio <= 0:
        # Penalización lineal desde 0 a -40 según cuán lejos está del préstamo (limite -prestamo)
        # Si patrimonio <= -prestamo, score = -40
        if patrimonio <= -prestamo:
            return max_penalizacion
        else:
            return max_penalizacion * (patrimonio / -prestamo)
    
    # Definimos un rango de "cercano" ±10% del préstamo
    limite_inferior = 0.9 * prestamo
    limite_superior = 1.1 * prestamo
    
    if limite_inferior <= patrimonio <= limite_superior:
        return 20.0
    
    if patrimonio >= 2 * prestamo:
        return 40.0
    
    # Interpolación lineal entre 20 pts y 40 pts para patrimonio entre 1.1*prestamo y 2*prestamo
    if patrimonio > limite_superior and patrimonio < 2 * prestamo:
        return 20.0 + (patrimonio - limite_superior) / (2 * prestamo - limite_superior) * 20.0
    
    # Para patrimonio entre 0 y 0.9*prestamo: puntaje proporcional desde 0 a 20 pts
    if patrimonio < limite_inferior:
        return (patrimonio / limite_inferior) * 20.0
    
    # Caso borde por si no cae en ningún rango
    return 0.0

async def score_flujo_caja(monto: float, duracion_meses: int, flujo_promedio: float) -> float:
    """
    Calcula el puntaje del flujo de caja (máximo 30 pts) basado en monto, duración y flujo promedio.

    Parámetros:
    - monto: monto total solicitado
    - duracion_meses: duración del préstamo en meses (>0)
    - flujo_promedio: flujo de caja promedio mensual

    Retorna:
    - puntaje entre -30 y 30
    """

    if duracion_meses <= 0:
        raise ValueError("Duración en meses debe ser mayor que 0")

    cuota_mensual = (monto / duracion_meses) * 1.1175  # cuota con interés

    max_penalizacion = -30.0
    max_puntaje = 30.0

    # Caso flujo negativo o cero: penalización proporcional hasta -30
    if flujo_promedio <= 0:
        # Flujo cero o negativo: penalización lineal hasta -30, asumiendo flujo 0 → 0 pts,
        # flujo negativo grande → -30 (límite arbitrario)
        # Aquí puedes ajustar la penalización para flujos negativos más fuertes
        # Por simplicidad, si es negativo penalizamos -30
        return max_penalizacion

    # Caso flujo >= 2 * cuota -> max puntaje 30
    if flujo_promedio >= 2 * cuota_mensual:
        return max_puntaje

    # Caso flujo ~= cuota mensual (aprox 1 × cuota): 15 pts
    # Definimos "aprox" ±10%
    inferior_15 = 0.9 * cuota_mensual
    superior_15 = 1.1 * cuota_mensual

    if inferior_15 <= flujo_promedio <= superior_15:
        return 15.0

    # Interpolaciones lineales:
    # Entre 0 y 0.9*cuota: de penalización (0 a 15 pts negativos a positivos)
    if flujo_promedio < inferior_15:
        # Interpolamos entre 0 y 15 pts proporcionalmente a flujo promedio / cuota
        # pero recuerda que para flujo negativo ya salió -30
        # Aquí 0.0 flujo = 0 pts y 0.9*cuota = 15 pts
        return (flujo_promedio / inferior_15) * 15.0

    # Entre 1.1*cuota y 2*cuota: de 15 a 30 pts
    if flujo_promedio > superior_15:
        return 15.0 + (flujo_promedio - superior_15) / (2 * cuota_mensual - superior_15) * 15.0

    # Por si no cae en rango, devuelvo 0 como fallback
    return 0.0


async def ganancia_promedio_mensual(xlsx_base64: str) -> float:
    """
    Recibe un archivo XLSX codificado en base64 con columnas: 'monto', 'descripcion', 'fecha'.
    Calcula la ganancia promedio mensual: suma ingresos menos gastos por mes, luego el promedio anual.

    Parámetros:
    - xlsx_base64: string con archivo XLSX codificado en base64.

    Retorna:
    - Ganancia promedio mensual (float)
    """
    # Decodificar base64 y leer archivo en memoria
    archivo_bytes = base64.b64decode(xlsx_base64)
    archivo_io = io.BytesIO(archivo_bytes)
    
    # Cargar XLSX en pandas
    df = pd.read_excel(archivo_io)
    
    # Asegurarse de que 'fecha' es datetime
    df['fecha'] = pd.to_datetime(df['fecha'])
    
    # Extraer año y mes
    df['año_mes'] = df['fecha'].dt.to_period('M')
    
    # Agrupar por año_mes y sumar montos
    ingresos_mensuales = df.groupby('año_mes')['monto'].sum()
    
    # Ganancia promedio mensual
    ganancia_promedio = ingresos_mensuales.mean()
    
    return ganancia_promedio



