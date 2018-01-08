/**
 * @author: yxxu_web@sina.com
 * @description:
 * @Date: 2018/1/8 10:51
 */


(function ( win, doc, undefined ) {
    var id = 'getElementById',
        tag = 'getElementsByTagName',
        MOD_NAME = 'laypage',
        DISABLED = 'layui-disabled',
        OBJECT = 'object',
        Laypage = function (options) {
            var that = this;
            that.config = options || {};
            that.config.index = ++laypage.index;
            that.inputValue = that.config.index;
            that.render(true);
        };
        
    Laypage.prototype.type = function (  ) {
        var config = this.config;
        if (typeof config.elem === 'object') {
            return config.elem.length === undefined ? 2 : 3
        }
    }

    Laypage.prototype.view = function (  ) {
        var that = this,
            config = that.config,
            groups = config.groups = 'groups' in config ? (config.groups|0) : 5;

        config.layout = typeof config.layout === OBJECT ? config.layout : ['prev', 'page', 'next'];
        config.count = config.count|0;
        config.curr = (config.curr|0) || 1;

        config.limits = typeof config.limits === OBJECT ? config.limits : [10, 20, 30, 40, 50];
        config.limit = (config.limit|0) || 10;

        config.pages = Math.ceil(config.count/config.limit) || 1;

        if (config.curr > config.pages) {
            config.curr = config.pages;
        }

        if (groups < 0) {
            groups  = 1;
        } else if (groups > config.pages) {
            groups = config.pages
        }

        config.prev = 'prev' in config ? config.prev : '&#x4E0A;&#x4E00;&#x9875;';
        config.next = 'next' in config ? config.next : '&#x4E0B;&#x4E00;&#x9875;';

        //计算当前组
        var index = config.pages > groups ?
            Math.ceil( (config.curr + (groups > 1 ? 1 : 0)) / (groups > 0 ? groups : 1) ) :
            1,
            views= {
                prev: function () {
                    return config.prev
                        ? '<a href="javascript:;" class="layui-laypage-prev'+ (config.curr == 1 ? (' ' + DISABLED) : '') +'" data-page="'+ (config.curr - 1) +'">'+ config.prev +'</a>'
                        : '';
                }(),
                page: function () {
                    var pager = [];

                    if ( config.count < 1) {
                        return "";
                    }

                    if (index > 1 && config.first !== false && groups !== 0) {
                        pager.push('<a href="javascript:;" class="layui-laypage-first" data-page="1"  title="&#x9996;&#x9875;">'+ (config.first || 1) +'</a>');
                    }

                    var halve = Math.floor((groups-1)/2),   // 页码数等分
                        start = index > 1 ? config.curr - halve : 1,
                        end = index > 1 ?
                            (function (){
                                var max = config.curr + (groups - halve - 1);
                                return max > config.pages ? config.pages : max;
                            }()) :
                            groups;

                    //防止最后一组出现“不规定”的连续页码数
                    if ( end - start < groups -1 ) {
                        start = end - groups + 1;
                    }

                    if (config.first !== false && start > 2) {
                        pager.push('<span class="layui-laypage-spr">&#x2026;</span>')
                    }

                    for (;start <= end; start++) {
                        if (start === config.curr) {
                            pager.push('<span class="layui-laypage-curr"><em class="layui-laypage-em" '+ (/^#/.test(config.theme) ? 'style="background-color:'+ config.theme +';"' : '') +'></em><em>'+ start +'</em></span>')
                        } else {
                            pager.push('<a href="javascript:;" data-page="'+ start +'">'+ start +'</a>');
                        }
                    }

                    if (config.pages > groups && config.pages > end && config.last !== false) {
                        if ( end + 1 < config.pages ) {
                            pager.push('<span class="layui-laypage-spr">&#x2026;</span>')
                        }
                        if (groups !== 0) {
                            pager.push('<a href="javascript:;" class="layui-laypage-last" title="&#x5C3E;&#x9875;"  data-page="'+ config.pages +'">'+ (config.last || config.pages) +'</a>')
                        }
                    }

                    return pager.join('');

                }(),
                next: function () {
                    return config.next
                        ? '<a href="javascript:;" class="layui-laypage-next' + (config.curr == config.pages ? (' ' + DISABLED) : '') + '" data-page="' + (config.curr + 1) + '">' + config.next + '</a>'
                        : '';
                }(),
                count: function () {
                    return '<span class="">共 '+ config.count +'条</span>';
                }(),
                limit: function () {
                    var options = ['<span class="layui-laypage-limits"><select lay-ignore>']
                    for (var i = 0; i < config.limits.length; i++ ) {
                        options.push(
                            '<option value="' + config.limits[i] + '"' +
                            (config.limits[i] === config.limit ? 'selected' : '') +
                            '>' + config.limits[i] + '条/页</option>'
                        );
                    }

                    return options.join('') + '</select></span>';
                }(),
                skip: function () {
                    return ['<span class="layui-laypage-skip">&#x5230;&#x7B2C;','<input type="text" min="1" value="'+ config.curr +'" class="layui-input">','&#x9875;<button type="button" class="layui-laypage-btn">&#x786e;&#x5b9a;</button>','</span>'].join('')
                }()
            };
        return ['<div class="layui-box layui-laypage layui-laypage-'+ (config.theme ? (
            /^#/.test(config.theme) ? 'molv' : config.theme
        ) : 'default') +'" id="layui-laypage-'+ config.index +'">', function (){
            var palte = [];
            for (var i = 0; i < config.layout.length; i++) {
                var item = config.layout[i];
                if(views[item]){
                    palte.push(views[item])
                }
            };
            return palte.join('');
        }(),'</div>'].join('');
    }

    Laypage.prototype.jump = function ( elem, isskip ) {
        if (!elem) return ;
        var that = this,
            config = that.config,
            childs = elem.children,
            btn = elem[tag]('button')[0],
            input = elem[tag]('input')[0],
            select = elem[tag]('select')[0],
            skip = function (  ) {
              var curr = input.value.replace(/\s|\D/g, '') | 0;
              if (curr) {
                  config.curr = curr;
                  that.render();
              }
            };

        if (isskip) return skip();

        for (var i = 0, len = childs.length; i <len; i++) {
            if (childs[i].nodeName.toLowerCase() === 'a') {
                laypage.on(childs[i],'click', function () {
                    var curr = this.getAttribute('data-page') | 0;
                    if (curr < 1 || curr > config.pages ) {
                        return
                    }
                    config.curr = curr;
                    that.render()
                })
            }
        }

        if (select) {
            laypage.on(select, 'change', function (){
                var value = this.value;
                if (config.curr * value > config.count) {
                    config.curr = Math.ceil(config.count/value);
                }
                config.limit = value;
                that.render();
            })
        }

        if (btn) {
            laypage.on(btn, 'click', function () {
                var curr = input.value.replace(/\s|\D/g, '') | 0;
                skip();
            })
        }
    }

    Laypage.prototype.skip = function ( elem ) {
        if (!elem) return;
        var that = this,
            input = elem[tag]('input')[0];

        if (!input) return

        laypage.on(input, 'keyup', function (e){
            var value = this.value,
                keycode = e.keyCode;

            if (/^(37|38|39|40)$/.test(keycode)) return

            if (/\D/.test(value)) {
                this.value = value.replace(/\D/, '')
            }

            if (keycode === 13) {
                that.jump(elem,  true)
            }
        })
    }

    Laypage.prototype.render = function (load) {
        var that = this,
            config = that.config,
            type = that.type(),
            view = that.view();
        if (type === 2) {
            config.elem && (config.elem.innerHTML = view)
        } else if (type === 3) {
            config.elem.html(view);
        } else {
            if(doc[id](config.elem)){
                doc[id](config.elem).innerHTML = view;
            }
        }

        config.jump && config.jump(config, load);

        var elem = doc[id]('layui-laypage-' + config.index);
        that.jump(elem);

        if (config.hash && !load) {
            location.hash = '!' + config.hash + '=' + config.curr;
        }

        that.skip(elem);
    }

    var laypage = {
        render: function(options){
            var o = new Laypage(options);
            return o;
        },
        index: 0,
        on: function(elem, even, fn){
            elem.attachEvent ? elem.attachEvent('on'+ even, function(e){ //for ie
                e.target = e.srcElement;
                fn.call(elem, e);
            }) : elem.addEventListener(even, fn, false);
            return this;
        }
    }

    /**
     * limits ------- 每页条数的选择项
     * limit ------- 每页显示多少条
     * groups ------- 连续显示多少页
     * count ------- 一共有多少数据
     * pages ------- 一共又多少页
     * curr ------- 当前属于哪页
     * prev ------- 上一页
     * next ------- 下一页
     * first ------- 首页
     * last ------- 尾页
     * theme ------- 选中的背景色
     */

    window.laypage = laypage;

})(window,document)