### Vue data

对于Vue data的响应式，只有当Vue实例被创建是已经存在于data的属性才是响应式的。对于后期新增的属性（直接赋值），如下所示是没有响应式。所以对于要用到的属性通常会在data初始化为空。

```
vm.xx='xxx';
```

当然，this.$set可以解决这个问题。

```
//this.$set(obj,key,val)
//往Vue实例data的user对象加入响应式属性age
this.$set(this.user, "age", 30) 
//修改数组对象的某一项
this.$set(this.arr, index, this.arr[index]);
```

往响应式对象this.$data中添加一个属性，并确保这个新属性同样是响应式的，且触发视图更新。而如果要对某属性取消响应式变化则可使用

```
Object.freeze(obj)
```

这样Vue实例data中的obj属性将不会响应式变化。

### .sync与v-model

![image-20200802155840381](C:\Users\DELL\AppData\Roaming\Typora\typora-user-images\image-20200802155840381.png)

![image-20200802155020694](C:\Users\DELL\AppData\Roaming\Typora\typora-user-images\image-20200802155020694.png)

## vue实例

1. #### vm.$attrs（Vue 2.4新增）

官方介绍：包含了父作用域中不作为 prop 被识别 (且获取) 的特性绑定 (class 和 style 除外)。当一个组件没有声明任何 prop 时，这里会包含所有父作用域的绑定 (class 和 style 除外)，并且可以通过 v-bind="$attrs" 传入内部组件。**===>**大体意思就是父组件传值给子组件 子组件如果没有申明props数组接收 那些这些值都在$attrs，如果声明了props数组接收 那么剩下的都在$attrs。

**示例：**

```
<template>
  <div class="home">
    <mytest  :title="title" :massgae="massgae"></mytest>
  </div>
</template>
<script>
export default {
  name: 'home',
  data () {
    return {
      title:'父组件title',
      massgae:'父组件message'
    }
  },
  components:{
    'mytest':{
      template:`<div>这是个h1标题{{title}}</div>`,
      props:['title'],//注意 这边只接收title
      data(){
        return{
          message:'子组件message'
        }
      },
      created:function(){
        console.log(this.$attrs)//输出父组件message
      }
    }
  }
}
</script>
```

**运行结果：**

![image-20200804201156325](C:\Users\DELL\AppData\Roaming\Typora\typora-user-images\image-20200804201156325.png)

!![image-20200804201230385](C:\Users\DELL\AppData\Roaming\Typora\typora-user-images\image-20200804201230385.png)

这边注意到 子组件虽然没有接收massage属性 但却在界面渲染出来了。因为这是Vue默认的 如果不想渲染出来（或者子组件自己有属性怕覆盖）那么可以在子组件声明 **inheritAttrs: false**，组件将不会把未被注册的props呈现为普通的HTML属性，这样就不会渲染出来了。（**inheritAttrs官网原话：**默认情况下父作用域的不被认作 props 的特性绑定 (attribute bindings) 将会“回退”且作为普通的 HTML 特性应用在子组件的根元素上。当撰写包裹一个目标元素或另一个组件的组件时，这可能不会总是符合预期行为。通过设置 inheritAttrs 到 false，这些默认行为将会被去掉）

**用处：**$attrs在多代组件间传值可以提供大大的便利。通过v-bind='$attrs'可以多层传递下去。而$listeners 则可以在子孙组件更改父组件的值。

```
<template>
    <div>
        <childcom :name="name" :age="age" :sex="sex" @testChangeName="changeName"></childcom>
    </div>
</template>
<script>
export default {
    'name':'test',
    props:[],
    data(){
        return {
            'name':'张三',
            'age':'30',
            'sex':'男'
        }
    },
    components:{
        'childcom':{
            props:['name'],
            template:`<div>
                <div>我是子组件   {{name}}</div>
                //v-on="$listeners"不响应 向上传递 跨层响应
                <grandcom v-bind="$attrs" v-on="$listeners"></grandcom>
            </div>`,
           
            components: {
                'grandcom':{
                    template:`<div>我是孙子组件-------<button @click="grandChangeName">改变名字</button></div>`,
                    methods:{
                        grandChangeName(){
                           this.$emit('testChangeName','kkkkkk')
                        }
                    }
                }
            }
        }
    },
    methods:{
        changeName(val){
            this.name = val
        }
    }
}
</script>
```

