let Notify = require('../../im/components/common/notify');
let apiUrl = window.chronicdConfig.api + 'v1/';
let _token = ''; //请求认证
let historyPage = 1; //历史消息当前页数
let allLoaded = false; //历史是否都加载完毕

function _fetch(url, params = {}) {
    params.headers = Object.assign({}, params.headers, {
        't': _token || '',
        'If-Modified-Since': '0',
        'Cache-Control': 'no-cache'
    });

    return fetch(apiUrl + url, params).then(function (response) {
        if (response.status >= 400) {
            Notify.error('请求错误');
            throw new Error("Bad response from server");
        }
        return response.json();
    }).then(function (data) {
        if (data.result == 1) {
            if (data.code === -14 || data.code === -15 || data.code === -16) {
                //弹出错误提示
                Notify.tokenError({"type": (data.code === -15 ? 501 : 502)});
            }
        }
        return data;
    });
}

module.exports = {
    setToken: function (token) {
        _token = token;
    },

    //进入页面时，根据code获取token
    getToken: function (params) {
        let content = params.roleCode == 0 ? 'doctor' : 'user';

        return _fetch(content + '/info?code=' + params.code + '&openId=' + params.openId).then(function (res) {
            localStorage.setItem(params.roleCode == 0 ? '_doctorInfo' : '_userInfo', JSON.stringify(res.data));
            return res;
        });
    },

    getChatInfo: function (params) {
        let consultConversationId = params.consultConversationId;
        let url = 'patient-chronicd-consult/consult-list?consultConversationId=' + consultConversationId;

        if (params.roleCode == 0) {
            url = 'doctor-chronicd-consult/consult-list?consultConversationId=' + consultConversationId;
        }

        return _fetch(url);
    },

    //用户，医生获取历史消息,支持分页查询
    getHistoryMessage: function (params) {
        let consultConversationId = params.consultConversationId;
        let content = params.roleCode == 0 ? 'doctor' : 'patient';
        let currentPage = historyPage;
        let currentTime = params.currentTime;
        let size = 20;
        let queryString = 'size=' + size + '&curr=' + currentPage + '&id=' + consultConversationId + '&timestamp=' + currentTime;

        return new Promise(function (resolve, reject) {
            if (!allLoaded) {
                _fetch(content + '-chronicd-consult/consult-history-message?' + queryString).then(function (res) {
                    let data = res.data || {};
                    let list = data.messageEasemobs || [];
                    let total = data.totalMessagesCount || 0;

                    if (list.length < size || ((currentPage - 1) * size + list.length) >= total) {
                        allLoaded = true;
                    }

                    historyPage += 1;
                    resolve(list);
                });
            }
        });
    },

    //用户,医生打开时,发送时间戳
    sendTimeStamp: function (obj = {}) {
        let content = obj.roleCode == 0 ? 'doctor' : 'patient';

        let params = {
            id: obj.consultConversationId,
            newMessageTimestamp: obj.currentTime
        };

        return _fetch(content + '-chronicd-consult/open-consult', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify(params)
        });
    },

    //获取ticket
    getTicket: function (params) {
        //localhost:8080/v1/wx/jsapi-ticket
        return _fetch('wxqy/jsapi-ticket?url=' + encodeURIComponent(params.url));
    },

    //用户，医生获取历史消息,支持分页查询
    getWxAudio: function (params) {
        return _fetch('voice/upload?mediaId=' + params.wxAudioId + '&messageId=' + params.msgId);
    },

    //双向通话请求
    voiceCall: function (from, to) {
        let params = 'caller=' + from + '&called=' + to;
        return _fetch('voice/call?' + params);
    },

    //上传文件
    uploadFile: function (params) {
        return _fetch('upload/part-file', {
            method: 'POST',
            body: params.data
        });
    },

    //上传图片
    uploadImg: function (params) {
        return _fetch('pic/qy-upload?mediaId=' + params.serverId);
    },

    //获取服务状态
    getServiceState: function (params) {
        return _fetch('services/' + params.consultConversationId);
    },

    //获取商品列表
    getProducts: function () {
        return _fetch('products');
    }
};
