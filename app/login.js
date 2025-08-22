import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { auth, db } from '../context/firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadRememberedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('rememberedEmail');
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (error) {
        console.log('AsyncStorage read error:', error);
      }
    };
    loadRememberedEmail();
  }, []);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const isoDate = selectedDate.toISOString().split('T')[0];
      setBirthdate(isoDate);
    }
  };

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && (!username || !birthdate))) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }

    try {
      if (rememberMe) {
        await AsyncStorage.setItem('rememberedEmail', email);
      } else {
        await AsyncStorage.removeItem('rememberedEmail');
      }

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        router.replace('/');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Firestore'a username ve birthdate ekle
        await setDoc(doc(db, 'users', user.uid), {
          username,
          birthdate,
          email,
          createdAt: new Date().toISOString(),
        });

        router.replace('/');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Sign In' : 'Register'}</Text>

      <TextInput
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      {!isLogin && (
        <>
          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />

          <Pressable onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text style={{ color: birthdate ? '#000' : '#888' }}>
              {birthdate || 'Select your birthdate'}
            </Text>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={birthdate ? new Date(birthdate) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </>
      )}

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button title={isLogin ? 'Sign In' : 'Register'} onPress={handleAuth} />

      <View style={styles.switchContainer}>
        <Switch value={rememberMe} onValueChange={setRememberMe} />
        <Text style={styles.switchLabel}>Remember me</Text>
      </View>

      <Text style={styles.toggle} onPress={() => setIsLogin(!isLogin)}>
        {isLogin
          ? 'Don’t have an account? Register'
          : 'Already have an account? Sign in'}
      </Text>

      <Text style={styles.forgot} onPress={() => router.push('/forgot-password')}>
        🔑 Forgot password
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  toggle: {
    color: 'blue',
    marginTop: 15,
    textAlign: 'center',
    fontSize: 14,
  },
  forgot: {
    color: 'blue',
    marginTop: 10,
    textAlign: 'center',
    fontSize: 13,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  switchLabel: {
    marginLeft: 10,
    fontSize: 14,
  },
});
