package com.jumpy.videoplayerapp;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class VideoAdapter extends RecyclerView.Adapter<VideoAdapter.VideoViewHolder> {
    private List<Video> videoList;
    private OnVideoClickListener listener;

    public interface OnVideoClickListener {
        void onVideoClick(Video video);
    }

    public VideoAdapter(List<Video> videoList, OnVideoClickListener listener) {
        this.videoList = videoList;
        this.listener = listener;
    }

    @NonNull
    @Override
    public VideoViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_video, parent, false);
        return new VideoViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull VideoViewHolder holder, int position) {
        Video video = videoList.get(position);
        holder.titleText.setText(video.getTitle());
        holder.durationText.setText(video.getDuration());
        holder.viewsText.setText(video.getViews() + " views");
        holder.likesText.setText(video.getLikes() + " likes");
        holder.thumbnailImage.setImageResource(R.drawable.video_placeholder); // TODO: Load real thumbnail
        holder.itemView.setOnClickListener(v -> listener.onVideoClick(video));
    }

    @Override
    public int getItemCount() {
        return videoList.size();
    }

    public static class VideoViewHolder extends RecyclerView.ViewHolder {
        ImageView thumbnailImage;
        TextView durationText, titleText, viewsText, likesText;
        public VideoViewHolder(@NonNull View itemView) {
            super(itemView);
            thumbnailImage = itemView.findViewById(R.id.thumbnailImage);
            durationText = itemView.findViewById(R.id.durationText);
            titleText = itemView.findViewById(R.id.titleText);
            viewsText = itemView.findViewById(R.id.viewsText);
            likesText = itemView.findViewById(R.id.likesText);
        }
    }
} 