#!/usr/bin/env node
// Gera index.html, /trabalhos/<slug>/, /politica-de-privacidade/, sitemap.xml e robots.txt
// a partir de data/*.json. Uso: node scripts/build.mjs
// Regra: dado ausente = elemento não renderiza. O build falha se sobrar placeholder.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://www.waxlo.com.br";
const WPP = "5549988913704";
const TEL = "+5549988913704";
const IG = "https://www.instagram.com/waxlo.tech/";
const UPDATED = "2026-10-06";

const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const empresa = read("data/empresa.json");
const allCases = read("data/cases.json");
const faq = read("data/faq.json");
const equipe = read("data/equipe.json");
const cases = allCases.filter((c) => c.visible === true && c.autorizado !== false);
const has = (v) => typeof v === "string" && v.trim() !== "";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const exists = (p) => existsSync(join(ROOT, p));
const findFile = (dir, base) => {
  if (!exists(dir)) return null;
  const f = readdirSync(join(ROOT, dir)).find((n) => n.split(".")[0] === base);
  return f ? `${dir}/${f}` : null;
};
const PAISES = { BR: "Brasil", IE: "Irlanda" };
const lugar = (c) => [c.cidade, PAISES[c.pais] || c.pais].filter(has).join(", ");
const wa = (text) => `https://wa.me/${WPP}?text=${encodeURIComponent(text)}`;

