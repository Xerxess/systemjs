SystemJS
===========

A minimal universal ES6 spec-compilant module loader.

A small (10KB minfied) extension library for the new `System` ES6 loader, which will soon be native to browsers.

The extension adds the following features to the existing `System` loader:
* Dynamically load ES6 modules, AMD, CommonJS and global scripts detecting the format automatically, or with format hints.
* A plugin system for creating modular custom loading rules.

Designed to work with the [ES6 Module Loader polyfill](https://github.com/ModuleLoader/es6-module-loader) (17KB minified) for a combined footprint of 28KB.

Runs in the browser and NodeJS.

Getting Started
---

### Including the Loader

Download [`es6-module-loader.js`](https://github.com/ModuleLoader/es6-module-loader/blob/master/dist/es6-module-loader.js) and [`traceur.js`](https://github.com/ModuleLoader/es6-module-loader/blob/master/dist/traceur.js) from the [ES6-loader polyfill](https://github.com/ModuleLoader/es6-module-loader) and locate them in the same folder as `system.js` from this repo.

Then include `system.js` with a script tag in the page:

```html
  <script src="system.js"></script>
```

`es6-module-loader.js` will then be included automatically and the [Traceur](https://github.com/google/traceur-compiler) parser is dynamically included from `traceur.js` when loading an ES6 module only.

### Write and Load a Module

app/test.js:
```javascript
  define(function() {
    return {
      isAMD: 'yup'
    };
  });
```

In the `index.html` page we can then load a module from the baseURL folder with:

```html
<script>
  System.import('app/test').then(function(test) {
    console.log(test.isAMD); // yup
  });
</script>
```
The module file at `app/test.js` will be loaded, its module format detected and any dependencies in turn loaded before returning the defined module.

The entire loading class is implemented identically to the ES6 module specification, with the module format detection rules being the only addition.

> _Note that when running locally, ensure you are running from a local server or a browser with local XHR requests enabled. If not you will get an error message._

> _For Chrome on Mac, you can run it with: `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --allow-file-access-from-files &> /dev/null &`_

> _In Firefox this requires navigating to `about:config`, entering `security.fileuri.strict_origin_policy` in the filter box and toggling the option to false._


Working with Modules
----

> Most of what is discussed in this section is simply the basics of using the new `System` loader. Only the extra module format support and plugin system is additional to this browser specification.

Modules are dependency-managed JavaScript files. They are loaded by a **module name** reference.

Each module name directly corresponds to a JavaScript file URL, but without the `.js` extension, and with baseURL rules, mostly identical to RequireJS.

The default baseURL rule is:

<pre>
  my/module -> resolve(baseURL, 'my/module') + '.js'
</pre>

### Setting the baseURL

By default, the baseURL is set to the current page, but it can be changed with:

```html
  <script>
    System.baseURL = '/js/';
  </script>
```

### Paths Configuration

The `System` loader comes with a paths configuation system. While not part of SystemJS, it is described here for completion.

_Note: The implementation is currently in discussion and not specified, thus it is subject to change._

One can use the baseURL to reference library scripts like `jquery`, `underscore` etc.

It is then better to have local application scripts in their own separate folder, which can be set up with paths config:

```javascript
  System.paths['~/*'] = '/app/*.js';
```

Non-wildcard paths are also supported, and the most specific rule will always be used.

In this example, we can now write local application code in its own folder (`app`), without conflict with library code (`js`):

app/main.js:
```javascript
  define(['jquery'], function($) {
    return {
      // ...
    };
  });
```

index.html:
```html
  <script> System.paths['~/*'] = '/app/*.js'; </script>
  <script>
    System.import('~/main');
  </script>
```

### Writing Modular Code

It is recommended to write modular code in either AMD or CommonJS. Both are equally supported by SystemJS, with the format detected automatically.

For example, we can write modular CommonJS:

app/app.js:
```javascript
  var subModule = require('./submodule/submodule');
  //...
  subModule.someMethod();
  //...
```

app/submodule/submodule.js:
```javascript
  exports.someMethod = function() {

  }
```

and load this with `System.import('~/app')` in the page.

> Note: always use relative requires of the form `./` or `../` to reference modules in the same package. This is important within any package for modularity.

### Module Format Hints

The module format detection is well-tested over a large variety of libraries including complex UMD patterns. It will detect in order ES6, AMD, then CommonJS and fall back to global modules.

It is still impossible to write 100% accurate detection though.

For this reason, it is also possible to write modules with the module format specified. The module format is provided as a string, as the first line of code (excluding comments) in a file:

```javascript
"amd";
define(['some-dep'], function() {
  return {};
});
```

Similarly, `"global"`, `"cjs"` and `"es6"` can be used in module files to set the detection.

It is recommended to use a format hint if writing a new AMD or CommonJS module for use in SystemJS, while leaving out the format hint for ES6 modules, allowing for an easier transition as they become the standard.

### Loading ES6 Modules

SystemJS is an ES6 module loader. It will detect and load ES6 modules, parsing them with Traceur dynamically. This allows for dynamic loading of ES6 without a build step, although a build step still needs to be run to transpile ES6 back to ES5 and AMD for production.

A very simple example:

app/es6-file.js:
```javascript
  export class q {
    constructor() {
      this.es6 = 'yay';
    }
  }
```

```html
  <script>
    System.import('es6-file').then(function(m) {
      console.log(new m.q().es6); // yay
    });
  </script>
```

ES6 modules define named exports, provided as getters on a special immutable `Module` object.

For further examples of loading ES6 modules, see the [ES6 Module Loader polyfill documentation](https://github.com/ModuleLoader/es6-module-loader).

For examples of build workflows, see the [jspm CLI documentation](https://github.com/jspm/jspm-cli#building-application-code).

### Module Forwarding

Consider the structure of the `js` folder for shared libraries. At some point we end up combining module files with package folders, something like:

```
- js/
  - jquery.js
  - underscore.js
  - bootstrap
    - js
      - bootstrap.js  
- app/
  - app.js
```

The question then is how do we load the `bootstrap` folder as simply as the module files?

`System.import('bootstrap/js/bootstrap')` is far too much typing...

A good way of handling this is to provide a re-export module at a shortcut location:

js/bootstrap.js:
```javascript
  export * from './bootstrap/js/bootstrap';
```

This is an ES6 wildcard re-export, which is like a redirect for modules.

In this way we can have clean names for module loading:

```javascript
  System.import('bootstrap').then(function() {

  });
```

SystemJS handles this scenario as an ES6 module loading exception, without needing to do full ES6 parsing.

When in production, one would build all these files into one, so that the redirects don't result in additional requests.

### Loading Global Scripts

#### Automatic Global Detection

When no module format is detected, or when the `"global"` hint is present, modules are treated as global scripts.

Any properties written to the global object (`window`, `this`, or the outer scope) will be detected and stored. Then any dependencies of the global will have these properties rewritten before execution.

In this way, global collissions are avoided. Multiple versions of jQuery can run on the same page, for example.

When only one new property is added to the global object, that is taken to be the global module.

When many properties are written to the global object, the collection of those properties becomes the global module.

This provides loading as expected in the majority of cases:

app/sample-global.js:
```javascript
  hello = 'world';
```

```javascript
  System.import('~/sample-global').then(function(sampleGlobal) {
    console.log(sampleGlobal); // 'world'
  });
```

#### Specifying the Global Export Name

The automatic detection handles most cases, but there are still scenarios where it is necessary to define the exported global name.

To specify the exported name, provide an `"export"` string, directly beneath the `"global"` hint.

app/my-global.js:
```javascript
  "global";
  "export MyGlobal.obj";

  window.MyGlobal = {
    obj: "hello world"
  };

  window.__some__other_global = true;
```

```javascript
  System.import('~/my-global').then(function(m) {
    console.log(m); // 'hello world'
  });
```

#### Specifying Global Imports

Global modules can also specify dependencies using this same hint system.

We write an `"import"` string, directly beneath the `"global"` hint.

js/jquery-plugin.js:
```javascript
  "global";
  "import jquery";
  "export $";

  $.fn.myPlugin = function() {
    // ...
  }
```

```javascript
  System.import('jquery-plugin').then(function($) {
    $('#some-el').myPlugin();
  });
```

The primary use of all of having this information in the module is that global scripts can be converted into modular scripts with complete accuracy by an automated process based on simple configuration instead of manual conversion.

### AMD Compatibility Layer

As part of providing AMD support, SystemJS provides a small AMD compatibility layer, with the goal of supporting as much of the RequireJS test suite as possible to ensure functioning of existing AMD code.

To create the `requirejs` and `require` globals as AMD globals, simply include the following `<script>` tag immediately after the inclusion of the System loader:

```html
  <script>
    require = requirejs = System.require;
  </script>
```

This should replicate a fair amount of the dynamic RequireJS functionality, and support is improving over time.

_Note that AMD-style plugins are not supported._


Plugins
------

Plugins can be created to handle alternative loading scenarios, including loading assets such as CSS or images, and providing custom transpilation scenarios.

Plugins are indicated by `!` syntax, which unlike RequireJS is appended at the end of the module name, not the beginning.

The plugin name is just a module name itself, and if not specified, is assumed to be the extension name of the module.

Supported Plugins:

* CSS `System.import('my/file.css!')`
* Image `System.import('some/image.png!image')`
* JSON `System.import('some/data.json!').then(function(json){})`
* Markdown `System.import('~/some/project/README.md!').then(function(html) {})`
* Text `System.import('some/text.txt!text').then(function(text) {})`
* WebFont `System.import('google Port Lligat Slab, Droid Sans !font')`

Links will be provided soon!

### Creating Plugins

A plugin is just a set of overrides for the loader hooks of the ES6 module specification.

These hooks represent the loading cycle for a module: `normalize`, `locate`, `fetch`, `translate` and `instantiate`.

Read more on the loader hooks at the [ES6 Module Loader polyfill page](https://github.com/ModuleLoader/es6-module-loader#creating-a-custom-loader).

#### Sample CoffeeScript Plugin

For example, we can write a CoffeeScript plugin with the following (CommonJS as an example, any module format works fine):

js/coffee.js:
```javascript
  var CoffeeScript = require('coffeescript');

  exports.translate = function(load) {
    return CoffeeScript.compile(load.source);
  }
```

By overriding the `translate` hook, we now support CoffeeScript loading with:

```
 - js/
   - coffee.js             our plugin above
   - coffeescript.js       the CoffeeScript compiler
 - app/
   - main.coffee
```

Then assuming we have a `~` [path config](#Paths Configuration) set to the `/app` folder, and the baseURL set to `/js/`, we can write:

```javascript
  System.import('~/main.coffee!').then(function(main) {
    // main is now loaded from CoffeeScript
  });
```

#### Sample CSS Plugin

A CSS plugin, on the other hand, would override the fetch hook:

js/css.js:
```javascript
  exports.fetch = function(load) {
    // return a thenable for fetching (as per specification)
    return {
      then: function(resolve, reject) {
        var cssFile = load.address;

        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssFile;
        link.onload = resolve;

        document.head.appendChild(link);
      }
    };
  }
```

Each loader hook can either return directly or return a thenable for the value.

The other loader hooks are also treated identically to the specification.

Google Group
---

Join ... for support questions and discussion relating to SystemJS.


License
---

MIT

