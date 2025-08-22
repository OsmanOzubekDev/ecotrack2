import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthProvider';
import { getCarbonScores, getLatestCarbonScore, getRawCarbonScores, testFirestoreConnection } from '../../src/api/carbon';

export default function DebugInfo() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const [rawScores, setRawScores] = useState([]);

  const runDebugChecks = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    const info = {
      userId: user.uid,
      userEmail: user.email,
      timestamp: new Date().toISOString(),
    };

    try {
      // Test Firestore connection first
      console.log('Running Firestore connection test...');
      const connectionTest = await testFirestoreConnection();
      info.connectionTest = connectionTest;
      
      if (connectionTest.success) {
        // Test raw data first
        console.log('Testing raw data retrieval...');
        const rawData = await getRawCarbonScores(user.uid, 5);
        setRawScores(rawData);
        
        // Test latest score
        console.log('Testing latest score retrieval...');
        const latestScore = await getLatestCarbonScore(user.uid);
        info.latestScore = latestScore;
        
        // Test multiple scores
        console.log('Testing multiple scores retrieval...');
        const allScores = await getCarbonScores(user.uid, 10);
        info.totalScores = allScores.length;
        info.scores = allScores;
      } else {
        info.error = `Connection test failed: ${connectionTest.error}`;
      }
      
    } catch (error) {
      info.error = error.message;
      console.error('Debug check error:', error);
    } finally {
      setIsLoading(false);
      setDebugInfo(info);
    }
  };

  useFocusEffect(
    useCallback(() => {
      runDebugChecks();
    }, [user?.uid])
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Debug Info</Text>
        <Text style={styles.error}>No user authenticated</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Info</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={runDebugChecks}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Running...' : 'Refresh Debug Info'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#28a745', marginTop: 10 }]} 
        onPress={() => setShowRawData(!showRawData)}
      >
        <Text style={styles.buttonText}>
          {showRawData ? 'Hide Raw Data' : 'Show Raw Data'}
        </Text>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>User ID: {debugInfo.userId || 'N/A'}</Text>
        <Text style={styles.infoText}>Email: {debugInfo.userEmail || 'N/A'}</Text>
        
        {debugInfo.connectionTest && (
          <View style={styles.connectionInfo}>
            <Text style={styles.infoText}>
              Connection Test: {debugInfo.connectionTest.success ? '✅ Success' : '❌ Failed'}
            </Text>
            {debugInfo.connectionTest.success && (
              <Text style={styles.infoText}>
                Total Documents: {debugInfo.connectionTest.totalDocs}
              </Text>
            )}
            {!debugInfo.connectionTest.success && (
              <Text style={styles.error}>
                Connection Error: {debugInfo.connectionTest.error}
              </Text>
            )}
          </View>
        )}
        
        {debugInfo.connectionTest?.success && (
          <>
            <Text style={styles.infoText}>Total Scores: {debugInfo.totalScores || 'N/A'}</Text>
            
            {debugInfo.latestScore && (
              <View style={styles.scoreInfo}>
                <Text style={styles.infoText}>Latest Score: {debugInfo.latestScore.score} kg CO₂</Text>
                <Text style={styles.infoText}>Date: {debugInfo.latestScore.timestamp?.toString() || 'N/A'}</Text>
              </View>
            )}
            
            {debugInfo.scores && debugInfo.scores.length > 0 && (
              <View style={styles.scoresList}>
                <Text style={styles.infoText}>Recent Scores:</Text>
                {debugInfo.scores.slice(0, 3).map((score, index) => (
                  <Text key={index} style={styles.scoreItem}>
                    {score.score} kg CO₂ - {score.timestamp?.toString() || 'No date'}
                  </Text>
                ))}
              </View>
            )}
          </>
        )}
        
        {debugInfo.error && (
          <Text style={styles.error}>Error: {debugInfo.error}</Text>
        )}

        {showRawData && rawScores.length > 0 && (
          <View style={styles.rawDataContainer}>
            <Text style={styles.rawDataTitle}>Raw Database Data (First 3 scores):</Text>
            <ScrollView style={styles.rawDataScroll}>
              {rawScores.slice(0, 3).map((score, index) => (
                <View key={index} style={styles.rawDataItem}>
                  <Text style={styles.rawDataText}>Score {index + 1}:</Text>
                  <Text style={styles.rawDataText}>ID: {score.id}</Text>
                  <Text style={styles.rawDataText}>Score: {score.score}</Text>
                  <Text style={styles.rawDataText}>Raw Timestamp: {JSON.stringify(score.timestamp)}</Text>
                  <Text style={styles.rawDataText}>Timestamp type: {typeof score.timestamp}</Text>
                  <Text style={styles.rawDataText}>Is Date: {score.timestamp instanceof Date}</Text>
                  {score.timestamp && typeof score.timestamp === 'object' && (
                    <Text style={styles.rawDataText}>Keys: {Object.keys(score.timestamp).join(', ')}</Text>
                  )}
                  {score.timestamp && typeof score.timestamp === 'object' && score.timestamp.seconds !== undefined && (
                    <Text style={styles.rawDataText}>Seconds: {score.timestamp.seconds}</Text>
                  )}
                  {score.timestamp && typeof score.timestamp === 'object' && score.timestamp._seconds !== undefined && (
                    <Text style={styles.rawDataText}>_Seconds: {score.timestamp._seconds}</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    color: '#495057',
  },
  button: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
  },
  infoContainer: {
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#495057',
    fontFamily: 'monospace',
  },
  connectionInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  scoreInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
  },
  error: {
    fontSize: 14,
    color: '#dc3545',
    fontWeight: '500',
  },
  scoresList: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
  },
  scoreItem: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
    marginTop: 5,
  },
  rawDataContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  rawDataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 10,
  },
  rawDataScroll: {
    maxHeight: 200,
  },
  rawDataItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  rawDataText: {
    fontSize: 12,
    color: '#495057',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});
