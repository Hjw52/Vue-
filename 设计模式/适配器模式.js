// renderMap 接口格式符合 可以输出
var googleMap = {
    show: function(){
    console.log( '开始渲染⾕歌地图' );
    }
   };
// renderMap 接口格式不符合 
   var baiduMap = {
    display: function(){
    console.log( '开始渲染百度地图' );
    }
   };
//适配器 承上启下 不改变百度地图内部实现
   var baiduMapAdapter = {
    show: function(){
    return baiduMap.display();
    }
   };
// renderMap只接受对象的show方法为参数
//但百度地图没有show方法
// 如果我们要输出百度地图 则要借助适配器

renderMap( googleMap ); // 输出:开始渲染⾕歌地图
renderMap( baiduMapAdapter ); // 输出:开始渲染百度地图