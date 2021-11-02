/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

// TODO: make this plugin work:
// https://stackoverflow.com/questions/69798980/how-to-use-the-blob-constructor-inside-a-cypress-plugin

const webpack = require('@cypress/webpack-preprocessor');

// NOTE: cannot upgrade to ESM-only clipboardy 3 since Cypress plugins must
// still use require() to import packages.
const clipboard = require('clipboardy');
const clipboardPolyfill = require('clipboard-polyfill');
// const Blob = require('blob-polyfill').Blob;

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  on('file:preprocessor', webpack({
    webpackOptions: require('../../../../../omelette/'),
    watchOptions: {},
  }));

  on('task', {
    // Clipboard test plugin
    getClipboard: () => {
      const cb = clipboard.readSync();
      return cb;
    },
    setClipboardText: (s) => {
      clipboard.writeSync(s);
      return null;
    },
    setClipboardHtml: (s) => {
      // cy.window((win) => {
      console.log(global.Blob);
      // });
      return clipboardPolyfill.write([
        new clipboardPolyfill.ClipboardItem({
          'text/html': new Blob([s], { type: 'text/html' }),
        }),
      ]);
    },
  });

  /* coverage-start
  require('@cypress/code-coverage/task')(on, config)
  on('file:preprocessor', require('@cypress/code-coverage/use-babelrc'))
  return config
  coverage-end */
};
