import test from 'ava';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import qs from 'querystring';
import OAuth from '../..';

test.beforeEach(t => {
  const random = Math.random().toString().slice(-10);
  t.context.oauth = new OAuth({
    appId: `appid${random}`,
    componentAppId: `component_appid${random}`,
    componentAccessToken: `component_access_token${random}`,
  });
  t.context.sb = sinon.sandbox.create();
});

test.afterEach(t => {
  t.context.sb.restore();
});

test('getAuthorizerUrl', t => {
  const prefix = 'https://open.weixin.qq.com/connect/oauth2/authorize?';
  const { appId, componentAppId } = t.context.oauth;
  const query = `appid=${appId}&redirect_uri=REDIRECT_URI&response_type=code&scope=snsapi_base&state=state&component_appid=${componentAppId}#wechat_redirect`;
  const url = `${prefix}${query}`;
  const authorizeUrl = t.context.oauth.getAuthorizeUrl({ redirectUrl: 'REDIRECT_URI' });
  t.is(authorizeUrl, url);
});

test('getAccessToken should success', async (t) => {
  const { appId, componentAppId, componentAccessToken } = t.context.oauth;
  const prefix = 'https://api.weixin.qq.com/sns/oauth2/component/access_token?';
  const query = qs.stringify({
    appid: appId,
    code: 'code',
    grant_type: 'authorization_code',
    component_appid: componentAppId,
    component_access_token: componentAccessToken,
  });
  const url = `${prefix}${query}`;
  fetchMock.mock(url, {
    "access_token":"ACCESS_TOKEN",
    "expires_in":7200,
    "refresh_token":"REFRESH_TOKEN",
    "openid":"OPENID",
    "scope":"SCOPE"
  });
  const rst = await t.context.oauth.getAccessToken('code');
  t.true(rst.hasOwnProperty('access_token'));
  t.true(rst.hasOwnProperty('expires_in'));
  t.true(rst.hasOwnProperty('refresh_token'));
  t.true(rst.hasOwnProperty('openid'));
  t.true(rst.hasOwnProperty('scope'));

  fetchMock.restore();
});

test('getUserInfo should success', async (t) => {
  const mockRst = {
    "openid": " OPENID",
    " nickname": "NICKNAME",
    "sex": "1",
    "province": "PROVINCE",
    "city": "CITY",
    "country": "COUNTRY",
    "headimgurl": "http://wx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/46",
    "privilege": ["PRIVILEGE1", "PRIVILEGE2" ],
    "unionid": "o6_bmasdasdsad6_2sgVt7hMZOPfL"
  };
  const { appId, componentAppId, componentAccessToken } = t.context.oauth;
  const prefix = 'https://api.weixin.qq.com/sns/userinfo?';
  const query = qs.stringify({
    access_token: 'access_token',
    openid: 'openid',
    lang: 'zh_CN',
  });
  const url = `${prefix}${query}`;
  fetchMock.mock(url, mockRst);
  const rst = await t.context.oauth.getUserInfo('access_token', 'openid');
  t.deepEqual(rst, mockRst);

  fetchMock.restore();
});

test('request should throw error within code', async (t) => {
  fetchMock.mock('mock_error_within_code', {
    errcode: 1,
    errmsg: 'mock',
  });
  try {
    const rst = await t.context.oauth.request('mock_error_within_code');
  } catch (err) {
    t.is(err.name, 'WechatOpenOAuthError');
    t.is(err.code, 1);
    t.is(err.message, 'mock');
  }

  fetchMock.restore();
});

test('request should throw error without code', async (t) => {
  fetchMock.mock('mock_error_without_code', 500);
  try {
    const rst = await t.context.oauth.request('mock_error_without_code');
  } catch (err) {
    t.is(err.name, 'WechatOpenOAuthError');
    t.is(err.code, undefined);
    t.is(err.message, 'Unexpected end of JSON input');
  }

  fetchMock.restore();
});