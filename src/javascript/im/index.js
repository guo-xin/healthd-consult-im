let React = require("react");
let ReactDOM = require('react-dom');
let WebIM = require('./components/webim');
let notify = require('./components/common/notify');
let language = require('./language');
let global = require('./global');
let processor = require('./processor');
let msgProcessor = require('./message');
let wx = require('./wx');
let log = require('./log');

module.exports = {
    chat: null,
    other: '', //对方账号
    api: null,
    conn: null,
    history: [],

    //创建连接
    connect: function () {
        let api = this.api;
        if (api) {
            let config = api.config;

            this.conn = new api.connection({
                isMultiLoginSessions: config.isMultiLoginSessions,
                https: typeof config.https === 'boolean' ? config.https : location.protocol === 'https:',
                url: config.xmppURL,
                isAutoLogin: false
            });

            global.set({
                conn: this.conn
            });

            this.listen();
        }
    },

    //关闭连接
    close: function () {
        let conn = this.conn;
        if (conn) {
            conn.stopHeartBeat();
            conn.close();
        }
    },

    //添加连接回调
    listen: function () {
        let self = this;
        let conn = this.conn;

        conn.listen({
            onOpened: function () {
                //置为在线，否则无法收到消息
                conn.setPresence();

                conn.joinChatRoom({
                    roomId: self.other
                });

                self.initHistoryMsg();
                self.loading(false);
            },

            onClosed: function () {
                log('onClosed');
                self.close();
            },

            onTextMessage: function (message) {
                msgProcessor.append(message, 'txt');
            },

            onPictureMessage: function (message) {
                msgProcessor.append(message, 'img');
            },

            onAudioMessage: function (message) {
                msgProcessor.append(message, 'aud');
            },

            onOnline: function () {
                log('online');
            },

            onOffline: function () {
                log('offline');
                notify.offLine();
                self.close();
            },

            onError: function (message) {
                notify.error(message);
                self.close();
                log('onError', message);
                self.loading(false);
            }
        });
    },

    //登录
    login: function (params, history, wxConfig) {
        let api = this.api;
        if (api && params) {
            let config = api.config;
            let user = params.user;

            this.other = params.other.account;

            global.set({
                user: user,
                other: params.other
            });

            if (wxConfig) {
                wx.config(wxConfig).then(
                    () => {
                        this.setSendOptions({
                            hasRecordPermission: true
                        });
                    }
                );
            }

            this.history = history;

            this.connect();

            this.conn.open({
                appKey: params.appKey,
                apiUrl: config.apiURL,
                user: user.account,
                pwd: user.account + '0'
            });
        }
    },

    loading: function (status) {
        this.chat.loading(status);
    },

    //定制处理
    setProcessor: function (options = {}) {
        for (let key in options) {
            if (typeof options[key] == 'function') {
                processor[key] = options[key];
            }
        }
    },

    //加载更多历史信息
    appendHistoryMsg: function (list) {
        msgProcessor.appendHistoryMsg(list, 'history');
    },

    //初始化历史信息
    initHistoryMsg: function () {
        msgProcessor.appendHistoryMsg(this.history, 'current');
    },

    setSendOptions(obj = {}){
        let chat = this.chat;
        if (chat) {
            chat.setState({
                sendConfig: Object.assign(chat.state.sendConfig, obj)
            });
        }
    },

    render: function (api, options) {
        global.set({
            chatId: options.chatId,
            lan: language[options.lan || 'Chinese'],
            api: api
        });

        this.api = api;
        this.chat = ReactDOM.render(<WebIM />, document.getElementById('chat'));
    }
};