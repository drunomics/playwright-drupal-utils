const base = require('@playwright/test');

exports.test = base.test.extend({
  backendURL: ['http://admin--example.ldp-project.localdev.space', { option: true }],
});