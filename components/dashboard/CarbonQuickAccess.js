import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthProvider';
import { getLatestCarbonScore } from '../../src/api/carbon';

export default function CarbonQuickAccess() {
  const router = useRouter();
  const { user } = useAuth();
  const [latestScore, setLatestScore] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLatestScore = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const score = await getLatestCarbonScore(user.uid);
      setLatestScore(score);
    } catch (error) {
      console.error('Error fetching latest carbon score:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLatestScore();
    }, [user?.uid])
  );

  // Helper function to safely convert timestamps (same as in other components)
  const convertTimestamp = (timestamp) => {
    if (!timestamp) {
      console.log('No timestamp provided to convertTimestamp in CarbonQuickAccess');
      return new Date();
    }
    
    try {
      let date;
      
      // Try multiple approaches to get a valid date
      if (timestamp instanceof Date) {
        date = timestamp;
        console.log('Timestamp is already a Date object');
      } else if (timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
        console.log('Converted Firestore timestamp');
      } else if (timestamp && typeof timestamp === 'object' && timestamp.seconds !== undefined) {
        date = new Date(timestamp.seconds * 1000);
        console.log('Converted from seconds');
      } else if (timestamp && typeof timestamp === 'object' && timestamp._seconds !== undefined) {
        date = new Date(timestamp._seconds * 1000);
        console.log('Converted from _seconds');
      } else if (typeof timestamp === 'number') {
        date = new Date(timestamp);
        console.log('Converted from number');
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
        console.log('Converted from string');
      } else {
        console.log('Unknown timestamp format, using current date');
        date = new Date();
      }
      
      // Validate the date
      if (isNaN(date.getTime())) {
        console.warn('Invalid date created, using fallback');
        return new Date();
      }
      
      console.log('Valid date object:', date);
      return date;
      
    } catch (error) {
      console.error('Error converting timestamp:', error, timestamp);
      return new Date();
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = convertTimestamp(timestamp);
      
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'today';
      if (diffDays === 2) return 'yesterday';
      if (diffDays <= 7) return `${diffDays - 1} days ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date in CarbonQuickAccess:', error);
      return 'recently';
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardText}>🚀 Welcome to EcoTrack!</Text>
      
      {loading ? (
        <View style={styles.scoreContainer}>
          <ActivityIndicator size="small" color="#666" />
          <Text style={styles.loadingText}>Loading your data...</Text>
        </View>
      ) : latestScore ? (
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Latest Carbon Score:</Text>
          <Text style={styles.scoreValue}>{latestScore.score} kg CO₂</Text>
          <Text style={styles.scoreDate}>Calculated {formatDate(latestScore.timestamp)}</Text>
        </View>
      ) : (
        <Text style={styles.cardSubtext}>Calculate your carbon footprint to get started!</Text>
      )}

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push('/carbonform')}
      >
        <Text style={styles.buttonText}>
          {latestScore ? 'Calculate New Score' : 'Calculate Carbon Footprint'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  cardText: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 15,
    color: '#333',
  },
  cardSubtext: { 
    fontSize: 14, 
    color: '#555', 
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e86de',
    marginBottom: 5,
  },
  scoreDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#2e86de',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});