const css = readFileSync(join(ROOT, "src/site.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s*\n\s*/g, "\n").trim();
mkdirSync(join(ROOT, "assets"), { recursive: true });
copyFileSync(join(ROOT, "src/site.js"), join(ROOT, "assets/site.js"));

const WPP_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4c-1-1.6-1.5-3.4-1.5-5.2 0-5.4 4.4-9.8 9.8-9.8 2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zm8.4-18.2C18.1 1.3 15.2.1 12 .1 5.5.1.2 5.4.2 11.9c0 2.1.5 4.1 1.6 5.9L.1 24l6.3-1.7c1.7.9 3.7 1.4 5.6 1.4 6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.2-6.1-3.4-8.3z"/></svg>`;

const NAV = [["Trabalhos", "trabalhos"], ["Serviços", "servicos"], ["Processo", "processo"], ["Equipe", "equipe"], ["Contato", "contato"]];

function layout({ title, description, path, body, jsonld, ogImage = "/assets/og-image.jpg", home = false }) {
  const url = SITE + path;
  const pre = home ? "" : "/";
  const navLinks = NAV.map(([t, id]) => `<a href="${pre}#${id}">${t}</a>`).join("");
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#F8F6F1">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="WAXLO">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${SITE}${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="WAXLO, criação de sites profissionais em Lages, SC">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preload" href="/fonts/bricolage-grotesque-latin.woff2" as="font" type="font/woff2" crossorigin>
<style>${css}</style>
<script>document.documentElement.className="js"</script>
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n")}
<script src="/assets/site.js" defer></script>
</head>
<body>
<a class="skip" href="#conteudo">Pular para o conteúdo</a>
<header class="top">
  <div class="wrap top__in">
    <a class="logo" href="/" aria-label="WAXLO, página inicial"><img src="/assets/escritaWaxlo-alpha-dark.png" alt="WAXLO" width="118" height="28"></a>
    <nav class="nav" aria-label="Principal">${navLinks}</nav>
    <a class="btn btn--gold btn--sm top__cta" href="${pre}#contato">Pedir diagnóstico</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mnav" aria-label="Abrir menu"><span></span></button>
  </div>
</header>
<nav id="mnav" class="mnav" aria-label="Menu" hidden>${navLinks}<a class="btn btn--gold" href="${pre}#contato">Pedir diagnóstico</a></nav>
<main id="conteudo">
${body}
</main>
${footer(pre)}
<a class="wpp" href="https://wa.me/${WPP}" target="_blank" rel="noopener" aria-label="Falar com a WAXLO no WhatsApp">${WPP_ICON}</a>
</body>
</html>
`;
}

function footer(pre) {
  const legal = [
    has(empresa.razaoSocial) && `<li>${esc(empresa.razaoSocial)}</li>`,
    has(empresa.cnpj) && `<li>CNPJ ${esc(empresa.cnpj)}</li>`,
  ].filter(Boolean).join("");
  return `<footer class="foot">
  <div class="wrap">
    <div class="foot__grid">
      <div class="foot__brand">
        <img src="/assets/escritaWaxlo-alpha-dark.png" alt="WAXLO" width="110" height="26" loading="lazy">
        <p>Empresa de tecnologia de Lages, SC. Sites profissionais, presença no Google e marketing.</p>
      </div>
      <div>
        <h2>Serviços</h2>
        <ul><li><a href="${pre}#servicos">Sites e landing pages</a></li><li><a href="${pre}#servicos">Presença no Google</a></li><li><a href="${pre}#servicos">Marketing e conteúdo</a></li></ul>
      </div>
      <div>
        <h2>Empresa</h2>
        <ul><li><a href="${pre}#trabalhos">Trabalhos</a></li><li><a href="${pre}#processo">Processo</a></li><li><a href="${pre}#equipe">Equipe</a></li>${legal}</ul>
      </div>
      <div>
        <h2>Contato</h2>
        <ul><li><a href="https://wa.me/${WPP}" target="_blank" rel="noopener">(49) 98891-3704</a></li><li><a href="${IG}" target="_blank" rel="noopener">@waxlo.tech</a></li>${has(empresa.email) ? `<li><a href="mailto:${esc(empresa.email)}">${esc(empresa.email)}</a></li>` : ""}<li>Lages, SC, Brasil</li></ul>
      </div>
    </div>
    <div class="foot__legal">
      <p>© ${new Date().getFullYear()} WAXLO</p>
      <a href="/politica-de-privacidade/">Política de Privacidade</a>
    </div>
  </div>
</footer>`;
}

/* ---------- JSON-LD ---------- */
const ORG_ID = SITE + "/#org";
const orgLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": ORG_ID,
      name: "WAXLO",
      ...(has(empresa.razaoSocial) ? { legalName: empresa.razaoSocial } : {}),
      ...(has(empresa.cnpj) ? { taxID: empresa.cnpj } : {}),
      ...(has(empresa.email) ? { email: empresa.email } : {}),
      url: SITE + "/",
      logo: SITE + "/assets/icon-192.png",
      image: SITE + "/assets/og-image.jpg",
      description: "Criação de sites profissionais, presença no Google e marketing para negócios de Lages (SC) e de todo o Brasil, com clientes também na Irlanda.",
      telephone: TEL,
      address: { "@type": "PostalAddress", addressLocality: "Lages", addressRegion: "SC", addressCountry: "BR" },
      areaServed: ["BR", "IE"],
      sameAs: [IG],
      founder: equipe.map((p) => ({ "@id": `${SITE}/#${p.slug}` })),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Serviços WAXLO",
        itemListElement: ["Criação de sites", "Presença no Google (SEO local)", "Marketing e conteúdo"].map((n) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: n },
        })),
      },
    },
    { "@type": "WebSite", "@id": SITE + "/#site", url: SITE + "/", name: "WAXLO", inLanguage: "pt-BR", publisher: { "@id": ORG_ID } },
    ...equipe.map((p) => ({
      "@type": "Person",
      "@id": `${SITE}/#${p.slug}`,
      name: p.nome,
      jobTitle: p.cargo,
      worksFor: { "@id": ORG_ID },
      ...(exists(`assets/equipe/${p.slug}.jpg`) ? { image: `${SITE}/assets/equipe/${p.slug}.jpg` } : {}),
    })),
  ],
};
const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

