var $          = require('jquery'),
    handlebars = require('handlebars'),
    event      = require('./src/event'),
    paging     = require('./src/paging'),
    status     = require('./src/status');

// 引入模板帮助函数集
require('handlebarsHelper');

// 分页接口（这里需要配置）
var ROWS = 'rows', // 条数
    PAGE = 'page', // 当前页
    PAGE_COUNT = 'pageCount';// 分页总数


// 类名常量
var classPrefix = 'ui-load-';
var CLASS = constClass(classPrefix);


var LoadWidget = function(options) {
    this.setup(options);
};

LoadWidget.prototype = {

    constructor: LoadWidget,

    DEFAULT: {
        url: '', // 接口地址(必须)
        container: '', // load-container 容器对象(必须)
        tpl: '', // 可以是模板路径或者是要解析的字符串(必须)
        noListStr: '暂无记录', // 无记录时，显示的文本(缺省)
        sendData: {}, // 默认发送的data数据(缺省)  去除了page :1，不可为null
        pageType: 'none', // 分页类型(缺省)
        tplFn:null,   // 传入data解析成html函数
        callback: null   // 载入完成后的回调函数(缺省)(用于绑定事件，注意尽量事件委托，并注意先off，免得重复绑定)
    },

    setup: function(options){
        this._initAttr(options);
        this._initDom();
        this.load();
        this.render();
    },

    _initAttr: function(options){
        this.config = dictionary($.extend({}, this.DEFAULT, options));
        var container = this.config.get('container');
        this.container = typeof container === "object" ? container : $(container);
        this.isPaging = function(){return this.config.get('pageType') !== 'none';};
    },

    _initDom: function(){
        var html = '<div class="' + CLASS.CONTENT + '"></div>';
        this.container.addClass(CLASS.CONTAINER).html(html);
    },

    _load: function(){
        var isPaging = this.isPaging,
            container = this.container,

            sendData = this.config.get('sendData'),
            url = this.config.get('url'),
            tpl = this.config.get('tpl'),
            tplFn = this.config.get('tplFn');

        var result = {};

        container.addClass(CLASS.LOADING_CLASS);

        $.ajax({
            url: url,
            async: true,
            data: sendData,
            dataType: 'json',
            success: function(data) {
                _generateHtml(data, self);
                if(isPaging){
                    var backData = dictionary({});
                    backData.set(PAGE, data[PAGE]);
                    backData.set(PAGE_COUNT, data[PAGE_COUNT]);
                    event.trigger('backData', backData);
                }
            },
            error: function() {
                _reqError();
            }
        });

        function _generateHtml(data){
            if (!data[ROWS] || data[ROWS].length <= 0) event.trigger('noData');

            var template,html;

            if (tpl === ''){
                html = tplFn ? tplFn(data) : "";
            } else {
                template = handlebars.default.compile(tpl); // 特别注明该处模版编译方法调用方式因版本而异
                html = template(data);
            }

            event.trigger('hasData', data, html);
        }

        function _reqError(){
            event.trigger('fail');
        }
    },

    load: function(){
        this._load();

        if(!this.isPaging) return;

        var args = {
            load: bind(this.load, this),
            sendData: dictionary(this.config.get('sendData')),
            container: this.container
        };

        var pageType = this.config.get('pageType');

        var generatePaging = getSingle(paging(pageType));
        generatePaging().setup(args);
    },

    query: function(sendData){
        var originSendData = this.config.get('sendData');
        originSendData[PAGE] = 1;
        $.extend(originSendData,sendData);
        this.load();
    },

    render: function(html){
        var self = this,
            container = this.container,
            content = container.children('.' + CLASS.CONTENT),
            callback = this.config.get('callback');

        event.one("hasData", function(data, html){
            removeStatus();
            content.html(html);
            callback && callback.call(null, true , data);
        });
        event.one("noData", function(){
            removeStatus();
            var noListStr = self.get('noListStr');
            status.noData(content, noListStr);
            callback && callback.call(null, false , data);
        });
        event.one("fail", function(){
            removeStatus();
            var reLoad = bind(self.load, self);
            status.again(content, reLoad);
        });

        function removeStatus(){
            status.removeNoData(content);
            container.removeClass(CLASS.LOADING_BG);
        }
    }
};

module.exports = LoadWidget;

// Helper
// 绑定作用域
function bind(fn, context) {
    if (arguments.length < 2 && context === undefined) return fn;
    var method = fn,
        slice = Array.prototype.slice,
        args = slice.call(arguments, 2);
    return function() { //这里传入原fn的参数
        var array = slice.call(arguments, 0);
        return method.apply(context, args.concat(array));
    };
}

// 生成字典对象
function dictionary(options){
    return {
        set: function(key, value){
            options[key] = value;
        },
        get: function(key){
            return options[key];
        },
        reset: function(){
            options = {};
        }
    };
}

// 生成类名对象
function constClass(classPrefix) {
    return {
        CONTAINER: classPrefix + 'container',
        CONTENT: classPrefix + 'content',
        LOADING_BG: classPrefix + 'bg'
    };
}

// 生成惰性单例
function getSingle(fn){
    var result;
    return function(){
        return result || (result = fn.apply(this, arguments));
    };
}