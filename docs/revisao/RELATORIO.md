# Revisão do site WAXLO: relatório

## Lighthouse mobile (local, mesma máquina, throttling simulado padrão)

| | Antes | Depois |
|---|---|---|
| Performance | 54 | 100 |
| Acessibilidade | 100 | 100 |
| Boas práticas | 96 | 100 |
| SEO | 100 | 100 |
| FCP | 3,8 s | 0,9 s |
| LCP | 4,5 s | 1,3 s |
| CLS | 0 | 0 |
| TBT | 710 ms | 70 ms |
| Peso total | 15.735 KiB | 76 KiB |

O ambiente bloqueia CDNs e o domínio de produção, então o "antes" foi medido servindo o index.html original com Tailwind/GSAP/Swiper/Lucide copiados do npm (Tailwind v4 browser no lugar do Play CDN v3). É uma aproximação. Rode o PageSpeed no deploy de preview para os números reais.
Relatórios completos: `antes/lighthouse-mobile.report.html` e `depois/lighthouse-mobile.report.html`.

HTML + CSS (inline) + JS da home: 48 KB.

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
