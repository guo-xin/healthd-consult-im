let React = require("react");
let ReactDOM = require('react-dom');
let Avatar = require('../common/avatar');
let WriteTime = require('./time');
let util = require('../../util');
let processor = require('../../processor');

let ImgMsg = React.createClass({
    getInitialState: function () {
        return {
            enablePreview: false
        };
    },

    show: function (e) {
        let url = this.props.value;

        e.preventDefault();

        if (this.state.enablePreview) {
            if (typeof WeixinJSBridge !== 'undefined') {
                WeixinJSBridge.invoke('imagePreview', {
                    'current': url,
                    'urls': [url]
                });
            } else {
                let dom = document.createElement('div');
                dom.className = 'webim-img-expand';
                dom.onclick = function () {
                    this.parentNode.removeChild(this);
                };
                dom.innerHTML = '<img src="' + url + '?x-oss-process=image/resize,w_1920/auto-orient,1" />';
                document.body.appendChild(dom);
            }
        }
    },

    onLoaded: function () {
        let props = this.props;

        //图片加载完滚动到底部
        if (props.msgType !== 'history' && props.wrapper) {
            setTimeout(function () {
                props.wrapper.scrollTop = 9000;
            }, 30);
        }

        this.setState({
            enablePreview: true
        });
    },

    render: function () {
        let icon = this.props.className === 'left' ? 'H' : 'I';
        let enablePreview = this.state.enablePreview;

        return (
            <div className={'rel ' + this.props.className}>
                <Avatar src={this.props.src} className={this.props.className + ' small'}/>
                {/*<p className={this.props.className}>{this.props.name} {this.props.time}</p>*/}
                <div className='webim-msg-value webim-img-msg-wrapper'>
                    {/*<span className='webim-msg-icon font'>{icon}</span>*/}
                    <div>
                        <img ref='img' style={{display: enablePreview ? '' : 'none'}} className='webim-msg-img'
                             src={this.props.value + '?x-oss-process=image/resize,w_200/auto-orient,1'}
                             onClick={this.show} onLoad={this.onLoaded}/>
                        <img style={{display: enablePreview ? 'none' : '', width: '42px'}} className='webim-msg-img'
                             src={require('images/loading.gif')}/>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = function (options) {
    let props = {
        src: options.avatar,
        time: options.time || '',
        value: options.value || '',
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

    return ReactDOM.render(
        <ImgMsg {...props} className={options.sentByMe ? 'right' : 'left'}/>,
        node
    );
};
