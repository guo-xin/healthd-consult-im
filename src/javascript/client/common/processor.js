let info = require('./info');
let http = require('./http');
let ConsultState = require('../components/consultState');
let WriteTip = require('../components/tip');

module.exports = {
    //消息格式化
    format: function (msg, type) {
        let data = info.get();
        let roleCode = data.roleCode;
        let result = {}, sentByMe, avatar;

        if (!msg) {
            return;
        }

        if (msg.send) {
            sentByMe = true;
        } else {
            if (msg.delay) {
                return;
            }

            let receiveType = msg.ext.data.receiveType;
            sentByMe = !(roleCode == receiveType);
        }

        let targetNode = document.getElementById(data.chatId);
        let sendTime = msg.timestamp || new Date();
        let val = msg.data || msg.msg || '';

        if (sentByMe) {
            avatar = data.user.avatar;
        } else {
            avatar = data.other.avatar;
        }

        switch (type) {
        case 'txt':
            result = {
                avatar: avatar,
                sentByMe: sentByMe,
                wrapper: targetNode,
                time: sendTime,
                value: val,
                type: type
            };

            break;

        case 'sendImg':
            result = {
                avatar: avatar,
                sentByMe: sentByMe,
                wrapper: targetNode,
                time: sendTime,
                value: val || msg.url,
                file: msg.file,
                picDom: msg.picDom,
                serverId: msg.serverId,
                type: type
            };

            break;

        case 'img':
            result = {
                avatar: avatar,
                sentByMe: sentByMe,
                wrapper: targetNode,
                time: sendTime,
                value: val || msg.url,
                type: type
            };

            break;

        case 'sendAudio':
            result = {
                avatar: avatar,
                sentByMe: sentByMe,
                wrapper: targetNode,
                time: sendTime,
                value: msg.serviceId,
                serviceId: msg.serviceId,
                localId: msg.localId,
                length: msg.duration,
                type: type
            };

            break;

        case 'aud':
            let extData = msg.ext.data || {};
            let wxAudio = extData.wxAudio;

            result = {
                avatar: avatar,
                sentByMe: sentByMe,
                wrapper: targetNode,
                time: sendTime,
                value: val || msg.url,
                length: msg.length,
                wxAudio: wxAudio,
                type: type
            };

            break;

        default:
            ;
        }

        return result;
    },

    //历史消息格式化
    formatHistoryMsg: function (item, msgType) {
        let data = info.get();
        let roleCode = data.roleCode;
        let content = item.payload.bodies[0];
        let id = item.id;
        let sendTime = item.timestamp;
        let type = content.type;
        let msg_id = item.msg_id;
        let extData = item.payload.ext.data || {};
        let receiveType = extData.receiveType;
        let firstReply = extData.firstReply;
        let wxAudio = extData.wxAudio;
        let result, sentByMe, avatar;

        let targetNode = document.getElementById(data.chatId);
        sentByMe = !(roleCode == receiveType);

        if (sentByMe) {
            avatar = data.user.avatar;
        } else {
            avatar = data.other.avatar;
        }

        switch (type) {
        case 'txt':
            result = {
                id: id,
                msg_id: msg_id,
                msgType: msgType,
                avatar: avatar,
                sentByMe: sentByMe,
                wrapper: targetNode,
                time: sendTime,
                value: content.msg || '',
                firstReply: firstReply,
                type: type
            };

            break;

        case 'img':
            result = {
                id: id,
                msg_id: msg_id,
                msgType: msgType,
                avatar: avatar,
                sentByMe: sentByMe,
                wrapper: targetNode,
                time: sendTime,
                value: content.url || '',
                firstReply: firstReply,
                type: type
            };

            break;

        case 'audio':
            result = {
                id: id,
                msg_id: msg_id,
                msgType: msgType,
                avatar: avatar,
                sentByMe: sentByMe,
                wrapper: targetNode,
                time: sendTime,
                value: content.url || '',
                wxAudio: wxAudio,
                length: content.length,
                firstReply: firstReply,
                type: type
            };

            break;
        }

        return result;
    },

    //获取历史消息
    getHistoryMsg: function () {
        let data = info.get();

        return http.getHistoryMessage({
            consultConversationId: data.conversationId,
            roleCode: data.roleCode,
            currentTime: data.currentTime
        }).then((res) => {
            if (data.im && res) {
                data.im.appendHistoryMsg(res.reverse());
            }
        });
    },

    //获取音频url
    getAudioUrl: function (params) {
        let wxAudio = params.wxAudio;
        let url = params.value;
        let WebIM = window.WebIM;
        return new Promise(function (resolve, reject) {
            if (wxAudio) {
                if (wxAudio.wxAudioId && wxAudio.isUpdate != 1) {
                    http.getWxAudio({
                        wxAudioId: wxAudio.wxAudioId,
                        msgId: params.msg_id
                    }).then(
                        (response) => {
                            if (response.result == 0) {
                                resolve(response.data.url);
                            } else {
                                reject();
                            }
                        },
                        () => {
                            reject();
                        }
                    );
                } else {
                    resolve(url);
                }

            } else {
                let reg = new RegExp(/\**.mp3$/gi);
                if (reg.test(url)) {
                    this.setUrl(url);
                } else {
                    let options = {url: url};
                    let data = info.get();
                    let conn = data.im.conn;

                    options.onFileDownloadComplete = (response) => {
                        let objectURL = WebIM.utils.parseDownloadResponse.call(conn, response);
                        resolve(objectURL);
                    };

                    options.onFileDownloadError = (e) => {
                        reject();
                    };

                    options.headers = {
                        'Accept': 'audio/mp3'
                    };

                    WebIM.utils.download.call(conn, options);
                }
            }
        });


    },

    //发消息前自定义扩展消息
    getExt: function (options) {
        let data = info.get();

        let ext = {
            channelType: "chronicd",
            data: {
                senderType: data.roleCode,
                consultConversationId: data.conversationId,
                notifyType: "weixin",
                receiveType: data.roleCode == 1 ? 0 : 1,
                patientId: data.roleCode == 1 ? data.user.patientId : data.other.patientId
            }
        };

        if (options.type == 'audio') {
            ext.data.wxAudio = {
                wxAudioId: options.serviceId,
                isUpdate: 0
            };
        }

        return ext
    },

    //插入消息dom元素前执行
    beforeAppendMsgNode: function (params) {
        WriteTip(params);

        let data = info.get();

        //患者购买服务后第一次收到医生提示处理
        if (data.roleCode == 1 && params.sentByMe == false && !params.msgType) {
            ConsultState.changeStatus(params);
        }
    },

    //插入消息dom元素后执行
    afterAppendMsgNode: function (params = {}) {

    },

    //发送消息前调用
    beforeSendMsg: function () {

    },

    //发送消息后调用
    afterSendMsg: function (msgBody, options) {
        let data = info.get();

        if (data.roleCode == 1 && msgBody.type == 'txt') {
            ConsultState.changeCount();
        }
    },

    //上传图片
    uploadImg: function (params) {
        return http.uploadFile(params);
    },

    //双向电话
    call: function () {
        let data = info.get();

        return new Promise(function (resolve, reject) {
            if (data.user.phone && data.other.phone) {
                return http.voiceCall(data.user.phone, data.other.phone).then(function (res) {
                    if (!(res && res.result == 0)) {
                        reject({
                            code: 0,
                            msg: '呼叫失败'
                        });
                    }
                }, function () {
                    reject({
                        code: 0,
                        msg: '呼叫失败'
                    });
                });
            } else {
                reject({
                    code: 1,
                    msg: '请确保呼叫双方电话不为空'
                });
            }
        })
    }
};