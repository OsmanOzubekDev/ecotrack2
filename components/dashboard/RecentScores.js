import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthProvider';
import { getCarbonScores } from '../../src/api/carbon';

export default function RecentCarbonEntries() {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchScores = async () => {
    if (!user?.uid) {
      console.log('No user ID available for fetching scores');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching carbon scores for user:', user.uid);
      
      const carbonScores = await getCarbonScores(user.uid, 5);
      console.log('Received carbon scores:', carbonScores);
      
      setScores(carbonScores);
    } catch (error) {
      console.error('Error fetching carbon scores:', error);
      setError(error.message || 'Failed to fetch scores');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log('RecentScores: useFocusEffect triggered, user:', user?.uid);
      fetchScores();
    }, [user?.uid])
  );

  const formatDate = (timestamp, index) => {
    console.log(`=== Formatting date for score ${index} ===`);
    console.log('Input timestamp:', timestamp);
    console.log('Input type:', typeof timestamp);
    
    if (!timestamp) {
      console.log('No timestamp provided, using fallback date');
      return `Score ${index + 1}`;
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
        return `Score ${index + 1}`;
      }
      
      console.log('Valid date object:', date);
      
      // Calculate relative time
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      console.log('Days difference:', diffDays);
      
      if (diffDays === 1) return 'Today';
      if (diffDays === 2) return 'Yesterday';
      if (diffDays <= 7) return `${diffDays - 1} days ago`;
      
      // For older dates, show the actual date
      const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      console.log('Formatted date:', formattedDate);
      return formattedDate;
      
    } catch (error) {
      console.error('Error formatting date:', error, timestamp);
      return `Score ${index + 1}`;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Recent Carbon Scores</Text>
        <View style={styles.centerContent}>
          <ActivityIndicator size="small" color="#666" />
          <Text style={styles.loadingText}>Loading your scores...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Recent Carbon Scores</Text>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Error loading scores</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchScores}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (scores.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Recent Carbon Scores</Text>
        <View style={styles.centerContent}>
          <Text style={styles.noData}>No carbon scores yet</Text>
          <Text style={styles.noDataSubtext}>Complete the carbon form to get started!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Carbon Scores</Text>
      <FlatList
        data={scores}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          console.log('Rendering score item:', item);
          const formattedDate = formatDate(item.timestamp, index);
          console.log('Formatted date for item:', item.id, ':', formattedDate);
          
          return (
            <View style={styles.scoreItem}>
              <Text style={styles.date}>{formattedDate}</Text>
              <Text style={styles.score}>{item.score} kg CO₂</Text>
            </View>
          );
        }}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  centerContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: '500',
    marginBottom: 5,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  noData: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginBottom: 5,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  date: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  score: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
});
