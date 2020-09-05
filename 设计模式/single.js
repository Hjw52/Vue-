 //闭包返回res 对应实例 
 function getSingle(fn){
    var res;
    return function(){
        return res||(res=fn.apply(this,arguments));
    }
}
function model(){
   console.log('创建实例=====');
   //return 很重要 没有return 无效 等于res
   return 1;
}
var test=getSingle(model);//函数
setInterval(test,1000);//只输出一次console
  
