'use strict';

const fs       = require('fs');
const path     = require('path');
const inquirer = require('inquirer');
const map      = require('lodash/map');
const find     = require('lodash/find');
const merge    = require('deepmerge');

const ui = new inquirer.ui.BottomBar();

const slugify = str => str.toLowerCase().replace(/\W/g, '-').replace(/-+/g, '-');

class ThemeBuilder {
  constructor({ template, theme, output } = {}) {
    this.template = template;
    this.theme = theme || {};
    this.output = output || path.resolve(__dirname, '../json');
  }

  pickTheme() {
    let choices = fs.readdirSync(this.output);
    return inquirer.prompt({ type: 'list', name: 'which', message: 'Which Theme to edit?', choices })
      .then(({ which }) => this.editTheme(which));
  }

  editTheme(filename) {
    let json = require(path.resolve(this.output, filename));
    this.theme = json;

    ui.log.write(`Here's what it looks like:\n${JSON.stringify(json, null, 2)}`);
    return this.edit();
  }

  newTheme() {
    return this.promptForValues();
  }

  promptForValues(template) {
    return inquirer.prompt(template || this.template)
      .then(theme => this.theme = merge(this.theme, theme || {}))
      .then(this.confirm.bind(this));
  }

  confirm() {
    let prompt = {
      type: 'confirm',
      message: `Looks ok?\n${JSON.stringify(this.theme, null, 2)}`,
      name: 'confirmed'
    };
    return inquirer.prompt(prompt)
      .then(({confirmed}) => {
        if (confirmed) {
          return this.finish();
        } else {
          return this.edit();
        }
      })
  }

  edit() {
    let attributes = map(this.template, 'message');
    return inquirer.prompt({ type: 'list', name: 'which', message: 'Pick a value to edit.', choices: attributes })
      .then(({which}) => {
        let attribute = find(this.template, {message: which});
        return this.promptForValues(attribute);
      });
  }

  finish() {
    return inquirer.prompt({message: 'Enter a filename', default: slugify(this.theme.brand), name: 'filename'})
      .then(({filename}) => {
        filename = filename.endsWith('.json') ? filename : `${filename}.json`;
        fs.writeFileSync(path.resolve(this.output, filename), JSON.stringify(this.theme, null, 2));
      });
  }

}

module.exports = ThemeBuilder;
