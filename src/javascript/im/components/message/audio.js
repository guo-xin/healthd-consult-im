let React = require("react");
let ReactDOM = require('react-dom');
let Avatar = require('../common/avatar');
let WriteTime = require('./time');
let pubSub = require('../../pubsub');
let util = require('../../util');
let processor = require('../../processor');

let AudioMsg = React.createClass({

    getInitialState: function () {
        return {
            status: 0,
            src: null
        };
    },

    componentDidMount: function () {

    },

    setUrl: function (url) {
        let me = this;
        let audio = this.refs.audio;
        let props = this.props;

        //图片加载完滚动到底部
        if (props.msgType !== 'history' && props.wrapper) {
            setTimeout(function () {
                props.wrapper.scrollTop = 9000;
            }, 30);
        }

        audio.onpause = function () {
            audio.currentTime = 0;
            me.setState({status: 0});
        };

        this.setState({src: url});
    },

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

    shouldComponentUpdate: function (nextProps, nextState) {
        return nextState.src !== this.state.src || nextState.status !== this.state.status;
    },

    componentDidUpdate: function (prevProps, prevState) {
        let me = this;

        if (me.state.status) {
            me.refs.bg.className = 'webim-audio-slash slash';

            if (me.state.src) {
                if (!me.refs.audio.src) {
                    me.refs.audio.src = me.state.src;
                }

                me.refs.audio.play();
            } else {
                me.refs.bg.className = 'webim-audio-slash';
            }
        } else {
            me.stopTimer();
            me.refs.bg.className = 'webim-audio-slash';
            me.refs.audio.pause();
        }
    },

    startTimer: function (duration) {
        let me = this;

        this.stPlayEnd = setTimeout(() => {
            me.refs.audio.pause();
        }, duration);
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

    onCanPlayThrough: function (e) {
        let duration = e.target.duration;
        let time = (duration || this.props.length || 0) * 1000 + 50;
        this.startTimer(time);
    },

    render: function () {
        let icon = this.props.className === 'left' ? 'H' : 'I';

        let obj = document.getElementsByClassName("webim-chatwindow-msg")[0];
        let maxWidth = (obj.clientWidth - 36) * 0.75 - 100;
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
                        <div className='webim-audio-msg' style={{width: width + 'px'}}></div>
                    </div>
                    <div ref='bg' className='webim-audio-slash' onClick={this.toggle}>
                        <img src={image1}/>
                        <img src={image2}/>
                        <img src={image3}/>
                    </div>
                </div>
                <div
                    className={(this.props.className == 'right' ? 'left' : 'right') + ' auto-msg-value'}>{this.props.length + '\'\''}</div>
                <audio id={this.props.id} ref='audio' className='hide' onCanPlayThrough={this.onCanPlayThrough} />
            </div>
        );
    }
});

module.exports = function (options) {
    let props = {
        src: options.avatar,
        time: options.time || '',
        value: options.value || '',
        length: options.length || '',
        id: options.id,
        msgType: options.msgType,
        wrapper: options.wrapper
    };


    let node = document.createElement('div');
    node.className = 'webim-msg-container rel';

    if (props.msgType == 'history') {
        processor.afterAppendMsgNode(options);
        let obj = options.wrapper.firstChild;
        options.wrapper.insertBefore(node, obj);
        processor.beforeAppendMsgNode(options);
        WriteTime(props.time, props.msgType, options);

        if (options.scrollNode) {
            util.scrollIntoView(options.scrollNode);
        }
    } else {
        WriteTime(props.time, props.msgType, options);
        processor.beforeAppendMsgNode(options);
        options.wrapper.appendChild(node);
        processor.afterAppendMsgNode(options);
        util.scrollIntoView(node);
    }

    let audio = ReactDOM.render(
        <AudioMsg {...props} className={options.sentByMe ? 'right' : 'left'}/>,
        node
    );

    processor.getAudioUrl(options).then(
        (url) => {
            audio.setUrl(url);
        },
        () => {
            audio.stop();
            audio.setState({
                status: 0
            })
        }
    );

    return audio;
};
