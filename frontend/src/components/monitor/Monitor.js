import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Monitor = () => {
  const { userId } = useParams();
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    // Fetch the monitor.html content and inject the userId
    fetch('/monitor.html')
      .then(response => response.text())
      .then(html => {
        // Replace the userId in the HTML
        const modifiedHtml = html.replace(
          /const userId = window\.location\.pathname\.split\('\/'\)\.pop\(\);/,
          `const userId = '${userId}';`
        );
        setHtmlContent(modifiedHtml);
      })
      .catch(error => {
        console.error('Failed to load monitor.html:', error);
        // Fallback to a simple monitoring page
        setHtmlContent(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Notification Monitor</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: Arial, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                margin: 0;
                padding: 20px;
                text-align: center;
              }
              .container { max-width: 500px; margin: 0 auto; }
              .status { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0; }
              button { background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>📱 Notification Monitor</h1>
              <div class="status">
                <h2>User ID: ${userId}</h2>
                <p>This page will monitor notifications on your device.</p>
                <button onclick="requestPermission()">Grant Permission</button>
              </div>
            </div>
            <script>
              const userId = '${userId}';
              const API_BASE_URL = 'http://localhost:5001/api';
              
              async function requestPermission() {
                try {
                  const permission = await Notification.requestPermission();
                  if (permission === 'granted') {
                    document.querySelector('.status').innerHTML = '<h2>✅ Permission Granted</h2><p>Monitoring active...</p>';
                    startMonitoring();
                  }
                } catch (error) {
                  console.error('Permission request failed:', error);
                }
              }
              
              function startMonitoring() {
                // Simulate notifications every 15 seconds
                setInterval(() => {
                  const notifications = [
                    { title: 'New Message', body: 'You have a new message', appName: 'Messages' },
                    { title: 'Email', body: 'New email received', appName: 'Mail' },
                    { title: 'Social', body: 'New post from friend', appName: 'Social App' }
                  ];
                  const random = notifications[Math.floor(Math.random() * notifications.length)];
                  captureNotification(random);
                }, 15000);
              }
              
              async function captureNotification(data) {
                try {
                  await fetch(\`\${API_BASE_URL}/notifications/store\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userId: userId,
                      ...data,
                      deviceInfo: { userAgent: navigator.userAgent }
                    })
                  });
                  console.log('Notification captured:', data.title);
                } catch (error) {
                  console.error('Failed to send notification:', error);
                }
              }
              
              // Auto-request permission
              setTimeout(() => {
                if (Notification.permission === 'default') {
                  requestPermission();
                }
              }, 1000);
            </script>
          </body>
          </html>
        `);
      });
  }, [userId]);

  if (htmlContent) {
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        style={{ width: '100%', height: '100vh' }}
      />
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>📱 Loading monitoring page...</h1>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid rgba(255,255,255,0.3)', 
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '20px auto'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Monitor; 