import puppeteer from "puppeteer";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const URL = process.env.URL || "http://localhost:5173/";
const OUT = path.resolve("screenshots");
await mkdir(OUT, { recursive: true });

const VIEWPORT = { width: 1600, height: 1000, deviceScaleFactor: 1 };

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--autoplay-policy=no-user-gesture-required"],
  defaultViewport: VIEWPORT,
});
const page = await browser.newPage();

// Forward console errors so we see them.
page.on("console", (m) => {
  if (m.type() === "error") console.log("[browser error]", m.text());
});
page.on("pageerror", (err) => console.log("[pageerror]", err.message));

await page.goto(URL, { waitUntil: "networkidle0", timeout: 30000 });
// Wait for fonts to load.
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 500));

// 1. Start gate
await page.screenshot({ path: path.join(OUT, "01-start-gate.png") });
console.log("captured 01-start-gate.png");

// Click anywhere to start. The gate covers the whole viewport.
await page.mouse.click(VIEWPORT.width / 2, VIEWPORT.height / 2);
await new Promise((r) => setTimeout(r, 700)); // gate exit animation

// 2. T-10 just after start
await page.screenshot({ path: path.join(OUT, "02-t10.png") });
console.log("captured 02-t10.png");

// 3. T-7 (after ~3 seconds of running)
await new Promise((r) => setTimeout(r, 3000));
await page.screenshot({ path: path.join(OUT, "03-t7.png") });
console.log("captured 03-t7.png");

// 4. T-3 (after ~7 seconds total)
await new Promise((r) => setTimeout(r, 4000));
await page.screenshot({ path: path.join(OUT, "04-t3.png") });
console.log("captured 04-t3.png");

// 5. T-0 BigBang explosion (after the flash has cleared)
await new Promise((r) => setTimeout(r, 4000));
await page.screenshot({ path: path.join(OUT, "05-t0-bigbang.png") });
console.log("captured 05-t0-bigbang.png");

// 6. Settled (I/O wordmark + still-life forest)
await new Promise((r) => setTimeout(r, 2700));
await page.screenshot({ path: path.join(OUT, "06-settled.png") });
console.log("captured 06-settled.png");

await browser.close();
console.log("done.");
