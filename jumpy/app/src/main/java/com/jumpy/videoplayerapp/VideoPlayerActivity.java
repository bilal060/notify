package com.jumpy.videoplayerapp;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.SeekBar;
import android.widget.TextView;
import android.widget.VideoView;
import android.widget.LinearLayout;
import android.widget.FrameLayout;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.media.MediaPlayer;
import android.os.Handler;
import android.os.Looper;
import android.view.WindowManager;
import android.widget.Toast;
import java.util.List;
import java.util.ArrayList;

public class VideoPlayerActivity extends Activity {
    private VideoView videoView;
    private SurfaceView surfaceView;
    private MediaPlayer mediaPlayer;
    private Button playPauseButton, nextButton, prevButton, fullscreenButton, volumeIcon;
    private SeekBar progressSeekBar, volumeSeekBar;
    private TextView currentTimeText, totalTimeText, titleText;
    private LinearLayout controlsLayout, volumeLayout;
    private FrameLayout videoContainer;
    
    private List<Video> videoList;
    private int currentVideoIndex = 0;
    private boolean isPlaying = false;
    private boolean isFullscreen = false;
    private boolean isVolumeVisible = false;
    private Handler handler = new Handler(Looper.getMainLooper());
    private AudioManager audioManager;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_video_player);
        
        // Get video data from intent
        int videoIndex = getIntent().getIntExtra("video_index", 0);
        videoList = (List<Video>) getIntent().getSerializableExtra("video_list");
        if (videoList == null) {
            videoList = getSampleVideos();
        }
        currentVideoIndex = videoIndex;
        
        initializeViews();
        setupVideoPlayer();
        setupControls();
        loadVideo(currentVideoIndex);
    }
    
    private void initializeViews() {
        videoContainer = findViewById(R.id.video_container);
        surfaceView = findViewById(R.id.surface_view);
        playPauseButton = findViewById(R.id.play_pause_button);
        nextButton = findViewById(R.id.next_button);
        prevButton = findViewById(R.id.prev_button);
        fullscreenButton = findViewById(R.id.fullscreen_button);
        volumeIcon = findViewById(R.id.volume_icon);
        progressSeekBar = findViewById(R.id.progress_seekbar);
        volumeSeekBar = findViewById(R.id.volume_seekbar);
        currentTimeText = findViewById(R.id.current_time_text);
        totalTimeText = findViewById(R.id.total_time_text);
        titleText = findViewById(R.id.video_title_text);
        controlsLayout = findViewById(R.id.controls_layout);
        volumeLayout = findViewById(R.id.volume_layout);
        
        audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);
    }
    
    private void setupVideoPlayer() {
        mediaPlayer = new MediaPlayer();
        surfaceView.getHolder().addCallback(new SurfaceHolder.Callback() {
            @Override
            public void surfaceCreated(SurfaceHolder holder) {
                mediaPlayer.setSurface(holder.getSurface());
            }
            
            @Override
            public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {}
            
            @Override
            public void surfaceDestroyed(SurfaceHolder holder) {}
        });
        
        mediaPlayer.setOnPreparedListener(mp -> {
            mp.start();
            isPlaying = true;
            updatePlayPauseButton();
            updateProgress();
        });
        
        mediaPlayer.setOnCompletionListener(mp -> {
            playNextVideo();
        });
    }
    
    private void setupControls() {
        // Play/Pause
        playPauseButton.setOnClickListener(v -> togglePlayPause());
        
        // Next/Previous
        nextButton.setOnClickListener(v -> playNextVideo());
        prevButton.setOnClickListener(v -> playPreviousVideo());
        
        // Fullscreen
        fullscreenButton.setOnClickListener(v -> toggleFullscreen());
        
        // Volume
        volumeIcon.setOnClickListener(v -> toggleVolumeControls());
        volumeSeekBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                if (fromUser) {
                    audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, progress, 0);
                }
            }
            
            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {}
            
            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {}
        });
        
        // Progress
        progressSeekBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                if (fromUser && mediaPlayer != null) {
                    mediaPlayer.seekTo(progress);
                }
            }
            
            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {}
            
            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {}
        });
        
        // Hide controls after 3 seconds
        videoContainer.setOnClickListener(v -> toggleControlsVisibility());
    }
    
    private void loadVideo(int index) {
        if (index < 0 || index >= videoList.size()) return;
        
        Video video = videoList.get(index);
        titleText.setText(video.getTitle());
        
        try {
            mediaPlayer.reset();
            // For demo, use a sample video URL. In real app, use video.getVideoUrl()
            String videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
            mediaPlayer.setDataSource(this, Uri.parse(videoUrl));
            mediaPlayer.prepareAsync();
        } catch (Exception e) {
            Toast.makeText(this, "Error loading video", Toast.LENGTH_SHORT).show();
        }
    }
    
    private void togglePlayPause() {
        if (mediaPlayer != null) {
            if (isPlaying) {
                mediaPlayer.pause();
                isPlaying = false;
            } else {
                mediaPlayer.start();
                isPlaying = true;
            }
            updatePlayPauseButton();
        }
    }
    
    private void playNextVideo() {
        if (currentVideoIndex < videoList.size() - 1) {
            currentVideoIndex++;
            loadVideo(currentVideoIndex);
        }
    }
    
    private void playPreviousVideo() {
        if (currentVideoIndex > 0) {
            currentVideoIndex--;
            loadVideo(currentVideoIndex);
        }
    }
    
    private void toggleFullscreen() {
        if (isFullscreen) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
            getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
            isFullscreen = false;
        } else {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, 
                               WindowManager.LayoutParams.FLAG_FULLSCREEN);
            isFullscreen = true;
        }
    }
    
    private void toggleVolumeControls() {
        isVolumeVisible = !isVolumeVisible;
        volumeLayout.setVisibility(isVolumeVisible ? View.VISIBLE : View.GONE);
    }
    
    private void toggleControlsVisibility() {
        if (controlsLayout.getVisibility() == View.VISIBLE) {
            controlsLayout.setVisibility(View.GONE);
            volumeLayout.setVisibility(View.GONE);
        } else {
            controlsLayout.setVisibility(View.VISIBLE);
            if (isVolumeVisible) {
                volumeLayout.setVisibility(View.VISIBLE);
            }
        }
    }
    
    private void updatePlayPauseButton() {
        playPauseButton.setText(isPlaying ? "⏸️" : "▶️");
    }
    
    private void updateProgress() {
        if (mediaPlayer != null && isPlaying) {
            int currentPosition = mediaPlayer.getCurrentPosition();
            int duration = mediaPlayer.getDuration();
            
            progressSeekBar.setMax(duration);
            progressSeekBar.setProgress(currentPosition);
            
            currentTimeText.setText(formatTime(currentPosition));
            totalTimeText.setText(formatTime(duration));
            
            handler.postDelayed(this::updateProgress, 1000);
        }
    }
    
    private String formatTime(int milliseconds) {
        int seconds = (milliseconds / 1000) % 60;
        int minutes = (milliseconds / (1000 * 60)) % 60;
        int hours = (milliseconds / (1000 * 60 * 60)) % 24;
        
        if (hours > 0) {
            return String.format("%d:%02d:%02d", hours, minutes, seconds);
        } else {
            return String.format("%d:%02d", minutes, seconds);
        }
    }
    
    private List<Video> getSampleVideos() {
        List<Video> videos = new ArrayList<>();
        videos.add(new Video("1", "Amazing Nature Documentary", "A beautiful nature documentary", "12:34", "", "", 15000, 1200, "Nature", "1", "Nature Channel"));
        videos.add(new Video("2", "Cooking Tutorial", "Learn to cook delicious meals", "8:45", "", "", 8900, 567, "Cooking", "2", "Chef Master"));
        videos.add(new Video("3", "Music Performance", "Live music performance", "5:20", "", "", 23400, 1890, "Music", "3", "Music Studio"));
        return videos;
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (mediaPlayer != null) {
            mediaPlayer.release();
            mediaPlayer = null;
        }
        handler.removeCallbacksAndMessages(null);
    }
} 