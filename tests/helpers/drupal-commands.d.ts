export function drush(command: string): Buffer;

/**
 * Finds node ID via drush and returns it.
 * @param  {Array<{page: Page, node_title: String}>} array Page object and
 *   node title
 * @returns {Promise<string>} The result.
 */
export function getNodeIdByTitle([page, node_title]): Promise<string>;

/**
 * Removes content prefixed with given keyword.
 * @param  {String} keyword Keyword to find content by.
 */
export function cleanUpContent(keyword): Promise<void>;

/**
 * Finds node ID via drush and visits node edit page.
 * @param  {Array<{page: Page, node_title: String}>} array Page object and
 *   node title
 * @return {Response} The response.
 */
export async function visitNodeEditPage([page, node_title]): Promise<Response>;

/**
 * Finds node ID via drush and visits node layout page.
 * @param  {Array<{page: Page, node_title: String}>} array Page object and
 *   node title
 * @return {Response} The response.
 */
export async function visitNodeLayoutPage([page, node_title]): Promise<Response>;

/**
 * Finds node ID via drush and visits node layout preview page in the frontend.
 * @param  {Array<{page: Page, node_title: String}>} array Page object and
 *   node title
 * @return {Response} The response.
 */
export async function visitNodeLayoutPreviewPage([page, node_title]): Promise<Response>;


/**
 * Visits node path found by title via drush.
 * @param  {Array<{page: Page, node_title: String}>} array Page object and
 *   node title
 * @return {Response} The response.
 */
export async function visitNodeByTitle([page, node_title]): Promise<Response>;


/**
 * Visits node api with path alias found by title via drush.
 * @param  {Object[]} array Page object and node title
 * @return {Response} The response.
 */
export async function visitNodeAPIByTitle([page, node_title]): Promise<Response>;

/**
 * Clones node with given title to a new node with new title.
 * @param  {Array<{page: Page, node_title: String, new_node_title: String}>}
 *   array Page object and node title
 * @return Promise{Buffer} The response.
 */
export async function cloneNodeByTitle([page, node_type, node_title, new_node_title]): Promise<Buffer>;

/**
 * Checks if there are any errors in the watchdog starting from a certain timestamp.
 *
 * @param timestamp Timestamp from when to look for errors.
 * @param fail_on_notice Boolean to change severity level of watchdog errors.
 * @returns {Promise<string>} The json result.
 */
export async function checkWatchdogErrors(timestamp, fail_on_notice = false): Promise<number>;
