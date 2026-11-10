
import { useState } from "react";
import type { FormEvent } from "react";
import {
  BrainCircuit,
  Send,
  Sparkles,
  Bot,
  UserRound,
  Lightbulb,
  Check,
  X,
} from "lucide-react";

import { apiRequest } from "../services/api";

interface Mensagem {
  tipo: "usuario" | "assistente";
  texto: string;
}

interface RespostaChat {
  sucesso: boolean;
  conversaId: number;
  respostaFitBot?: string;
  mensagem?: string;
  acaoPendente?: boolean;
  precisa_confirmacao?: boolean;
}

interface RespostaConfirmacao {
  sucesso: boolean;
  confirmada?: boolean;
  cancelada?: boolean;
  mensagem: string;
}

export default function Inteligencia() {
  const [pergunta, setPergunta] = useState("");

  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      tipo: "assistente",
      texto:
        "Olá! Sou o FitBot, assistente inteligente do SmartGym Home. Posso ajudar com equipamentos, utilizações e gestão da academia. O que deseja fazer?",
    },
  ]);

  const [carregando, setCarregando] = useState(false);
  const [conversaId, setConversaId] = useState<number | null>(null);
  const [acaoPendente, setAcaoPendente] = useState(false);

  function adicionarMensagem(
    tipo: Mensagem["tipo"],
    texto: string
  ) {
    setMensagens((lista) => [...lista, { tipo, texto }]);
  }

  async function enviarPergunta(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const texto = pergunta.trim();

    if (!texto || carregando || acaoPendente) return;

    adicionarMensagem("usuario", texto);
    setPergunta("");
    setCarregando(true);

    try {
      const dados: RespostaChat = await apiRequest(
        "/inteligencia/chat",
        {
          method: "POST",
          body: JSON.stringify({
            texto,
            ...(conversaId ? { conversaId } : {}),
          }),
        }
      );

      setConversaId(dados.conversaId);

      adicionarMensagem(
        "assistente",
        dados.respostaFitBot ||
          dados.mensagem ||
          "Mensagem recebida pelo FitBot."
      );

      setAcaoPendente(dados.acaoPendente === true);
    } catch (erro) {
      adicionarMensagem(
        "assistente",
        erro instanceof Error
          ? erro.message
          : "Não foi possível conectar ao FitBot."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function confirmarAcao(confirmar: boolean) {
    if (!conversaId || carregando || !acaoPendente) return;

    setCarregando(true);

    try {
      const dados: RespostaConfirmacao = await apiRequest(
        "/inteligencia/chat/confirmar",
        {
          method: "POST",
          body: JSON.stringify({
            conversaId,
            confirmar,
          }),
        }
      );

      adicionarMensagem(
        "usuario",
        confirmar ? "Sim, iniciar." : "Não, cancelar."
      );

      adicionarMensagem(
        "assistente",
        dados.mensagem || "Solicitação processada."
      );

      if (
        dados.confirmada ||
        dados.cancelada ||
        dados.sucesso === false
      ) {
        setAcaoPendente(false);
      }
    } catch (erro) {
      adicionarMensagem(
        "assistente",
        erro instanceof Error
          ? erro.message
          : "Erro ao processar a solicitação."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="pagina-conteudo pagina-inteligencia">
      <div className="pagina-titulo">
        <div>
          <span className="texto-destaque">SMART INTELLIGENCE</span>
          <h1>Inteligência Artificial</h1>
          <p>
            Transforme os dados da academia em decisões inteligentes.
          </p>
        </div>

        <div className="inteligencia-status">
          <span className="status-ponto" />
          Assistente inteligente
        </div>
      </div>

      <div className="inteligencia-banner">
        <div className="inteligencia-banner-icone">
          <BrainCircuit size={32} />
        </div>

        <div>
          <span className="texto-destaque">SMARTGYM AI</span>
          <h2>Seu assistente de inteligência fitness</h2>
          <p>
            Converse com o FitBot sobre equipamentos,
            manutenção, utilização e gestão da academia.
          </p>
        </div>

        <Sparkles
          size={28}
          className="inteligencia-brilho"
        />
      </div>

      <div className="chat-container">
        <div className="chat-cabecalho">
          <div className="chat-avatar">
            <Bot size={22} />
          </div>

          <div>
            <h3>FitBot</h3>
            <span>Assistente inteligente SmartGym Home</span>
          </div>
        </div>

        <div className="chat-mensagens">
          {mensagens.map((mensagem, index) => (
            <div
              key={index}
              className={`chat-mensagem ${
                mensagem.tipo === "usuario"
                  ? "mensagem-usuario"
                  : "mensagem-assistente"
              }`}
            >
              <div className="mensagem-avatar">
                {mensagem.tipo === "usuario" ? (
                  <UserRound size={18} />
                ) : (
                  <Bot size={18} />
                )}
              </div>

              <div className="mensagem-conteudo">
                <span>
                  {mensagem.tipo === "usuario"
                    ? "Você"
                    : "FitBot"}
                </span>

                <p>{mensagem.texto}</p>
              </div>
            </div>
          ))}

          {acaoPendente && (
            <div className="chat-confirmacao">
              <p>Deseja confirmar esta operação?</p>

              <button
                type="button"
                onClick={() => confirmarAcao(true)}
                disabled={carregando}
                className="botao-primario"
              >
                <Check size={17} />
                Confirmar
              </button>

              <button
                type="button"
                onClick={() => confirmarAcao(false)}
                disabled={carregando}
              >
                <X size={17} />
                Cancelar
              </button>
            </div>
          )}

          {carregando && (
            <div className="chat-carregando">
              <Sparkles size={18} />
              O FitBot está processando sua solicitação...
            </div>
          )}
        </div>

        <form
          className="chat-formulario"
          onSubmit={enviarPergunta}
        >
          <input
            type="text"
            placeholder="Converse com o FitBot..."
            value={pergunta}
            onChange={(event) =>
              setPergunta(event.target.value)
            }
            disabled={carregando || acaoPendente}
          />

          <button
            type="submit"
            className="botao-primario"
            disabled={
              carregando ||
              !pergunta.trim() ||
              acaoPendente
            }
            aria-label="Enviar mensagem"
          >
            <Send size={18} />
          </button>
        </form>

        <div className="chat-sugestoes">
          <Lightbulb size={16} />
          <span>Sugestões:</span>

          <button
            type="button"
            onClick={() => setPergunta("Quero usar a esteira")}
            disabled={carregando || acaoPendente}
          >
            Usar esteira
          </button>

          <button
            type="button"
            onClick={() =>
              setPergunta("Quero usar a bicicleta ergométrica")
            }
            disabled={carregando || acaoPendente}
          >
            Usar bicicleta
          </button>

          <button
            type="button"
            onClick={() =>
              setPergunta("Quais equipamentos estão disponíveis?")
            }
            disabled={carregando || acaoPendente}
          >
            Equipamentos disponíveis
          </button>
        </div>
      </div>
    </div>
  );
}
