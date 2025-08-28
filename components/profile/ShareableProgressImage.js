import { LinearGradient } from 'expo-linear-gradient';
import React, { forwardRef } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import ViewShot from 'react-native-view-shot';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = 600;

const ShareableProgressImage = forwardRef(({ weeklyStats, username }, ref) => {
  const displayName = username || 'EcoTracker';
  
  return (
    <ViewShot
      ref={ref}
      options={{
        fileName: 'profile-summary',
        format: 'png',
        quality: 0.9,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      }}
      style={styles.container}
    >
      <LinearGradient
        colors={['#4CAF50', '#45a049', '#388E3C']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>🌱 EcoTrack</Text>
          <Text style={styles.userName}>{displayName}'s Progress</Text>
          <Text style={styles.period}>Weekly Report</Text>
        </View>

        {/* Weekly Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Last 7 Days</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{weeklyStats.totalScores}</Text>
              <Text style={styles.statLabel}>Scores Tracked</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{weeklyStats.averageScore}</Text>
              <Text style={styles.statLabel}>Avg CO₂ (kg)</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{weeklyStats.lowestScore}</Text>
              <Text style={styles.statLabel}>Best Score</Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>🏆 Achievements</Text>
          <View style={styles.achievementStats}>
            <Text style={styles.achievementCount}>
              {weeklyStats.achievementsUnlocked} / {weeklyStats.totalAchievements}
            </Text>
            <Text style={styles.achievementLabel}>Unlocked</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.hashtags}>
            #EcoTrack #Sustainability #CarbonFootprint
          </Text>
          <Text style={styles.timestamp}>
            Generated on {new Date().toLocaleDateString()}
          </Text>
        </View>
      </LinearGradient>
    </ViewShot>
  );
});

export default ShareableProgressImage;

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  gradient: {
    flex: 1,
    padding: 30,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  period: {
    fontSize: 16,
    color: '#e8f5e8',
    opacity: 0.9,
  },
  statsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#e8f5e8',
    textAlign: 'center',
    fontWeight: '500',
  },
  achievementsSection: {
    marginBottom: 30,
  },
  achievementStats: {
    alignItems: 'center',
    marginBottom: 20,
  },
  achievementCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  achievementLabel: {
    fontSize: 16,
    color: '#e8f5e8',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  hashtags: {
    fontSize: 14,
    color: '#e8f5e8',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#e8f5e8',
    opacity: 0.8,
  },
});
