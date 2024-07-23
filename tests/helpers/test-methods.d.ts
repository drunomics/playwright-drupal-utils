export function IShouldNotBeLoggedIn(page): Promise<void>;

export function ILogInAs([page, username]): Promise<void>;

export function ILogOut([page, base_url]): Promise<void>;

export function theCacheHitExists([page, response]): Promise<void>;

export function theHeaderContains([response, headerValue, shouldContain, ...headers]): Promise<void>;

export function checkMetaContentByProperty([response, key, value, content]): Promise<void>;

/**
 * Checks the canonical URL within the given CE-API response.
 *
 * @param {Response} response The given CE-API response
 * @param canonicalURL The expected URL
 * @returns {Promise<void>}
 */
export function expectCanonicalUrl(response, canonicalURL): Promise<void>;

/**
 * @deprecated
 */
export function checkHomepageCanonicalUrls([response, frontendURL]): Promise<void>;

/**
 * Checks if current drupal installation is contentpool.
 * @returns {Boolean} Weather site is contentpool or not.
 */
export function isContentpoolSite(): Promise<boolean>;

/**
 * Checks if given ldp extensions are enabled.
 * @param  {Array<String>} extensions Extensions to check.
 * @returns {Boolean} Weather extensions are enabled or not.
 */
export function areExtensionsEnabled(extensions): Promise<void>;

/**
 * Checks if there are javascript errors in the browser console.
 * @param  {String} message Expected message.
 */
export function checkJavascriptErrors(page): Promise<void>;

/**
 * Checks if given message exists in drupal status messages.
 * @param  {Array.<{message: String, page: Page}>} array Expected message
 * and page object.
 */
export function theStatusMessageShouldContain([message, page]): Promise<void>;

/**
 * Fills CKEditor Text Area.
 * @param  {Array.<{page: Page, locator: String, textAreaContent: String}>}
 * array page object, selector and text to be filled.
 */
export function fillCKEditorTextArea([page, locator, textAreaContent]): Promise<void>;
