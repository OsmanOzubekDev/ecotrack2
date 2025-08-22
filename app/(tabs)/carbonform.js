import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthProvider';
import { db } from '../../context/firebase';
import { awardFirstStepAchievement, checkAndAwardAchievements } from '../../src/api/achievements';

export default function CarbonForm() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Form state variables
  const [electricityBill, setElectricityBill] = useState('');
  const [gasBill, setGasBill] = useState('');
  const [hasCar, setHasCar] = useState('');
  const [carKm, setCarKm] = useState('');
  const [carFuel, setCarFuel] = useState('');
  const [usesPublicTransport, setUsesPublicTransport] = useState('');
  const [publicTransportKm, setPublicTransportKm] = useState('');
  const [takesFlights, setTakesFlights] = useState('');
  const [flights, setFlights] = useState('');
  const [flightType, setFlightType] = useState('');
  const [redMeatMeals, setRedMeatMeals] = useState('');
  const [poultryFishMeals, setPoultryFishMeals] = useState('');
  const [dairyPortions, setDairyPortions] = useState('');
  const [clothesPerYear, setClothesPerYear] = useState('');
  const [recycling, setRecycling] = useState('');
  const [composting, setComposting] = useState('');
  const [household, setHousehold] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validation error states
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    // Check required fields
    if (!electricityBill) errors.electricityBill = true;
    if (!gasBill) errors.gasBill = true;
    if (!hasCar) errors.hasCar = true;
    if (!usesPublicTransport) errors.usesPublicTransport = true;
    if (!takesFlights) errors.takesFlights = true;
    if (!redMeatMeals) errors.redMeatMeals = true;
    if (!poultryFishMeals) errors.poultryFishMeals = true;
    if (!dairyPortions) errors.dairyPortions = true;
    if (!household) errors.household = true;
    
    // Validate conditional fields
    if (hasCar === 'yes' && !carKm) errors.carKm = true;
    if (hasCar === 'yes' && !carFuel) errors.carFuel = true;
    if (usesPublicTransport === 'yes' && !publicTransportKm) errors.publicTransportKm = true;
    if (takesFlights === 'yes' && !flights) errors.flights = true;
    if (takesFlights === 'yes' && !flightType) errors.flightType = true;
    
    if (parseInt(household) < 1) errors.household = true;
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      Alert.alert('Validation Error', 'Please fill in all required fields before calculating your carbon footprint.');
      return false;
    }
    
    return true;
  };

  // Helper function to get input style based on validation
  const getInputStyle = (fieldName) => {
    return [
      styles.input,
      validationErrors[fieldName] && styles.inputError
    ];
  };

  // Helper function to get picker style based on validation
  const getPickerStyle = (fieldName) => {
    return [
      styles.picker,
      validationErrors[fieldName] && styles.pickerError
    ];
  };

  // Clear validation errors when user starts typing/selecting
  const clearValidationError = (fieldName) => {
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const calculateCarbonFootprint = () => {
    const householdSize = parseInt(household) || 1;
    
    // 1. Electricity: bill ÷ 0.30 (AUD/kWh avg) → weekly emissions
    const electricityBillNum = parseFloat(electricityBill);
    const kWhMonth = electricityBillNum / 0.30;
    const kWhWeek = (kWhMonth * 12) / 52;
    const electricityCO2 = kWhWeek * 0.86;
    
    // 2. Gas: bill ÷ 0.025 (AUD/MJ avg) → weekly emissions
    const gasBillNum = parseFloat(gasBill);
    const MJMonth = gasBillNum / 0.025;
    const MJWeek = (MJMonth * 12) / 52;
    const gasCO2 = MJWeek * 0.051;
    
    // 3. Car: km × fuel factor (only if they have a car)
    let carCO2 = 0;
    if (hasCar === 'yes') {
      const carKmNum = parseFloat(carKm);
      switch (carFuel) {
        case 'petrol':
          carCO2 = carKmNum * 0.42;
          break;
        case 'diesel':
          carCO2 = carKmNum * 0.45;
          break;
        case 'lpg':
          carCO2 = carKmNum * 0.35;
          break;
        case 'ev':
          carCO2 = carKmNum * 0.12;
          break;
        default:
          carCO2 = 0;
      }
    }
    
    // 4. Public Transport: km × factor (only if they use it)
    let publicTransportCO2 = 0;
    if (usesPublicTransport === 'yes') {
      const publicTransportKmNum = parseFloat(publicTransportKm);
      publicTransportCO2 = publicTransportKmNum * 0.102; // Using bus factor as average
    }
    
    // 5. Flights: annual flights × distance × factor ÷ 52 (only if they take flights)
    let flightCO2 = 0;
    if (takesFlights === 'yes') {
      const flightsNum = parseInt(flights);
      switch (flightType) {
        case 'short':
          flightCO2 = (flightsNum * 1000 * 0.15) / 52;
          break;
        case 'medium':
          flightCO2 = (flightsNum * 2750 * 0.12) / 52;
          break;
        case 'long':
          flightCO2 = (flightsNum * 7000 * 0.11) / 52;
          break;
        default:
          flightCO2 = 0;
      }
    }
    
    // 6. Food: meals × factors
    const redMeatCO2 = parseFloat(redMeatMeals) * 0.15 * 27;
    const poultryFishCO2 = parseFloat(poultryFishMeals) * 0.15 * 6;
    const dairyCO2 = parseFloat(dairyPortions) * 0.15 * 3;
    
    // 7. Shopping (optional)
    const clothesCO2 = clothesPerYear ? (parseFloat(clothesPerYear) * 10) / 52 : 0;
    
    // 8. Waste reduction (optional)
    let wasteReduction = 0;
    if (recycling === 'yes') wasteReduction += 1.5;
    if (composting === 'yes') wasteReduction += 3;
    
    // Calculate total weekly CO2
    const totalWeeklyCO2 = electricityCO2 + gasCO2 + carCO2 + publicTransportCO2 + 
                           flightCO2 + redMeatCO2 + poultryFishCO2 + dairyCO2 + 
                           clothesCO2 - wasteReduction;
    
    // Ensure total is not negative
    const finalWeeklyCO2 = Math.max(0, totalWeeklyCO2);
    
    return {
      weekly: finalWeeklyCO2,
      monthly: finalWeeklyCO2 * 4.3,
      yearly: finalWeeklyCO2 * 52,
      breakdown: {
        electricity: electricityCO2,
        gas: gasCO2,
        car: carCO2,
        publicTransport: publicTransportCO2,
        flights: flightCO2,
        redMeat: redMeatCO2,
        poultryFish: poultryFishCO2,
        dairy: dairyCO2,
        clothes: clothesCO2,
        wasteReduction: wasteReduction
      }
    };
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const carbonData = calculateCarbonFootprint();
      const roundedScore = parseFloat(carbonData.weekly.toFixed(2));

      console.log('Calculated carbon score:', roundedScore);
      console.log('User ID:', user.uid);

      // Save to Firestore with serverTimestamp for better consistency
      const docRef = await addDoc(collection(db, 'carbon_scores'), {
        userId: user.uid,
        timestamp: serverTimestamp(),
        score: roundedScore,
        // Store calculation details for transparency
        details: {
          weekly: carbonData.weekly,
          monthly: carbonData.monthly,
          yearly: carbonData.yearly,
          breakdown: carbonData.breakdown,
          inputs: {
            electricityBill: parseFloat(electricityBill),
            gasBill: parseFloat(gasBill),
            hasCar,
            carKm: hasCar === 'yes' ? parseFloat(carKm) : 0,
            carFuel: hasCar === 'yes' ? carFuel : '',
            usesPublicTransport,
            publicTransportKm: usesPublicTransport === 'yes' ? parseFloat(publicTransportKm) : 0,
            takesFlights,
            flights: takesFlights === 'yes' ? parseInt(flights) : 0,
            flightType: takesFlights === 'yes' ? flightType : '',
            redMeatMeals: parseFloat(redMeatMeals),
            poultryFishMeals: parseFloat(poultryFishMeals),
            dairyPortions: parseFloat(dairyPortions),
            clothesPerYear: clothesPerYear ? parseFloat(clothesPerYear) : 0,
            recycling,
            composting,
            householdSize: parseInt(household)
          }
        }
      });

      console.log('Carbon score saved with ID:', docRef.id);
      
      // Check and award achievements
      let newAchievements = [];
      try {
        // First, check if this is the user's first score
        const isFirstScore = await awardFirstStepAchievement(user.uid);
        if (isFirstScore) {
          newAchievements.push({ title: 'First Step' });
        }
        
        // Then check for other achievements
        const achievements = await checkAndAwardAchievements(user.uid, roundedScore);
        newAchievements = [...newAchievements, ...achievements];
      } catch (error) {
        console.error('Error checking achievements:', error);
      }
      
      // Prepare success message with detailed breakdown
      let successMessage = `Your estimated carbon footprint:\n\n`;
      successMessage += `📊 Weekly: ${carbonData.weekly.toFixed(2)} kg CO₂e\n`;
      successMessage += `📅 Monthly: ${carbonData.monthly.toFixed(2)} kg CO₂e\n`;
      successMessage += `📈 Yearly: ${carbonData.yearly.toFixed(2)} kg CO₂e\n\n`;
      successMessage += `Calculation saved successfully!`;
      
      if (newAchievements.length > 0) {
        successMessage += `\n\n🏆 New achievements unlocked: ${newAchievements.map(a => a.title).join(', ')}`;
      }
      
      Alert.alert('Success!', successMessage, [
        { text: 'View Dashboard', onPress: () => router.push('/(tabs)/') },
        { text: 'OK' }
      ]);
      
    } catch (error) {
      console.error('Error saving carbon score:', error);
      Alert.alert('Error', 'Failed to save your carbon footprint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Carbon Footprint Calculator</Text>
      <Text style={styles.subtitle}>Calculate your weekly carbon emissions based on Australian energy prices</Text>

      {/* Energy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏠 Energy Usage</Text>
        
        <Text style={styles.label}>What's your average monthly electricity bill (AUD)?</Text>
        <TextInput
          placeholder="e.g., 120"
          keyboardType="numeric"
          value={electricityBill}
          onChangeText={(text) => {
            setElectricityBill(text);
            clearValidationError('electricityBill');
          }}
          style={getInputStyle('electricityBill')}
        />

        <Text style={styles.label}>What's your average monthly gas bill (AUD)?</Text>
        <TextInput
          placeholder="e.g., 80"
          keyboardType="numeric"
          value={gasBill}
          onChangeText={(text) => {
            setGasBill(text);
            clearValidationError('gasBill');
          }}
          style={getInputStyle('gasBill')}
        />
      </View>

      {/* Transport Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚗 Transport</Text>
        
        <Text style={styles.label}>Do you drive a car?</Text>
        <Picker 
          selectedValue={hasCar} 
          onValueChange={(value) => {
            setHasCar(value);
            clearValidationError('hasCar');
          }} 
          style={getPickerStyle('hasCar')}
        >
          <Picker.Item label="Select..." value="" />
          <Picker.Item label="Yes" value="yes" />
          <Picker.Item label="No" value="no" />
        </Picker>

        {hasCar === 'yes' && (
          <>
            <Text style={styles.label}>How many km do you drive per week?</Text>
            <TextInput
              placeholder="e.g., 50"
              keyboardType="numeric"
              value={carKm}
              onChangeText={(text) => {
                setCarKm(text);
                clearValidationError('carKm');
              }}
              style={getInputStyle('carKm')}
            />

            <Text style={styles.label}>What fuel type?</Text>
            <Picker 
              selectedValue={carFuel} 
              onValueChange={(value) => {
                setCarFuel(value);
                clearValidationError('carFuel');
              }} 
              style={getPickerStyle('carFuel')}
            >
              <Picker.Item label="Select fuel type..." value="" />
              <Picker.Item label="Petrol" value="petrol" />
              <Picker.Item label="Diesel" value="diesel" />
              <Picker.Item label="LPG" value="lpg" />
              <Picker.Item label="Electric (EV)" value="ev" />
            </Picker>
          </>
        )}

        <Text style={styles.label}>Do you use public transport (bus, train, tram)?</Text>
        <Picker 
          selectedValue={usesPublicTransport} 
          onValueChange={(value) => {
            setUsesPublicTransport(value);
            clearValidationError('usesPublicTransport');
          }} 
          style={getPickerStyle('usesPublicTransport')}
        >
          <Picker.Item label="Select..." value="" />
          <Picker.Item label="Yes" value="yes" />
          <Picker.Item label="No" value="no" />
          <Picker.Item label="Sometimes" value="sometimes" />
        </Picker>

        {usesPublicTransport === 'yes' && (
          <>
            <Text style={styles.label}>How many km per week by bus, train, or tram?</Text>
            <TextInput
              placeholder="e.g., 20"
              keyboardType="numeric"
              value={publicTransportKm}
              onChangeText={(text) => {
                setPublicTransportKm(text);
                clearValidationError('publicTransportKm');
              }}
              style={getInputStyle('publicTransportKm')}
            />
          </>
        )}

        <Text style={styles.label}>Do you take flights?</Text>
        <Picker 
          selectedValue={takesFlights} 
          onValueChange={(value) => {
            setTakesFlights(value);
            clearValidationError('takesFlights');
          }} 
          style={getPickerStyle('takesFlights')}
        >
          <Picker.Item label="Select..." value="" />
          <Picker.Item label="Yes" value="yes" />
          <Picker.Item label="No" value="no" />
        </Picker>

        {takesFlights === 'yes' && (
          <>
            <Text style={styles.label}>How many flights in the last 12 months?</Text>
            <TextInput
              placeholder="e.g., 2"
              keyboardType="numeric"
              value={flights}
              onChangeText={(text) => {
                setFlights(text);
                clearValidationError('flights');
              }}
              style={getInputStyle('flights')}
            />

            <Text style={styles.label}>Flight type:</Text>
            <Picker 
              selectedValue={flightType} 
              onValueChange={(value) => {
                setFlightType(value);
                clearValidationError('flightType');
              }} 
              style={getPickerStyle('flightType')}
            >
              <Picker.Item label="Select flight type..." value="" />
              <Picker.Item label="Short haul (< 3 hours)" value="short" />
              <Picker.Item label="Medium haul (3-6 hours)" value="medium" />
              <Picker.Item label="Long haul (> 6 hours)" value="long" />
            </Picker>
          </>
        )}
      </View>

      {/* Food Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🍽️ Food Consumption</Text>
        
        <Text style={styles.label}>On average, how many red meat meals per week?</Text>
        <TextInput
          placeholder="e.g., 3"
          keyboardType="numeric"
          value={redMeatMeals}
          onChangeText={(text) => {
            setRedMeatMeals(text);
            clearValidationError('redMeatMeals');
          }}
          style={getInputStyle('redMeatMeals')}
        />

        <Text style={styles.label}>How many poultry/fish meals per week?</Text>
        <TextInput
          placeholder="e.g., 2"
          keyboardType="numeric"
          value={poultryFishMeals}
          onChangeText={(text) => {
            setPoultryFishMeals(text);
            clearValidationError('poultryFishMeals');
          }}
          style={getInputStyle('poultryFishMeals')}
        />

        <Text style={styles.label}>How many dairy portions per week?</Text>
        <TextInput
          placeholder="e.g., 7"
          keyboardType="numeric"
          value={dairyPortions}
          onChangeText={(text) => {
            setDairyPortions(text);
            clearValidationError('dairyPortions');
          }}
          style={getInputStyle('dairyPortions')}
        />
      </View>

      {/* Optional Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛍️ Optional Categories</Text>
        
        <Text style={styles.label}>How many new clothes do you buy per year?</Text>
        <TextInput
          placeholder="e.g., 12 (optional)"
          keyboardType="numeric"
          value={clothesPerYear}
          onChangeText={(text) => {
            setClothesPerYear(text);
            clearValidationError('clothesPerYear');
          }}
          style={getInputStyle('clothesPerYear')}
        />

        <Text style={styles.label}>Do you recycle?</Text>
        <Picker 
          selectedValue={recycling} 
          onValueChange={(value) => {
            setRecycling(value);
            clearValidationError('recycling');
          }} 
          style={getPickerStyle('recycling')}
        >
          <Picker.Item label="Select..." value="" />
          <Picker.Item label="Yes" value="yes" />
          <Picker.Item label="No" value="no" />
        </Picker>

        <Text style={styles.label}>Do you compost food waste?</Text>
        <Picker 
          selectedValue={composting} 
          onValueChange={(value) => {
            setComposting(value);
            clearValidationError('composting');
          }} 
          style={getPickerStyle('composting')}
        >
          <Picker.Item label="Select..." value="" />
          <Picker.Item label="Yes" value="yes" />
          <Picker.Item label="No" value="no" />
        </Picker>
      </View>

      {/* Household Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 Household</Text>
        
        <Text style={styles.label}>How many people live in your household?</Text>
        <TextInput
          placeholder="e.g., 2"
          keyboardType="numeric"
          value={household}
          onChangeText={(text) => {
            setHousehold(text);
            clearValidationError('household');
          }}
          style={getInputStyle('household')}
        />
      </View>

      <Button 
        title={isSubmitting ? "Calculating..." : "Calculate Carbon Footprint"} 
        onPress={handleSubmit}
        disabled={isSubmitting}
        style={styles.submitButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    gap: 15,
    backgroundColor: '#f5f5f5'
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 5, 
    textAlign: 'center',
    color: '#2c3e50'
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#7f8c8d',
    fontStyle: 'italic'
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#34495e',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingBottom: 8,
  },
  label: { 
    marginTop: 15, 
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: 14
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
    backgroundColor: '#fdf2f2',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: '#fff',
  },
  pickerError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
    backgroundColor: '#fdf2f2',
  },
  submitButton: {
    marginTop: 10,
    marginBottom: 30,
  }
});
