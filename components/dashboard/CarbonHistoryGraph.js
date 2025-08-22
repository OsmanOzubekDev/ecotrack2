// components/dashboard/CarbonHistoryGraph.js
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../../context/AuthProvider';
import { getCarbonScores } from '../../src/api/carbon';

export default function CarbonHistoryGraph() {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchScores = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const carbonScores = await getCarbonScores(user.uid, 7);
      console.log('CarbonHistoryGraph: Received scores:', carbonScores);
      setScores(carbonScores);
    } catch (error) {
      console.error('Error fetching carbon scores for graph:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchScores();
    }, [user?.uid])
  );

  // Helper function to safely convert timestamps (same as in RecentScores)
  const convertTimestamp = (timestamp) => {
    if (!timestamp) {
      console.log('No timestamp provided to convertTimestamp');
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

  const prepareChartData = () => {
    if (scores.length === 0) {
      console.log('CarbonHistoryGraph: No scores available for chart');
      return {
        labels: ['No data'],
        datasets: [{ data: [0], color: () => 'rgba(34, 139, 34, 0.8)', strokeWidth: 2 }],
      };
    }

    // Sort scores by timestamp (oldest first for chart)
    const sortedScores = [...scores].sort((a, b) => {
      const dateA = convertTimestamp(a.timestamp);
      const dateB = convertTimestamp(b.timestamp);
      return dateA - dateB;
    });

    console.log('CarbonHistoryGraph: Sorted scores:', sortedScores);

    const labels = sortedScores.map(score => {
      const date = convertTimestamp(score.timestamp);
      const label = date.toLocaleDateString('en-US', { weekday: 'short' });
      console.log('CarbonHistoryGraph: Date label for score:', score.score, '->', label);
      return label;
    });

    const data = sortedScores.map(score => score.score);

    console.log('CarbonHistoryGraph: Chart labels:', labels);
    console.log('CarbonHistoryGraph: Chart data:', data);

    return {
      labels,
      datasets: [
        {
          data,
          color: () => 'rgba(34, 139, 34, 0.8)',
          strokeWidth: 2,
        },
      ],
    };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Weekly Carbon Score</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#666" />
          <Text style={styles.loadingText}>Loading chart data...</Text>
        </View>
      </View>
    );
  }

  const chartData = prepareChartData();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Carbon Score</Text>
      {scores.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No carbon scores yet</Text>
          <Text style={styles.noDataSubtext}>Complete the carbon form to see your progress</Text>
        </View>
      ) : (
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#f0f0f0',
            backgroundGradientTo: '#f0f0f0',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: () => '#444',
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#1e90ff',
            },
          }}
          bezier
          style={{ borderRadius: 12 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  loadingContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
});