/* ---------- Home ---------- */
const media = (c) => {
  const poster = `assets/trabalhos/${c.slug}/poster.webp`;
  if (!exists(poster)) return "";
  const vid = exists(`videos/trabalhos/${c.slug}.mp4`) && exists(`videos/trabalhos/${c.slug}.webm`);
  const img = `<img src="/${poster}" alt="Página inicial do site ${esc(c.nome)}" width="960" height="540" loading="lazy" decoding="async">`;
  if (!vid) return `<div class="case__media">${img}</div>`;
  return `<div class="case__media" data-video="/videos/trabalhos/${c.slug}">${img}<video muted loop playsinline preload="none" aria-hidden="true"></video><button class="case__pause" type="button" aria-label="Reproduzir vídeo"></button></div>`;
};

const caseCard = (c) => {
  const logo = findFile("assets/clientes", c.slug);
  const actions = [
    `<a class="link" href="/trabalhos/${c.slug}/">Ver o projeto</a>`,
    has(c.url) && `<button class="link" type="button" data-live="${esc(c.url)}" data-nome="${esc(c.nome)}" hidden>Ver ao vivo</button>`,
    has(c.url) && c.linkExterno !== false && `<a class="link" href="${esc(c.url)}" target="_blank" rel="noopener">Abrir site<span class="sr-only"> ${esc(c.nome)} (nova aba)</span></a>`,
  ].filter(Boolean).join("");
  return `<article class="case rv${c.destaque ? " case--destaque" : ""}" data-nicho="${esc(c.nicho)}">
  ${media(c)}
  <div class="case__body">
    ${has(c.etiqueta) ? `<span class="case__tag">${esc(c.etiqueta)}</span>` : ""}
    ${logo ? `<img class="case__logo" src="/${logo}" alt="Logo ${esc(c.nome)}" loading="lazy">` : ""}
    <h3><a href="/trabalhos/${c.slug}/">${esc(c.nome)}</a></h3>
    <p class="case__meta">${esc([c.nicho, lugar(c)].filter(has).join(". "))}</p>
    ${has(c.frase) ? `<p class="case__frase">${esc(c.frase)}</p>` : ""}
    ${has(c.depoimento) ? `<blockquote class="case__frase">${esc(c.depoimento)}</blockquote>` : ""}
    <div class="case__actions">${actions}</div>
  </div>
</article>`;
};

const nichos = [...new Set(cases.map((c) => c.nicho).filter(has))];
const ordered = [...cases].sort((a, b) => (b.destaque === true) - (a.destaque === true));

const work = cases.length ? `<section id="trabalhos" class="section" aria-labelledby="h-trabalhos">
  <div class="wrap">
    <div class="head rv"><h2 id="h-trabalhos" class="h2">O que já entregamos.</h2></div>
    ${nichos.length > 1 ? `<div class="filters" role="group" aria-label="Filtrar por nicho"><button class="chip" type="button" data-nicho="*" aria-pressed="true">Todos</button>${nichos.map((n) => `<button class="chip" type="button" data-nicho="${esc(n)}" aria-pressed="false">${esc(n)}</button>`).join("")}</div>` : ""}
    <div class="cases">${ordered.map(caseCard).join("\n")}</div>
    <p class="work__after">Quer ver como ficaria o site do seu negócio? <a class="link" href="#contato">Fale com a nossa equipe</a></p>
  </div>
  <dialog id="viewer" class="viewer" data-mode="desktop" aria-labelledby="viewer-title">
    <div class="viewer__bar">
      <div class="viewer__dots" aria-hidden="true"><i></i><i></i><i></i></div>
      <h2 id="viewer-title" class="sr-only viewer__title">Site ao vivo</h2>
      <span class="viewer__url"></span>
      <div class="viewer__modes" role="group" aria-label="Tamanho da tela"><button type="button" data-mode="desktop" aria-pressed="true">Computador</button><button type="button" data-mode="mobile" aria-pressed="false">Celular</button></div>
      <button class="viewer__close" type="button" aria-label="Fechar visualização">×</button>
    </div>
    <div class="viewer__stage"><iframe title="Site ao vivo" src="about:blank" loading="lazy" referrerpolicy="no-referrer"></iframe></div>
    <div class="viewer__foot"><span>Se o site não aparecer aqui, ele bloqueia a visualização incorporada.</span><a class="link viewer__open" href="#" target="_blank" rel="noopener">Abrir site</a></div>
  </dialog>
</section>` : "";

