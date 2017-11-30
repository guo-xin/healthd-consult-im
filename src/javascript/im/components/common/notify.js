let React = require('react');
let ReactDOM = require('react-dom');
let pubSub = require('../../pubsub');

let componentsNode = document.getElementById('components');
let dom = document.createElement('div');
dom.className = 'notify';
componentsNode.appendChild(dom);

let Notify = React.createClass({

    click: function (e) {
        e.preventDefault();
        window.location.reload();
        //clearTimeout(this.props.st);
        ReactDOM.unmountComponentAtNode(dom);
    },

    render: function () {
        let className = '';

        if (this.props.status) {
            className = ' ' + this.props.status;
        }

        return (
            <div onClick={this.click} className={'webim-notify' + className}>
                <span className='left'>{this.props.content.message}</span>
                {this.props.content.button ? (<span className='right'><button>{this.props.content.button}</button></span>) : ''}
            </div>
        );
    }
});

module.exports = {
    success: function (content) {
        let st = setTimeout(function () {
            ReactDOM.unmountComponentAtNode(dom);
        }, 3000);

        ReactDOM.render(
            <Notify st={st} status='success' content={content}/>,
            dom
        );
    },

    error: function (content) {
        let mes = {}, st;
        if (typeof content == 'string') {
            mes = {message: content, button: '重试'}
        } else {
            st = setTimeout(function () {
                if (content.type == 500) {
                    ReactDOM.unmountComponentAtNode(dom);
                }
            }, 3000);

            switch (content.type) {
            case 0:
                mes = {message: '用户信息错误，请重试！', button: '重试'};
                this.hideSend(content);
                break;

            case 3:
                mes = {message: '用户信息错误，请重试！', button: '重试'};
                this.hideSend(content);
                break;
            case 8:
                mes = {message: '账户重复登录，请重试！', button: '重试'};
                this.hideSend(content);
                break;
            case 7:
                mes = {message: '与服务器断开连接，请重试！', button: '重试'};
                this.hideSend(content);
                break;
            case 16:
                mes = {message: '与服务器断开连接，请重试！', button: '重试'};
                this.hideSend(content);
                break;

            case 500:
                mes = {message: '暂不支持该类型文件！'};
                break;
            }
        }

        ReactDOM.render(
            <Notify st={st} status='error' content={mes}/>,
            dom
        );
    },

    tokenError: function (content) {
        let mes = {};
        if (content.type == 502) {
            mes = {message: 'token错误，请重试！', button: '重试'};
        } else if (content.type == 501) {
            mes = {message: 'token过期，请重试！', button: '重试'};
        }

        this.hideSend();

        ReactDOM.render(
            <Notify status='error' content={mes}/>,
            dom
        );
    },

    offLine: function () {
        let mes = {message: '网络异常,请检查网络重试！', button: '重试'};

        this.hideSend();
        ReactDOM.render(
            <Notify status='error' content={mes}/>,
            dom
        );
    },

    hideSend: function (content) {
        pubSub.publish('event.connection_error', {
            message: content
        });
    }
};
