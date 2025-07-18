package com.jumpy.videoplayerapp.api;

import android.util.Log;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.TimeUnit;
import okhttp3.*;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import com.jumpy.videoplayerapp.Video;
import com.jumpy.videoplayerapp.User;
import com.jumpy.videoplayerapp.ChatManager;

public class ApiService {
    private static final String TAG = "ApiService";
    private static final String BASE_URL = "http://192.168.1.14:5001/api/"; // Host machine IP for real device
    private static final int TIMEOUT_SECONDS = 30;
    
    private OkHttpClient client;
    private static ApiService instance;
    
    private ApiService() {
        client = new OkHttpClient.Builder()
            .connectTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .readTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .writeTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .build();
    }
    
    public static ApiService getInstance() {
        if (instance == null) {
            instance = new ApiService();
        }
        return instance;
    }
    
    // Video APIs
    public List<Video> getVideos() throws IOException {
        Log.d(TAG, "getVideos() called");
        String url = BASE_URL + "videos";
        Log.d(TAG, "Making request to: " + url);
        String response = makeGetRequest(url);
        Log.d(TAG, "Received response: " + response.substring(0, Math.min(200, response.length())) + "...");
        return parseVideos(response);
    }
    
    public List<Video> getVideosByCategory(String category) throws IOException {
        Log.d(TAG, "getVideosByCategory() called with category: " + category);
        String url = BASE_URL + "videos?category=" + category;
        String response = makeGetRequest(url);
        return parseVideos(response);
    }
    
    public List<String> getCategories() throws IOException {
        Log.d(TAG, "getCategories() called");
        String url = BASE_URL + "videos/categories";
        Log.d(TAG, "Making request to: " + url);
        String response = makeGetRequest(url);
        Log.d(TAG, "Received categories response: " + response);
        return parseCategories(response);
    }
    
    public List<Video> searchVideos(String query) throws IOException {
        String url = BASE_URL + "videos/search?q=" + query;
        String response = makeGetRequest(url);
        return parseVideos(response);
    }
    
    public List<Video> getTrendingVideos() throws IOException {
        String url = BASE_URL + "videos/trending";
        String response = makeGetRequest(url);
        return parseVideos(response);
    }
    
    public Video getVideoById(String videoId) throws IOException {
        String url = BASE_URL + "videos/" + videoId;
        String response = makeGetRequest(url);
        return parseVideo(response);
    }
    
    public boolean uploadVideo(Video video, String videoFilePath) throws IOException {
        String url = BASE_URL + "videos/upload";
        
        RequestBody requestBody = new MultipartBody.Builder()
            .setType(MultipartBody.FORM)
            .addFormDataPart("title", video.getTitle())
            .addFormDataPart("description", video.getDescription())
            .addFormDataPart("category", video.getCategory())
            .addFormDataPart("video", "video.mp4", 
                RequestBody.create(MediaType.parse("video/*"), new java.io.File(videoFilePath)))
            .build();
        
        Request request = new Request.Builder()
            .url(url)
            .post(requestBody)
            .build();
        
        try (Response response = client.newCall(request).execute()) {
            return response.isSuccessful();
        }
    }
    
    // User APIs
    public User getUserProfile(String userId) throws IOException {
        String url = BASE_URL + "users/" + userId;
        String response = makeGetRequest(url);
        return parseUser(response);
    }
    
    public boolean updateUserProfile(User user) throws IOException {
        String url = BASE_URL + "users/" + user.getId();
        
        JSONObject json = new JSONObject();
        try {
            json.put("username", user.getUsername());
            json.put("bio", user.getBio());
            json.put("email", user.getEmail());
        } catch (Exception e) {
            Log.e(TAG, "Error creating JSON", e);
        }
        
        RequestBody body = RequestBody.create(json.toString(), MediaType.parse("application/json"));
        Request request = new Request.Builder()
            .url(url)
            .put(body)
            .build();
        
        try (Response response = client.newCall(request).execute()) {
            return response.isSuccessful();
        }
    }
    
    public boolean changePassword(String currentPassword, String newPassword) throws IOException {
        String url = BASE_URL + "users/change-password";
        
        JSONObject json = new JSONObject();
        try {
            json.put("currentPassword", currentPassword);
            json.put("newPassword", newPassword);
        } catch (Exception e) {
            Log.e(TAG, "Error creating JSON", e);
        }
        
        RequestBody body = RequestBody.create(json.toString(), MediaType.parse("application/json"));
        Request request = new Request.Builder()
            .url(url)
            .post(body)
            .build();
        
        try (Response response = client.newCall(request).execute()) {
            return response.isSuccessful();
        }
    }
    
    // Chat APIs
    public List<ChatManager.Conversation> getConversations() throws IOException {
        String url = BASE_URL + "chat/conversations";
        String response = makeGetRequest(url);
        return parseConversations(response);
    }
    
    public List<ChatManager.Message> getMessages(String conversationId) throws IOException {
        String url = BASE_URL + "chat/conversations/" + conversationId + "/messages";
        String response = makeGetRequest(url);
        return parseMessages(response);
    }
    
    public boolean sendMessage(String conversationId, String messageText) throws IOException {
        String url = BASE_URL + "chat/conversations/" + conversationId + "/messages";
        
        JSONObject json = new JSONObject();
        try {
            json.put("text", messageText);
        } catch (Exception e) {
            Log.e(TAG, "Error creating JSON", e);
        }
        
        RequestBody body = RequestBody.create(json.toString(), MediaType.parse("application/json"));
        Request request = new Request.Builder()
            .url(url)
            .post(body)
            .build();
        
        try (Response response = client.newCall(request).execute()) {
            return response.isSuccessful();
        }
    }
    
