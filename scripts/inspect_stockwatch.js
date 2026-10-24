const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "frontend", "node_modules", "playwright-core"));
const fs = require("fs");

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const TARGET_URL = "https://stockwatch-phc.vercel.app/";
const OUT_DIR = path.join(__dirname, "..", "reference_screenshots");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function inspect() {
  console.log("Launching browser to inspect:", TARGET_URL);
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();
  
  try {
    await page.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 30000 });
  } catch (e) {
    console.log("Initial load timeout, waiting for domcontentloaded...");
    await page.waitForLoadState("domcontentloaded");
  }

  await page.waitForTimeout(3000);

  // 1. Capture primary desktop screenshot
  await page.screenshot({ path: path.join(OUT_DIR, "stockwatch_desktop_1440.png"), fullPage: true });
  console.log("Saved stockwatch_desktop_1440.png");

  // 2. Extract DOM structure and styles
  const analysis = await page.evaluate(() => {
    function getStyles(el) {
      if (!el) return null;
      const s = window.getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        classes: el.className,
        width: s.width,
        height: s.height,
        padding: s.padding,
        margin: s.margin,
        backgroundColor: s.backgroundColor,
        color: s.color,
        fontFamily: s.fontFamily,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        lineHeight: s.lineHeight,
        borderRadius: s.borderRadius,
        border: `${s.borderWidth} ${s.borderStyle} ${s.borderColor}`,
        boxShadow: s.boxShadow,
      };
    }

    // Inspect elements
    const body = getStyles(document.body);
    
    // Search for sidebar
    const aside = document.querySelector("aside, [class*='sidebar'], [class*='side-nav']");
    const asideStyles = getStyles(aside);

    // Search for header
    const header = document.querySelector("header, [class*='header'], [class*='topbar'], [class*='navbar']");
    const headerStyles = getStyles(header);

    // Navigation items
    const navLinks = Array.from(document.querySelectorAll("aside a, aside button, [class*='nav'] a, [class*='sidebar'] a")).map(el => ({
      text: el.innerText.trim().replace(/\n+/g, " "),
      styles: getStyles(el),
      href: el.getAttribute("href"),
      isActive: el.className.includes("active") || el.getAttribute("aria-current") === "page" || el.className.includes("selected")
    }));

    // Buttons
    const buttons = Array.from(document.querySelectorAll("button")).slice(0, 10).map(b => ({
      text: b.innerText.trim().replace(/\n+/g, " "),
      styles: getStyles(b)
    }));

    // Tabs
    const tabs = Array.from(document.querySelectorAll("[role='tab'], [class*='tab'], button:has([class*='badge'])")).map(t => ({
      text: t.innerText.trim().replace(/\n+/g, " "),
      styles: getStyles(t)
    }));

    // Summary cards / metrics
    const cards = Array.from(document.querySelectorAll("[class*='card'], [class*='stat'], [class*='summary'], [class*='metric']")).slice(0, 8).map(c => ({
      text: c.innerText.trim().replace(/\n+/g, " "),
      styles: getStyles(c)
    }));

    // Tables or data lists
    const table = document.querySelector("table, [role='table'], [class*='table']");
    const tableStyles = getStyles(table);
    const ths = Array.from(document.querySelectorAll("th")).map(th => ({
      text: th.innerText.trim(),
      styles: getStyles(th)
    }));

    // Inputs
    const inputs = Array.from(document.querySelectorAll("input, select")).slice(0, 5).map(i => ({
      placeholder: i.placeholder,
      styles: getStyles(i)
    }));

    // Gather distinct colors
    const allEls = document.querySelectorAll("*");
    const bgColors = new Set();
    const textColors = new Set();
    const borderColors = new Set();
    const fontFamilies = new Set();

    allEls.forEach(el => {
      const s = window.getComputedStyle(el);
      if (s.backgroundColor && s.backgroundColor !== "rgba(0, 0, 0, 0)") bgColors.add(s.backgroundColor);
      if (s.color) textColors.add(s.color);
      if (s.borderColor && s.borderWidth !== "0px") borderColors.add(s.borderColor);
      if (s.fontFamily) fontFamilies.add(s.fontFamily);
    });

    return {
      title: document.title,
      body,
      aside: asideStyles,
      header: headerStyles,
      navLinks,
      buttons,
      tabs,
      cards,
      table: tableStyles,
      ths,
      inputs,
      uniqueBgColors: Array.from(bgColors),
      uniqueTextColors: Array.from(textColors),
      uniqueBorderColors: Array.from(borderColors),
      uniqueFontFamilies: Array.from(fontFamilies)
    };
  });

  fs.writeFileSync(path.join(OUT_DIR, "stockwatch_analysis.json"), JSON.stringify(analysis, null, 2));
  console.log("Saved stockwatch_analysis.json");

  // Check interactive tabs / views if any
  const tabElements = await page.$$("[role='tab'], [class*='tab']");
  console.log(`Found ${tabElements.length} tabs.`);
  for (let i = 0; i < Math.min(tabElements.length, 5); i++) {
    try {
      await tabElements[i].click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(OUT_DIR, `stockwatch_tab_${i}.png`) });
      console.log(`Saved stockwatch_tab_${i}.png`);
    } catch (e) {
      // ignore
    }
  }

  // Mobile screenshot
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, "stockwatch_mobile_375.png"), fullPage: true });
  console.log("Saved stockwatch_mobile_375.png");

  // Dump outer HTML snippet for accurate DOM inspection
  const htmlSnippet = await page.evaluate(() => document.documentElement.outerHTML.slice(0, 50000));
  fs.writeFileSync(path.join(OUT_DIR, "stockwatch_markup_preview.html"), htmlSnippet);

  await browser.close();
  console.log("Inspection complete!");
}

inspect().catch(err => {
  console.error("Inspection error:", err);
  process.exit(1);
});
