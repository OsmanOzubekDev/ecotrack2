import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthProvider';
import { addAchievement } from '../../src/api/achievements';

const suggestionsList = [
  "Bugün dışarıda yürüyüş yap 🌳",
  "Plastik kullanımını azalt 🛍️",
  "Su tasarrufu yap 🚿",
  "Enerji tasarruflu ampul kullan 💡",
  "Toplu taşıma tercih et 🚋",
  "Yeniden kullanılabilir şişe kullan 🚰",
];

export default function SuggestionsScreen() {
  const { user } = useAuth();
  const [suggestion, setSuggestion] = useState('');

  const getRandomSuggestion = () => {
    const randomIndex = Math.floor(Math.random() * suggestionsList.length);
    const randomSuggestion = suggestionsList[randomIndex];
    setSuggestion(randomSuggestion);
  };

  const handleAddBadge = () => {
    if (user?.uid) {
      addAchievement(user.uid, 'first_suggestion_viewed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Günün Önerisi 💡</Text>
      {suggestion ? <Text style={styles.suggestion}>{suggestion}</Text> : <Text>Henüz öneri yok</Text>}
      <View style={styles.buttonContainer}>
        <Button title="Yeni Öneri Ver" onPress={getRandomSuggestion} />
        <Button title="Rozet Ekle (Test)" onPress={handleAddBadge} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  suggestion: { fontSize: 18, textAlign: 'center', marginBottom: 20 },
  buttonContainer: {
    flexDirection: 'column',
    gap: 10,
    width: '100%',
  },
});
