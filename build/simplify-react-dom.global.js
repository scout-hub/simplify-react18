var ReactDOM = (function (exports, React) {
    'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n["default"] = e;
        return Object.freeze(n);
    }

    var React__namespace = /*#__PURE__*/_interopNamespace(React);

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-27 09:45:14
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-06-12 22:05:13
     */
    const assign = Object.assign;
    const isObject = (val) => val !== null && typeof val === "object";
    const isString = (val) => typeof val === "string";
    const isNumber = (val) => typeof val === "number";
    const isFunction = (val) => typeof val === "function";
    const isArray = Array.isArray;

    const NoFlags = 0b00000000000000000000000000;
    const Placement = 0b00000000000000000000000010;

    // Function组件标记
    const FunctionComponent = 0;
    // Before we know whether it is function or class 还不知道是function还是class类型
    const IndeterminateComponent = 2;
    // 当前应用的根节点
    const HostRoot = 3;
    // 原生dom元素对应的fiber节点类型
    const HostComponent = 5;
    // 文本类型
    const HostText = 6;

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-16 21:41:18
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-30 17:37:17
     */
    /**
     * @description: 创建一个标记为HostRoot的fiber树根节点
     * @return fiber节点
     */
    function createHostRootFiber() {
        return createFiber(HostRoot, null, null);
    }
    /**
     * @description: 创建fiber节点
     * @param tag 元素类型
     * @param pendingProps 元素属性
     * @return fiber节点
     */
    function createFiber(tag, pendingProps, key) {
        return new FiberNode(tag, pendingProps, key);
    }
    // Fiber类
    class FiberNode {
        constructor(tag, pendingProps, key) {
            this.tag = tag;
            this.pendingProps = pendingProps;
            this.key = key;
            this.type = null;
            this.elementType = null;
            this.stateNode = null;
            this.return = null;
            this.sibling = null;
            this.child = null;
            this.index = 0;
            this.alternate = null;
            this.updateQueue = null;
            this.memoizedState = null;
            this.flags = NoFlags;
        }
    }
    /**
     * @description: 创建内存中的fiber，即为当前节点创建一个新的fiber节点去工作（双缓存机制）
     * @param current 当前fiber节点
     * @return 内存中的fiber树
     */
    function createWorkInProgress(current, pendingProps) {
        let workInProgress = current.alternate;
        if (workInProgress === null) {
            workInProgress = createFiber(current.tag, pendingProps, current.key);
            workInProgress.elementType = current.elementType;
            workInProgress.type = current.type;
            workInProgress.stateNode = current.stateNode;
            workInProgress.alternate = current;
            current.alternate = workInProgress;
        }
        workInProgress.child = current.child;
        workInProgress.sibling = current.sibling;
        workInProgress.index = current.index;
        workInProgress.memoizedProps = current.memoizedProps;
        workInProgress.memoizedState = current.memoizedState;
        workInProgress.updateQueue = current.updateQueue;
        return workInProgress;
    }
    /**
     * @description: 创建元素的fiber节点
     */
    function createFiberFromElement(element) {
        const { type, key } = element;
        let pendingProps = element.props;
        const fiber = createFiberFromTypeAndProps(type, key, pendingProps);
        return fiber;
    }
    function createFiberFromTypeAndProps(type, key, pendingProps) {
        let fiberTag = IndeterminateComponent;
        if (isString(type)) {
            // 说明是普通元素节点
            fiberTag = HostComponent;
        }
        const fiber = createFiber(fiberTag, pendingProps, key);
        fiber.elementType = type;
        fiber.type = type;
        return fiber;
    }
    /**
     * @description: 创建文本节点对应的fiber
     */
    function createFiberFromText(content) {
        const fiber = createFiber(HostText, content, null);
        return fiber;
    }

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-26 14:43:08
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-30 14:44:37
     */
    const UpdateState = 0;
    /**
     *
     * @returns update的情况
     * 1、ReactDOM.render —— HostRoot
     * 2、this.setState —— ClassComponent
     * 3、this.forceUpdate —— ClassComponent
     * 4、useState —— FunctionComponent
     * 5、useReducer —— FunctionComponent
     */
    /**
     * @description: 初始化当前fiber的updateQueue
     * @param fiber
     */
    function initializeUpdateQueue(fiber) {
        const queue = {
            // 本次更新前该Fiber节点的state，Update基于该state计算更新后的state
            baseState: fiber.memoizedState,
            // 本次更新前该Fiber节点已保存的Update。以链表形式存在，链表头为firstBaseUpdate，链表尾为lastBaseUpdate。
            firstBaseUpdate: null,
            lastBaseUpdate: null,
            shared: {
                // 触发更新时，产生的Update会保存在shared.pending中形成单向环状链表。当由Update计算state时这个环会被剪开并连接在lastBaseUpdate后面。
                pending: null,
            },
            effects: null,
        };
        fiber.updateQueue = queue;
    }
    /**
     * @description: 创建Update，保存更新状态相关内容的对象
     */
    function createUpdate() {
        const update = {
            payload: null,
            callback: null,
            next: null,
            tag: UpdateState, // 更新的类型
        };
        return update;
    }
    /**
     * @description: 向当前fiber节点的updateQueue中添加Update
     * @param fiber
     * @param update
     */
    function enqueueUpdate(fiber, update) {
        const updateQueue = fiber.updateQueue;
        if (updateQueue === null)
            return;
        const sharedQueue = updateQueue.shared;
        const pending = sharedQueue.pending;
        // 构建循环链表
        if (pending === null) {
            update.next = update;
        }
        // shared.pending 会保证始终指向最后一个插入的update
        sharedQueue.pending = update;
    }
    function processUpdateQueue(workInProgress) {
        const queue = workInProgress.updateQueue;
        let firstBaseUpdate = queue.firstBaseUpdate;
        let lastBaseUpdate = queue.lastBaseUpdate;
        // pending始终指向的是最后一个添加进来的Update
        let pendingQueue = queue.shared.pending;
        // 检测shared.pending是否存在进行中的update将他们转移到baseQueue
        if (pendingQueue !== null) {
            queue.shared.pending = null;
            const lastPendingUpdate = pendingQueue;
            // 获取第一个Update
            const firstPendingUpdate = lastPendingUpdate.next;
            // pendingQueye队列是循环的。断开第一个和最后一个之间的指针，使其是非循环的
            lastPendingUpdate.next = null;
            // 将shared.pending上的update接到baseUpdate链表上
            if (lastBaseUpdate === null) {
                firstBaseUpdate = firstPendingUpdate;
            }
            else {
                firstBaseUpdate = lastBaseUpdate.next;
            }
            lastBaseUpdate = lastPendingUpdate;
            const current = workInProgress.alternate;
            // 如果current也存在，需要将current也进行同样的处理，同fiber双缓存相似
            // Fiber节点最多同时存在两个updateQueue：
            // current fiber保存的updateQueue即current updateQueue
            // workInProgress fiber保存的updateQueue即workInProgress updateQueue
            // 在commit阶段完成页面渲染后，workInProgress Fiber树变为current Fiber树，workInProgress Fiber树内Fiber节点的updateQueue就变成current updateQueue。
            if (current !== null) {
                const currentQueue = current.updateQueue;
                const currentLastBaseUpdate = currentQueue.lastBaseUpdate;
                // 如果current的updateQueue和workInProgress的updateQueue不同，则对current也进行同样的处理，用于结构共享
                if (currentLastBaseUpdate !== lastBaseUpdate) {
                    if (currentLastBaseUpdate === null) {
                        currentQueue.firstBaseUpdate = firstPendingUpdate;
                    }
                    else {
                        currentLastBaseUpdate.next = firstPendingUpdate;
                    }
                    currentQueue.lastBaseUpdate = lastPendingUpdate;
                }
            }
        }
        if (firstBaseUpdate !== null) {
            let newState = queue.baseState;
            let newLastBaseUpdate = null;
            let newFirstBaseUpdate = null;
            let newBaseState = null;
            const update = firstBaseUpdate;
            newState = getStateFromUpdate(workInProgress, queue, update, newState);
            // TODO 多个update的情况 循环处理
            {
                newBaseState = newState;
            }
            queue.baseState = newBaseState;
            queue.firstBaseUpdate = newFirstBaseUpdate;
            queue.lastBaseUpdate = newLastBaseUpdate;
            workInProgress.memoizedState = newState;
        }
    }
    function getStateFromUpdate(workInProgress, queue, update, prevState) {
        switch (update.tag) {
            case UpdateState:
                const payload = update.payload;
                let partialState = payload;
                if (partialState == null) {
                    // 不需要更新
                    return prevState;
                }
                return assign({}, prevState, payload);
        }
    }

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-16 21:20:49
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-28 19:17:24
     */
    function createFiberRoot(containerInfo, tag, initialChildren = null) {
        // 1、创建整个React应用的FiberRootNode，这个FiberRootNode是一个管理者的作用
        // 2、一个React应用只能有一个FiberRootNode
        // 3、一个FiberRootNode下可以有多个RootFiber
        const root = new FiberRootNode(containerInfo, tag);
        // 1、创建未初始化的的RootFiber
        // 2、通过调用ReactDOM.render渲染出来的，比如ReactDOM.render(<App />,xxxx)，其中App就是一个RootFiber
        const uninitializedFiber = createHostRootFiber();
        // 将FiberRootNode的current指向这个未初始化的RootFiber
        root.current = uninitializedFiber;
        // 当前应用（App）的stateNode指向FiberRootNode
        uninitializedFiber.stateNode = root;
        const initialState = {
            element: initialChildren,
        };
        uninitializedFiber.memoizedState = initialState;
        initializeUpdateQueue(uninitializedFiber);
        return root;
    }
    class FiberRootNode {
        constructor(containerInfo, tag) {
            this.containerInfo = containerInfo;
            this.tag = tag;
            // 指向当前的RootFiber应用
            this.current = null;
            this.finishedWork = null;
        }
    }

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-19 13:41:21
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-19 13:45:37
     */
    const ImmediatePriority = 1; // 需要立即执行
    const UserBlockingPriority = 2; // 250ms 超时时间250ms，一般指的是用户交互
    const NormalPriority = 3; // 5000ms 超时时间5s，不需要直观立即变化的任务，比如网络请求
    const LowPriority = 4; // 10000ms 超时时间10s，肯定要执行的任务，但是可以放在最后处理
    const IdlePriority = 5; // 一些没有必要的任务，可能不会执行

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-31 16:41:32
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-31 16:41:41
     */
    const isUnitlessNumber = {
        animationIterationCount: true,
        aspectRatio: true,
        borderImageOutset: true,
        borderImageSlice: true,
        borderImageWidth: true,
        boxFlex: true,
        boxFlexGroup: true,
        boxOrdinalGroup: true,
        columnCount: true,
        columns: true,
        flex: true,
        flexGrow: true,
        flexPositive: true,
        flexShrink: true,
        flexNegative: true,
        flexOrder: true,
        gridArea: true,
        gridRow: true,
        gridRowEnd: true,
        gridRowSpan: true,
        gridRowStart: true,
        gridColumn: true,
        gridColumnEnd: true,
        gridColumnSpan: true,
        gridColumnStart: true,
        fontWeight: true,
        lineClamp: true,
        lineHeight: true,
        opacity: true,
        order: true,
        orphans: true,
        tabSize: true,
        widows: true,
        zIndex: true,
        zoom: true,
        // SVG-related properties
        fillOpacity: true,
        floodOpacity: true,
        stopOpacity: true,
        strokeDasharray: true,
        strokeDashoffset: true,
        strokeMiterlimit: true,
        strokeOpacity: true,
        strokeWidth: true,
    };

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-31 16:39:14
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-31 16:41:55
     */
    /**
     * @description: 处理style属性值
     * @param name
     * @param value
     */
    function dangerousStyleValue(name, value) {
        const isEmpty = value == null || typeof value === "boolean" || value === "";
        if (isEmpty) {
            return "";
        }
        // 处理需要加单位的属性
        if (typeof value === "number" &&
            value !== 0 &&
            !(isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name])) {
            return value + "px";
        }
        return ("" + value).trim();
    }

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-31 15:43:06
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-31 16:07:15
     */
    // react中使用的属性，并不能在dom上直接使用
    const reservedProps = new Set([
        "children",
        "dangerouslySetInnerHTML",
        "defaultValue",
        "defaultChecked",
        "innerHTML",
        "suppressContentEditableWarning",
        "suppressHydrationWarning",
        "style",
    ]);
    // react中重命名的属性
    const renamedProps = new Map([["className", "class"]]);
    /**
     * @description: 获取属性新消息
     * @param {string} name
     */
    function getPropertyInfo(name) {
        return renamedProps.get(name) || name;
    }
    /**
     * @description: 需要被忽略的属性，这些属性不能作为dom的属性
     * @param {string} name
     */
    function shouldIgnoreAttribute(name) {
        if (reservedProps.has(name))
            return true;
        if (name.length > 2 &&
            (name[0] === "o" || name[0] === "O") &&
            (name[1] === "n" || name[1] === "N")) {
            return true;
        }
        return false;
    }

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-31 15:38:38
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-31 16:42:51
     */
    /**
     * @description: 设置属性
     * @param {Element} node
     * @param {string} name
     * @param value
     */
    function setValueForProperty(node, name, value) {
        const attributeName = getPropertyInfo(name);
        // 一些属性是react中定义的，这些属性是不能直接在dom上设置
        if (shouldIgnoreAttribute(attributeName)) {
            return;
        }
        // TODO处理事件属性
        // TODO属性值的处理
        node.setAttribute(attributeName, value);
    }
    /**
     * @description: 设置style属性
     * @param  node
     * @param  styles
     */
    function setValueForStyles(node, styles) {
        const style = node.style;
        for (const styleName in styles) {
            if (!styles.hasOwnProperty(styleName)) {
                continue;
            }
            const styleValue = dangerousStyleValue(styleName, styles[styleName]);
            style[styleName] = styleValue;
        }
    }

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-28 20:07:58
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-28 20:08:05
     */
    const TEXT_NODE = 3;

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-28 20:06:48
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-28 20:12:46
     */
    /**
     * @description: 为节点设置textContent的时候，在更新文本的情况下设置节点的nodeValue要比设置textContent要来的快
     * 因为textContent会删除节点再重新创建
     * @param {Element} node
     * @param {string} text
     */
    const setTextContent = function (node, text) {
        if (text) {
            const firstChild = node.firstChild;
            // 判断是否是唯一文本子节点
            if (firstChild &&
                firstChild === node.lastChild &&
                firstChild.nodeType === TEXT_NODE) {
                firstChild.nodeValue = text;
                return;
            }
        }
        node.textContent = text;
    };

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-28 19:36:13
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-06-02 11:20:14
     */
    const CHILDREN = "children";
    const STYLE = "style";
    /**
     * @description: 创建元素
     * @param type 元素类型
     * @param props 元素属性
     */
    function createElement(type, props) {
        const domElement = document.createElement(type);
        return domElement;
    }
    /**
     * @description: 为dom添加属性
     * @param domElement
     * @param tag
     * @param rawProps
     */
    function setInitialProperties(domElement, tag, rawProps) {
        let props = rawProps;
        setInitialDOMProperties(tag, domElement, props);
    }
    function setInitialDOMProperties(tag, domElement, nextProps) {
        for (const propKey in nextProps) {
            if (!nextProps.hasOwnProperty(propKey)) {
                continue;
            }
            const nextProp = nextProps[propKey];
            if (propKey === STYLE) {
                // 处理style
                setValueForStyles(domElement, nextProp);
            }
            else if (propKey === CHILDREN) {
                // 处理文本子节点，当nextProp是字符串或者数字时表示唯一文本子节点
                if (isString(nextProp)) {
                    setTextContent(domElement, nextProp);
                }
                else if (isNumber(nextProp)) {
                    const value = "" + nextProp;
                    setTextContent(domElement, value);
                }
            }
            else if (nextProp != null) {
                // 设置其他属性
                setValueForProperty(domElement, propKey, nextProp);
            }
        }
    }

    const randomKey = Math.random().toString(36).slice(2);
    const internalPropsKey = "__reactProps$" + randomKey;
    const internalInstanceKey = "__reactFiber$" + randomKey;
    function updateFiberProps(node, props) {
        node[internalPropsKey] = props;
    }
    function precacheFiberNode(hostInst, node) {
        node[internalInstanceKey] = hostInst;
    }
    /**
     * @description: 根据node找到fiber节点
     */
    function getClosestInstanceFromNode(targetNode) {
        let targetInst = targetNode[internalInstanceKey];
        if (targetInst) {
            return targetInst;
        }
    }
    /**
     * @description: 根据node节点获取props
     * @param node
     */
    function getFiberCurrentPropsFromNode(node) {
        return node[internalPropsKey] || null;
    }

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-27 15:44:53
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-06-01 17:25:14
     */
    /**
     * 判断该节点的children是否可以直接作为文本子节点
     */
    function shouldSetTextContent(type, props) {
        return (type === "textarea" ||
            type === "noscript" ||
            typeof props.children === "string" ||
            typeof props.children === "number" ||
            (typeof props.dangerouslySetInnerHTML === "object" &&
                props.dangerouslySetInnerHTML !== null &&
                props.dangerouslySetInnerHTML.__html != null));
    }
    /**
     * @description: 创建fiber节点对应的真实dom
     * @param type 元素类型
     * @param props 元素属性
     */
    function createInstance(type, props, internalInstanceHandle) {
        const domElement = createElement(type);
        // 在创建的dom元素上添加一个自定义的属性用于存储props
        updateFiberProps(domElement, props);
        // 在对应dom上绑定fiber节点，在事件处理中需要用dom获取fiber节点
        precacheFiberNode(internalInstanceHandle, domElement);
        return domElement;
    }
    function finalizeInitialChildren(domElement, type, props) {
        setInitialProperties(domElement, type, props);
    }
    /**
     * @description: insertBefore插入节点
     * @param container
     * @param child
     * @param beforeChild
     */
    function insertInContainerBefore(container, child, beforeChild) {
        container.insertBefore(child, beforeChild);
    }
    /**
     * @description: appendChild插入节点
     * @param container
     * @param child
     */
    function appendChildToContainer(container, child) {
        container.appendChild(child);
    }
    /**
     * @description: 创建文本节点
     * @param {string} text
     */
    function createTextInstance(text) {
        const instance = document.createTextNode(text);
        return instance;
    }
    /**
     * @description: 添加子节点
     * @param parentInstance
     * @param child
     */
    function appendInitialChild(parentInstance, child) {
        parentInstance.appendChild(child);
    }

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-15 21:21:03
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-15 21:21:32
     */
    const REACT_ELEMENT_TYPE = Symbol.for('react.element');

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-26 17:20:37
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-31 15:28:52
     */
    /**
     * @description: 创建diff的函数
     * @param shouldTrackSideEffects 是否需要追踪副作用
     */
    function ChildReconciler(shouldTrackSideEffects) {
        /**
         * @description: diff的入口
         */
        function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
            if (isObject(newChild)) {
                // 处理单个子节点的情况
                switch (newChild.$$typeof) {
                    case REACT_ELEMENT_TYPE:
                        return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild));
                }
                // 处理多个子节点的情况
                if (isArray(newChild)) {
                    return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
                }
            }
            return null;
        }
        /**
         * @description: 处理子节点，diff的实现
         */
        function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
            let oldFiber = currentFirstChild;
            let newIndex = 0;
            let previousNewFiber = null;
            let resultingFirstChild = null;
            // TODO  diff
            if (oldFiber === null) {
                for (; newIndex < newChildren.length; newIndex++) {
                    const newFiber = createChild(returnFiber, newChildren[newIndex]);
                    // 前一个fiber是null说明当前这个newFiber就是要返回的第一个子fiber
                    if (previousNewFiber === null) {
                        resultingFirstChild = newFiber;
                    }
                    else {
                        // 否则把当前的newFiber挂载到前一个fiber的sibling上
                        previousNewFiber.sibling = newFiber;
                    }
                    previousNewFiber = newFiber;
                }
                return resultingFirstChild;
            }
            return null;
        }
        /**
         * @description: 创建子fiber节点
         * @param {Fiber} returnFiber
         * @param {any} newChild
         */
        function createChild(returnFiber, newChild) {
            // 处理文本子节点
            if ((isString(newChild) && newChild !== "") || isNumber(newChild)) {
                const created = createFiberFromText(newChild);
                created.return = returnFiber;
                return created;
            }
            if (isObject(newChild)) {
                switch (newChild.$$typeof) {
                    case REACT_ELEMENT_TYPE: {
                        const created = createFiberFromElement(newChild);
                        created.return = returnFiber;
                        return created;
                    }
                }
                // todo children
            }
            return null;
        }
        /**
         * @description: diff单个节点
         * @param returnFiber
         * @param currentFirstChild
         * @param newChild
         */
        function reconcileSingleElement(returnFiber, currentFirstChild, element) {
            // TODO 老的节点存在情况根据type和key进行节点的复用
            // while (child !== null) {}
            // 没有节点复用（比如首屏渲染的hostRoot的current是没有child节点的）
            // 直接创建fiber节点
            const created = createFiberFromElement(element);
            created.return = returnFiber;
            return created;
        }
        function placeSingleChild(newFiber) {
            // 首次渲染时的hostRoot节点会进入到这个条件
            if (shouldTrackSideEffects && newFiber.alternate === null) {
                newFiber.flags |= Placement;
            }
            return newFiber;
        }
        return reconcileChildFibers;
    }
    const reconcileChildFibers = ChildReconciler(true);
    const mountChildFibers = ChildReconciler(false);

    /*
     * @Author: Zhouqi
     * @Date: 2022-06-12 15:55:10
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-06-12 22:11:16
     */
    const ReactSharedInternals = React__namespace.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-27 14:45:26
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-06-12 22:27:48
     */
    const { ReactCurrentDispatcher } = ReactSharedInternals;
    let workInProgressHook = null;
    let currentlyRenderingFiber = null;
    const HooksDispatcherOnMount = {
        useState: mountState,
    };
    const HooksDispatcherOnUpdate = {
        useState: mountState,
    };
    function renderWithHooks(current, workInProgress, Component) {
        // 赋值currentlyRenderingFiber为当前的workInProgress
        currentlyRenderingFiber = workInProgress;
        // 重置memoizedState和updateQueue
        workInProgress.memoizedState = null;
        workInProgress.updateQueue = null;
        ReactCurrentDispatcher.current =
            current === null || current.memoizedState === null
                ? HooksDispatcherOnMount
                : HooksDispatcherOnUpdate;
        const children = Component();
        // console.log(children);
        return children;
    }
    function mountState(initialState) {
        const hook = mountWorkInProgressHook();
        if (isFunction(initialState)) {
            initialState = initialState();
        }
        // 首次使用hook时，hook.memoizedState就是initialState
        hook.memoizedState = hook.baseState = initialState;
        const queue = {
            pending: null,
            dispatch: null,
        };
        // hook上的queue和Update上的queue一样，是一个环状链表
        hook.queue = queue;
        const dispatch = (queue.dispatch =
            dispatchSetState.bind(null, currentlyRenderingFiber, queue));
        return [hook.memoizedState, dispatch];
    }
    function mountWorkInProgressHook() {
        const hook = {
            memoizedState: null,
            baseState: null,
            baseQueue: null,
            queue: null,
            next: null,
        };
        // workInProgressHook是一个链表，通过next去添加下一个hook
        if (workInProgressHook == null) {
            // hook只能在function component中使用，而function component函数会在renderWithHooks中调用，
            // 在调用之前，currentlyRenderingFiber会被赋值为当前function component所对应的workInProgress
            currentlyRenderingFiber.memoizedState = hook;
        }
        else {
            // 第二次使用hook时，将当前hook添加到workInProgressHook的末尾
            workInProgressHook.next = hook;
        }
        // 设置workInProgressHook为当前hook
        workInProgressHook = hook;
        return workInProgressHook;
    }
    /**
     * @description: 更新hook上的state
     */
    function dispatchSetState(fiber, queue, action) {
        console.log(fiber);
        console.log(queue);
        console.log(action);
    }

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-25 21:10:35
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-31 12:02:14
     */
    function beginWork(current, workInProgress) {
        switch (workInProgress.tag) {
            case HostRoot: {
                return updateHostRoot(current, workInProgress);
            }
            case IndeterminateComponent:
                return mountIndeterminateComponent(current, workInProgress, workInProgress.type);
            case HostComponent:
                return updateHostComponent(current, workInProgress);
            case HostText:
                return null;
            // return updateHostText(current, workInProgress);
        }
        return null;
    }
    function updateHostRoot(current, workInProgress) {
        const prevState = workInProgress.memoizedState;
        const prevChildren = prevState.element;
        processUpdateQueue(workInProgress);
        const nextState = workInProgress.memoizedState;
        // 获取要更新的jsx元素
        const nextChildren = nextState.element;
        // 新旧jsx对象没变，直接返回
        if (nextChildren === prevChildren) {
            return null;
        }
        // 创建子fiber节点
        reconcileChildren(current, workInProgress, nextChildren);
        // 返回子fiber节点
        return workInProgress.child;
    }
    /**
     * @description: 处理子fiber节点
     */
    function reconcileChildren(current, workInProgress, nextChildren) {
        // current为null说明是首次创建阶段，除了hostRoot节点
        if (current === null) {
            workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
        }
        else {
            // 说明是更新节点，hostRoot节点首次渲染也会进入这里
            workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
        }
    }
    /**
     * @author: Zhouqi
     * @description: Function组件首次渲染会进入这里
     * @param _current
     * @param workInProgress
     * @param Component
     */
    function mountIndeterminateComponent(_current, workInProgress, Component) {
        // value值是jsx经过babel处理后得到的vnode对象
        const value = renderWithHooks(_current, workInProgress, Component);
        // return;
        workInProgress.tag = FunctionComponent;
        reconcileChildren(null, workInProgress, value);
        return workInProgress.child;
    }
    function updateHostComponent(current, workInProgress) {
        const { type, pendingProps: nextProps } = workInProgress;
        let nextChildren = nextProps.children;
        // 判断是否只有唯一文本子节点，这种情况不需要为子节点创建fiber节点
        const isDirectTextChild = shouldSetTextContent(type, nextProps);
        if (isDirectTextChild) {
            nextChildren = null;
        }
        reconcileChildren(current, workInProgress, nextChildren);
        return workInProgress.child;
    }

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-19 21:24:22
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-31 14:06:28
     */
    /**
     * @author: Zhouqi
     * @description: commitMutation阶段
     * @param root
     * @param finishedWork
     */
    function commitMutationEffects(root, finishedWork) {
        commitMutationEffectsOnFiber(finishedWork, root);
    }
    function commitMutationEffectsOnFiber(finishedWork, root) {
        finishedWork.alternate;
        switch (finishedWork.tag) {
            case FunctionComponent: {
                recursivelyTraverseMutationEffects(root, finishedWork);
                commitReconciliationEffects(finishedWork);
                return;
            }
            case HostRoot:
                recursivelyTraverseMutationEffects(root, finishedWork);
                // commitReconciliationEffects(finishedWork);
                return;
        }
    }
    function recursivelyTraverseMutationEffects(root, parentFiber) {
        let child = parentFiber.child;
        while (child !== null) {
            commitMutationEffectsOnFiber(child, root);
            child = child.sibling;
        }
    }
    function commitReconciliationEffects(finishedWork) {
        const flags = finishedWork.flags;
        if (flags & Placement) {
            commitPlacement(finishedWork);
            // 删除Placement标记
            finishedWork.flags &= ~Placement;
        }
    }
    function commitPlacement(finishedWork) {
        // 找到host节点
        const parentFiber = getHostParentFiber(finishedWork);
        switch (parentFiber.tag) {
            case HostRoot: {
                // 获取父级Fiber节点，因为插入情况可能有两种，一种是parent.appendChild，另外一种是insertBefore
                // 针对两种方法的插入，对应的锚点节点是不同的
                const parent = parentFiber.stateNode.containerInfo;
                const before = getHostSibling(finishedWork);
                insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
                break;
            }
        }
    }
    /**
     * @description: 插入dom
     * @param node
     * @param before
     * @param parent
     */
    function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
        const tag = node.tag;
        const isHost = tag === HostComponent || tag === HostText;
        if (isHost) {
            const stateNode = node.stateNode;
            // 存在before节点的情况下使用insertBefore，否则用appednChild
            before
                ? insertInContainerBefore(parent, stateNode, before)
                : appendChildToContainer(parent, stateNode);
        }
        else {
            let child = node.child;
            if (child !== null) {
                insertOrAppendPlacementNodeIntoContainer(child, before, parent);
                // 处理兄弟节点
                let sibling = child.sibling;
                while (sibling !== null) {
                    insertOrAppendPlacementNodeIntoContainer(sibling, before, parent);
                    sibling = sibling.sibling;
                }
            }
        }
    }
    function getHostParentFiber(fiber) {
        let parent = fiber.return;
        while (parent !== null) {
            if (isHostParent(parent)) {
                return parent;
            }
            parent = parent.return;
        }
    }
    const isHostParent = (fiber) => fiber.tag === HostComponent || fiber.tag === HostRoot;
    /**
     * 找到fiber节点的兄弟fiber且这个fiber不需要插入真实dom
     * @param fiber 从该节点开始往右边找
     * @returns 找到的dom节点
     */
    const getHostSibling = (fiber) => {
        let node = fiber;
        siblings: while (true) {
            while (node.sibling === null) {
                if (node.return === null || isHostParent(node.return))
                    return null;
                node = node.return;
            }
            node.sibling.return = node.return;
            node = node.sibling;
            while (node.tag !== HostComponent) {
                if (node.flags & Placement) {
                    continue siblings;
                }
                if (node.child === null) {
                    continue siblings;
                }
                else {
                    node.child.return = node;
                    node = node.child;
                }
            }
            if (!(node.flags & Placement)) {
                return node.stateNode;
            }
        }
    };

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-28 19:23:10
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-06-01 17:24:10
     */
    /*
     * @Author: Zhouqi
     * @Date: 2022-05-28 19:23:10
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-31 13:22:37
     */
    function completeWork(current, workInProgress) {
        const newProps = workInProgress.pendingProps;
        switch (workInProgress.tag) {
            // 函数式组件
            case FunctionComponent: {
                return null;
            }
            // 当前应用的根结点
            case HostRoot: {
                // const fiberRoot = workInProgress.stateNode;
                // console.log(fiberRoot);
                return null;
            }
            // 创建普通元素节点
            case HostComponent: {
                const type = workInProgress.type;
                if (current !== null && workInProgress !== null) ;
                else {
                    // 创建元素
                    const instance = createInstance(type, newProps, workInProgress);
                    // 在归阶段的时候，子fiber对应的真实dom已经全部创建完毕，此时只需要
                    // 将当前fiber节点的child fiber节点对应的真实dom添加到自身真实dom下
                    appendAllChildren(instance, workInProgress);
                    // 将stateNode指向当前创建的dom节点
                    workInProgress.stateNode = instance;
                    // 初始化挂载属性
                    finalizeInitialChildren(instance, type, newProps);
                }
                return null;
            }
            // 处理文本节点
            case HostText: {
                workInProgress.stateNode = createTextInstance(newProps);
                return null;
            }
        }
        return null;
    }
    /**
     * @description: 将子fiber对应的instance追加到自身中
     * @param parent
     * @param workInProgress
     */
    function appendAllChildren(parent, workInProgress) {
        let node = workInProgress.child;
        while (node !== null) {
            if (node.tag === HostComponent || node.tag === HostText) {
                appendInitialChild(parent, node.stateNode);
            }
            while (node.sibling === null) {
                // 处理父fiber
                if (node.return === null || node.return === workInProgress) {
                    return;
                }
                node = node.return;
            }
            // 为兄弟fiber添加return指向父fiber
            node.sibling.return = node.return;
            node = node.sibling;
        }
    }

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-19 14:08:33
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-22 20:26:26
     */
    // 往队列中添加任务
    function push(heap, task) {
        const index = heap.length;
        heap.push(task);
        // 队列任务排序（小顶堆）
        siftUp(heap, task, index);
    }
    // 获取队首任务，即高优先级任务
    function peek(heap) {
        return heap.length ? heap[0] : null;
    }
    // 弹出队首任务
    function pop(heap) {
        if (heap.length === 0) {
            return null;
        }
        const first = heap[0];
        const last = heap.pop();
        // 存在多个任务，通过堆排序进行下浮
        if (first !== last) {
            // 队尾元素放到队首
            heap[0] = last;
        }
        // 只有一个任务的情况，直接返回
        return first;
    }
    // 小顶堆构建，新添加的任务通过堆排序进行上浮（优先级队列）
    function siftUp(heap, task, i) {
        let index = i;
        // 进行堆排序
        while (index > 0) {
            // 根据完全二叉树的性质，当前如果当前节点索引为i，则它的左孩子的索引为2i+1，右孩子的索引为2i+2
            // 如果当前子节点的索引为i，则可推出父节点索引为(i-1)/2
            const parentIndex = (index - 1) >> 1;
            const parentTask = heap[parentIndex];
            // 如果父任务的优先级低于当前任务，则对父子进行调换
            if (compare(parentTask, task) > 0) {
                heap[parentIndex] = task;
                heap[index] = parentIndex;
                index = parentIndex;
            }
            else {
                return;
            }
        }
    }
    // 比较任务的先后，先根据sortIndex排序，如果一样就根据id排序
    function compare(a, b) {
        const diff = a.sortIndex - b.sortIndex;
        return diff !== 0 ? diff : a.id - b.id;
    }

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-19 12:00:55
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-30 16:32:33
     */
    let getCurrentTime;
    // 是否可使用performace.now去获取高精度时间
    const hasPerformanceNow = typeof performance === "object" && typeof performance.now === "function";
    if (hasPerformanceNow) {
        getCurrentTime = () => performance.now();
    }
    const IMMEDIATE_PRIORITY_TIMEOUT = -1; // 需要立即执行
    const USER_BLOCKING_PRIORITY_TIMEOUT = 250; // 250ms 超时时间250ms，一般指的是用户交互
    const NORMAL_PRIORITY_TIMEOUT = 5000; // 5000ms 超时时间5s，不需要直观立即变化的任务，比如网络请求
    const LOW_PRIORITY_TIMEOUT = 10000; // 10000ms 超时时间10s，肯定要执行的任务，但是可以放在最后处理
    const IDLE_PRIORITY_TIMEOUT = 1073741823; // 一些没有必要的任务，可能不会执行
    // 过期任务队列
    const taskQueue = [];
    // 任务id
    let taskIdCounter = 1;
    // 标记是否正在进行任务处理，防止任务再次进入
    let isPerformingWork = false;
    // 是否有任务在调度
    let isHostCallbackScheduled = false;
    let scheduledHostCallback = null;
    // postMessage发送的消息是否正在执行
    let isMessageLoopRunning = false;
    /**
     * @description: 调度任务
     * @param priorityLevel 优先级
     * @param callback 需要调度的回调
     */
    function unstable_scheduleCallback(priorityLevel, callback) {
        // 获取任务当前时间
        const currentTime = getCurrentTime();
        const startTime = currentTime;
        // 1、根据优先级计算超时时间
        let timeout;
        switch (priorityLevel) {
            case ImmediatePriority:
                timeout = IMMEDIATE_PRIORITY_TIMEOUT;
                break;
            case UserBlockingPriority:
                timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
                break;
            case IdlePriority:
                timeout = IDLE_PRIORITY_TIMEOUT;
                break;
            case LowPriority:
                timeout = LOW_PRIORITY_TIMEOUT;
                break;
            case NormalPriority:
                timeout = NORMAL_PRIORITY_TIMEOUT;
                break;
            default:
                timeout = NORMAL_PRIORITY_TIMEOUT;
        }
        // 2、计算过期时间
        const expirationTime = startTime + timeout;
        // 3、创建一个新任务
        const newTask = {
            id: taskIdCounter++,
            callback,
            priorityLevel,
            startTime,
            expirationTime,
            sortIndex: -1, // 任务排序序号，初始化-1
        };
        // TODO 如果任务开始时间大于当前时间，说明任务没有过期
        if (startTime > currentTime) ;
        else {
            // 任务开始时间<=当前时间，说明任务过期了，需要添加到taskQueue队列中以进行任务调度
            // 过期任务根据过期时间进行排序
            newTask.sortIndex = expirationTime;
            push(taskQueue, newTask);
            // 如果没有处于调度中的任务，并且workLoop没有在执行中，则向浏览器申请时间片（一帧），浏览器空闲的时候执行workLoop
            if (!isHostCallbackScheduled && !isPerformingWork) {
                isHostCallbackScheduled = true;
                requestHostCallback(flushWork);
            }
        }
    }
    /**
     * @description: 注册宏任务
     * @param callback
     */
    function requestHostCallback(callback) {
        scheduledHostCallback = callback;
        if (!isMessageLoopRunning) {
            isMessageLoopRunning = true;
            schedulePerformWorkUntilDeadline();
        }
    }
    // 空闲时间进行任务调度逻辑
    let schedulePerformWorkUntilDeadline;
    // 利用messageChannel模拟实现requestIdleCallback
    // 模拟实现requestIdleCallback的两个条件
    // 1 模拟实现的requestIdleCallback能够主动让出线程，让浏览器去一些事情，例如渲染
    // 2 一次事件循环中只执行一次，因为执行完一次调度任务后还会去申请下一个时间片
    // 满足上述条件的只有宏任务，因为宏任务是在下一次事件循环开始的时候执行，并不会阻塞本次更新，并且宏任务在一次事件循环中也只逆行一次。
    // node环境下使用setImmediate
    // 浏览器和web worker环境下，这里不用setTimeout的原因是递归调用的时候，延迟最小是4ms
    if (typeof MessageChannel !== "undefined") {
        const channel = new MessageChannel();
        const port = channel.port2;
        // message回调是宏任务，在下一个事件循环中执行这个回调
        channel.port1.onmessage = performWorkUntilDeadline;
        schedulePerformWorkUntilDeadline = () => {
            port.postMessage(null);
        };
    }
    function flushWork() {
        isHostCallbackScheduled = false;
        isPerformingWork = true;
        return workLoop();
    }
    function performWorkUntilDeadline() {
        if (scheduledHostCallback !== null) {
            let hasMoreWork = true;
            try {
                // 执行flushWork
                hasMoreWork = scheduledHostCallback();
            }
            finally {
                // TODO 如果队列中还有任务，则继续为其创建一个宏任务以继续执行
                if (hasMoreWork) ;
                else {
                    isMessageLoopRunning = false;
                    scheduledHostCallback = null;
                }
            }
        }
        else {
            isMessageLoopRunning = false;
        }
    }
    /**
     * @description: 执行过期的任务
     */
    function workLoop() {
        // 取出当前优先级最高的任务
        let currentTask = peek(taskQueue);
        while (currentTask !== null) {
            // 获取真正的更新函数
            const callback = currentTask.callback;
            if (typeof callback === "function") {
                currentTask.callback = null;
                callback();
                if (currentTask === peek(taskQueue)) {
                    // 弹出当前执行的任务
                    pop(taskQueue);
                }
            }
            // 取出下一个任务执行
            currentTask = peek(taskQueue);
        }
    }

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-19 11:58:34
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-19 12:02:06
     */
    const scheduleCallback = unstable_scheduleCallback;

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-18 11:29:27
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-06-12 14:07:19
     */
    // 当前正在工作的根应用fiber
    let workInProgressRoot = null;
    // 当前正在工作的fiber
    let workInProgress = null;
    /**
     * @description: 调度fiber节点上的更新
     * @param fiber
     */
    function scheduleUpdateOnFiber(fiber) {
        const root = fiber.stateNode;
        // 异步调度应用（concurrent模式）
        ensureRootIsScheduled(root);
    }
    /**
     * @author: Zhouqi
     * @description: 调度应用
     * @param root
     */
    function ensureRootIsScheduled(root) {
        // 调度一个新的回调
        let newCallbackNode;
        // 设置任务优先级，防止浏览器因没有空闲时间导致任务卡死
        // 先写死NormalPriority
        let schedulerPriorityLevel = NormalPriority;
        // TODO 计算任务超时等级
        // 低优先级的异步更新任务走performConcurrentWorkOnRoot
        // performConcurrentWorkOnRoot在浏览器没有空闲时间的时候执行shouldYield终止循环
        // 等浏览器有空闲时间的时候恢复执行
        // 非同步任务通过scheduler去调度任务
        newCallbackNode = scheduleCallback(schedulerPriorityLevel, performConcurrentWorkOnRoot.bind(null, root));
        root.callbackNode = newCallbackNode;
    }
    /**
     * @description: 所有并发任务的入口，即通过schedular调度的任务
     * @param root
     */
    function performConcurrentWorkOnRoot(root) {
        renderRootSync(root);
        const finishedWork = root.current.alternate;
        root.finishedWork = finishedWork;
        finishConcurrentRender(root);
    }
    /**
     * @description: 同步执行根节点渲染
     * @param root
     */
    function renderRootSync(root) {
        if (workInProgressRoot !== root) {
            // 为接下去新一次渲染工作初始化参数
            prepareFreshStack(root);
        }
        workLoopSync();
        // 表示render结束，没有正在进行中的render
        workInProgressRoot = null;
    }
    /**
     * @description: 为接下去新一次渲染工作初始化参数
     * @param root
     */
    function prepareFreshStack(root) {
        root.finishedWork = null;
        workInProgressRoot = root;
        // 为当前节点创建一个内存中的fiber节点（双缓存机制）
        const rootWorkInProgress = createWorkInProgress(root.current, null);
        workInProgress = rootWorkInProgress;
        return workInProgressRoot;
    }
    /**
     * @description: render工作完成，进入commit阶段
     * @param root
     */
    function finishConcurrentRender(root) {
        commitRoot(root);
    }
    /**
     * @description: 提交阶段
     * @param root
     */
    function commitRoot(root) {
        commitRootImpl(root);
    }
    function commitRootImpl(root) {
        const finishedWork = root.finishedWork;
        root.finishedWork = null;
        // commitRoot总是同步完成的。所以我们现在可以清除这些，以允许一个新的回调被调度。
        root.callbackNode = null;
        workInProgressRoot = null;
        workInProgress = null;
        // TODO beforeMutationEffect阶段
        commitMutationEffects(root, finishedWork);
        // TODO layout阶段
    }
    /**
     * @description: 循环同步执行过期的任务
     */
    function workLoopSync() {
        // 对于已经超时的任务，不需要检查是否需要yield，直接执行
        // 如果存在workInProgress，就执行performUnitOfWork
        while (workInProgress !== null) {
            performUnitOfWork(workInProgress);
        }
    }
    /**
     * @description: 以fiber节点为单位开始beginWork和completeWork
     * @param unitOfWork
     */
    function performUnitOfWork(unitOfWork) {
        // 首屏渲染只有当前应用的根结点存在current，其它节点current为null
        const current = unitOfWork.alternate;
        let next;
        next = beginWork(current, unitOfWork);
        unitOfWork.memoizedProps = unitOfWork.pendingProps;
        // 不存在子fiber节点了，说明节点已经处理完，此时进入completeWork
        if (next == null) {
            completeUnitOfWork(unitOfWork);
        }
        else {
            workInProgress = next;
        }
    }
    function completeUnitOfWork(unitOfWork) {
        let completedWork = unitOfWork;
        do {
            const current = completedWork.alternate;
            const returnFiber = completedWork.return;
            let next;
            next = completeWork(current, completedWork);
            if (next !== null) {
                workInProgress = next;
                return;
            }
            // 处理当前节点的兄弟节点
            const siblingFiber = completedWork.sibling;
            if (siblingFiber !== null) {
                workInProgress = siblingFiber;
                return;
            }
            // returnFiber的子节点已经全部处理完毕，开始处理returnFiber
            completedWork = returnFiber;
            workInProgress = completedWork;
        } while (completedWork !== null);
    }

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-16 20:46:52
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-30 16:49:23
     */
    /**
     * @description: 创建整个应用的根节点
     * @param  containerInfo 挂载的dom节点
     * @param  tag 创建默认 concurrent
     * @return 整个应用的根结点
     */
    function createContainer(containerInfo, tag) {
        return createFiberRoot(containerInfo, tag);
    }
    /**
     * @description: 更新
     * @param element ReactDOM.render的第一个参数
     * @param container
     */
    function updateContainer(element, container) {
        const current = container.current;
        // 创建更新，目前只有hostRoot使用
        const update = createUpdate();
        // 将update的payload做为需要挂载在根节点的组件
        update.payload = { element };
        // 存储更新，添加到更新队列中
        enqueueUpdate(current, update);
        // 调度该fiber节点的更新
        scheduleUpdateOnFiber(current);
    }

    const ConcurrentRoot = 1;

    /*
     * @Author: Zhouqi
     * @Date: 2022-06-01 15:17:12
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-06-01 15:18:29
     */
    /**
     * @description: 绑定冒泡事件
     */
    function addEventBubbleListener(target, eventType, listener) {
        target.addEventListener(eventType, listener, false);
        return listener;
    }

    const allNativeEvents = new Set();
    const registrationNameDependencies = {};
    function registerDirectEvent(registrationName, dependencies) {
        if (registrationNameDependencies[registrationName]) {
            return;
        }
        registrationNameDependencies[registrationName] = dependencies;
        for (let i = 0; i < dependencies.length; i++) {
            allNativeEvents.add(dependencies[i]);
        }
    }
    function registerTwoPhaseEvent(registrationName, dependencies) {
        // 冒泡事件
        registerDirectEvent(registrationName, dependencies);
        // 捕获事件
        // registerDirectEvent(registrationName + "Capture", dependencies);
    }

    const IS_CAPTURE_PHASE = 1 << 2;

    /*
     * @Author: Zhouqi
     * @Date: 2022-06-01 16:03:37
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-06-01 16:03:48
     */
    function getEventTarget(nativeEvent) {
        let target = nativeEvent.target || nativeEvent.srcElement || window;
        return target.nodeType === TEXT_NODE ? target.parentNode : target;
    }

    function getListener(inst, registrationName) {
        const stateNode = inst.stateNode;
        if (stateNode === null) {
            return null;
        }
        const props = getFiberCurrentPropsFromNode(stateNode);
        if (props === null) {
            return null;
        }
        const listener = props[registrationName];
        return listener;
    }

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-19 11:10:29
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-06-01 15:06:42
     */
    // 同步更新的优先级为最高优先级
    const SyncLane = 0b0000000000000000000000000000001;

    /*
     * @Author: Zhouqi
     * @Date: 2022-06-01 15:05:41
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-06-01 15:06:48
     */
    const DiscreteEventPriority = SyncLane;

    const topLevelEventsToReactNames = new Map();
    const simpleEventPluginEvents = ["click", "mouseDown"];
    /**
     * @description: 简单事件注册函数
     * @param domEventName dom上的事件名
     * @param reactName react上的事件名
     */
    function registerSimpleEvent(domEventName, reactName) {
        topLevelEventsToReactNames.set(domEventName, reactName);
        registerTwoPhaseEvent(reactName, [domEventName]);
    }
    function registerSimpleEvents() {
        for (let i = 0; i < simpleEventPluginEvents.length; i++) {
            const eventName = simpleEventPluginEvents[i];
            const domEventName = eventName.toLowerCase();
            const capitalizedEvent = eventName[0].toUpperCase() + eventName.slice(1);
            registerSimpleEvent(domEventName, "on" + capitalizedEvent);
        }
    }

    function functionThatReturnsTrue() {
        return true;
    }
    function functionThatReturnsFalse() {
        return false;
    }
    // 创建事件源
    function createSyntheticEvent() {
        class SyntheticBaseEvent {
            constructor(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
                this._reactName = null;
                this._reactName = reactName;
                this._targetInst = targetInst;
                this.type = reactEventType;
                this.nativeEvent = nativeEvent;
                this.target = nativeEventTarget;
                this.isPropagationStopped = functionThatReturnsFalse;
            }
            stopPropagation() {
                const event = this.nativeEvent;
                if (!event) {
                    return;
                }
                if (event.stopPropagation) {
                    event.stopPropagation();
                }
                this.isPropagationStopped = functionThatReturnsTrue;
            }
        }
        return SyntheticBaseEvent;
    }
    const SyntheticEvent = createSyntheticEvent();
    const SyntheticMouseEvent = createSyntheticEvent();

    function extractEvents$1(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer) {
        const reactName = topLevelEventsToReactNames.get(domEventName);
        if (!reactName) {
            return;
        }
        let SyntheticEventCtor = SyntheticEvent;
        let reactEventType = domEventName;
        switch (domEventName) {
            case "click":
            case "mousedown":
                SyntheticEventCtor = SyntheticMouseEvent;
                break;
        }
        const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
        const listeners = accumulateSinglePhaseListeners(targetInst, reactName, nativeEvent.type, inCapturePhase);
        if (listeners.length > 0) {
            const event = new SyntheticEventCtor(reactName, reactEventType, null, nativeEvent, nativeEventTarget);
            dispatchQueue.push({ event, listeners });
        }
    }

    /*
     * @Author: Zhouqi
     * @Date: 2022-06-01 15:02:16
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-06-01 17:28:42
     */
    let return_targetInst = null;
    function createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags) {
        const eventPriority = getEventPriority(domEventName);
        let listenerWrapper;
        switch (eventPriority) {
            case DiscreteEventPriority:
                listenerWrapper = dispatchDiscreteEvent;
                break;
        }
        return listenerWrapper.bind(null, domEventName, eventSystemFlags, targetContainer);
    }
    /**
     * @description: 事件触发函数
     */
    function dispatchDiscreteEvent(domEventName, eventSystemFlags, container, nativeEvent) {
        dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
    }
    /**
     * @description: 获取事件优先级
     * @param {DOMEventName} domEventName
     */
    function getEventPriority(domEventName) {
        switch (domEventName) {
            case "click":
            case "mousedown":
                return DiscreteEventPriority;
        }
    }
    /**
     * @description: 触发事件
     */
    function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
        dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay(domEventName, eventSystemFlags, targetContainer, nativeEvent);
    }
    function dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
        findInstanceBlockingEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent);
        dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, return_targetInst);
    }
    function findInstanceBlockingEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
        return_targetInst = null;
        const nativeEventTarget = getEventTarget(nativeEvent);
        let targetInst = getClosestInstanceFromNode(nativeEventTarget);
        return_targetInst = targetInst;
    }

    registerSimpleEvents();
    const listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);
    /**
     * @description: 注册事件
     * @param domEventName 事件名
     * @param isCapturePhaseListener 是否是捕获阶段的监听器
     * @param target 目标元素
     */
    function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
        let eventSystemFlags = 0;
        if (isCapturePhaseListener) {
            eventSystemFlags |= IS_CAPTURE_PHASE;
        }
        addTrappedEventListener(target, domEventName, eventSystemFlags);
    }
    function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener) {
        let listener = createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags);
        // 注册冒泡事件
        addEventBubbleListener(targetContainer, domEventName, listener);
    }
    /**
     * @description: 创建所有支持的事件监听，react18所有的事件监听都是绑定在app容器上的
     * @param {EventTarget} rootContainerElement
     */
    function listenToAllSupportedEvents(rootContainerElement) {
        if (!rootContainerElement[listeningMarker]) {
            allNativeEvents.forEach((domEventName) => {
                listenToNativeEvent(domEventName, false, rootContainerElement);
                // TODO 对于部分事件不能委托给容器，应该委托给实际目标元素，因为这些事件不会一直在dom上冒泡
            });
        }
    }
    function dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer) {
        const ancestorInst = targetInst;
        batchedUpdates(() => dispatchEventsForPlugins(domEventName, eventSystemFlags, nativeEvent, ancestorInst));
    }
    function executeDispatch(event, listener, currentTarget) {
        listener(event);
    }
    function processDispatchQueueItemsInOrder(event, dispatchListeners, inCapturePhase) {
        if (inCapturePhase) ;
        else {
            // 事件冒泡
            for (let i = 0; i < dispatchListeners.length; i++) {
                const { currentTarget, listener } = dispatchListeners[i];
                // 判断事件冒泡是否已经被阻止了
                if (event.isPropagationStopped()) {
                    return;
                }
                executeDispatch(event, listener);
            }
        }
    }
    /**
     * @description: 触发事件队列中的事件
     */
    function processDispatchQueue(dispatchQueue, eventSystemFlags) {
        const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
        for (let i = 0; i < dispatchQueue.length; i++) {
            const { event, listeners } = dispatchQueue[i];
            processDispatchQueueItemsInOrder(event, listeners, inCapturePhase);
        }
    }
    function dispatchEventsForPlugins(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer) {
        const nativeEventTarget = getEventTarget(nativeEvent);
        // 要触发的事件队列
        const dispatchQueue = [];
        // 获取需要触发的事件，将事件加入到队列中
        extractEvents(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags);
        processDispatchQueue(dispatchQueue, eventSystemFlags);
    }
    function batchedUpdates(fn) {
        fn();
    }
    function extractEvents(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer) {
        extractEvents$1(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags);
    }
    function accumulateSinglePhaseListeners(targetFiber, reactName, nativeEventType, inCapturePhase, accumulateTargetOnly, nativeEvent) {
        const captureName = reactName !== null ? reactName + "Capture" : null;
        const reactEventName = inCapturePhase ? captureName : reactName;
        let listeners = [];
        let instance = targetFiber;
        let lastHostComponent = null;
        // TODO 循环向上遍历节点，将有关的事件都添加到事件队列中
        while (instance !== null) {
            const { stateNode, tag } = instance;
            if (tag === HostComponent && stateNode !== null) {
                lastHostComponent = stateNode;
                if (reactEventName) {
                    const listener = getListener(instance, reactEventName);
                    if (listener != null) {
                        listeners.push({
                            instance,
                            listener,
                            currentTarget: lastHostComponent,
                        });
                    }
                }
            }
            instance = instance.return;
        }
        return listeners;
    }

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-16 19:59:04
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-06-01 14:06:05
     */
    function createRoot$1(container) {
        // 创建根容器
        const root = createContainer(container, ConcurrentRoot);
        listenToAllSupportedEvents(container);
        return new ReactDOMRoot(root);
    }
    class ReactDOMRoot {
        constructor(internalRoot) {
            this._internalRoot = internalRoot;
        }
        // 通过ReactDOM.render将jsx渲染到页面上
        render(children) {
            const root = this._internalRoot;
            updateContainer(children, root);
        }
    }

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-16 19:57:13
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-30 15:12:28
     */
    /**
     * @author: Zhouqi
     * @description: 创建整个应用的根节点
     * @param container 挂载的容器
     * @return 整个应用的根节点
     */
    function createRoot(container) {
        return createRoot$1(container);
    }

    exports.createRoot = createRoot;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({}, React);
