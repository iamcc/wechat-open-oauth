# 微信 Open 平台代发起网页授权

[![Build Status](https://travis-ci.org/iamcc/wechat-open-oauth.svg?branch=master)](https://travis-ci.org/iamcc/wechat-open-oauth)
[![Coverage Status](https://coveralls.io/repos/github/iamcc/wechat-open-oauth/badge.svg?branch=master)](https://coveralls.io/github/iamcc/wechat-open-oauth?branch=master)


## 使用
```
const opts = {
  appId,
  scope,
  state,
  redirectUrl,
  componentAppId,
  componentAccessToken,
};
const oauth = new OAuth(opts);

const authorizeUrl = oauth.getAuthorizeUrl({ redirectUrl, scope, state });
```

## Error
```
Error {
  name: 'WechatOpenOAuthError',
  code: Number, // 错误代码，对应微信的错误代码
  message: String, // 错误信息
}
```