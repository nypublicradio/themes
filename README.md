# NYPR Theme Builder

This repo is a self-contained management tool for "themes", or sets of CSS rules, that can be consumed by engagement widgets such as the Newsletter Signup or Crowdsourcing Client. The generated themes are JSON files with keys and nested objects meant to describe different targeted elements.

Themes are checked into source and saved in the `json` directory. On every push to GitHub, all the theme files are shipped to `https://apps.nypr.org/themes` along with an `index.json` file which contains a list of objects specifying the filename and brand value from each theme.

So if you have a `json/` directory that looks like this:
```bash
json
└── death-sex-money.json
└── 2-dope-queens.json
```

And `2-dope-queens.json` looks something like this (generating these files is covered below):
```json
{
  "brand": "2 Dope Queens",
  ...
}
```

Then on deploy, a file named `index.json` will be uploaded to `https://apps.nypr.org/themes` that looks like this:
```json
[
  {
    "label": "2 Dope Queens",
    "value": "2-dope-queens.json"
  },
  ...
]
```
Which is used by `https://apps.nypr.org/toolkit` to create the "Select a Theme" UI for each widget.

New themes maybe added and edited manually, either directly on GitHub or in a local copy of the repository.

## Command Line Usage

As a convenience this repo includes a command line tool you may use to add new themes or edit an existing one.

### First Time Setup

First you need to clone this repo:
```bash
$ git clone git@github.com:nypublicradio/themes.git
```

You need a recent version of node (>= 6.x). If you've never used node before or are unsure about your version, follow these steps:

1. Install `nvm`. Copy and paste the following into a terminal window:
```bash
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
```
1. Use `nvm` to install the latest version of node.
```bash
$ nvm install lts/carbon
```
1. Set this version to your system default
```bash
$ nvm alias default lts/carbon
```

### Generating a new Theme

You can fire up an interactive prompt that you can follow to fill in the values for a theme. Follow the instructions and you should be able to make a new theme in a matter of minutes.

1. Verify you're using the correct version of node
```bash
$ nvm current
# should show a number higher than 6.x.x
```
1. Change into the repo directory
```bash
$ cd <themes repo folder>
```
1. Run the generator and follow the prompts.
```bash
$ npm run new
```

This will create a new file in the `json` directory, which you must commit and push up to GitHub.

1. Add the file to staging. You will pick the filename during the previous step.
```bash
$ git add json/<filename>.json
```
1. Commit the file with a descriptive message
```bash
$ git commit -m "added here's the thing theme"
```
1. Send the file to GitHub
```bash
$ git push origin master
```

### Editing a Theme

Editing JSON by hand is error-prone. This tool includes an edit command you can use to update an exiting theme. This can be especially useful when Themes are updated to include new attributes (see below for updating the Theme template).

Just as above, you can fire up an interactive prompt to edit a theme.
```bash
$ npm run edit
```
You will be prompted with a list of theme files to choose. Then you can drill down to a particular theme attribute to change.

Don't forget to commit the changed file and push it to GitHub as above.

## Config

The template for themes is defined in `lib/config.yml`, which is a YAML file that describes a list of objects with key value pairs. These objects describe the different prompts you see when generating a new Theme. This tool uses inquirer.js to run the prompts, and `lib/config.yml` is designed to match that library's spec.

So, for example, the file looks a little like this:
```yaml
- message: Brand Name
  name: brand
- message: Logo URL
  name: logo
```
Each `-` represents a new item in the list. Each line until the next `-` represents a key/value pair of an item. Converted to JSON, the two items above look like this:
```json
[
  {
    "message": "Brand Name",
    "name": "brand"
  }, {
    "message": "Logo URL",
    "name": "logo"
  }
]
```
This library uses YAML for configuration so we can avoid all the additional tokens (`[, ], ", {, }`) required in JSON.

### Adding a new attribute to themes

To add a new attribute to a theme, you must add a new item with `message` and `name` keys to the list. For example, if you wanted to add a new value for H1 font size, you'd add something like this:
```yaml
- message: H1 Font Size
  name: 'h1.fontSize'
```
See how `name` is `'h1.fontSize'`? Just think of the `.` as a way to group together attributes under the same element.
