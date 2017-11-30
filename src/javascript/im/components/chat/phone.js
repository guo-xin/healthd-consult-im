let React = require('react');
let ReactDOM = require('react-dom');
let global = require('../../global');
let processor = require('../../processor');

let Dialog = React.createClass({
    user: {
        avatar: '',
        phone: ''
    },

    other: {
        avatar: '',
        phone: ''
    },

    getInitialState: function () {
        return {
            visible: false,
            callBtnText: '匿名电话',
            topText: '匿名电话',
            bottomText: '若手机漫游或本地接听不免费，可能会产生相应费用',
            time: 0
        }
    },

    call: function () {
        this.props.stop();

        clearTimeout(this.timeOut);
        this.state.time = 15;

        this.setState({
            topText: '即将来电，请等待 15 秒',
            bottomText: '将会有第三方号码同时呼叫您和对方，双方接听后即可通话'
        });

        this.startTimer();

        processor.call().then(
            () => {
            },
            (error) => {
                clearTimeout(this.timeOut);

                this.setState({
                    topText: error.msg || '呼叫失败',
                    bottomText: '请重拨',
                    callBtnText: '重拨',
                    time: 0
                });
            }
        );
    },

    startTimer: function () {
        let time = this.state.time;
        if (time > 0) {
            this.timeOut = setTimeout(() => {
                this.setState({
                    time: time - 1,
                    topText: '即将来电，请等待 ' + (time - 1) + ' 秒',
                    bottomText: '将会有第三方号码同时呼叫您和对方，双方接听后即可通话',
                });
                this.startTimer();
            }, 1000);
        } else {
            clearTimeout(this.timeOut);
            this.setState({
                topText: '长时间没有来电？',
                bottomText: '请重拨',
                callBtnText: '重拨'
            });
        }
    },

    cancel: function () {
        clearTimeout(this.timeOut);

        this.setState({
            visible: false,
            callBtnText: '匿名电话',
            topText: '匿名电话',
            bottomText: '若手机漫游或本地接听不免费，可能会产生相应费用',
            time: 0
        });
    },

    show: function () {
        if (!this.from) {
            let data = global.get();
            this.user = {
                avatar: data.user.avatar
            };

            this.other = {
                avatar: data.other.avatar
            };
        }

        this.setState({
            visible: true
        });
    },

    render: function () {
        let {visible, topText, bottomText, callBtnText} = this.state;

        return <div className={'phone-dialog' + (visible ? '' : ' hide')}>
            < div className="phone-top">
                <span className="phone-left">
                <img src={this.user.avatar}/>
                </span>
                <span>
                <img src={require("images/from-to.png")}/>
                </span>
                <span className="phone-right">
                <img src={this.other.avatar}/>
                </span>
            </div>

            <div className={'phone-center'}>
                <p>{topText}</p>
                <span>{bottomText}</span>
            </div>

            <div className="phone-bottom">
                <div className={'phone-start'}>
                    <button onClick={this.call}>{callBtnText}</button>
                </div>

                <div className="phone-cancel">
                    <button onClick={this.cancel}>取 消</button>
                </div>
            </div>
        </div>;
    }
});

module.exports = React.createClass({
    componentDidMount: function () {
        //this.createDialog();
    },

    createDialog: function () {
        let node = document.createElement('div');
        document.body.appendChild(node);
        this.dialog = ReactDOM.render(<Dialog stop={this.props.stop}></Dialog>, node)
    },

    showDialog: function () {
        if (!this.dialog) {
            this.createDialog();
        }

        this.dialog.show();

        this.props.changeParentState({
            showAdvance: false
        });
    },

    render: function () {
        return <li className={'startPhone'}>
            <span className='webim-phone-icon small' onClick={this.showDialog}></span>
            <p>免费电话</p>
        </li>
    }
});