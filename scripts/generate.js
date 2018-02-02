#! /usr/bin/env/node

const fs = require('fs');
const path = require('path');

const JSON_DIR = path.resolve('./json');

const files = fs.readdirSync(JSON_DIR);

let output = [];

files.forEach(filename => {
  let json = require(path.resolve(JSON_DIR, filename));
  output.push({ label: json.brand, value: filename.replace('.json', '') });
});

let defaultTheme = output.find(theme => theme.value === 'wnyc-studios');
if (defaultTheme) {
  output = output.filter(theme => theme.value !== 'wnyc-studios');
  output.unshift(defaultTheme);
}

fs.writeFileSync('./index.json', JSON.stringify(output));
