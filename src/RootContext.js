import React from "react";

let rootContext = null;

const createRootContext = () => {
  return React.createContext({
    addInnerContext: contextId => {},
    getInnerContext: contextId => {},
    addMultipleInnerContexts: contextIds => {},
    removeMultipleInnerContexts: contextIds => {},
    removeInnerContext: contextId => {},
    setInnerState: (contextId, state) => {},
    getInnerState: contextId => {}
  });
};

const getRootContext = () => {
  if (rootContext) {
    return rootContext;
  }
  console.log("creating root context");
  rootContext = createRootContext();
  return rootContext;
};

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.addInnerContext = this.addInnerContext.bind(this);
    this.getInnerContext = this.getInnerContext.bind(this);
    this.setInnerState = this.setInnerState.bind(this);
    this.getInnerState = this.getInnerState.bind(this);
    this.removeInnerContext = this.removeInnerContext.bind(this);
    this.addMultipleInnerContexts = this.addMultipleInnerContexts.bind(this);
    this.removeMultipleInnerContexts = this.removeMultipleInnerContexts.bind(
      this
    );

    this.state = {
      innerContexts: {},
      root: {
        addInnerContext: this.addInnerContext,
        getInnerContext: this.getInnerContext,
        removeInnerContext: this.removeInnerContext,
        setInnerState: this.setInnerState,
        getInnerState: this.getInnerState,
        addMultipleInnerContexts: this.addMultipleInnerContexts,
        removeMultipleInnerContexts: this.removeMultipleInnerContexts
      }
    };
  }
  removeMultipleInnerContexts(contextIds) {
    this.setState((state, props) => {
      let st = { ...state.innerContexts };
      for (let k of contextIds) {
        delete st[k];
      }
      return { innerContexts: st };
    });
  }
  addMultipleInnerContexts(contextIds, optContexts) {
    //avoid redraws by doing adding and removing more contexts at once
    let contexts = {};
    this.setState((state, props) => {
      let st = { ...state.innerContexts };
      for (let j = 0; j < contextIds.length; j++) {
        let k = contextIds[j];
        let ex = state.innerContexts[k] && state.innerContexts[k].context;
        if (ex) continue;
        let ctx =
          optContexts && optContexts[j]
            ? optContexts[j]
            : React.createContext(null);
        st[k] = { context: ctx, state: null };
        contexts[k] = ctx;
      }
      return { innerContexts: st };
    });
    return contexts;
  }
  addInnerContext(contextId, optContext) {
    let ctx = optContext ? optContext : React.createContext(null);
    this.setState((state, props) => {
      let ex =
        state.innerContexts[contextId] &&
        state.innerContexts[contextId].context;
      if (ex) return {};

      let st = { ...state.innerContexts };
      st[contextId] = { context: ctx, state: null };
      return { innerContexts: st };
    });
    return ctx;
  }

  removeInnerContext(contextId) {
    this.setState((state, props) => {
      if (!state.innerContexts[contextId]) return null;
      let st = { ...state.innerContexts };
      delete st[contextId];
      return { innerContexts: st };
    });
  }

  getInnerContext(contextId) {
    return (
      this.state.innerContexts[contextId] &&
      this.state.innerContexts[contextId].context
    );
  }

  addProvider(innerProvider, contextId) {
    let PRV = this.getInnerContext(contextId).Provider;
    let innerState = this.state.innerContexts[contextId].state;
    return <PRV value={innerState}>{innerProvider}</PRV>;
  }

  setInnerState(contextId, stateF) {
    this.setState((state, props) => {
      let st = { ...state.innerContexts };
      st[contextId].state = stateF(st[contextId].state);
      return { innerContexts: st };
    });
  }

  getInnerState(contextId) {
    return (
      this.state.innerContexts[contextId] &&
      this.state.innerContexts[contextId].state
    );
  }

  render() {
    let currProvider = this.props.children;
    for (let cid in this.state.innerContexts) {
      currProvider = this.addProvider(currProvider, cid);
    }

    /*
Important! 
If you use this library to create another library that will share the context with the application, you need to provide the rootContext as a param.
The reason is that it is not possible to share the variables between the modules in WebPack, so the RootContext variable provider will not give any value in your lib
*/
    let Provider = this.props.rootContext
      ? this.props.rootContext.Provider
      : getRootContext().Provider;

    return <Provider value={this.state.root}>{currProvider}</Provider>;
  }

  get rootContext() {
    return getRootContext();
  }

  static get rootContext() {
    return getRootContext();
  }
}