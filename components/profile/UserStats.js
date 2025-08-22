import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthProvider';
import { checkAchievementProgress } from '../../src/api/achievements';

export default function UserStats() {
  const { user } = useAuth();
  const [badgeCount, setBadgeCount] = useState(0);
  const [totalAchievements, setTotalAchievements] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchBadgeCount = async () => {
    try {
      const progressData = await checkAchievementProgress(user.uid);
      const unlockedCount = progressData.filter(achievement => achievement.isUnlocked).length;
      setBadgeCount(unlockedCount);
      setTotalAchievements(progressData.length);
    } catch (error) {
      console.error('Rozet verisi alınamadı:', error);
      setBadgeCount(0);
      setTotalAchievements(0);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        fetchBadgeCount();
      }
    }, [user?.uid])
  );

  if (loading) {
    return <ActivityIndicator />;
  }

  const completionPercentage = totalAchievements > 0 ? Math.round((badgeCount / totalAchievements) * 100) : 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>🏅 Achievements Progress</Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${completionPercentage}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {badgeCount} / {totalAchievements} ({completionPercentage}%)
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{badgeCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalAchievements - badgeCount}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>
      
      <Text style={styles.subtitle}>
        {badgeCount === 0 ? 'Start your journey!' : 
         badgeCount === totalAchievements ? 'All achievements unlocked! 🎉' : 
         `${totalAchievements - badgeCount} more to go!`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
