# Revisão do site WAXLO: relatório

## Lighthouse mobile (local, mesma máquina, throttling simulado padrão)

| | Antes | Depois |
|---|---|---|
| Performance | 54 | 100 |
| Acessibilidade | 100 | 100 |
| Boas práticas | 96 | 100 |
| SEO | 100 | 100 |
| FCP | 3,8 s | 0,6 s |
| LCP | 4,5 s | 1,1 s |
| CLS | 0 | 0 |
| TBT | 710 ms | 0 ms |
| Peso total | 15.735 KiB | 99 KiB |

O ambiente bloqueia CDNs e o domínio de produção, então o "antes" foi medido servindo o index.html original com Tailwind/GSAP/Swiper/Lucide copiados do npm (Tailwind v4 browser no lugar do Play CDN v3). É uma aproximação. Rode o PageSpeed no deploy de preview para os números reais.
Relatórios completos: `antes/lighthouse-mobile.report.html` e `depois/lighthouse-mobile.report.html`.

HTML + CSS (inline) + JS da home: 58 KB.

## JSON-LD
Home: Organization+ProfessionalService, WebSite, 3 Person, FAQPage (gerado do mesmo faq.json do FAQ visível). Cases: CreativeWork + BreadcrumbList. Sem aggregateRating/review.
O Rich Results Test (search.google.com) está bloqueado neste ambiente; o JSON foi validado por parse e estrutura. Rodar no preview: https://search.google.com/test/rich-results

## Varredura anti-IA (`node scripts/varredura.mjs`)
uppercase 0 · itálico 0 · "—" 0 · ✦/ponto médio 0 · "não é … é" 0 · ecossistema 0 · estrutura digital completa 0 · soluções completas 0 · excelência 0 · itálico em título 0 · numeração fora do Processo 0 · autoplay 0 · vídeo >1,2 MB 0 (maior: 271 KB) · placeholders 0 · "sistema de gestão" fora da faixa 0.
Dourado em texto: só os números do Processo (40 px). Botões dourados usam texto preto.

## Ajustes de texto que precisei fazer para passar na varredura
- FAQ prazo e alterações: "—" trocado por vírgula.
- FAQ processo: "algo construído para você — não um template genérico" virou "algo construído para o seu negócio".
- FAQ negócio pequeno: removido "— existe vontade de crescer" (padrão "não é … é").
- Processo, passo 4: "no ar — e a gente" virou "no ar, e a gente".
- Serviços: H2 "Três pilares. Resultado completo." (tinha itálico e o texto de apoio citava "ecossistema") virou "O que fazemos pelo seu negócio."
- Pacote: "Do zero à operação digital completa." removido; botão "Quero o pacote completo".

## O que ainda parece genérico
- Hero só tipográfico: forte, mas sem nenhuma imagem própria (foto da equipe ou de um cliente real ajudaria).
- Equipe sem fotos: só nome e cargo até existirem assets/equipe/*.jpg.
- Descrições de TAH ON, Vicore e Alto da Serra são curtas e genéricas ("Site da X, de Y"). Vale escrever o que cada site faz.
- Mini-diagnóstico e pacote completo seguem um formato comum a agências; um depoimento real (Happy Sheep) daria mais prova.
- Prévias dos vídeos foram recortadas dos vídeos antigos (8 s); o make-previews.mjs não pôde rodar aqui porque os sites de clientes estão bloqueados pela rede deste ambiente.

## Entrada e hero em vídeo (rodada 2)
- Arquivos em `assets/media/` copiados sem reprocessar: intro-waxlo-1080.mp4/.webm e hero-loop-1280.mp4/.webm.
- **Não vieram nos anexos:** intro-poster.jpg, hero-poster.jpg, hero-static.jpg e waxlo-wordmark-transparente.png. O build detecta cada arquivo; quando faltam:
  - sem wordmark: a intro em vídeo termina no último quadro do vídeo (sem crossfade) e a versão mobile usa escritaWaxlo-alpha-dark.png;
  - sem hero-static: abaixo de 768 px o bloco do hero não aparece (só texto); com reduced-motion/saveData no desktop o quadro fica vazio em creme;
  - sem posters: o vídeo aparece com fade quando começa a tocar.
  Basta colocar os arquivos em assets/media/ e rodar `node scripts/build.mjs`. O alinhamento vídeo/wordmark (44%, 0,556cqh acima do centro) precisa ser conferido com o PNG real.
- Efeito do hero em vídeo no Lighthouse: nenhum no mobile (abaixo de 768 px não baixa vídeo; LCP 1,1 s com a intro CSS rodando). No desktop: Performance 100, LCP 0,3 s, CLS 0; o vídeo só é pedido depois do load e do fim da intro, via requestIdleCallback, então não entra no caminho crítico. Relatório: `depois/lighthouse-desktop.report.html`.
- Testes (Playwright): intro aparece na 1ª visita, grava `waxlo-intro-v4` só ao terminar/pular, não aparece na 2ª; Pular, Esc e clique fecham; página fica `inert` durante a intro; sem JS não há overlay; reduced-motion = sem intro e sem vídeo; `?intro=1` força; mobile usa a versão CSS de 1,2 s sem baixar vídeo. Hero pausa no botão, com aba oculta e fora da tela. Console limpo.
- Frames: `depois/intro-frame-0.5s.png`, `depois/intro-mobile-390.png`, `depois/hero-1440.png`, `depois/hero-768.png`.
- Favicon: "W" recortado do quadro da logo, preto sobre creme (favicon.svg, favicon-32, apple-touch-icon, icon-192/512). og-image: quadro da logo sobre creme, 1200x630, 24 KB.
- O apex `waxlo.com.br` já tem 308 para www no Vercel.

## Ainda genérico (rodada 2)
- O fundo do vídeo do hero tem textura e, mesmo com a máscara de 8%, dá para perceber um retângulo levemente diferente do creme em telas boas.
- A rede dourada do hero não diz nada sobre o negócio; é decorativa.
- Equipe sem fotos e descrições curtas dos cases continuam valendo.

## Rodada 3: ajustes do hero
- Os 4 arquivos que faltavam foram derivados dos próprios vídeos (sem alterar os vídeos): intro-poster.jpg (1º quadro da intro), hero-poster.jpg (1º quadro do loop), hero-static.jpg (quadro de 6 s, rede formada) e waxlo-wordmark-transparente.png (logo recortada do último quadro da intro, tinta #0E1013, 844x197). Se você tiver os originais, é só sobrescrever com o mesmo nome e rodar o build.
- Crossfade vídeo/logo medido no navegador: as caixas da logo coincidem com diferença de 1 px em 1024, 1440 e 1920.
- O retângulo do vídeo sumiu: `filter: brightness(1.06) contrast(1.08)` + `mix-blend-mode: multiply` sobre o creme. O fundo do vídeo vira branco e multiplicado dá exatamente #F8F6F1 (medido em 5 pontos); a textura desaparece e só a rede dourada fica. Arquivo intacto.
- Mobile: hero-static recortado em 4:3 na região da rede, inserido só depois do load (decorativo, não disputa o LCP com o H1). A intro CSS usa a logo leve (20 KB).
- Lighthouse mobile final: 100 / 100 / 100 / 100, LCP 1,1 s, CLS 0. Desktop: 100, LCP 0,4 s.
