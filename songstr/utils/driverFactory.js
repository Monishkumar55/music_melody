const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

class DriverFactory {
  static async createChromeDriver() {
    const options = new chrome.Options();
    options.addArguments('--headless=new');
    options.addArguments('--use-fake-ui-for-media-stream');
    options.addArguments('--use-fake-device-for-media-stream');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--disable-extensions');
    options.addArguments('--remote-debugging-port=9222');
    options.addArguments('--window-size=1920,1080');

    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    return driver;
  }

  static async createMobileChromeDriver(viewport = 'mobile') {
    const options = new chrome.Options();
    options.addArguments('--headless=new');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');

    if (viewport === 'tablet') {
      options.addArguments('--window-size=768,1024');
    } else {
      options.addArguments('--window-size=360,640');
    }
    options.addArguments('--user-agent=Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36');

    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    return driver;
  }
}

module.exports = DriverFactory;
