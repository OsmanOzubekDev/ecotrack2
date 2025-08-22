import { Redirect, Slot, usePathname } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthProvider';

function MainLayout() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

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
