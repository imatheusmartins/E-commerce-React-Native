import { registerRootComponent } from 'expo';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// Agora pode usar normalmente
const id = uuidv4();

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
