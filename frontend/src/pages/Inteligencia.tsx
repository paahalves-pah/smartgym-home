
import { useState } from "react";
import {
  BrainCircuit,
  Send,
  Sparkles,
  Bot,
  UserRound,
  Lightbulb,
} from "lucide-react";

interface Mensagem {
  tipo: "usuario" | "assistente";
  texto: string;
}

export default function Inteligencia() {
  const [pergunta, setPergunta] = useState("");

  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      tipo: "assistente",
      texto:
        "Olá! Sou a inteligência do SmartGym Home. Posso ajudar a analisar os dados da academia, identificar padrões e sugerir melhorias na gestão.",
    },
  ]);

  const [carregando, setCarregando] = useState(false);

  async function enviarPergunta(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pergunta.trim() || carregando) return;

    const perguntaAtual = pergunta.trim();

    setMensagens((lista) => [
      ...lista,
      { tipo: "usuario", texto: perguntaAtual },
    ]);

    setPergunta("");
    setCarregando(true);

    try {
      const resposta = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/inteligencia`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ pergunta: perguntaAtual }),
        }
      );

      if (!resposta.ok) {
        throw new Error("Não foi possível consultar a inteligência.");
      }

      const dados = await resposta.json();

      setMensagens((lista) => [
        ...lista,
        {
          tipo: "assistente",
          texto:
            dados.resposta ||
            dados.mensagem ||
            "A análise foi concluída, mas não recebemos um texto de resposta.",
        },
      ]);
    } catch {
      setMensagens((lista) => [
        ...lista,
        {
          tipo: "assistente",
          texto:
            "Não consegui conectar à inteligência. Verifique se o backend está funcionando.",
        },
      ]);
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
          <p>Transforme os dados da academia em decisões inteligentes.</p>
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
            Faça perguntas sobre equipamentos, manutenção,
            utilização e gestão da academia.
          </p>
        </div>

        <Sparkles size={28} className="inteligencia-brilho" />
      </div>

      <div className="chat-container">
        <div className="chat-cabecalho">
          <div className="chat-avatar">
            <Bot size={22} />
          </div>

          <div>
            <h3>SmartGym Assistant</h3>
            <span>Assistente de inteligência artificial</span>
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
                    : "SmartGym AI"}
                </span>

                <p>{mensagem.texto}</p>
              </div>
            </div>
          ))}

          {carregando && (
            <div className="chat-carregando">
              <Sparkles size={18} />
              A inteligência está analisando sua pergunta...
            </div>
          )}
        </div>

        <form className="chat-formulario" onSubmit={enviarPergunta}>
          <input
            type="text"
            placeholder="Pergunte algo sobre sua academia..."
            value={pergunta}
            onChange={(event) => setPergunta(event.target.value)}
            disabled={carregando}
          />

          <button
            type="submit"
            className="botao-primario"
            disabled={carregando || !pergunta.trim()}
            aria-label="Enviar pergunta"
          >
            <Send size={18} />
          </button>
        </form>

        <div className="chat-sugestoes">
          <Lightbulb size={16} />
          <span>Sugestões:</span>

          <button
            onClick={() =>
              setPergunta("Quais equipamentos precisam de manutenção?")
            }
          >
            Equipamentos
          </button>

          <button
            onClick={() =>
              setPergunta("Como melhorar a utilização dos equipamentos?")
            }
          >
            Utilização
          </button>
        </div>
      </div>
    </div>
  );
}
