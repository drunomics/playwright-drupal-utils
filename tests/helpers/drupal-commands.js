function drush(command) {
    return require('child_process').execSync(`
        ${process.env.DOCKER_EXEC_CLI} 'drush ${command}'`);
}
module.exports = {
  /**
   * Finds node ID via drush and visits node edit page.
   * @param  {Array<{page: Page, node_title: String, langcode: String}>} array
   *   Page object, node title and optional language code prefix for the URL.
   *   Note the node title must be in the original language. The visited page
   *   will edit the node's translation if it exists, otherwise the original
   *   language node (just in another UI language).
   * @return {Response} The response.
   */
  visitNodeEditPage: async ([page, node_title, langcode = '']) => {
    const lang_prefix = langcode ? `/${langcode}` : '';
    const result = drush(`test:node-get-id "${node_title}"`);
    const nid = result.toString().replace(/\s+$/,'');
    return await page.goto(`${lang_prefix}/node/${nid}/edit?destination=/admin/content`);
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
   * Finds entity ID via drush and returns it.
   * @param  {Array<{page: Page, entity_type: String, label: String}>} array
   *   Page object, entity type, specification to select entity of this type,
   *   entity_spec must resolve to a single entity of the given type and can be
   *   either a label, or a JSON object as '{"field/property": value, ...}'.
   * @returns {Promise<string>} The result.
   */
  getEntityId: async ([page, entity_type, entity_spec]) => {
    // The drush command supports base64 encoded JSON object to evade dealing
    // with double quotes. entity_spec must not be encoded if it's just a
    // label; encode it if it's a bracketed string with a "key": inside.
    if (entity_spec.match(/^\s*{\s*".*"\s*:.*}\s*$/s)) {
      entity_spec = btoa(entity_spec);
    }
    const result = drush(`test:entity-get-id "${entity_type}" "${entity_spec}"`);
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
   * @param  {Array<{page: Page, node_title: String, new_node_title: String, moderation_state: String}>}
   *   array Page object, node title and moderation_state with default published status.
   * @return {string} The output of the command run.
   */
  cloneNodeByTitle: async ([page, node_type, node_title, new_node_title, moderation_state = "published"]) => {
    return drush(`test:node-clone "${node_type}" "${node_title}" "${new_node_title}" "${moderation_state}"`);
  },

  /**
   * Adds a translation to a content entity if none exists yet.
   *
   * This is an alternative to either importing translations as demo content or
   * adding translations through the UI / Playwright JS directly. The latter
   * method is complicated by the fact that if a translation is already present
   * (because of a test being re-run), the UI behaves differently. This command
   * changes nothing if the translation is already present; if the existing
   * translation differs from the 'translation' argument, that's a sign the
   * test should likely be changed.
   *
   * @param  {Array<{entity_type: String, entity_spec: Object/String, langcode: String, translation: Object/String}>} array
   *   Content entity type, specification to select entity of this type,
   *   language to translate into, and all fields to translate.
   *   entity_spec must resolve to a single entity ofthe given type and
   *   can be either an entity label an object containing property field values.
   * @return {string} The output of the command run.
   */
  addEntityTranslation: async ([entity_type, entity_spec, langcode, translation]) => {
    // Passing a JSON encoded string is deprecated; passing a single entity
    // label as a string is allowed.
    if (typeof entity_spec === 'string') {
      if (entity_spec.match(/^\s*{\s*".*"\s*:.*}\s*$/s)) {
        entity_spec = btoa(entity_spec);
      }
    }
    else {
      entity_spec = JSON.stringify(entity_spec);
      // Double quotes cannot be sent as a single command parameter to a
      // bash command inside a docker container, so base64-encode the string.
      // (The drush command supports this.) UTF8-escape non-ASCII characters
      // first, so base64 can deal with them.
      entity_spec  = entity_spec.replace(/[\u007F-\uFFFF]/g, function(chr) {
        return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).slice(-4)
      })
      entity_spec = btoa(entity_spec);
    }

    if (typeof translation !== 'string') {
      translation = JSON.stringify(translation);
      translation  = translation.replace(/[\u007F-\uFFFF]/g, function(chr) {
        return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).slice(-4)
      })
    }
    translation = btoa(translation);

    return drush(`test:entity-add-translation "${entity_type}" "${entity_spec}" "${langcode}" "${translation}"`);
  },

  /**
   * Checks if there are any errors in the watchdog starting from a certain timestamp.
   *
   * @param timestamp Timestamp from when to look for errors.
   * @param fail_on_notice Boolean to change severity level of watchdog errors.
   * @param verbose Boolean to verbose output of watchdog errors.
   * @returns {Promise<string>} The json result.
   */
  checkWatchdogErrors: async (timestamp, fail_on_notice, verbose =  false) => {
    const result = drush(`test:checkWatchdog "${timestamp}" "${fail_on_notice}" "${verbose}"`);
    const json = JSON.parse(result.toString());
    return verbose ? json : parseInt(json['numberOfErrors']);
  },

  /**
   * Removes content prefixed with given keyword.
   * @param  {String} keyword Keyword to find content by.
   */
  cleanUpContent: async (keyword) => {
    drush(`test:testsCleanUp "${keyword}"`);
  },

  /**
   * Removes translation prefixed with given keyword.
   * @param  {String} keyword Keyword to find translation by.
   * @param  {String} langcode Language code of the translation.
   */
  cleanUpTranslation: async (keyword, langcode) => {
    drush(`test:translationCleanUp "${keyword}" "${langcode}"`);
  },
  drush
}
