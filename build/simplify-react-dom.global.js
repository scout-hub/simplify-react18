var ReactDOM = (() => {
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

  // packages/react-dom/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    createRoot: () => createRoot2
  });

  // packages/react-reconciler/src/ReactWorkTags.ts
  var HostRoot = 3;

  // packages/react-reconciler/src/ReactFiber.old.ts
  function createHostRootFiber() {
    return createFiber(HostRoot);
  }
  function createFiber(tag) {
    return new FiberNode(tag);
  }
  var FiberNode = class {
    constructor(tag) {
      this.tag = tag;
      this.type = null;
      this.stateNode = null;
      this.return = null;
      this.sibling = null;
      this.child = null;
      this.index = 0;
      this.alternate = null;
    }
  };

  // packages/react-reconciler/src/ReactFiberRoot.old.ts
  function createFiberRoot(containerInfo, tag) {
    const root = new FiberRootNode(containerInfo);
    const uninitializedFiber = createHostRootFiber();
    root.current = uninitializedFiber;
    uninitializedFiber.stateNode = root;
    return root;
  }
  var FiberRootNode = class {
    constructor(containerInfo) {
      this.containerInfo = containerInfo;
      this.current = null;
      this.finishedWork = null;
    }
  };

  // packages/react-reconciler/src/ReactFiberReconciler.old.ts
  function createContainer(containerInfo, tag) {
    return createFiberRoot(containerInfo, tag);
  }
  function updateContainer(element, container) {
    console.log(element, container);
  }

  // packages/react-reconciler/src/ReactFiberReconciler.ts
  var createContainer2 = createContainer;

  // packages/react-reconciler/src/ReactRootTags.ts
  var ConcurrentRoot = 1;

  // packages/react-dom/src/client/ReactDOMRoot.ts
  function createRoot(container) {
    const root = createContainer2(container, ConcurrentRoot);
    return new ReactDOMRoot(root);
  }
  var ReactDOMRoot = class {
    constructor(internalRoot) {
      this._internalRoot = internalRoot;
    }
    render(children) {
      const root = this._internalRoot;
      updateContainer(children, root);
    }
  };

  // packages/react-dom/src/client/ReactDOM.ts
  function createRoot2(container) {
    return createRoot(container);
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=simplify-react-dom.global.js.map
