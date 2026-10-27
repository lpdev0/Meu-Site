# Lorenzo — Web designer e desenvolvedor

Portfólio em React, TypeScript, Tailwind CSS, Framer Motion e Lucide React. Textos em português do Brasil, fonte Kanit e fundo #0C0C0C. Apresentação, sobre, serviços, projetos, processo, investimento e contato.

## Executar

Com Node.js e npm instalados:

```sh
npm install
npm run dev
```

Acesse http://127.0.0.1:5173. Para produção: `npm run build`. Para visualizar o build: `npm run preview -- --port 5173`.

A validação anterior usou dependências em cache com algumas versões diferentes das declaradas em `package.json`. A instalação exata das faixas do manifesto ainda precisa ser validada com acesso ao registro npm.

## Configuração

- `src/data.ts`: textos, URLs de imagens, `siteConfig.contactUrl` e `siteConfig.projectUrls`.
- `src/components/Motion.tsx`: FadeIn, Magnet e AnimatedText.
- `src/components/Sections.tsx`: Hero, Marquee, About, Services e Projects.
- `src/components/Buttons.tsx`: ContactButton e LiveProjectButton.
- `src/styles.css`: estilos globais, gradientes e adaptações de telas baixas.

Os botões de contato abrem o WhatsApp de Lorenzo: https://wa.me/message/GB2WPJBIT5AZM1. Os projetos são Dentora, Life Odontologia e NeuralKinetics; cada botão “Explorar projeto” abre o endereço da Vercel fornecido pelo proprietário. Os destinos abrem em nova aba. As imagens em `public/projects/` são capturas dos projetos, sem depender de serviços externos de miniaturas. Dentora e NeuralKinetics são projetos conceituais, identificados nas descrições.

## Repositório público

O WhatsApp, os endereços dos projetos e os arquivos em `public/` são conteúdo público. Nunca coloque credenciais em `src/` ou `public/`: valores usados pelo frontend, incluindo variáveis `VITE_*`, podem aparecer no código entregue ao navegador.

O `.gitignore` exclui variáveis de ambiente locais, credenciais em formatos comuns, backups, relatórios de teste e o relatório do computador. Um eventual `.env.example` deve conter apenas valores fictícios. Confira `git status --short` antes de cada commit; o `.gitignore` não protege arquivos já versionados nem uploads manuais. O nome e o e-mail usados como autor dos commits também ficam públicos; use o e-mail de privacidade do provedor Git se desejar.

As imagens e a fonte carregam dos endereços externos do briefing e dependem da disponibilidade desses servidores. As duplicações do marquee são decorativas. Os efeitos respondem à preferência de movimento reduzido sem recarregar a página; nesse modo os GIFs exibem um frame estático em canvas. Os projetos mantêm o empilhamento original por rolagem, com redução de escala e deslocamentos de 28px. A verificação automática de altura foi removida a pedido do usuário. Movimento reduzido e telas de até 650px de altura exibem os cards em fluxo normal.

Esta é uma prévia local, sem publicação, analytics ou coleta de dados. A indexação está desativada. Para publicar, configurar contato e URLs reais, verificar direitos de uso das imagens, definir domínio e ajustar os metadados de indexação. Consulte `CHECKLIST.md`.

## Verificação local

TypeScript e build de produção passaram. A prévia respondeu HTTP 200. Microsoft Edge via Playwright confirmou ausência de erros JavaScript, abertura dos diálogos de contato e projeto, fechamento por Escape e ausência de overflow horizontal em 320, 390, 768, 1440 e 1920 px. O título permanece dentro da tela mesmo com fonte de reserva. Resultados registrados em `test-results/validation.json`. Imagens e Google Fonts não carregaram no ambiente de teste sem acesso externo; a composição com os materiais finais ainda precisa de conferência em um navegador com conexão. As URLs originais foram preservadas.

A revisão de movimento acrescentou 10 testes aprovados, incluindo alteração da preferência durante a sessão, captura estática de GIF animado e retomada, cancelamento do Magnet ao sair da janela, direções e velocidade do marquee, progresso de opacidade por caractere e geometria do empilhamento. Execute `node scripts/review-motion.cjs` com Playwright e Microsoft Edge disponíveis. O script usa imagens sintéticas apenas no navegador de teste; não modifica os materiais do portfólio. Resultados em `test-results/motion-review.json` e detalhes em `MOTION-REVIEW.md`.
