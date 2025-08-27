import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { auth } from '../context/firebase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePasswordReset = async () => {
    // Clear previous errors
    setError('');
    
    // Validate email
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      // Check if Firebase auth is properly initialized
      if (!auth) {
        throw new Error('Authentication service is not available. Please check your Firebase configuration.');
      }

      await sendPasswordResetEmail(auth, email.trim());
      
      setEmailSent(true);
      setError('');
      
      Alert.alert(
        'Password Reset Email Sent! 📧',
        `We've sent a password reset link to:\n\n${email.trim()}\n\nPlease check your email (including spam folder) and click the link to reset your password.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Don't navigate away immediately, let user see the success message
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'An error occurred while sending the password reset email.';
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address. Please check your email or create a new account.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'The email address is invalid. Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many password reset attempts. Please wait a few minutes before trying again.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Password reset is not enabled for this app. Please contact support.';
          break;
        default:
          if (error.message.includes('Firebase')) {
            errorMessage = 'Firebase configuration error. Please check your app configuration.';
          } else {
            errorMessage = error.message || errorMessage;
          }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/login');
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    setError('');
    setEmail('');
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#2ecc71" />
          </View>
          
          <Text style={styles.successTitle}>Check Your Email! 📧</Text>
          
          <Text style={styles.successMessage}>
            We've sent a password reset link to:
          </Text>
          
          <Text style={styles.emailText}>{email}</Text>
          
          <Text style={styles.instructions}>
            Please check your email (including spam folder) and click the link to reset your password.
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.resendButton} 
              onPress={handleResendEmail}
            >
              <Ionicons name="refresh-outline" size={20} color="#3498db" />
              <Text style={styles.resendButtonText}>Resend Email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBackToLogin}
            >
              <Ionicons name="arrow-back-outline" size={20} color="#7f8c8d" />
              <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButtonHeader} 
            onPress={handleBackToLogin}
          >
            <Ionicons name="arrow-back-outline" size={24} color="#7f8c8d" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={80} color="#3498db" />
          </View>
          
          <Text style={styles.title}>Forgot Password?</Text>
          
          <Text style={styles.subtitle}>
            No worries! Enter your email address and we'll send you a link to reset your password.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              placeholder="Enter your email address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(''); // Clear error when user types
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.input,
                error ? styles.inputError : null
              ]}
              editable={!loading}
            />
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="warning-outline" size={16} color="#e74c3c" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </View>

          <TouchableOpacity
            style={[
              styles.resetButton,
              loading ? styles.resetButtonDisabled : null
            ]}
            onPress={handlePasswordReset}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="mail-outline" size={20} color="#fff" />
            )}
            <Text style={styles.resetButtonText}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backToLoginButton} 
            onPress={handleBackToLogin}
            disabled={loading}
          >
            <Text style={styles.backToLoginText}>
              ← Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButtonHeader: {
    alignSelf: 'flex-start',
    padding: 8,
  },
  content: {
    flex: 1,
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
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 30,
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
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdf2f2',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#e74c3c',
    flex: 1,
  },
  resetButton: {
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
  resetButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backToLoginButton: {
    alignItems: 'center',
    padding: 16,
  },
  backToLoginText: {
    color: '#7f8c8d',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  // Success state styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  successIcon: {
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2ecc71',
    textAlign: 'center',
    marginBottom: 20,
  },
  successMessage: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 10,
  },
  emailText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  instructions: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3498db',
  },
  resendButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  backButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
