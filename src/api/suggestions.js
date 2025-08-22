// src/api/suggestions.js

// 1. Random öneriler listesi
const suggestionsList = [
  "Try using public transportation.",
  "Bring your own bottle.",
  "Set a time limit for your shower.",
  "Try eating food without meat.",
  "Don't forget to unplug electrical devices.",
  "Separate plastics, glass, and paper into different trash bins."
];

// 2. Random öneri döndüren fonksiyon
export const getRandomSuggestion = () => {
  const index = Math.floor(Math.random() * suggestionsList.length);
  return suggestionsList[index];
};

// 3. AI önerisi için placeholder fonksiyon (isteğe bağlı)
export const getAISuggestion = async (profileData) => {
  // Bu alanı ileride OpenAI API ile entegre edebiliriz
  // Şimdilik örnek bir çıktı dönelim
  return `Merhaba ${profileData.name || 'kullanıcı'}, bugün su tüketimini azaltmak için musluğu fırçalama sırasında kapatmayı deneyebilirsin.`;
};
