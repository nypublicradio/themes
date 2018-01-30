jest.unmock('fs');
jest.unmock('path');

const fs   = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const find = require('lodash/find');

const CONFIG = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, 'config.yml')));

describe('Config file', () => {
  it('has the required brand object', () => {
    expect(find(CONFIG, {name: 'brand'})).toEqual({name: 'brand', message: 'Brand Name'});
  });
});
