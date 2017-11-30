let info = require('./common/info');
let processor = require('./common/processor');
let header = require('./components/header');
let footer = require('./components/footer');
let consultState = require('./components/consultState');
let http = require('./common/http');
let im = require('../im/index');
let util = require('../im/util');

//设置聊天用户信息
function setChatInfo(params, roleCode) {
    if (params && params.result == 0 && params.data) {
        let data = params.data;
        let result = data.results[0];
        let item = (result || {})[roleCode == 0 ? 'pdConsult' : 'dpConsult'] || {};
        let ossConfig = '?x-oss-process=image/resize,w_80/auto-orient,1';

        //医生信息
        let doctorInfo = {
            id: item.doctorId,
            account: result.easemobDoctorAccount,
            name: item.doctorRealName,
            avatar: item.doctorHeadPic ? (item.doctorHeadPic + ossConfig) : require('images/doctor.png'),
            phone: item.doctorMobilePhone,
            department: item.departmentName,
            chronicdDoctorId: item.consultDoctorId
        };

        //患者信息
        let userInfo = {
            id: item.systemUserId,
            account: result.easemobUserAccount,
            name: item.patientRealName,
            avatar: item.patientHeadPic ? (item.patientHeadPic + ossConfig) : require('images/default.png'),
            phone: item.patientMobilePhone,
            patientId: item.patientId
        };

        if (roleCode == 0) {
            info.set({
                user: doctorInfo,
                other: userInfo
            });
        } else {
            info.set({
                user: userInfo,
                other: doctorInfo
            });
        }
    }
}

//设置发送区域操作权限
function setSendOptions(roleCode) {
    let options = {};

    //患者禁止语音和电话通话功能
    if (roleCode == 1) {
        options = {
            phone: false,
            record: false
        };
    } else {
        //医生如果是非微信环境禁止语音功能
        options = {
            enable: true
        };

        if (!util.isWeiXin()) {
            options.record = false;
        }
    }

    im.setSendOptions(options);
}

module.exports = {
    initData: function () {
        let data = info.get();
        let time = new Date().valueOf();
        let roleCode = data.roleCode;

        let params = {
            roleCode: data.roleCode,
            url: data.url,
            consultConversationId: data.conversationId,
            currentTime: time
        };

        info.set({
            currentTime: time
        });

        let commonHttps = [
            http.getChatInfo(params), //获取聊天双方信息
            http.getHistoryMessage(params)// 获取聊天历史
        ];

        if (roleCode == 0) {
            if (util.isWeiXin()) {
                //获取微信JSSDK签名信息
                commonHttps.push(http.getTicket(params));
            }
        } else {
            //获取当前服务的状态
            commonHttps.push(http.getServiceState(params));
        }

        Promise.all(commonHttps).then((results) => {
            let wxConfig;
            let history = [];

            if (results[2]) {
                if (roleCode == 0) {
                    wxConfig = results[2].data;
                }

                if (roleCode == 1) {
                    info.set({
                        serviceState: results[2].data || undefined
                    });
                }
            }

            if (results[1]) {
                history = results[1];
            }

            if (results[0]) {
                setChatInfo(results[0], roleCode);

                header.render();
                footer.render();

                if (roleCode == 1) {
                    consultState.render();
                }

                setSendOptions(roleCode);
                im.login(info.get(), history, wxConfig);
            }

            http.sendTimeStamp(params);
        }, () => {
            im.loading(false);
        });
    },

    loading: function (isShow) {
        im.loading(isShow);
    },

    render: function (id) {
        //初始化im界面
        im.render(window.WebIM, {
            chatId: 'wrapper_' + id
        });

        //设置消息处理器
        im.setProcessor(processor);

        info.set({
            im: im
        });
    }
};