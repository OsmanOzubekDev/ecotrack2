import { Ionicons } from '@expo/vector-icons';
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
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
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
  const [submitting, setSubmitting] = useState(false);
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
      setSubmitting(true);

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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* ÜST BAR (ForgotPassword ile aynı boşluk yapısı) */}
        <View style={styles.header}>
          {/* Login sayfası olduğundan geri butonu göstermiyoruz, boş bırakıyoruz */}
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={isLogin ? 'log-in-outline' : 'person-add-outline'}
              size={80}
              color="#3498db"
            />
          </View>

          <Text style={styles.title}>{isLogin ? 'Welcome back!' : 'Create account'}</Text>

          <Text style={styles.subtitle}>
            {isLogin
              ? "Enter your credentials to continue."
              : "Fill the fields below to set up your account."}
          </Text>

          {/* E-MAIL */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              placeholder="Enter your email address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              style={styles.input}
              editable={!submitting}
              placeholderTextColor="#95a5a6"
            />
          </View>

          {/* REGISTER alanları */}
          {!isLogin && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  placeholder="Enter a username"
                  value={username}
                  onChangeText={setUsername}
                  style={styles.input}
                  editable={!submitting}
                  placeholderTextColor="#95a5a6"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Birthdate</Text>
                <Pressable
                  onPress={() => !submitting && setShowDatePicker(true)}
                  style={[styles.input, styles.dateInput]}
                >
                  <Text style={{ color: birthdate ? '#2c3e50' : '#7f8c8d' }}>
                    {birthdate || 'Select your birthdate'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#7f8c8d" />
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
              </View>
            </>
          )}

          {/* PASSWORD */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              editable={!submitting}
              placeholderTextColor="#95a5a6"
            />
          </View>

          {/* REMEMBER ME */}
          <View style={styles.switchRow}>
            <Switch value={rememberMe} onValueChange={setRememberMe} disabled={submitting} />
            <Text style={styles.switchLabel}>Remember me</Text>
          </View>

          {/* PRIMARY BUTTON (ForgotPassword resetButton ile aynı görsel) */}
          <TouchableOpacity
            style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
            onPress={handleAuth}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name={isLogin ? 'log-in-outline' : 'person-add-outline'}
                size={20}
                color="#fff"
              />
            )}
            <Text style={styles.primaryButtonText}>
              {submitting ? (isLogin ? 'Signing in...' : 'Registering...') : isLogin ? 'Sign In' : 'Register'}
            </Text>
          </TouchableOpacity>

          {/* ALT LİNKLER */}
          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={() => !submitting && setIsLogin(!isLogin)}
            disabled={submitting}
          >
            <Text style={styles.backToLoginText}>
              {isLogin
                ? 'Don’t have an account? Register'
                : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={() => !submitting && router.push('/forgot-password')}
            disabled={submitting}
          >
            <Text style={styles.backToLoginText}>🔑 Forgot password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* === STYLES: ForgotPasswordScreen ile birebir uyum === */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // aynı
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24, // kırpma önleyici alt boşluk
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32, // fazladan boşluk, kırpmayı engeller
  },

  // INPUT BLOKLARI (aynı görsel)
  inputContainer: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#ecf0f1',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2c3e50',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // REMEMBER
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  switchLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#2c3e50',
  },

  // PRIMARY BUTTON (Forgot’daki resetButton’la aynı)
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // ALT LİNKLER (Forgot’un backToLoginButton stili)
  backToLoginButton: {
    alignItems: 'center',
    padding: 16,
  },
  backToLoginText: {
    color: '#7f8c8d',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
