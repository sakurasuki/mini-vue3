'use strict';

const createVNode = (type, props, children) => {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
};

const isObject = val => val !== null && typeof val === 'object';

const createComponentInstance = vnode => {
    const component = {
        vnode,
        type: vnode.type
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
 * @param vnode
 * @param container
 */
const patch = (vnode, container) => {
    /**
     * 判断type 是组件/el
     */
    if (isObject(vnode.type))
        processComponent(vnode, container);
    else
        processElement(vnode, container);
};
/**处理el */
const processElement = (vnode, container) => {
    mountElement(vnode, container);
};
/**生成el */
const mountElement = (vnode, container) => {
    const { type, children, props } = vnode;
    const el = document.createElement(type);
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
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
 * @param vnode
 * @param container
 */
const processComponent = (vnode, container) => {
    mountComponent(vnode, container);
};
/**
 * 生成组件
 * @param vnode
 */
const mountComponent = (vnode, container) => {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
};
const setupRenderEffect = (instance, container) => {
    const subTree = instance.render();
    patch(subTree, container);
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
