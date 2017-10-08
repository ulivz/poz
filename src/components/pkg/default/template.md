```handlebars
{
  "name": "{{ name }}",
  "version": "0.0.0",
  "description": "{{description}}",
  "repository": {
    "url": "{{ username }}/{{ name }}",
    "type": "git"
  },
  "main": "{{#if compile}}dist/index.common.js{{else}}index.js{{/if}}",
  {{#if cli}}
    "bin": "cli.js",
  {{/if}}
  "files": [{{#if compile}}
    "dist"{{else}}"index.js"{{/if}}{{#if cli}}, 
    "cli.js"{{/if}}
  ],
  "scripts": {
    "test": "jest --coverage{{#compare eslint '!==' 'disable'}}npm run lint{{/compare}}{{#if ut}}&& jest{{else}}&& echo 'no tests!'{{/if}}"{{#and ut coverage}},
    "test:cov": "jest --coverage{{#compare eslint '!==' 'disable'}} && npm run lint{{/compare}}"{{/and}}{{#compare eslint '!==' 'disable'}},
    "lint": "{{eslint}}",
    "lint:fix": "npm run lint -- -fix"{{/compare}}{{#if compile}},
    "prepublish": "npm run build",
    "build": "bili --filename index"{{/if}}{{#if poi}},
    "example": "poi",
    "build:example": "poi build",
    "gh": "gh-pages -d example/dist",
    "deploy": "npm run build:example && npm run gh"{{/if}}
  },
  "author" : "{{ username }} <{{ email }}>",
  "license": "MIT",{{#if poi}}
  "poi": {
    "entry": "example/index.js",
    "dist": "example/dist",
    "homepage": "/"
  },{{/if}}{{#if ut}}
  "jest": {
    "testEnvironment": "node"
  },{{/if}}
  "engines": {
     "node": ">={{#if nodeVersion}}{{ nodeVersion }}{{else}}4{{/if}}"
  },{{#and compile '&&' ut}}
  "babel": {
    "env": {
      "test": {
        "presets": [
          ["env", {
            "targets": {
              "node": "current"
            }
          }]
        ]
      }
    }
  },{{/and}}
  "dependencies": { {{#if cli}}
    "cac": "^4.0.0"{{/if}}
  },
  "devDependencies": { {{#if ut}}
    "jest-cli": "^19.0.0",{{/if}}{{#compare eslint '===' 'xo'}}
    "eslint-config-rem": "^3.0.0",
    "xo": "^0.18.0",{{/compare}}{{#compare eslint '===' 'standard'}}
    "standard": "^10.0.0",{{/compare}} {{#if compile}} {{#compare eslint '!==' 'disable'}}
    "babel-preset-env": "^1.4.0",{{/compare}}{{#if poi}}
    "gh-pages": "^1.0.0",
    "poi": "^9.1.4",{{/if}}
    "bili": "^0.17.0"{{/if}}
  }, {{#compare eslint '===' 'xo'}}
  "xo": {
    "extends": "rem" {{#if ut}}, {
    "envs": [
        "jest"
      ]
    } {{/if}} 
  } {{/compare}}
}
```
