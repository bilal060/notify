package com.jumpy.videoplayerapp;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Spinner;
import android.widget.ArrayAdapter;
import android.widget.Toast;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import com.jumpy.videoplayerapp.api.ApiService;

public class VideoUploadActivity extends Activity {
    private EditText titleEdit, descriptionEdit;
    private Spinner categorySpinner;
    private Button selectVideoButton, selectThumbnailButton, uploadButton;
    private ImageView thumbnailPreview;
    private ProgressBar uploadProgressBar;
    private Uri videoUri, thumbnailUri;
    private VideoManager videoManager;
    private ApiService apiService;
    private ExecutorService executor;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_upload_video);
        
        videoManager = VideoManager.getInstance();
        apiService = ApiService.getInstance();
        executor = Executors.newSingleThreadExecutor();
        
        initializeViews();
        setupCategorySpinner();
        setupButtons();
    }
    
    private void initializeViews() {
        titleEdit = findViewById(R.id.title_edit);
        descriptionEdit = findViewById(R.id.description_edit);
        categorySpinner = findViewById(R.id.category_spinner);
        selectVideoButton = findViewById(R.id.select_video_button);
        selectThumbnailButton = findViewById(R.id.select_thumbnail_button);
        uploadButton = findViewById(R.id.upload_button);
        thumbnailPreview = findViewById(R.id.thumbnail_preview);
        uploadProgressBar = findViewById(R.id.upload_progress_bar);
    }
    
    private void setupCategorySpinner() {
        // Load categories from VideoManager
        videoManager.initializeData(new VideoManager.VideoDataCallback() {
            @Override
            public void onDataLoaded() {
                runOnUiThread(() -> {
                    List<String> categories = videoManager.getCategories();
                    ArrayAdapter<String> adapter = new ArrayAdapter<>(VideoUploadActivity.this, 
                        android.R.layout.simple_spinner_item, categories);
                    adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                    categorySpinner.setAdapter(adapter);
                });
            }
            
            @Override
            public void onError(String error) {
                runOnUiThread(() -> {
                    Toast.makeText(VideoUploadActivity.this, "Failed to load categories: " + error, 
                                  Toast.LENGTH_SHORT).show();
                });
            }
        });
    }
    
    private void setupButtons() {
        selectVideoButton.setOnClickListener(v -> selectVideo());
        selectThumbnailButton.setOnClickListener(v -> selectThumbnail());
        uploadButton.setOnClickListener(v -> uploadVideo());
    }
    
    private void selectVideo() {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("video/*");
        startActivityForResult(intent, 1);
    }
    
    private void selectThumbnail() {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("image/*");
        startActivityForResult(intent, 2);
    }
    
    private void uploadVideo() {
        String title = titleEdit.getText().toString().trim();
        String description = descriptionEdit.getText().toString().trim();
        String category = categorySpinner.getSelectedItem().toString();
        
        if (title.isEmpty()) {
            Toast.makeText(this, "Please enter a title", Toast.LENGTH_SHORT).show();
            return;
        }
        
        if (videoUri == null) {
            Toast.makeText(this, "Please select a video", Toast.LENGTH_SHORT).show();
            return;
        }
        
        // Show progress
        showUploadProgress(true);
        uploadButton.setEnabled(false);
        
        // Create video object
        String videoId = String.valueOf(System.currentTimeMillis());
        Video newVideo = new Video(videoId, title, description, "0:00", 
                                 videoUri.toString(), thumbnailUri != null ? thumbnailUri.toString() : "",
                                 0, 0, category, "1", "DemoUser");
        
        // Upload to backend
        executor.execute(() -> {
            try {
                String videoFilePath = getRealPathFromURI(videoUri);
                boolean success = apiService.uploadVideo(newVideo, videoFilePath);
                
                runOnUiThread(() -> {
                    showUploadProgress(false);
                    uploadButton.setEnabled(true);
                    
                    if (success) {
                        // Add to local cache
                        videoManager.addVideo(newVideo, new VideoManager.VideoUploadCallback() {
                            @Override
                            public void onSuccess() {
                                runOnUiThread(() -> {
                                    Toast.makeText(VideoUploadActivity.this, "Video uploaded successfully!", 
                                                  Toast.LENGTH_SHORT).show();
                                    finish();
                                });
                            }
                            
                            @Override
                            public void onError(String error) {
                                runOnUiThread(() -> {
                                    Toast.makeText(VideoUploadActivity.this, "Upload successful but failed to update local cache: " + error, 
                                                  Toast.LENGTH_SHORT).show();
                                    finish();
                                });
                            }
                        });
                    } else {
                        Toast.makeText(VideoUploadActivity.this, "Failed to upload video", Toast.LENGTH_SHORT).show();
                    }
                });
                
            } catch (Exception e) {
                runOnUiThread(() -> {
                    showUploadProgress(false);
                    uploadButton.setEnabled(true);
                    Toast.makeText(VideoUploadActivity.this, "Upload failed: " + e.getMessage(), 
                                  Toast.LENGTH_SHORT).show();
                });
            }
        });
    }
    
    private String getRealPathFromURI(Uri contentUri) {
        // This is a simplified version. In a real app, you'd need to handle different URI schemes
        return contentUri.getPath();
    }
    
    private void showUploadProgress(boolean show) {
        if (uploadProgressBar != null) {
            uploadProgressBar.setVisibility(show ? View.VISIBLE : View.GONE);
        }
    }
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (resultCode == RESULT_OK && data != null) {
            Uri uri = data.getData();
            
            if (requestCode == 1) {
                videoUri = uri;
                selectVideoButton.setText("Video Selected ✓");
                selectVideoButton.setBackgroundResource(R.drawable.button_primary);
            } else if (requestCode == 2) {
                thumbnailUri = uri;
                thumbnailPreview.setImageURI(uri);
                thumbnailPreview.setVisibility(View.VISIBLE);
                selectThumbnailButton.setText("Thumbnail Selected ✓");
                selectThumbnailButton.setBackgroundResource(R.drawable.button_primary);
            }
        }
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (executor != null) {
            executor.shutdown();
        }
    }
} 