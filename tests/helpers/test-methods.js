const { expect } = require('@playwright/test');

module.exports = {
  IShouldNotBeLoggedIn: async (page) => {
    await page.goto('/user/login', { waitUntil: 'networkidle' });
    await expect(page.locator('body.user-logged-in').first()).toHaveCount(0);
    await expect(page).toHaveURL(/.*user\/login/);
  },
  ILogInAs: async ([page, username]) => {
    await page.goto('/user/login');
    await page.fill('input[name="name"]', username);
    await page.fill('input[name="pass"]', process.env.APP_SECRET);
    await page.click('input[value="Log in"]', process.env.APP_SECRET);
    // Then make sure login worked.
    await expect(page.locator('body.user-logged-in').first()).toHaveCount(1);
  },
  theCacheHitExists: async ([page, response]) => {
    expect(await response.headerValue('X-Drupal-Cache') == 'HIT' ||
      await response.headerValue('X-Drupal-Dynamic-Cache') == 'HIT' ||
      await response.headerValue('X-Cache') == 'HIT' ||
      await response.headerValue('X-Varnish-Cache') == 'HIT').toBeTruthy();
  },
  theHeaderContains: async ([response, headerValue, shouldContain, ...headers]) => {
    for (const header of headers) {
      if (shouldContain) {
        expect(await response.headerValue(headerValue)).toContain(header);
      } else {
        expect(await response.headerValue(headerValue)).not.toContain(header);
      }
    }
  },
  checkMetaContentByProperty: async ([response, key, value, content]) => {
    let jsonContent = JSON.parse(await response.text());
    for (const meta_elem of jsonContent.metatags.meta) {
      if (meta_elem[key] === value) {
        expect(meta_elem['content']).toEqual(content);
      }
    }
  },
  /**
   * Checks the canonical URL within the given CE-API response.
   *
   * @param {Response} response The given CE-API response
   * @param canonicalURL The expected URL
   * @returns {Promise<void>}
   */
  expectCanonicalUrl: async (response, canonicalURL) => {
    let jsonContent = JSON.parse(await response.text());
    let canonicalExists = false;
    for (const meta_elem of jsonContent.metatags.link) {
      if (meta_elem.rel === 'canonical') {
        canonicalExists = true;
        expect(meta_elem.href).toEqual(canonicalURL.toString().trim());
      }
    }
    expect(canonicalExists, 'Expect canonical URL to exist').toBeTruthy();
  },
  /**
   * @deprecated
   */
  checkHomepageCanonicalUrls: async ([response, frontendURL]) => {
    let jsonContent = JSON.parse(await response.text());
    let canonicalURL = frontendURL + '/';
    const INSTALL_EXTENSIONS = process.env.LDP_INSTALL_EXTENSIONS ? process.env.LDP_INSTALL_EXTENSIONS : '';
    if (INSTALL_EXTENSIONS.includes('ldp_cp')) {
      canonicalURL = process.env.LDP_CP_PORTAL_BASE_URL_DEVPORTAL + '/';
    }
    let canonicalExists = false;
    for (const meta_elem of jsonContent.metatags.link) {
      if (meta_elem.rel === 'canonical') {
        canonicalExists = true;
        expect(meta_elem.href).toEqual(canonicalURL.toString().trim());
      }
    }
    expect(canonicalExists, 'Expect canonical url to exist').toBeTruthy();
  },
  /**
   * Checks if current drupal installation is contentpool.
   * @returns {Boolean} Weather site is contentpool or not.
   */
  isContentpoolSite: async () => {
    const INSTALL_EXTENSIONS = process.env.LDP_INSTALL_EXTENSIONS ? process.env.LDP_INSTALL_EXTENSIONS : '';
    console.log('LDP_INSTALL_EXTENSIONS=' + process.env.LDP_INSTALL_EXTENSIONS);
    console.log('INSTALL_EXTENSIONS=' + INSTALL_EXTENSIONS);
    return INSTALL_EXTENSIONS.includes('ldp_cp');
  },
  /**
   * Checks if given ldp extensions are enabled.
   * @param  {Array<String>} extensions Extensions to check.
   * @returns {Boolean} Weather extensions are enabled or not.
   */
  areExtensionsEnabled: async (extensions) => {
    const INSTALL_EXTENSIONS = process.env.LDP_INSTALL_EXTENSIONS ? process.env.LDP_INSTALL_EXTENSIONS : '';
    return extensions.every(extension => INSTALL_EXTENSIONS.includes(extension));
  },
  /**
   * Checks if there are javascript errors in the browser console.
   * @param  {String} message Expected message.
   */
  checkJavascriptErrors: async (page) => {
    let errors = await page.evaluate('window.behat_testing.errors');
    await expect(errors.length).toEqual(0);
  },
  /**
   * Checks if given message exists in drupal status messages.
   * @param  {Array.<{message: String, page: Page}>} array Expected message
   * and page object.
   */
  theStatusMessageShouldContain: async ([message, page]) => {
    await expect(page.locator('div.messages__content')).toContainText(message, { useInnerText: true});
  }
};
