# drunomics Playwright Drupal utils

## Dependencies:

- Drush

## Overview:

The package provides:

* Various drush commands in the PlaywrightDrushCommands class useful for testing with playwright. The class is autoloaded and ready to use when package is installed.

* Test helpers and commands

  * The functions in `./tests/helpers/drupal-commands` are reusable helpers for communicating with drupal API in tests.

  * `./tests/helpers/ldp-test` holds a fixture, an extension of playwright test which carries additional variables suitable for testing decoupled projects with diverse origins.

  * `./tests/helpers/test-methods` is a collection of reusable and often used helper functions, for example logging in and out of the site, headers check etc.

  * `./tests/helpers/a11y-helper` is a helper for running accessibility checks using axe-core.

### Setup

* Add this package to your project's dev dependencies.
* Add package type "playwright-helper" to "installer-types" section of your composer.json
* Adjust the package installation location by adjusting installer-paths in your composer.json. The package needs to be installed in the directory with your playwright installation (location of your package.json). 
* Require the helpers in your test files e.g. `const helpers = require("../playwright-drupal-utils/tests/helpers/test-methods");`


## License

* Drush Extension is licensed under [GPLv3 or later](src/LICENSE)
* JavaScript code is licensed under [MIT](tests/LICENSE)

## Credits
 
  developed by drunomics GmbH, hello@drunomics.com
  Please refer to the commit log individual contributors.  
