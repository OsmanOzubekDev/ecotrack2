import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import { useFocusEffect } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AchievementsDisplay from '../../components/profile/AchievementsDisplay';
import ShareableProgressImage from '../../components/profile/ShareableProgressImage';
import UserInfoCard from '../../components/profile/UserInfoCard';
import { useAuth } from '../../context/AuthProvider';
import { db } from '../../context/firebase';
import { checkAchievementProgress } from '../../src/api/achievements';
import { getCarbonScores } from '../../src/api/carbon';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [loading, setLoading] = useState(true);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState(null);
  const viewShotRef = useRef(null);
  const [achievementsKey, setAchievementsKey] = useState(0); // State to force AchievementsDisplay remount

  const fetchProfile = async () => {
    if (!user?.uid) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log('Profile data fetched:', data);
        setUsername(data.username);
        setBirthdate(data.birthdate);
        console.log('State set - username:', data.username, 'birthdate:', data.birthdate);
      }
    } catch (error) {
      console.error('Profil verileri alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameUpdate = (newUsername) => {
    setUsername(newUsername);
  };

  const handleBirthdateUpdate = (newBirthdate) => {
    setBirthdate(newBirthdate);
  };

  const handleShareProgress = async () => {
    if (!user?.uid) return;
    
    setIsGeneratingShare(true);
    try {
      // Get last week's carbon scores
      const carbonScores = await getCarbonScores(user.uid, 7);
      
      // Get achievements progress
      const achievements = await checkAchievementProgress(user.uid);
      const unlockedAchievements = achievements.filter(achievement => achievement.isUnlocked);
      
      // Calculate weekly stats
      const weeklyStats = {
        totalScores: carbonScores.length,
        averageScore: carbonScores.length > 0 
          ? (carbonScores.reduce((sum, score) => sum + score.score, 0) / carbonScores.length).toFixed(2)
          : 0,
        lowestScore: carbonScores.length > 0 
          ? Math.min(...carbonScores.map(score => score.score))
          : 0,
        achievementsUnlocked: unlockedAchievements.length,
        totalAchievements: achievements.length
      };
      
      // Set share data and show modal
      setShareData({ weeklyStats, achievements: unlockedAchievements });
      setShowShareModal(true);
      
    } catch (error) {
      console.error('Error generating share content:', error);
      Alert.alert('Error', 'Failed to generate share content. Please try again.');
    } finally {
      setIsGeneratingShare(false);
    }
  };

  const handleCopyText = async () => {
    if (!shareData) return;
    
    const displayName = username || user?.email?.split('@')[0] || 'EcoTracker';
    
    let content = `🌱 ${displayName}'s Weekly Eco Progress Report 📊\n\n`;
    content += `📅 Last 7 Days:\n`;
    content += `• Carbon scores tracked: ${shareData.weeklyStats.totalScores}\n`;
    content += `• Average carbon footprint: ${shareData.weeklyStats.averageScore} kg CO2\n`;
    content += `• Best score: ${shareData.weeklyStats.lowestScore} kg CO2\n\n`;
    
    content += `🏆 Achievements:\n`;
    content += `• ${shareData.weeklyStats.achievementsUnlocked}/${shareData.weeklyStats.totalAchievements} unlocked\n`;
    
    content += `\n#EcoTrack #Sustainability #CarbonFootprint #ClimateAction`;
    
    try {
      await Clipboard.setString(content);
      Alert.alert('Copied!', 'Content copied to clipboard. You can now paste it on social media!');
    } catch (error) {
      console.error('Error copying text:', error);
      Alert.alert('Error', 'Failed to copy content to clipboard. Please try again.');
    }
  };

  const handleShareImage = async () => {
    if (!shareData || !viewShotRef.current) return;

    try {
      // Request permissions first
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your media library to save the image.');
        return;
      }

      // Capture the view as an image
      const imageUri = await viewShotRef.current.capture();
      
      // Save to media library with the specified filename
      const asset = await MediaLibrary.createAssetAsync(imageUri);
      
      // Create an album and add the asset to it
      const album = await MediaLibrary.getAlbumAsync('EcoTrack');
      if (album === null) {
        await MediaLibrary.createAlbumAsync('EcoTrack', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      Alert.alert(
        'Download Complete! 📱',
        'Your progress image has been saved to your device\'s photo gallery in the EcoTrack album.\n\nYou can now share it on social media!',
        [{ text: 'Got it!' }]
      );
    } catch (error) {
      console.error('Error downloading image:', error);
      Alert.alert('Error', 'Failed to download progress image. Please try again.');
    }
  };

  const refreshAchievementsOnFocus = async () => {
    if (!user?.uid) return;
    
    try {
      // Force a fresh fetch of achievements data
      await checkAchievementProgress(user.uid);
      // Increment key to force AchievementsDisplay to remount
      setAchievementsKey(prev => prev + 1);
      console.log('Achievements refreshed on profile focus, new key:', achievementsKey + 1);
    } catch (error) {
      console.error('Error refreshing achievements:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      // Refresh achievements when profile page comes into focus
      refreshAchievementsOnFocus();
    }, [user?.uid])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>👤 Your Profile</Text>

      <UserInfoCard 
        username={username}
        email={user?.email}
        birthdate={birthdate}
        onUsernameUpdate={handleUsernameUpdate}
        onBirthdateUpdate={handleBirthdateUpdate}
      />

      {/* Social Media Share Button */}
      <TouchableOpacity 
        style={styles.shareButton}
        onPress={handleShareProgress}
        disabled={isGeneratingShare}
      >
        <Text style={styles.shareButtonText}>
          {isGeneratingShare ? 'Generating...' : 'Share'}
        </Text>
        {isGeneratingShare && (
          <ActivityIndicator size="small" color="#fff" style={styles.shareLoader} />
        )}
      </TouchableOpacity>

      <Text style={[styles.title, { marginTop: 30 }]}>🏆 Achievements</Text>
      
      <AchievementsDisplay key={achievementsKey} />

      {/* Share Modal */}
      <Modal
        visible={showShareModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Download Your Progress Image 📱</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowShareModal(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {shareData && (
              <ShareableProgressImage 
                weeklyStats={shareData.weeklyStats}
                username={username}
                ref={viewShotRef}
              />
            )}
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.copyButton]}
              onPress={handleCopyText}
            >
              <Ionicons name="copy" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Copy Text</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.downloadButton]}
              onPress={handleShareImage}
            >
              <Ionicons name="download" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Download Image</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
    color: '#222',
  },
  noBadges: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 10,
  },
  badgeContainer: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badge: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 16,
    color: '#333',
  },
  shareButton: {
    backgroundColor: '#2e86de',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  shareLoader: {
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalContent: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
  },
  copyButton: {
    backgroundColor: '#10B981',
    flex: 1,
    marginRight: 10,
  },
  downloadButton: {
    backgroundColor: '#3B82F6',
    flex: 1,
    marginLeft: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
});
