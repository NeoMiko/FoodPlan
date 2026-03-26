import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

if (typeof window !== 'undefined') {
  window.__foodPlanInstallPromptEvent = null;

  const shouldIgnoreExternalScriptError = event => {
    const message = event?.message || event?.reason?.message || '';
    const filename = event?.filename || '';

    return (
      message === 'Script error.' ||
      message.includes('selectedAddresss') ||
      filename.startsWith('chrome-extension://') ||
      filename.startsWith('moz-extension://')
    );
  };

  window.addEventListener('error', event => {
    if (shouldIgnoreExternalScriptError(event)) {
      event.preventDefault();
      return false;
    }

    return undefined;
  });

  window.addEventListener('unhandledrejection', event => {
    if (shouldIgnoreExternalScriptError(event)) {
      event.preventDefault();
    }
  });

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    window.__foodPlanInstallPromptEvent = event;
    window.dispatchEvent(new Event('foodplan-install-available'));
  });

  window.addEventListener('appinstalled', () => {
    window.__foodPlanInstallPromptEvent = null;
    window.dispatchEvent(new Event('foodplan-install-complete'));
  });
}

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
