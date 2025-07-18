package com.jumpy.videoplayerapp;

import android.util.Log;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import com.jumpy.videoplayerapp.api.ApiService;

public class VideoManager {
    private static final String TAG = "VideoManager";
    private static VideoManager instance;
    private ApiService apiService;
    private ExecutorService executor;
    
    // Cache for offline access
    private List<Video> cachedVideos;
    private Map<String, List<Video>> cachedVideosByCategory;
    private List<String> cachedCategories;
    private boolean isInitialized = false;

    private VideoManager() {
        apiService = ApiService.getInstance();
        executor = Executors.newCachedThreadPool();
        cachedVideos = new ArrayList<>();
        cachedVideosByCategory = new HashMap<>();
        cachedCategories = new ArrayList<>();
    }

    public static VideoManager getInstance() {
        if (instance == null) {
            instance = new VideoManager();
        }
        return instance;
    }

    public void initializeData(VideoDataCallback callback) {
        Log.d(TAG, "initializeData() called");
        if (isInitialized) {
            Log.d(TAG, "Already initialized, calling callback immediately");
            if (callback != null) callback.onDataLoaded();
            return;
        }
        
        Log.d(TAG, "Starting data initialization...");
        executor.execute(() -> {
            try {
                Log.d(TAG, "Loading categories...");
                // Load categories first
                cachedCategories = apiService.getCategories();
                Log.d(TAG, "Loaded " + cachedCategories.size() + " categories: " + cachedCategories);
                
                Log.d(TAG, "Loading videos...");
                // Load all videos
                cachedVideos = apiService.getVideos();
                Log.d(TAG, "Loaded " + cachedVideos.size() + " videos");
                
                // Organize videos by category
                for (String category : cachedCategories) {
                    cachedVideosByCategory.put(category, new ArrayList<>());
                }
                
                for (Video video : cachedVideos) {
                    if (cachedVideosByCategory.containsKey(video.getCategory())) {
                        cachedVideosByCategory.get(video.getCategory()).add(video);
                    }
                }
                
                isInitialized = true;
                Log.d(TAG, "Data initialization completed successfully");
                
                if (callback != null) {
                    callback.onDataLoaded();
                }
                
            } catch (Exception e) {
                Log.e(TAG, "Error initializing video data", e);
                if (callback != null) {
                    callback.onError("Failed to load videos: " + e.getMessage());
                }
            }
        });
    }

    public List<Video> getAllVideos() {
        return new ArrayList<>(cachedVideos);
    }

    public List<Video> getVideosByCategory(String category) {
        return new ArrayList<>(cachedVideosByCategory.getOrDefault(category, new ArrayList<>()));
    }

    public List<String> getCategories() {
        return new ArrayList<>(cachedCategories);
    }

    public List<Video> getPlaylist(String playlistName) {
        // This would need to be implemented with your API
        return new ArrayList<>();
    }

    public void addToPlaylist(String playlistName, Video video) {
        // This would need to be implemented with your API
    }

    public void removeFromPlaylist(String playlistName, Video video) {
        // This would need to be implemented with your API
    }

    public List<String> getPlaylistNames() {
        // This would need to be implemented with your API
        return new ArrayList<>();
    }

    public void addVideo(Video video, VideoUploadCallback callback) {
        executor.execute(() -> {
            try {
                // This would upload to your API
                // For now, just add to cache
                cachedVideos.add(video);
                if (cachedVideosByCategory.containsKey(video.getCategory())) {
                    cachedVideosByCategory.get(video.getCategory()).add(video);
                }
                
                if (callback != null) {
                    callback.onSuccess();
                }
            } catch (Exception e) {
                Log.e(TAG, "Error adding video", e);
                if (callback != null) {
                    callback.onError("Failed to add video: " + e.getMessage());
                }
            }
        });
    }

    public void searchVideos(String query, SearchCallback callback) {
        executor.execute(() -> {
            try {
                List<Video> results = apiService.searchVideos(query);
                if (callback != null) {
                    callback.onSearchComplete(results);
                }
            } catch (Exception e) {
                Log.e(TAG, "Error searching videos", e);
                if (callback != null) {
                    callback.onError("Search failed: " + e.getMessage());
                }
            }
        });
    }

    public void getTrendingVideos(TrendingCallback callback) {
        executor.execute(() -> {
            try {
                List<Video> trending = apiService.getTrendingVideos();
                if (callback != null) {
                    callback.onTrendingLoaded(trending);
                }
            } catch (Exception e) {
                Log.e(TAG, "Error loading trending videos", e);
                if (callback != null) {
                    callback.onError("Failed to load trending videos: " + e.getMessage());
                }
            }
        });
    }

    public void getRecommendedVideos(String userId, RecommendationCallback callback) {
        executor.execute(() -> {
            try {
                // This would call your recommendation API
                // For now, return trending videos
                List<Video> recommended = apiService.getTrendingVideos();
                if (callback != null) {
                    callback.onRecommendationsLoaded(recommended);
                }
            } catch (Exception e) {
                Log.e(TAG, "Error loading recommendations", e);
                if (callback != null) {
                    callback.onError("Failed to load recommendations: " + e.getMessage());
                }
            }
        });
    }

    public void refreshData(VideoDataCallback callback) {
        isInitialized = false;
        initializeData(callback);
    }

    // Callback interfaces
    public interface VideoDataCallback {
        void onDataLoaded();
        void onError(String error);
    }

    public interface VideoUploadCallback {
        void onSuccess();
        void onError(String error);
    }

    public interface SearchCallback {
        void onSearchComplete(List<Video> results);
        void onError(String error);
    }

    public interface TrendingCallback {
        void onTrendingLoaded(List<Video> trending);
        void onError(String error);
    }

    public interface RecommendationCallback {
        void onRecommendationsLoaded(List<Video> recommendations);
        void onError(String error);
    }
} 