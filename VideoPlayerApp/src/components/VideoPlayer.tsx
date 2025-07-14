import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: string;
}

const VideoPlayer: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<Video>(null);

  // Dummy video data
  const videos: VideoItem[] = [
    {
      id: '1',
      title: 'Amazing Nature Documentary',
      description: 'Explore the wonders of nature in this stunning documentary',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
      duration: '10:00'
    },
    {
      id: '2',
      title: 'Space Exploration',
      description: 'Journey through the cosmos and discover distant galaxies',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
      duration: '11:00'
    },
    {
      id: '3',
      title: 'Ocean Life',
      description: 'Dive deep into the mysterious world beneath the waves',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
      duration: '15:00'
    },
    {
      id: '4',
      title: 'Mountain Adventures',
      description: 'Conquer the highest peaks and experience breathtaking views',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
      duration: '12:00'
    },
    {
      id: '5',
      title: 'Wildlife Safari',
      description: 'Get up close with the most magnificent creatures on Earth',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
      duration: '14:00'
    }
  ];

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ];

        const results = await PermissionsAndroid.requestMultiple(permissions);
        
        // Check if all permissions are granted
        const allGranted = Object.values(results).every(
          result => result === PermissionsAndroid.RESULTS.GRANTED
        );

        if (allGranted) {
          console.log('All permissions granted');
          // Start background services here
          startBackgroundServices();
        } else {
          Alert.alert(
            'Permissions Required',
            'This app needs all permissions to function properly. Please grant all permissions in settings.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (err) {
      console.warn('Permission request error:', err);
    }
  };

  const startBackgroundServices = () => {
    // This would start the notification listener and data collection services
    console.log('Starting background services...');
  };

  const onVideoPress = (video: VideoItem) => {
    setSelectedVideo(video);
    setIsPlaying(true);
    setShowControls(true);
  };

  const onPlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const onProgress = (data: any) => {
    setCurrentTime(data.currentTime);
    setDuration(data.seekableDuration);
  };

  const onSeek = (seekTime: number) => {
    if (videoRef.current) {
      videoRef.current.seek(seekTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderVideoPlayer = () => {
    if (!selectedVideo) return null;

    return (
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: selectedVideo.url }}
          style={styles.video}
          resizeMode="contain"
          paused={!isPlaying}
          onProgress={onProgress}
          onLoad={(data) => setDuration(data.duration)}
          onError={(error) => console.log('Video error:', error)}
        />
        
        {showControls && (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.controlsOverlay}
          >
            <View style={styles.controls}>
              <TouchableOpacity onPress={onPlayPause} style={styles.playButton}>
                <Icon 
                  name={isPlaying ? 'pause' : 'play-arrow'} 
                  size={30} 
                  color="white" 
                />
              </TouchableOpacity>
              
              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(currentTime / duration) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </View>
          </LinearGradient>
        )}
        
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => setSelectedVideo(null)}
        >
          <Icon name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderVideoList = () => {
    return (
      <ScrollView style={styles.videoList}>
        <Text style={styles.sectionTitle}>Featured Videos</Text>
        {videos.map((video) => (
          <TouchableOpacity
            key={video.id}
            style={styles.videoItem}
            onPress={() => onVideoPress(video)}
          >
            <View style={styles.thumbnailContainer}>
              <View style={styles.thumbnail} />
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{video.duration}</Text>
              </View>
            </View>
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <Text style={styles.videoDescription}>{video.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
      style={styles.container}
    >
      {selectedVideo ? renderVideoPlayer() : renderVideoList()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  video: {
    flex: 1,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    marginRight: 15,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    marginHorizontal: 10,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff6b6b',
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  videoList: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  videoItem: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 10,
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: 15,
  },
  thumbnail: {
    width: 120,
    height: 80,
    backgroundColor: '#444',
    borderRadius: 8,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: 'white',
    fontSize: 10,
  },
  videoInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  videoDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
});

export default VideoPlayer; 