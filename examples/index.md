# Demo

---

## Normal usage

<link rel="stylesheet" href="../src/pagination.css">

````html

<div id="container"></div>

````


````javascript
var Mock = require('mockjs');
var data = Mock.mock(/\.json/, {
    'rows|1-10': [{
        'id|+1': 1
    }],
    'page|+1': 1,
    'pageCount|1-100': 1
});

var tpl = "{{#each rows}}<li>{{id}}</li>{{/each}}";

var loadData = require('load-data');

new loadData({
    url: 'api.json', // 接口地址(必须)
    container: '#container', // load-container 容器对象(必须)
    tpl: tpl, // 可以是模板路径或者是要解析的字符串(必须)
    noListStr: '暂无记录', // 无记录时，显示的文本(缺省)
    sendData: {}, // 默认发送的data数据(缺省)  去除了page :1，不可为null
    pageType: 'default', // 分页类型(缺省)
    tplFn:null,   // 传入data解析成html函数
    callback: null   // 载入完成后的回调函数(缺省)(用于绑定事件，注意尽量事件委托，并注意先off，免得重复绑定)
})
````
