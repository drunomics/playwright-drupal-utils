function drush(command) {
    return require('child_process').execSync(`
        ${process.env.DOCKER_EXEC_CLI} 'drush ${command}'`);
}
module.exports = {
  /**
   * Finds node ID via drush and visits node edit page.
   * @param  {Array<{page: Page, node_title: String}>} array Page object and
   *   node title
   * @return {Response} The response.
   */
  visitNodeEditPage: async ([page, node_title]) => {
    const result = drush(`test:node-get-id "${node_title}"`);
    const nid = result.toString().replace(/\s+$/,'');
    return await page.goto(`/node/${nid}/edit?destination=admin/content`);
  },

  /**
   * Finds node ID via drush and visits node layout page.
   * @param  {Array<{page: Page, node_title: String}>} array Page object and
   *   node title
   * @return {Response} The response.
   */
  visitNodeLayoutPage: async ([page, node_title]) => {
    const result = drush(`test:node-get-id "${node_title}"`);
    const nid = result.toString().replace(/\s+$/,'');
    return await page.goto(`/node/${nid}/layout`);
  },

  /**
   * Finds node ID via drush and visits node layout preview page in the frontend.
   * @param  {Array<{page: Page, node_title: String}>} array Page object and
   *   node title
   * @return {Response} The response.
   */
  visitNodeLayoutPreviewPage: async ([page, node_title]) => {
    const result = drush(`test:node-get-id "${node_title}"`);
    const nid = result.toString().replace(/\s+$/,'');
    // We do not have to explicitly go to the frontend via an absolute URL,
    // since the backend path redirects to the frontend also.
    return await page.goto(`/node/${nid}/layout-preview?auth=1`);
  },

  /**
   * Finds node ID via drush and returns it.
   * @param  {Array<{page: Page, node_title: String}>} array Page object and
   *   node title
   * @returns {Promise<string>} The result.
   */
  getNodeIdByTitle: async ([page, node_title]) => {
    const result = drush(`test:node-get-id "${node_title}"`);
    return result.toString().replace(/\s+$/,'');
  },

  /**
   * Visits node path found by title via drush.
   * @param  {Array<{page: Page, node_title: String}>} array Page object and
   *   node title
   * @return {Response} The response.
   */
  visitNodeByTitle: async ([page, node_title]) => {
    const result = drush(`test:node-get-path "${node_title}"`);
    // Remove only newline; keep any trailing spaces (that should never exist).
    const path = result.toString().replace(/\n+$/,'');
    return await page.goto(path);
  },


  /**
   * Visits node api with path alias found by title via drush.
   * @param  {Object[]} array Page object and node title
   * @return {Response} The response.
   */
  visitNodeAPIByTitle: async ([page, node_title]) => {
    const result = drush(`test:node-get-path-alias "${node_title}"`);
    let baseUrl = process.env.DRUPAL_BASE_URL;
    if (!baseUrl) {
      baseUrl = process.env.SITE_ADMIN_BASE_URL;
    }
    const path = result.toString().replace(/\n+$/,'');
    return await page.goto(`${baseUrl}/api${path}`);
  },

  /**
   * Clones node with given title to a new node with new title.
   * @param  {Array<{page: Page, node_title: String, new_node_title: String}>}
   *   array Page object and node title
   * @return {Response} The response.
   */
  cloneNodeByTitle: async ([page, node_type, node_title, new_node_title]) => {
    return drush(`test:node-clone "${node_type}" "${node_title}" "${new_node_title}"`);
  },

  /**
   * Checks if there are any errors in the watchdog starting from a certain timestamp.
   *
   * @param timestamp Timestamp from when to look for errors.
   * @param fail_on_notice Boolean to change severity level of watchdog errors.
   * @returns {Promise<string>} The json result.
   */
  checkWatchdogErrors: async (timestamp, fail_on_notice) => {
    const result = drush(`test:checkWatchdog "${timestamp}" "${fail_on_notice}" "1"`);
    const json = JSON.parse(result.toString());
    return parseInt(json['numberOfErrors']);
  },

  /**
   * Removes content prefixed with given keyword.
   * @param  {String} keyword Keyword to find content by.
   */
  cleanUpContent: async (keyword) => {
    drush(`test:testsCleanUp "${keyword}"`);
  },
  drush
}
