'use strict';

const fs       = require('fs');
const path     = require('path');
const inquirer = require('inquirer');
const map      = require('lodash/map');
const find     = require('lodash/find');
const merge    = require('deepmerge');

const ui = new inquirer.ui.BottomBar();

const slugify = str => str.toLowerCase().replace(/\W/g, '-').replace(/-+/g, '-');

// ThemeBuilder is a wrapper around an inquirer promp. we set up a kind of stateless loop, which goes like:
//  - prompt user for input
//  - merge user input with base template (either a chosen theme or a new theme)
//  - display merged object to user. accept? y/n
//   - no: prompt user for input
//   - yes: save to disk
class ThemeBuilder {
  constructor({ template, theme, output } = {}) {
    this.template = template;
    this.theme = theme || {};
    this.output = output || path.resolve(__dirname, '../json');
  }

  // read the list of files from the output directory and display a list for user to choose
  // each file is a different theme
  pickTheme() {
    let choices = fs.readdirSync(this.output);
    return inquirer.prompt({ type: 'list', name: 'which', message: 'Which Theme to edit?', choices })
      .then(({ which }) => this.editTheme(which));
  }

  // given a filename, display the current contents and drop into edit loop
  editTheme(filename) {
    let json = require(path.resolve(this.output, filename));
    this.theme = json;

    ui.log.write(`Here's what it looks like:\n${JSON.stringify(json, null, 2)}`);
    return this.edit();
  }

  // kick off a new theme
  newTheme() {
    return this.promptForValues();
  }

  // given an inquirer template, display the prompt, and merge the results with the current theme
  // then pass to the confirm prompt
  promptForValues(template) {
    return inquirer.prompt(template || this.template)
      .then(theme => this.theme = merge(this.theme, theme || {}))
      .then(this.confirm.bind(this));
  }

  // display the current theme's values and finish or drop back into the edit loop
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

  // the edit loop
  // pull out all the `message` values from the template and display them as a list of attributes to edit
  // take chosen message value, and display an inquirer prompt for the attribute
  edit() {
    let attributes = map(this.template, 'message');
    return inquirer.prompt({ type: 'list', name: 'which', message: 'Pick a value to edit.', choices: attributes })
      .then(({which}) => {
        let attribute = find(this.template, {message: which});
        return this.promptForValues(attribute);
      });
  }

  // display a prompt to pick a filename and save the current session to disk
  finish() {
    return inquirer.prompt({message: 'Enter a filename', default: slugify(this.theme.brand), name: 'filename'})
      .then(({filename}) => {
        filename = filename.endsWith('.json') ? filename : `${filename}.json`;
        fs.writeFileSync(path.resolve(this.output, filename), JSON.stringify(this.theme, null, 2));
      });
  }

}

module.exports = ThemeBuilder;
