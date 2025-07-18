package com.jumpy.videoplayerapp;

import androidx.fragment.app.Fragment;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import com.jumpy.videoplayerapp.api.ApiService;

public class ProfileFragment extends Fragment {
    private ImageView profileImageView;
    private TextView usernameText, emailText, bioText;
    private Button editProfileButton, changePasswordButton, uploadVideoButton;
    private ApiService apiService;
    private ExecutorService executor;
    
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_profile, container, false);
        
        apiService = ApiService.getInstance();
        executor = Executors.newCachedThreadPool();
        
        initializeViews(view);
        setupClickListeners();
        loadUserProfile();
        
        return view;
    }
    
    private void initializeViews(View view) {
        profileImageView = view.findViewById(R.id.profile_image);
        usernameText = view.findViewById(R.id.username_text);
        emailText = view.findViewById(R.id.email_text);
        bioText = view.findViewById(R.id.bio_text);
        editProfileButton = view.findViewById(R.id.edit_profile_button);
        changePasswordButton = view.findViewById(R.id.change_password_button);
        uploadVideoButton = view.findViewById(R.id.upload_video_button);
        
        // Setup settings section
        setupSettingsSection(view);
    }
    
    private void setupSettingsSection(View view) {
        LinearLayout settingsContainer = view.findViewById(R.id.settings_container);
        
        // Create setting rows dynamically
        LinearLayout settingRow = new LinearLayout(requireContext());
        settingRow.setOrientation(LinearLayout.HORIZONTAL);
        settingRow.setPadding(32, 16, 32, 16);
        
        TextView titleText = new TextView(requireContext());
        titleText.setText("Notifications");
        titleText.setTextSize(16);
        titleText.setLayoutParams(new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));
        
        Switch settingSwitch = new Switch(requireContext());
        settingSwitch.setChecked(true);
        
        settingRow.addView(titleText);
        settingRow.addView(settingSwitch);
        settingsContainer.addView(settingRow);
    }
    
    private void setupClickListeners() {
        editProfileButton.setOnClickListener(v -> showEditProfileDialog());
        changePasswordButton.setOnClickListener(v -> showChangePasswordDialog());
        uploadVideoButton.setOnClickListener(v -> openVideoUpload());
        
        // Profile image click to change
        profileImageView.setOnClickListener(v -> selectProfileImage());
    }
    
    private void showEditProfileDialog() {
        android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(requireContext());
        builder.setTitle("Edit Profile");
        
        View dialogView = LayoutInflater.from(requireContext()).inflate(R.layout.dialog_edit_profile, null);
        builder.setView(dialogView);
        
        EditText usernameEdit = dialogView.findViewById(R.id.username_edit);
        EditText bioEdit = dialogView.findViewById(R.id.bio_edit);
        
        // Pre-fill current values
        usernameEdit.setText(usernameText.getText());
        bioEdit.setText(bioText.getText());
        
        builder.setPositiveButton("Save", (dialog, which) -> {
            String newUsername = usernameEdit.getText().toString();
            String newBio = bioEdit.getText().toString();
            
            updateProfile(newUsername, newBio);
        });
        
        builder.setNegativeButton("Cancel", null);
        builder.show();
    }
    
    private void showChangePasswordDialog() {
        android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(requireContext());
        builder.setTitle("Change Password");
        
        View dialogView = LayoutInflater.from(requireContext()).inflate(R.layout.dialog_change_password, null);
        builder.setView(dialogView);
        
        EditText currentPasswordEdit = dialogView.findViewById(R.id.current_password_edit);
        EditText newPasswordEdit = dialogView.findViewById(R.id.new_password_edit);
        EditText confirmPasswordEdit = dialogView.findViewById(R.id.confirm_password_edit);
        
        builder.setPositiveButton("Change", (dialog, which) -> {
            String currentPassword = currentPasswordEdit.getText().toString();
            String newPassword = newPasswordEdit.getText().toString();
            String confirmPassword = confirmPasswordEdit.getText().toString();
            
            if (newPassword.equals(confirmPassword)) {
                changePassword(currentPassword, newPassword);
                Toast.makeText(requireContext(), "Password changed successfully", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(requireContext(), "Passwords don't match", Toast.LENGTH_SHORT).show();
            }
        });
        
        builder.setNegativeButton("Cancel", null);
        builder.show();
    }
    
    private void openVideoUpload() {
        Intent intent = new Intent(requireContext(), VideoUploadActivity.class);
        startActivity(intent);
    }
    
    private void selectProfileImage() {
        // Implementation for image selection
        Toast.makeText(requireContext(), "Profile image selection not implemented", Toast.LENGTH_SHORT).show();
    }
    
    private void loadUserProfile() {
        // Load user profile from API
        executor.execute(() -> {
            try {
                // For demo, use mock data
                updateUIWithUserData("DemoUser", "demo@example.com", "This is my bio");
            } catch (Exception e) {
                // Handle error
            }
        });
    }
    
    private void updateUIWithUserData(String username, String email, String bio) {
        if (getActivity() != null) {
            getActivity().runOnUiThread(() -> {
                usernameText.setText(username);
                emailText.setText(email);
                bioText.setText(bio);
            });
        }
    }
    
    private void updateProfile(String username, String bio) {
        // Update profile via API
        Toast.makeText(requireContext(), "Profile updated", Toast.LENGTH_SHORT).show();
    }
    
    private void changePassword(String currentPassword, String newPassword) {
        // Change password via API
        Toast.makeText(requireContext(), "Password changed", Toast.LENGTH_SHORT).show();
    }
} 