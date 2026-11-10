from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


BASE_DIR = Path(__file__).resolve().parents[2]
ARTIFACTS_DIR = BASE_DIR / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "kmeans_smartgym.joblib"

FEATURES = [
    "total_sessoes",
    "frequencia_semanal",
    "duracao_media_minutos",
    "diversidade_equipamentos",
    "dias_ativos",
]


class KMeansSmartGym:

    def __init__(self):
        self.pipeline = None
        self.dados_treinamento = None
        self.resultados_avaliacao = None
        self.numero_clusters = None

    def treinar(self, usuarios: list[dict]) -> dict:

        if len(usuarios) < 3:
            raise ValueError(
                "São necessários pelo menos 3 usuários "
                "com dados de utilização para treinar o modelo."
            )

        dados = pd.DataFrame(usuarios)

        if "usuario_id" not in dados.columns:
            raise ValueError("O campo usuario_id é obrigatório.")

        if dados["usuario_id"].duplicated().any():
            raise ValueError("Existem usuários duplicados.")

        if not set(FEATURES).issubset(dados.columns):
            raise ValueError("Existem variáveis obrigatórias ausentes.")

        matriz = dados[FEATURES].apply(
            pd.to_numeric,
            errors="coerce"
        )

        if matriz.isnull().any().any():
            raise ValueError("Existem valores inválidos nos indicadores.")

        if not np.isfinite(matriz.to_numpy()).all():
            raise ValueError("Existem valores não finitos nos indicadores.")

        if (matriz < 0).any().any():
            raise ValueError("Os indicadores não podem ser negativos.")

        if (matriz.nunique() <= 1).all():
            raise ValueError(
                "Os usuários não apresentam variação suficiente "
                "nos indicadores para formar grupos."
            )

        matriz = matriz.astype(float)

        resultados = []
        melhor_score = -1
        melhor_k = None

        limite_clusters = min(6, len(matriz) - 1)

        for k in range(2, limite_clusters + 1):

            pipeline = Pipeline([
                ("scaler", StandardScaler()),
                (
                    "kmeans",
                    KMeans(
                        n_clusters=k,
                        random_state=42,
                        n_init=20
                    )
                )
            ])

            grupos = pipeline.fit_predict(matriz)

            score = silhouette_score(
                pipeline.named_steps["scaler"].transform(matriz),
                grupos
            )

            inercia = float(
                pipeline.named_steps["kmeans"].inertia_
            )

            resultados.append({
                "k": k,
                "silhouette": round(float(score), 4),
                "inercia": round(inercia, 4)
            })

            if score > melhor_score:
                melhor_score = score
                melhor_k = k
                self.pipeline = pipeline

        if self.pipeline is None:
            raise ValueError("Não foi possível treinar o K-Means.")

        dados["grupo"] = self.pipeline.predict(matriz)

        self.dados_treinamento = dados
        self.numero_clusters = melhor_k
        self.resultados_avaliacao = resultados

        ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

        joblib.dump({
            "pipeline": self.pipeline,
            "usuarios": dados,
            "features": FEATURES,
            "numero_clusters": melhor_k,
            "avaliacao": resultados,
        }, MODEL_PATH)

        return {
            "sucesso": True,
            "usuarios_analisados": len(dados),
            "numero_clusters": melhor_k,
            "silhouette_score": round(float(melhor_score), 4),
            "avaliacao": resultados,
            "agrupamentos": [
                {
                    "usuario_id": int(row["usuario_id"]),
                    "grupo": int(row["grupo"])
                }
                for _, row in dados.iterrows()
            ],
            "modelo_salvo": str(MODEL_PATH.name)
        }

    def carregar(self) -> bool:

        if not MODEL_PATH.exists():
            return False

        artefato = joblib.load(MODEL_PATH)

        self.pipeline = artefato["pipeline"]
        self.dados_treinamento = artefato["usuarios"]
        self.numero_clusters = artefato["numero_clusters"]
        self.resultados_avaliacao = artefato["avaliacao"]

        return True

    def recomendar(self, usuario_id: int) -> dict:

        if self.pipeline is None:
            if not self.carregar():
                raise ValueError(
                    "O modelo ainda não foi treinado."
                )

        usuario = self.dados_treinamento[
            self.dados_treinamento["usuario_id"] == usuario_id
        ]

        if usuario.empty:
            raise ValueError(
                "Usuário não encontrado no conjunto de treinamento."
            )

        grupo = int(usuario.iloc[0]["grupo"])

        semelhantes = self.dados_treinamento[
            (self.dados_treinamento["grupo"] == grupo)
            & (self.dados_treinamento["usuario_id"] != usuario_id)
        ]

        return {
            "usuario_id": usuario_id,
            "grupo": grupo,
            "numero_usuarios_semelhantes": len(semelhantes),
            "usuarios_semelhantes": [
                int(valor)
                for valor in semelhantes["usuario_id"].tolist()
            ],
            "mensagem": (
                "Usuários agrupados conforme padrões semelhantes "
                "de utilização da academia."
            )
        }