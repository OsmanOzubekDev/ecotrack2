import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    requestNotificationPermissions,
    scheduleDailyNotification,
    sendNotification
} from '../../utils/notifications';

export default function NotificationTest() {
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const granted = await requestNotificationPermissions();
      setPermissionStatus(granted ? 'granted' : 'denied');
      
      // Automatically schedule daily notifications if permissions are granted
      if (granted) {
        try {
          await scheduleDailyNotification();
          console.log('Daily notifications scheduled automatically for 9:00 AM');
        } catch (error) {
          console.error('Error scheduling daily notifications:', error);
        }
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setPermissionStatus('error');
    }
  };

  const handleSendNotification = async () => {
    try {
      setLoading(true);
      await sendNotification();
      Alert.alert('Success', 'Immediate notification sent!');
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('Error', 'Failed to send notification. Please check permissions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Testing</Text>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.button, styles.primaryButton]} 
        onPress={handleSendNotification}
        disabled={loading || permissionStatus !== 'granted'}
      >
        <Text style={styles.buttonText}>Send Test Notification</Text>
      </TouchableOpacity>

      {permissionStatus === 'granted' && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Daily notifications are automatically scheduled for 9:00 AM
          </Text>
        </View>
      )}

      {permissionStatus === 'denied' && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            Notifications are disabled. Please enable them in your device settings.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    padding: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: '#4CAF50',
    fontSize: 14,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  infoText: {
    color: '#1976d2',
    fontSize: 14,
    textAlign: 'center',
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
});
