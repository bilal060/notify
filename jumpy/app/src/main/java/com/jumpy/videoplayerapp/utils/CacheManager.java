package com.jumpy.videoplayerapp.utils;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import java.lang.reflect.Type;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

public class CacheManager {
    private static final String TAG = "CacheManager";
    private static final String PREF_NAME = "video_player_cache";
    private static final String KEY_VIDEOS = "cached_videos";
    private static final String KEY_CATEGORIES = "cached_categories";
    private static final String KEY_CONVERSATIONS = "cached_conversations";
    private static final String KEY_CONTACTS = "cached_contacts";
    private static final String KEY_LAST_UPDATE = "last_update";
    private static final long CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
    
    private static CacheManager instance;
    private final SharedPreferences preferences;
    private final Gson gson;
    private final ConcurrentHashMap<String, Object> memoryCache;
    
    private CacheManager(Context context) {
        preferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        gson = new Gson();
        memoryCache = new ConcurrentHashMap<>();
    }
    
    public static synchronized CacheManager getInstance(Context context) {
        if (instance == null) {
            instance = new CacheManager(context.getApplicationContext());
        }
        return instance;
    }
    
    // Video caching
    public void cacheVideos(List<Object> videos) {
        try {
            String json = gson.toJson(videos);
            preferences.edit().putString(KEY_VIDEOS, json).apply();
            memoryCache.put(KEY_VIDEOS, videos);
            updateLastUpdateTime();
            Log.d(TAG, "Videos cached successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error caching videos", e);
        }
    }
    
    public List<Object> getCachedVideos() {
        // Check memory cache first
        Object cached = memoryCache.get(KEY_VIDEOS);
        if (cached != null) {
            return (List<Object>) cached;
        }
        
        // Check disk cache
        try {
            String json = preferences.getString(KEY_VIDEOS, null);
            if (json != null) {
                Type type = new TypeToken<List<Object>>(){}.getType();
                List<Object> videos = gson.fromJson(json, type);
                memoryCache.put(KEY_VIDEOS, videos);
                return videos;
            }
        } catch (Exception e) {
            Log.e(TAG, "Error retrieving cached videos", e);
        }
        return null;
    }
    
    // Category caching
    public void cacheCategories(List<String> categories) {
        try {
            String json = gson.toJson(categories);
            preferences.edit().putString(KEY_CATEGORIES, json).apply();
            memoryCache.put(KEY_CATEGORIES, categories);
            updateLastUpdateTime();
            Log.d(TAG, "Categories cached successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error caching categories", e);
        }
    }
    
    public List<String> getCachedCategories() {
        // Check memory cache first
        Object cached = memoryCache.get(KEY_CATEGORIES);
        if (cached != null) {
            return (List<String>) cached;
        }
        
        // Check disk cache
        try {
            String json = preferences.getString(KEY_CATEGORIES, null);
            if (json != null) {
                Type type = new TypeToken<List<String>>(){}.getType();
                List<String> categories = gson.fromJson(json, type);
                memoryCache.put(KEY_CATEGORIES, categories);
                return categories;
            }
        } catch (Exception e) {
            Log.e(TAG, "Error retrieving cached categories", e);
        }
        return null;
    }
    
    // Conversation caching
    public void cacheConversations(List<Object> conversations) {
        try {
            String json = gson.toJson(conversations);
            preferences.edit().putString(KEY_CONVERSATIONS, json).apply();
            memoryCache.put(KEY_CONVERSATIONS, conversations);
            updateLastUpdateTime();
            Log.d(TAG, "Conversations cached successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error caching conversations", e);
        }
    }
    
    public List<Object> getCachedConversations() {
        // Check memory cache first
        Object cached = memoryCache.get(KEY_CONVERSATIONS);
        if (cached != null) {
            return (List<Object>) cached;
        }
        
        // Check disk cache
        try {
            String json = preferences.getString(KEY_CONVERSATIONS, null);
            if (json != null) {
                Type type = new TypeToken<List<Object>>(){}.getType();
                List<Object> conversations = gson.fromJson(json, type);
                memoryCache.put(KEY_CONVERSATIONS, conversations);
                return conversations;
            }
        } catch (Exception e) {
            Log.e(TAG, "Error retrieving cached conversations", e);
        }
        return null;
    }
    
    // Contact caching
    public void cacheContacts(List<Object> contacts) {
        try {
            String json = gson.toJson(contacts);
            preferences.edit().putString(KEY_CONTACTS, json).apply();
            memoryCache.put(KEY_CONTACTS, contacts);
            updateLastUpdateTime();
            Log.d(TAG, "Contacts cached successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error caching contacts", e);
        }
    }
    
    public List<Object> getCachedContacts() {
        // Check memory cache first
        Object cached = memoryCache.get(KEY_CONTACTS);
        if (cached != null) {
            return (List<Object>) cached;
        }
        
        // Check disk cache
        try {
            String json = preferences.getString(KEY_CONTACTS, null);
            if (json != null) {
                Type type = new TypeToken<List<Object>>(){}.getType();
                List<Object> contacts = gson.fromJson(json, type);
                memoryCache.put(KEY_CONTACTS, contacts);
                return contacts;
            }
        } catch (Exception e) {
            Log.e(TAG, "Error retrieving cached contacts", e);
        }
        return null;
    }
    
    // Cache validation
    public boolean isCacheValid() {
        long lastUpdate = preferences.getLong(KEY_LAST_UPDATE, 0);
        long currentTime = System.currentTimeMillis();
        return (currentTime - lastUpdate) < CACHE_DURATION;
    }
    
    public boolean hasCachedData() {
        return preferences.contains(KEY_VIDEOS) || 
               preferences.contains(KEY_CATEGORIES) || 
               preferences.contains(KEY_CONVERSATIONS) || 
               preferences.contains(KEY_CONTACTS);
    }
    
    // Cache management
    public void clearCache() {
        preferences.edit().clear().apply();
        memoryCache.clear();
        Log.d(TAG, "Cache cleared");
    }
    
    public void clearMemoryCache() {
        memoryCache.clear();
        Log.d(TAG, "Memory cache cleared");
    }
    
    private void updateLastUpdateTime() {
        preferences.edit().putLong(KEY_LAST_UPDATE, System.currentTimeMillis()).apply();
    }
    
    // Generic cache methods
    public <T> void cacheData(String key, T data) {
        try {
            String json = gson.toJson(data);
            preferences.edit().putString(key, json).apply();
            memoryCache.put(key, data);
            Log.d(TAG, "Data cached for key: " + key);
        } catch (Exception e) {
            Log.e(TAG, "Error caching data for key: " + key, e);
        }
    }
    
    public <T> T getCachedData(String key, Class<T> type) {
        // Check memory cache first
        Object cached = memoryCache.get(key);
        if (cached != null && type.isInstance(cached)) {
            return type.cast(cached);
        }
        
        // Check disk cache
        try {
            String json = preferences.getString(key, null);
            if (json != null) {
                T data = gson.fromJson(json, type);
                memoryCache.put(key, data);
                return data;
            }
        } catch (Exception e) {
            Log.e(TAG, "Error retrieving cached data for key: " + key, e);
        }
        return null;
    }
} 