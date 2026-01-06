export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        // eslint-disable-next-line no-console
        // eslint-disable-next-line no-console
        console.log('Service Worker успешно зарегистрирован: ', registration);
        return registration;
      })
      .catch((registrationError) => {
        // eslint-disable-next-line no-console
        // eslint-disable-next-line no-console
        console.log('Ошибка регистрации Service Worker: ', registrationError);
      });
  }
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    // eslint-disable-next-line no-console
    // eslint-disable-next-line no-console
    console.log('Браузер не поддерживает уведомления');
    return false;
  }

  if (Notification.permission === 'granted') {
    // eslint-disable-next-line no-console
    // eslint-disable-next-line no-console
    console.log('Разрешение на уведомления уже получено');
    return true;
  }

  if (Notification.permission === 'denied') {
    // eslint-disable-next-line no-console
    // eslint-disable-next-line no-console
    console.log('Разрешение на уведомления отклонено');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      // eslint-disable-next-line no-console
      // eslint-disable-next-line no-console
      console.log('Разрешение на уведомления получено');
      return true;
    } else {
      // eslint-disable-next-line no-console
      // eslint-disable-next-line no-console
      console.log('Разрешение на уведомления отклонено');
      return false;
    }
  } catch (error) {
    console.error('Ошибка при запросе разрешения:', error);
    return false;
  }
};

export const sendTestNotification = async (title = 'Тестовое уведомление', options = {}) => {
  if (Notification.permission !== 'granted') {
    const granted = await requestNotificationPermission();
    if (!granted) {
      // eslint-disable-next-line no-console
      console.log('Нет разрешения на уведомления');
      return false;
    }
  }

  try {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;

        const notificationOptions = {
          body: options.body || 'Это тестовое push-уведомление от вашего PWA!',
          icon: options.icon || '/logo192.png',
          badge: options.badge || '/logo192.png',
          image: options.image,
          tag: options.tag || 'test-notification',
          requireInteraction: options.requireInteraction !== undefined ? options.requireInteraction : true,
          actions: options.actions || [],
          data: options.data || {
            url: window.location.origin,
            timestamp: Date.now()
          },
          ...options
        };

        await registration.showNotification(title, notificationOptions);
        // eslint-disable-next-line no-console
        console.log('Push-уведомление отправлено через Service Worker');
        return true;
      } catch (swError) {
        // eslint-disable-next-line no-console
        console.log('Ошибка через Service Worker, используем обычный API:', swError);
      }
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: options.body || 'Это тестовое уведомление от вашего PWA!',
        icon: options.icon || '/logo192.png',
        badge: options.badge || '/logo192.png',
        tag: options.tag || 'test-notification',
        requireInteraction: options.requireInteraction !== undefined ? options.requireInteraction : true,
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // eslint-disable-next-line no-console
      console.log('Уведомление отправлено через Notification API');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Ошибка отправки уведомления:', error);
    return false;
  }
};

export const subscribeToPush = async () => {
  if (!('serviceWorker' in navigator)) {
    // eslint-disable-next-line no-console
    console.log('Service Worker не поддерживается');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    // eslint-disable-next-line no-console
    console.log('Подписка на push получена:', subscription);
    return subscription;
  } catch (error) {
    console.error('Ошибка подписки на push:', error);
    return null;
  }
};

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
