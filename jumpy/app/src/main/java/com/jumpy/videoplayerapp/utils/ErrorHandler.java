package com.jumpy.videoplayerapp.utils;

import android.content.Context;
import android.util.Log;
import android.widget.Toast;
import java.io.IOException;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;

public class ErrorHandler {
    private static final String TAG = "ErrorHandler";
    
    public enum ErrorType {
        NETWORK_ERROR,
        SERVER_ERROR,
        AUTHENTICATION_ERROR,
        VALIDATION_ERROR,
        CACHE_ERROR,
        UNKNOWN_ERROR
    }
    
    public static class AppError {
        private final ErrorType type;
        private final String message;
        private final String technicalDetails;
        private final Throwable cause;
        
        public AppError(ErrorType type, String message, String technicalDetails, Throwable cause) {
            this.type = type;
            this.message = message;
            this.technicalDetails = technicalDetails;
            this.cause = cause;
        }
        
        public AppError(ErrorType type, String message) {
            this(type, message, null, null);
        }
        
        public ErrorType getType() { return type; }
        public String getMessage() { return message; }
        public String getTechnicalDetails() { return technicalDetails; }
        public Throwable getCause() { return cause; }
        
        @Override
        public String toString() {
            return "AppError{" +
                    "type=" + type +
                    ", message='" + message + '\'' +
                    ", technicalDetails='" + technicalDetails + '\'' +
                    '}';
        }
    }
    
    public static AppError handleException(Throwable throwable) {
        Log.e(TAG, "Handling exception", throwable);
        
        if (throwable instanceof IOException) {
            return handleIOException((IOException) throwable);
        } else if (throwable instanceof RuntimeException) {
            return handleRuntimeException((RuntimeException) throwable);
        } else {
            return new AppError(ErrorType.UNKNOWN_ERROR, 
                              "An unexpected error occurred", 
                              throwable.getMessage(), 
                              throwable);
        }
    }
    
    private static AppError handleIOException(IOException e) {
        if (e instanceof SocketTimeoutException) {
            return new AppError(ErrorType.NETWORK_ERROR, 
                              "Request timed out. Please check your connection.", 
                              "SocketTimeoutException", 
                              e);
        } else if (e instanceof UnknownHostException) {
            return new AppError(ErrorType.NETWORK_ERROR, 
                              "Unable to connect to server. Please check your internet connection.", 
                              "UnknownHostException", 
                              e);
        } else {
            return new AppError(ErrorType.NETWORK_ERROR, 
                              "Network error occurred. Please try again.", 
                              e.getMessage(), 
                              e);
        }
    }
    
    private static AppError handleRuntimeException(RuntimeException e) {
        String message = e.getMessage();
        if (message != null && message.contains("authentication")) {
            return new AppError(ErrorType.AUTHENTICATION_ERROR, 
                              "Authentication failed. Please log in again.", 
                              message, 
                              e);
        } else {
            return new AppError(ErrorType.UNKNOWN_ERROR, 
                              "Application error occurred.", 
                              message, 
                              e);
        }
    }
    
    public static AppError createNetworkError() {
        return new AppError(ErrorType.NETWORK_ERROR, 
                          "No internet connection. Please check your network settings.");
    }
    
    public static AppError createServerError(int statusCode) {
        String message = "Server error occurred";
        if (statusCode == 500) {
            message = "Internal server error. Please try again later.";
        } else if (statusCode == 404) {
            message = "Resource not found.";
        } else if (statusCode == 403) {
            message = "Access denied. You don't have permission to perform this action.";
        } else if (statusCode == 401) {
            message = "Authentication required. Please log in again.";
        }
        
        return new AppError(ErrorType.SERVER_ERROR, 
                          message, 
                          "HTTP " + statusCode, 
                          null);
    }
    
    public static AppError createValidationError(String field, String message) {
        return new AppError(ErrorType.VALIDATION_ERROR, 
                          "Validation error: " + message, 
                          "Field: " + field, 
                          null);
    }
    
    public static AppError createCacheError(String operation) {
        return new AppError(ErrorType.CACHE_ERROR, 
                          "Failed to " + operation + " cached data.", 
                          "Cache operation: " + operation, 
                          null);
    }
    
    // User-friendly error display
    public static void showError(Context context, AppError error) {
        if (context == null) return;
        
        String userMessage = getUserFriendlyMessage(error);
        Toast.makeText(context, userMessage, Toast.LENGTH_LONG).show();
        
        // Log technical details for debugging
        Log.e(TAG, "Error displayed to user: " + error.toString());
    }
    
    public static void showError(Context context, String message) {
        if (context == null) return;
        Toast.makeText(context, message, Toast.LENGTH_LONG).show();
    }
    
    private static String getUserFriendlyMessage(AppError error) {
        switch (error.getType()) {
            case NETWORK_ERROR:
                return "Network Error: " + error.getMessage();
            case SERVER_ERROR:
                return "Server Error: " + error.getMessage();
            case AUTHENTICATION_ERROR:
                return "Authentication Error: " + error.getMessage();
            case VALIDATION_ERROR:
                return "Input Error: " + error.getMessage();
            case CACHE_ERROR:
                return "Storage Error: " + error.getMessage();
            case UNKNOWN_ERROR:
            default:
                return "Error: " + error.getMessage();
        }
    }
    
    // Error recovery suggestions
    public static String getRecoverySuggestion(AppError error) {
        switch (error.getType()) {
            case NETWORK_ERROR:
                return "Please check your internet connection and try again.";
            case SERVER_ERROR:
                return "Please try again later or contact support if the problem persists.";
            case AUTHENTICATION_ERROR:
                return "Please log in again to continue.";
            case VALIDATION_ERROR:
                return "Please check your input and try again.";
            case CACHE_ERROR:
                return "Please restart the app and try again.";
            case UNKNOWN_ERROR:
            default:
                return "Please try again or contact support if the problem persists.";
        }
    }
    
    // Error reporting for analytics
    public static void reportError(AppError error) {
        // In a real app, you would send this to your analytics service
        Log.e(TAG, "Error reported: " + error.toString());
        
        // Example: Firebase Crashlytics, Bugsnag, etc.
        // FirebaseCrashlytics.getInstance().recordException(error.getCause());
    }
} 