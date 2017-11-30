let global = require('./global');
let textMsg = require('./components/message/txt');
let imgMsg = require('./components/message/img');
let sendImgMsg = require('./components/message/sendImg');
let audioMsg = require('./components/message/audio');
let audioSendMsg = require('./components/message/sendAudio');
let util = require('./util');
let log = require('./log');
let processor = require('./processor');

module.exports = {
    //在ui中插入消息
    append: function (msg, type) {
        let data = global.get();
        let conn = data.conn;
        let id = conn.getUniqueId();
        let options = processor.format(msg, type, id);

        if (!options) {
            return;
        }

        switch (type) {
        case 'txt':
            options.value = util.parseEmoji(options.value);
            textMsg(options);
            break;

        case 'img':
            imgMsg(options);
            break;

        case 'sendImg':
            sendImgMsg(options, this);
            break;

        case 'sendAudio':
            audioSendMsg(options, this);
            break;

        case 'aud':
            audioMsg(options, this);
            break;
        }
    },

    appendHistoryMsg: function (list, msgType) {
        let firstNode, scrollNode;

        if (msgType == 'history') {
            firstNode = document.getElementsByClassName("webim-chatwindow-msg")[0].firstChild;
        }

        if (list.length > 0) {
            for (let i = list.length - 1; i >= 0; i--) {
                if (i == 0 && msgType == 'history') {
                    scrollNode = firstNode;
                } else {
                    scrollNode = null;
                }

                let options = processor.formatHistoryMsg(list[i], msgType);

                if (options) {
                    options.scrollNode = scrollNode;

                    switch (options.type) {
                    case 'txt':
                        options.value = util.parseEmoji(options.value);
                        textMsg(options);
                        break;

                    case 'img':
                        imgMsg(options);
                        break;

                    case 'audio':
                        audioMsg(options);
                        break;

                    default:
                        ;
                    }
                }
            }

        }
    },

    send: function (options) {
        let data = global.get();
        let api = data.api;
        let conn = data.conn;
        let id = conn.getUniqueId();
        let type = options.type;
        let other = data.other;
        let msg = new api.message(type, id);

        switch (type) {

        case 'txt':
            msg.set({
                msg: options.value,
                to: other.account,
                roomType: false,

                ext: processor.getExt(options),

                success: function (id) {
                    log('send success', id);
                },
                fail: function (id) {
                    log('send failed', id);
                }
            });

            msg.body.chatType = 'singleChat';
            processor.beforeSendMsg(msg.body, options);
            conn.send(msg.body);
            this.append(msg.body, 'txt');
            processor.afterSendMsg(msg.body, options);
            break;

        case 'img':
            msg.set({
                to: other.account,
                roomType: false,
                file: options.file,
                body: options.body,
                ext: processor.getExt(options)
            });

            msg.body.chatType = 'singleChat';
            processor.beforeSendMsg(msg.body, options);
            conn.send(msg.body);
            processor.afterSendMsg(msg.body, options);
            break;

        case 'audio':
            msg.set({
                to: other.account,
                roomType: false,
                length: options.length,
                file: null,
                body: options.body,
                ext: processor.getExt(options)
            });

            msg.body.chatType = 'singleChat';
            processor.beforeSendMsg(msg.body, options);
            conn.send(msg.body);
            processor.afterSendMsg(msg.body, options);

            break;
        }
    }
};