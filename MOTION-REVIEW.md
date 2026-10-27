# Revisão das animações

Escopo: animações, comportamento por rolagem, acessibilidade de movimento e adaptação à altura da tela. `src/data.ts`, os destinos dos botões e os diálogos não foram alterados.

## Correções

- A preferência `prefers-reduced-motion` passa a ser observada durante toda a sessão com `useSyncExternalStore`. O hook da versão de Motion instalada lia o valor inicial, sem atualizar os componentes quando a preferência mudava.
- O Magnet limpa o deslocamento ao desativar movimento. Cancela frames pendentes ao sair da janela, perder foco ou rolar, evitando deslocamentos atrasados. Eventos de toque não ativam o efeito.
- Os GIFs têm um frame capturado em canvas no modo reduzido. A captura funciona sem exportar ou ler pixels de imagens externas e mantém as URLs originais.
- O marquee interrompe a atualização por rolagem no modo reduzido e retoma ao voltar ao modo normal.
- A pedido do usuário, foi restaurado o empilhamento original dos projetos, com redução de escala por rolagem e deslocamentos de 28px. A verificação automática da altura dos cards foi removida. Permanecem as alternativas para movimento reduzido e telas de até 650px de altura.
- As entradas ficam imediatamente visíveis no modo reduzido, inclusive quando a preferência muda durante a sessão.

## Evidência

TypeScript e build de produção passaram. A prévia atualizada respondeu HTTP 200 em http://127.0.0.1:5173.

| Teste | Resultado |
|---|---|
| Entrada do hero | Opacidade final 1 e deslocamento encerrado. |
| Magnet | Movimento de ponteiro de +90/−60px produz +30/−20px, com retorno ao centro. |
| Preferência durante a sessão | Deslocamento zerado sem recarregar. |
| Saída antes do próximo frame | Movimento pendente cancelado. |
| Marquee | 400px de rolagem produzem +120px e −120px nas duas faixas. |
| GIF animado | Frames diferem no modo normal, permanecem idênticos no modo reduzido e a animação pode ser retomada. |
| Texto About | Opacidade média evolui de 0,20 para aproximadamente 0,59 e depois 1. |
| Cards empilhados | Escalas decrescentes, distâncias de 28px e terceiro card inteiramente visível. |
| Movimento reduzido | GIFs estáticos e cards em fluxo normal. |
| Responsividade | Sem overflow em 320, 390, 768, 844 e 1920px; telas baixas desativam o empilhamento. |

Script: `scripts/review-motion.cjs`. Resultado: `test-results/motion-review.json`. Nenhum erro JavaScript registrado.

## Limite da verificação

A conexão deste ambiente continua falhando ao acessar os materiais externos. Os testes substituem essas respostas por SVGs sintéticos e um GIF de duas cores, exclusivamente dentro do navegador de teste. Isso verifica movimento, carregamento de frames e geometria, mas não confirma a disponibilidade ou a composição visual das imagens e da fonte originais. Nenhum arquivo substituto foi publicado no portfólio.

Foram consultadas as referências oficiais de [useScroll](https://motion.dev/docs/react-use-scroll) e [useReducedMotion](https://motion.dev/docs/react-use-reduced-motion), além da implementação local da versão instalada.
