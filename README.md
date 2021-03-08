# react-root-context

# React Root Context
If you want to use React Context to separate the state from components, it can be challenging to manage contexts for the multiple data sources.
This small library helps to create the root parenst single from children contexts, and pull the data up in separate contexts.

## Installation

```sh
npm install react-root-context
```

## Use
You need to create a React root context and pass it as a parameter to RootContext.
This wraps around your children contexts, providing single parent RootContext.

```js
import RootContext from 'react-root-context';
const root = React.createContext(null);
...

export default () => (
  <RootContext rootContext={root}>
    <App />
  </RootContext>
);
```

Example: [codesandbox]()

```js
import React, { useContext, useEffect } from "react";
import RootContext from "react-root-contexts";

const root = React.createContext(null);
const childContext1 = React.createContext(null);
const childContext2 = React.createContext(null);

const B = () => {
  const value1 = useContext(childContext1);
  return (
    <div>
      B=
      {value1}
    </div>
  );
};

const C = () => {
  const value2 = useContext(childContext2);
  return (
    <div>
      C=
      {value2}
    </div>
  );
};

function App() {
  const rc = useContext(root);
  useEffect(() => {
    rc.addChildrenContexts(["b", "c"], [childContext1, childContext2]);
  });
  return (
    <div className="App">
      <B />
      <C />
    </div>
  );
}

export default () => (
  <RootContext root={root}>
    <App />
  </RootContext>
);
```
