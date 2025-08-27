# 🔥 Firebase Setup Guide for EcoTrack

This guide will help you set up Firebase properly so that password reset emails work correctly.

## 🚨 **IMPORTANT: Why Password Reset Isn't Working**

The password reset functionality is not working because:
1. **Firebase is not properly configured** in your app
2. **Missing or invalid Firebase credentials** in your configuration
3. **Firebase project settings** may not have password reset enabled

## 📋 **Step-by-Step Setup**

### **Step 1: Create/Configure Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** or select your existing project
3. Give your project a name (e.g., "EcoTrack")
4. Enable Google Analytics (optional but recommended)
5. Click **"Create project"**

### **Step 2: Add Your App to Firebase**

1. In your Firebase project, click **"Add app"** (</> icon)
2. Choose **"Web"** platform
3. Give your app a nickname (e.g., "EcoTrack Web")
4. **DO NOT** check "Also set up Firebase Hosting"
5. Click **"Register app"**

### **Step 3: Get Your Firebase Configuration**

After registering your app, you'll see a configuration object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

**Copy these values - you'll need them in the next step!**

### **Step 4: Update Your App Configuration**

Open `app.config.js` and replace the placeholder values with your actual Firebase credentials:

```javascript
import 'dotenv/config';

export default {
  expo: {
    name: "EcoTrack",
    slug: "ecotrack",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    extra: {
      // Replace these with your actual Firebase values from Step 3
      FIREBASE_API_KEY: "AIzaSyC...", // Your actual API key
      FIREBASE_AUTH_DOMAIN: "your-project.firebaseapp.com", // Your actual domain
      FIREBASE_PROJECT_ID: "your-project", // Your actual project ID
      FIREBASE_STORAGE_BUCKET: "your-project.appspot.com", // Your actual bucket
      FIREBASE_MESSAGING_SENDER_ID: "123456789", // Your actual sender ID
      FIREBASE_APP_ID: "1:123456789:web:abc123def456", // Your actual app ID
    },
    plugins: [
      "expo-router"
    ]
  }
};
```

### **Step 5: Enable Authentication in Firebase**

1. In Firebase Console, go to **"Authentication"** (left sidebar)
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"** provider
5. **IMPORTANT**: Make sure **"Email link (passwordless sign-in)"** is enabled
6. Click **"Save"**

### **Step 6: Configure Password Reset Email Template**

1. In Authentication > **"Templates"** tab
2. Click **"Password reset"**
3. Customize the email template if desired:
   - **Subject**: "Reset your EcoTrack password"
   - **Sender name**: "EcoTrack Team"
   - **Action URL**: Leave as default (Firebase handles this)
4. Click **"Save"**

### **Step 7: Test the Configuration**

1. **Restart your Expo development server**:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart
   npx expo start
   ```

2. **Check the console** for Firebase initialization messages:
   ```
   ✅ Firebase initialized successfully
   📱 Project ID: your-project
   🔐 Auth Domain: your-project.firebaseapp.com
   ```

3. **Test password reset**:
   - Go to Forgot Password screen
   - Enter a valid email address
   - Click "Send Reset Link"
   - Check your email (including spam folder)

## 🔧 **Troubleshooting**

### **Problem: "Firebase Configuration Error" in console**

**Solution**: You haven't updated the Firebase credentials in `app.config.js`

### **Problem: "Authentication service is not available"**

**Solution**: Firebase failed to initialize. Check your credentials and restart the app.

### **Problem: "No account found with this email address"**

**Solution**: The email doesn't exist in your Firebase project. Create an account first.

### **Problem: "Password reset is not enabled"**

**Solution**: Go to Firebase Console > Authentication > Sign-in method > Email/Password and enable password reset.

### **Problem: Email not received**

**Solutions**:
1. Check **spam folder**
2. Verify email address is correct
3. Wait a few minutes (Firebase can take time)
4. Check Firebase Console > Authentication > Users for any errors

## 📱 **Environment Variables (Alternative Method)**

If you prefer using environment variables instead of hardcoding:

1. Create a `.env` file in your project root:
   ```bash
   FIREBASE_API_KEY=your_actual_api_key
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project
   FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=123456789
   FIREBASE_APP_ID=1:123456789:web:abc123def456
   ```

2. Make sure `app.config.js` reads from environment variables:
   ```javascript
   extra: {
     FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
     FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
     // ... etc
   }
   ```

## 🧪 **Testing Password Reset**

1. **Create a test account**:
   - Go to Login screen
   - Click "Create Account"
   - Use a real email address you can access

2. **Test password reset**:
   - Go to Forgot Password
   - Enter the test email
   - Check for reset email

3. **Verify reset link works**:
   - Click the link in the email
   - Set a new password
   - Try logging in with the new password

## 🔒 **Security Notes**

- **Never commit** your Firebase API keys to public repositories
- Use **environment variables** in production
- **Restrict API key usage** in Google Cloud Console
- **Monitor authentication** in Firebase Console

## 📞 **Getting Help**

If you're still having issues:

1. **Check Firebase Console** for error messages
2. **Look at your app console** for Firebase initialization errors
3. **Verify all credentials** are copied correctly
4. **Ensure password reset is enabled** in Firebase Authentication
5. **Check your email spam folder**

## 🎯 **Quick Checklist**

- [ ] Firebase project created
- [ ] Web app added to Firebase
- [ ] Configuration copied to `app.config.js`
- [ ] Authentication enabled
- [ ] Password reset enabled
- [ ] App restarted
- [ ] Console shows "Firebase initialized successfully"
- [ ] Test account created
- [ ] Password reset email received

Once you complete these steps, the password reset functionality should work perfectly! 🎉

---

**Need more help?** Check the Firebase documentation: [https://firebase.google.com/docs/auth](https://firebase.google.com/docs/auth)
