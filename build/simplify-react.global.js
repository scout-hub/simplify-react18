var React = (function (exports) {
    'use strict';

    const ReactCurrentDispatcher = {
        current: null,
    };

    /*
     * @Author: Zhouqi
     * @Date: 2022-06-12 15:51:29
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-06-12 16:06:47
     */
    const ReactSharedInternals = {
        ReactCurrentDispatcher,
    };

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-15 21:21:03
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-15 21:21:32
     */
    const REACT_ELEMENT_TYPE = Symbol.for('react.element');

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-15 21:10:48
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-15 21:10:54
     */
    const ReactCurrentOwner = {
        current: null,
    };

    /*
     * @Author: Zhouqi
     * @Date: 2022-05-15 20:14:41
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-05-31 15:35:46
     */
    /**
     * @author: Zhouqi
     * @description: 创建元素的虚拟节点（jsx编译===>React.createElement）
     * @param 节点类型
     * @param 属性
     * @param 子节点
     * @return 元素虚拟节点
     */
    function createElement(type, config, children) {
        const props = {};
        let key = null;
        let ref = null;
        let self = null;
        let source = null;
        // 解析属性
        if (config != null) {
            for (const key in config) {
                if (config.hasOwnProperty(key)) {
                    props[key] = config[key];
                }
            }
        }
        const childrenLength = arguments.length - 2;
        if (childrenLength === 1) {
            // 只有一个子节点的情况
            props.children = children;
        }
        else {
            // 多个子节点的情况
            const childArray = new Array(childrenLength);
            for (let i = 0; i < childrenLength; i++) {
                childArray[i] = arguments[i + 2];
            }
            props.children = childArray;
        }
        return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
    }
    const ReactElement = function (type, key, ref, self, source, owner, props) {
        const element = {
            // 表示一个合法的react element
            $$typeof: REACT_ELEMENT_TYPE,
            type,
            key,
            ref,
            props,
            _owner: owner,
        };
        return element;
    };

    /*
     * @Author: Zhouqi
     * @Date: 2022-06-11 20:11:17
     * @LastEditors: Zhouqi
     * @LastEditTime: 2022-06-12 18:06:11
     */
    function resolveDispatcher() {
        const dispatcher = ReactCurrentDispatcher.current;
        return dispatcher;
    }
    function useState(initialState) {
        const dispatcher = resolveDispatcher();
        return dispatcher.useState(initialState);
    }

    exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactSharedInternals;
    exports.createElement = createElement;
    exports.useState = useState;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
