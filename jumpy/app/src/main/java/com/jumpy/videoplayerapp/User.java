package com.jumpy.videoplayerapp;

import java.io.Serializable;

public class User implements Serializable {
    private String id;
    private String username;
    private String email;
    private String profileImageUrl;
    private String bio;
    private int subscribers;
    private int videos;
    private long joinDate;
    private boolean isVerified;
    private UserSettings settings;

    public User() {}

    public User(String id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.profileImageUrl = "";
        this.bio = "";
        this.subscribers = 0;
        this.videos = 0;
        this.joinDate = System.currentTimeMillis();
        this.isVerified = false;
        this.settings = new UserSettings();
    }

    // Getters
    public String getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getProfileImageUrl() { return profileImageUrl; }
    public String getBio() { return bio; }
    public int getSubscribers() { return subscribers; }
    public int getVideos() { return videos; }
    public long getJoinDate() { return joinDate; }
    public boolean isVerified() { return isVerified; }
    public UserSettings getSettings() { return settings; }

    // Setters
    public void setUsername(String username) { this.username = username; }
    public void setEmail(String email) { this.email = email; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    public void setBio(String bio) { this.bio = bio; }
    public void setSubscribers(int subscribers) { this.subscribers = subscribers; }
    public void setVideos(int videos) { this.videos = videos; }
    public void setVerified(boolean verified) { isVerified = verified; }
    public void setSettings(UserSettings settings) { this.settings = settings; }

    public void setId(String id) { this.id = id; }
    public void setJoinDate(long joinDate) { this.joinDate = joinDate; }

    public static class UserSettings implements Serializable {
        private boolean notificationsEnabled = true;
        private boolean autoPlayEnabled = true;
        private String language = "English";
        private String theme = "Light";
        private boolean dataSaverEnabled = false;
        private int videoQuality = 720; // 480, 720, 1080

        // Getters
        public boolean isNotificationsEnabled() { return notificationsEnabled; }
        public boolean isAutoPlayEnabled() { return autoPlayEnabled; }
        public String getLanguage() { return language; }
        public String getTheme() { return theme; }
        public boolean isDataSaverEnabled() { return dataSaverEnabled; }
        public int getVideoQuality() { return videoQuality; }

        // Setters
        public void setNotificationsEnabled(boolean enabled) { this.notificationsEnabled = enabled; }
        public void setAutoPlayEnabled(boolean enabled) { this.autoPlayEnabled = enabled; }
        public void setLanguage(String language) { this.language = language; }
        public void setTheme(String theme) { this.theme = theme; }
        public void setDataSaverEnabled(boolean enabled) { this.dataSaverEnabled = enabled; }
        public void setVideoQuality(int quality) { this.videoQuality = quality; }
    }
} 