from pydantic import BaseModel

class ProcessRequest(BaseModel):
    historico: str  # PDF codificado en base64 como string
    balance: str    # Excel codificado en base64 como string
    cantidad: int
    duracion: int
    motivo: str
    twitterUsername: str
    instagramUsername: str
    placeID: str