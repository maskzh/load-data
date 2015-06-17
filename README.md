## API
```js
- url: '',               // string, 接口地址(必须)
- container: '',         // string, 容器(必须)
- tpl: '',               // string, 要解析模板的字符串(必须)
- noListStr: '暂无记录',  // string, 无记录时，显示的文本(缺省)
- sendData: {},          // object, 默认发送的data数据(缺省)  去除了page :1，不可为null
- pageType: 'none',      // string, 分页类型(缺省)，需要分页使用'default'
- tplFn:null,            // function, 将data解析成html的函数（不依赖handlebars时使用）
- callback: null         // function, 载入完成后的回调函数(缺省)(用于绑定事件等等，注意尽量以container做事件委托)
```
## 调用方式

```html
<div id="container"></div>
```

```js
var loadData = require('load-data');

var tpl = "{{#each}} <li>{{id}}</li> {{/each}}"

new LoadData({
    url: '/path/to/api',
    container: '#container',
    tpl: tpl,
    noListStr: '暂无记录',
    sendData: {page: 2},
    pageType: 'default',
    callback: function(bl,data){
        if(bl){
            // bl为true，则表示有数据
        }else{
            // bl为false，则无数据
        }
    }
});
```

## 注意事项

- handlebars版本问题，编译方法我这里用的是`handlebars.default.compile`，一般使用的是`handlebars.compile`。
- 记得在 index.js 中引入 handlebarsHelp.js 模版帮助函数集。通过 spm build 生成 dist。可直接放到项目中。
- 分页样式，我这里使用 pagination.css。相关状态显示的函数都在status.js当中。
    - 无数据 .J_no_data（背景图容器） > .J_no_data_des（描述文本）
    - 请求失败 .J_again(容器) > .J_again_des(描述文本) ＋ .J_again_link(重试链接)


