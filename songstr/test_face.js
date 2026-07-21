const puppeteer = require('puppeteer');
async function run() {
  const browser = await puppeteer.launch({
    headless: 'shell',
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--no-sandbox'
    ]
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log(msg.text()));
  await page.goto('http://localhost:3000');
  await page.evaluate(() => showScreen('detect'));
  await page.waitForSelector('#tab-face', { visible: true });
  await page.click('#tab-face');
  await page.click('#start-camera-btn');
  console.log('Started camera');
  await page.waitForSelector('#analyze-face-btn', { visible: true });
  await page.click('#analyze-face-btn');
  console.log('Clicked analyze');
  try {
    await page.waitForSelector('#screen-results.active', { timeout: 15000 });
    console.log('Detection finished successfully');
  } catch {
    console.log('Detection timed out');
  }
  await browser.close();
}
run();
