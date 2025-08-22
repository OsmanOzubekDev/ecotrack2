import { arrayRemove, arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../context/firebase';
import { ACHIEVEMENTS } from './achievementsConfig';
import { getCarbonScores } from './carbon';

// ✅ ROZET EKLE
export const addAchievement = async (uid, achievementId) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        achievements: [achievementId],
      });
      console.log('🎉 Achievement added succesfully for new users', achievementId);
    } else {
      const currentAchievements = userSnap.data().achievements || [];

      if (!currentAchievements.includes(achievementId)) {
        await updateDoc(userRef, {
          achievements: arrayUnion(achievementId),
        });
        console.log('✅ Achievement added succesfully', achievementId);
      } else {
        console.log('ℹ️ You already gotten this achievement', achievementId);
      }
    }
  } catch (error) {
    console.error('❌ Error when you are adding error!', error);
  }
};

// ✅ ROZET SİL
export const removeAchievement = async (uid, achievementId) => {
  try {
    console.log('📌 Starting delete progress...');
    console.log('👉 User ID:', uid);
    console.log('👉 Deleting achievement:', achievementId);

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.warn('⚠️ Don"t find user info.');
      return;
    }

    await updateDoc(userRef, {
      achievements: arrayRemove(achievementId),
    });

    console.log('✅ Succesfully deleted:', achievementId);
  } catch (error) {
    console.error('❌ Error when deleting achievement:', error);
  }
};

// ✅ ROZETLERİ GETİR
export const getAchievements = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data().achievements || [];
    }
    return [];
  } catch (error) {
    console.error('❌ Error when getting achievement:', error);
    return [];
  }
};

// ✅ ACHIEVEMENT PROGRESS CHECKING
export const checkAchievementProgress = async (uid) => {
  try {
    const userAchievements = await getAchievements(uid);
    const carbonScores = await getCarbonScores(uid, 100); // Get last 100 scores
    const allAchievements = Object.values(ACHIEVEMENTS);
    
    const progressData = allAchievements.map(achievement => {
      const isUnlocked = userAchievements.includes(achievement.id);
      let progress = 0;
      let current = 0;
      
      switch (achievement.type) {
        case 'carbon_score':
          if (achievement.threshold && achievement.target) {
            const scoresBelowThreshold = carbonScores.filter(score => score.score <= achievement.threshold);
            current = scoresBelowThreshold.length;
            progress = Math.min((current / achievement.target) * 100, 100);
          }
          break;
          
        case 'streak':
          if (carbonScores.length > 0) {
            // Calculate consecutive days
            let streak = 0;
            let maxStreak = 0;
            let currentDate = null;
            
            for (let i = 0; i < carbonScores.length; i++) {
              const scoreDate = new Date(carbonScores[i].timestamp);
              const scoreDateStr = scoreDate.toDateString();
              
              if (currentDate === null) {
                currentDate = scoreDateStr;
                streak = 1;
              } else if (scoreDateStr === currentDate) {
                // Same day, continue streak
                continue;
              } else if (isConsecutiveDay(currentDate, scoreDateStr)) {
                streak++;
                currentDate = scoreDateStr;
              } else {
                // Break in streak
                maxStreak = Math.max(maxStreak, streak);
                streak = 1;
                currentDate = scoreDateStr;
              }
            }
            
            maxStreak = Math.max(maxStreak, streak);
            current = maxStreak;
            progress = Math.min((current / achievement.target) * 100, 100);
          }
          break;
          
        case 'milestone':
          if (achievement.id === 'first_step') {
            current = carbonScores.length > 0 ? 1 : 0;
            progress = current > 0 ? 100 : 0;
          } else if (achievement.id === 'hundred_club') {
            current = carbonScores.length;
            progress = Math.min((current / achievement.target) * 100, 100);
          }
          break;
          
        case 'special':
          if (achievement.id === 'perfect_score') {
            const hasPerfectScore = carbonScores.some(score => score.score <= achievement.threshold);
            current = hasPerfectScore ? 1 : 0;
            progress = current > 0 ? 100 : 0;
          } else if (achievement.id === 'improvement_master') {
            if (carbonScores.length >= 2) {
              const firstScore = carbonScores[carbonScores.length - 1].score;
              const latestScore = carbonScores[0].score;
              const improvement = ((firstScore - latestScore) / firstScore) * 100;
              current = Math.max(0, improvement);
              progress = Math.min((current / achievement.target) * 100, 100);
            }
          }
          break;
      }
      
      return {
        ...achievement,
        isUnlocked,
        progress,
        current,
        target: achievement.target
      };
    });
    
    return progressData;
  } catch (error) {
    console.error('❌ Error checking achievement progress:', error);
    return [];
  }
};

// Helper function to check if two dates are consecutive
const isConsecutiveDay = (date1Str, date2Str) => {
  const date1 = new Date(date1Str);
  const date2 = new Date(date2Str);
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

// ✅ AUTO-CHECK AND AWARD ACHIEVEMENTS
export const checkAndAwardAchievements = async (uid) => {
  try {
    const progressData = await checkAchievementProgress(uid);
    const newAchievements = [];
    
    for (const achievement of progressData) {
      if (!achievement.isUnlocked && achievement.progress >= 100) {
        await addAchievement(uid, achievement.id);
        newAchievements.push(achievement);
      }
    }
    
    return newAchievements;
  } catch (error) {
    console.error('❌ Error checking and awarding achievements:', error);
    return [];
  }
};

// ✅ AWARD FIRST STEP ACHIEVEMENT
export const awardFirstStepAchievement = async (uid) => {
  try {
    const userAchievements = await getAchievements(uid);
    
    // Check if user already has the first_step achievement
    if (!userAchievements.includes('first_step')) {
      await addAchievement(uid, 'first_step');
      console.log('🎉 First Step achievement awarded to user:', uid);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error awarding first step achievement:', error);
    return false;
  }
};
