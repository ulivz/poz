# README

### name

- Type: `string`

Project's name.

### username

- Type: `string`

User's github name.

### description

- Type: `string`

Project's description.

### badges

- Type: `object`

`badges.version`: NPM version badge
`badges.downloads`: NPM downloads badge
`badges.ci`: circleCI's status
`badges.codecov`: coverage from codecov
`badges.donate`: donate badge, default it will link to your 'donate' respository.

All properties' default is `true`.

### logo

- Type: `object`

A object to show the project's logo 

`logo.width`: width of the logo
`logo.path`: the logo's relative path in this project

No default.

### install

- Type: `object`

An object to determine the install part.

`install.npm`: show npm's install
`install.yarn`: show yarn's install

All properties' default is `true`.

### usage

- Type: `boolean` `object`
- Default: `true`

Show usage part.

Default title is `Usage`, You can use `usage.name` to change it.

### faq

- Type: `object`

FAQ part, use markdown's `<details> / </summary>` syntax

- `faq.name`: faq's title, default is `FAQ`
- `faq.list`: A array contains the `FAQ`'s list.


Each object in `faq.list` in should contains:

- q: question content
- a: answer content

## using

- Type: `object`

A part to point out that who is using your project. Of course, it's useless for a new project.

- `using.name`: faq's title, default is `FAQ`
- `using.list`: A array contains the `FAQ`'s list.

Each object in `faq.list` in should contains:

- name: project's name
- username: project's author's github's username
- description: project's description

## contributing

- Type: `boolean`
- Default: `true`

A part to let visitors know that how to contribute.

## author

- Type: `object`

For author's part

- `author.name`: default is `username`'s uppercase.
- `author.website`: author's website url
- `author.twitter`: author's twitter
