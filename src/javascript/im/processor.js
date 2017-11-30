function noop() {
}

function promiseNoop() {
    return new Promise(function (resolve, reject) {
        resolve();
    });
}

module.exports = {
    format: noop,

    formatHistoryMsg: noop,

    getExt: noop,

    beforeAppendMsgNode: noop,

    afterAppendMsgNode: noop,

    beforeSendMsg: noop,

    afterSendMsg: noop,

    uploadImg: promiseNoop,

    call: promiseNoop,

    getAudioUrl: promiseNoop,

    getHistoryMsg: promiseNoop
};