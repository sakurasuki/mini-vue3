'use strict';

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
const createVNode = (type, props, children) => {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type)
    };
    if (typeof children === 'string')
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILREN */;
    else if (Array.isArray(children))
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILREN */;
    /**判断slot插槽 */
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
};
const getShapeFlag = type => {
    return typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
};
const createTextVNode = (str) => createVNode(Text, {}, str);

const extend = Object.assign;
const isObject = val => val !== null && typeof val === 'object';
const hasOwn = (raw, key) => Object.prototype.hasOwnProperty.call(raw, key);
/**
 * event事件key转换
 * @param str
 * @returns add-foo ->addFoo
 */
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};
/**
 * event事件key转换
 * @param str
 * @returns add -> Add
 */
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
/**
 * event事件key转换
 * @param str
 * @returns  key -> onKey
 */
const toHandlerKey = (str) => (str ? 'on' + capitalize(str) : '');

/** 组件原型上的一些方法实现*/
const publicProperiesMap = {
    $el: instance => instance.vnode.el,
    $slots: instance => instance.slots
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicProperiesMap[key];
        return publicGetter === null || publicGetter === void 0 ? void 0 : publicGetter(instance);
    }
};

const initProps = (instance, rawProps) => {
    instance.props = rawProps || {};
};

/**依赖收集 */
const targetMap = new Map();
const triggerEffects = dep => {
    for (const effect of dep) {
        if (effect.scheduler)
            effect.scheduler();
        else
            effect.run();
    }
};
/**触发依赖收集 */
const trigger = (target, key) => {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
};

const createGetter = (isReadonly = false, shallow = false) => {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */)
            return !isReadonly;
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */)
            return isReadonly;
        const res = Reflect.get(target, key);
        if (shallow)
            return res;
        /**判断res是否是复杂数据类型 */
        if (isObject(res))
            return isReadonly ? readonly(res) : reactive(res);
        return res;
    };
};
const createSetter = () => {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
};
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const mutableHandler = {
    get,
    set
};
const readonlyHandler = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`${key} set失败，因为target是readonly`, target);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandler, {
    get: shallowReadonlyGet
});

/**响应式对象实现 */
const createReactiveObject = (raw, baseHandlers) => {
    if (!isObject(raw)) {
        console.warn(`target ${raw} 必须是一个对象`);
        return raw;
    }
    return new Proxy(raw, baseHandlers);
};
const reactive = raw => createReactiveObject(raw, mutableHandler);
const readonly = raw => createReactiveObject(raw, readonlyHandler);
const shallowReadonly = raw => createReactiveObject(raw, shallowReadonlyHandlers);

/**
 *
 * @param instance
 * @param event
 * @param args
 */
const emit = (instance, event, ...args) => {
    console.log('emit', event);
    const { props } = instance;
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler === null || handler === void 0 ? void 0 : handler(...args);
};

const initSlots = (instance, children) => {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
};
const normalizeObjectSlots = (children, slots) => {
    for (const key in children) {
        const val = children[key];
        slots[key] = props => normalizeSlotValue(val(props));
    }
};
const normalizeSlotValue = val => (Array.isArray(val) ? val : [val]);

const createComponentInstance = (vnode, parent) => {
    console.log('createComponentInstance', parent);
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => { },
        provides: parent ? parent.provides : {},
        parent,
        slots: {}
    };
    component.emit = emit.bind(null, component);
    return component;
};
/**初始化组件 */
const setupComponent = instance => {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStateFulComponent(instance);
};
/**初始化状态组件 */
const setupStateFulComponent = instance => {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        /**使用shallowReadonly让props变成不可修改 */
        const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit });
        currentInstance = null;
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
let currentInstance = null;
/**获取组件实例对象 */
const getCurrentInstance = () => currentInstance;
const setCurrentInstance = instance => {
    currentInstance = instance;
};

const render = (vnode, container) => {
    //TODO undefined
    patch(vnode, container, null);
};
/**
 *
 * @param vnode 虚拟节点
 * @param container 容器
 */
const patch = (vnode, container, parentComponent) => {
    const { shapeFlag, type } = vnode;
    switch (type) {
        case Fragment:
            processFragment(vnode, container, parentComponent);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                processElement(vnode, container, parentComponent);
            }
            else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                processComponent(vnode, container, parentComponent);
            }
            break;
    }
};
const processText = (vnode, container) => {
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
};
const processFragment = (vnode, container, parentComponent) => {
    mountChildren(vnode, container, parentComponent);
};
/**
 * 处理组件
 * @param vnode  虚拟节点
 * @param container 容器
 */
const processElement = (vnode, container, parentComponent) => {
    mountElement(vnode, container, parentComponent);
};
/**
 * 生成el
 * @param vnode 虚拟节点
 * @param container 容器
 */
const mountElement = (vnode, container, parentComponent) => {
    const { type, children, props, shapeFlag } = vnode;
    /**存储组件根元素到虚拟节点上 */
    const el = (vnode.el = document.createElement(type));
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILREN */) {
        mountChildren(vnode, el, parentComponent);
    }
    for (const key in props) {
        const val = props[key];
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, val);
        }
        else
            el.setAttribute(key, val);
    }
    container.append(el);
};
const mountChildren = (vnode, container, parentComponent) => {
    vnode.children.forEach(v => patch(v, container, parentComponent));
};
/**
 *处理组件
 * @param vnode 虚拟节点
 * @param container 容器
 */
const processComponent = (vnode, container, parentComponent) => {
    mountComponent(vnode, container, parentComponent);
};
/**
 * 生成组件
 * @param initinalVNode 虚拟节点
 * @param container 容器
 */
const mountComponent = (initinalVNode, container, parentComponent) => {
    const instance = createComponentInstance(initinalVNode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, initinalVNode, container);
};
const setupRenderEffect = (instance, initinalVNode, container) => {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container, instance);
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

const renderSlots = (slots, name, props) => {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
};

const provide = (key, val) => {
    var _a;
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = (_a = currentInstance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = val;
    }
};
const inject = (key, defaultVal) => {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides)
            return parentProvides[key];
        else if (defaultVal) {
            if (typeof defaultVal === 'function')
                return defaultVal();
            return defaultVal;
        }
    }
};

exports.createApp = createApp;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.renderSlots = renderSlots;
