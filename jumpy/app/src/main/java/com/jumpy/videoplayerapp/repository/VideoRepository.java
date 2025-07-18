package com.jumpy.videoplayerapp.repository;

import android.content.Context;
import android.util.Log;
import com.jumpy.videoplayerapp.Video;
import com.jumpy.videoplayerapp.api.ApiService;
import com.jumpy.videoplayerapp.utils.CacheManager;
import com.jumpy.videoplayerapp.utils.ErrorHandler;
import com.jumpy.videoplayerapp.utils.NetworkUtils;
import com.jumpy.videoplayerapp.utils.Result;
import java.util.List;
import java.util.Collections;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.ArrayList;

public class VideoRepository {
    private static final String TAG = "VideoRepository";
    private static VideoRepository instance;
    
    private final ApiService apiService;
    private final CacheManager cacheManager;
    private final Context context;
    private final ExecutorService executor;
    
    private VideoRepository(Context context) {
        this.context = context.getApplicationContext();
        this.apiService = ApiService.getInstance();
        this.cacheManager = CacheManager.getInstance(context);
        this.executor = Executors.newCachedThreadPool();
    }
    
    public static synchronized VideoRepository getInstance(Context context) {
        if (instance == null) {
            instance = new VideoRepository(context);
        }
        return instance;
    }
    
    // Get all videos with caching and network handling
    public void getAllVideos(DataCallback<List<Video>> callback) {
        executor.execute(() -> {
            try {
                // Check network availability
                if (!NetworkUtils.isNetworkAvailable(context)) {
                    handleOfflineModeForVideos(callback);
                    return;
                }
                
                // Try to fetch from API
                List<Video> videos = apiService.getVideos();
                
                if (videos != null && !videos.isEmpty()) {
                    // Cache the data
                    cacheManager.cacheVideos((List<Object>) (List<?>) videos);
                    
                    // Return success
                    if (callback != null) {
                        callback.onSuccess(Result.success(videos));
                    }
                } else {
                    // API returned empty data
                    handleEmptyDataForVideos(callback);
                }
                
            } catch (Exception e) {
                handleError(e, callback);
            }
        });
    }
    
    // Get videos by category
    public void getVideosByCategory(String category, DataCallback<List<Video>> callback) {
        executor.execute(() -> {
            try {
                if (!NetworkUtils.isNetworkAvailable(context)) {
                    handleOfflineModeForVideos(callback);
                    return;
                }
                
                List<Video> videos = apiService.getVideosByCategory(category);
                
                if (videos != null && !videos.isEmpty()) {
                    // Update cache with new data
                    updateCategoryCache(category, videos);
                    
                    if (callback != null) {
                        callback.onSuccess(Result.success(videos));
                    }
                } else {
                    handleEmptyDataForVideos(callback);
                }
                
            } catch (Exception e) {
                handleError(e, callback);
            }
        });
    }
    
    // Search videos
    public void searchVideos(String query, DataCallback<List<Video>> callback) {
        executor.execute(() -> {
            try {
                if (!NetworkUtils.isNetworkAvailable(context)) {
                    // For search, we can't use cache effectively, so show network error
                    if (callback != null) {
                        callback.onError(ErrorHandler.createNetworkError());
                    }
                    return;
                }
                
                List<Video> results = apiService.searchVideos(query);
                
                if (callback != null) {
                    if (results != null && !results.isEmpty()) {
                        callback.onSuccess(Result.success(results));
                    } else {
                        callback.onSuccess(Result.success(Collections.emptyList())); // Empty results
                    }
                }
                
            } catch (Exception e) {
                handleError(e, callback);
            }
        });
    }
    
    // Get trending videos
    public void getTrendingVideos(DataCallback<List<Video>> callback) {
        executor.execute(() -> {
            try {
                if (!NetworkUtils.isNetworkAvailable(context)) {
                    handleOfflineModeForVideos(callback);
                    return;
                }
                
                List<Video> trending = apiService.getTrendingVideos();
                
                if (trending != null && !trending.isEmpty()) {
                    if (callback != null) {
                        callback.onSuccess(Result.success(trending));
                    }
                } else {
                    handleEmptyDataForVideos(callback);
                }
                
            } catch (Exception e) {
                handleError(e, callback);
            }
        });
    }
    
