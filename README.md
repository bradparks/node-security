<img src="https://i.imgur.com/08h1RM5.png" width="500px" alt="NodeSecurity" />

# NodeSecurity
:key: The easiest way to control what npm modules can access

<a href="https://www.npmjs.org/package/@matthaywardwebdesign/node-security"><img src="https://img.shields.io/npm/v/@matthaywardwebdesign/node-security.svg?style=flat" alt="npm"></a>

**NOTE:** This package has not gone through any form of security testing! **Please do not use it to ensure security at this time.** Issues questioning the feasability of our current approach are still outstanding.
- [https://github.com/matthaywardwebdesign/node-security/issues/7](https://github.com/matthaywardwebdesign/node-security/issues/7)

If you're experienced in this area ( I am not ) please contribute!


## Overview
This repo / package was inspired a Medium post by David Gilbertson - [https://hackernoon.com/npm-package-permissions-an-idea-441a02902d9b](https://hackernoon.com/npm-package-permissions-an-idea-441a02902d9b)

> Imagine a package, created and maintained by npm (or someone equally trustworthy and farsighted). Let’s call it @npm/permissions.

> You would include this @npm/permissions package as the first import in your app, either in a file, or you run your app like node -r @npm/permissions index.js.

> This would override require() to enforce the permissions stated in a package’s package.json permissions property.

With the exception of some small differences, like not using package.json to manage permissions, this package
attempts to accomplish this goal.

## How it works
NodeSecurity works by overriding the Node.JS `require()` function, allowing us to enforce access constraints. 

## Usage

```bash
npm install @matthaywardwebdesign/node-security
```

Firstly include NodeSecurity in your project at the very top of your applications entrypoint (before any other requires) and create a new instance.

```javascript
  const nodesecurity = require( '@matthaywardwebdesign/node-security' );
  const NodeSecurity = new nodesecurity();
```

**Note:** If you're using the ES6 imports you'll need to create a seperate file that is imported at the entrypoint
of your application. Without doing this it won't be possible to configure NodeSecurity before any other modules are loaded.

**Configure NodeSecurity**

```javascript
NodeSecurity.configure({
  /**
   * The 'core' section controls
   * global access to built in modules. By default
   * all core modules are disabled.
   */
  core: {
    fs: true,
    path: true,
    /* You can disable specific module functions */
    os: {
      arch: false,
      cpus: false,
    }
  },
  /**
   * The 'module' section controls
   * per module access to built in modules. This allows
   * us to disable access globally by allow it on a per
   * module basis.
   */
  module: {
    axios: {
      http: true,
      https: true,
    }
  },
  /**
   * The 'env' section controls what environment
   * variables are accessible via process.env
   */
  env: {
    API_KEY: true,
    API_HOST: true,
  }
});
```

:tada: **And you're done!** :tada:

All required / imported modules from this point onwards will have to be allowed by our configuration.

## Example

Here's an example script!

```javascript
/* Import and create a new instance of NodeSecurity */
const nodesecurity = require( '@matthaywardwebdesign/node-security' );
const NodeSecurity = new nodesecurity();

/* Configure NodeSecurity */
NodeSecurity.configure({
  core: {
    /* Define global fs access */
    fs: false,
    /* Enable other core modules we'll need */
    stream: true,
    util: true,
    path: true,
    os: {
      /* Deny access to OS arch */
      arch: false,
    },
    assert: true,
  },
  module: {
    /* Allow fs-extra to access fs */
    'fs-extra': {
      fs: true,
    }
  }
});

/* This won't throw an error as fs-extra is allowed to access fs */
require( 'fs-extra' );

/* Accessing fs directly will throw an error */
require( 'fs' );

/* Accessing os.arch will throw an error */
const os = require( 'os' );
os.arch();
```

## Plugins

You can extend the functionality of NodeSecurity by creating a plugin. For example you could create a plugin to allow http/s requests to only be made to specific servers. 

An example plugin can be found at `src/plugins/NodeSecurityPlugin.js`

Plugins work by providing a way to override the default functionality of a core module. By default every Node core module (fs, os, etc) has a plugin loaded that allows for module methods to be disabled.

Including your own plugin is as simple as adding a plugins section to your configuration.

```javascript
plugins: {
  http: MyHTTPPlugin
}
```

## Contributing

Building the package

```
npm run build
```

Running the test suite

```bash
npm test
```

## Ideas
- Include a set of default plugins that allow for more granular filesystem and network access.