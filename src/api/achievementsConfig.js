export const ACHIEVEMENTS = {
  // Carbon Score Based Achievements (Weekly/Monthly targets)
  CARBON_MASTER: {
    id: 'carbon_master',
    title: 'Weekly Carbon Master',
    description: 'Achieve 3 weekly averages below 70 kg CO2',
    icon: '🌱',
    type: 'carbon_score',
    target: 3,
    threshold: 70.0,
    category: 'carbon',
    period: 'weekly'
  },
  
  ECO_WARRIOR: {
    id: 'eco_warrior',
    title: 'Weekly Eco Warrior',
    description: 'Achieve 4 weekly averages below 80 kg CO2',
    icon: '🛡️',
    type: 'carbon_score',
    target: 4,
    threshold: 80.0,
    category: 'carbon',
    period: 'weekly'
  },
  
  CLIMATE_CHAMPION: {
    id: 'climate_champion',
    title: 'Weekly Climate Champion',
    description: 'Achieve 8 weekly averages below 90 kg CO2',
    icon: '🏆',
    type: 'carbon_score',
    target: 8,
    threshold: 90.0,
    category: 'carbon',
    period: 'weekly'
  },
  
  SUSTAINABILITY_EXPERT: {
    id: 'sustainability_expert',
    title: 'Weekly Sustainability Expert',
    description: 'Achieve 6 weekly averages below 75 kg CO2',
    icon: '🎓',
    type: 'carbon_score',
    target: 6,
    threshold: 75.0,
    category: 'carbon',
    period: 'weekly'
  },
  
  GREEN_PIONEER: {
    id: 'green_pioneer',
    title: 'Weekly Green Pioneer',
    description: 'Achieve 2 weekly averages below 50 kg CO2',
    icon: '👣',
    type: 'carbon_score',
    target: 2,
    threshold: 50.0,
    category: 'carbon',
    period: 'weekly'
  },
  
  // Easier achievements for better engagement
  BEGINNER_SAVER: {
    id: 'beginner_saver',
    title: 'Weekly Beginner Saver',
    description: 'Achieve 1 weekly average below 100 kg CO2',
    icon: '🌿',
    type: 'carbon_score',
    target: 1,
    threshold: 100.0,
    category: 'carbon',
    period: 'weekly'
  },
  
  MODERATE_ACHIEVER: {
    id: 'moderate_achiever',
    title: 'Weekly Moderate Achiever',
    description: 'Achieve 2 weekly averages below 85 kg CO2',
    icon: '🌍',
    type: 'carbon_score',
    target: 2,
    threshold: 85.0,
    category: 'carbon',
    period: 'weekly'
  },
  
  // Consistency Achievements (Weekly/Monthly tracking)
  CONSISTENT_SAVER: {
    id: 'consistent_saver',
    title: 'Weekly Consistent Saver',
    description: 'Track carbon footprint for 4 consecutive weeks',
    icon: '📅',
    type: 'streak',
    target: 4,
    category: 'consistency',
    period: 'weekly'
  },
  
  DEDICATED_TRACKER: {
    id: 'dedicated_tracker',
    title: 'Monthly Dedicated Tracker',
    description: 'Track carbon footprint for 3 consecutive months',
    icon: '💪',
    type: 'streak',
    target: 3,
    category: 'consistency',
    period: 'monthly'
  },
  
  WEEKLY_TRACKER: {
    id: 'weekly_tracker',
    title: 'Weekly Tracker',
    description: 'Track carbon footprint for 2 consecutive weeks',
    icon: '📊',
    type: 'streak',
    target: 2,
    category: 'consistency',
    period: 'weekly'
  },
  
  // Milestone Achievements (Adjusted for weekly/monthly tracking)
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
  
  // Special Achievements
  IMPROVEMENT_MASTER: {
    id: 'improvement_master',
    title: 'Weekly Improvement Master',
    description: 'Reduce your weekly average by 30% from your first week',
    icon: '📈',
    type: 'improvement',
    target: 30,
    category: 'special',
    period: 'weekly'
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
