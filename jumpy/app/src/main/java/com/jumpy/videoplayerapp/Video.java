package com.jumpy.videoplayerapp;

import java.io.Serializable;

public class Video implements Serializable {
    private String id;
    private String title;
    private String description;
    private String duration;
    private String videoUrl;
    private String thumbnailUrl;
    private int views;
    private int likes;
    private int dislikes;
    private String category;
    private String uploaderId;
    private String uploaderName;
    private long uploadDate;
    private boolean isLiked;
    private boolean isDisliked;

    public Video() {}

    public Video(String id, String title, String description, String duration, String videoUrl, 
                 String thumbnailUrl, int views, int likes, String category, String uploaderId, 
                 String uploaderName) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.duration = duration;
        this.videoUrl = videoUrl;
        this.thumbnailUrl = thumbnailUrl;
        this.views = views;
        this.likes = likes;
        this.dislikes = 0;
        this.category = category;
        this.uploaderId = uploaderId;
        this.uploaderName = uploaderName;
        this.uploadDate = System.currentTimeMillis();
        this.isLiked = false;
        this.isDisliked = false;
    }

    // Getters
    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getDuration() { return duration; }
    public String getVideoUrl() { return videoUrl; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public int getViews() { return views; }
    public int getLikes() { return likes; }
    public int getDislikes() { return dislikes; }
    public String getCategory() { return category; }
    public String getUploaderId() { return uploaderId; }
    public String getUploaderName() { return uploaderName; }
    public long getUploadDate() { return uploadDate; }
    public boolean isLiked() { return isLiked; }
    public boolean isDisliked() { return isDisliked; }

    // Setters
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
    public void setViews(int views) { this.views = views; }
    public void setLikes(int likes) { this.likes = likes; }
    public void setDislikes(int dislikes) { this.dislikes = dislikes; }
    public void setCategory(String category) { this.category = category; }
    public void setLiked(boolean liked) { isLiked = liked; }
    public void setDisliked(boolean disliked) { isDisliked = disliked; }
    public void setId(String id) { this.id = id; }
    public void setDuration(String duration) { this.duration = duration; }
    public void setUploaderId(String uploaderId) { this.uploaderId = uploaderId; }
    public void setUploaderName(String uploaderName) { this.uploaderName = uploaderName; }
    public void setUploadDate(long uploadDate) { this.uploadDate = uploadDate; }

    public void incrementViews() { this.views++; }
    public void incrementLikes() { this.likes++; }
    public void incrementDislikes() { this.dislikes++; }
} 