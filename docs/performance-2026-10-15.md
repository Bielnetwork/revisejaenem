# RevisaJá ENEM — validação de desempenho

Data: 15/10/2026 UTC (14/10/2026 no Brasil). Versão base: a385fe71e1e61d0504bb38828d78268f7cc84bb9.
Somente prévia; nenhuma publicação em produção foi executada.

## Método e limites

Comparação local do HTML efetivamente servido pela rota, com três acessos frios por versão, Chrome headless, viewport 390 × 844, DPR 2, download 1,6 Mbps, latência 150 ms e CPU limitada a 4×. HTML/JS servidos com gzip em ambas as versões. LCP e CLS medidos com PerformanceObserver e condições aplicadas via Chrome DevTools Protocol. Medianas, não resultados garantidos em dispositivos reais.

O SDK externo da Meta foi isolado igualmente nos dois grupos para não enviar visitas de QA nem tornar a comparação dependente da rede de terceiros. Scripts injetados pela hospedagem Lovable não integram esta medição local e foram preservados. A transferência contabiliza recursos próprios efetivamente requisitados; exclui páginas de checkout e arquivos abertos pelo zoom.

Lighthouse foi executado também, com seu perfil mobile padrão/simulação. Esse método é diferente da medição direta. O Chrome deste ambiente não entregou screenshots de trace ao Lighthouse (NO_SCREENSHOTS); por isso, não existe pontuação de performance válida. Não foi inventada ou recalculada uma nota.

## Comparação

- LCP observado, mediana: 3.052 s → 1.444 s.
- CLS observado: 0 → 0.
- Evento load, mediana: 3.026 s → 1.890 s.
- Início da requisição do hero, mediana: 310 ms → 193 ms.
- Hero no mobile DPR 2: 292.518 → 89.374 bytes; mesma composição/proporção.
- Recursos próprios únicos transferidos na rolagem completa mobile: 1,927,649 → 1,338,536 bytes.
- LCP simulado no Lighthouse: 4.653 s → 2.869 s.
- CLS no Lighthouse: 0 → 0. TBT no Lighthouse: 0 → 0 ms. TBT não é INP.
- INP de campo: sem dados válidos disponíveis; não estimado.

## Gargalos e alterações

Hero de 292,5 KB descoberto somente após iniciar o JavaScript; mockups com resolução maior que sua exibição. Mockup Completo: 269,5 KB, Essencial: 232,2 KB, Drive: 138,5 KB. Previews de História: 284,4 e 253,0 KB. Versões ampliadas de História: 616,3 e 588,4 KB, já carregadas sob demanda.

Hero agora presente no HTML inicial, eager, com preload responsivo, fetchpriority alto e dimensões explícitas. O JavaScript reutiliza a imagem existente em vez de reconstruí-la. Versões WebP responsivas para hero, planos e Drive; o navegador escolhe pelo tamanho/DPR. Hero em 480/768/1024 pixels e os demais em 768/1024; originais mantidos como último candidato e para ampliação. Nenhuma imagem real foi substituída por conteúdo gerado, recortada ou deformada.

Miniaturas e seis imagens ampliadas dos resumos foram mantidas byte a byte para preservar a escrita. Fontes locais e HTML direto já dispensavam downloads de fontes e o bundle React nesta rota; nenhuma dependência compartilhada foi removida.

Pré-carregamento dos seis previews únicos, com prioridade baixa após o load inicial ou ao se aproximar da tela. Cópias visuais reutilizam URLs/cache. Movimento permanece por transform/WAAPI, 20 segundos por ciclo, pausado fora da tela. Zoom continua a solicitar somente a imagem ampliada escolhida.

Fallback de variantes responsivas para o original. Proteção defensiva: eventos de erro atrasados são ignorados enquanto a imagem de fallback ainda carrega. O teste confirma o download do original e imagem decodificada; a dimensão natural do navegador é corrigida pela densidade e não é comparada diretamente à resolução física do arquivo. Cópias do carrossel mostram a indicação de falha existente se um arquivo estiver indisponível, sem branco permanente.

## Testes

- Desktop 1440 × 1000 e mobile 390 × 844; mobile com rede/CPU limitadas e cache desativado.
- Todas as imagens do hero, Drive, planos, depoimentos e três faixas do carrossel decodificadas após rolagem completa.
- Nenhuma imagem ampliada carregada antes de abrir o modal.
- Movimento automático, velocidade de 20 s/ciclo, pausa durante ampliação, zoom +/−/reset e fechamento funcionando.
- Arraste touch real via CDP, pausa no toque/hover, retomada e preferência de movimento reduzido validados no navegador.
- Pop-up abre/fecha; navegação dos três botões conferida com interceptação dos destinos exatos fornecidos. Não executado pagamento nem alterada a Wiapy.
- Chamadas locais do Pixel: PageView 1, ViewContent 1; nenhum InitiateCheckout/Purchase ou repetição por carrossel, zoom e pop-up. Arquivo do Pixel preservado: SHA-256 e5c24f62816495cf18f4c2b3e63c34b151575ae461e35c768acbb0d4ed41f1b0. Recebimento remoto não faz parte desta comparação.
- Copy e alturas das seções mobile comparadas com a base: idênticas (tolerância menor que 1 pixel).
- Sem overflow horizontal ou erros de página/console nos testes normais.
- Variante do hero respondendo 404: original carregou corretamente. O erro de rede esperado desse teste de falha não é confundido com os testes normais.
- Build do projeto passou.

## Arquivos

- src/content/revisaja.html
- public/revisaja/biblioteca-drive-v2-1024-4f6a153d63.webp (81,444 bytes)
- public/revisaja/biblioteca-drive-v2-768-413c8ea29f.webp (50,700 bytes)
- public/revisaja/completo-1024-2cd8167061.webp (179,898 bytes)
- public/revisaja/completo-768-b36ecdf84c.webp (109,242 bytes)
- public/revisaja/essencial-1024-014ec155b0.webp (152,264 bytes)
- public/revisaja/essencial-768-71247f93ec.webp (93,364 bytes)
- public/revisaja/hero-1024-ad123d7e75.webp (152,680 bytes)
- public/revisaja/hero-480-9361818fcc.webp (46,182 bytes)
- public/revisaja/hero-768-2e9f21cc2e.webp (89,374 bytes)
- docs/performance-2026-10-15.md (este relatório).

## Pendências de validação

LCP observado atingiu a meta no laboratório, mas o LCP simulado do Lighthouse permaneceu em aproximadamente 2,87 s, acima da meta de 2,5 s. Confirmar Lighthouse/PageSpeed com pontuação válida na prévia ou no próximo ambiente aprovado e acompanhar dados reais de INP. Rede, servidor e scripts externos podem alterar os resultados; não existe garantia para todos os aparelhos. Nenhuma integração externa foi modificada para aumentar artificialmente a pontuação.
