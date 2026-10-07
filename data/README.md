# Dados do site

Depois de editar qualquer arquivo daqui, rode `node scripts/build.mjs` e faça commit dos arquivos gerados (index.html, trabalhos/, politica-de-privacidade/, sitemap.xml, robots.txt, assets/site.js).

- `empresa.json`: razaoSocial, cnpj, email. Vazio = a linha não aparece (rodapé, política e JSON-LD).
- `cases.json`: só entra no site o case com `visible: true` (e `autorizado` diferente de false). Para publicar a SC Advocacia, troque `visible` para `true`.
  - `linkExterno: false` esconde o link "Abrir site". `etiqueta`, `frase` e `depoimento` vazios não renderizam.
  - Mídia é detectada por arquivo: `assets/trabalhos/<slug>/poster.webp`, `tela-N.webp`, `videos/trabalhos/<slug>.mp4` + `.webm`, logo em `assets/clientes/<slug>.*`.
  - `_obs` é só anotação interna.
- `equipe.json`: foto aparece se existir `assets/equipe/<slug>.jpg`.
- `faq.json`: alimenta o FAQ visível e o FAQPage do JSON-LD (sempre iguais).

Prévias novas: `node scripts/make-previews.mjs <slug>` (precisa de Playwright e ffmpeg).
Varredura de aceite: `node scripts/varredura.mjs`.

Mídia da entrada e do hero: `assets/media/` (intro-waxlo-1080.*, intro-poster.jpg, hero-loop-1280.*, hero-poster.jpg, hero-static.jpg, waxlo-wordmark-transparente.png). Arquivo ausente = recurso desligado. Para ver a entrada de novo: `?intro=1` na URL.
