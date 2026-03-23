<section class="contact" id="contato">
  <div class="container">
    <div class="text-center">
      <h2 class="section-title">Entre em <span class="accent">Contato</span></h2>
      <p class="section-subtitle">Estamos prontos para atender suas necessidades e esclarecer quaisquer dúvidas. Entre em contato através dos nossos canais ou envie sua mensagem.</p>
    </div>

    <div class="contact-wrapper">
      <div class="contact-inner">
        <!-- Info -->
        <div class="contact-info">
          <div style="position:relative;z-index:1">
            <div class="badge" style="background:rgba(255,255,255,.2);border-color:rgba(235,6,15,.3);color:white;margin-bottom:1rem">Contato Direto</div>
            <h3>Informações de Contato</h3>
            <p class="contact-info-desc">Estamos prontos para atender sua necessidade. Entre em contato pelos nossos canais:</p>

            <div class="info-card">
              <div class="icon-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <h4>Telefone/WhatsApp</h4>
                <p><a href="https://wa.me/554135036828">(41) 3503-6828</a></p>
              </div>
            </div>

            <div class="info-card">
              <div class="icon-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <div>
                <h4>E-mail</h4>
                <p>contato@magnumtorque.com.br</p>
              </div>
            </div>

            <div class="info-card">
              <div class="icon-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div>
                <h4>Endereço</h4>
                <p>Rua Irmã Maria Lucia Roland, 403 - Hauer</p>
                <p>Curitiba - PR, 81610-090</p>
              </div>
            </div>

            <div class="info-card">
              <div class="icon-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <h4>Horário de Atendimento</h4>
                <p>Segunda a Sexta: 8h às 18h</p>
                <p>Sem fechamento para almoço</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="contact-form">
          <div class="badge" style="margin-bottom:1rem">Formulário de Contato</div>
          <h3>Envie sua Mensagem</h3>
          <p>Preencha o formulário abaixo e entraremos em contato o mais breve possível.</p>

          <form id="contact-form">
            <div class="form-row">
              <div class="form-group">
                <label for="name">Nome Completo</label>
                <input type="text" id="name" placeholder="Seu nome" required>
                <span class="error-msg">Nome deve ter pelo menos 3 caracteres</span>
              </div>
              <div class="form-group">
                <label for="email">E-mail</label>
                <input type="email" id="email" placeholder="seu@email.com" required>
                <span class="error-msg">Email inválido</span>
              </div>
            </div>

            <div class="form-row form-row--single">
              <div class="form-group">
                <label for="subject">Assunto</label>
                <select id="subject" required>
                  <option value="">Selecione um assunto</option>
                  <option value="orcamento">Orçamento</option>
                  <option value="duvida">Dúvida Técnica</option>
                  <option value="agendamento">Agendamento</option>
                  <option value="outro">Outro</option>
                </select>
                <span class="error-msg">Selecione um assunto</span>
              </div>
            </div>

            <div class="form-row form-row--single">
              <div class="form-group">
                <label for="message">Mensagem</label>
                <textarea id="message" placeholder="Digite sua mensagem aqui..." rows="5" required></textarea>
                <span class="error-msg">Mensagem deve ter pelo menos 10 caracteres</span>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-submit">Enviar Mensagem</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</section>
