const AxeBuilder = require("@axe-core/playwright").default;

module.exports = {
  /**
   * Runs axe-core accessibility checks on the given page.
   * @param {Page} object The page to scan.
   * 
   * @return {Response} The list of accessibility violations found.
   */
  scanPage: async (page) => {
    // Run axe-core accessibility checks, covering WCAG 2.1 Level A, AA and AAA.
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags([
        "wcag2a",
        "wcag2aa",
        "wcag2aaa",
        "wcag21a",
        "wcag21aa",
        "wcag21aaa",
        "best-practice",
        "wcag***",
        "ACT",
      ]).analyze();

    // Print out the report with issues found.
    console.table(accessibilityScanResults.violations.map((violation) => {
      return {
        id: violation.id,
        impact: violation.impact,
        tag: violation.tags[1], // The second tag is most relevant.
        help: violation.help,
      }
    }));

    return accessibilityScanResults;
  }
};