import { Redirect, Slot, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthProvider';
import { requestNotificationPermissions } from '../utils/notifications';

function MainLayout() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    // Request notification permissions when the app starts
    const setupNotifications = async () => {
      try {
        console.log('Setting up notifications...');
        const granted = await requestNotificationPermissions();
        if (granted) {
          console.log('Notification permissions granted successfully');
        } else {
          console.log('Notification permissions not granted');
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
        // Don't show alert here as it might interfere with app startup
      }
    };
    
    // Delay notification setup slightly to ensure app is fully loaded
    const timer = setTimeout(setupNotifications, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) return null;

  // Kullanıcı login değilse ve login sayfasında değilse → login'e yönlendir
  if (!user && pathname !== '/login' && pathname !== '/forgot-password') {
  return <Redirect href="/login" />;
}


  // Kullanıcı login olduysa ve hala login sayfasındaysa → anasayfaya yönlendir
  if (user && pathname === '/login') {
    return <Redirect href="/" />;
  }

  // Normal olarak uygulama içeriğini göster
  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