const team = equipe.map((p) => {
  const foto = `assets/equipe/${p.slug}.jpg`;
  return `<li class="rv">${exists(foto) ? `<img src="/${foto}" alt="${esc(p.nome)}" width="600" height="750" loading="lazy">` : ""}<h3>${esc(p.nome)}</h3><p class="role">${esc(p.cargo)}</p><p>${esc(p.descricao)}</p></li>`;
}).join("");

const opt = (name, value, type = "checkbox") => `<label class="opt"><input type="${type}" name="${name}" value="${value}"><span>${value}</span></label>`;

const homeBody = `
<section class="hero">
  <div class="wrap">
    <h1>Sites profissionais para negócios que querem ser encontrados e escolhidos.</h1>
    <p class="hero__sub">A WAXLO é uma empresa de tecnologia de Lages, SC. Criamos o site do seu negócio, colocamos você no Google e organizamos o contato com o cliente pelo WhatsApp. Trabalhamos com clientes no Brasil e na Irlanda.</p>
    <div class="hero__cta"><a class="btn btn--gold" href="#contato">Pedir diagnóstico</a><a class="btn btn--line" href="#trabalhos">Ver trabalhos</a></div>
  </div>
</section>
<div class="proof"><div class="wrap"><p>No ar em Lages (SC), Angatuba (SP) e Dublin (Irlanda).</p></div></div>

<section class="section section--white" aria-labelledby="h-problema">
  <div class="wrap problem__grid">
    <h2 id="h-problema" class="h2 rv">Quando o cliente procura e não encontra você, ele fecha com quem aparece.</h2>
    <div class="rv">
      <ul class="problem__list">
        <li>Seu site não existe ou não explica o que você faz.</li>
        <li>Seu negócio não aparece quando o cliente procura no Google.</li>
        <li>O cliente quer falar com você e não sabe por onde começar.</li>
      </ul>
      <div class="problem__foot"><a class="btn btn--line" href="#contato">Conversar sobre isso</a><p>Primeira conversa gratuita e sem compromisso</p></div>
    </div>
  </div>
</section>

<section id="diferenciais" class="section" aria-labelledby="h-dif">
  <div class="wrap">
    <div class="head rv"><h2 id="h-dif" class="h2">Por que escolher a WAXLO?</h2></div>
    <ul class="diff rv">
      <li>Uma equipe para tudo: site, Google e contato com o cliente.</li>
      <li>Cada projeto parte do seu negócio, não de um modelo pronto.</li>
      <li>Prazo e valor combinados na reunião e registrados em contrato antes de começar.</li>
    </ul>
  </div>
</section>

${work}

<section id="servicos" class="section section--white" aria-labelledby="h-servicos">
  <div class="wrap">
    <div class="head rv"><h2 id="h-servicos" class="h2">O que fazemos pelo seu negócio.</h2></div>
    <ul class="svc">
      <li class="rv"><h3>Site profissional</h3><p>Sites e landing pages feitos para o seu negócio, com identidade visual, WhatsApp integrado e otimização para o Google.</p></li>
      <li class="rv"><h3>Presença no Google</h3><p>Perfil no Google Maps, Search Console e SEO local, para você ser encontrado na sua cidade.</p></li>
      <li class="rv"><h3>Marketing e conteúdo</h3><p>Posts, campanhas e conteúdo para manter o negócio visível depois que o site vai ao ar.</p></li>
    </ul>
    <div class="pack rv">
      <div>
        <h3>Tudo em um único projeto.</h3>
        <p>Uma equipe, um processo, um resultado.</p>
      </div>
      <ul><li>Site premium</li><li>Identidade visual</li><li>Presença no Google</li><li>Posts e marketing</li><li>Configuração completa</li></ul>
      <a class="btn btn--gold" href="#contato">Quero o pacote completo</a>
    </div>
  </div>
</section>

<aside class="soon" aria-label="Em breve">
  <div class="wrap"><p>Sistemas de gestão para clínicas, consultórios e academias estão em desenvolvimento.</p><a class="link" href="${wa("Quero ser avisado quando os sistemas de gestão da WAXLO abrirem.")}" target="_blank" rel="noopener">Quero ser avisado</a></div>
</aside>

<section id="processo" class="section section--dark" aria-labelledby="h-processo">
  <div class="wrap">
    <div class="head rv"><h2 id="h-processo" class="h2">Como a gente trabalha.</h2><p class="lead">Antes de qualquer entrega, existe uma conversa. Depois dela, existe um contrato. Só depois existe código.</p></div>
    <ol class="steps rv">
      <li><span class="n" aria-hidden="true">1</span><h3>Diagnóstico</h3><p>Uma conversa sem pressa. Você fala sobre o seu negócio, seus clientes, o que funciona e o que trava. A gente escuta.</p></li>
      <li><span class="n" aria-hidden="true">2</span><h3>Proposta e contrato</h3><p>Tudo documentado: o que será feito, em quanto tempo, por quanto. Sem surpresa depois.</p></li>
      <li><span class="n" aria-hidden="true">3</span><h3>Desenvolvemos juntos</h3><p>Reuniões de alinhamento ao longo do projeto. Você vê, aprova e sugere a cada etapa.</p></li>
      <li><span class="n" aria-hidden="true">4</span><h3>Entrega e parceria</h3><p>Seu projeto no ar, e a gente continua do lado. Suporte, melhorias e uma conexão que não acaba com a entrega.</p></li>
    </ol>
  </div>
</section>

<section id="equipe" class="section" aria-labelledby="h-equipe">
  <div class="wrap">
    <div class="head rv"><h2 id="h-equipe" class="h2">Quem está por trás da WAXLO</h2><p class="lead">Uma empresa construída para ajudar negócios a crescer através da tecnologia.</p></div>
    <ul class="team">${team}</ul>
  </div>
</section>

<section id="faq" class="section section--white" aria-labelledby="h-faq">
  <div class="wrap">
    <div class="head rv"><h2 id="h-faq" class="h2">Perguntas frequentes</h2></div>
    <div class="faq">${faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div>
  </div>
</section>

<section id="contato" class="section section--dark" aria-labelledby="h-contato">
  <div class="wrap contact__grid">
    <div class="rv">
      <h2 id="h-contato" class="h2">Vamos conversar sobre o seu negócio.</h2>
      <p class="lead" style="margin-top:20px">Conte o que você faz e o que está travando.</p>
      <div class="contact__alt">
        <a class="link" href="https://wa.me/${WPP}" target="_blank" rel="noopener">WhatsApp (49) 98891-3704</a>
        <a class="link" href="${IG}" target="_blank" rel="noopener">Instagram @waxlo.tech</a>
      </div>
    </div>
    <form id="diag" class="form rv" novalidate>
      <h3>Mini-diagnóstico</h3>
      <div class="field"><label for="f-nome">Seu nome (opcional)</label><input id="f-nome" name="nome" type="text" autocomplete="name"></div>
      <div class="field"><label for="f-seg">Segmento do negócio (ex.: clínica, restaurante, loja)</label><input id="f-seg" name="segmento" type="text" required autocomplete="organization-title"></div>
      <fieldset class="field"><legend>Do que você precisa?</legend><div class="opts">${["Site novo", "Reformar meu site", "Aparecer no Google", "Marketing e conteúdo", "Ainda não sei"].map((v) => opt("precisa", v)).join("")}</div></fieldset>
      <fieldset class="field"><legend>Já tem site?</legend><div class="opts">${opt("tem_site", "Sim", "radio")}${opt("tem_site", "Não", "radio")}</div></fieldset>
      <div class="field"><label for="f-msg">Mensagem (opcional)</label><textarea id="f-msg" name="mensagem"></textarea></div>
      <label class="consent"><input id="f-ok" type="checkbox" name="privacidade" required><span>Li e concordo com a <a href="/politica-de-privacidade/" target="_blank">Política de Privacidade</a> e autorizo o uso destes dados para a WAXLO responder o meu contato.</span></label>
      <p class="form__err" role="alert" aria-live="assertive"></p>
      <button class="btn btn--gold" type="submit">Enviar pelo WhatsApp</button>
    </form>
  </div>
</section>`;

