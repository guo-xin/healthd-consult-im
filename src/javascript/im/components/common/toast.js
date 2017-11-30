let React = require('react');
let ReactDom = require('react-dom');

let instance;

let Toast = React.createClass({
    getInitialState: function () {
        return {
            icon: '',
            content: ''
        };
    },

    show: function (options = {}, type = '') {
        this.close();

        let icon = ({
                warn: require('images/auto-warn.png'),
                loading: require('images/loadings.gif')

            })[type] || '';

        let className = ({
                warn: 'warn',
                loading: 'loading'

            })[type] || '';

        this.setState({
            className: className,
            icon: icon,
            content: options.content
        });

        if (options.duration != -1) {
            setTimeout(() => {
                this.close();
            }, options.duration || 1500);
        }

        this.refs.toast.style.display = '';

    },

    close: function () {
        this.refs.toast.style.display = 'none';
    },

    render: function () {
        let {content, icon, className} = this.state;

        className = className ? ('toast ' + className) : 'toast';

        return <div className={className} style={{display: 'none'}} ref="toast">
            <div>
                {icon && <div className="icon"><img src={icon} alt=""/></div>}

                {content && <div className="content">{content}</div>}
            </div>
        </div>;
    }
});


function popup(options, type) {
    if (!instance) {
        let node = document.createElement('div');
        instance = ReactDom.render(<Toast></Toast>, node);
        document.body.appendChild(node);
    }

    instance.show(options, type);
}


module.exports = {
    warn: function (options) {
        popup(options, 'warn');
    },

    loading: function (options = {}) {
        options.duration = options.duration || -1;
        popup(options, 'loading');
    },

    show: function (options) {
        popup(options);
    },

    close: function () {
        if (instance) {
            instance.close();
        }
    }
};