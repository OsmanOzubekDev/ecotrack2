# Achievements System Documentation

## Overview
The Ecotrack app now includes a comprehensive achievements system that rewards users for their carbon footprint tracking efforts and sustainable choices.

## Achievement Categories

### 🌱 Carbon Score Achievements
- **Beginner Saver**: Achieve 2 scores below 6.0 kg CO2
- **Moderate Achiever**: Achieve 3 scores below 7.0 kg CO2
- **Green Pioneer**: Achieve 3 scores below 4.0 kg CO2
- **Carbon Master**: Achieve 5 scores below 5.0 kg CO2
- **Sustainability Expert**: Achieve 15 scores below 6.0 kg CO2
- **Eco Warrior**: Achieve 10 scores below 7.0 kg CO2
- **Climate Champion**: Achieve 20 scores below 8.0 kg CO2

### 📅 Consistency Achievements
- **Weekly Tracker**: Track carbon footprint for 3 consecutive days
- **Consistent Saver**: Track carbon footprint for 7 consecutive days
- **Dedicated Tracker**: Track carbon footprint for 30 consecutive days

### 🎯 Milestone Achievements
- **First Step**: Complete your first carbon footprint calculation
- **10 Club**: Complete 10 carbon footprint calculations
- **100 Club**: Complete 100 carbon footprint calculations

### ⭐ Special Achievements
- **Low Carbon Hero**: Achieve a carbon score below 3.0 kg CO2
- **Perfect Score**: Achieve a carbon score below 2.0 kg CO2
- **Improvement Master**: Reduce your carbon score by 50% from your first score

## How It Works

### Automatic Achievement Checking
- Achievements are automatically checked and awarded when users submit carbon scores
- The system tracks progress across all achievement types
- Users receive immediate feedback when new achievements are unlocked

### Progress Tracking
- Each achievement shows current progress with a visual progress bar
- Progress is calculated based on:
  - Carbon scores below specific thresholds
  - Consecutive days of tracking
  - Total number of calculations
  - Score improvements over time

### User Interface
- **Unlocked Achievements**: Displayed with green checkmarks and full opacity
- **Locked Achievements**: Displayed with progress bars showing completion percentage
- **Category Filtering**: Users can filter achievements by category (All, Carbon, Consistency, Milestones, Special)
- **Progress Visualization**: Clear progress bars and percentage indicators for locked achievements

## Technical Implementation

### Files Modified/Created
1. **`src/api/achievementsConfig.js`** - Achievement definitions and configuration
2. **`src/api/achievements.js`** - Enhanced API with progress tracking and auto-awarding
3. **`components/profile/AchievementsDisplay.js`** - New achievements display component
4. **`app/(tabs)/profile.js`** - Updated to use new achievements system
5. **`components/profile/UserStats.js`** - Updated to show accurate achievement counts
6. **`app/(tabs)/carbonform.js`** - Integrated achievement checking on score submission

### Key Functions
- `checkAchievementProgress(uid)` - Calculates progress for all achievements
- `checkAndAwardAchievements(uid)` - Automatically awards completed achievements
- `awardFirstStepAchievement(uid)` - Awards first step achievement on first submission

### Data Structure
Each achievement includes:
- `id`: Unique identifier
- `title`: Display name
- `description`: Achievement requirements
- `icon`: Emoji representation
- `type`: Achievement type (carbon_score, streak, milestone, special)
- `target`: Required count/threshold
- `threshold`: Carbon score threshold (for score-based achievements)
- `category`: Achievement category for filtering

## User Experience

### Achievement Unlocking
1. User submits carbon footprint calculation
2. System automatically checks all achievement criteria
3. New achievements are immediately awarded
4. Success message shows newly unlocked achievements
5. Profile page updates to reflect new progress

### Visual Feedback
- Progress bars for locked achievements
- Clear distinction between unlocked and locked achievements
- Category-based organization
- Achievement counts and progress indicators

### Motivation
- Immediate feedback on achievements
- Clear progress tracking toward goals
- Multiple achievement types for different user behaviors
- Gradual difficulty progression from easy to challenging

## Future Enhancements
- Achievement sharing on social media
- Achievement-based leaderboards
- Custom achievement creation
- Achievement expiration dates
- Seasonal or event-based achievements
- Achievement rewards or badges
