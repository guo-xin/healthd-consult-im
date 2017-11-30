require('../../stylesheet/index.less');

let http = require('./common/http');
let info = require('./common/info');
let util = require('../im/util');
let im = require('./im');

//设置请求认证token
function setToken(roleCode) {
    let data = JSON.parse(localStorage.getItem(roleCode == 0 ? '_doctorInfo' : '_userInfo'));
    http.setToken(data.accessToken);

    info.set({
        appKey: data.easemobKey
    });
}

//后退控制
function handleBack() {
    //控制后退，指定后退页面
    let referrer = document.referrer || '';

    if (referrer.indexOf('addBasicInfo.html') != -1 || referrer.indexOf('doctorDescribe.html') != -1) {
        if (window.history && window.history.pushState) {
            window.addEventListener('popstate', function () {
                window.history.go(-3);
            });
            window.history.pushState('forward', '', '');
        }
    }
}

//获取token启动项目
(function () {
    let consultConversationId = util.getParams("consultConversationId");
    let code = util.getParams("code");
    let openId = util.getParams('openId');
    let roleCode = +util.getParams("roleCode");
    let url = window.location.href;

    let node = document.getElementById('loadingWrapper');
    node.parentNode.removeChild(node);

    //刷新后参数code失效，导致查询失败，所以刷新后替换掉code
    if (code) {
        window.history.replaceState({}, document.title, window.location.href.replace('code=', 'oldCode='));
    }

    handleBack();

    info.set({
        url: url,
        roleCode: roleCode,
        conversationId: consultConversationId,
        chatId: 'wrapper_' + consultConversationId
    });

    im.render(consultConversationId);

    if (code || openId) {
        //根据微信的openId或者code获取token，供接口调用时进行认证
        http.getToken({
            code: code || '',
            openId: openId || '',
            roleCode: roleCode
        }).then(
            function () {
                setToken(roleCode);
                im.initData();
            },
            function () {
                im.loading(false);
            }
        );
    } else {
        setToken(roleCode);
        im.initData();
    }
})();