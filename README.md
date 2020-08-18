# Vue源码系列

### Vue工作机制

![image-20200808211550739](https://github.com/Hjw52/yooki/raw/master/images/image-20200808211550739.png)

#### 初始化

new Vue() 时会调⽤_init()进⾏初始化，会初始化各种实例⽅法、全局⽅法、执⾏⼀些⽣命周期、 初始化props、data等状态。其中最重要的是data的响应化处理。 初始化之后调⽤ $mount 挂载组件，主要执⾏编译和⾸次更新

#### 编译

编译模块分为三个阶段 

1. parse：使⽤正则解析template中的vue的指令(v-xxx) 变量等等 形成抽象语法树AST 
2. optimize：标记⼀些静态节点，⽤作后⾯的性能优化，在diff的时候直接略过 

3. generate：把第⼀部⽣成的AST 转化为渲染函数 render function

#### 虚拟DOM

Virtual DOM 是react⾸创，Vue2开始⽀持，就是⽤ JavaScript 对象来描述dom结构，数据修改的时候，我们先修改虚拟dom中的数据，然后数组做diff，最后再汇总所有的diff，⼒求做最少的dom操作， 毕竟js⾥对⽐很快，⽽真实的dom操作太慢。

```javascript
// vdom
{
 tag: 'div',
 props:{
 name:'哈哈',
 style:{color:red},
 onClick:xx
 }
 children: [
 {
 tag: 'a',
 text: 'click me'
 }
 ]
}
```

```html
//真实DOM
<div name="哈哈" style="color:red" @click="xx">
 <a>
 click me
 </a>
</div>
```

### 更新

数据修改触发setter，然后监听器会通知进⾏修改，通过对⽐新旧vdom树，得到最⼩修改，就 是 patch ，然后只需要把这些差异修改即可。

![image-20200809122501955](https://github.com/Hjw52/yooki/raw/master/images/image-20200809122501955.png)

#### init初始化

```
function Vue (options) {
 if (process.env.NODE_ENV !== 'production' &&
 !(this instanceof Vue)
 ) {
 warn('Vue is a constructor and should be called with the `new` keyword')
 }
 this._init(options)
}
initMixin(Vue) // 实现上⾯的_init这个初始化⽅法
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)
```

#### initMixin

```
initLifecycle(vm)
initEvents(vm)
initRender(vm)
callHook(vm, 'beforeCreate')
initInjections(vm) // resolve injections before data/props
initState(vm)
initProvide(vm) // resolve provide after data/props
callHook(vm, 'created')

```

- initLifecycle： parent,children等 
- initEvents：事件监听初始化 
- initRender：定义$createElement 
- initInjections: 获取注⼊数据并做响应化 
- initState：初始化props,methods,data,computed,watch等 
- initProvide：注⼊数据处理

#### watch与dep

watch与dep有可能多对多，需要相互引用。

```javascript
addDep (dep: Dep) {
 const id = dep.id
 if (!this.newDepIds.has(id)) {
 this.newDepIds.add(id)
 this.newDeps.push(dep)
 if (!this.depIds.has(id)) {
 dep.addSub(this)
 }
 }
}
```

#### nextTick

异步更新

```
<span id="s">{{foo}}</span>
s.innerHTML // foo
this.foo = 'bar'
s.innerHTML // foo
this.$nextTick(()=>{
 s.innerHTML // bar
})
```

queueWatcher 将watcher推⼊队列，下个刷新周期执⾏批量任务，这是vue异步更新实现的关键。

```
queue.push(watcher)
nextTick(flushSchedulerQueue)
```

nextTick将flushSchedulerQueue加⼊回调数组，启动timerFunc准备执⾏。nextTick后才能拿到数据更新后的DOM，属于微任务队列。

```
callbacks.push(() => cb.call(ctx))
timerFunc()
```

timerFunc指定了vue异步执⾏策略，根据执⾏环境，⾸选Promise，备选依次为： MutationObserver、setImmediate、setTimeout。

#### 数组响应式

数组⽐较特别，它的操作⽅法不会触发setter，需要特别处理 Observer 把修改过的数组拦截⽅法替换到当前数组对象上可以改变其⾏为。

```
if (Array.isArray(value)) {
 if (hasProto) {
 //数组存在原型就覆盖其原型
 protoAugment(value, arrayMethods)
 } else {
 //不存在就直接定义拦截⽅法
 copyAugment(value, arrayMethods, arrayKeys)
 }
 this.observeArray(value)
}
```

arrayMethods 修改数组7个变更⽅法使其可以发送更新通知。

```
methodsToPatch.forEach(function (method) {
 // cache original method
 const original = arrayProto[method]

 def(arrayMethods, method, function mutator (...args) {
 //该⽅法默认⾏为
 const result = original.apply(this, args)
 //得到observer
 const ob = this.__ob__
 let inserted
 switch (method) {
 case 'push':
 case 'unshift':
 inserted = args
 break
 case 'splice':
 inserted = args.slice(2)
 break
 }
 if (inserted) ob.observeArray(inserted)
 // 额外的事情是通知更新
 ob.dep.notify()
 return result
 })
})
```

#### Patch

patch的核⼼diff算法：通过同层的树节点进⾏⽐较⽽⾮对树进⾏逐层搜索遍历的⽅式，所以 时间复杂度只有O(n)，是⼀种相当⾼效的算法。 同层级只做三件事：增删改。具体规则是：new VNode不存在就删；old VNode不存在就增；都存在就⽐较类型，类型不同直接替换、类型相同执⾏更新。

```
 return function patch (oldVnode, vnode, hydrating, removeOnly) {
    if (isUndef(vnode)) {
      if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
      return
    }

    let isInitialPatch = false
    const insertedVnodeQueue = []

    if (isUndef(oldVnode)) {
      // empty mount (likely as component), create new root element
      /*oldVnode不存在则创建新节点*/
      isInitialPatch = true
      createElm(vnode, insertedVnodeQueue)
    } else {
    	/*oldVnode有nodeType，说明传递进来⼀个DOM元素*/
      const isRealElement = isDef(oldVnode.nodeType)
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // patch existing root node
        /*是组件且是同⼀个节点的时候打补丁*/
        patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
      } else {
      /*传递进来oldVnode是dom元素*/
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
            oldVnode.removeAttribute(SSR_ATTR)
            hydrating = true
          }
          if (isTrue(hydrating)) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true)
              return oldVnode
            } else if (process.env.NODE_ENV !== 'production') {
              warn(
                'The client-side rendered virtual DOM tree is not matching ' +
                'server-rendered content. This is likely caused by incorrect ' +
                'HTML markup, for example nesting block-level elements inside ' +
                '<p>, or missing <tbody>. Bailing hydration and performing ' +
                'full client-side render.'
              )
            }
          }
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          // 将该dom元素清空
          oldVnode = emptyNodeAt(oldVnode)
        }

        // replacing existing element
        const oldElm = oldVnode.elm
        const parentElm = nodeOps.parentNode(oldElm)

        // create new node
        createElm(
          vnode,
          insertedVnodeQueue,
          // extremely rare edge case: do not insert if old element is in a
          // leaving transition. Only happens when combining transition +
          // keep-alive + HOCs. (#4590)
          oldElm._leaveCb ? null : parentElm,
          nodeOps.nextSibling(oldElm)
        )

        // update parent placeholder node element, recursively
        if (isDef(vnode.parent)) {
          let ancestor = vnode.parent
          const patchable = isPatchable(vnode)
          while (ancestor) {
            for (let i = 0; i < cbs.destroy.length; ++i) {
              cbs.destroy[i](ancestor)
            }
            ancestor.elm = vnode.elm
            if (patchable) {
              for (let i = 0; i < cbs.create.length; ++i) {
                cbs.create[i](emptyNode, ancestor)
              }
              // #6513
              // invoke insert hooks that may have been merged by create hooks.
              // e.g. for directives that uses the "inserted" hook.
              const insert = ancestor.data.hook.insert
              if (insert.merged) {
                // start at index 1 to avoid re-invoking component mounted hook
                for (let i = 1; i < insert.fns.length; i++) {
                  insert.fns[i]()
                }
              }
            } else {
              registerRef(ancestor)
            }
            ancestor = ancestor.parent
          }
        }

        // destroy old node
        if (isDef(parentElm)) {
          removeVnodes([oldVnode], 0, 0)
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode)
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
    return vnode.elm
  }
```