const pages = [];
pages.push(["index.html", layout({
  home: true,
  path: "/",
  title: "WAXLO | Criação de sites profissionais em Lages, SC",
  description: "A WAXLO cria sites profissionais para negócios de Lages e de todo o Brasil: design sob medida, presença no Google e contato direto pelo WhatsApp. Clientes no Brasil e na Irlanda.",
  jsonld: [orgLd, faqLd],
  body: homeBody,
})]);

/* ---------- Case pages ---------- */
if (exists("trabalhos")) rmSync(join(ROOT, "trabalhos"), { recursive: true });
for (const c of cases) {
  const dir = `assets/trabalhos/${c.slug}`;
  const shots = exists(dir) ? readdirSync(join(ROOT, dir)).filter((f) => /^tela-\d+\.webp$/.test(f)).sort() : [];
  const url = `/trabalhos/${c.slug}/`;
  const desc = has(c.descricao) ? c.descricao : `${c.nome}: site criado pela WAXLO.`;
  const body = `<article class="page"><div class="wrap">
  <nav class="crumbs" aria-label="Trilha"><a href="/">Início</a> / <a href="/#trabalhos">Trabalhos</a> / ${esc(c.nome)}</nav>
  <h1>${esc(c.nome)}</h1>
  <div class="case-meta">${has(c.nicho) ? `<span><strong>Nicho:</strong> ${esc(c.nicho)}</span>` : ""}${lugar(c) ? `<span><strong>Local:</strong> ${esc(lugar(c))}</span>` : ""}</div>
  ${has(c.descricao) ? `<p class="case-desc">${esc(c.descricao)}</p>` : ""}
  ${has(c.depoimento) ? `<blockquote class="case-desc">${esc(c.depoimento)}</blockquote>` : ""}
  <div class="hero__cta">${has(c.url) && c.linkExterno !== false ? `<a class="btn btn--line" href="${esc(c.url)}" target="_blank" rel="noopener">Abrir site</a>` : ""}<a class="btn btn--gold" href="/#contato">Pedir diagnóstico</a></div>
  ${shots.length ? `<div class="shots">${shots.map((s, i) => `<img src="/${dir}/${s}" alt="Tela ${i + 1} do site ${esc(c.nome)}" width="1440" height="810" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}>`).join("")}</div>` : ""}
</div></article>`;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        name: `Site ${c.nome}`,
        description: desc,
        url: SITE + url,
        inLanguage: c.pais === "IE" ? "en" : "pt-BR",
        genre: c.nicho,
        creator: { "@type": "Organization", "@id": ORG_ID, name: "WAXLO", url: SITE + "/" },
        about: { "@type": "LocalBusiness", name: c.nome, address: { "@type": "PostalAddress", addressLocality: c.cidade, addressCountry: c.pais }, ...(has(c.url) ? { url: c.url } : {}) },
        ...(shots.length ? { image: shots.map((s) => `${SITE}/${dir}/${s}`) } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE + "/" },
          { "@type": "ListItem", position: 2, name: "Trabalhos", item: SITE + "/#trabalhos" },
          { "@type": "ListItem", position: 3, name: c.nome, item: SITE + url },
        ],
      },
    ],
  };
  pages.push([`trabalhos/${c.slug}/index.html`, layout({ path: url, title: `${c.nome} | Trabalhos WAXLO`, description: desc, jsonld: [ld], body })]);
}

