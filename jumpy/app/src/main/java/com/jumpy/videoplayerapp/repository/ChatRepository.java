package com.jumpy.videoplayerapp.repository;

import android.content.Context;
import android.util.Log;
import com.jumpy.videoplayerapp.ChatManager;
import com.jumpy.videoplayerapp.User;
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

public class ChatRepository {
    private static final String TAG = "ChatRepository";
    private static ChatRepository instance;
    
    private final ApiService apiService;
    private final CacheManager cacheManager;
    private final Context context;
    private final ExecutorService executor;
    
    private ChatRepository(Context context) {
        this.context = context.getApplicationContext();
        this.apiService = ApiService.getInstance();
        this.cacheManager = CacheManager.getInstance(context);
        this.executor = Executors.newCachedThreadPool();
    }
    
    public static synchronized ChatRepository getInstance(Context context) {
        if (instance == null) {
            instance = new ChatRepository(context);
        }
        return instance;
    }
    
    // Get conversations
    public void getConversations(DataCallback<List<ChatManager.Conversation>> callback) {
        executor.execute(() -> {
            try {
                if (!NetworkUtils.isNetworkAvailable(context)) {
                    handleOfflineModeForConversations(callback);
                    return;
                }
                
                List<ChatManager.Conversation> conversations = apiService.getConversations();
                
                if (conversations != null) {
                    cacheManager.cacheConversations((List<Object>) (List<?>) conversations);
                    
                    if (callback != null) {
                        callback.onSuccess(Result.success(conversations));
                    }
                } else {
                    handleEmptyDataForConversations(callback);
                }
                
            } catch (Exception e) {
                handleError(e, callback);
            }
        });
    }
    
    // Get messages for a conversation
    public void getMessages(String conversationId, DataCallback<List<ChatManager.Message>> callback) {
        executor.execute(() -> {
            try {
                if (!NetworkUtils.isNetworkAvailable(context)) {
                    // For messages, we need real-time data, so show network error
                    if (callback != null) {
                        callback.onError(ErrorHandler.createNetworkError());
                    }
                    return;
                }
                
                List<ChatManager.Message> messages = apiService.getMessages(conversationId);
                
                if (callback != null) {
                    if (messages != null) {
                        callback.onSuccess(Result.success(messages));
                    } else {
                        callback.onSuccess(Result.success(Collections.emptyList())); // Empty results
                    }
                }
                
            } catch (Exception e) {
                handleError(e, callback);
            }
        });
    }
    
    // Send message
    public void sendMessage(String conversationId, String messageText, DataCallback<Boolean> callback) {
        executor.execute(() -> {
            try {
                if (!NetworkUtils.isNetworkAvailable(context)) {
                    if (callback != null) {
                        callback.onError(ErrorHandler.createNetworkError());
                    }
                    return;
                }
                
                boolean success = apiService.sendMessage(conversationId, messageText);
                
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
    
    // Get contacts
    public void getContacts(DataCallback<List<User>> callback) {
        executor.execute(() -> {
            try {
                if (!NetworkUtils.isNetworkAvailable(context)) {
                    handleOfflineModeForUsers(callback);
                    return;
                }
                
                List<User> contacts = apiService.getContacts();
                
                if (contacts != null) {
                    cacheManager.cacheContacts((List<Object>) (List<?>) contacts);
                    
                    if (callback != null) {
                        callback.onSuccess(Result.success(contacts));
                    }
                } else {
                    handleEmptyDataForUsers(callback);
                }
                
            } catch (Exception e) {
                handleError(e, callback);
            }
        });
    }
    
    // Add contact
    public void addContact(String username, String email, DataCallback<Boolean> callback) {
        executor.execute(() -> {
            try {
                if (!NetworkUtils.isNetworkAvailable(context)) {
                    if (callback != null) {
                        callback.onError(ErrorHandler.createNetworkError());
                    }
                    return;
                }
                
                // Validate input
                if (username == null || username.trim().isEmpty()) {
                    if (callback != null) {
                        callback.onError(ErrorHandler.createValidationError("username", "Username cannot be empty"));
                    }
                    return;
                }
                
                if (email == null || email.trim().isEmpty()) {
                    if (callback != null) {
                        callback.onError(ErrorHandler.createValidationError("email", "Email cannot be empty"));
                    }
                    return;
                }
                
                boolean success = apiService.addContact(username, email);
                
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
    
    // Create conversation
    public void createConversation(String contactId, DataCallback<ChatManager.Conversation> callback) {
        executor.execute(() -> {
            try {
                if (!NetworkUtils.isNetworkAvailable(context)) {
                    if (callback != null) {
                        callback.onError(ErrorHandler.createNetworkError());
                    }
                    return;
                }
                
                // Validate input
                if (contactId == null || contactId.trim().isEmpty()) {
                    if (callback != null) {
                        callback.onError(ErrorHandler.createValidationError("contactId", "Contact ID cannot be empty"));
                    }
                    return;
                }
                
                // Get contact info first
                List<User> contacts = apiService.getContacts();
                User contact = null;
                
                if (contacts != null) {
                    for (User c : contacts) {
                        if (c.getId().equals(contactId)) {
                            contact = c;
                            break;
                        }
                    }
                }
                
                if (contact == null) {
                    if (callback != null) {
                        callback.onError(ErrorHandler.createValidationError("contactId", "Contact not found"));
                    }
                    return;
                }
                
                // Create conversation
                String conversationId = String.valueOf(System.currentTimeMillis());
                ChatManager.Conversation conversation = new ChatManager.Conversation(
                    conversationId, contact.getUsername(), contactId, System.currentTimeMillis()
                );
                
                if (callback != null) {
                    callback.onSuccess(Result.success(conversation));
                }
                
            } catch (Exception e) {
                handleError(e, callback);
            }
        });
    }
    
    // Private helper methods
    private void handleOfflineModeForConversations(DataCallback<List<ChatManager.Conversation>> callback) {
        List<Object> cachedObjects = cacheManager.getCachedConversations();
        List<ChatManager.Conversation> cachedData = new ArrayList<>();
        if (cachedObjects != null) {
            for (Object obj : cachedObjects) {
                if (obj instanceof ChatManager.Conversation) {
                    cachedData.add((ChatManager.Conversation) obj);
                }
            }
        }
        if (cachedData != null && !cachedData.isEmpty()) {
            if (callback != null) {
                callback.onSuccess(Result.success(cachedData));
            }
        } else {
            if (callback != null) {
                callback.onError(ErrorHandler.createNetworkError());
            }
        }
    }

    private void handleEmptyDataForConversations(DataCallback<List<ChatManager.Conversation>> callback) {
        if (callback != null) {
            callback.onSuccess(Result.success(Collections.emptyList()));
        }
    }

    private void handleOfflineModeForUsers(DataCallback<List<User>> callback) {
        List<Object> cachedObjects = cacheManager.getCachedContacts();
        List<User> cachedData = new ArrayList<>();
        if (cachedObjects != null) {
            for (Object obj : cachedObjects) {
                if (obj instanceof User) {
                    cachedData.add((User) obj);
                }
            }
        }
        if (cachedData != null && !cachedData.isEmpty()) {
            if (callback != null) {
                callback.onSuccess(Result.success(cachedData));
            }
        } else {
            if (callback != null) {
                callback.onError(ErrorHandler.createNetworkError());
            }
        }
    }

    private void handleEmptyDataForUsers(DataCallback<List<User>> callback) {
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