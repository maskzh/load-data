var $ = require('jquery'),
    event = require('./event');

// sendData中的参数命名
var PAGE = 'page',
    PAGECOUNT = 'pageCount';

var PAGINATION_CLASS = 'ui-pagination',
    PAGINATION_PREV_CLASS = 'prev',
    PAGINATION_NEXT_CLASS = 'next',
    ACTIVE_CLASS = 'active',
    DISABLED_CLASS = 'disabled';

var Paging = function(){};

Paging.prototype = {

    constructor: Paging,

    _initAttr: function(args){
        this.container = args.container;
        this.sendData = args.sendData;
        this.load = args.load;
        this.sendData.get(PAGE) || this.sendData.set(PAGE, 1);
    },

    setup: function(args){
        this._initAttr(args);
        this.listen();
    },

    listen: function(){
        var self = this;
        event.one('backData', function(backData){
            var container = self.container;

            var page = self.page = backData.get(PAGE);
            var pageCount = self.pageCount = backData.get(PAGECOUNT);

            // 先将页面的DOM删除并解除绑定事件
            self.destory(container);

            if (pageCount <= 1) return;

            // 若页数大于1则开始分页
            var html = self._paging(page, pageCount);

            // 将分页html添加到DOM中并绑定事件
            container.append(html);

            self._bindHandler();
        });
    },

    _paging: function(){}, // 空方法，由子类复写
    _bindHandler:function(){}, // 空方法，由子类复写

    destory: function(container){
        container.off('click.paging').children('.' + PAGINATION_CLASS).remove();
    }

};

var PagingWithNumber = function(){};

PagingWithNumber.prototype = new Paging();

PagingWithNumber.prototype._paging = function(page, pageCount){
    var _pageCountSeparator = 10,
        _pageSeparator = 5;

    var _tpl = {
        prev: '<li class="' + PAGINATION_PREV_CLASS + '"><a href="javascript:;"><span>&laquo;</span> <span>上一页</span></a></li>',
        next: '<li class="' + PAGINATION_NEXT_CLASS + '"><a href="javascript:;"><span>下一页</span> <span>&raquo;</span></a></li>',
        item: '<li class="{{status}}"><a href="javascript:;" data-page="{{page}}">{{page}}</a></li>'
    };

    var _html = '<ul class="' + PAGINATION_CLASS + '">{{prev}}{{items}}{{next}}</ul>';

    var generateItems = function(){
        var itemHtml = "";
        var _pageCountL = function(){
            if(pageCount <= _pageCountSeparator){
                for (i = 1; i <= pageCount; i++) {
                    if (i === page) {
                        itemHtml += _tpl.item.replace(/{{page}}/g, i).replace(/{{status}}/, ACTIVE_CLASS);
                    } else {
                        itemHtml += _tpl.item.replace(/{{page}}/g, i).replace(/{{status}}/, '');
                    }
                }

                return;
            }
        };

        var _pageCountG = {
            pageInStart: function(){
                if(page < _pageSeparator){
                    for (var i = 1; i <= _pageSeparator; i++) {
                        if (i === page) {
                            itemHtml += _tpl.item.replace(/{{page}}/g, i).replace(/{{status}}/, ACTIVE_CLASS);
                        } else {
                            itemHtml += _tpl.item.replace(/{{page}}/g, i).replace(/{{status}}/, '');
                        }
                    }
                    itemHtml += _tpl.item.replace(/{{page}}/g, '...').replace(/{{status}}/, DISABLED_CLASS);
                    itemHtml += _tpl.item.replace(/{{page}}/g, pageCount).replace(/{{status}}/, '');

                    return;
                }
            },
            pageInMiddle: function(){
                if(page >= _pageSeparator && page <= pageCount - _pageSeparator - 1){
                    itemHtml += _tpl.item.replace(/{{page}}/g, 1).replace(/{{status}}/, '');
                    itemHtml += _tpl.item.replace(/{{page}}/g, '...').replace(/{{status}}/, DISABLED_CLASS);
                    for (var i = page - 2; i <= page + 2; i++) {
                        if (i === page) {
                            itemHtml += _tpl.item.replace(/{{page}}/g, i).replace(/{{status}}/, ACTIVE_CLASS);
                        } else {
                            itemHtml += _tpl.item.replace(/{{page}}/g, i).replace(/{{status}}/, '');
                        }
                    }
                    itemHtml += _tpl.item.replace(/{{page}}/g, '...').replace(/{{status}}/, DISABLED_CLASS);
                    itemHtml += _tpl.item.replace(/{{page}}/g, pageCount).replace(/{{status}}/, '');

                    return;
                }
            },
            pageInEnd: function(){
                if(page > pageCount - _pageSeparator - 1){
                    itemHtml += _tpl.item.replace(/{{page}}/g, 1).replace(/{{status}}/, '');
                    itemHtml += _tpl.item.replace(/{{page}}/g, '...').replace(/{{status}}/, DISABLED_CLASS);
                    for (var i = _pageSeparator - 1; i >= 0; i--) {
                        if (pageCount - i === page) {
                            itemHtml += _tpl.item.replace(/{{page}}/g, pageCount - i).replace(/{{status}}/, ACTIVE_CLASS);
                        } else {
                            itemHtml += _tpl.item.replace(/{{page}}/g, pageCount - i).replace(/{{status}}/, '');
                        }
                    }

                    return;
                }
            }
        };

        _pageCountL();
        _pageCountG.pageInStart();
        _pageCountG.pageInMiddle();
        _pageCountG.pageInEnd();

        return itemHtml;
    }

    function replaceHtml(){
        var itemHtml = generateItems();
        return _html.replace(/{{prev}}/, page > 1 ? _tpl.prev : "")
        .replace(/{{next}}/, page < pageCount ? _tpl.next : "")
        .replace(/{{items}}/, itemHtml);
    }

    return replaceHtml();
};

PagingWithNumber.prototype._bindHandler = function(){
    var self = this,
        page = this.page;

    var load = this.load,
        container = this.container,
        sendData = this.sendData;

    container.on("click.paging", "." + PAGINATION_CLASS + " > li:not( ." + PAGINATION_NEXT_CLASS + ", ." + PAGINATION_PREV_CLASS + ", ." + ACTIVE_CLASS + ", ." + DISABLED_CLASS + ") > a", function() {
        page = parseInt($(this).data("page"));
        callback(page);
    });

    container.on("click.paging", "." + PAGINATION_CLASS + " > ." + PAGINATION_NEXT_CLASS + " > a", function() {
        page = page + 1;
        callback(page);
    });

    container.on("click.paging", "." + PAGINATION_CLASS + " > ." + PAGINATION_PREV_CLASS + " > a", function() {
        page = page - 1;
        callback(page);
    });

    function callback(page){
        sendData.set(PAGE, page);
        load();
        if(container.offset().top <= $("body").scrollTop() || container.offset().top <= $("html").scrollTop()){
            $("html,body").scrollTop(content.offset().top-150);
        }
    }
};

function pagingFactory(pageType){
    if(pageType === "default" || pageType === "paging_long"){
        return function(){return new PagingWithNumber();}
    }
}

module.exports = pagingFactory;