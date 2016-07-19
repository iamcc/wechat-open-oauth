import test from 'ava';
import OAuth from '..';

test('index.test.js', t => {
  try {
    new OAuth();
  } catch (err) {
    t.is(err.name, 'WechatOpenOAuthError');
    t.is(err.message, 'invalid params');
  }
});