if(self != top) {
    var logoLink = document.getElementById("logo");
    if (logoLink != null) {
        logoLink.target = "_blank";
    }
    var returnLink = document.getElementById("returnLink");
    if (returnLink != null) {
        returnLink.target = "_blank";
    }
    var feedbackLink = document.getElementById("feedbackLink");
    if (feedbackLink != null) {
        feedbackLink.target = "_blank";
    }
}

var LANGUAGETYPES = {
    'AUTO': '自动检测语言',
    'EN2ZH_CN':  '英语&nbsp; &raquo; &nbsp;中文',
    'ZH_CN2EN': '中文&nbsp; &raquo; &nbsp;英语',
    'JA2ZH_CN': '日语&nbsp; &raquo; &nbsp;中文',
    'ZH_CN2JA': '中文&nbsp; &raquo; &nbsp;日语',
    'FR2ZH_CN': '法语&nbsp; &raquo; &nbsp;中文',
    'ZH_CN2FR': '中文&nbsp; &raquo; &nbsp;法语',
    'KR2ZH_CN': '韩语&nbsp; &raquo; &nbsp;中文',
    'ZH_CN2KR': '中文&nbsp; &raquo; &nbsp;韩语',
    'RU2ZH_CN': '俄语&nbsp; &raquo; &nbsp;中文',
    'ZH_CN2RU': '中文&nbsp; &raquo; &nbsp;俄语',
    'SP2ZH_CN': '西班牙语&nbsp; &raquo; &nbsp;中文',
    'ZH_CN2SP': '中文&nbsp; &raquo; &nbsp;西班牙语'
};

//初始化input的值
var init = function (type) {
    var lang = (type === undefined) ? LANGUAGETYPES[' AUTO '] : LANGUAGETYPES[type];
    $('#customSelectVal').val(type);
    $('.btn_text').html(lang);
};

var getType = function () {
    var urlSearch = window.location.search;
    var paramStrings = urlSearch.substring(1, urlSearch.length).split('&');
    var ret = {};
    for (var i = 0, len = paramStrings.length; i < len; i++){
        var param = paramStrings[i];
        if((pair = param.split('='))[0]){
            var key = decodeURIComponent(pair.shift());
            var value = pair.length > 1 ? pair.join('=') : pair[0];
            if(value !== undefined){
                value = decodeURIComponent(value);
            }
            if(key in ret){
                if(ret[key].constructor !== Array){
                    ret[key] = [ret[key]];
                }
                ret[key].push(value);
            }else{
                ret[key] = value;
            }
        }
    }
    return ret;
};

$(document).ready(function() {
    $('#customSelectBtn').sel({
        init: init(getType()['type'])
    });
});