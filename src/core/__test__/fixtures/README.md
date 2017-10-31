{{#if logo}}
<p align="center">
  <img alt="logo.svg" width="{{logo.width}}" src="https://cdn.rawgit.com/{{ username }}/{{ name }}/master/{{logo.path}}">
</p>

<p align="center">
{{description}}
</p>
{{else}}
# {{ name }}
> {{ description }}
  {{/if}}
{{#if badges}}

## Badges

{{#nospace}}
  {{#nobreak}}
    {{#if badges.version}}
      [![NPM version](https://img.shields.io/npm/v/{{ name }}.svg?style=flat)](https://npmjs.com/package/{{ name }})&nbsp;
    {{/if}}
    {{#if badges.downloads}}
      [![NPM downloads](https://img.shields.io/npm/dm/{{ name }}.svg?style=flat)](https://npmjs.com/package/{{ name }})&nbsp;
    {{/if}}
    {{#if badges.ci}}
      [![CircleCI](https://circleci.com/gh/{{ username }}/{{ name }}/tree/master.svg?style=shield)](https://circleci.com/gh/{{ username }}/{{ name }}/tree/master)&nbsp;
    {{/if}}
    {{#if badges.coverage}}
      [![codecov](https://codecov.io/gh/{{ username }}/{{ name }}/branch/master/graph/badge.svg)](https://codecov.io/gh/{{ username }}/{{ name }})&nbsp;
    {{/if}}
    {{#if badges.donate}}
      [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/{{ username }}/donate)
    {{/if}}
  {{/nobreak}}
{{/nospace}}

{{/if}}
{{#if install}}
  {{#noindent}}

    ## {{#trim}}{{#if install.name}} {{install.name}} {{else}} Install {{/if}}{{/trim}}

    Install _{{ name }}_:

    {{#if install.yarn}}
      ```bash
      # Either globally
      yarn global add {{ name }}
      # Or locally (preferred)
      yarn add {{ name }} --dev
      ```
    {{/if}}

    {{#if install.npm}}
      or, If you use `npm`:

      ```bash
      npm i {{ name }} -g
      npm i {{ name }} --save-dev
      ```
    {{/if}}
  {{/noindent}}
{{/if}}
{{#if usage}}
  {{#noindent}}

    ## {{#trim}}{{#if usage.name}} {{usage.name}} {{else}} Usage {{/if}}{{/trim}}

    ```js
    const {{ camelize name }} = require('{{name}}')

    {{ camelize name }}()
    //=> foo
    ```
  {{/noindent}}
{{/if}}
{{#if faq}}
  {{#noindent}}

    ## {{#trim}}{{#if faq.name}} {{faq.name}} {{else}} FAQ {{/if}}{{/trim}}
    {{#each faq.list as |faq|}}

      <details>
        <summary>{{ faq.q }}</summary>
        <br>
        {{ faq.a }}
      </details>

    {{/each}}
  {{/noindent}}Eah
{{/if}}
{{#if using}}
  {{#noindent}}

    ## {{#trim}}{{#if using.name}} {{faq.name}} {{else}} Who is using {{ name }}? {{/if}}{{/trim}}

    {{#each using.list as |using|}}
      - [{{using.name}}](https://github.com/{{using.username}}/{{name}}) - {{using.description}}.
    {{/each}}
    - Feel free to submit yours via pull request :D
  {{/noindent}}
{{/if}}
{{#if contributing}}
  {{#noindent}}

    ## Contributing

    1. Fork it!
    2. Create your feature branch: `git checkout -b my-new-feature`
    3. Commit your changes: `git commit -am 'Add some feature'`
    4. Push to the branch: `git push origin my-new-feature`
    5. Submit a pull request :D
  {{/noindent}}
{{/if}}
{{#if author}}
  {{#noindent}}

    ## Author

    **{{ name }}** © [{{ author.name }}](https://github.com/{{ username }}), Released under the [MIT](./LICENSE) License.
    <br>
    Authored and maintained by {{ author.name }} with help from contributors ([list](https://github.com/{{ username }}/{{ name }}/contributors)).

    > [{{normalizeurl
      author.website}}]({{ author.website }}) · GitHub [@{{ author.name }}](https://github.com/{{ username }}){{#if
      author.twitter}} · Twitter [@{{ author.twitter }}](https://twitter.com/{{ author.twitter }}) {{/if}}
  {{/noindent}}
{{/if}}
