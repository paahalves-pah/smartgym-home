# Machine Learning — SmartGym Home

## Sobre o módulo
Microsserviço responsável pela análise de dados e pela geração de recomendações personalizadas para os usuários do SmartGym Home.

## Tecnologias
- Python
- Scikit-learn
- FastAPI
- Pandas
- NumPy

## Modelo de Machine Learning
Será utilizado o algoritmo K-Means para agrupar usuários com padrões de utilização semelhantes.

## Etapas previstas
- Preparação e tratamento dos dados.
- Seleção das variáveis utilizadas no agrupamento.
- Normalização dos dados com StandardScaler.
- Treinamento do modelo K-Means.
- Avaliação dos agrupamentos com o método do Cotovelo e Silhouette Score.
- Salvamento do pipeline de Machine Learning.
- Criação de endpoints para disponibilizar as recomendações.
- Integração com o backend NestJS.

## Endpoint previsto
`GET /recommend/{user_id}`

O endpoint deverá retornar recomendações com base nos dados disponíveis e nos agrupamentos identificados pelo modelo.

## Status
Em planejamento.