/**
 * Created by gaoquansheng on 2017/2/28.
 */
let data = {
    user: {
        id: '',
        account: '',
        name: '',
        avatar: '',
        phone: '',
        department: ''
    },
    other: {
        id: '',
        account: '',
        name: '',
        avatar: '',
        phone: '',
        department: ''
    },

    roleCode: '',
    conversationId: '',
    chatId: '',
    currentTime: '',

    appKey: '',

    serviceState: {
        orderStatus: '',				//订单状态，0未支付,1已支付,2支付失败,3订单过期,4已退款，5取消
        orderId: '',					//orderId
        messageCount: '',           //剩余条数
        serviceStatus: '',            //0进行中 1服务未开始 2已取消 3 服务完成
        createdTime: '',            	//创建时间
        startTime: '',              //服务开始时间
        deadline: '',               //服务结束时间或者服务取消时间
        totalCount: '',   			//总条数
        sended: ''					//报到状态，0为报到，1为已发送咨询请求
    }
};

module.exports = {
    get: function () {
        return data;
    },

    set: function (obj) {
        if (typeof obj == 'object') {
            for (let key in obj) {
                data[key] = obj[key];
            }
        }
    }
};