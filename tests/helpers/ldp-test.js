const base = require('@playwright/test');

exports.test = base.test.extend({
  backendURL: ['http://admin--example.ldp-project.localdev.space', { option: true }],
  backendApiURL: ['http://admin--example.ldp-project.localdev.space/api', { option: true }],
  frontendURL: ['http://example.ldp-project.localdev.space', { option: true }]
});