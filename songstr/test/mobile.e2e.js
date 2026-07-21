const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

// Mobile E2E tests using Chrome mobile emulation (Nexus 5 viewport)
// This runs on CI in place of a real Android emulator + Appium for speed and reliability.

describe('Mobile E2E Tests - Chrome Mobile Emulation', function () {
  let driver;
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  before(async function () {
    this.timeout(30000);
    const options = new chrome.Options();
    options.addArguments('--headless=new');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    // Use CLI arguments for mobile simulation instead of setMobileEmulation API 
    // to avoid ChromeDriver capability parsing errors on CI
    options.addArguments('--window-size=360,640');
    options.addArguments('--user-agent=Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('should load the homepage on mobile viewport', async function () {
    await driver.get(baseUrl);
    const title = await driver.getTitle();
    assert(title.includes('Songstr'), 'Expected title to include Songstr, got: ' + title);
  });

  it('should open auth modal on mobile', async function () {
    await driver.executeScript("if (typeof openAuthModal === 'function') openAuthModal();");
    await driver.sleep(1000);
    const modal = await driver.findElement({ id: 'auth-modal' });
    const isDisplayed = await modal.isDisplayed();
    assert(isDisplayed, 'Auth modal should be displayed on mobile');
    await driver.executeScript("if (typeof closeAuthModal === 'function') closeAuthModal();");
  });

  it('should navigate to browse screen on mobile', async function () {
    await driver.executeScript("showScreen('browse');");
    await driver.sleep(500);
    const searchInput = await driver.findElement({ id: 'search-input' });
    const isVisible = await searchInput.isDisplayed();
    assert(isVisible, 'Search input should be visible on mobile browse screen');
  });

  it('should render mood detection page on mobile', async function () {
    await driver.executeScript("showScreen('detect');");
    await driver.sleep(500);
    const tabFace = await driver.findElement({ id: 'tab-face' });
    const isVisible = await tabFace.isDisplayed();
    assert(isVisible, 'Face detection tab should be visible on mobile');
  });
});
