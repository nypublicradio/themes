const inquirer = jest.genMockFromModule('inquirer');

inquirer.prompt = jest.fn();

module.exports = inquirer;
