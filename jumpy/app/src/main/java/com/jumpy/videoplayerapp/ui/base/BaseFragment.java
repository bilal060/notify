package com.jumpy.videoplayerapp.ui.base;

import android.content.Context;
import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.jumpy.videoplayerapp.utils.ErrorHandler;
import com.jumpy.videoplayerapp.utils.NetworkUtils;

public abstract class BaseFragment extends Fragment {
    
    protected Context context;
    protected ProgressBar progressBar;
    protected TextView errorText;
    protected TextView emptyText;
    protected View contentView;
    
    @Override
    public void onAttach(@NonNull Context context) {
        super.onAttach(context);
        this.context = context;
    }
    
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        initializeViews(view);
        setupObservers();
        loadData();
    }
    
    // Abstract methods that subclasses must implement
    protected abstract void initializeViews(View view);
    protected abstract void setupObservers();
    protected abstract void loadData();
    
    // Common view initialization
    protected void initializeCommonViews(View view, int progressBarId, int errorTextId, int emptyTextId, int contentViewId) {
        progressBar = view.findViewById(progressBarId);
        errorText = view.findViewById(errorTextId);
        emptyText = view.findViewById(emptyTextId);
        contentView = view.findViewById(contentViewId);
    }
    
    // State management
    protected void showLoading() {
        if (progressBar != null) progressBar.setVisibility(View.VISIBLE);
        if (errorText != null) errorText.setVisibility(View.GONE);
        if (emptyText != null) emptyText.setVisibility(View.GONE);
        if (contentView != null) contentView.setVisibility(View.GONE);
    }
    
    protected void showContent() {
        if (progressBar != null) progressBar.setVisibility(View.GONE);
        if (errorText != null) errorText.setVisibility(View.GONE);
        if (emptyText != null) emptyText.setVisibility(View.GONE);
        if (contentView != null) contentView.setVisibility(View.VISIBLE);
    }
    
    protected void showError(String message) {
        if (progressBar != null) progressBar.setVisibility(View.GONE);
        if (errorText != null) {
            errorText.setText(message);
            errorText.setVisibility(View.VISIBLE);
        }
        if (emptyText != null) emptyText.setVisibility(View.GONE);
        if (contentView != null) contentView.setVisibility(View.GONE);
        
        // Show toast for immediate feedback
        if (context != null) {
            Toast.makeText(context, message, Toast.LENGTH_LONG).show();
        }
    }
    
    protected void showEmpty(String message) {
        if (progressBar != null) progressBar.setVisibility(View.GONE);
        if (errorText != null) errorText.setVisibility(View.GONE);
        if (emptyText != null) {
            emptyText.setText(message);
            emptyText.setVisibility(View.VISIBLE);
        }
        if (contentView != null) contentView.setVisibility(View.GONE);
    }
    
    // Network checks
    protected boolean isNetworkAvailable() {
        return NetworkUtils.isNetworkAvailable(context);
    }
    
    protected void checkNetworkAndExecute(Runnable action) {
        if (isNetworkAvailable()) {
            action.run();
        } else {
            showError("No internet connection. Please check your network settings.");
        }
    }
    
    // Error handling
    protected void handleError(ErrorHandler.AppError error) {
        ErrorHandler.showError(context, error);
        showError(error.getMessage());
    }
    
    protected void handleError(String message) {
        showError(message);
    }
    
    // Retry functionality
    protected void setupRetryButton(View retryButton, Runnable retryAction) {
        if (retryButton != null) {
            retryButton.setOnClickListener(v -> {
                if (isNetworkAvailable()) {
                    retryAction.run();
                } else {
                    showError("No internet connection. Please check your network settings.");
                }
            });
        }
    }
    
    // Lifecycle management
    @Override
    public void onResume() {
        super.onResume();
        // Check if we need to refresh data when coming back to foreground
        if (shouldRefreshOnResume()) {
            refreshData();
        }
    }
    
    protected boolean shouldRefreshOnResume() {
        return false; // Override in subclasses if needed
    }
    
    protected void refreshData() {
        // Override in subclasses to implement refresh logic
    }
    
    // Utility methods
    protected void showToast(String message) {
        if (context != null) {
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show();
        }
    }
    
    protected void showLongToast(String message) {
        if (context != null) {
            Toast.makeText(context, message, Toast.LENGTH_LONG).show();
        }
    }
    
    // View state management
    protected void setViewEnabled(View view, boolean enabled) {
        if (view != null) {
            view.setEnabled(enabled);
            view.setAlpha(enabled ? 1.0f : 0.5f);
        }
    }
    
    protected void setViewsEnabled(boolean enabled, View... views) {
        for (View view : views) {
            setViewEnabled(view, enabled);
        }
    }
} 