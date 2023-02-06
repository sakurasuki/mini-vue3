'use strict';

const createVNode = (type, props, children) => {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type)
    };
    debugger;
    if (typeof children === 'string')
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILREN */;
    else if (Array.isArray(children))
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILREN */;
    return vnode;
};
const getShapeFlag = type => {
    return typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
};

const publicProperiesMap = {
    $el: i => i.vnode.el
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        /** 组件原型上的一些方法实现*/
        const publicGetter = publicProperiesMap[key];
        return publicGetter === null || publicGetter === void 0 ? void 0 : publicGetter(instance);
    }
};

const createComponentInstance = vnode => {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    };
    return component;
};
/**初始化组件 */
const setupComponent = instance => {
    //TODO
    // initProps()
    // initSlots();
    setupStateFulComponent(instance);
};
/**初始化状态组件 */
const setupStateFulComponent = instance => {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
};
/**
 *  处理setup结果
 * @param  setupResult
 
 */
const handleSetupResult = (instance, setupResult) => {
    /**
     * * setupResult = function 代表是个组件
     * setupResult = object 直接注入到上下文
     */
    //TODO typeof function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
};
/**完成组件初始化 */
const finishComponentSetup = instance => {
    const Component = instance.type;
    instance.render = Component.render;
};

const render = (vnode, container) => {
    patch(vnode, container);
};
/**
 *
 * @param vnode 虚拟节点
 * @param container 容器
 */
const patch = (vnode, container) => {
    const { shapeFlag } = vnode;
    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */)
        processElement(vnode, container);
    else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */)
        processComponent(vnode, container);
};
/**
 * 处理组件
 * @param vnode  虚拟节点
 * @param container 容器
 */
const processElement = (vnode, container) => {
    mountElement(vnode, container);
};
/**
 * 生成el
 * @param vnode 虚拟节点
 * @param container 容器
 */
const mountElement = (vnode, container) => {
    const { type, children, props, shapeFlag } = vnode;
    /**存储组件根元素到虚拟节点上 */
    const el = (vnode.el = document.createElement(type));
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILREN */) {
        mountChildren(vnode, el);
    }
    for (const key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    container.append(el);
};
const mountChildren = (vnode, container) => {
    vnode.children.forEach(v => patch(v, container));
};
/**
 *处理组件
 * @param vnode 虚拟节点
 * @param container 容器
 */
const processComponent = (vnode, container) => {
    mountComponent(vnode, container);
};
/**
 * 生成组件
 * @param initinalVNode 虚拟节点
 * @param container 容器
 */
const mountComponent = (initinalVNode, container) => {
    const instance = createComponentInstance(initinalVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initinalVNode, container);
};
const setupRenderEffect = (instance, initinalVNode, container) => {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    initinalVNode.el = subTree.el;
};

const createApp = rootComponent => {
    return {
        mount(rootContainer) {
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
};

const h = (type, props, children) => {
    return createVNode(type, props, children);
};

exports.createApp = createApp;
exports.h = h;
