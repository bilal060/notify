package com.jumpy.videoplayerapp.viewmodel;

import android.app.Application;
import android.util.Log;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.jumpy.videoplayerapp.Video;
import com.jumpy.videoplayerapp.repository.VideoRepository;
import com.jumpy.videoplayerapp.utils.ErrorHandler;
import com.jumpy.videoplayerapp.utils.NetworkUtils;
import com.jumpy.videoplayerapp.utils.Result;
import java.util.List;

public class VideoViewModel extends AndroidViewModel {
    private static final String TAG = "VideoViewModel";
    
    private final VideoRepository videoRepository;
    private final MutableLiveData<ViewState<List<Video>>> videosState;
    private final MutableLiveData<ViewState<List<String>>> categoriesState;
    private final MutableLiveData<ViewState<List<Video>>> searchResultsState;
    private final MutableLiveData<ViewState<List<Video>>> trendingState;
    private final MutableLiveData<Boolean> isLoading;
    private final MutableLiveData<String> errorMessage;
    
    public VideoViewModel(Application application) {
        super(application);
        videoRepository = VideoRepository.getInstance(application);
        videosState = new MutableLiveData<>();
        categoriesState = new MutableLiveData<>();
        searchResultsState = new MutableLiveData<>();
        trendingState = new MutableLiveData<>();
        isLoading = new MutableLiveData<>(false);
        errorMessage = new MutableLiveData<>();
    }
    
    // LiveData getters
    public LiveData<ViewState<List<Video>>> getVideosState() { return videosState; }
    public LiveData<ViewState<List<String>>> getCategoriesState() { return categoriesState; }
    public LiveData<ViewState<List<Video>>> getSearchResultsState() { return searchResultsState; }
    public LiveData<ViewState<List<Video>>> getTrendingState() { return trendingState; }
    public LiveData<Boolean> getIsLoading() { return isLoading; }
    public LiveData<String> getErrorMessage() { return errorMessage; }
    
    // Load all videos
    public void loadVideos() {
        setLoading(true);
        clearError();
        
        videoRepository.getAllVideos(new VideoRepository.DataCallback<List<Video>>() {
            @Override
            public void onSuccess(Result<List<Video>> result) {
                setLoading(false);
                if (result.isSuccess()) {
                    List<Video> videos = result.getData();
                    if (videos != null && !videos.isEmpty()) {
                        videosState.postValue(ViewState.success(videos));
                    } else {
                        videosState.postValue(ViewState.empty("No videos available"));
                    }
                } else {
                    handleError(result.getError());
                }
            }
            
            @Override
            public void onError(ErrorHandler.AppError error) {
                setLoading(false);
                handleError(error);
            }
        });
    }
    
    // Load videos by category
    public void loadVideosByCategory(String category) {
        setLoading(true);
        clearError();
        
        videoRepository.getVideosByCategory(category, new VideoRepository.DataCallback<List<Video>>() {
            @Override
            public void onSuccess(Result<List<Video>> result) {
                setLoading(false);
                if (result.isSuccess()) {
                    List<Video> videos = result.getData();
                    if (videos != null && !videos.isEmpty()) {
                        videosState.postValue(ViewState.success(videos));
                    } else {
                        videosState.postValue(ViewState.empty("No videos in this category"));
                    }
                } else {
                    handleError(result.getError());
                }
            }
            
            @Override
            public void onError(ErrorHandler.AppError error) {
                setLoading(false);
                handleError(error);
            }
        });
    }
    
    // Search videos
    public void searchVideos(String query) {
        if (query == null || query.trim().isEmpty()) {
            searchResultsState.postValue(ViewState.empty("Enter a search term"));
            return;
        }
        
        setLoading(true);
        clearError();
        
        videoRepository.searchVideos(query, new VideoRepository.DataCallback<List<Video>>() {
            @Override
            public void onSuccess(Result<List<Video>> result) {
                setLoading(false);
                if (result.isSuccess()) {
                    List<Video> results = result.getData();
                    if (results != null && !results.isEmpty()) {
                        searchResultsState.postValue(ViewState.success(results));
                    } else {
                        searchResultsState.postValue(ViewState.empty("No videos found for '" + query + "'"));
                    }
                } else {
                    handleError(result.getError());
                }
            }
            
            @Override
            public void onError(ErrorHandler.AppError error) {
                setLoading(false);
                handleError(error);
            }
        });
    }
    
