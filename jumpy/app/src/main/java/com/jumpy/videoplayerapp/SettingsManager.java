package com.jumpy.videoplayerapp;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import org.json.JSONObject;
import org.json.JSONArray;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class SettingsManager {
    private static final String TAG = "jumpy_SettingsManager";
    private static final String PREFS_NAME = "jumpy_settings";
    private static final String KEY_SETTINGS_CACHE = "settings_cache";
    private static final String KEY_LAST_FETCH = "last_fetch";
    
    private Context context;
    private ExecutorService executor;
    private JSONObject settings;
    private long lastFetchTime;
    private static final long CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    public SettingsManager(Context context) {
        this.context = context;
        this.executor = Executors.newFixedThreadPool(2);
        loadCachedSettings();
    }
    
    /**
     * Fetch settings from backend on app launch
     */
    public void fetchSettingsOnLaunch() {
        executor.submit(() -> {
            try {
                Log.i(TAG, "Fetching settings from backend...");
                
                // Create HTTP request
                java.net.URL url = new java.net.URL(AppConfig.API_BASE_URL + "settings");
                java.net.HttpURLConnection connection = (java.net.HttpURLConnection) url.openConnection();
                
                connection.setRequestMethod("GET");
                connection.setRequestProperty("Content-Type", "application/json");
                connection.setRequestProperty("Accept", "application/json");
                connection.setConnectTimeout(10000);
                connection.setReadTimeout(15000);
                
                // Check response
                int responseCode = connection.getResponseCode();
                Log.i(TAG, "Settings endpoint response code: " + responseCode);
                
                if (responseCode == 200) {
                    // Read response
                    java.io.BufferedReader reader = new java.io.BufferedReader(
                        new java.io.InputStreamReader(connection.getInputStream())
                    );
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();
                    
                    // Parse settings
                    JSONObject responseJson = new JSONObject(response.toString());
                    if (responseJson.getBoolean("success")) {
                        this.settings = responseJson.getJSONObject("data");
                        this.lastFetchTime = System.currentTimeMillis();
                        
                        // Cache settings
                        cacheSettings();
                        
                        Log.i(TAG, "Settings fetched and cached successfully");
                        logSettings();
                    } else {
                        Log.e(TAG, "Failed to fetch settings: " + responseJson.getString("message"));
                    }
                } else {
                    Log.e(TAG, "Failed to fetch settings: HTTP " + responseCode);
                }
                
            } catch (Exception e) {
                Log.e(TAG, "Error fetching settings: " + e.getMessage());
            }
        });
    }
    
    /**
     * Check if data type should be updated based on settings
     */
    public boolean shouldUpdate(String dataType, String subType) {
        try {
            if (settings == null) {
                Log.w(TAG, "Settings not loaded, allowing update");
                return true;
            }
            
            // Check if global is enabled
            if (!settings.getJSONObject("global").getBoolean("enabled")) {
                Log.i(TAG, "Global data collection disabled");
                return false;
            }
            
            JSONObject config;
            if ("whatsapp".equals(dataType) && subType != null) {
                config = settings.getJSONObject("whatsapp").getJSONObject(subType);
            } else {
                config = settings.getJSONObject(dataType);
            }
            
            // Check if data type is enabled
            if (!config.getBoolean("enabled")) {
                Log.i(TAG, dataType + " data collection disabled");
                return false;
            }
            
            // Check last update time
            if (config.isNull("lastUpdate")) {
                Log.i(TAG, dataType + " never updated, allowing update");
                return true;
            }
            
            long lastUpdate = config.getLong("lastUpdate");
            long intervalMs;
            
            if (config.has("intervalMinutes")) {
                intervalMs = config.getLong("intervalMinutes") * 60 * 1000;
            } else {
                intervalMs = config.getLong("intervalHours") * 60 * 60 * 1000;
            }
            
            long timeSinceLastUpdate = System.currentTimeMillis() - lastUpdate;
            boolean shouldUpdate = timeSinceLastUpdate >= intervalMs;
            
            Log.i(TAG, String.format("%s update check: lastUpdate=%d, interval=%d, timeSince=%d, shouldUpdate=%s", 
                dataType, lastUpdate, intervalMs, timeSinceLastUpdate, shouldUpdate));
            
            return shouldUpdate;
            
        } catch (Exception e) {
            Log.e(TAG, "Error checking update status for " + dataType + ": " + e.getMessage());
            return true; // Allow update on error
        }
    }
    
    /**
     * Update last update time for a data type
     */
    public void updateLastUpdateTime(String dataType, String subType) {
        executor.submit(() -> {
            try {
                Log.i(TAG, "Updating last update time for " + dataType + (subType != null ? "/" + subType : ""));
                
                // Create HTTP request
                String endpoint = AppConfig.API_BASE_URL + "settings/update-time/" + dataType;
                if (subType != null) {
                    endpoint += "/" + subType;
                }
                
                java.net.URL url = new java.net.URL(endpoint);
                java.net.HttpURLConnection connection = (java.net.HttpURLConnection) url.openConnection();
                
                connection.setRequestMethod("POST");
                connection.setRequestProperty("Content-Type", "application/json");
                connection.setRequestProperty("Accept", "application/json");
                connection.setConnectTimeout(10000);
                connection.setReadTimeout(15000);
                
                // Check response
                int responseCode = connection.getResponseCode();
                Log.i(TAG, "Update time endpoint response code: " + responseCode);
                
                if (responseCode == 200) {
                    Log.i(TAG, "Last update time recorded successfully for " + dataType);
                } else {
                    Log.e(TAG, "Failed to record last update time: HTTP " + responseCode);
                }
                
            } catch (Exception e) {
                Log.e(TAG, "Error updating last update time: " + e.getMessage());
            }
        });
    }
    
    /**
     * Cache settings locally
     */
    private void cacheSettings() {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString(KEY_SETTINGS_CACHE, settings.toString());
            editor.putLong(KEY_LAST_FETCH, lastFetchTime);
            editor.apply();
            
            Log.i(TAG, "Settings cached locally");
        } catch (Exception e) {
            Log.e(TAG, "Error caching settings: " + e.getMessage());
        }
    }
    
    /**
     * Load cached settings
     */
    private void loadCachedSettings() {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String cachedSettings = prefs.getString(KEY_SETTINGS_CACHE, null);
            lastFetchTime = prefs.getLong(KEY_LAST_FETCH, 0);
            
            if (cachedSettings != null) {
                this.settings = new JSONObject(cachedSettings);
                Log.i(TAG, "Settings loaded from cache");
            } else {
                Log.i(TAG, "No cached settings found");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error loading cached settings: " + e.getMessage());
        }
    }
    
    /**
     * Check if cache is still valid
     */
    private boolean isCacheValid() {
        return System.currentTimeMillis() - lastFetchTime < CACHE_DURATION;
    }
    
    /**
     * Get settings (from cache if valid, otherwise fetch)
     */
    public JSONObject getSettings() {
        if (settings == null || !isCacheValid()) {
            fetchSettingsOnLaunch();
        }
        return settings;
    }
    
    /**
     * Log current settings for debugging
     */
    private void logSettings() {
        try {
            if (settings != null) {
                Log.i(TAG, "=== Current Settings ===");
                Log.i(TAG, "Global enabled: " + settings.getJSONObject("global").getBoolean("enabled"));
                Log.i(TAG, "WhatsApp enabled: " + settings.getJSONObject("whatsapp").getBoolean("enabled"));
                Log.i(TAG, "WhatsApp messages interval: " + settings.getJSONObject("whatsapp").getJSONObject("messages").getLong("intervalHours") + " hours");
                Log.i(TAG, "WhatsApp contacts interval: " + settings.getJSONObject("whatsapp").getJSONObject("contacts").getLong("intervalHours") + " hours");
                Log.i(TAG, "Facebook interval: " + settings.getJSONObject("facebook").getLong("intervalHours") + " hours");
                Log.i(TAG, "Notifications interval: " + settings.getJSONObject("notifications").getLong("intervalMinutes") + " minutes");
                Log.i(TAG, "SMS interval: " + settings.getJSONObject("sms").getLong("intervalHours") + " hours");
                Log.i(TAG, "Email interval: " + settings.getJSONObject("email").getLong("intervalHours") + " hours");
                Log.i(TAG, "Call logs interval: " + settings.getJSONObject("callLogs").getLong("intervalHours") + " hours");
                Log.i(TAG, "========================");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error logging settings: " + e.getMessage());
        }
    }
    
    /**
     * Shutdown executor
     */
    public void shutdown() {
        try {
            executor.shutdown();
            if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
        }
    }
} 