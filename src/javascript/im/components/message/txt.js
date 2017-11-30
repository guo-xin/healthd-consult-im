let React = require("react");
let ReactDOM = require('react-dom');
let Avatar = require('../common/avatar');
let WriteTime = require('./time');
let util = require('../../util');
let processor = require('../../processor');

let TextMsg = React.createClass({
    render: function () {
        var icon = this.props.className === 'left' ? 'H' : 'I';

        return (
            <div className={'rel ' + this.props.className}>
                <Avatar src={this.props.src} className={this.props.className + ' small'}/>
                {/*<p className={this.props.className}>{this.props.name} {this.props.time}</p>*/}
                <div className='webim-msg-value'>
                    <span className='webim-msg-icon font'>{icon}</span>
                    <pre dangerouslySetInnerHTML={{__html: this.props.value}}></pre>
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
        msgType: options.msgType
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
        <TextMsg {...props} className={options.sentByMe ? 'right' : 'left'}/>,
        node
    );
};
