const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "frontend", "node_modules", "playwright-core"));
const fs = require("fs");

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const TARGET_URL = "https://stockwatch-phc.vercel.app/";
const OUT_DIR = path.join(__dirname, "..", "reference_screenshots");

async function captureAuthenticatedApp() {
  const browser = await chromium.launch({ executablePath: EDGE_PATH, headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("Navigating to StockWatch...");
  await page.goto(TARGET_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Click Sign In
  await page.click("button:has-text('Sign In')");
  await page.waitForTimeout(1000);

  // Click District Officer quick role selector
  console.log("Selecting District Officer role...");
  await page.click("button:has-text('District Officer')");
  await page.waitForTimeout(500);

  // Click Sign in submit button
  console.log("Submitting login form...");
  await page.click("button[type='submit']");
  await page.waitForTimeout(3000);

  console.log("Authenticated URL:", page.url());

  // Capture full desktop screenshot of authenticated app
  await page.screenshot({ path: path.join(OUT_DIR, "stockwatch_app_shell_1440.png"), fullPage: true });
  console.log("Saved stockwatch_app_shell_1440.png");

  // Detailed style extraction of the authenticated application shell
  const shellAnalysis = await page.evaluate(() => {
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

    // Sidebar
    const aside = document.querySelector("aside, nav[class*='w-'], div[class*='w-64'], div[class*='w-60']");
    const asideStyles = getStyles(aside);

    // Active sidebar item
    const activeNav = document.querySelector("aside [class*='bg-'], aside [class*='active'], nav a[class*='bg-']");
    const activeNavStyles = getStyles(activeNav);

    // Inactive sidebar item
    const navItems = Array.from(document.querySelectorAll("aside a, aside button, nav a")).map(el => ({
      text: el.innerText.trim().replace(/\n+/g, " "),
      styles: getStyles(el),
      classes: el.className
    }));

    // Header
    const header = document.querySelector("header, [class*='header']");
    const headerStyles = getStyles(header);

    // Header elements (user badge, notifications, connection status, etc.)
    const headerElements = Array.from(document.querySelectorAll("header *")).slice(0, 15).map(el => ({
      text: el.innerText ? el.innerText.trim().replace(/\n+/g, " ") : "",
      styles: getStyles(el)
    })).filter(x => x.text.length > 0);

    // Context panel / Page title bar
    const contextTitle = document.querySelector("h1, h2");
    const contextPanel = contextTitle ? getStyles(contextTitle.closest("div")) : null;

    // Tabs
    const tabs = Array.from(document.querySelectorAll("[role='tab'], [class*='tab'], nav button, div[class*='border-b'] button")).map(t => ({
      text: t.innerText.trim(),
      styles: getStyles(t),
      classes: t.className
    }));

    // Summary cards / Stat strip
    const summaryCards = Array.from(document.querySelectorAll("[class*='grid'] > div, [class*='stat'], [class*='card']")).slice(0, 8).map(c => ({
      text: c.innerText.trim().replace(/\n+/g, " "),
      styles: getStyles(c),
      classes: c.className
    }));

    // Table
    const table = document.querySelector("table");
    const th = document.querySelector("th");
    const td = document.querySelector("td");
    const searchInput = document.querySelector("input[type='text'], input[placeholder*='Search']");

    return {
      aside: asideStyles,
      activeNav: activeNavStyles,
      navItems,
      header: headerStyles,
      headerElements,
      contextPanel,
      tabs,
      summaryCards,
      table: getStyles(table),
      th: getStyles(th),
      td: getStyles(td),
      searchInput: getStyles(searchInput),
      html: document.body.innerHTML.slice(0, 60000)
    };
  });

  fs.writeFileSync(path.join(OUT_DIR, "stockwatch_app_shell_analysis.json"), JSON.stringify(shellAnalysis, null, 2));
  console.log("Saved stockwatch_app_shell_analysis.json");

  // Click on a couple of tabs / nav links to inspect different views
  const navLinks = await page.$$("aside a, aside button");
  console.log(`Found ${navLinks.length} sidebar items`);
  for (let i = 1; i < Math.min(navLinks.length, 4); i++) {
    try {
      await navLinks[i].click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(OUT_DIR, `stockwatch_view_nav_${i}.png`), fullPage: true });
      console.log(`Saved stockwatch_view_nav_${i}.png`);
    } catch (e) {}
  }

  await browser.close();
  console.log("App shell capture complete!");
}

captureAuthenticatedApp().catch(err => {
  console.error("Error capturing app shell:", err);
  process.exit(1);
});
