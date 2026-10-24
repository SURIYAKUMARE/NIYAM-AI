const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "frontend", "node_modules", "playwright-core"));
const fs = require("fs");

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const TARGET_URL = "https://stockwatch-phc.vercel.app/";
const OUT_DIR = path.join(__dirname, "..", "reference_screenshots");

async function exploreWorkspace() {
  const browser = await chromium.launch({ executablePath: EDGE_PATH, headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("Navigating to StockWatch...");
  await page.goto(TARGET_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Look for interactive buttons to open a workspace/dashboard
  // Let's check Pharmacist, District Officer, or Sign In
  const officerBtn = page.locator("button:has-text('District Officer')");
  if (await officerBtn.count() > 0) {
    console.log("Clicking 'District Officer' persona card...");
    await officerBtn.first().click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(OUT_DIR, "stockwatch_district_officer_workspace.png"), fullPage: true });
  }

  // Check URL
  console.log("Current URL:", page.url());

  // Let's also check Pharmacist
  await page.goto(TARGET_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const pharmBtn = page.locator("button:has-text('Pharmacist')");
  if (await pharmBtn.count() > 0) {
    console.log("Clicking 'Pharmacist' card...");
    await pharmBtn.first().click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(OUT_DIR, "stockwatch_pharmacist_workspace.png"), fullPage: true });
  }
  console.log("Current URL:", page.url());

  // Let's inspect Sign In button
  await page.goto(TARGET_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const signInBtn = page.locator("button:has-text('Sign In'), a:has-text('Sign In')");
  if (await signInBtn.count() > 0) {
    console.log("Clicking 'Sign In'...");
    await signInBtn.first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, "stockwatch_signin_modal_or_page.png"), fullPage: true });
  }

  // Now let's extract the deep DOM, sidebar, header, summary band, and tables of the active workspace
  const workspaceAnalysis = await page.evaluate(() => {
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
    const aside = document.querySelector("aside, [class*='sidebar'], nav[class*='w-']");
    const asideStyles = getStyles(aside);

    // Selected nav item in sidebar
    const activeNav = document.querySelector("aside a[class*='bg-'], aside [class*='active'], aside button[class*='bg-']");
    const activeNavStyles = getStyles(activeNav);

    // Inactive nav item
    const inactiveNav = document.querySelector("aside a:not([class*='bg-']), aside button:not([class*='bg-'])");
    const inactiveNavStyles = getStyles(inactiveNav);

    // Header
    const header = document.querySelector("header, [class*='header']");
    const headerStyles = getStyles(header);

    // Summary band / stat strip
    const summaryBand = document.querySelector("[class*='grid'][class*='gap-'], [class*='summary'], [class*='stat']");
    const summaryBandStyles = getStyles(summaryBand);

    // Tabs
    const tabs = Array.from(document.querySelectorAll("[role='tab'], [class*='tab'], nav button")).map(t => ({
      text: t.innerText.trim(),
      styles: getStyles(t)
    }));

    // Table
    const table = document.querySelector("table");
    const tableTh = document.querySelector("th");
    const tableTd = document.querySelector("td");
    const searchInput = document.querySelector("input[type='text'], input[placeholder*='Search']");

    return {
      currentUrl: window.location.href,
      aside: asideStyles,
      activeNav: activeNavStyles,
      inactiveNav: inactiveNavStyles,
      header: headerStyles,
      summaryBand: summaryBandStyles,
      tabs: tabs.slice(0, 10),
      table: getStyles(table),
      th: getStyles(tableTh),
      td: getStyles(tableTd),
      searchInput: getStyles(searchInput),
      htmlSnippet: document.body.innerHTML.slice(0, 25000)
    };
  });

  fs.writeFileSync(path.join(OUT_DIR, "stockwatch_workspace_deep.json"), JSON.stringify(workspaceAnalysis, null, 2));
  console.log("Saved stockwatch_workspace_deep.json");

  await browser.close();
}

exploreWorkspace().catch(err => {
  console.error("Error exploring workspace:", err);
  process.exit(1);
});
