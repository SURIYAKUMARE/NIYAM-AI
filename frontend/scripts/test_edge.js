const { chromium } = require("playwright-core");

async function main() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  console.log("Launching Edge from:", edgePath);
  const browser = await chromium.launch({
    executablePath: edgePath,
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000");
  console.log("Page title:", await page.title());
  await browser.close();
  console.log("Edge browser launch test SUCCESSFUL!");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