/* ---------- Privacy ---------- */
const controladora = [
  "WAXLO, Lages/SC",
  has(empresa.razaoSocial) && `razão social ${esc(empresa.razaoSocial)}`,
  has(empresa.cnpj) && `CNPJ ${esc(empresa.cnpj)}`,
].filter(Boolean).join(", ");
const privBody = `<article class="page"><div class="wrap prose">
  <h1>Política de Privacidade</h1>
  <p style="margin-top:20px">Atualizada em 6 de outubro de 2026.</p>
  <h2>Quem cuida dos seus dados</h2>
  <p>A controladora dos dados é ${controladora}. Contato: WhatsApp (49) 98891-3704${has(empresa.email) ? ` ou ${esc(empresa.email)}` : ""}.</p>
  <h2>Quais dados coletamos</h2>
  <p>Pelo mini-diagnóstico do site: nome (opcional), segmento do negócio, o que você precisa, se já tem site e a mensagem que você escrever. Esses dados não ficam guardados no site: o formulário só monta uma mensagem e abre o WhatsApp no seu aparelho. Nada é enviado até você tocar em enviar dentro do WhatsApp.</p>
  <h2>Para que usamos</h2>
  <p>Para responder o seu contato e preparar a conversa de diagnóstico. Não usamos esses dados para outra finalidade sem avisar você.</p>
  <h2>Base legal</h2>
  <p>Consentimento (art. 7º, I, da LGPD), que você dá ao marcar a caixa do formulário, e procedimentos preliminares relacionados a um contrato do qual você pode ser parte, a seu pedido (art. 7º, V). As partes definem os próximos passos na conversa.</p>
  <h2>Com quem compartilhamos</h2>
  <ul>
    <li>WhatsApp (Meta Platforms), por onde a mensagem é enviada e respondida.</li>
    <li>Vercel Inc., que hospeda este site e pode registrar dados técnicos de acesso, como endereço IP, para segurança e funcionamento.</li>
  </ul>
  <p>Não vendemos nem cedemos seus dados a terceiros.</p>
  <h2>Por quanto tempo guardamos</h2>
  <p>As conversas ficam no WhatsApp enquanto forem necessárias para o atendimento e para um eventual contrato. Se não houver contrato, você pode pedir a exclusão a qualquer momento.</p>
  <h2>Seus direitos</h2>
  <p>Pelo art. 18 da LGPD, você pode pedir: confirmação de que tratamos seus dados, acesso, correção, anonimização, bloqueio ou eliminação de dados desnecessários, portabilidade, informação sobre compartilhamento, eliminação dos dados tratados com consentimento e revogação do consentimento. Basta escrever para o nosso WhatsApp. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).</p>
  <h2>Cookies</h2>
  <p>Este site não usa cookies próprios nem ferramentas de analytics. Os sites de clientes abertos pelo visualizador ao vivo seguem as políticas de cada um.</p>
</div></article>`;
pages.push(["politica-de-privacidade/index.html", layout({
  path: "/politica-de-privacidade/",
  title: "Política de Privacidade | WAXLO",
  description: "Como a WAXLO, de Lages/SC, trata os dados enviados pelo mini-diagnóstico do site, conforme a LGPD.",
  jsonld: [],
  body: privBody,
})]);

/* ---------- Write + checks ---------- */
for (const [file, html] of pages) {
  if (/\{\{|\}\}|undefined|\bnull\b|NaN|\[object Object\]/.test(html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, ""))) {
    throw new Error(`Placeholder ou valor vazio em ${file}`);
  }
  mkdirSync(dirname(join(ROOT, file)), { recursive: true });
  writeFileSync(join(ROOT, file), html);
}

const urls = ["/", ...cases.map((c) => `/trabalhos/${c.slug}/`), "/politica-de-privacidade/"];
writeFileSync(join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${UPDATED}</lastmod></url>`).join("\n")}
</urlset>
`);
writeFileSync(join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`ok: ${pages.length} páginas, ${cases.length} cases visíveis (${allCases.length - cases.length} ocultos)`);
