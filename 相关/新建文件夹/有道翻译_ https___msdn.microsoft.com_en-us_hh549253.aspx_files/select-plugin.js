/**
 * Created with IntelliJ IDEA.
 * User: yuanzhen
 * Date: 12-7-11
 * Time: 下午2:22
 * To change this template use File | Settings | File Templates.
 */
(function ($) {

    $.fn.sel = function (options) {
        var opts = $.extend({}, $.fn.sel.defaults, options);
        var $this = $(this);
        var $selectOption = $('<ul id="' + opts.containerId + '"></ul>').appendTo($this).addClass('sel');

        //语言选择选项
        if (typeof opts.number == 'number') {
            var numbers = (opts.number <= opts.hintList.length) ? opts.number : opts.hintList.length;
            for ( var i = 0; i < numbers; i++){
                $selectOption.append(
                    '<li class="'+opts.hintList[i].liClass+'">' +
                        '<a val="'+ opts.hintList[i].val +'" href="#">'+ opts.hintList[i].liText + '</a>' +
                    '</li>'
                )
            }
        } else if(typeof opts.number !== 'number'){
            throw ('number选项必须为数字');
        }

      //点击选择按钮，显示选项
        $this.click(function () {
            $selectOption.toggle().show();
            return false;
        });

        //点击页面其他位置隐藏语言类型选择框
        $('body').click(function(){
            $selectOption.hide();
            $('#customSelectBtn').removeClass('focus');
        });

        $selectOption.find('li a').click(function() {
            var selectVal = $(this).attr('val');
            opts.callback(selectVal);
            $this.toggleClass('focus');
            $('#customSelectVal').val(selectVal);
            $this.find('.btn_text').text($(this).text());
            $selectOption.hide();
            $this.removeClass('focus');
            $selectOption.find('.on').removeClass('on');
            $(this).parent().addClass('on');
            return false;
        });

        return $this;
    }

    $.fn.sel.defaults = {
        number:13,
        hintList:[
            {val: 'AUTO', liText: '自动检测语言', liClass : 'normal'},
            {val: 'ZH_CN2EN', liText: '中文&nbsp; » &nbsp;英语', liClass : 'isfl topBorder1'},
            {val: 'EN2ZH_CN', liText: '英语&nbsp; » &nbsp;中文', liClass : 'isfl rightBorder topBorder'},
            {val: 'ZH_CN2JA', liText: '中文&nbsp; » &nbsp;日语', liClass : 'isfl'},
            {val: 'JA2ZH_CN', liText: '日语&nbsp; » &nbsp;中文', liClass : 'isfl rightBorder'},
            {val: 'ZH_CN2KR', liText: '中文&nbsp; » &nbsp;韩语', liClass : 'isfl'},
            {val: 'KR2ZH_CN', liText: '韩语&nbsp; » &nbsp;中文', liClass : 'isfl rightBorder'},
            {val: 'ZH_CN2FR', liText: '中文&nbsp; » &nbsp;法语', liClass : 'isfl'},
            {val: 'FR2ZH_CN', liText: '法语&nbsp; » &nbsp;中文', liClass : 'isfl rightBorder'},
            {val: 'ZH_CN2RU', liText: '中文&nbsp; » &nbsp;俄语', liClass : 'isfl'},
            {val: 'RU2ZH_CN', liText: '俄语&nbsp; » &nbsp;中文', liClass : 'isfl rightBorder'},
            {val: 'ZH_CN2SP', liText: '中文&nbsp; » &nbsp;西班牙语', liClass : 'isfl'},
            {val: 'SP2ZH_CN', liText: '西班牙语&nbsp; » &nbsp;中文', liClass : 'isfl rightBorder'}
        ],
        containerId: 'customSelectOption',
        init: function(){},
        callback: function(){}
    }

})(jQuery);