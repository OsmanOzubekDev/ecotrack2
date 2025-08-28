import { ScrollView, StyleSheet } from 'react-native';
import CarbonHistoryGraph from '../../components/dashboard/CarbonHistoryGraph';
import CarbonQuickAccess from '../../components/dashboard/CarbonQuickAccess';
import NotificationTest from '../../components/dashboard/NotificationTest';
import RecentScores from '../../components/dashboard/RecentScores';
import UserGreeting from '../../components/dashboard/UserGreeting';

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <UserGreeting />
      <CarbonQuickAccess />
      <CarbonHistoryGraph />
      <RecentScores />
      <NotificationTest />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f4f6f8',
    flexGrow: 1,
  },
});
