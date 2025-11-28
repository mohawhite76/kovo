import * as OneSignal from '@onesignal/node-onesignal';
import dotenv from 'dotenv';

dotenv.config();

const app_key_provider = {
  getToken() {
    return process.env.ONESIGNAL_API_KEY;
  }
};

const configuration = OneSignal.createConfiguration({
  authMethods: {
    app_key: {
      tokenProvider: app_key_provider
    }
  }
});

const client = new OneSignal.DefaultApi(configuration);

export { client };
export const APP_ID = process.env.ONESIGNAL_APP_ID;
