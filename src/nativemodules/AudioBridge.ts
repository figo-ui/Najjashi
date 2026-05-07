import { NativeModules, Platform } from 'react-native';

interface AudioBridgeInterface {
  getAudioSessionId(): Promise<number>;
  requestAudioFocus(): Promise<boolean>;
  abandonAudioFocus(): Promise<boolean>;
}

const LINKING_ERROR =
  `The package 'AudioBridge' doesn't seem to be linked. Make sure:\n\n` +
  Platform.select({ android: '- You have the correct native dependencies installed', default: '' }) +
  '\n- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go';

const AudioBridge: AudioBridgeInterface =
  NativeModules.AudioBridge ||
  new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );

export default AudioBridge;
