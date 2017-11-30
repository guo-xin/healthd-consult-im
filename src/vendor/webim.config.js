var WebIM = {};
WebIM.config = {
    /*
     * XMPP server
     */
    xmppURL: 'im-api.easemob.com',
    /*
     * Backend REST API URL
     */
    //apiURL: (location.protocol === 'https:' ? 'https:' : 'http:') + '//a1.easemob.com',
    apiURL: 'https://a1.easemob.com',
    /*
     * Application AppKey
     */
    //appkey: 'easemob-demo#chatdemoui',
    //appkey: '1113160923115253#lightinqury',
    //appkey: '1113160923115253#lightinqurytest',
    //appkey: '1113160923115253#lightinquryonline',
    /*
     * Whether to use HTTPS
     * @parameter {Boolean} true or false
     */
    https: true,
    /*
     * isMultiLoginSessions
     * true: A visitor can sign in to multiple webpages and receive messages at all the webpages.
     * false: A visitor can sign in to only one webpage and receive messages at the webpage.
     */
    isMultiLoginSessions: false,
    /*
     * Set to auto sign-in
     */
    isAutoLogin: true
};
