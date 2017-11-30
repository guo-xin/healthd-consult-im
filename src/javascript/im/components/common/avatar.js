let React = require("react");

module.exports = React.createClass({

    getInitialState: function () {
        return null;
    },

    render: function () {
        let src = this.props.src;

        let className = this.props.className ? ' ' + this.props.className : '';
        return (
            <div className={'webim-avatar-icon' + className}>
                <img className='w100' src={src} title={this.props.title}/>
            </div>
        );
    }
});
