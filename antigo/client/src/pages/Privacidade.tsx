import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Privacidade() {
  const lastUpdated = new Date("2025-01-01").toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold font-montserrat text-gray-900 mb-2">
          Política de Privacidade
        </h1>
        <p className="text-sm text-gray-500 mb-12">Última atualização: {lastUpdated}</p>

        <div className="prose prose-gray max-w-none prose-headings:font-montserrat prose-h2:text-2xl prose-h2:mt-10 prose-h3:text-lg prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
          <p>
            A <strong>Magnum Torque Retifica LTDA</strong> ("Magnum Torque", "nós") está comprometida com a
            proteção dos seus dados pessoais, em conformidade com a{" "}
            <strong>Lei Geral de Proteção de Dados Pessoais (LGPD – Lei nº 13.709/2018)</strong>.
          </p>

          <h2>1. Quem somos</h2>
          <p>
            <strong>Controlador dos dados:</strong> Magnum Torque Retifica LTDA<br />
            <strong>Endereço:</strong> Rua Irmã Maria Lucia Roland, 403 – Hauer, Curitiba – PR, CEP 81610-090<br />
            <strong>E-mail:</strong>{" "}
            <a href="mailto:contato@magnumtorque.com.br">contato@magnumtorque.com.br</a><br />
            <strong>Telefone:</strong> (41) 3503-6828
          </p>

          <h2>2. Quais dados coletamos</h2>

          <h3>2.1 Formulário de contato</h3>
          <p>
            Ao preencher nosso formulário, coletamos: nome completo, e-mail, CPF ou CNPJ, assunto e
            mensagem. Esses dados são transmitidos diretamente via WhatsApp e{" "}
            <strong>não são armazenados em nossos servidores</strong>.
          </p>

          <h3>2.2 Cookies de sessão</h3>
          <p>
            Utilizamos um cookie de sessão (<code>auth.sid</code>) exclusivamente para manter usuários
            administrativos autenticados. Este cookie é estritamente funcional, não rastreia navegação e é
            removido ao encerrar a sessão ou após 24 horas.
          </p>

          <h3>2.3 Fontes externas (Google Fonts)</h3>
          <p>
            Este site carrega fontes tipográficas do Google Fonts, o que pode implicar o compartilhamento
            do seu endereço IP com servidores do Google, sujeito à{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Política de Privacidade do Google
            </a>
            .
          </p>

          <h2>3. Para que usamos seus dados</h2>
          <ul>
            <li>Responder às suas solicitações de contato, orçamento ou agendamento.</li>
            <li>Manter o acesso seguro ao painel administrativo interno.</li>
          </ul>
          <p>Não utilizamos seus dados para publicidade, perfis comportamentais ou qualquer outra finalidade.</p>

          <h2>4. Base legal (LGPD art. 7º)</h2>
          <ul>
            <li>
              <strong>Legítimo interesse</strong> (inciso IX): para tratar solicitações comerciais enviadas
              voluntariamente pelo usuário.
            </li>
            <li>
              <strong>Consentimento</strong> (inciso I): para uso de cookies de sessão e carregamento de
              fontes externas (Google Fonts).
            </li>
          </ul>

          <h2>5. Compartilhamento de dados</h2>
          <p>
            Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins
            comerciais. Os dados do formulário são transmitidos ao WhatsApp (Meta Platforms Inc.), sujeito
            aos termos de uso desse serviço.
          </p>

          <h2>6. Armazenamento e segurança</h2>
          <p>
            As informações do formulário de contato não são armazenadas em banco de dados. Dados do
            sistema administrativo são mantidos em servidor privado no Brasil, com acesso protegido por
            autenticação e senhas criptografadas (bcrypt).
          </p>

          <h2>7. Seus direitos (LGPD art. 18)</h2>
          <p>Você tem direito a:</p>
          <ul>
            <li>Confirmar a existência de tratamento dos seus dados.</li>
            <li>Acessar os dados que possuímos sobre você.</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
            <li>Solicitar a anonimização, bloqueio ou eliminação dos seus dados.</li>
            <li>Revogar o consentimento a qualquer momento.</li>
          </ul>
          <p>
            Para exercer qualquer um desses direitos, entre em contato pelo e-mail{" "}
            <a href="mailto:contato@magnumtorque.com.br">contato@magnumtorque.com.br</a>.
          </p>

          <h2>8. Alterações nesta política</h2>
          <p>
            Esta política pode ser atualizada periodicamente. A data da última revisão sempre estará
            indicada no topo desta página. Alterações relevantes serão comunicadas em destaque no site.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/" className="text-primary hover:text-primary/80 font-medium transition-colors">
            ← Voltar ao início
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
