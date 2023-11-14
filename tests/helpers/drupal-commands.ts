export function drush(command: string): Buffer {
    return require('child_process').execSync(`
        ${process.env.DOCKER_EXEC_CLI} 'drush ${command}'`);
}

/**
 * Finds node ID via drush and returns it.
 * @param  {Array<{page: Page, node_title: String}>} array Page object and
 *   node title
 * @returns {Promise<string>} The result.
 */
export async function getNodeIdByTitle([page, node_title]): Promise<string> {
    const result = drush(`test:node-get-id "${node_title}"`);
    return result.toString();
}

/**
 * Removes content prefixed with given keyword.
 * @param  {String} keyword Keyword to find content by.
 */
export async function cleanUpContent(keyword): Promise<void> {
    drush(`test:testsCleanUp "${keyword}"`);
}

/**
 * Finds node ID via drush and visits node edit page.
 * @param  {Array<{page: Page, node_title: String}>} array Page object and
 *   node title
 * @return {Response} The response.
 */
export async function visitNodeEditPage([page, node_title]): Promise<Response> {
    const result = drush(`test:node-get-id "${node_title}"`);
    return await page.goto('/node/' + result.toString() + '/edit?destination=admin/content');
}

/**
 * Finds node ID via drush and visits node layout page.
 * @param  {Array<{page: Page, node_title: String}>} array Page object and
 *   node title
 * @return {Response} The response.
 */
export async function visitNodeLayoutPage([page, node_title]): Promise<Response> {
    const result = drush(`test:node-get-id "${node_title}"`);
    return await page.goto('/node/' + result.toString() + '/layout');
}

/**
 * Finds node ID via drush and visits node layout preview page in the frontend.
 * @param  {Array<{page: Page, node_title: String}>} array Page object and
 *   node title
 * @return {Response} The response.
 */
export async function visitNodeLayoutPreviewPage([page, node_title]): Promise<Response> {
    const result = drush(`test:node-get-id "${node_title}"`);
    // We do not have to explicitly go to the frontend via an absolute URL,
    // since the backend path redirects to the frontend also.
    return await page.goto('/node/' + result.toString() + '/layout-preview?auth=1');
}


/**
 * Visits node path found by title via drush.
 * @param  {Array<{page: Page, node_title: String}>} array Page object and
 *   node title
 * @return {Response} The response.
 */
export async function visitNodeByTitle([page, node_title]): Promise<Response> {
    const result = drush(`test:node-get-path "${node_title}"`);
    return await page.goto(result.toString());
}


/**
 * Visits node api with path alias found by title via drush.
 * @param  {Object[]} array Page object and node title
 * @return {Response} The response.
 */
export async function visitNodeAPIByTitle([page, node_title]): Promise<Response> {
    const result = drush(`test:node-get-path-alias "${node_title}"`);
    let baseUrl = process.env.DRUPAL_BASE_URL;
    if (!baseUrl) {
        baseUrl = process.env.SITE_ADMIN_BASE_URL;
    }
    return await page.goto(baseUrl + '/api' + result.toString());
}

/**
 * Clones node with given title to a new node with new title.
 * @param  {Array<{page: Page, node_title: String, new_node_title: String}>}
 *   array Page object and node title
 * @return Promise{Buffer} The response.
 */
export async function cloneNodeByTitle([page, node_type, node_title, new_node_title]): Promise<Buffer> {
    return drush(`test:node-clone "${node_type}" "${node_title}" "${new_node_title}"`);
}

/**
 * Checks if there are any errors in the watchdog starting from a certain timestamp.
 *
 * @param timestamp Timestamp from when to look for errors.
 * @param fail_on_notice Boolean to change severity level of watchdog errors.
 * @returns {Promise<string>} The json result.
 */
export async function checkWatchdogErrors(timestamp, fail_on_notice = false): Promise<number> {
    const result = drush(`test:checkWatchdog "${timestamp}" "${fail_on_notice}" "1"`);
    const json = JSON.parse(result.toString());
    return parseInt(json['numberOfErrors']);
}
