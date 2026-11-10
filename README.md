# SmartGym Home

**Sistema Inteligente de Gestão de Academia**

O SmartGym Home é um projeto acadêmico desenvolvido no curso de Análise
e Desenvolvimento de Sistemas da UniFECAF. A aplicação reúne recursos de
gerenciamento de usuários e equipamentos, controle de sessões de
utilização, acompanhamento de informações e análise de dados com
técnicas de Machine Learning.

## Sumário

-   [Sobre o projeto](#sobre-o-projeto)
-   [Objetivos](#objetivos)
-   [Funcionalidades](#funcionalidades)
-   [Tecnologias](#tecnologias)
-   [Arquitetura](#arquitetura)
-   [Estrutura do repositório](#estrutura-do-repositório)
-   [Instalação e configuração](#instalação-e-configuração)
-   [Execução](#execução)
-   [Banco de dados](#banco-de-dados)
-   [API](#api)
-   [Machine Learning](#machine-learning)
-   [FitBot](#fitbot)
-   [Perfis de acesso](#perfis-de-acesso)
-   [Testes](#testes)
-   [Desenvolvimento](#desenvolvimento)

## Sobre o projeto

O SmartGym Home foi idealizado para apoiar a gestão de academias por
meio de ferramentas digitais. O sistema permite administrar usuários e
equipamentos, acompanhar sessões de utilização e consultar informações
em um dashboard.

A solução também integra um serviço de Machine Learning, responsável por
analisar dados de utilização e agrupar usuários com características
semelhantes por meio do algoritmo K-Means. Além disso, possui o FitBot,
um assistente virtual que interpreta solicitações em linguagem natural e
encaminha ações disponíveis no sistema.

## Objetivos

### Objetivo geral

Desenvolver um sistema inteligente para gestão de academia, integrando
desenvolvimento web, persistência de dados e técnicas de inteligência
artificial para apoiar o gerenciamento e a análise das informações de
utilização.

### Objetivos específicos

-   Disponibilizar uma interface web para usuários e administradores.
-   Implementar autenticação e controle de acesso por perfil.
-   Permitir o gerenciamento de usuários e equipamentos.
-   Registrar e acompanhar sessões de utilização.
-   Controlar a disponibilidade dos equipamentos.
-   Apresentar indicadores em um dashboard.
-   Processar dados de utilização para identificar padrões.
-   Aplicar o algoritmo K-Means no agrupamento de usuários.
-   Integrar um assistente virtual à aplicação.

## Funcionalidades

### Usuários

-   Cadastro, consulta, edição e exclusão de usuários.
-   Controle de acesso conforme o perfil.
-   Upload e exibição de imagem de perfil.

### Equipamentos e manutenção

-   Cadastro e gerenciamento de equipamentos.
-   Acompanhamento da situação e disponibilidade dos equipamentos.
-   Registro e gerenciamento de manutenções.

### Sessões de utilização

-   Início e finalização de sessões.
-   Registro do histórico de utilização.
-   Regra de negócio que impede que um usuário mantenha mais de uma
    sessão em andamento simultaneamente.

### Dashboard

-   Exibição de informações gerais.
-   Indicadores de utilização e desempenho.
-   Visualização de equipamentos.
-   Gráfico de utilização semanal.
-   Área administrativa para solicitar o treinamento do modelo de
    Machine Learning.

### FitBot

-   Recebimento de mensagens.
-   Identificação de intenções.
-   Solicitação de confirmação antes de executar ações que alteram o
    estado do sistema, quando aplicável.
-   Integração com funcionalidades do backend.

### Machine Learning

-   Processamento de dados históricos de utilização.
-   Agrupamento de usuários com características semelhantes.
-   Avaliação de diferentes quantidades de clusters.
-   Apresentação de métricas e resultados do treinamento.

## Tecnologias

  Tecnologia     Finalidade
  -------------- -----------------------------------------
  React          Interface web
  Vite           Ambiente de desenvolvimento do frontend
  TypeScript     Tipagem estática no frontend e backend
  HTML5 e CSS3   Estrutura e apresentação da interface
  Node.js        Ambiente de execução do backend
  NestJS         Construção da API e regras de negócio
  TypeORM        Mapeamento objeto-relacional
  PostgreSQL     Banco de dados relacional
  Python         Serviço de Machine Learning
  FastAPI        API do serviço de Machine Learning
  Scikit-learn   Recursos de aprendizado de máquina
  K-Means        Agrupamento não supervisionado
  Git e GitHub   Controle de versão

## Arquitetura

O sistema está organizado em componentes com responsabilidades
distintas:

1.  **Frontend (React + Vite):** apresenta as telas e recebe as
    interações dos usuários.
2.  **Backend (NestJS):** implementa autenticação, autorização, regras
    de negócio e endpoints.
3.  **Banco de dados (PostgreSQL):** armazena os dados persistentes.
4.  **Serviço de Machine Learning (Python + FastAPI):** recebe dados
    preparados pelo backend, executa o treinamento e retorna resultados.
5.  **FitBot:** utiliza o backend para interpretar solicitações e
    encaminhar operações disponíveis.

### Fluxo geral

1.  O usuário interage com a aplicação pelo frontend.
2.  O frontend envia uma requisição HTTP para a API.
3.  O backend valida autenticação e permissões e executa a regra de
    negócio.
4.  Quando necessário, o backend consulta ou atualiza o PostgreSQL.
5.  Para tarefas de Machine Learning, o backend envia os dados ao
    serviço FastAPI.
6.  O serviço processa os dados e retorna os resultados.
7.  O backend responde ao frontend.

## Estrutura do repositório

A organização principal do projeto está dividida em três módulos:

``` text
smartgym-home/
├── backend/
│   └── smartgym-api/
├── frontend/
└── machine-learning/
```

Cada módulo possui suas próprias dependências e configurações. A
estrutura interna pode ser consultada diretamente nas respectivas pastas
do repositório.

## Requisitos

Para executar o projeto em ambiente local:

-   Windows 10 ou Windows 11.
-   Node.js e npm.
-   Python 3.12.
-   PostgreSQL.
-   Git.
-   Editor de código, como Visual Studio Code.

As versões específicas das dependências devem ser consultadas nos
arquivos `package.json` e `requirements.txt` de cada módulo.

## Instalação e configuração

### 1. Obter o código

``` bash
git clone URL_DO_REPOSITORIO
cd smartgym-home
```

Substitua `URL_DO_REPOSITORIO` pelo endereço real do repositório.

### 2. Configurar o banco de dados

Instale e inicie o PostgreSQL. Crie um banco de dados para o projeto e
tenha em mãos o endereço do servidor, a porta, o usuário e a senha.

### 3. Configurar o backend

Acesse a pasta do backend:

``` bash
cd backend/smartgym-api
npm install
```

Configure o arquivo `.env` com as variáveis exigidas pelo código.
Exemplo de referência:

``` env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
DB_DATABASE=smartgym_home
JWT_SECRET=sua_chave_secreta
ML_API_URL=http://127.0.0.1:8000
```

Os nomes das variáveis devem ser conferidos na configuração atual do
backend. Não publique senhas, tokens ou credenciais no repositório.

### 4. Configurar o frontend

Em outro terminal:

``` bash
cd frontend
npm install
```

Caso o frontend utilize variáveis de ambiente, configure-as conforme os
arquivos e serviços utilizados na versão do projeto.

### 5. Configurar o serviço de Machine Learning

Em outro terminal:

``` bash
cd machine-learning
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

O arquivo `requirements.txt` deve conter as dependências necessárias ao
serviço.

## Execução

Os serviços são iniciados separadamente, cada um em seu próprio
terminal.

### Backend

Na pasta `backend/smartgym-api`:

``` bash
npm run start:dev
```

Endereço local utilizado no desenvolvimento:

`http://localhost:3000`

### Frontend

Na pasta `frontend`:

``` bash
npm run dev
```

O Vite informa no terminal o endereço local da aplicação. A configuração
padrão normalmente utiliza:

`http://localhost:5173`

### Machine Learning

Com o ambiente virtual ativado, execute o servidor FastAPI usando o
módulo principal definido no projeto.

Exemplo, caso o ponto de entrada seja `app.main`:

``` bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

O endereço local configurado para o serviço é:

`http://127.0.0.1:8000`

O caminho do módulo (`app.main`) deve ser confirmado na estrutura real
do serviço antes da execução.

## Banco de dados

O PostgreSQL é utilizado para persistir as informações da aplicação. O
backend utiliza TypeORM para mapear as entidades e realizar operações no
banco de dados.

Entre os conceitos e conjuntos de dados utilizados pelo sistema estão:

-   Usuários.
-   Equipamentos.
-   Leituras de sensores.
-   Sessões de utilização.
-   Agrupamentos de usuários.
-   Recomendações.
-   Conversas e mensagens do FitBot.

As migrações controlam alterações na estrutura do banco. A estrutura
efetiva deve ser consultada nas entidades e migrações do backend.

## API

O backend disponibiliza endpoints REST para comunicação com o frontend e
os serviços integrados.

Quando habilitada na aplicação, a documentação Swagger pode ser acessada
localmente em:

`http://localhost:3000/api`

### Principais rotas de dashboard e inteligência

  -----------------------------------------------------------------------------------
  Método                  Rota                                Descrição
  ----------------------- ----------------------------------- -----------------------
  GET                     `/dashboard/resumo`                 Consulta informações
                                                              gerais do dashboard

  GET                     `/dashboard/desempenho`             Consulta o desempenho
                                                              do usuário autenticado

  GET                     `/dashboard/desempenho/usuarios`    Consulta o desempenho
                                                              dos usuários conforme
                                                              as permissões

  GET                     `/dashboard/desempenho/:id`         Consulta o desempenho
                                                              de um usuário
                                                              específico, conforme as
                                                              permissões

  POST                    `/dashboard/inteligencia/treinar`   Solicita o treinamento
                                                              do modelo de Machine
                                                              Learning

  GET                     `/inteligencia/recomendacoes`       Consulta recomendações

  POST                    `/inteligencia/chat`                Envia uma mensagem ao
                                                              FitBot

  POST                    `/inteligencia/chat/confirmar`      Confirma ou rejeita uma
                                                              ação pendente do FitBot
  -----------------------------------------------------------------------------------

As rotas protegidas exigem autenticação e respeitam as regras de
autorização implementadas no backend. Consulte o Swagger e os
controllers para obter a relação completa e atualizada dos endpoints.

## Machine Learning

O serviço de Machine Learning utiliza Python, FastAPI e Scikit-learn. O
algoritmo K-Means é empregado para agrupar usuários de acordo com
características derivadas de seu histórico de utilização.

### Características consideradas

O processo de preparação dos dados considera indicadores como:

-   Total de sessões.
-   Frequência semanal.
-   Duração média das sessões.
-   Diversidade de equipamentos utilizados.
-   Quantidade de dias ativos.

### Fluxo de treinamento

1.  O backend consulta o histórico de utilizações finalizadas.
2.  Os dados são organizados e enviados ao serviço de Machine Learning.
3.  O serviço Python processa os dados.
4.  O K-Means realiza o agrupamento.
5.  O processo avalia configurações com diferentes quantidades de
    clusters.
6.  Os resultados são retornados ao backend e apresentados no dashboard.

### Avaliação

O coeficiente de Silhouette é utilizado como métrica de avaliação dos
agrupamentos. Ele auxilia na análise da coesão dos grupos e da separação
entre eles.

O resultado do treinamento pode incluir:

-   Quantidade de usuários analisados.
-   Quantidade de clusters.
-   Coeficiente de Silhouette.
-   Avaliação das configurações de K.
-   Grupo atribuído a cada usuário.

O serviço também salva o modelo treinado em artefato para utilização
posterior, conforme a implementação do módulo de Machine Learning.

## FitBot

O FitBot é o assistente virtual integrado à aplicação. Ele recebe
mensagens, identifica intenções e encaminha solicitações ao backend.

Para ações que alteram o estado do sistema, o fluxo implementado pode
solicitar confirmação do usuário antes de executar a operação.

### Fluxo de interação

1.  O usuário envia uma mensagem.
2.  O sistema processa o texto e identifica a intenção.
3.  O backend verifica a operação solicitada.
4.  Quando necessário, é criada uma ação pendente e solicitada
    confirmação.
5.  Após a confirmação, o backend executa a operação correspondente.
6.  O resultado é retornado à interface.

As intenções e operações disponíveis dependem das funcionalidades
efetivamente implementadas no serviço.

## Perfis de acesso

O sistema trabalha com dois perfis principais:

### ADMIN

Perfil administrativo, com acesso às funcionalidades de administração da
plataforma, de acordo com as permissões implementadas. Inclui operações
de gerenciamento e acesso ao treinamento do modelo de Machine Learning.

### USER

Perfil destinado aos usuários da academia, com acesso às funcionalidades
disponibilizadas para sua utilização e às informações permitidas para
sua própria conta.

A autenticação utiliza JWT, e a autorização é validada pelo backend.

## Testes

Durante o desenvolvimento, foram realizados testes funcionais das
principais áreas da aplicação, incluindo:

-   Login e autenticação.
-   Controle de acesso dos perfis USER e ADMIN.
-   Cadastro, edição e exclusão de usuários.
-   Cadastro e gerenciamento de equipamentos.
-   Início e finalização de sessões.
-   Abertura e conclusão de manutenções.
-   Upload e exibição de fotos de usuários.
-   Responsividade das telas.
-   Mensagens de erro, sucesso e carregamento.
-   Comunicação entre frontend e backend.
-   Integração com o serviço de Machine Learning.
-   Interação com o FitBot.

Os testes foram utilizados para verificar os fluxos principais, as
regras de negócio e a comunicação entre os componentes.

## Limitações e evolução

O projeto pode evoluir com a ampliação das funcionalidades do FitBot, o
aprimoramento das recomendações, a integração com sensores físicos, a
ampliação dos indicadores gerenciais e a disponibilização de relatórios
históricos de treinamento.

## Desenvolvimento

**Projeto:** SmartGym Home\
**Curso:** Análise e Desenvolvimento de Sistemas\
**Instituição:** UniFECAF\
**Repositório:** https://github.com/paahalves-pah/smartgym-home.git
**Figma:** https://www.figma.com/design/cMmEPvQVLch1RWicVlkgx9/SmartGym-Home?node-id=0-1&t=rGCRZGfnKeyjZGWA-1

------------------------------------------------------------------------

*SmartGym Home --- Tecnologia, inteligência e inovação para uma gestão
de academia mais eficiente.*
