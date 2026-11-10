from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.models.kmeans_model import KMeansSmartGym


router = APIRouter(prefix="/recommend", tags=["Machine Learning"])

modelo = KMeansSmartGym()


class UsuarioIndicadores(BaseModel):
    usuario_id: int = Field(gt=0)
    total_sessoes: float = Field(ge=0)
    frequencia_semanal: float = Field(ge=0)
    duracao_media_minutos: float = Field(ge=0)
    diversidade_equipamentos: float = Field(ge=0)
    dias_ativos: float = Field(ge=0)


class TreinamentoRequest(BaseModel):
    usuarios: list[UsuarioIndicadores]


@router.post("/train")
def treinar_modelo(dados: TreinamentoRequest):
    try:
        usuarios = [
            usuario.model_dump()
            for usuario in dados.usuarios
        ]

        resultado = modelo.treinar(usuarios)
        return resultado

    except ValueError as erro:
        raise HTTPException(
            status_code=422,
            detail=str(erro)
        ) from erro

    except Exception as erro:
        raise HTTPException(
            status_code=500,
            detail="Erro interno durante o treinamento."
        ) from erro


@router.get("/{user_id}")
def recomendar_usuario(user_id: int):
    try:
        return modelo.recomendar(user_id)

    except ValueError as erro:
        raise HTTPException(
            status_code=404,
            detail=str(erro)
        ) from erro

    except Exception as erro:
        raise HTTPException(
            status_code=500,
            detail="Erro interno ao gerar recomendação."
        ) from erro