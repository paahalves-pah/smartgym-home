
from fastapi import FastAPI

from app.api.routes.recomendacoes import router as recomendacoes_router
from app.api.routes.nlu import router as nlu_router


app = FastAPI(
    title="SmartGym Machine Learning API",
    description="Microsserviço de Machine Learning e NLP do SmartGym Home",
    version="1.0.0"
)


app.include_router(recomendacoes_router)
app.include_router(nlu_router)


@app.get("/")
def inicio():
    return {
        "mensagem": "SmartGym ML API está funcionando!",
        "status": "online"
    }


@app.get("/health")
def verificar_saude():
    return {
        "status": "healthy",
        "servico": "machine-learning"
    }
