import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthProvider';
import { checkAchievementProgress } from '../../src/api/achievements';

export default function AchievementsDisplay() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (user?.uid) {
      fetchAchievements();
    }
  }, [user?.uid]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const progressData = await checkAchievementProgress(user.uid);
      setAchievements(progressData);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All', icon: '🏆' },
    { id: 'carbon', name: 'Carbon', icon: '🌱' },
    { id: 'consistency', name: 'Consistency', icon: '📅' },
    { id: 'milestone', name: 'Milestones', icon: '🎯' },
    { id: 'special', name: 'Special', icon: '⭐' }
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(achievement => achievement.category === selectedCategory);

  const unlockedAchievements = filteredAchievements.filter(achievement => achievement.isUnlocked);
  const lockedAchievements = filteredAchievements.filter(achievement => !achievement.isUnlocked);

  const renderProgressBar = (progress, current, target) => {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {current}/{target} ({Math.round(progress)}%)
        </Text>
      </View>
    );
  };

  const renderAchievement = (achievement, isUnlocked) => (
    <View key={achievement.id} style={[
      styles.achievementCard,
      isUnlocked ? styles.unlockedCard : styles.lockedCard
    ]}>
      <View style={styles.achievementHeader}>
        <View style={[
          styles.achievementIconContainer,
          isUnlocked ? styles.unlockedIconContainer : styles.lockedIconContainer
        ]}>
          <Text style={styles.achievementIcon}>{achievement.icon}</Text>
        </View>
        <View style={styles.achievementInfo}>
          <Text style={[
            styles.achievementTitle,
            isUnlocked ? styles.unlockedTitle : styles.lockedTitle
          ]}>
            {achievement.title}
          </Text>
          <Text style={[
            styles.achievementDescription,
            isUnlocked ? styles.unlockedDescription : styles.lockedDescription
          ]}>
            {achievement.description}
          </Text>
        </View>
        {isUnlocked && (
          <View style={styles.unlockBadge}>
            <Text style={styles.unlockText}>✓</Text>
          </View>
        )}
      </View>
      
      {!isUnlocked && (
        <View style={styles.progressSection}>
          {renderProgressBar(achievement.progress, achievement.current, achievement.target)}
        </View>
      )}
      
      {isUnlocked && (
        <View style={styles.completionSection}>
          <Text style={styles.completionText}>🎉 Achievement Unlocked!</Text>
          <Text style={styles.completionDate}>Completed recently</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading achievements...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategory
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.selectedCategoryText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Achievements */}
      <ScrollView style={styles.achievementsContainer} showsVerticalScrollIndicator={false}>
        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                🎉 Completed Achievements
              </Text>
              <View style={styles.achievementCount}>
                <Text style={styles.achievementCountText}>{unlockedAchievements.length}</Text>
              </View>
            </View>
            {unlockedAchievements.map(achievement => 
              renderAchievement(achievement, true)
            )}
          </View>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                🔒 In Progress Achievements
              </Text>
              <View style={styles.achievementCount}>
                <Text style={styles.achievementCountText}>{lockedAchievements.length}</Text>
              </View>
            </View>
            {lockedAchievements.map(achievement => 
              renderAchievement(achievement, false)
            )}
          </View>
        )}

        {/* No Achievements */}
        {filteredAchievements.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No achievements found for this category</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  
  // Category Filter
  categoryContainer: {
    marginBottom: 20,
  },
  categoryContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCategory: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  
  // Achievements Container
  achievementsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  achievementCount: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  achievementCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Achievement Cards
  achievementCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  unlockedCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
  },
  lockedCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
    opacity: 0.9,
  },
  
  // Achievement Header
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  unlockedIconContainer: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  lockedIconContainer: {
    backgroundColor: '#e0e0e0',
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  unlockedTitle: {
    color: '#2E7D32',
  },
  lockedTitle: {
    color: '#666',
  },
  achievementDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  unlockedDescription: {
    color: '#388E3C',
  },
  lockedDescription: {
    color: '#999',
  },
  unlockBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  unlockText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Progress Section
  progressSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Completion Section
  completionSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#4CAF50',
    alignItems: 'center',
  },
  completionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  completionDate: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
