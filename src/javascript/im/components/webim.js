let React = require("react");
let Chat = require('./chat/chat');
let Loading = require('./common/loading');
let pubSub = require('../pubsub');

module.exports = React.createClass({
    getInitialState: function () {
        return {
            loadingStatus: 'show',
            sendConfig: {
                enable: false, //发送区域控制
                record: true, //是否开启语音功能
                hasRecordPermission: false, //是否具有语音的权限
                advance: true, //点击+号弹出区域控制
                picture: true, //是否开启发送图片功能
                phone: true //是否开启双向电话功能
            }
        };
    },

    componentDidMount: function () {
        pubSub.subscribe('event.connection_error', () => {
            this.setState({
                sendConfig: Object.assign({}, this.state.sendConfig, {
                    enable: false
                })
            });
        })
    },

    loading: function (status) {
        this.setState({loadingStatus: status});
    },

    render: function () {
        return (
            <div>
                <div className='webim'>
                    <Chat sendConfig={this.state.sendConfig}></Chat>
                    <Loading show={this.state.loadingStatus}/>
                </div>
            </div>
        );
    }
});
