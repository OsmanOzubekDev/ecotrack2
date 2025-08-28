import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';


try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (error) {
  console.error('Error setting notification handler:', error);
}


export async function requestNotificationPermissions() {
  try {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return false;
      }
      
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
      
      return true;
    } else {
      console.log('Must use physical device for Push Notifications');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

// Send immediate notification (for testing)
export async function sendNotification() {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "EcoTrack Reminder",
        body: "Don't forget to track your carbon footprint today!",
        data: { type: 'immediate' },
      },
      trigger: null, 
    });
    console.log('Immediate notification sent successfully');
  } catch (error) {
    console.error('Error sending immediate notification:', error);
    throw error; 
  }
}

// Schedule daily notification at 9:00 AM
export async function scheduleDailyNotification() {
  try {
    
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "EcoTrack Reminder",
        body: "Don't forget to track your carbon footprint today!",
        data: { type: 'daily' },
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
    console.log('Daily notification scheduled successfully for 9:00 AM');
  } catch (error) {
    console.error('Error scheduling daily notification:', error);
    throw error; 
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled successfully');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
    throw error; 
  }
}

// Get all scheduled notifications
export async function getScheduledNotifications() {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}
