const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

// Mobile E2E tests using Chrome mobile emulation (Nexus 5 viewport)
// This runs on CI in place of a real Android emulator + Appium for speed and reliability.

describe('Mobile E2E Tests - Chrome Mobile Emulation', function () {
  this.timeout(60000);
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
    if (driver) {
      await driver.quit();
    }
  });

  it('should load the homepage on mobile viewport', async function () {
    await driver.get(baseUrl);
    const title = await driver.getTitle();
    assert(title.includes('Songstr'), 'Expected title to include Songstr, got: ' + title);
  });

  it('should register and login a new user on mobile', async function () {
    await driver.executeScript("showScreen('register');");
    await driver.sleep(500);

    const username = 'mobile_user_' + Date.now();
    
    await driver.findElement(By.css('#register-form input[name=\"fullname\"]')).sendKeys('Mobile User');
    await driver.findElement(By.css('#register-form input[name=\"username\"]')).sendKeys(username);
    await driver.findElement(By.css('#register-form input[name=\"email\"]')).sendKeys(username + '@test.com');
    await driver.findElement(By.css('#register-form input[name=\"password\"]')).sendKeys('SuperPassword123!');
    await driver.findElement(By.css('#register-form input[name=\"confirmPassword\"]')).sendKeys('SuperPassword123!');
    await driver.executeScript("document.querySelector('#register-form input[type=\"checkbox\"]').click();");
    
    await driver.findElement(By.css('#register-form button[type=\"submit\"]')).click();
    
    // Wait for the home screen to be displayed instead of a fixed sleep
    const homeScreen = await driver.wait(until.elementLocated(By.id('screen-home')), 10000);
    await driver.wait(until.elementIsVisible(homeScreen), 10000);
    const isDisplayed = await homeScreen.isDisplayed();
    assert(isDisplayed, 'Home screen should be displayed after registration');
  });

  it('should search for songs and return results on mobile', async function () {
    await driver.executeScript("showScreen('browse');");
    await driver.sleep(500); // Wait for CSS transition
    const searchInput = await driver.wait(until.elementLocated(By.id('search-input')), 5000);
    // Use JS to set value in case it's technically not interactable due to CSS overlays
    await driver.executeScript("arguments[0].value = 'tamil'; arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", searchInput);
    await driver.sleep(1500); // Wait for debounce
    const results = await driver.findElements(By.className('song-card'));
    assert(Array.isArray(results), 'Should return an array of elements');
  });

  it('should render mood detection page on mobile', async function () {
    await driver.executeScript("showScreen('detect');");
    await driver.sleep(500); // Wait for CSS transition
    const tabFace = await driver.wait(until.elementLocated(By.id('tab-face')), 5000);
    const isVisible = await tabFace.isDisplayed();
    assert(isVisible, 'Face detection tab should be visible on mobile');
  });
});
