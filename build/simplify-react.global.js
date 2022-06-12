var React = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/react/index.ts
  var react_exports = {};
  __export(react_exports, {
    createElement: () => createElement,
    useState: () => useState
  });

  // packages/shared/src/ReactSymbols.ts
  var REACT_ELEMENT_TYPE = Symbol.for("react.element");

  // packages/react/src/ReactCurrentOwner.ts
  var ReactCurrentOwner = {
    current: null
  };
  var ReactCurrentOwner_default = ReactCurrentOwner;

  // packages/react/src/ReactElement.ts
  function createElement(type, config, children) {
    const props = {};
    let key = null;
    let ref = null;
    let self = null;
    let source = null;
    if (config != null) {
      for (const key2 in config) {
        if (config.hasOwnProperty(key2)) {
          props[key2] = config[key2];
        }
      }
    }
    const childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
      props.children = children;
    } else {
      const childArray = new Array(childrenLength);
      for (let i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 2];
      }
      props.children = childArray;
    }
    return ReactElement(type, key, ref, self, source, ReactCurrentOwner_default.current, props);
  }
  var ReactElement = function(type, key, ref, self, source, owner, props) {
    const element = {
      $$typeof: REACT_ELEMENT_TYPE,
      type,
      key,
      ref,
      props,
      _owner: owner
    };
    return element;
  };

  // packages/react/src/ReactCurrentDispatcher.ts
  var ReactCurrentDispatcher = {
    current: null
  };
  var ReactCurrentDispatcher_default = ReactCurrentDispatcher;

  // packages/react/src/ReactHooks.ts
  function resolveDispatcher() {
    const dispatcher = ReactCurrentDispatcher_default.current;
    return dispatcher;
  }
  function useState(initialState) {
    const dispatcher = resolveDispatcher();
    return dispatcher == null ? void 0 : dispatcher.useState(initialState);
  }
  return __toCommonJS(react_exports);
})();
//# sourceMappingURL=simplify-react.global.js.map
