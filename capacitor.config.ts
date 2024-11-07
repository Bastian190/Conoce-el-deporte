import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ConoceElDeporte',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    OneSignal: {
      appId: '7595a2d0-2bf1-41f9-a876-3434e0f2bfd8',  // Sustituye con tu App ID de OneSignal
    },
  },
};

export default config;
