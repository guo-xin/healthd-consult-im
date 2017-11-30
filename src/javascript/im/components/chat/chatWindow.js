let React = require("react");
let SendWrapper = require('./sendwrapper');
let processor = require('../../processor');

module.exports = React.createClass({
    scrollTop: null,
    loadMore: false,
    onScroll: function (e) {
        let element = e.target;
        let scrollTop = element.scrollTop;

        if (this.scrollTop) {
            if ((scrollTop - this.scrollTop) < 0 && scrollTop < 5 && !this.loadMore) {
                this.loadMore = true;

                processor.getHistoryMsg().then(() => {
                    this.loadMore = false;
                });
            }
        }

        this.scrollTop = scrollTop;
    },

    render: function () {
        let props = {
            sendConfig: this.props.sendConfig
        };

        return (
            <div className={'webim-chatwindow'}>
                <div id="headerWrapper"></div>
                <div id={this.props.id} ref='wrapper' className='webim-chatwindow-msg' onScroll={this.onScroll}></div>
                <div id="footerWrapper">
                    <SendWrapper {...props} />
                </div>
            </div>
        );
    }
});
