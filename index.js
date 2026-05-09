import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// ─── Firebase Crashlytics ───
// Automatically initialized by @react-native-firebase/crashlytics native module
// On first launch, crash reports are sent automatically
import '@react-native-firebase/crashlytics';

AppRegistry.registerComponent(appName, () => App);
