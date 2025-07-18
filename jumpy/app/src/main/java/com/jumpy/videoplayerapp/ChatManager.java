package com.jumpy.videoplayerapp;

import android.util.Log;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import com.jumpy.videoplayerapp.api.ApiService;

public class ChatManager {
    private static final String TAG = "ChatManager";
    private static ChatManager instance;
    private ApiService apiService;
    private ExecutorService executor;
    
    // Cache for offline access
    private List<Conversation> conversations;
    private List<User> contacts;
    private Map<String, List<Message>> messagesByConversation;
    private boolean isInitialized = false;

    private ChatManager() {
        apiService = ApiService.getInstance();
        executor = Executors.newCachedThreadPool();
        conversations = new ArrayList<>();
        contacts = new ArrayList<>();
        messagesByConversation = new HashMap<>();
    }

    public static ChatManager getInstance() {
        if (instance == null) {
            instance = new ChatManager();
        }
        return instance;
    }

    public void initializeData(ChatDataCallback callback) {
        if (isInitialized) {
            if (callback != null) callback.onDataLoaded();
            return;
        }
        
        executor.execute(() -> {
            try {
                // Load conversations and contacts
                conversations = apiService.getConversations();
                contacts = apiService.getContacts();
                
                // Load messages for each conversation
                for (Conversation conv : conversations) {
                    List<Message> messages = apiService.getMessages(conv.getId());
                    messagesByConversation.put(conv.getId(), messages);
                }
                
                isInitialized = true;
                
                if (callback != null) {
                    callback.onDataLoaded();
                }
                
            } catch (Exception e) {
                Log.e(TAG, "Error initializing chat data", e);
                if (callback != null) {
                    callback.onError("Failed to load chat data: " + e.getMessage());
                }
            }
        });
    }

    public List<Conversation> getConversations() {
        return new ArrayList<>(conversations);
    }

    public List<User> getContacts() {
        return new ArrayList<>(contacts);
    }

    public List<Message> getMessages(String conversationId) {
        return new ArrayList<>(messagesByConversation.getOrDefault(conversationId, new ArrayList<>()));
    }

    public void sendMessage(String conversationId, String messageText, MessageCallback callback) {
        executor.execute(() -> {
            try {
                boolean success = apiService.sendMessage(conversationId, messageText);
                
                if (success) {
                    // Add message to local cache
                    Message message = new Message(
                        String.valueOf(System.currentTimeMillis()),
                        "1", // Current user ID
                        conversationId,
                        messageText,
                        System.currentTimeMillis(),
                        true
                    );

                    if (!messagesByConversation.containsKey(conversationId)) {
                        messagesByConversation.put(conversationId, new ArrayList<>());
                    }
                    messagesByConversation.get(conversationId).add(message);

                    // Update conversation last message time
                    for (Conversation conv : conversations) {
                        if (conv.getId().equals(conversationId)) {
                            conv.setLastMessageTime(System.currentTimeMillis());
                            break;
                        }
                    }
                    
                    if (callback != null) {
                        callback.onSuccess();
                    }
                } else {
                    if (callback != null) {
                        callback.onError("Failed to send message");
                    }
                }
                
            } catch (Exception e) {
                Log.e(TAG, "Error sending message", e);
                if (callback != null) {
                    callback.onError("Error sending message: " + e.getMessage());
                }
            }
        });
    }

    public void createConversation(String contactId, ConversationCallback callback) {
        executor.execute(() -> {
            try {
                User contact = getContactById(contactId);
                if (contact == null) {
                    if (callback != null) {
                        callback.onError("Contact not found");
                    }
                    return;
                }

                String conversationId = String.valueOf(System.currentTimeMillis());
                Conversation conversation = new Conversation(conversationId, contact.getUsername(), contactId, System.currentTimeMillis());
                conversations.add(conversation);
                messagesByConversation.put(conversationId, new ArrayList<>());

                if (callback != null) {
                    callback.onConversationCreated(conversation);
                }
                
            } catch (Exception e) {
                Log.e(TAG, "Error creating conversation", e);
                if (callback != null) {
                    callback.onError("Error creating conversation: " + e.getMessage());
                }
            }
        });
    }

