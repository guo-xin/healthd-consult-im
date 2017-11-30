let React = require('react');
let Notify = require('../common/notify');
let global = require('../../global');
let msgProcessor = require('../../message');

module.exports = React.createClass({
    send: function (e) {
        e.preventDefault();

        let {checkSend, changeParentState} = this.props;

        if (!checkSend()) {
            return;
        }

        changeParentState({showAdvance: false});

        this.refs.picture.click();
    },

    onChange: function () {
        let config = global.get();
        let api = config.api;
        let imgTypes = config.imgTypes;

        let self = this;
        let picDom = self.refs.picture;
        let files = picDom.files;
        let file = api.utils.getFileUrl(picDom);

        if (files.length > 0) {
            if (files[0] > 10000000) {
                return false;
            }
        } else {
            return false;
        }

        if (!file.filename) {
            picDom.value = null;
            return false;
        }

        if (!imgTypes[file.filetype.toLowerCase()]) {
            picDom.value = null;
            Notify.error({type: 500});
            return;
        }

        this.appendMsg({
            picDom: picDom,
            file: file
        });
    },

    appendMsg: function (obj) {
        msgProcessor.append({
            send: true,
            data: '',
            file: obj.file,
            picDom: obj.picDom,
            serverId: obj.serverId
        }, 'sendImg');
    },

    render: function () {
        return <li className="addPicture">
            <span className='webim-picture-icon small' onClick={this.send}></span>
            <p>发送图片</p>
            <input ref='picture' onChange={this.onChange} type='file' accept="image/*" className='hide'/>
        </li>
    }
});