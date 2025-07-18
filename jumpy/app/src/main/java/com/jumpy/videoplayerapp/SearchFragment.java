package com.jumpy.videoplayerapp;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class SearchFragment extends Fragment {
    private EditText searchEditText;
    private RecyclerView searchResultsRecyclerView;
    private VideoAdapter adapter;
    private VideoManager videoManager;
    private LinearLayout noResultsLayout;
    private ProgressBar searchProgressBar;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_search, container, false);
        
        videoManager = VideoManager.getInstance();
        
        // Initialize views
        searchEditText = view.findViewById(R.id.search_edit_text);
        searchResultsRecyclerView = view.findViewById(R.id.search_results_recycler_view);
        noResultsLayout = view.findViewById(R.id.no_results_layout);
        searchProgressBar = view.findViewById(R.id.search_progress_bar);
        
        // Setup RecyclerView
        searchResultsRecyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        
        // Setup search functionality
        setupSearch();
        
        return view;
    }
    
    private void setupSearch() {
        searchEditText.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}
            
            @Override
            public void afterTextChanged(Editable s) {
                String query = s.toString().trim();
                if (query.length() >= 2) {
                    performSearch(query);
                } else if (query.isEmpty()) {
                    clearSearch();
                }
            }
        });
    }
    
    private void performSearch(String query) {
        showSearchProgress(true);
        
        videoManager.searchVideos(query, new VideoManager.SearchCallback() {
            @Override
            public void onSearchComplete(List<Video> results) {
                if (getActivity() != null) {
                    getActivity().runOnUiThread(() -> {
                        showSearchProgress(false);
                        displaySearchResults(results);
                    });
                }
            }
            
            @Override
            public void onError(String error) {
                if (getActivity() != null) {
                    getActivity().runOnUiThread(() -> {
                        showSearchProgress(false);
                        showSearchError(error);
                    });
                }
            }
        });
    }
    
    private void displaySearchResults(List<Video> results) {
        if (results.isEmpty()) {
            searchResultsRecyclerView.setVisibility(View.GONE);
            noResultsLayout.setVisibility(View.VISIBLE);
        } else {
            searchResultsRecyclerView.setVisibility(View.VISIBLE);
            noResultsLayout.setVisibility(View.GONE);
            
            adapter = new VideoAdapter(results, video -> {
                // Open video player
                Intent intent = new Intent(getContext(), VideoPlayerActivity.class);
                intent.putExtra("video_index", results.indexOf(video));
                intent.putExtra("video_list", new java.util.ArrayList<>(results));
                startActivity(intent);
            });
            
            searchResultsRecyclerView.setAdapter(adapter);
        }
    }
    
    private void clearSearch() {
        searchResultsRecyclerView.setVisibility(View.GONE);
        noResultsLayout.setVisibility(View.GONE);
        showSearchProgress(false);
    }
    
    private void showSearchProgress(boolean show) {
        if (searchProgressBar != null) {
            searchProgressBar.setVisibility(show ? View.VISIBLE : View.GONE);
        }
    }
    
    private void showSearchError(String error) {
        Toast.makeText(getContext(), "Search failed: " + error, Toast.LENGTH_SHORT).show();
        searchResultsRecyclerView.setVisibility(View.GONE);
        noResultsLayout.setVisibility(View.VISIBLE);
    }
} 