
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.models.nlu_model import NLUModel


router = APIRouter(prefix="/nlu", tags=["NLP"])

modelo_nlu = NLUModel()


class MensagemEntrada(BaseModel):
    texto: str = Field(min_length=1, description="Mensagem enviada ao FitBot")


@router.post("/parse")
def interpretar_mensagem(dados: MensagemEntrada):
    try:
        resultado = modelo_nlu.prever(dados.texto)
        return resultado

    except FileNotFoundError as erro:
        raise HTTPException(
            status_code=503,
            detail=str(erro)
        )

    except Exception as erro:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao interpretar mensagem: {str(erro)}"
        )
