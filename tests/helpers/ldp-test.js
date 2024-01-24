const base = require('@playwright/test');
const expect= require('@playwright/test');
const drupal = require('../helpers/drupal-commands');

exports.test = base.test.extend({
  backendURL: ['http://admin--example.ldp-project.localdev.space', { option: true }],
  backendApiURL: ['http://admin--example.ldp-project.localdev.space/api', { option: true }],
  frontendURL: ['http://example.ldp-project.localdev.space', { option: true }],
  watchdog: [async ({}, use, testInfo) => {
    await use();
    await expect(await drupal.checkWatchdogErrors(testInfo['_startWallTime'], true)).toEqual(0);
  }, { scope: 'test', auto: true }]
});