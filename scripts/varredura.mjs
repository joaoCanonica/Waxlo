#!/usr/bin/env node
// Varredura anti-IA e de critérios de aceite sobre as páginas geradas. Uso: node scripts/varredura.mjs
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["index.html", "politica-de-privacidade/index.html", ...readdirSync(join(ROOT, "trabalhos")).map((s) => `trabalhos/${s}/index.html`)];
const css = readFileSync(join(ROOT, "src/site.css"), "utf8");
const visible = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ");
const checks = [];
const add = (nome, n, det = "") => checks.push({ nome, n, det });
add("text-transform: uppercase no CSS", (css.match(/uppercase/g) || []).length);
add("font-style: italic no CSS", (css.match(/italic/g) || []).length);
let txt = "", html = "";
for (const p of pages) { const h = readFileSync(join(ROOT, p), "utf8"); html += h; txt += visible(h) + "\n"; }
const count = (re) => (txt.match(re) || []).length;
add('travessão "—" no texto visível', count(/—/g));
add('"✦" e ponto médio "·"', count(/[✦·]/g));
add('padrão "não é … é …"', count(/não é [^.]{0,60}?,? é /gi));
add('"ecossistema"', count(/ecossistema/gi));
add('"estrutura digital completa"', count(/estrutura digital completa/gi));
add('"soluções completas"', count(/soluções completas/gi));
add('"excelência"', count(/excelência/gi));
add("<em>/<i> dentro de títulos", (html.match(/<h[1-6][^>]*>[^<]*<(em|i)\b/g) || []).length);
add('numeração "01/02…" fora do Processo', count(/\b0[1-9]\b/g));
add("vídeo com autoplay", (html.match(/<video[^>]*autoplay/g) || []).length);
const vids = readdirSync(join(ROOT, "videos/trabalhos")).filter((f) => statSync(join(ROOT, "videos/trabalhos", f)).size > 1.2 * 1024 * 1024);
add("vídeo > 1,2 MB", vids.length, vids.join(", "));
add("placeholders ({{, undefined, null, lorem)", count(/\{\{|undefined|\bnull\b|lorem|XX\.XXX/gi) + count(/\bTODO\b/g));
add('"sistema(s) de gestão" fora da faixa em breve', count(/sistemas? de gestão/gi) - 1);
add("cor dourada em texto (color: var(--gold))", (css.match(/(^|[;{\s])color:\s*var\(--gold\)/g) || []).length, "só .steps .n (40px)");
const crit = ["index.html"].map((p) => readFileSync(join(ROOT, p)).length + readFileSync(join(ROOT, "assets/site.js")).length)[0];
add("HTML+CSS+JS críticos (KB)", Math.round(crit / 1024));
for (const c of checks) console.log(`${String(c.n).padStart(4)}  ${c.nome}${c.det ? `  (${c.det})` : ""}`);