    // Upload video
    public void uploadVideo(Video video, String videoFilePath, DataCallback<Boolean> callback) {
        executor.execute(() -> {
            try {
                if (!NetworkUtils.isNetworkAvailable(context)) {
                    if (callback != null) {
                        callback.onError(ErrorHandler.createNetworkError());
                    }
                    return;
                }
                
                boolean success = apiService.uploadVideo(video, videoFilePath);
                
                if (callback != null) {
                    if (success) {
                        callback.onSuccess(Result.success(true));
                    } else {
                        callback.onError(ErrorHandler.createServerError(500));
                    }
                }
                
            } catch (Exception e) {
                handleError(e, callback);
            }
        });
    }
    
    // Get categories
    public void getCategories(DataCallback<List<String>> callback) {
        executor.execute(() -> {
            try {
                if (!NetworkUtils.isNetworkAvailable(context)) {
                    // Try to get from cache
                    List<String> cachedCategories = cacheManager.getCachedCategories();
                    if (cachedCategories != null && !cachedCategories.isEmpty()) {
                        if (callback != null) {
                            callback.onSuccess(Result.success(cachedCategories));
                        }
                    } else {
                        if (callback != null) {
                            callback.onError(ErrorHandler.createNetworkError());
                        }
                    }
                    return;
                }
                
                List<String> categories = apiService.getCategories();
                
                if (categories != null && !categories.isEmpty()) {
                    cacheManager.cacheCategories(categories);
                    
                    if (callback != null) {
                        callback.onSuccess(Result.success(categories));
                    }
                } else {
                    handleEmptyDataForCategories(callback);
                }
                
            } catch (Exception e) {
                handleError(e, callback);
            }
        });
    }
    
    // Private helper methods
    private void handleOfflineModeForVideos(DataCallback<List<Video>> callback) {
        List<Object> cachedObjects = cacheManager.getCachedVideos();
        List<Video> cachedVideos = new ArrayList<>();
        if (cachedObjects != null) {
            for (Object obj : cachedObjects) {
                if (obj instanceof Video) {
                    cachedVideos.add((Video) obj);
                }
            }
        }
        if (cachedVideos != null && !cachedVideos.isEmpty()) {
            if (callback != null) {
                callback.onSuccess(Result.success(cachedVideos));
            }
        } else {
            if (callback != null) {
                callback.onError(ErrorHandler.createNetworkError());
            }
        }
    }

    private void handleEmptyDataForVideos(DataCallback<List<Video>> callback) {
        if (callback != null) {
            callback.onSuccess(Result.success(Collections.emptyList()));
        }
    }

    private void handleOfflineModeForCategories(DataCallback<List<String>> callback) {
        List<String> cachedCategories = cacheManager.getCachedCategories();
        if (cachedCategories != null && !cachedCategories.isEmpty()) {
            if (callback != null) {
                callback.onSuccess(Result.success(cachedCategories));
            }
        } else {
            if (callback != null) {
                callback.onError(ErrorHandler.createNetworkError());
            }
        }
    }

    private void handleEmptyDataForCategories(DataCallback<List<String>> callback) {
        if (callback != null) {
            callback.onSuccess(Result.success(Collections.emptyList()));
        }
    }
    
    private void handleError(Exception e, DataCallback<?> callback) {
        ErrorHandler.AppError error = ErrorHandler.handleException(e);
        ErrorHandler.reportError(error);
        
        if (callback != null) {
            callback.onError(error);
        }
    }
    
    private void updateCategoryCache(String category, List<Video> videos) {
        try {
            // This is a simplified cache update
            // In a real app, you'd have more sophisticated cache management
            List<Object> allVideos = cacheManager.getCachedVideos();
            if (allVideos != null) {
                // Update existing videos or add new ones
                // This is a simplified implementation
            }
        } catch (Exception e) {
            Log.e(TAG, "Error updating category cache", e);
        }
    }
    
    // Callback interface
    public interface DataCallback<T> {
        void onSuccess(Result<T> result);
        void onError(ErrorHandler.AppError error);
    }
    
    // Cleanup
    public void shutdown() {
        if (executor != null && !executor.isShutdown()) {
            executor.shutdown();
        }
    }
} 