package com.jumpy.videoplayerapp;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.HorizontalScrollView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import androidx.cardview.widget.CardView;
import java.util.List;
import android.util.Log;

public class HomeFragment extends Fragment {
    private RecyclerView recentVideosRecycler;
    private SwipeRefreshLayout swipeRefreshLayout;
    private VideoAdapter adapter;
    private VideoManager videoManager;
    private ProgressBar loadingProgressBar;
    private TextView noVideosText;
    
    // Card views
    private CardView gamesCard, videosCard, socialChatCard;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_home, container, false);
        
        videoManager = VideoManager.getInstance();
        
        // Initialize views
        recentVideosRecycler = view.findViewById(R.id.recent_videos_recycler);
        swipeRefreshLayout = view.findViewById(R.id.swipeRefreshLayout);
        loadingProgressBar = view.findViewById(R.id.loading_progress_bar);
        noVideosText = view.findViewById(R.id.no_videos_text);
        
        // Initialize card views
        gamesCard = view.findViewById(R.id.games_card);
        videosCard = view.findViewById(R.id.videos_card);
        socialChatCard = view.findViewById(R.id.social_chat_card);
        
        // Setup RecyclerView
        recentVideosRecycler.setLayoutManager(new LinearLayoutManager(getContext()));
        
        // Setup swipe refresh
        swipeRefreshLayout.setOnRefreshListener(this::refreshVideos);
        
        // Setup card click listeners
        setupCardClickListeners();
        
        // Load recent videos
        loadRecentVideos();
        
        return view;
    }
    
    private void setupCardClickListeners() {
        // Games Card
        gamesCard.setOnClickListener(v -> {
            Log.d("HomeFragment", "Games card clicked");
            Intent intent = new Intent(getContext(), GamesActivity.class);
            startActivity(intent);
        });
        
        // Videos Card
        videosCard.setOnClickListener(v -> {
            Log.d("HomeFragment", "Videos card clicked");
            // Navigate to videos section or show all videos
            showAllVideos();
        });
        
        // Social Chat Card
        socialChatCard.setOnClickListener(v -> {
            Log.d("HomeFragment", "Social Chat card clicked");
            Intent intent = new Intent(getContext(), ChatActivity.class);
            startActivity(intent);
        });
    }
    
    private void showVideosSection() {
        Log.d("HomeFragment", "showVideosSection() called");
        // Show recent videos section
        if (recentVideosRecycler.getVisibility() == View.GONE) {
            recentVideosRecycler.setVisibility(View.VISIBLE);
            loadRecentVideos();
        }
    }
    
    private void showAllVideos() {
        Log.d("HomeFragment", "showAllVideos() called");
        // Load all videos and show them in a dedicated section
        showLoading(true);
        
        videoManager.initializeData(new VideoManager.VideoDataCallback() {
            @Override
            public void onDataLoaded() {
                Log.d("HomeFragment", "All video data loaded successfully");
                if (getActivity() != null) {
                    getActivity().runOnUiThread(() -> {
                        showLoading(false);
                        displayAllVideos();
                    });
                }
            }
            
            @Override
            public void onError(String error) {
                Log.e("HomeFragment", "Error loading all video data: " + error);
                if (getActivity() != null) {
                    getActivity().runOnUiThread(() -> {
                        showLoading(false);
                        showError(error);
                    });
                }
            }
        });
    }
    
    private void displayAllVideos() {
        List<Video> allVideos = videoManager.getAllVideos();
        if (allVideos.isEmpty()) {
            showNoVideos();
        } else {
            hideNoVideos();
            // Show all videos instead of just recent ones
            adapter = new VideoAdapter(allVideos, video -> {
                Intent intent = new Intent(getContext(), VideoPlayerActivity.class);
                intent.putExtra("video_index", allVideos.indexOf(video));
                intent.putExtra("video_list", new java.util.ArrayList<>(allVideos));
                startActivity(intent);
            });
            recentVideosRecycler.setAdapter(adapter);
            recentVideosRecycler.setVisibility(View.VISIBLE);
        }
    }
    
    private void loadRecentVideos() {
        Log.d("HomeFragment", "loadRecentVideos() called");
        showLoading(true);
        
        videoManager.initializeData(new VideoManager.VideoDataCallback() {
            @Override
            public void onDataLoaded() {
                Log.d("HomeFragment", "Video data loaded successfully");
                if (getActivity() != null) {
                    getActivity().runOnUiThread(() -> {
                        showLoading(false);
                        displayRecentVideos();
                    });
                }
            }
            
            @Override
            public void onError(String error) {
                Log.e("HomeFragment", "Error loading video data: " + error);
                if (getActivity() != null) {
                    getActivity().runOnUiThread(() -> {
                        showLoading(false);
                        showError(error);
                    });
                }
            }
        });
    }
    
    private void refreshVideos() {
        videoManager.refreshData(new VideoManager.VideoDataCallback() {
            @Override
            public void onDataLoaded() {
                if (getActivity() != null) {
                    getActivity().runOnUiThread(() -> {
                        swipeRefreshLayout.setRefreshing(false);
                        displayRecentVideos();
                    });
                }
            }
            
            @Override
            public void onError(String error) {
                if (getActivity() != null) {
                    getActivity().runOnUiThread(() -> {
                        swipeRefreshLayout.setRefreshing(false);
                        showError(error);
                    });
                }
            }
        });
    }
    
    private void displayRecentVideos() {
        List<Video> videosRaw = videoManager.getAllVideos();
        final List<Video> videos;
        // Show only recent videos (first 5)
        if (videosRaw.size() > 5) {
            videos = videosRaw.subList(0, 5);
        } else {
            videos = videosRaw;
        }
        if (videos.isEmpty()) {
            showNoVideos();
        } else {
            hideNoVideos();
            adapter = new VideoAdapter(videos, video -> {
                Intent intent = new Intent(getContext(), VideoPlayerActivity.class);
                intent.putExtra("video_index", videos.indexOf(video));
                intent.putExtra("video_list", new java.util.ArrayList<>(videos));
                startActivity(intent);
            });
            recentVideosRecycler.setAdapter(adapter);
        }
    }
    
    private void showLoading(boolean show) {
        if (loadingProgressBar != null) {
            loadingProgressBar.setVisibility(show ? View.VISIBLE : View.GONE);
        }
        if (recentVideosRecycler != null) {
            recentVideosRecycler.setVisibility(show ? View.GONE : View.VISIBLE);
        }
    }
    
    private void showNoVideos() {
        if (noVideosText != null) {
            noVideosText.setVisibility(View.VISIBLE);
        }
        if (recentVideosRecycler != null) {
            recentVideosRecycler.setVisibility(View.GONE);
        }
    }
    
    private void hideNoVideos() {
        if (noVideosText != null) {
            noVideosText.setVisibility(View.GONE);
        }
        if (recentVideosRecycler != null) {
            recentVideosRecycler.setVisibility(View.VISIBLE);
        }
    }
    
    private void showError(String error) {
        Toast.makeText(getContext(), error, Toast.LENGTH_LONG).show();
        showNoVideos();
    }
} 