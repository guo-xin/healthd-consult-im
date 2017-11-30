let React = require('react');
let ReactDOM = require('react-dom');
let info = require('../common/info');
let footer = require('./footer');
let util = require('../../im/util');
let WriteTip = require('../components/tip');

let ConsultState = React.createClass({
    getInitialState: function () {
        let {serviceState} = info.get() || {};
        let state = this.formatState(serviceState);
        state.visible = serviceState ? true : false;
        return state;
    },

    componentDidMount: function () {
        let {status} = this.state;

        if (status == 1) {
            this.startWaitingTimer();
        } else if (status == 2) {
            this.startServiceTimer();
        }

        this.setFooter(status);
    },

    //格式当前组件状态
    formatState: function (serviceState = {}) {
        let time = new Date().valueOf();
        let sended = serviceState.sended;
        let serviceStatus = serviceState.serviceStatus;

        let state = {
            localTime: time, //本地当前时间
            timeLimit: serviceState.timeLimit || 48 * 60, //服务时长 分钟
            count: serviceState.messageCount || 0, //剩余服务次数
            currentTime: serviceState.currentTime || time, //服务器当前时间
            createdTime: serviceState.createdTime || 0, //服务创建时间
            startTime: serviceState.startTime || 0, //服务开始时间
            deadline: serviceState.deadline || 0,
            sended: (sended == undefined || sended == null) ? 0 : sended,
            serviceStatus: (serviceStatus == undefined || serviceStatus == null) ? 3 : serviceStatus,
            orderStatus: serviceState.orderStatus
        };

        state.status = this.formatStatus(state);

        return state;
    },

    //将服务状态信息转化为当前组件定义的状态
    formatStatus: function (state = {}) {
        let {sended, serviceStatus} = state;
        let status = -1;

        if (sended == 0) {
            status = 0;
        } else {
            if (serviceStatus == 0) {
                status = 2;
            } else if (serviceStatus == 1) {
                status = 1;
            } else if (serviceStatus == 2) {
                status = 4;
            } else {
                status = 3;
            }
        }

        return status;
    },

    //格式化状态文本信息
    formatContent: function () {
        let {status, count, createdTime, deadline} = this.state;
        let content = '';

        switch (status) {
        case -1:
            content = '';
            break;

        case 0:
            content = '报到完成';
            break;

        case 1:
            let h = Math.round((deadline - createdTime) / (60 * 60 * 1000));
            content = '已通知医生尽快接诊， 超' + h + '小时自动关闭咨询';
            break;

        case 2:
            let endTime = this.formatTime();
            content = <span>你还有<span className="num">{count}</span>条消息可以发送，<span>{endTime}</span>过期</span>;
            break;

        case 3:
            content = '咨询次数用完或服务到期';
            break;

        case 4:
            content = '服务已关闭';
            break;
        }

        return content;
    },

    formatTime: function () {
        let {localTime, currentTime, deadline} = this.state;

        return util.formatDate(localTime + deadline - currentTime, 'yyyy-MM-dd HH:mm');
    },

    setFooter: function (status) {
        let {im} = info.get() || {};
        let flag = (status == 1 || status == 2);

        if (im) {
            im.setSendOptions({
                enable: flag
            });
        }

        footer[flag ? 'hide' : 'show'](status, this);
    },

    //用户已支付，24小时倒计时
    startWaitingTimer: function () {
        let {currentTime, deadline} = this.state;

        clearTimeout(this.stt);

        this.stt = setTimeout(() => {
            this.changeStatus(4);

        }, deadline - currentTime);
    },

    //服务已开始， 48小时倒计时
    startServiceTimer: function () {
        let {currentTime, deadline} = this.state;

        clearTimeout(this.sst);

        this.sst = setTimeout(() => {
            this.changeStatus(3);

        }, deadline - currentTime);
    },

    //改变剩余消息条数
    changeCount: function () {
        let {count, status} = this.state;

        if (status == 2) {
            count = count - 1;

            this.setState({
                count: count
            });

            if (count <= 0) {
                this.changeStatus(3);
                clearTimeout(this.sst);
            }
        }
    },

    //改变状态
    changeStatus: function (status) {
        this.setFooter(status);

        this.setState({
            status: status
        });
    },

    //收到医生第一天回复后重置状态信息
    initStatus: function (params) {
        let {status, timeLimit} = this.state;

        clearTimeout(this.stt);

        if (status == 1) {
            let time = new Date().valueOf();

            this.setState({
                localTime: time,
                currentTime: time,
                startTime: time,
                deadline: time + timeLimit * 60 * 1000,
                status: 2,
                count: 10
            }, () => {
                this.startServiceTimer();
            });

            WriteTip(Object.assign({}, params, {
                firstReply: 1
            }));
        }
    },

    //校验服务状态后重置信息，params: 服务状态信息
    reset: function (params) {
        let state = this.formatState(params);
        state.visible = this.state.visible;
        this.setState(state);

        let {status} = state;

        if (status == 1) {
            this.startWaitingTimer();
        } else if (status == 2) {
            this.startServiceTimer();
        }

        this.setFooter(status);
    },

    show: function () {
        this.setState({
            visible: true
        });
    },

    hide: function () {
        this.setState({
            visible: false
        });
    },

    render: function () {
        let {visible} = this.state;

        let content = this.formatContent();

        return <div className="consult-state" style={{display: visible ? '' : 'none'}}>
            <p>{content}</p>
        </div>;
    }
});


module.exports = {
    changeCount: function () {
        if (this.component) {
            this.component.changeCount();
        }
    },

    changeStatus: function (params) {
        if (this.component) {
            this.component.initStatus(params);
        }
    },

    render: function () {
        let wrapper = document.getElementById('headerWrapper');
        let node = document.createElement('div');
        node.className = 'consult-state-wrapper';

        wrapper.insertBefore(node, wrapper.firstChild);

        this.component = ReactDOM.render(<ConsultState></ConsultState>, node);
    }
};