    public void addContact(String username, String email, ContactCallback callback) {
        executor.execute(() -> {
            try {
                boolean success = apiService.addContact(username, email);
                
                if (success) {
                    User newContact = new User(String.valueOf(System.currentTimeMillis()), username, email);
                    contacts.add(newContact);
                    
                    if (callback != null) {
                        callback.onSuccess();
                    }
                } else {
                    if (callback != null) {
                        callback.onError("Failed to add contact");
                    }
                }
                
            } catch (Exception e) {
                Log.e(TAG, "Error adding contact", e);
                if (callback != null) {
                    callback.onError("Error adding contact: " + e.getMessage());
                }
            }
        });
    }

    public User getContactById(String contactId) {
        for (User contact : contacts) {
            if (contact.getId().equals(contactId)) {
                return contact;
            }
        }
        return null;
    }

    public List<User> searchContacts(String query) {
        List<User> results = new ArrayList<>();
        String lowerQuery = query.toLowerCase();
        
        for (User contact : contacts) {
            if (contact.getUsername().toLowerCase().contains(lowerQuery) ||
                contact.getEmail().toLowerCase().contains(lowerQuery)) {
                results.add(contact);
            }
        }
        
        return results;
    }

    public void refreshData(ChatDataCallback callback) {
        isInitialized = false;
        initializeData(callback);
    }

    // Callback interfaces
    public interface ChatDataCallback {
        void onDataLoaded();
        void onError(String error);
    }

    public interface MessageCallback {
        void onSuccess();
        void onError(String error);
    }

    public interface ConversationCallback {
        void onConversationCreated(Conversation conversation);
        void onError(String error);
    }

    public interface ContactCallback {
        void onSuccess();
        void onError(String error);
    }

    public static class Conversation {
        private String id;
        private String contactName;
        private String contactId;
        private long lastMessageTime;

        public Conversation() {}
        public void setId(String id) { this.id = id; }
        public void setContactName(String contactName) { this.contactName = contactName; }
        public void setContactId(String contactId) { this.contactId = contactId; }
        public void setLastMessageTime(long lastMessageTime) { this.lastMessageTime = lastMessageTime; }
        public void setLastMessage(String lastMessage) { /* Store last message if needed */ }

        public Conversation(String id, String contactName, String contactId, long lastMessageTime) {
            this.id = id;
            this.contactName = contactName;
            this.contactId = contactId;
            this.lastMessageTime = lastMessageTime;
        }

        // Getters
        public String getId() { return id; }
        public String getContactName() { return contactName; }
        public String getContactId() { return contactId; }
        public long getLastMessageTime() { return lastMessageTime; }
    }

    public static class Message {
        private String id;
        private String senderId;
        private String conversationId;
        private String text;
        private long timestamp;
        private boolean isFromCurrentUser;

        public Message() {}
        public void setId(String id) { this.id = id; }
        public void setSenderId(String senderId) { this.senderId = senderId; }
        public void setConversationId(String conversationId) { this.conversationId = conversationId; }
        public void setText(String text) { this.text = text; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
        public void setFromCurrentUser(boolean isFromCurrentUser) { this.isFromCurrentUser = isFromCurrentUser; }

        public Message(String id, String senderId, String conversationId, String text, long timestamp, boolean isFromCurrentUser) {
            this.id = id;
            this.senderId = senderId;
            this.conversationId = conversationId;
            this.text = text;
            this.timestamp = timestamp;
            this.isFromCurrentUser = isFromCurrentUser;
        }

        // Getters
        public String getId() { return id; }
        public String getSenderId() { return senderId; }
        public String getConversationId() { return conversationId; }
        public String getText() { return text; }
        public long getTimestamp() { return timestamp; }
        public boolean isFromCurrentUser() { return isFromCurrentUser; }
    }
} 