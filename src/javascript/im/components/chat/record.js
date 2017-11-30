let React = require("react");
let wx = require('../../wx');
let msgProcessor = require('../../message');
let Toast = require('../common/toast');

//正在录音提示
let RecordingTip = React.createClass({
    render: function () {
        return <div className="record-tip-wrapper">
            <div>
                <img src={require("images/auto.png")} alt="语音发送"
                     style={{verticalAlign: 'middle', height: '96px', margin: '10px 10px 10px 0'}}/>
                <img src={require("images/loadings.gif")} style={{verticalAlign: 'middle', height: '48px'}}/>
            </div>
        </div>;
    }
});

//录音太短提示
let TooShortTip = React.createClass({
    render: function () {
        return <div className="record-tip-wrapper">
            <div className="warn">
                <img src={require("images/auto-warn.png")} alt=""/>
                <p>语音消息小于1s</p>
            </div>
        </div>;
    }
});

//没有权限录音提示
let NoPermissionTip = React.createClass({
    render: function () {
        return <div className="record-tip-wrapper">
            <div className="warn">
                <img src={require("images/auto-warn.png")} alt=""/>
                <p>请确保已开启录音权限<br/>和麦克风权限</p>
            </div>
        </div>;
    }
});

//录音60秒最后10提示
let RecordTimerTip = React.createClass({
    getInitialState: function () {
        return {
            second: 10
        };
    },

    componentDidMount: function () {
        this.changeSecond();
    },

    changeSecond: function () {
        setTimeout(() => {
            let second = this.state.second - 1;

            if (second > 0) {
                this.setState({
                    second: second
                });

                this.changeSecond();
            }
        }, 1000)
    },

    render: function () {
        return <div className="record-tip-wrapper">
            <div className="warn timer">
                <p>{this.state.second}</p>
            </div>
        </div>;
    }
});

module.exports = React.createClass({
    getInitialState: function () {
        wx.addUploadListener((localId, serviceId, duration) => {
            this.uploadSuccess(localId, serviceId, duration);
        });

        wx.addStopRecordListener((duration) => {
            clearTimeout(this.timeOut);

            if (duration <= 950) {
                Toast.show({
                    content: <TooShortTip></TooShortTip>,
                    duration: 1500
                });
            } else {
                Toast.close();
            }

            this.setState({
                recordActive: false
            });
        });

        return {
            recordActive: false
        };
    },

    uploadSuccess(localId, serviceId, duration){
        msgProcessor.append({
            send: true,
            localId: localId,
            serviceId: serviceId,
            duration: duration
        }, 'sendAudio');
    },

    //开始录音,屏幕中间显示录音表示并计时
    start: function (e) {
        e.preventDefault();

        this.startTime = new Date().valueOf();

        this.props.stop();

        if (!this.props.checkSend()) {
            return;
        }

        clearTimeout(this.timeOut);

        this.isStartTimer = setTimeout(() => {
            Toast.show({
                duration: -1,
                content: <RecordingTip></RecordingTip>
            });

            wx.startRecord();

            //十秒倒计时
            this.timeOut = setTimeout(function () {
                Toast.show({
                    content: <RecordTimerTip></RecordTimerTip>,
                    duration: -1
                });
            }, 50 * 1000);

        }, 300);


        this.setState({
            recordActive: true
        });
    },

    //结束录音,屏幕中间显示发送状态
    end: function (e) {
        e.preventDefault();

        if ((new Date().valueOf() - this.startTime) < 300) {
            clearTimeout(this.isStartTimer);

            this.setState({
                recordActive: false
            });
        }
        else {
            if (!this.props.checkSend()) {
                return;
            }

            wx.stopRecord();
        }
    },

    showNoPermissionTip: function () {
        Toast.show({
            content: <NoPermissionTip></NoPermissionTip>,
            duration: 1500
        });
    },

    render: function () {
        let {show} = this.props;
        let {recordActive} = this.state;

        return <p className={show ? '' : 'hide'} onTouchStart={this.start}
                  onTouchEnd={this.end}>
            {recordActive ? '松开结束' : '按住说话'}

            <span style={{display: 'none'}}>
                <img src={require("images/auto.png")} alt=""/>
                <img src={require("images/auto-warn.png")} alt=""/>
                <img src={require("images/loadings.gif")} alt=""/>
            </span>
        </p>
    }
});