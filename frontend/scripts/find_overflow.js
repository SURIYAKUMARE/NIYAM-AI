const { chromium } = require("playwright-core");

async function checkOverflow() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const browser = await chromium.launch({ executablePath: edgePath, headless: true });
  const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await context.newPage();

  // Login as applicant first
  await page.goto("http://localhost:3000/login");
  await page.locator('input[type="text"]').first().fill("applicant");
  await page.locator('input[type="password"]').first().fill("password123");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  await page.goto("http://localhost:3000/institution/dashboard");
  await page.waitForTimeout(1000);

  const overflowInfo = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const overflowingElements = [];

    const all = document.querySelectorAll("*");
    for (const el of all) {
      const rect = el.getBoundingClientRect();
      if (rect.right > docWidth + 1) {
        overflowingElements.push({
          tag: el.tagName,
          id: el.id,
          className: el.className,
          rectRight: rect.right,
          rectWidth: rect.width,
          text: el.innerText ? el.innerText.slice(0, 40) : "",
        });
      }
    }
    return { docWidth, scrollWidth, overflowingElements: overflowingElements.slice(0, 5) };
  });

  console.log("Overflow Info:", JSON.stringify(overflowInfo, null, 2));
  await browser.close();
}

checkOverflow().catch(console.error);
