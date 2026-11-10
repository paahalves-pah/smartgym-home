
from pathlib import Path
import re
import unicodedata

import joblib
import pandas as pd
import spacy

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.pipeline import Pipeline


BASE_DIR = Path(__file__).resolve().parents[2]

DATASET_PATH = BASE_DIR / "datasets" / "intencoes_v2.csv"
ARTIFACTS_DIR = BASE_DIR / "artifacts"

MODEL_PATH = ARTIFACTS_DIR / "nlu_smartgym.joblib"
MATRIX_PATH = ARTIFACTS_DIR / "matriz_confusao_nlu.csv"
REPORT_PATH = ARTIFACTS_DIR / "relatorio_nlu.txt"


class NLUModel:

    EQUIPAMENTOS = {
        "Apolete": [
            "apolete",
            "aparelho de gluteo",
            "maquina de gluteo"
        ],
        "Banco Scott": [
            "banco scott",
            "scott",
            "banco de biceps"
        ],
        "Bicicleta Ergométrica": [
            "bicicleta ergometrica",
            "bicicleta",
            "bike",
            "ergometrica"
        ],
        "Cadeira extensora": [
            "cadeira extensora",
            "extensora"
        ],
        "Esteira": [
            "esteira"
        ],
        "Leg Press": [
            "leg press",
            "legpress",
            "aparelho de pernas"
        ],
        "Mesa flexora": [
            "mesa flexora",
            "flexora"
        ],
        "Puxada alta": [
            "puxada alta",
            "puxador"
        ],
        "Smith (barra guiada)": [
            "smith",
            "barra guiada"
        ],
        "Supino reto": [
            "supino reto",
            "supino"
        ]
    }

    def __init__(self):
        self.nlp = spacy.load("pt_core_news_sm")
        self.pipeline = None
        self.classes = []

    def normalizar_texto(self, texto):
        texto = str(texto).lower().strip()
        texto = unicodedata.normalize("NFD", texto)

        texto = "".join(
            caractere
            for caractere in texto
            if unicodedata.category(caractere) != "Mn"
        )

        texto = re.sub(r"[^a-z0-9\s]", " ", texto)
        texto = re.sub(r"\s+", " ", texto).strip()

        return texto

    def preprocessar(self, texto):
        texto = str(texto).lower().strip()

        texto = re.sub(
            r"[^a-záàâãéèêíïóôõöúçñ\s]",
            " ",
            texto
        )

        texto = re.sub(r"\s+", " ", texto).strip()

        documento = self.nlp(texto)

        negacoes = {"não", "nunca", "sem", "nem"}
        tokens = []

        for token in documento:
            lema = token.lemma_.lower().strip()

            if token.is_alpha and (
                not token.is_stop or lema in negacoes
            ):
                tokens.append(lema)

        resultado = " ".join(tokens)

        return resultado if resultado else texto

    def extrair_equipamento(self, texto):
        texto_normalizado = self.normalizar_texto(texto)

        encontrados = []

        for nome, sinonimos in self.EQUIPAMENTOS.items():
            for sinonimo in sinonimos:
                sinonimo_normalizado = self.normalizar_texto(
                    sinonimo
                )

                padrao = (
                    r"(?<!\w)"
                    + re.escape(sinonimo_normalizado)
                    + r"(?!\w)"
                )

                if re.search(padrao, texto_normalizado):
                    encontrados.append({
                        "nome": nome,
                        "termo": sinonimo
                    })

        if not encontrados:
            return None

        encontrados.sort(
            key=lambda item: len(item["termo"]),
            reverse=True
        )

        return encontrados[0]["nome"]

    def identificar_intencao_por_regra(self, texto):
        texto = self.normalizar_texto(texto)

        # Perguntas sobre como realizar ações são pedidos de ajuda.
        padroes_de_ajuda = [
            r"\bcomo faco\b",
            r"\bcomo posso\b",
            r"\bcomo devo\b",
            r"\bcomo iniciar\b",
            r"\bcomo finalizar\b",
            r"\bcomo encerrar\b",
            r"\bnao sei como\b",
            r"\bpode explicar\b",
            r"\bme ensine\b",
            r"\bpreciso de ajuda\b",
            r"\bpreciso de orientacao\b",
            r"\bme orienta\b",
            r"\bme ensina\b",
            r"\bquero aprender\b",
            r"\bnao estou conseguindo\b"
        ]

        for padrao in padroes_de_ajuda:
            if re.search(padrao, texto):
                return "solicitar_ajuda"

        # Consultas de disponibilidade e localização.
        padroes_consulta = [
            r"\b(posso|consigo|poderia)\s+(usar|utilizar)\b",
            r"\b(disponivel|livre|ocupado|ocupada|indisponivel)\b",
            r"\bem manutencao\b",
            r"\b(quais|qual|tem algum|existe algum)\b.*\b(aparelho|equipamento|maquina)\b",
            r"\bverificar\b.*\b(disponibilidade|disponivel|livre)\b",
            r"\bconsultar\b.*\b(equipamento|aparelho|maquina|esteira|bicicleta|supino|leg press|extensora|flexora|smith|puxada|scott)\b",
            r"\bonde fica\b"
        ]

        for padrao in padroes_consulta:
            if re.search(padrao, texto):
                return "consultar_equipamento"

        # Finalização de uma utilização.
        padroes_finalizacao = [
            r"\bja acabei\b",
            r"\bacabei meu\b",
            r"\bterminei\b",
            r"\bfinalizar minha utilizacao\b",
            r"\bfinalizar minha sessao\b",
            r"\bencerrar minha utilizacao\b",
            r"\bencerrar minha sessao\b",
            r"\bquero finalizar\b",
            r"\bquero encerrar\b",
            r"\bparei de usar\b",
            r"\bconcluir minha utilizacao\b"
        ]

        for padrao in padroes_finalizacao:
            if re.search(padrao, texto):
                return "finalizar_utilizacao"

        # Início de uma utilização.
        padroes_inicio = [
            r"\bquero usar\b",
            r"\bquero utilizar\b",
            r"\bvou usar\b",
            r"\bvou utilizar\b",
            r"\bquero comecar\b",
            r"\bquero iniciar\b",
            r"\bvou comecar\b",
            r"\bvou iniciar\b",
            r"\bquero treinar\b",
            r"\bvou treinar\b",
            r"\bquero fazer\b.*\b(supino|esteira|bicicleta|leg press|extensora|flexora|smith|puxada|scott|apolete)\b",
            r"\biniciar sessao\b",
            r"\biniciar utilizacao\b",
            r"\bcomecar a usar\b",
            r"\bcomecar a utilizar\b",
            r"\bcomecar meu treino\b"
        ]

        for padrao in padroes_inicio:
            if re.search(padrao, texto):
                return "iniciar_utilizacao"

        return None

    def treinar(self):

        if not DATASET_PATH.exists():
            raise FileNotFoundError(
                f"Dataset não encontrado: {DATASET_PATH}"
            )

        dados = pd.read_csv(DATASET_PATH)

        colunas_necessarias = {"texto", "intencao"}

        if not colunas_necessarias.issubset(dados.columns):
            raise ValueError(
                "O CSV precisa ter as colunas 'texto' e 'intencao'."
            )

        dados = dados.dropna(subset=["texto", "intencao"])

        dados["texto"] = dados["texto"].astype(str)
        dados["intencao"] = dados["intencao"].astype(str)

        if dados["intencao"].nunique() < 2:
            raise ValueError(
                "O dataset precisa ter pelo menos duas intenções."
            )

        distribuicao = dados["intencao"].value_counts()

        if distribuicao.min() < 5:
            raise ValueError(
                "Cada intenção precisa ter pelo menos 5 exemplos."
            )

        textos = [
            self.preprocessar(texto)
            for texto in dados["texto"]
        ]

        etiquetas = dados["intencao"].tolist()
        self.classes = sorted(set(etiquetas))

        self.pipeline = Pipeline([
            (
                "tfidf",
                TfidfVectorizer(
                    ngram_range=(1, 2),
                    min_df=1,
                    sublinear_tf=True
                )
            ),
            (
                "classificador",
                LogisticRegression(
                    max_iter=2000,
                    class_weight="balanced",
                    random_state=42
                )
            )
        ])

        validacao = StratifiedKFold(
            n_splits=5,
            shuffle=True,
            random_state=42
        )

        previsoes = cross_val_predict(
            self.pipeline,
            textos,
            etiquetas,
            cv=validacao
        )

        relatorio = classification_report(
            etiquetas,
            previsoes,
            labels=self.classes,
            zero_division=0
        )

        matriz = confusion_matrix(
            etiquetas,
            previsoes,
            labels=self.classes
        )

        self.pipeline.fit(textos, etiquetas)

        ARTIFACTS_DIR.mkdir(
            parents=True,
            exist_ok=True
        )

        matriz_df = pd.DataFrame(
            matriz,
            index=self.classes,
            columns=self.classes
        )

        matriz_df.index.name = "real"

        matriz_df.to_csv(
            MATRIX_PATH,
            encoding="utf-8-sig"
        )

        REPORT_PATH.write_text(
            relatorio,
            encoding="utf-8"
        )

        joblib.dump(
            {
                "pipeline": self.pipeline,
                "classes": self.classes
            },
            MODEL_PATH
        )

        return {
            "total_frases": len(textos),
            "total_intencoes": len(self.classes),
            "distribuicao": distribuicao.to_dict(),
            "relatorio": relatorio,
            "modelo_salvo": str(MODEL_PATH),
            "matriz_salva": str(MATRIX_PATH)
        }

    def carregar(self):

        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                "Modelo NLP ainda não foi treinado."
            )

        dados = joblib.load(MODEL_PATH)

        self.pipeline = dados["pipeline"]
        self.classes = dados["classes"]

    def prever(self, texto):

        if self.pipeline is None:
            self.carregar()

        equipamento = self.extrair_equipamento(texto)

        intencao_regra = self.identificar_intencao_por_regra(
            texto
        )

        if intencao_regra is not None:
            return {
                "texto": texto,
                "intencao": intencao_regra,
                "confianca": 1.0,
                "origem": "regra_contextual",
                "entidades": {
                    "equipamento": equipamento
                }
            }

        texto_processado = self.preprocessar(texto)

        probabilidades = self.pipeline.predict_proba(
            [texto_processado]
        )[0]

        indice = probabilidades.argmax()

        return {
            "texto": texto,
            "intencao": str(self.pipeline.classes_[indice]),
            "confianca": round(
                float(probabilidades[indice]), 4
            ),
            "origem": "modelo_ml",
            "entidades": {
                "equipamento": equipamento
            }
        }
