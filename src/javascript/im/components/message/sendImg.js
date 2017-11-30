let React = require("react");
let ReactDOM = require('react-dom');
let Avatar = require('../common/avatar');
let WriteTime = require('./time');
let util = require('../../util');
let processor = require('../../processor');

let SendImgMsg = React.createClass({

    getInitialState: function () {
        return {
            url: require('images/loading.gif'),
            status: 0 //-1：失败 0：发送中 1：成功
        };
    },

    componentDidMount: function () {
        this.upload();
    },

    upload: function () {
        let props = this.props;
        let picDom = props.picDom;
        let files = picDom.files;
        let file = props.file;

        if (files.length > 0) {
            let data = new FormData();
            data.append('file', files[0]);

            processor.uploadImg({
                data: data
            }).then((res) => {
                picDom.value = null;

                if (res.result == 0 && res.data) {
                    this.setState({
                        status: 1,
                        url: res.data.url
                    });

                    this.sendSmg(file, res.data.url);
                } else {
                    this.setState({
                        status: -1,
                        url: ''
                    });
                }
            });
        }
    },

    sendSmg: function (file, imgUrl) {
        let body = file || {};

        body.url = imgUrl;
        body.type = 'img';

        this.props.parent.send({
            body: body,
            file,
            type: 'img'
        });
    },

    picStatus: function (icon) {
        if (this.state.status === 1) {
            let url = this.state.url;
            return (<div className='webim-msg-value webim-img-msg-wrapper'>
                <span className='webim-msg-icon font'>{icon}</span>
                <div><img ref='img' className='webim-msg-img'
                          src={url ? (url + '?x-oss-process=image/resize,w_200/auto-orient,1') : url}
                          onClick={(e) => this.show(e, url)}/></div>
            </div>);
        } else {
            if (this.state.status === -1) {
                return (<div className='webim-msg-value webim-img-msg-wrapper'>
                    <span className='webim-msg-icon font'>{icon}</span>
                    <div>发送失败</div>
                </div>);
            } else {
                return (<div className='webim-msg-value webim-img-msg-wrapper'>
                    <div><img ref='img' className='webim-msg-img' style={{width: "42px"}} src={this.state.url}
                              onClick={this.show}/>
                    </div>
                </div>);
            }

        }
    },

    show: function (e, url) {
        e.preventDefault();
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
            dom.innerHTML = '<img src="' + url + '" />';
            document.body.appendChild(dom);
        }
    },

    render: function () {
        let icon = this.props.className === 'left' ? 'H' : 'I';
        let picStatus = this.picStatus(icon);

        return (
            <div className={'rel ' + this.props.className}>
                <Avatar src={this.props.src} className={this.props.className + ' small'}/>
                {/*<p className={this.props.className}>{this.props.name} {this.props.time}</p>*/}
                {picStatus}
            </div>
        );
    }
});

module.exports = function (options, parent) {
    let props = {
        src: options.avatar,
        time: options.time || '',
        value: options.value || '',
        msgType: options.msgType,
        file: options.file,
        picDom: options.picDom,
        parent: parent,
        serverId: options.serverId
    };

    let node = document.createElement('div');
    node.className = 'webim-msg-container rel';

    if (props.msgType == 'history') {
        processor.afterAppendMsgNode(options);
        let obj = options.wrapper.firstChild;
        options.wrapper.insertBefore(node, obj);
        processor.beforeAppendMsgNode(options);
        WriteTime(props.time, props.msgType, options);
    } else {
        WriteTime(props.time, props.msgType, options);
        processor.beforeAppendMsgNode(options);
        options.wrapper.appendChild(node);
        processor.afterAppendMsgNode(options);
    }

    util.scrollIntoView(node);

    return ReactDOM.render(
        <SendImgMsg {...props} className={options.sentByMe ? 'right' : 'left'}/>,
        node
    );
};
