let monitorConfig = {
  userId: null,
  deviceInfo: {},
  apiBaseUrl: null
};

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'INIT_MONITOR') {
    monitorConfig.userId = event.data.userId;
    monitorConfig.deviceInfo = event.data.deviceInfo;
    monitorConfig.apiBaseUrl = event.data.apiBaseUrl;
  }
});

function sendToBackend(eventType, notificationData = {}) {
  if (!monitorConfig.userId || !monitorConfig.apiBaseUrl) return;
  const payload = {
    userId: monitorConfig.userId,
    eventType,
    notificationData,
    deviceInfo: monitorConfig.deviceInfo,
    timestamp: new Date().toISOString()
  };
  fetch(`${monitorConfig.apiBaseUrl}/notifications/store`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => {});
}

self.addEventListener('push', function(event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {}
  self.registration.showNotification(data.title || 'Notification', {
    body: data.body || '',
    icon: data.icon || '/icon.png',
    data: data
  });
  sendToBackend('push', data);
});

self.addEventListener('notificationclick', function(event) {
  sendToBackend('notificationclick', event.notification.data || {});
  event.notification.close();
});

self.addEventListener('notificationclose', function(event) {
  sendToBackend('notificationclose', event.notification.data || {});
});

// Optionally, listen for other events (sync, fetch, etc.) 