# Phresh Frontend

! Code on website is not valid, check `codesandbox` code

Based on [Tutorial](https://www.jeffastor.com/blog/phresh-frontend-bootstrapping-a-react-app#project-structure) Jeff Astor.

Uses React17 since some packages (`@elastic/datemath` , `@elastic/eui`) do not support the latest React18.
Package `framer-motion` version is fixed as `6.5.1` because it's last version with `React17` support.

Bare `npm` is used instead of `yarn`.

## Initial setup (for tutorial purposes)

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
