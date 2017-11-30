let React = require('react');
let ReactDOM = require('react-dom');
let info = require('../common/info');

let DocHeader = React.createClass({
    render: function () {
        let url = '../navsOfPatient.html?patientId=' + this.props.patientId;

        return <div className='head'>
            <a className='left' href="javascript: void(0);"><span >患者对话</span></a>
            <a className='right' href={url}><span >患者资料</span></a>
        </div>;
    }
});

let UserHeader = React.createClass({
    render: function () {
        let {avatar, nickName, department} = this.props;
        let data = info.get();
        let other = data.other;

        let url = '../doctorDetail.html?chronicdDoctorId=' + other.chronicdDoctorId;

        return <p className='webim-chatwindow-title'>
            <a href={url}>
                <span className="doctor-pic"><img src={avatar}/></span>
                <span>{nickName}</span>
                <span>|</span>
                <span>{department}</span>
            </a>
        </p>;
    }
});

module.exports = {
    render: function () {
        let data = info.get();
        let roleCode = data.roleCode;
        let other = data.other;
        let props;
        let wrapperNode = document.getElementById('headerWrapper');
        let headerNode = document.createElement('div');

        if (roleCode == 1) {
            let name = other.name || '';

            if (name && name.length > 5) {
                name = name.substring(0, 5) + "...医生";
            } else if (name) {
                name = name + "医生";
            }

            props = {
                nickName: name,
                department: other.department,
                avatar: other.avatar
            };


            ReactDOM.render(<UserHeader {...props}></UserHeader>, headerNode);
        } else {
            props = {
                patientId: other.patientId
            };

            ReactDOM.render(<DocHeader {...props}></DocHeader>, headerNode);
        }

        wrapperNode.appendChild(headerNode);
    }
};