    // Load trending videos
    public void loadTrendingVideos() {
        setLoading(true);
        clearError();
        
        videoRepository.getTrendingVideos(new VideoRepository.DataCallback<List<Video>>() {
            @Override
            public void onSuccess(Result<List<Video>> result) {
                setLoading(false);
                if (result.isSuccess()) {
                    List<Video> trending = result.getData();
                    if (trending != null && !trending.isEmpty()) {
                        trendingState.postValue(ViewState.success(trending));
                    } else {
                        trendingState.postValue(ViewState.empty("No trending videos"));
                    }
                } else {
                    handleError(result.getError());
                }
            }
            
            @Override
            public void onError(ErrorHandler.AppError error) {
                setLoading(false);
                handleError(error);
            }
        });
    }
    
    // Load categories
    public void loadCategories() {
        setLoading(true);
        clearError();
        
        videoRepository.getCategories(new VideoRepository.DataCallback<List<String>>() {
            @Override
            public void onSuccess(Result<List<String>> result) {
                setLoading(false);
                if (result.isSuccess()) {
                    List<String> categories = result.getData();
                    if (categories != null && !categories.isEmpty()) {
                        categoriesState.postValue(ViewState.success(categories));
                    } else {
                        categoriesState.postValue(ViewState.empty("No categories available"));
                    }
                } else {
                    handleError(result.getError());
                }
            }
            
            @Override
            public void onError(ErrorHandler.AppError error) {
                setLoading(false);
                handleError(error);
            }
        });
    }
    
    // Upload video
    public void uploadVideo(Video video, String videoFilePath) {
        setLoading(true);
        clearError();
        
        videoRepository.uploadVideo(video, videoFilePath, new VideoRepository.DataCallback<Boolean>() {
            @Override
            public void onSuccess(Result<Boolean> result) {
                setLoading(false);
                if (result.isSuccess() && result.getData()) {
                    // Refresh videos list after successful upload
                    loadVideos();
                } else {
                    handleError("Upload failed");
                }
            }
            
            @Override
            public void onError(ErrorHandler.AppError error) {
                setLoading(false);
                handleError(error);
            }
        });
    }
    
    // Refresh data
    public void refreshData() {
        if (!NetworkUtils.isNetworkAvailable(getApplication())) {
            handleError(ErrorHandler.createNetworkError());
            return;
        }
        
        loadVideos();
        loadCategories();
    }
    
    // Private helper methods
    private void setLoading(boolean loading) {
        isLoading.postValue(loading);
    }
    
    private void clearError() {
        errorMessage.postValue(null);
    }
    
    private void handleError(ErrorHandler.AppError error) {
        Log.e(TAG, "Error in VideoViewModel", error.getCause());
        errorMessage.postValue(error.getMessage());
        
        // Update state to error
        videosState.postValue(ViewState.error(error.getMessage()));
        categoriesState.postValue(ViewState.error(error.getMessage()));
        searchResultsState.postValue(ViewState.error(error.getMessage()));
        trendingState.postValue(ViewState.error(error.getMessage()));
    }
    
    private void handleError(String message) {
        errorMessage.postValue(message);
        videosState.postValue(ViewState.error(message));
    }
    
    // ViewState class for managing UI states
    public static class ViewState<T> {
        private final State state;
        private final T data;
        private final String message;
        
        private ViewState(State state, T data, String message) {
            this.state = state;
            this.data = data;
            this.message = message;
        }
        
        public static <T> ViewState<T> success(T data) {
            return new ViewState<>(State.SUCCESS, data, null);
        }
        
        public static <T> ViewState<T> error(String message) {
            return new ViewState<>(State.ERROR, null, message);
        }
        
        public static <T> ViewState<T> empty(String message) {
            return new ViewState<>(State.EMPTY, null, message);
        }
        
        public static <T> ViewState<T> loading() {
            return new ViewState<>(State.LOADING, null, null);
        }
        
        public State getState() { return state; }
        public T getData() { return data; }
        public String getMessage() { return message; }
        
        public enum State {
            SUCCESS, ERROR, EMPTY, LOADING
        }
    }
    
    @Override
    protected void onCleared() {
        super.onCleared();
        videoRepository.shutdown();
    }
} 