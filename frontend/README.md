# Phresh Frontend

! Code on website is not valid, check `codesandbox` code

Based on [Tutorial](https://www.jeffastor.com/blog/phresh-frontend-bootstrapping-a-react-app#project-structure) Jeff Astor.

Uses React17 since some packages (`@elastic/datemath` , `@elastic/eui`) do not support the latest React18.
Package `framer-motion` version is fixed as `6.5.1` because it's last version with `React17` support.

Bare `npm` is used instead of `yarn`.

Code is not stable and most of dependencies are deprecated.

`npm install` output:
```bash
npm WARN deprecated @types/vfile-message@2.0.0: This is a stub types definition. vfile-message provides its own type definitions, so you do not need this installed.
npm WARN deprecated stable@0.1.8: Modern JS already guarantees Array#sort() is a stable sort, so this library is deprecated. See the compatibility table on MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#browser_compatibility
npm WARN deprecated w3c-hr-time@1.0.2: Use your platform's native performance.now() and performance.timeOrigin.
npm WARN deprecated @hapi/topo@3.1.6: This version has been deprecated and is no longer supported or maintained
npm WARN deprecated @hapi/bourne@1.3.2: This version has been deprecated and is no longer supported or maintained
npm WARN deprecated @hapi/address@2.1.4: Moved to 'npm install @sideway/address'
npm WARN deprecated querystring@0.2.0: The querystring API is considered Legacy. new code should use the URLSearchParams API instead.
npm WARN deprecated @hapi/hoek@8.5.1: This version has been deprecated and is no longer supported or maintained
npm WARN deprecated acorn-dynamic-import@4.0.0: This is probably built in to whatever tool you're using. If you still need it... idk
npm WARN deprecated @hapi/joi@15.1.1: Switch to 'npm install joi'
npm WARN deprecated svgo@1.3.2: This SVGO version is no longer supported. Upgrade to v2.x.x.
npm WARN deprecated source-map-url@0.4.1: See https://github.com/lydell/source-map-url#deprecated
npm WARN deprecated urix@0.1.0: Please see https://github.com/lydell/urix#deprecated
npm WARN deprecated resolve-url@0.2.1: https://github.com/lydell/resolve-url#deprecated
npm WARN deprecated source-map-resolve@0.5.3: See https://github.com/lydell/source-map-resolve#deprecated
npm WARN deprecated har-validator@5.1.5: this library is no longer supported
npm WARN deprecated trim@0.0.1: Use String.prototype.trim() instead
npm WARN deprecated chokidar@2.1.8: Chokidar 2 does not receive security updates since 2019. Upgrade to chokidar 3 with 15x fewer dependencies
npm WARN deprecated flatten@1.0.3: flatten is deprecated in favor of utility frameworks such as lodash.
npm WARN deprecated request-promise-native@1.0.9: request-promise-native has been deprecated because it extends the now deprecated request package, see https://github.com/request/request/issues/3142
npm WARN deprecated left-pad@1.3.0: use String.prototype.padStart()
npm WARN deprecated request@2.88.2: request has been deprecated, see https://github.com/request/request/issues/3142
npm WARN deprecated sane@4.1.0: some dependency vulnerabilities fixed, support for node < 10 dropped, and newer ECMAScript syntax/features added
npm WARN deprecated html-webpack-plugin@4.0.0-beta.5: please switch to a stable version
npm WARN deprecated eslint-loader@2.1.2: This loader has been deprecated. Please use eslint-webpack-plugin
npm WARN deprecated babel-eslint@10.0.1: babel-eslint is now @babel/eslint-parser. This package will no longer receive updates.
npm WARN deprecated uuid@3.4.0: Please upgrade  to version 7 or higher.  Older versions may use Math.random() in certain circumstances, which is known to be problematic.  See https://v8.dev/blog/math-random for details.
npm WARN deprecated highlight.js@9.18.5: Support has ended for 9.x series. Upgrade to @latest
npm WARN deprecated axios@0.19.2: Critical security vulnerability fixed in v0.21.1. For more information, see https://github.com/axios/axios/pull/3410
npm WARN deprecated core-js@2.6.12: core-js@<3.23.3 is no longer maintained and not recommended for usage due to the number of issues. Because of the V8 engine whims, feature detection in old core-js versions could cause a slowdown up to 100x even if nothing is polyfilled. Some versions have web compatibility issues. Please, upgrade your dependencies to the actual version of core-js.

```

## Initial setup (for tutorial purposes)

### React 16 (as in tutorial)

1. Install `npm`
2. Run `npx create-react-app frontend`
3. Go to `frontend` folder
4. Remove `package-lock.json` and `node_modules`
5. Open `package.json` and copy dependencies from `codesandbox` `package.json`
6. Run `npm install`
7. Open `src/index.js` and change it's content to
```js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
    <App />,
  document.getElementById('root')
);
```

### React 17
[How to setup React 17][https://github.com/facebook/create-react-app/issues/12269#issuecomment-1154101796]

1. Install `npm`
2. Run `npx create-react-app frontend`
3. Go to `frontend` folder
4. Remove `package-lock.json` and `node_modules`
5. Open `package.json` and change `react` and `react-dom` version to `17.0.2`
6. Add `"framer-motion": "^6.5.1"` to dependencies
7. Run `npm install`
8. Run `npm add styled-components react-helmet history react-router-dom @elastic/eui @elastic/datemath moment redux react-redux redux-thunk axios`
9. Open `src/index.js` and change it's content to
```js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
    <App />,
  document.getElementById('root')
);
```

## Run

For `React 16` use command `export NODE_OPTIONS=--openssl-legacy-provider && npm start` to avoid `ERR_OSSL_EVP_UNSUPPORTED` error

[source](https://ao.foss.wtf/questions/69394632/webpack-build-failing-with-err-ossl-evp-unsupported)
