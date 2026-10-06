#!/usr/bin/env node
// Grava a rolagem de cada case de data/cases.json e gera poster + vídeos de prévia.
// Requisitos: Playwright e ffmpeg no PATH.
// Uso: node scripts/make-previews.mjs [slug ...]   (sem slug = todos os cases com url)
// Saída: assets/trabalhos/<slug>/poster.webp, tela-1.webp, tela-2.webp
//        videos/trabalhos/<slug>.mp4 (H.264) e .webm (VP9), 8 s, sem áudio, ≤ 1,2 MB
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { readFileSync, mkdirSync, mkdtempSync, readdirSync, statSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = 1440, H = 900, SECONDS = 8, MAX = 1.2 * 1024 * 1024;
const only = process.argv.slice(2);
const cases = JSON.parse(readFileSync(join(ROOT, "data/cases.json"), "utf8"))
  .filter((c) => c.url && (only.length ? only.includes(c.slug) : true));
const ff = (...a) => execFileSync("ffmpeg", ["-v", "error", "-y", ...a], { stdio: "inherit" });

const browser = await chromium.launch();
for (const c of cases) {
  console.log(`> ${c.slug}: ${c.url}`);
  const tmp = mkdtempSync(join(tmpdir(), "waxlo-"));
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: tmp, size: { width: W, height: H } } });
  const page = await ctx.newPage();
  await page.goto(c.url, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.addStyleTag({ content: "*{cursor:none!important}" }).catch(() => {});
  await page.waitForTimeout(1500);
  const shotsDir = join(ROOT, "assets/trabalhos", c.slug);
  mkdirSync(shotsDir, { recursive: true });
  await page.screenshot({ path: join(tmp, "s1.png") });
  // Rolagem suave por SECONDS segundos
  await page.evaluate(async (ms) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const t0 = performance.now();
    await new Promise((r) => {
      const step = (t) => {
        const p = Math.min(1, (t - t0) / ms);
        scrollTo(0, max * (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2));
        p < 1 ? requestAnimationFrame(step) : r();
      };
      requestAnimationFrame(step);
    });
  }, SECONDS * 1000);
  await page.screenshot({ path: join(tmp, "s2.png") });
  await ctx.close();
  const raw = join(tmp, readdirSync(tmp).find((f) => f.endsWith(".webm")));
  const start = 1.5; // descarta o carregamento inicial
  ff("-i", join(tmp, "s1.png"), "-vf", "scale=960:-2", "-c:v", "libwebp", "-quality", "72", join(shotsDir, "poster.webp"));
  ff("-i", join(tmp, "s1.png"), "-c:v", "libwebp", "-quality", "75", join(shotsDir, "tela-1.webp"));
  ff("-i", join(tmp, "s2.png"), "-c:v", "libwebp", "-quality", "75", join(shotsDir, "tela-2.webp"));
  const outDir = join(ROOT, "videos/trabalhos");
  mkdirSync(outDir, { recursive: true });
  for (const crf of [25, 29, 33]) {
    const mp4 = join(outDir, `${c.slug}.mp4`), webm = join(outDir, `${c.slug}.webm`);
    const vf = "scale=960:-2,fps=24";
    ff("-ss", String(start), "-t", String(SECONDS), "-i", raw, "-an", "-vf", vf, "-c:v", "libx264", "-profile:v", "main", "-pix_fmt", "yuv420p", "-crf", String(crf), "-preset", "slow", "-movflags", "+faststart", mp4);
    ff("-ss", String(start), "-t", String(SECONDS), "-i", raw, "-an", "-vf", vf, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", String(crf + 11), "-row-mt", "1", webm);
    const ok = statSync(mp4).size <= MAX && statSync(webm).size <= MAX;
    console.log(`  crf ${crf}: mp4 ${(statSync(mp4).size / 1024) | 0} KB, webm ${(statSync(webm).size / 1024) | 0} KB${ok ? "" : " (acima de 1,2 MB, recomprimindo)"}`);
    if (ok) break;
  }
  rmSync(tmp, { recursive: true, force: true });
}
await browser.close();
console.log("Pronto. Rode node scripts/build.mjs para atualizar as páginas.");
