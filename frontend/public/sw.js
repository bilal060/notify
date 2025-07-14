// Service Worker for Notification Monitoring
const CACHE_NAME = 'notification-monitor-v1';
const API_BASE_URL = 'https://notify-oxh1.onrender.com/api';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Handle API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(handleApiRequest(event.request));
  }
});

// Handle API requests
async function handleApiRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    return new Response(JSON.stringify({ error: 'Network error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Background sync for notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'notification-sync') {
    event.waitUntil(syncNotifications());
  }
});

// Sync notifications to server
async function syncNotifications() {
  try {
    // Get stored notifications from IndexedDB
    const notifications = await getStoredNotifications();
    
    for (const notification of notifications) {
      await sendNotificationToServer(notification);
    }
    
    // Clear stored notifications
    await clearStoredNotifications();
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Store notification in IndexedDB
async function storeNotification(notification) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NotificationDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['notifications'], 'readwrite');
      const store = transaction.objectStore('notifications');
      const addRequest = store.add(notification);
      
      addRequest.onsuccess = () => resolve(addRequest.result);
      addRequest.onerror = () => reject(addRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('notifications')) {
        db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Get stored notifications
async function getStoredNotifications() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NotificationDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['notifications'], 'readonly');
      const store = transaction.objectStore('notifications');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
  });
}

// Clear stored notifications
async function clearStoredNotifications() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NotificationDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['notifications'], 'readwrite');
      const store = transaction.objectStore('notifications');
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    };
  });
}

// Send notification to server
async function sendNotificationToServer(notification) {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notification)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
}

// Message event handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CAPTURE_NOTIFICATION') {
    const notification = event.data.notification;
    
    // Store notification locally first
    storeNotification(notification)
      .then(() => {
        // Try to send immediately
        return sendNotificationToServer(notification);
      })
      .catch((error) => {
        console.log('Stored notification for later sync:', error);
        // Schedule background sync
        self.registration.sync.register('notification-sync');
      });
  }
});

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'notification-sync') {
      event.waitUntil(syncNotifications());
    }
  });
}

// Push event (for push notifications)
self.addEventListener('push', (event) => {
  if (event.data) {
    const notification = event.data.json();
    
    const options = {
      body: notification.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: notification.data || {}
    };
    
    event.waitUntil(
      self.registration.showNotification(notification.title, options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Focus existing window or open new one
      for (const client of clients) {
        if (client.url.includes('/monitor/') && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (self.clients.openWindow) {
        return self.clients.openWindow('/monitor/');
      }
    })
  );
});

console.log('Service Worker loaded successfully'); 