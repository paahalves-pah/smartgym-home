
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

interface LoginProps {
  onLogin: (email: string, senha: string) => Promise<void>;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Login acionado:", email);
    setErro("");
    setCarregando(true);

    try {
      await onLogin(email, senha);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o login."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="pagina-login">
      <div className="login-layout">
        <section className="login-apresentacao-area">
          <div className="login-apresentacao">
           <section className="login-logo-area">
                <img
                    src="/imagem/Login.png"
                    alt="SmartGym Home"
                    className="login-imagem"
                />
          </section> 
          </div>

        </section>

        <section className="login-formulario-area">
          <form className="login-formulario" onSubmit={handleSubmit}>
            <h2>
              Bem-vindo
            </h2>

            <p className="login-subtitulo">
              Entre com suas credenciais para continuar.
            </p>

            <div className="login-campo">
              <label htmlFor="email">E-mail</label>

              <div className="login-input-wrapper">
                <Mail size={17} />

                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-campo">
              <label htmlFor="senha">Senha</label>

              <div className="login-input-wrapper">
                <Lock size={17} />

                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="login-olho"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {erro && <p className="login-erro">{erro}</p>}

            <button
              type="submit"
              className="login-botao"
              disabled={carregando}
            >
              {carregando ? "Entrando..." : "Entrar no sistema"}
              {!carregando && <ArrowRight size={18} />}
            </button>

            <div className="login-seguranca">
              <Lock size={12} />
              <span>Acesso protegido por autenticação</span>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
