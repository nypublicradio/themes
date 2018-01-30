const ThemeBuilder = require('./theme-builder');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const merge = require('merge');

jest.mock('fs');
jest.mock('path')

const template = [{
  message: 'Foo',
  name: 'foo'
}, {
  message: 'Bar',
  name: 'bar'
}];
let builder;

describe('ThemeBuilder interface', () => {
  beforeEach(() => {
    inquirer.prompt.mockReset();
    fs.writeFileSync.mockReset();
    path.resolve.mockReset();
    builder = new ThemeBuilder({ template, output: '../json' });
  });

  test('stashes given questions on an attribute', () => {
    expect(builder.template).toEqual(template);
  });

  describe('creating and editing', () => {
    it('sets the receved attributes as the theme attr on the instance', () => {
      builder.confirm = jest.fn();

      inquirer.prompt.mockReturnValue(Promise.resolve({foo: 'bar'}));
      return builder.newTheme().then(() => expect(builder.theme).toEqual({foo: 'bar'}));
    });

    it('extends answers state with given retrieve answers', () => {
      builder.theme = {name: 'foo', address: {street: 'main', number: 123}};
      builder.confirm = jest.fn();

      inquirer.prompt.mockReturnValue(Promise.resolve({ age: 200, address: {number: 456}}));
      return builder.newTheme().then(() => expect(builder.theme).toEqual({
        name: 'foo',
        age: 200,
        address: {
          street: 'main',
          number: 456
        }
      }));
    });

    it('prompts with passed questions', () => {
      let template = {name: 'hello', message: 'World'};
      inquirer.prompt.mockReturnValue(Promise.resolve({}));
      builder.confirm = jest.fn();

      return builder.promptForValues(template).then(() => {
        let [[ arg ]] = inquirer.prompt.mock.calls;
        expect(arg).toEqual(template);
      });
    })

    it('uses initial questions if none are passed', () => {
      inquirer.prompt.mockReturnValue(Promise.resolve());
      builder.confirm = jest.fn();

      return builder.promptForValues().then(() => {
        let [[ arg ]] = inquirer.prompt.mock.calls;
        expect(arg).toEqual(template);
      });
    })
  });

  describe('confirm', () => {
    it('calls finish if confirmed', () => {
      inquirer.prompt.mockReturnValue(Promise.resolve({confirmed: true}));
      builder.finish = jest.fn();
      return builder.confirm().then(() => expect(builder.finish.mock.calls.length).toBe(1));
    });

    it('calls edit if not confirmed', () => {
      inquirer.prompt.mockReturnValue(Promise.resolve({confirmed: false}));
      builder.edit = jest.fn();
      return builder.confirm().then(() => expect(builder.edit.mock.calls.length).toBe(1));
    });
  });

  describe('edit', () => {
    it('offers a list of items to edit', () => {
      inquirer.prompt.mockReturnValue(Promise.resolve({ which: 'Bar' }));
      builder.promptForValues = jest.fn();

      return builder.edit().then(() => {
        let [ [{choices}] ] = inquirer.prompt.mock.calls;
        let [[ foundQuestion ]] = builder.promptForValues.mock.calls;
        expect(choices).toEqual(['Foo', 'Bar']);
        expect(foundQuestion).toEqual({message: 'Bar', name: 'bar'});
      });
    });
  });

  describe('finish', () => {
    it('writes the answers to the "json" directory', () => {
      builder.theme.brand = "Hello World";

      inquirer.prompt.mockReturnValue(Promise.resolve({ filename: 'hello-world' }));

      return builder.finish().then(() => {
        let [[, json]] = fs.writeFileSync.mock.calls;
        expect(json).toEqual(JSON.stringify({"brand": "Hello World"}, null, 2));

        let [[folder, filename ]] = path.resolve.mock.calls;
        expect(folder).toBe(builder.output);
        expect(filename).toBe('hello-world.json');

        let [[ args ]] = inquirer.prompt.mock.calls;
        expect(args.default).toBe('hello-world');
      });
    });
  });

  test('new file integration', () => {
    let theme = {foo: 'hello', bar: 'wordl', brand: 'Death, Sex, & Money'};

    // ask initial questions
    inquirer.prompt.mockReturnValueOnce(Promise.resolve(theme));

    // confirm: say no to enter edit flow
    inquirer.prompt.mockReturnValueOnce(Promise.resolve({confirmed: false}));

    // pick a question to edit
    inquirer.prompt.mockReturnValueOnce(Promise.resolve({ which: 'Bar' }));

    // ask to edit question
    inquirer.prompt.mockReturnValueOnce(Promise.resolve({ 'bar': 'world' }));

    // confirm: say yes to enter finish flow
    inquirer.prompt.mockReturnValueOnce(Promise.resolve({confirmed: true}))

    // enter a filename
    // filename is passed to path.resolve
    inquirer.prompt.mockReturnValueOnce(Promise.resolve({filename: 'baz'}));

    return builder.newTheme().then(() => {
      let [initial, confirmFalse, pickEdit, askSingle, confirmTrue, filename] = inquirer.prompt.mock.calls;
      expect(initial[0]).toEqual(template);
      expect(confirmFalse[0].message).toEqual(`Looks ok?\n${JSON.stringify(theme, null, 2)}`);
      expect(pickEdit[0].choices).toEqual(['Foo', 'Bar']);
      expect(askSingle[0]).toEqual({message: 'Bar', name: 'bar'});

      let updatedAnswers = merge(theme, {'bar': 'world'});
      expect(confirmTrue[0].message).toEqual(`Looks ok?\n${JSON.stringify(updatedAnswers, null, 2)}`);
      expect(filename[0].default).toBe('death-sex-money');

      let [[, json]] = fs.writeFileSync.mock.calls;
      expect(json).toEqual(JSON.stringify(updatedAnswers, null, 2));

      let [[folder, file ]] = path.resolve.mock.calls;
      expect(folder).toBe(builder.output);
      expect(file).toBe('baz.json');
    });
  });
});
