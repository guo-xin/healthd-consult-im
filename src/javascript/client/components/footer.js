let React = require('react');
let ReactDom = require('react-dom');
let http = require('../common/http');
let info = require('../common/info');
let toast = require('../../im/components/common/toast');

let Footer = React.createClass({
    consultState: null,

    getInitialState: function () {
        return {
            visible: false,
            text: ''
        };
    },

    show: function (status, consultState) {
        this.consultState = consultState;

        this.setState({
            text: status == 0 ? '咨询医生' : '继续咨询',
            visible: true
        });
    },

    hide: function () {
        this.setState({
            visible: false
        });
    },

    consult: function () {
        toast.loading();
        let data = info.get();
        let {serviceState = {}} = data;

        let commonHttps = [
            http.getProducts()
        ];

        //校验服务状态
        if (serviceState.serviceStatus == 0 || serviceState.serviceStatus == 1) {
            commonHttps.push(http.getServiceState({
                consultConversationId: data.conversationId
            }));
        }

        Promise.all(commonHttps).then(
            (results) => {
                toast.close();

                if (results.length <= 1) {
                    this.describe(results[0], data);
                } else {
                    let result = results[1].data || {};

                    if (result.serviceStatus == 0 || result.serviceStatus == 1) {
                        if (this.consultState) {
                            this.consultState.reset(result);
                        }
                    } else {
                        this.describe(results[0], data);
                    }
                }
            },

            () => {
                toast.close();
            }
        );
    },

    describe: function (res = {}) {
        let global = info.get();
        if (res.result == 0) {
            let list = res.data;

            if (list.length > 0) {
                let url = '../doctorDescribe.html';
                url += '?patientId=' + global.user.patientId + '&chronicdDoctorId=' + global.other.chronicdDoctorId;
                url += '&productId=' + list[0].productId + '&doctorId=' + global.other.id;
                window.location.href = url;
            }
        }
    },

    render: function () {
        let {visible, text} = this.state;

        return <div className="footer" style={{display: visible ? '' : 'none'}}>
            <button onClick={this.consult}>{text}</button>
        </div>;
    }
});

module.exports = {
    footer: null,

    show: function (status, consultState) {
        if (this.footer) {
            this.footer.show(status, consultState);
        }
    },

    hide: function () {
        if (this.footer) {
            this.footer.hide();
        }
    },

    render: function () {
        let wrapper = document.getElementById('footerWrapper');
        let node = document.createElement('div');

        wrapper.appendChild(node);


        this.footer = ReactDom.render(<Footer></Footer>, node);
    }
};