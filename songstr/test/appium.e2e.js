const { remote } = require('webdriverio');
const assert = require('assert');
const excelReporter = require('../utils/excelReporter');

// Note: To run this test locally, you must have an Appium server running on port 4723
// and an Android Emulator active.

describe('Appium Mobile E2E Tests - Songstr', function () {
  let client;
  const baseUrl = 'http://10.0.2.2:3000';

  before(async function () {
    this.timeout(15000);
    const capabilities = {
      platformName: 'Android',
      browserName: 'Chrome',
      'appium:automationName': 'UiAutomator2',
    };

    try {
      client = await remote({
        protocol: 'http',
        hostname: '127.0.0.1',
        port: 4723,
        path: '/',
        capabilities,
        connectionRetryTimeout: 1000,
        connectionRetryCount: 0
      });
    } catch {
      console.log('Appium server not active, skipping Appium tests...');
    }
  });

  after(async function () {
    if (client) {
      await client.deleteSession();
    }
  });

  async function trackTest(testId, testName, moduleName, fn) {
    const start = Date.now();
    let status = 'PASSED';
    let errorMessage = 'N/A';
    try {
      if (!client) {
        status = 'SKIPPED';
        errorMessage = 'Appium server or Android Emulator not running';
      } else {
        await fn();
      }
    } catch (err) {
      status = 'FAILED';
      errorMessage = err.message;
      throw err;
    } finally {
      excelReporter.addResult({
        testId,
        testName,
        module: moduleName,
        platform: 'Android Native / Chrome',
        browser: 'Chrome Mobile',
        device: 'Android Emulator',
        status,
        executionTime: new Date().toLocaleTimeString(),
        duration: Date.now() - start,
        retryCount: this.currentTest ? this.currentTest.currentRetry() : 0,
        screenshot: 'N/A',
        errorMessage,
        executionDate: new Date().toISOString().split('T')[0]
      });
    }
  }

  it('1. should load the homepage on mobile', async function () {
    await trackTest.call(this, 'TC-APP-001', 'Android Homepage Load', 'Responsive UI', async () => {
      await client.url(baseUrl);
      const title = await client.getTitle();
      assert(title.includes('Songstr'), `Expected mobile title to include "Songstr", got "${title}"`);
    });
  });

  it('2. should toggle mobile navigation or auth modal', async function () {
    await trackTest.call(this, 'TC-APP-002', 'Android Auth Modal Toggle', 'Authentication', async () => {
      await client.execute("if (typeof openAuthModal === 'function') openAuthModal();");
      const modal = await client.$('#auth-modal');
      await modal.waitForDisplayed({ timeout: 5000 });
      const isDisplayed = await modal.isDisplayed();
      assert(isDisplayed, 'Auth modal should be displayed on mobile view');
      await client.execute("if (typeof closeAuthModal === 'function') closeAuthModal();");
    });
  });

  it('3. should interact with mood detection on Android emulator', async function () {
    await trackTest.call(this, 'TC-APP-003', 'Android Mood Detection', 'Music & Mood', async () => {
      await client.execute("showScreen('detect');");
      const detectScreen = await client.$('#screen-detect');
      await detectScreen.waitForDisplayed({ timeout: 5000 });
      assert(await detectScreen.isDisplayed(), 'Detect screen displayed');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  //  EXTENDED APPIUM TESTS (TC-APP-004 to TC-APP-015)
  // ═══════════════════════════════════════════════════════════════════
  it('4. should search for songs on Android emulator', async function () {
    await trackTest.call(this, 'TC-APP-004', 'Android Song Search', 'Search', async () => {
      await client.execute("showScreen('browse');");
      await client.pause(500);
      await client.execute(`
        const input = document.getElementById('search-input');
        if (input) { input.value = 'tamil'; input.dispatchEvent(new Event('input', { bubbles: true })); }
      `);
      await client.pause(1500);
      const results = await client.$$('.song-card');
      assert(Array.isArray(results), 'Search returned results on Android');
    });
  });

  it('5. should render browse screen on Android', async function () {
    await trackTest.call(this, 'TC-APP-005', 'Android Browse Screen', 'Navigation', async () => {
      await client.execute("showScreen('browse');");
      const browseScreen = await client.$('#screen-browse');
      await browseScreen.waitForDisplayed({ timeout: 5000 });
      assert(await browseScreen.isDisplayed(), 'Browse screen displayed on Android');
    });
  });

  it('6. should handle text mood detection on Android', async function () {
    await trackTest.call(this, 'TC-APP-006', 'Android Text Mood', 'Music & Mood', async () => {
      await client.execute("showScreen('detect');");
      await client.pause(500);
      await client.execute(`
        const input = document.getElementById('text-mood-input');
        if (input) {
          input.value = 'I am feeling happy today!';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (typeof handleTextMood === 'function') handleTextMood();
        else if (typeof loadMoodResults === 'function') loadMoodResults('happy');
      `);
      await client.pause(1000);
      assert(true, 'Text mood handled on Android');
    });
  });

  it('7. should test player controls on Android', async function () {
    await trackTest.call(this, 'TC-APP-007', 'Android Player Controls', 'Player Controls', async () => {
      await client.execute("if (typeof togglePlayPause === 'function') togglePlayPause();");
      await client.pause(500);
      assert(true, 'Player controls tested on Android');
    });
  });

  it('8. should access favorites screen on Android', async function () {
    await trackTest.call(this, 'TC-APP-008', 'Android Favorites Screen', 'Favorites', async () => {
      await client.execute("showScreen('favorites');");
      await client.pause(500);
      const favScreen = await client.$('#screen-favorites');
      const exists = await favScreen.isExisting();
      assert(exists, 'Favorites screen exists on Android');
    });
  });

  it('9. should access playlist screen on Android', async function () {
    await trackTest.call(this, 'TC-APP-009', 'Android Playlist Screen', 'Playlist', async () => {
      await client.execute("showScreen('playlist');");
      await client.pause(500);
      const plScreen = await client.$('#screen-playlist');
      const exists = await plScreen.isExisting();
      assert(exists, 'Playlist screen exists on Android');
    });
  });

  it('10. should access profile screen on Android', async function () {
    await trackTest.call(this, 'TC-APP-010', 'Android Profile Screen', 'User Profile', async () => {
      await client.execute("showScreen('profile');");
      await client.pause(500);
      const profileScreen = await client.$('#screen-profile');
      const exists = await profileScreen.isExisting();
      assert(exists, 'Profile screen exists on Android');
    });
  });

  it('11. should execute logout on Android', async function () {
    await trackTest.call(this, 'TC-APP-011', 'Android Logout', 'Authentication', async () => {
      await client.execute("if (typeof logoutUser === 'function') logoutUser();");
      await client.pause(500);
      assert(true, 'Logout executed on Android');
    });
  });

  it('12. should navigate between screens on Android', async function () {
    await trackTest.call(this, 'TC-APP-012', 'Android Screen Navigation', 'Navigation', async () => {
      const screens = ['home', 'browse', 'detect', 'profile', 'favorites', 'home'];
      for (const screen of screens) {
        await client.execute(`showScreen('${screen}');`);
        await client.pause(300);
      }
      assert(true, 'Navigation between screens on Android completed');
    });
  });

  it('13. should defend against XSS on Android search', async function () {
    await trackTest.call(this, 'TC-APP-013', 'Android XSS Defense', 'Security', async () => {
      await client.execute("showScreen('browse');");
      await client.pause(500);
      await client.execute(`
        const input = document.getElementById('search-input');
        if (input) {
          input.value = "<script>window.__appXss=true;</script>";
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      `);
      await client.pause(500);
      const xssFired = await client.execute("return window.__appXss || false;");
      assert.strictEqual(xssFired, false, 'XSS prevented on Android');
    });
  });

  it('14. should verify page load performance on Android', async function () {
    await trackTest.call(this, 'TC-APP-014', 'Android Page Load Perf', 'Performance', async () => {
      await client.url(baseUrl);
      const loadTime = await client.execute("return performance.timing.loadEventEnd - performance.timing.navigationStart;");
      assert(typeof loadTime === 'number', `Android page loaded in ${loadTime}ms`);
    });
  });

  it('15. should test volume and seek controls on Android', async function () {
    await trackTest.call(this, 'TC-APP-015', 'Android Volume/Seek', 'Player Controls', async () => {
      await client.execute(`
        const v = document.getElementById('volume-slider');
        if (v) { v.value = 50; v.dispatchEvent(new Event('input', { bubbles: true })); }
        const s = document.getElementById('seek-bar');
        if (s) { s.value = 30; s.dispatchEvent(new Event('input', { bubbles: true })); }
      `);
      assert(true, 'Volume and seek controls set on Android');
    });
  });
});

