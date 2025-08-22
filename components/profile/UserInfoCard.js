import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthProvider';
import { saveUserProfile } from '../../src/api/profile';

export default function UserInfoCard({ username, email, birthdate, onUsernameUpdate, onBirthdateUpdate }) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState(username || '');
  const [editedBirthdate, setEditedBirthdate] = useState(birthdate || '');
  const [isSaving, setIsSaving] = useState(false);

  // Debug logging
  console.log('UserInfoCard props:', { username, email, birthdate });

  const displayName = username || email?.split('@')[0] || 'EcoTracker';

  const handleEdit = () => {
    setEditedUsername(username || '');
    setEditedBirthdate(birthdate || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedUsername.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    if (editedUsername.trim() === username && editedBirthdate === birthdate) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {};
      if (editedUsername.trim() !== username) {
        updateData.username = editedUsername.trim();
      }
      if (editedBirthdate !== birthdate) {
        updateData.birthdate = editedBirthdate;
      }
      
      await saveUserProfile(user.uid, updateData);
      
      if (editedUsername.trim() !== username) {
        onUsernameUpdate?.(editedUsername.trim());
      }
      if (editedBirthdate !== birthdate) {
        onBirthdateUpdate?.(editedBirthdate);
      }
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedUsername(username || '');
    setEditedBirthdate(birthdate || '');
    setIsEditing(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{displayName}</Text>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={isEditing ? handleSave : handleEdit}
          disabled={isSaving}
        >
          <Ionicons 
            name={isEditing ? "checkmark" : "pencil"} 
            size={20} 
            color={isEditing ? "#4CAF50" : "#666"} 
          />
        </TouchableOpacity>
      </View>
      
      {isEditing ? (
        <View style={styles.editContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username:</Text>
            <TextInput
              style={styles.input}
              value={editedUsername}
              onChangeText={setEditedUsername}
              placeholder="Enter username"
              maxLength={20}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Birthdate:</Text>
            <TextInput
              style={styles.input}
              value={editedBirthdate}
              onChangeText={setEditedBirthdate}
              placeholder="Enter birthdate"
              maxLength={50}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleCancel}
            disabled={isSaving}
          >
            <Ionicons name="close" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.infoContainer}>
          <Text style={styles.email}>{email}</Text>
          <Text style={[styles.birthdate, { fontWeight: 'bold', color: '#4CAF50' }]}>
            🎂 Birthdate: {birthdate || 'Not set'}
          </Text>
        </View>
      )}
      
      {isSaving && (
        <Text style={styles.savingText}>Saving...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  editContainer: {
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
  },
  cancelButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#ffebee',
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  infoContainer: {
    marginTop: 4,
  },
  email: {
    color: '#555',
    marginBottom: 4,
  },
  birthdate: {
    color: '#555',
    fontSize: 14,
  },
  savingText: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
});
