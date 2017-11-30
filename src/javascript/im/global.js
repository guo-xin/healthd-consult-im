let data = {
    user: {
        name: '',
        avatar: '',
        phone: ''
    },
    other: {
        name: '',
        avatar: '',
        phone: ''
    },

    chatId: '',

    imgTypes: {
        gif: 1,
        bmp: 1,
        jpg: 1,
        png: 1
    }
};

module.exports = {
    get: function () {
        return data;
    },

    set: function (obj) {
        if(typeof obj == 'object'){
            for(let key in obj){
                data[key] = obj[key];
            }
        }
    }
};