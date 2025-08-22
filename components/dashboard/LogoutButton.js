import { Button, StyleSheet, View } from 'react-native';
import { useAuth } from '../../context/AuthProvider';

export default function LogoutButton() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Button title="Çıkış Yap" onPress={logout} color="#ff3b30" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: 'center',
  },
});
