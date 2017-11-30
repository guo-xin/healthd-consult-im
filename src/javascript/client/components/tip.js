let React = require("react");
let ReactDOM = require('react-dom');
let info = require('../common/info');
let util = require('../../im/util');

module.exports = function (options={}) {
    let data = info.get();
    let msgType = options.msgType;

    if (data.roleCode == 1 && options.firstReply == 1 && options.sentByMe==false) {

        let node = document.createElement('div');
        node.className = 'webim-msg-container rel';

        if (msgType == 'history') {
            let obj = options.wrapper.firstChild;
            options.wrapper.insertBefore(node, obj);
            if (options.scrollNode) {
                util.scrollIntoView(options.scrollNode);
            }
        } else {
            options.wrapper.appendChild(node);
            util.scrollIntoView(node);
        }

        return ReactDOM.render(
            <div className="timeTip">
                <div className="timeTip">----提示----</div>
                <p>医生的回复仅为建议，具体诊疗前往医院进行</p>
            </div>,
            node
        );
    }
};