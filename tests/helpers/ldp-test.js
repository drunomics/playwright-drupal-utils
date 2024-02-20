const base  = require('@playwright/test');
const { expect } = require('@playwright/test');
const drupal = require('../helpers/drupal-commands');

exports.test = base.test.extend({
  backendURL: ['http://admin--example.ldp-project.localdev.space', { option: true }],
  backendApiURL: ['http://admin--example.ldp-project.localdev.space/api', { option: true }],
  frontendURL: ['http://example.ldp-project.localdev.space', { option: true }],
  watchdog: [async ({}, use, testInfo) => {
    await use();
    const watchdog_errors = await drupal.checkWatchdogErrors(Math.floor(testInfo['_startWallTime'] / 1000), true, true)
    if (parseInt(watchdog_errors['numberOfErrors']) > 0) {
      watchdog_errors['errors'].map((error) => testInfo.errors.push({
        message: `Watchdog item ID: ${error['wid']}
type: ${error['type']}
severity: ${error['severity']}
message: ${error['message']}`
      }))
    }
    expect(parseInt(watchdog_errors['numberOfErrors'])).toEqual(0);
  }, { scope: 'test', auto: true }]
});