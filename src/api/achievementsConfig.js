export const ACHIEVEMENTS = {
  // Carbon Score Based Achievements
  CARBON_MASTER: {
    id: 'carbon_master',
    title: 'Carbon Master',
    description: 'Achieve 5 scores below 5.0 kg CO2',
    icon: '🌱',
    type: 'carbon_score',
    target: 5,
    threshold: 5.0,
    category: 'carbon'
  },
  
  ECO_WARRIOR: {
    id: 'eco_warrior',
    title: 'Eco Warrior',
    description: 'Achieve 10 scores below 7.0 kg CO2',
    icon: '🛡️',
    type: 'carbon_score',
    target: 10,
    threshold: 7.0,
    category: 'carbon'
  },
  
  CLIMATE_CHAMPION: {
    id: 'climate_champion',
    title: 'Climate Champion',
    description: 'Achieve 20 scores below 8.0 kg CO2',
    icon: '🏆',
    type: 'carbon_score',
    target: 20,
    threshold: 8.0,
    category: 'carbon'
  },
  
  SUSTAINABILITY_EXPERT: {
    id: 'sustainability_expert',
    title: 'Sustainability Expert',
    description: 'Achieve 15 scores below 6.0 kg CO2',
    icon: '🎓',
    type: 'carbon_score',
    target: 15,
    threshold: 6.0,
    category: 'carbon'
  },
  
  GREEN_PIONEER: {
    id: 'green_pioneer',
    title: 'Green Pioneer',
    description: 'Achieve 3 scores below 4.0 kg CO2',
    icon: '🚀',
    type: 'carbon_score',
    target: 3,
    threshold: 4.0,
    category: 'carbon'
  },
  
  // Easier achievements for better engagement
  BEGINNER_SAVER: {
    id: 'beginner_saver',
    title: 'Beginner Saver',
    description: 'Achieve 2 scores below 6.0 kg CO2',
    icon: '🌿',
    type: 'carbon_score',
    target: 2,
    threshold: 6.0,
    category: 'carbon'
  },
  
  MODERATE_ACHIEVER: {
    id: 'moderate_achiever',
    title: 'Moderate Achiever',
    description: 'Achieve 3 scores below 7.0 kg CO2',
    icon: '🌍',
    type: 'carbon_score',
    target: 3,
    threshold: 7.0,
    category: 'carbon'
  },
  
  // Consistency Achievements
  CONSISTENT_SAVER: {
    id: 'consistent_saver',
    title: 'Consistent Saver',
    description: 'Track carbon footprint for 7 consecutive days',
    icon: '📅',
    type: 'streak',
    target: 7,
    category: 'consistency'
  },
  
  DEDICATED_TRACKER: {
    id: 'dedicated_tracker',
    title: 'Dedicated Tracker',
    description: 'Track carbon footprint for 30 consecutive days',
    icon: '💪',
    type: 'streak',
    target: 30,
    category: 'consistency'
  },
  
  WEEKLY_TRACKER: {
    id: 'weekly_tracker',
    title: 'Weekly Tracker',
    description: 'Track carbon footprint for 3 consecutive days',
    icon: '📊',
    type: 'streak',
    target: 3,
    category: 'consistency'
  },
  
  // Milestone Achievements
  FIRST_STEP: {
    id: 'first_step',
    title: 'First Step',
    description: 'Complete your first carbon footprint calculation',
    icon: '👣',
    type: 'milestone',
    target: 1,
    category: 'milestone'
  },
  
  HUNDRED_CLUB: {
    id: 'hundred_club',
    title: '100 Club',
    description: 'Complete 100 carbon footprint calculations',
    icon: '💯',
    type: 'milestone',
    target: 100,
    category: 'milestone'
  },
  
  TEN_CLUB: {
    id: 'ten_club',
    title: '10 Club',
    description: 'Complete 10 carbon footprint calculations',
    icon: '🔟',
    type: 'milestone',
    target: 10,
    category: 'milestone'
  },
  
  // Special Achievements
  PERFECT_SCORE: {
    id: 'perfect_score',
    title: 'Perfect Score',
    description: 'Achieve a carbon score below 2.0 kg CO2',
    icon: '⭐',
    type: 'special',
    target: 1,
    threshold: 2.0,
    category: 'special'
  },
  
  IMPROVEMENT_MASTER: {
    id: 'improvement_master',
    title: 'Improvement Master',
    description: 'Reduce your carbon score by 50% from your first score',
    icon: '📈',
    type: 'improvement',
    target: 50,
    category: 'special'
  },
  
  LOW_CARBON_HERO: {
    id: 'low_carbon_hero',
    title: 'Low Carbon Hero',
    description: 'Achieve a carbon score below 3.0 kg CO2',
    icon: '🦸',
    type: 'special',
    target: 1,
    threshold: 3.0,
    category: 'special'
  }
};

export const getAchievementById = (id) => {
  return ACHIEVEMENTS[id] || null;
};

export const getAllAchievements = () => {
  return Object.values(ACHIEVEMENTS);
};

export const getAchievementsByCategory = (category) => {
  return Object.values(ACHIEVEMENTS).filter(achievement => achievement.category === category);
};
