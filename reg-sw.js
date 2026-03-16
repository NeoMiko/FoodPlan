import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

const rootTag = document.getElementById('root');

if (!rootTag) {
  throw new Error('Brakuje elementu #root w web/index.html');
}

AppRegistry.runApplication(appName, {
  rootTag,
});

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(error => {
      console.error('Service worker registration failed:', error);
    });
  });
}