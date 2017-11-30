let React = require("react");

module.exports = React.createClass({
    render: function () {
        
        return (
			<div className={'webim-loading' + (this.props.show? '' : ' hide')}>
				<span><img src={require('images/loading.gif')} /></span>
			</div>
		);
    }
});
