let startTime = 0;
let endTime = 0;
let wx = window.wx;

let uploadListener = function () {

};

let stopRecordListener = function () {

};

let uploadImgListener = function () {

};

function config(data = {}) {
    return new Promise(function (resolve, reject) {
        if (wx) {
            let hasError =  false;
            wx.ready(() => {
                console.log('ready--------------------');
                if(!hasError){
                    wx.onVoiceRecordEnd({
                        // 录音时间超过一分钟没有停止的时候会执行 complete 回调
                        complete: (res) => {
                            endTime = new Date().getTime();
                            stopRecordListener();
                            upload(res.localId);
                        }
                    });

                    wx.startRecord({
                        success: function () {
                            resolve();
                            loopStopRecord();
                        },

                        cancel: function () {
                            reject();
                        },

                        fail: function () {
                            reject();
                        }

                    });
                }
            });


            wx.error((err) => {
                console.log('error-----------------', err);
                hasError = true;
                reject();
            });

            wx.config({
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: data.appId, // 必填，公众号的唯一标识
                timestamp: +data.timestamp, // 必填，生成签名的时间戳
                nonceStr: data.nonce, // 必填，生成签名的随机串
                signature: data.sign,// 必填，签名，见附录1
                jsApiList: ['startRecord', 'stopRecord', 'uploadVoice', 'downloadVoice', 'onVoiceRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'chooseImage', 'uploadImage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });
        }
    });
}

function loopStopRecord(fn) {
    setTimeout(function () {
        wx.stopRecord({
            success: function (res) {
                if(typeof fn == 'function'){
                    fn(res);
                }
            },
            fail: function () {
                loopStopRecord();
            }
        });
    }, 350)
}

function startRecord() {
    startTime = new Date().getTime();
    wx.stopRecord();

    wx.startRecord({
        success: function () {
            startTime = new Date().getTime();
        }
    });
}

function stopRecord() {
    endTime = new Date().getTime();

    stopRecordListener(endTime - startTime);

    loopStopRecord(function (res) {
        upload(res.localId);
    });
}

function playVoice(localId) {
    wx.playVoice({
        localId: localId // 需要播放的音频的本地ID，由stopRecord接口获得
    });
}

function stopVoice(localId) {
    wx.stopVoice({
        localId: localId // 需要停止的音频的本地ID，由stopRecord接口获得
    });
}

function upload(localId) {
    // console.log('localId---------------', localId);
    let diff = endTime - startTime;

    if (diff > 950) {
        playVoice(localId);

        setTimeout(function () {
            stopVoice(localId);
            wx.uploadVoice({
                localId: localId, // 需要上传的音频的本地ID，由stopRecord接口获得
                isShowProgressTips: 1,// 默认为1，显示进度提示
                success: function (res) {
                    let duration = Math.ceil(diff / 1000);

                    duration = duration > 60 ? 60 : duration;

                    //console.log('serverId---------------', duration, res.serverId); //返回音频的服务器端ID
                    uploadListener(localId, res.serverId, duration);
                }
            });
        }, 50)
    }
}

function addUploadListener(fn) {
    if (typeof fn == 'function') {
        uploadListener = fn;
    }
}

function addStopRecordListener(fn) {
    if (typeof fn == 'function') {
        stopRecordListener = fn;
    }
}

function addUploadImgListener(fn) {
    if (typeof fn == 'function') {
        uploadImgListener = fn;
    }
}

function chooseImage() {
    setTimeout(function () {
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                uploadImage(localIds[0])
            }
        });
    }, 0)
}

function uploadImage(localId) {
    wx.uploadImage({
        localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
        isShowProgressTips: 1, // 默认为1，显示进度提示
        success: function (res) {
            var serverId = res.serverId; // 返回图片的服务器端ID

            uploadImgListener(serverId)
        }
    });
}

module.exports = {
    config,
    startRecord,
    stopRecord,
    addUploadListener,
    addStopRecordListener,
    playVoice,
    stopVoice,
    chooseImage,
    uploadImage,
    addUploadImgListener
};

