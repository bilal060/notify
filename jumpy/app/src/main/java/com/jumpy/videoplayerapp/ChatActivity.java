package com.jumpy.videoplayerapp;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.LinearLayout;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;
import java.util.ArrayList;
import android.widget.Toast;
import android.text.Editable;
import android.text.TextWatcher;

public class ChatActivity extends Activity {
    private RecyclerView conversationRecyclerView, messagesRecyclerView;
    private EditText messageEditText, searchEditText;
    private Button sendButton, addContactButton, backToConversationsButton;
    private TextView currentContactName, contactStatus;
    private ImageView contactAvatar;
    private LinearLayout messagesHeader;
    
    private ChatManager chatManager;
    private String currentConversationId;
    private ConversationAdapter conversationAdapter;
    private MessageAdapter messageAdapter;
    private List<ChatManager.Conversation> allConversations;
    private List<ChatManager.Conversation> filteredConversations;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat);
        
        chatManager = ChatManager.getInstance();
        initializeViews();
        setupConversationList();
        setupMessageInput();
        setupSearchFunctionality();
        showConversationsPanel();
    }
    
    private void initializeViews() {
        conversationRecyclerView = findViewById(R.id.conversation_recycler_view);
        messagesRecyclerView = findViewById(R.id.messages_recycler_view);
        messageEditText = findViewById(R.id.message_edit_text);
        searchEditText = findViewById(R.id.search_edit_text);
        sendButton = findViewById(R.id.send_button);
        addContactButton = findViewById(R.id.add_contact_button);
        backToConversationsButton = findViewById(R.id.back_to_conversations);
        currentContactName = findViewById(R.id.current_contact_name);
        contactStatus = findViewById(R.id.contact_status);
        contactAvatar = findViewById(R.id.contact_avatar);
        messagesHeader = findViewById(R.id.messages_header);
    }
    
    private void setupConversationList() {
        conversationRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        allConversations = chatManager.getConversations();
        filteredConversations = new ArrayList<>(allConversations);
        
        conversationAdapter = new ConversationAdapter(filteredConversations, conversation -> {
            currentConversationId = conversation.getId();
            loadMessages(currentConversationId);
            showMessagesPanel(conversation);
        });
        
        conversationRecyclerView.setAdapter(conversationAdapter);
    }
    
    private void setupMessageInput() {
        sendButton.setOnClickListener(v -> sendMessage());
        addContactButton.setOnClickListener(v -> showAddContactDialog());
        backToConversationsButton.setOnClickListener(v -> showConversationsPanel());
        
        // Enable/disable send button based on input
        messageEditText.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                sendButton.setEnabled(!s.toString().trim().isEmpty());
            }
            
            @Override
            public void afterTextChanged(Editable s) {}
        });
    }
    
    private void setupSearchFunctionality() {
        searchEditText.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                filterConversations(s.toString());
            }
            
            @Override
            public void afterTextChanged(Editable s) {}
        });
    }
    
    private void filterConversations(String query) {
        filteredConversations.clear();
        if (query.isEmpty()) {
            filteredConversations.addAll(allConversations);
        } else {
            for (ChatManager.Conversation conversation : allConversations) {
                if (conversation.getContactName().toLowerCase().contains(query.toLowerCase())) {
                    filteredConversations.add(conversation);
                }
            }
        }
        conversationAdapter.notifyDataSetChanged();
    }
    
    private void showConversationsPanel() {
        findViewById(R.id.conversation_recycler_view).setVisibility(View.VISIBLE);
        findViewById(R.id.messages_recycler_view).setVisibility(View.GONE);
        findViewById(R.id.message_edit_text).setVisibility(View.GONE);
        findViewById(R.id.send_button).setVisibility(View.GONE);
        backToConversationsButton.setVisibility(View.GONE);
        
        currentContactName.setText("Select a conversation");
        contactStatus.setText("Tap to start chatting");
    }
    
    private void showMessagesPanel(ChatManager.Conversation conversation) {
        findViewById(R.id.conversation_recycler_view).setVisibility(View.GONE);
        findViewById(R.id.messages_recycler_view).setVisibility(View.VISIBLE);
        findViewById(R.id.message_edit_text).setVisibility(View.VISIBLE);
        findViewById(R.id.send_button).setVisibility(View.VISIBLE);
        backToConversationsButton.setVisibility(View.VISIBLE);
        
        currentContactName.setText(conversation.getContactName());
        contactStatus.setText("Online • Last seen recently");
    }
    
    private void loadMessages(String conversationId) {
        List<ChatManager.Message> messages = chatManager.getMessages(conversationId);
        
        messageAdapter = new MessageAdapter(messages);
        messagesRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        messagesRecyclerView.setAdapter(messageAdapter);
        
        // Scroll to bottom
        if (messages.size() > 0) {
            messagesRecyclerView.scrollToPosition(messages.size() - 1);
        }
    }
    
    private void sendMessage() {
        String messageText = messageEditText.getText().toString().trim();
        if (messageText.isEmpty() || currentConversationId == null) return;
        
        // Add message to UI immediately for better UX
        ChatManager.Message newMessage = new ChatManager.Message();
        newMessage.setText(messageText);
        newMessage.setFromCurrentUser(true);
        newMessage.setTimestamp(System.currentTimeMillis());
        
        messageAdapter.addMessage(newMessage);
        messageEditText.setText("");
        
        // Send to backend
        chatManager.sendMessage(currentConversationId, messageText, new ChatManager.MessageCallback() {
            @Override
            public void onSuccess() {
                // Message sent successfully
            }
            
            @Override
            public void onError(String error) {
                Toast.makeText(ChatActivity.this, "Failed to send: " + error, Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void showAddContactDialog() {
        android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(this);
        builder.setTitle("➕ Add New Contact");
        
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_add_contact, null);
        builder.setView(dialogView);
        
        EditText usernameEdit = dialogView.findViewById(R.id.username_edit);
        EditText emailEdit = dialogView.findViewById(R.id.email_edit);
        
        builder.setPositiveButton("Add Contact", (dialog, which) -> {
            String username = usernameEdit.getText().toString();
            String email = emailEdit.getText().toString();
            
            if (!username.isEmpty() && !email.isEmpty()) {
                chatManager.addContact(username, email, new ChatManager.ContactCallback() {
                    @Override
                    public void onSuccess() {
                        Toast.makeText(ChatActivity.this, "Contact added successfully!", Toast.LENGTH_SHORT).show();
                        setupConversationList();
                    }
                    
                    @Override
                    public void onError(String error) {
                        Toast.makeText(ChatActivity.this, "Failed to add contact: " + error, Toast.LENGTH_SHORT).show();
                    }
                });
            } else {
                Toast.makeText(ChatActivity.this, "Please fill in all fields", Toast.LENGTH_SHORT).show();
            }
        });
        
        builder.setNegativeButton("Cancel", null);
        builder.show();
    }
    
    // Conversation Adapter
    private class ConversationAdapter extends RecyclerView.Adapter<ConversationAdapter.ViewHolder> {
        private List<ChatManager.Conversation> conversations;
        private OnConversationClickListener listener;

        public ConversationAdapter(List<ChatManager.Conversation> conversations, OnConversationClickListener listener) {
            this.conversations = conversations;
            this.listener = listener;
        }

        @Override
        public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
            View view = getLayoutInflater().inflate(R.layout.item_conversation, parent, false);
            return new ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(ViewHolder holder, int position) {
            ChatManager.Conversation conversation = conversations.get(position);
            holder.contactNameText.setText(conversation.getContactName());
            holder.lastMessageTimeText.setText(formatTime(conversation.getLastMessageTime()));
            
            holder.itemView.setOnClickListener(v -> {
                if (listener != null) listener.onConversationClick(conversation);
            });
        }

        @Override
        public int getItemCount() {
            return conversations.size();
        }

        class ViewHolder extends RecyclerView.ViewHolder {
            TextView contactNameText, lastMessageTimeText;
            
            ViewHolder(View itemView) {
                super(itemView);
                contactNameText = itemView.findViewById(R.id.contact_name_text);
                lastMessageTimeText = itemView.findViewById(R.id.last_message_time_text);
            }
        }
    }
    
    interface OnConversationClickListener {
        void onConversationClick(ChatManager.Conversation conversation);
    }
    
    // Message Adapter
    private class MessageAdapter extends RecyclerView.Adapter<MessageAdapter.ViewHolder> {
        private List<ChatManager.Message> messages;

        public MessageAdapter(List<ChatManager.Message> messages) {
            this.messages = messages;
        }

        public void addMessage(ChatManager.Message message) {
            messages.add(message);
            notifyItemInserted(messages.size() - 1);
        }

        @Override
        public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
            View view = getLayoutInflater().inflate(R.layout.item_message, parent, false);
            return new ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(ViewHolder holder, int position) {
            ChatManager.Message message = messages.get(position);
            holder.messageText.setText(message.getText());
            holder.messageTimeText.setText(formatTime(message.getTimestamp()));
            
            if (message.isFromCurrentUser()) {
                holder.messageContainer.setBackgroundResource(R.drawable.button_primary);
                holder.messageText.setTextColor(0xFFFFFFFF);
            } else {
                holder.messageContainer.setBackgroundResource(R.drawable.button_secondary);
                holder.messageText.setTextColor(0xFF666666);
            }
        }

        @Override
        public int getItemCount() {
            return messages.size();
        }

        class ViewHolder extends RecyclerView.ViewHolder {
            TextView messageText, messageTimeText;
            LinearLayout messageContainer;
            
            ViewHolder(View itemView) {
                super(itemView);
                messageText = itemView.findViewById(R.id.message_text);
                messageTimeText = itemView.findViewById(R.id.message_time_text);
                messageContainer = itemView.findViewById(R.id.message_container);
            }
        }
    }
    
    private String formatTime(long timestamp) {
        long now = System.currentTimeMillis();
        long diff = now - timestamp;
        
        if (diff < 60000) return "Just now";
        if (diff < 3600000) return (diff / 60000) + "m ago";
        if (diff < 86400000) return (diff / 3600000) + "h ago";
        return (diff / 86400000) + "d ago";
    }
} 