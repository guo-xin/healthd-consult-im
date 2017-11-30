let React = require("react");
let pubSub = require('../../pubsub');
let Record = require('./record');
let TextArea = require('./textarea');
let Picture = require('./picture');
let Phone = require('./phone');

let Button = React.createClass({
    render: function () {
        let className = this.props.className ? ' ' + this.props.className : '';
        return <button className={'webim-button bg-color' + className}  onClick={this.props.onClick}>{this.props.text}</button>;
    }
});

module.exports = React.createClass({

    getInitialState: function () {

        return {
            send: false,
            showAdvance: false, //是否显示高级功能
            showRecord: false, //是否显示发送语音按钮
            recordActive: false //是否正在应用语音功能
        };
    },

    changeState: function (obj) {
        if (obj) {
            this.setState(obj);
        }
    },

    //停止播放正在播放的音频
    stop: function () {
        let audios = document.getElementsByTagName('audio');

        pubSub.publish('event.stopVoice');

        for (let i = 0, l = audios.length; i < l; i++) {
            let audio = audios[i];
            if (audio && audio.getAttribute('id') !== this.props.id) {
                if (audio.getAttribute('sending') != 'true') {
                    audio.pause();
                }
            }
        }
    },

    //发送前校验
    checkSend(){
        return true;
    },

    sendText: function () {
        this.refs.textarea.send();
    },

    //点击左边语音图标，显示按住说话按钮
    toggleRecord: function () {
        let {hasRecordPermission} = this.props.sendConfig || {};

        //如果开启了录音权限
        if (hasRecordPermission) {
            this.setState({
                showRecord: !this.state.showRecord,
                showAdvance: false
            });
        } else {
           this.refs.record.showNoPermissionTip();
        }
    },

    //点击+，显示图片，语音，电话图标
    toggleAdvance: function () {
        this.setState({
            showAdvance: !this.state.showAdvance
        });
    },

    render: function () {
        let {sendConfig} = this.props;
        let {showAdvance, showRecord, send} = this.state;

        return (
            <div className='webim-send-wrapper' style={{display: sendConfig.enable ? '' : 'none'}}>
                <div className="top">
                    {
                        sendConfig.record &&
                        <span className={'webim-auto-icon small' + ( showRecord ? ' hide' : '')}
                              onClick={this.toggleRecord}></span>
                    }

                    {
                        sendConfig.record &&
                        <span className={'webim-keybord-icon small' + ( showRecord ? '' : ' hide')}
                              onClick={this.toggleRecord}></span>
                    }

                    <div className="webim-send-input">
                        <TextArea show={showRecord} ref='textarea' checkSend={this.checkSend} changeParentState={this.changeState}></TextArea>

                        {
                            sendConfig.record && <Record ref="record" checkSend={this.checkSend} show={showRecord} stop={this.stop}></Record>
                        }
                    </div>

                    {sendConfig.advance && <span className='webim-add-icon small' onClick={this.toggleAdvance}></span>}

                    <Button
                        className={'webim-send-btn base-bgcolor' + (showRecord ? ' hide' : '') + (send ? '' : ' disabled')}
                        text={'发送'}
                        onClick={this.sendText}/>
                </div>

                {
                    sendConfig.advance && <div className={"bottom" + (showAdvance ? '' : ' hide')}>
                        <ul className="addList">
                            {
                                sendConfig.picture &&
                                <Picture checkSend={this.checkSend} changeParentState={this.changeState}></Picture>
                            }

                            {
                                sendConfig.phone &&
                                <Phone changeParentState={this.changeState} stop={this.stop}></Phone>
                            }
                        </ul>
                    </div>
                }
            </div>
        );
    }
});
