//算法的实现与引用分开
//改进多层if else 多用于表单验证等

//原始模式
//定义算法
var calculateBonus = function( performanceLevel, salary ){
    if ( performanceLevel === 'S' ){
    return salary * 4;
    }
    if ( performanceLevel === 'A' ){
    return salary * 3;
    }
    if ( performanceLevel === 'B' ){
    return salary * 2;
    }
   };
//应用
   calculateBonus( 'B', 20000 ); 
   calculateBonus( 'S', 6000 ); 

//策略模式
//抽出算法
var strategies = {
    "S": function( salary ){
    return salary * 4;
    },
    "A": function( salary ){
    return salary * 3;
    },
    "B": function( salary ){
    return salary * 2;
    }
   };
    var calculateBonus = function( level, salary ){
    return strategies[ level ]( salary );
   };
   //应用
   console.log( calculateBonus( 'S', 20000 ) );// 输出:80000
   console.log( calculateBonus( 'A', 10000 ) );