import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../context/AuthProvider';
import { getRawCarbonScores } from '../../src/api/carbon';
import { getUserProfile } from '../../src/api/user';

export default function SuggestionsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [latestCarbonScore, setLatestCarbonScore] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch user data and generate suggestions
  useEffect(() => {
    if (user?.uid) {
      fetchUserData();
    }
  }, [user?.uid]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get user profile and latest carbon score
      const [profile, carbonScores] = await Promise.all([
        getUserProfile(user.uid),
        getRawCarbonScores(user.uid, 1)
      ]);
      
      setUserProfile(profile);
      setLatestCarbonScore(carbonScores[0] || null);
      
      // Generate personalized suggestions
      if (carbonScores[0]) {
        const personalizedSuggestions = generatePersonalizedSuggestions(carbonScores[0]);
        setSuggestions(personalizedSuggestions);
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  // Generate personalized suggestions based on carbon data
  const generatePersonalizedSuggestions = (carbonData) => {
    const suggestions = [];
    const { breakdown, weekly } = carbonData.details || {};
    
    if (!breakdown) return getDefaultSuggestions();

    // Energy suggestions
    if (breakdown.electricity > 15) {
      suggestions.push({
        id: 'elec_1',
        category: 'energy',
        title: 'Switch to LED Bulbs',
        description: 'Replace traditional bulbs with LED equivalents to reduce electricity consumption by up to 80%.',
        impact: 'High',
        estimatedReduction: '8-15 kg CO₂e/week',
        icon: 'bulb-outline',
        priority: 1
      });
    }
    
    if (breakdown.gas > 8) {
      suggestions.push({
        id: 'gas_1',
        category: 'energy',
        title: 'Optimize Heating',
        description: 'Lower your thermostat by 1-2°C and use a programmable thermostat to save on gas heating.',
        impact: 'Medium',
        estimatedReduction: '5-12 kg CO₂e/week',
        icon: 'thermometer-outline',
        priority: 2
      });
    }

    // Transport suggestions
    if (breakdown.car > 20) {
      suggestions.push({
        id: 'car_1',
        category: 'transport',
        title: 'Carpool or Use Public Transport',
        description: 'Share rides or switch to public transport for 2-3 days per week to significantly reduce car emissions.',
        impact: 'High',
        estimatedReduction: '25-45 kg CO₂e/week',
        icon: 'car-outline',
        priority: 1
      });
    }

    if (breakdown.flights > 5) {
      suggestions.push({
        id: 'flight_1',
        category: 'transport',
        title: 'Consider Alternative Travel',
        description: 'For short trips, consider train or bus instead of flights. Each avoided flight saves significant emissions.',
        impact: 'Very High',
        estimatedReduction: '50-100 kg CO₂e/week',
        icon: 'airplane-outline',
        priority: 1
      });
    }

    // Food suggestions
    if (breakdown.redMeat > 10) {
      suggestions.push({
        id: 'food_1',
        category: 'food',
        title: 'Reduce Red Meat Consumption',
        description: 'Try meatless Mondays or substitute red meat with poultry/fish 2-3 times per week.',
        impact: 'High',
        estimatedReduction: '15-30 kg CO₂e/week',
        icon: 'restaurant-outline',
        priority: 2
      });
    }

    if (breakdown.dairy > 5) {
      suggestions.push({
        id: 'food_2',
        category: 'food',
        title: 'Choose Plant-Based Alternatives',
        description: 'Try oat milk, almond milk, or other plant-based dairy alternatives for some meals.',
        impact: 'Medium',
        estimatedReduction: '8-15 kg CO₂e/week',
        icon: 'leaf-outline',
        priority: 3
      });
    }

    // Shopping suggestions
    if (breakdown.clothes > 2) {
      suggestions.push({
        id: 'shop_1',
        category: 'shopping',
        title: 'Buy Second-Hand or Sustainable',
        description: 'Consider second-hand clothing or sustainable brands. Each avoided new item saves resources.',
        impact: 'Medium',
        estimatedReduction: '5-12 kg CO₂e/week',
        icon: 'shirt-outline',
        priority: 3
      });
    }

    // Waste suggestions
    if (!carbonData.details?.recycling || carbonData.details?.recycling === 'no') {
      suggestions.push({
        id: 'waste_1',
        category: 'waste',
        title: 'Start Recycling',
        description: 'Set up a recycling system at home. Separate paper, plastic, glass, and metal waste.',
        impact: 'Medium',
        estimatedReduction: '8-18 kg CO₂e/week',
        icon: 'reload-outline',
        priority: 2
      });
    }

    if (!carbonData.details?.composting || carbonData.details?.composting === 'no') {
      suggestions.push({
        id: 'waste_2',
        category: 'waste',
        title: 'Start Composting',
        description: 'Compost food scraps to reduce methane emissions from landfills and create nutrient-rich soil.',
        impact: 'Medium',
        estimatedReduction: '12-25 kg CO₂e/week',
        icon: 'leaf-outline',
        priority: 2
      });
    }

    // General lifestyle suggestions based on total score
    if (weekly > 100) {
      suggestions.push({
        id: 'lifestyle_1',
        category: 'lifestyle',
        title: 'Audit Your Daily Habits',
        description: 'Your carbon footprint is above average. Consider a comprehensive lifestyle audit to identify major emission sources.',
        impact: 'Very High',
        estimatedReduction: '40-80 kg CO₂e/week',
        icon: 'analytics-outline',
        priority: 1
      });
    } else if (weekly < 50) {
      suggestions.push({
        id: 'lifestyle_2',
        category: 'lifestyle',
        title: 'Great Job!',
        description: 'You\'re already doing excellent! Consider sharing your sustainable practices with friends and family.',
        impact: 'Inspirational',
        estimatedReduction: 'N/A',
        icon: 'trophy-outline',
        priority: 4
      });
    }

    // Sort by priority and return top suggestions
    return suggestions
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 8);
  };

  const getDefaultSuggestions = () => {
    return [
      {
        id: 'default_1',
        category: 'general',
        title: 'Calculate Your Carbon Footprint',
        description: 'Complete the carbon calculator to get personalized suggestions based on your lifestyle.',
        impact: 'Information',
        estimatedReduction: 'N/A',
        icon: 'calculator-outline',
        priority: 1
      }
    ];
  };

  const getCategoryIcon = (category) => {
    const icons = {
      energy: 'flash-outline',
      transport: 'car-outline',
      food: 'restaurant-outline',
      shopping: 'bag-outline',
      waste: 'reload-outline',
      lifestyle: 'heart-outline',
      general: 'information-circle-outline'
    };
    return icons[category] || 'help-circle-outline';
  };

  const getImpactColor = (impact) => {
    const colors = {
      'Very High': '#e74c3c',
      'High': '#f39c12',
      'Medium': '#3498db',
      'Low': '#27ae60',
      'Information': '#95a5a6',
      'Inspirational': '#9b59b6'
    };
    return colors[impact] || '#95a5a6';
  };

  const getCategoryColor = (category) => {
    const colors = {
      energy: '#f39c12',
      transport: '#e74c3c',
      food: '#27ae60',
      shopping: '#9b59b6',
      waste: '#3498db',
      lifestyle: '#e67e22',
      general: '#95a5a6'
    };
    return colors[category] || '#95a5a6';
  };

  const filteredSuggestions = selectedCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category === selectedCategory);

  const categories = [
    { key: 'all', label: 'All', icon: 'apps-outline' },
    { key: 'energy', label: 'Energy', icon: 'flash-outline' },
    { key: 'transport', label: 'Transport', icon: 'car-outline' },
    { key: 'food', label: 'Food', icon: 'restaurant-outline' },
    { key: 'shopping', label: 'Shopping', icon: 'bag-outline' },
    { key: 'waste', label: 'Waste', icon: 'reload-outline' },
    { key: 'lifestyle', label: 'Lifestyle', icon: 'heart-outline' }
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Loading your personalized suggestions...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🌱 Personalized Suggestions</Text>
        <Text style={styles.subtitle}>
          Based on your carbon footprint and lifestyle choices
        </Text>
      </View>

      {/* Carbon Score Summary */}
      {latestCarbonScore && (
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>Your Latest Carbon Footprint</Text>
          <Text style={styles.scoreValue}>
            {latestCarbonScore.score?.toFixed(1) || 'N/A'} kg CO₂e/week
          </Text>
          <Text style={styles.scoreSubtitle}>
            {latestCarbonScore.score > 100 ? 'Above average - lots of room for improvement!' :
             latestCarbonScore.score > 50 ? 'Good effort - keep it up!' :
             'Excellent! You\'re doing great!'}
          </Text>
        </View>
      )}

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                selectedCategory === category.key && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Ionicons 
                name={category.icon} 
                size={20} 
                color={selectedCategory === category.key ? '#fff' : '#2c3e50'} 
              />
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category.key && styles.categoryButtonTextActive
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Suggestions List */}
      <View style={styles.suggestionsContainer}>
        {filteredSuggestions.length > 0 ? (
          filteredSuggestions.map((suggestion) => (
            <View key={suggestion.id} style={styles.suggestionCard}>
              <View style={styles.suggestionHeader}>
                <View style={[
                  styles.categoryBadge,
                  { backgroundColor: getCategoryColor(suggestion.category) }
                ]}>
                  <Ionicons 
                    name={getCategoryIcon(suggestion.category)} 
                    size={16} 
                    color="#fff" 
                  />
                </View>
                <View style={styles.impactContainer}>
                  <Text style={[
                    styles.impactText,
                    { color: getImpactColor(suggestion.impact) }
                  ]}>
                    {suggestion.impact}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
              <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
              
              {suggestion.estimatedReduction !== 'N/A' && (
                <View style={styles.reductionContainer}>
                  <Ionicons name="trending-down-outline" size={16} color="#27ae60" />
                  <Text style={styles.reductionText}>
                    Potential reduction: {suggestion.estimatedReduction}
                  </Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="leaf-outline" size={48} color="#bdc3c7" />
            <Text style={styles.emptyStateText}>No suggestions available</Text>
            <Text style={styles.emptyStateSubtext}>
              Complete the carbon calculator to get personalized suggestions
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    padding: 20,
    paddingTop: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 22,
  },
  scoreCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreTitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 8,
  },
  scoreSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  categoryButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  suggestionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  impactContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  impactText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    lineHeight: 24,
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#5a6c7d',
    lineHeight: 20,
    marginBottom: 16,
  },
  reductionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  reductionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f8c8d',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    textAlign: 'center',
    lineHeight: 20,
  },
});
