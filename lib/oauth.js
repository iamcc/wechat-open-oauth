import 'isomorphic-fetch';
import qs from 'querystring';

class WechatOpenOAuthError extends Error {
  constructor(msg, code) {
    super(msg);
    this.code = code;
    this.name = 'WechatOpenOAuthError';
  }
}

export default class OAuth {
  constructor({
    appId,
    scope = 'snsapi_base',
    state = 'state',
    redirectUrl,
    componentAppId,
    componentAccessToken
  } = {}) {
    if (!(appId && componentAppId && componentAccessToken)) {
      throw new WechatOpenOAuthError('invalid params');
    }

    Object.assign(this, {
      appId,
      redirectUrl,
      scope,
      state,
      componentAppId,
      componentAccessToken
    });
  }

  getAuthorizeUrl({ redirectUrl, scope, state }) {
    const prefix = 'https://open.weixin.qq.com/connect/oauth2/authorize?';
    const query = qs.stringify({
      appid: this.appId,
      redirect_uri: redirectUrl || this.redirectUrl,
      response_type: 'code',
      scope: scope || this.scope,
      state: state || this.state,
      component_appid: this.componentAppId,
    });

    return `${prefix}${query}#wechat_redirect`;
  }

  getAccessToken(code) {
    const prefix = 'https://api.weixin.qq.com/sns/oauth2/component/access_token?';
    const query = qs.stringify({
      appid: this.appId,
      code,
      grant_type: 'authorization_code',
      component_appid: this.componentAppId,
      component_access_token: this.componentAccessToken,
    });
    const url = `${prefix}${query}`;

    return this.request(url);
  }

  getUserInfo(accessToken, openid) {
    const prefix = 'https://api.weixin.qq.com/sns/userinfo?';
    const query = qs.stringify({
      access_token: accessToken,
      openid,
      lang: 'zh_CN',
    });
    const url = `${prefix}${query}`;
    return this.request(url);
  }

  async request(url, isRetry) {
    let rst;

    try {
      const res = await fetch(url);
      rst = await res.json();
    } catch (err) {
      throw new WechatOpenOAuthError(err.message);
    }

    if (rst.errcode) {
      throw new WechatOpenOAuthError(rst.errmsg, rst.errcode);
    }

    return rst;
  }
}