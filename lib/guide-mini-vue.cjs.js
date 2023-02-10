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

const h = (type, props, children) => {
    return createVNode(type, props, children);
};

const extend = Object.assign;
const isObject = val => val !== null && typeof val === 'object';
const hasChanged = (newVal, val) => !Object.is(val, newVal);
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

let activeEffect, shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.deps = [];
        this.active = true;
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        if (!this.active)
            return this._fn();
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            this.clearupEffect(this);
            if (this.onStop)
                this.onStop();
            this.active = false;
        }
    }
    clearupEffect(effect) {
        effect.deps.forEach((dep) => {
            dep.delete(effect);
        });
        effect.deps.length = 0;
    }
}
const effect = (fn, options = {}) => {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
};
/**依赖收集 */
const targetMap = new Map();
/**是否收集依赖 */
const isTracking = () => shouldTrack && activeEffect !== undefined;
const trackEffects = dep => {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
};
const track = (target, key) => {
    if (!isTracking())
        return;
    // target -> key -> dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
};
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
        if (!isReadonly)
            track(target, key);
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
const isReactive = raw => !!raw["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */];
const isReadonly = raw => !!raw["__v_isReadonly" /* ReactiveFlags.IS_READONLY */];
const isProxy = raw => isReactive(raw) || isReadonly(raw);
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

/**对象转换为reactive对象 */
const convert = val => (isObject(val) ? reactive(val) : val);
class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        tarckRefValue(this);
        return this._value;
    }
    set value(newVal) {
        if (hasChanged(newVal, this._rawValue)) {
            this._rawValue = newVal;
            this._value = convert(newVal);
            triggerEffects(this.dep);
        }
    }
}
const tarckRefValue = ref => {
    if (isTracking())
        trackEffects(ref.dep);
};
const ref = value => new RefImpl(value);
const isRef = ref => !!ref.__v_isRef;
const unRef = ref => (isRef(ref) ? ref.value : ref);
const proxyRefs = objectWithRefs => {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, val) {
            if (isRef(target[key]) && !isRef(val))
                return (target[key].value = val);
            else
                return Reflect.set(target, key, val);
        }
    });
};

class ComputedRefImpl {
    constructor(getter) {
        this._dirty = true;
        this._getter = getter;
        this._effect = new ReactiveEffect(getter, 
        /* 响应式对象更新
         * _dirty私有变量标记转true 表示需要重新获取新的计算结果
         */
        () => {
            if (!this._dirty)
                this._dirty = true;
        });
    }
    get value() {
        /**缓存操作
         * 通过_dirty私有变量标记判断是否被调用过
         * 调用过 直接返回缓存的上次调用结果
         * 没调用过 _dirty转false 保留调用结果
         */
        if (this._dirty) {
            this._dirty = false;
            this._value = this._effect.run();
        }
        return this._value;
    }
}
const computed = getter => {
    return new ComputedRefImpl(getter);
};

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
        slots: {},
        isMounted: false,
        subTree: {}
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
        instance.setupState = proxyRefs(setupResult);
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

const createAppApi = render => {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
};

const createRenderer = options => {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options;
    const render = (vnode, container) => {
        patch(null, vnode, container, null);
    };
    /**
     *
     * @param n1 旧的虚拟节点
     * @param n2 新的虚拟节点
     * @param container 容器
     */
    const patch = (n1, n2, container, parentComponent) => {
        const { shapeFlag, type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    };
    const processText = (n1, n2, container) => {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    };
    const processFragment = (n1, n2, container, parentComponent) => {
        mountChildren(n2, container, parentComponent);
    };
    /**
     * 处理节点
     * @param vnode  虚拟节点
     * @param container 容器
     */
    const processElement = (n1, n2, container, parentComponent) => {
        /**区分初始化/更新节点 */
        if (!n1)
            mountElement(n2, container, parentComponent);
        else
            patchElement(n1, n2);
    };
    /**
     *
     * @param n1 旧节点
     * @param n2 新节点
     * @param container  容器
     */
    const patchElement = (n1, n2, container) => {
        console.log('patchElement');
        console.log('n1', n1);
        console.log('n2', n2);
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);
        patchProps(el, oldProps, newProps);
    };
    const EMPTY_OBJ = {};
    /**
     *
     * @param oldProp
     * @param newProp
     */
    const patchProps = (el, oldProp, newProp) => {
        if (oldProp !== newProp) {
            for (const key in newProp) {
                const prevProp = oldProp[key];
                const nextProp = newProp[key];
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            if (oldProp !== EMPTY_OBJ) {
                for (const key in oldProp) {
                    if (!(key in newProp))
                        hostPatchProp(el, key, oldProp[key], null);
                }
            }
        }
    };
    /**
     * 生成el
     * @param vnode 虚拟节点
     * @param container 容器
     */
    const mountElement = (vnode, container, parentComponent) => {
        const { type, children, props, shapeFlag } = vnode;
        /**存储组件根元素到虚拟节点上 */
        const el = (vnode.el = hostCreateElement(type));
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILREN */) {
            mountChildren(vnode, el, parentComponent);
        }
        for (const key in props) {
            const val = props[key];
            hostPatchProp(el, key, null, val);
        }
        // container.append(el)
        hostInsert(el, container);
    };
    const mountChildren = (vnode, container, parentComponent) => {
        vnode.children.forEach(v => patch(null, v, container, parentComponent));
    };
    /**
     *处理组件
     * @param vnode 虚拟节点
     * @param container 容器
     */
    const processComponent = (n1, n2, container, parentComponent) => {
        mountComponent(n2, container, parentComponent);
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
        effect(() => {
            if (!instance.isMonted) {
                console.log('init');
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container, instance);
                initinalVNode.el = subTree.el;
                instance.isMonted = true;
            }
            else {
                console.log('update');
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                console.log('current:', subTree);
                console.log('prev:', prevSubTree);
                patch(prevSubTree, subTree, container, instance);
            }
        });
    };
    return {
        createApp: createAppApi(render)
    };
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

/**
 * 创建元素节点
 * @param type
 * @returns
 */
const createElement = type => {
    return document.createElement(type);
};
/**
 * 处理元素属性
 * @param el
 * @param key
 * @param val
 */
const patchProp = (el, key, peveVal, nextVal) => {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextVal);
    }
    else {
        if (nextVal === undefined || nextVal === null)
            el.removeAttribute(key);
        else
            el.setAttribute(key, nextVal);
    }
};
/**
 * 插入元素节点
 * @param el
 * @param container
 */
const insert = (el, container) => {
    container.append(el);
};
const renderer = createRenderer({
    createElement,
    patchProp,
    insert
});
const createApp = (...args) => renderer.createApp(...args);

exports.computed = computed;
exports.createApp = createApp;
exports.createReactiveObject = createReactiveObject;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.isProxy = isProxy;
exports.isReactive = isReactive;
exports.isReadonly = isReadonly;
exports.isRef = isRef;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.renderSlots = renderSlots;
exports.shallowReadonly = shallowReadonly;
exports.unRef = unRef;
