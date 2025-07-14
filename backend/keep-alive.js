#!/usr/bin/env node

/**
 * Keep-alive script for Fly.io deployment
 * This script pings your server to keep it awake
 * Run this locally or on a separate service to ensure your server never sleeps
 */

const https = require('https');
const http = require('http');

// Configuration
const SERVER_URL = process.env.SERVER_URL || 'https://notification-backend.onrender.com';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes (less than Render's 15-minute sleep)
const ENDPOINTS = ['/api/health', '/api/keep-alive'];

console.log(`🚀 Starting keep-alive service for: ${SERVER_URL}`);
console.log(`⏰ Ping interval: ${PING_INTERVAL / 1000} seconds (prevents Render sleep)`);

function pingServer(endpoint) {
  const url = `${SERVER_URL}${endpoint}`;
  const protocol = url.startsWith('https') ? https : http;
  
  const req = protocol.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const timestamp = new Date().toISOString();
      console.log(`✅ [${timestamp}] ${endpoint} - Status: ${res.statusCode}`);
    });
  });

  req.on('error', (err) => {
    const timestamp = new Date().toISOString();
    console.error(`❌ [${timestamp}] ${endpoint} - Error: ${err.message}`);
  });

  req.setTimeout(10000, () => {
    const timestamp = new Date().toISOString();
    console.error(`⏰ [${timestamp}] ${endpoint} - Timeout`);
    req.destroy();
  });
}

function startKeepAlive() {
  console.log('🔄 Starting keep-alive loop...');
  
  // Initial ping
  ENDPOINTS.forEach(endpoint => pingServer(endpoint));
  
  // Set up interval
  setInterval(() => {
    ENDPOINTS.forEach(endpoint => pingServer(endpoint));
  }, PING_INTERVAL);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Keep-alive service stopped');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Keep-alive service stopped');
  process.exit(0);
});

// Start the service
startKeepAlive(); 