let React = require("react");
let ReactDOM = require('react-dom');
let Util = require('../../util');

let topTime; //消息列表最上边消息的时间
let bottomTime; //消息列表最小边消息的时间

//msgType为history用的insertbefore， 其余用的append
module.exports = function (time, msgType, options) {
    let DateChange = false;
    let forwardTime;
    let compareTime = msgType=='history' ? topTime : bottomTime;

    let flag = false;

    if (compareTime) {
        forwardTime = Util.formatDate(compareTime, 'yyyy-MM-dd');

        if (Math.abs(time - compareTime) >= 5 * 60 * 1000) {
            flag = true;
        }
    } else {
        flag = true;
    }

    compareTime = time;

    //如果为第一天消息时或者历史消息时给topTime赋值
    if(msgType=='history' || !topTime){
        topTime = time;
    }

    if(msgType!='history'){
        bottomTime = time;
    }

    let timeChange = false;
    let currentTime = Util.formatDate(new Date(), 'yyyy-MM-dd');

    let sendTime = Util.formatDate(time, 'yyyy-MM-dd');
    if (currentTime !== sendTime) {
        timeChange = true;
    }
    if (forwardTime && (sendTime !== forwardTime)) {
        DateChange = true;
    }

    let curr;
    if (DateChange && timeChange) {
        curr = Util.formatDate(compareTime, 'yyyy-MM-dd HH:mm');
    } else if (timeChange && flag) {
        curr = Util.formatDate(compareTime, 'yyyy-MM-dd HH:mm');
    } else if (flag) {
        curr = Util.formatDate(compareTime, 'HH:mm');
    }

    if (curr) {
        let node = document.createElement('div');
        node.className = 'webim-msg-container rel';
        node.style.textAlign = 'center';

        if (msgType == 'history') {
            let obj = options.wrapper.firstChild;
            options.wrapper.insertBefore(node, obj);
        } else {
            options.wrapper.appendChild(node);
        }

        //Demo.api.scrollIntoView(node);
        return ReactDOM.render(
            <div className="timeValue">{curr}</div>,
            node
        );
    }
};