let React = require("react");
let ChatWindow = require('../chat/chatwindow');
let global = require('../../global');

module.exports = React.createClass({

    render: function () {
        let id = global.get().chatId,
            props = {
                name: '',
                sendConfig: this.props.sendConfig
            };

        return (
            <div className={'webim-chat'}>
                <ChatWindow id={id} key={id} {...props}/>
            </div>
        );
    }
});
