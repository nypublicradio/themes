#! /usr/bin/env/node
/* eslint-env node */
const fs       = require('fs');
const path     = require('path');
const yaml     = require('js-yaml');
const args     = require('args');

const ThemeBuilder = require('./lib/theme-builder');

args.option('edit', 'Edit an existing theme file', false);
const flags = args.parse(process.argv);

// all this to throw if this fails
const THEME_TEMPLATE = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, 'lib/config.yml')));

let builder = new ThemeBuilder({template: THEME_TEMPLATE});

if (flags.edit) {
  builder.pickTheme();
} else {
  builder.newTheme();
}
