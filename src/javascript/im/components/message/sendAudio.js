let React = require("react");
let ReactDOM = require('react-dom');
let Avatar = require('../common/avatar');
let wx = require('../../wx');
let WriteTime = require('./time');
let util = require('../../util');
let processor = require('../../processor');
let pubSub = require('../../pubsub');

let AudioMsg = React.createClass({

    getInitialState: function () {
        return {
            status: 0,
            src: null
        };
    },

    componentDidMount: function () {
        let {localId, serviceId, parent, length} = this.props;

        pubSub.subscribe('event.stopVoice', (event, id) => {
            if (localId != id) {
                this.setState({status: 0});
            }
        });

        let me = this;
        let audio = me.refs.audio;

        audio.setAttribute('sending', 'true');
        audio.setAttribute('localId', me.props.localId);

        parent.send({
            body: {
                type: 'audio',
                url: serviceId,
                length: length
            },
            type: 'audio',
            serviceId: serviceId,
            length: length
        });
    },

    stop: function () {
        let audios = document.getElementsByTagName('audio');

        pubSub.publish('event.stopVoice', this.props.localId);

        for (let i = 0, l = audios.length; i < l; i++) {
            let audio = audios[i];
            if (audio && audio.getAttribute('id') !== this.props.id) {
                if (audio.getAttribute('sending') != 'true') {
                    audio.pause();
                }
            }
        }
    },

    shouldComponentUpdate: function (nextProps, nextState) {
        return nextState.src !== this.state.src || nextState.status !== this.state.status;
    },

    componentDidUpdate: function (prevProps, prevState) {
        let me = this;
        let id = this.props.localId;
        let bg = me.refs.bg;

        if (me.state.status) {
            bg.className = 'webim-audio-slash slash';
            wx.playVoice(id);
            me.startTimer();
        } else {
            me.stopTimer();
            bg.className = 'webim-audio-slash';
            wx.stopVoice(id);
        }
    },

    startTimer: function () {
        let time = (this.props.length || 0) * 1000;

        if (time > 60000) {
            time = 60600;
        }

        this.stPlayEnd = setTimeout(() => {
            this.state.status = 0;
            this.refs.bg.className = 'webim-audio-slash';
        }, time);
    },

    stopTimer: function () {
        clearTimeout(this.stPlayEnd);
    },

    toggle: function () {
        this.stop();

        setTimeout(() => {
            this.setState({status: this.state.status ? 0 : 1});
        }, 100);
    },

    render: function () {
        let icon = this.props.className === 'left' ? 'H' : 'I';

        let obj = document.getElementsByClassName("webim-chatwindow-msg")[0];
        let maxWidth = (obj.clientWidth - 38) * 0.75 - 100;
        let width = this.props.length * 3 > maxWidth ? maxWidth : this.props.length * 3;

        let image1 = require('images/' + this.props.className + '1.png');
        let image2 = require('images/' + this.props.className + '2.png');
        let image3 = require('images/' + this.props.className + '3.png');

        return (
            <div className={'rel pointer ' + this.props.className}>
                <Avatar src={this.props.src} className={this.props.className + ' small'}/>
                {/*<p className={this.props.className}>{this.props.name} {this.props.time}</p>*/}
                <div className='webim-msg-value'>
                    <span className='webim-msg-icon font'>{icon}</span>
                    <div>
                        <div className='webim-audio-msg' style={{width:width+'px'}}></div>
                    </div>
                    <div ref='bg' className='webim-audio-slash' id={this.props.localId} onClick={this.toggle}>
                        <img src={image1}/>
                        <img src={image2}/>
                        <img src={image3}/>
                    </div>
                </div>
                <div className='left auto-msg-value'>{this.props.length + '\'\''}</div>
                <audio id={this.props.id} ref='audio' className='hide'/>
            </div>
        );
    }
});

module.exports = function (options, parent) {
    let props = {
        src: options.avatar,
        time: options.time || '',
        value: options.value || '',
        length: options.length || '',
        id: options.id,
        msgType: options.msgType,
        localId: options.localId,
        serviceId: options.serviceId,
        parent: parent
    };

    let node = document.createElement('div');
    node.className = 'webim-msg-container rel';

    if (props.msgType == 'history') {
        processor.afterAppendMsgNode(options);
        let obj = options.wrapper.firstChild;
        options.wrapper.insertBefore(node, obj);
        processor.beforeAppendMsgNode(options);
        WriteTime(props.time,props.msgType, options);
    } else {
        WriteTime(props.time,props.msgType, options);
        processor.beforeAppendMsgNode(options);
        options.wrapper.appendChild(node);
        processor.afterAppendMsgNode(options);
    }

    util.scrollIntoView(node);

    return ReactDOM.render(
        <AudioMsg {...props} className={options.sentByMe ? 'right' : 'left'}/>,
        node
    );
};
