import React from 'react';
import RootNavigation from './src/navigation/views/RootNavigation';
import notifee from '@notifee/react-native';
import { SWRConfig, SWRConfiguration } from 'swr/dist/index';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CodePush, { CodePushOptions } from 'react-native-code-push';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type Props = {};

const configuration: SWRConfiguration = {
  shouldRetryOnError: false,
  dedupingInterval: 100,
  focusThrottleInterval: 500,
};
const configCodePush: CodePushOptions = {
  checkFrequency: CodePush.CheckFrequency.ON_APP_START,
  installMode: CodePush.InstallMode.ON_NEXT_RESTART,
};
const App = (props: Props) => {

  notifee.cancelAllNotifications()
  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <SWRConfig value={configuration}>
            <RootNavigation />
          </SWRConfig>
        </SafeAreaProvider>
      </GestureHandlerRootView>
      <Toast />

    </>
  );
};
const AppWithCodePush = CodePush(configCodePush)(App);
export default AppWithCodePush;
