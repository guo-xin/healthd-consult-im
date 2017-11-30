let React = require("react");
let msgProcessor = require('../../message');

module.exports = React.createClass({
    //输入框内容改变时调用
    textChange: function (e) {
        let scrollHeight = this.refs.textarea.scrollHeight;
        if (scrollHeight > 72) {
            this.refs.textarea.style.height = '72px';
        } else {
            this.refs.textarea.style.height = (scrollHeight <= 52 ? 36 : scrollHeight - 16) + 'px';
        }

        let value = this.refs.textarea.value;
        //换行或者空格不能发送
        let content = /^\s*\n*$/ig;
        if (!value || content.test(value)) {
            this.refs.textarea.value = '';
            this.refs.textarea.style.height = '36px';
            this.changeParentState({send: false});
            return;
        } else {
            this.changeParentState({send: true});
        }
    },

    //输入框聚焦，定位到底部
    textFocus: function () {
        //隐藏底部图片，电话图标
        this.changeParentState({
            showAdvance: false
        });
        let obj = document.getElementsByClassName("webim-chatwindow-msg")[0];
        obj.scrollTop = obj.scrollHeight;
    },

    //改变父级状态
    changeParentState: function (obj) {
        if (typeof this.props.changeParentState == 'function') {
            this.props.changeParentState(obj);
        }
    },

    setHeight: function (h) {
        this.refs.textarea.style.height = h;
    },

    send: function () {
        let props = this.props;

        if (!props.checkSend()) {
            return;
        }

        let tt = this.refs.textarea;
        let value = tt.value;

        //换行或者空格不能发送
        let content = /^\s*\n*$/ig;
        if (!value || content.test(value)) {
            tt.value = '';
            props.changeParentState({send: false});
            return;
        }

        setTimeout(function () {
            tt.value = '';
        }, 0);

        msgProcessor.send({
            type: 'txt',
            value: value
        });

        tt.style.height = '36px';
        props.changeParentState({send: false});
    },

    render: function () {
        let {show} = this.props;
        return <textarea className={show ? 'hide' : ''} ref='textarea' onFocus={this.textFocus}
                         onChange={this.textChange}></textarea>;
    }
});