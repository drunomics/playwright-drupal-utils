const base  = require('@playwright/test');
const { expect } = require('@playwright/test');
const drupal = require('../helpers/drupal-commands');

exports.test = base.test.extend({
  backendURL: ['http://admin--example.ldp-project.localdev.space', { option: true }],
  backendApiURL: ['http://admin--example.ldp-project.localdev.space/api', { option: true }],
  frontendURL: ['http://example.ldp-project.localdev.space', { option: true }],
  // Regex strings; watchdog errors whose message matches any of them are
  // treated as accepted noise and do not fail the test. The watchdog table is
  // site-wide, so this is the only way to tolerate known warnings produced by
  // concurrently running specs without failing unrelated tests.
  watchdogIgnorePatterns: [[], { option: true }],
  watchdog: [async ({ watchdogIgnorePatterns }, use, testInfo) => {
    await use();
    const watchdog_errors = await drupal.checkWatchdogErrors(Math.floor(testInfo['_startWallTime'] / 1000), true, true)
    const ignorePatterns = watchdogIgnorePatterns.map((pattern) => new RegExp(pattern));
    const errors = watchdog_errors['errors'].filter(
      (error) => !ignorePatterns.some((pattern) => pattern.test(String(error['message'])))
    );
    errors.map((error) => testInfo.errors.push({
      message: `Watchdog item ID: ${error['wid']}
type: ${error['type']}
severity: ${error['severity']}
message: ${error['message']}`
    }))
    expect(errors.length).toEqual(0);
  }, { scope: 'test', auto: true }]
});