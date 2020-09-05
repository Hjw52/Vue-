class Event{
    //事件回调
    constructor(){
        this.callbacks={}
    }
    //设置监听方法
    on(name,fn){
        if(this.callbacks[name]){
            //key:callbacks[name] value:回调函数
            this.callbacks[name].push(fn);
        }else{
            this.callbacks[name]=[];
            this.callbacks[name].push(fn);
        }
    }
     //触发监听方法
     emit(name,args){
        let cb=this.callbacks[name];
        if(cb){
            cb.forEach(c=>{
                //执行
                c.call(this,args)
            })
        }
     }
      //取消监听方法
    off(name){
        this.callbacks[name]=null;
    }
}
let event=new Event();
//注册监听
event.on('回调1',(arg)=>{console.log('执行回调1:'+arg)})
event.on('回调1',(arg)=>{console.log('执行回调1 副本:'+arg)})
event.on('回调2',(arg)=>{console.log('执行回调2:'+arg)})
//触发事件
event.emit('回调1','哈哈哈哈')
event.emit('回调2','就这')
event.off('回调1');
event.off('回调2');
console.log('取消监听================')
event.emit('回调1','哈哈哈哈')
event.emit('回调2','就这')
console.log('什么都没有================')