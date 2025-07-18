package com.jumpy.videoplayerapp.utils;

public class Result<T> {
    private final T data;
    private final String error;
    private final boolean isSuccess;
    
    private Result(T data, String error, boolean isSuccess) {
        this.data = data;
        this.error = error;
        this.isSuccess = isSuccess;
    }
    
    public static <T> Result<T> success(T data) {
        return new Result<>(data, null, true);
    }
    
    public static <T> Result<T> error(String error) {
        return new Result<>(null, error, false);
    }
    
    public static <T> Result<T> error(String error, T fallbackData) {
        return new Result<>(fallbackData, error, false);
    }
    
    public boolean isSuccess() {
        return isSuccess;
    }
    
    public boolean isError() {
        return !isSuccess;
    }
    
    public T getData() {
        return data;
    }
    
    public String getError() {
        return error;
    }
    
    public T getDataOrThrow() {
        if (isSuccess) {
            return data;
        }
        throw new IllegalStateException("Result is not successful: " + error);
    }
    
    public T getDataOrDefault(T defaultValue) {
        return isSuccess ? data : defaultValue;
    }
    
    public void onSuccess(ResultCallback<T> callback) {
        if (isSuccess && callback != null) {
            callback.onSuccess(data);
        }
    }
    
    public void onError(ErrorCallback callback) {
        if (isError() && callback != null) {
            callback.onError(error);
        }
    }
    
    public void handle(ResultCallback<T> successCallback, ErrorCallback errorCallback) {
        if (isSuccess && successCallback != null) {
            successCallback.onSuccess(data);
        } else if (isError() && errorCallback != null) {
            errorCallback.onError(error);
        }
    }
    
    public interface ResultCallback<T> {
        void onSuccess(T data);
    }
    
    public interface ErrorCallback {
        void onError(String error);
    }
} 