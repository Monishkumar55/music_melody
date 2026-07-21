const { remote } = require('webdriverio');
const assert = require('assert');

// Note: To run this test locally, you must have an Appium server running on port 4723
// and an Android Emulator active.
// Start Appium with: `appium`
// Then run: `npm run test:appium`

describe('Appium Mobile E2E Tests - Songstr', function () {
  let client;
  const baseUrl = 'http://10.0.2.2:3000'; // 10.0.2.2 points to localhost from inside Android Emulator

  before(async function () {
    const capabilities = {
      platformName: 'Android',
      browserName: 'Chrome',
      'appium:automationName': 'UiAutomator2',
      // If the emulator fails to connect, ensure you have Chrome installed on the emulator
    };

    client = await remote({
      protocol: 'http',
      hostname: '127.0.0.1',
      port: 4723,
      path: '/',
      capabilities,
      connectionRetryTimeout: 120000,
      connectionRetryCount: 3
    });
  });

  after(async function () {
    if (client) {
      await client.deleteSession();
    }
  });

  it('should load the homepage on mobile', async function () {
    await client.url(baseUrl);
    const title = await client.getTitle();
    assert(title.includes('Songstr'), `Expected mobile title to include "Songstr", got "${title}"`);
  });

  it('should toggle mobile navigation or auth modal', async function () {
    // In mobile, we might need to click a hamburger menu, or directly open auth
    await client.execute("if (typeof openAuthModal === 'function') openAuthModal();");
    
    // Wait for auth modal
    const modal = await client.$('#auth-modal');
    await modal.waitForDisplayed({ timeout: 5000 });
    
    const isDisplayed = await modal.isDisplayed();
    assert(isDisplayed, 'Auth modal should be displayed on mobile view');
    
    await client.execute("if (typeof closeAuthModal === 'function') closeAuthModal();");
  });
});