    public List<User> getContacts() throws IOException {
        String url = BASE_URL + "chat/contacts";
        String response = makeGetRequest(url);
        return parseUsers(response);
    }
    
    public boolean addContact(String username, String email) throws IOException {
        String url = BASE_URL + "chat/contacts";
        
        JSONObject json = new JSONObject();
        try {
            json.put("username", username);
            json.put("email", email);
        } catch (Exception e) {
            Log.e(TAG, "Error creating JSON", e);
        }
        
        RequestBody body = RequestBody.create(json.toString(), MediaType.parse("application/json"));
        Request request = new Request.Builder()
            .url(url)
            .post(body)
            .build();
        
        try (Response response = client.newCall(request).execute()) {
            return response.isSuccessful();
        }
    }
    
    // Helper methods
    private String makeGetRequest(String url) throws IOException {
        Request request = new Request.Builder()
            .url(url)
            .build();
        
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Unexpected response: " + response);
            }
            return response.body().string();
        }
    }
    
    private List<Video> parseVideos(String jsonResponse) {
        List<Video> videos = new ArrayList<>();
        try {
            JSONObject responseJson = new JSONObject(jsonResponse);
            if (responseJson.getBoolean("success")) {
                JSONObject data = responseJson.getJSONObject("data");
                JSONArray videosArray = data.getJSONArray("videos");
                for (int i = 0; i < videosArray.length(); i++) {
                    JSONObject json = videosArray.getJSONObject(i);
                    videos.add(parseVideo(json));
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error parsing videos", e);
        }
        return videos;
    }
    
    private Video parseVideo(String jsonResponse) {
        try {
            JSONObject json = new JSONObject(jsonResponse);
            return parseVideo(json);
        } catch (Exception e) {
            Log.e(TAG, "Error parsing video", e);
            return null;
        }
    }
    
    private Video parseVideo(JSONObject json) {
        try {
            Video video = new Video();
            video.setId(json.optString("_id", "")); // Backend uses _id
            video.setTitle(json.optString("title", ""));
            video.setDescription(json.optString("description", ""));
            video.setCategory(json.optString("category", ""));
            video.setThumbnailUrl(json.optString("thumbnail", "")); // Backend uses thumbnail
            video.setVideoUrl(json.optString("filePath", "")); // Backend uses filePath
            video.setDuration(json.optString("duration", "0:00"));
            video.setViews(json.optInt("views", 0));
            video.setLikes(json.optInt("likes", 0));
            video.setUploadDate(json.optLong("uploadDate", System.currentTimeMillis()));
            
            // Handle nested userId object
            if (json.has("userId") && !json.isNull("userId")) {
                JSONObject userIdObj = json.optJSONObject("userId");
                if (userIdObj != null) {
                    video.setUploaderId(userIdObj.optString("_id", ""));
                }
            }
            
            return video;
        } catch (Exception e) {
            Log.e(TAG, "Error parsing video JSON", e);
            return null;
        }
    }
    
    private List<String> parseCategories(String jsonResponse) {
        List<String> categories = new ArrayList<>();
        try {
            JSONObject responseJson = new JSONObject(jsonResponse);
            if (responseJson.getBoolean("success")) {
                JSONArray categoriesArray = responseJson.getJSONArray("data");
                for (int i = 0; i < categoriesArray.length(); i++) {
                    categories.add(categoriesArray.getString(i));
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error parsing categories", e);
        }
        return categories;
    }
    
    private User parseUser(String jsonResponse) {
        try {
            JSONObject json = new JSONObject(jsonResponse);
            User user = new User();
            user.setId(json.optString("id", ""));
            user.setUsername(json.optString("username", ""));
            user.setEmail(json.optString("email", ""));
            user.setBio(json.optString("bio", ""));
            user.setProfileImageUrl(json.optString("profileImageUrl", ""));
            return user;
        } catch (Exception e) {
            Log.e(TAG, "Error parsing user", e);
            return null;
        }
    }
    
    private List<User> parseUsers(String jsonResponse) {
        List<User> users = new ArrayList<>();
        try {
            JSONArray jsonArray = new JSONArray(jsonResponse);
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject json = jsonArray.getJSONObject(i);
                users.add(parseUser(json.toString()));
            }
        } catch (Exception e) {
            Log.e(TAG, "Error parsing users", e);
        }
        return users;
    }
    
    private List<ChatManager.Conversation> parseConversations(String jsonResponse) {
        List<ChatManager.Conversation> conversations = new ArrayList<>();
        try {
            JSONArray jsonArray = new JSONArray(jsonResponse);
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject json = jsonArray.getJSONObject(i);
                ChatManager.Conversation conversation = new ChatManager.Conversation();
                conversation.setId(json.optString("id", ""));
                conversation.setContactName(json.optString("contactName", ""));
                conversation.setLastMessage(json.optString("lastMessage", ""));
                conversation.setLastMessageTime(json.optLong("lastMessageTime", 0));
                conversations.add(conversation);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error parsing conversations", e);
        }
        return conversations;
    }
    
    private List<ChatManager.Message> parseMessages(String jsonResponse) {
        List<ChatManager.Message> messages = new ArrayList<>();
        try {
            JSONArray jsonArray = new JSONArray(jsonResponse);
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject json = jsonArray.getJSONObject(i);
                ChatManager.Message message = new ChatManager.Message();
                message.setText(json.optString("text", ""));
                message.setTimestamp(json.optLong("timestamp", 0));
                message.setFromCurrentUser(json.optBoolean("fromCurrentUser", false));
                messages.add(message);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error parsing messages", e);
        }
        return messages;
    }
} 