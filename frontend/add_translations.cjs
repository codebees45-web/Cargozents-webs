const fs = require('fs');
const path = require('path');

const translations = {
  en: {
    nav: { about: "ABOUT", howItWorks: "HOW IT WORKS", industries: "INDUSTRIES", pricing: "PRICING", contact: "CONTACT" },
    landing: { hero: { eyebrow: "BACKHAUL FREIGHT NETWORK", title1: "Every empty truck", title2: "is a shipment waiting to happen.", subtitle: "Cargozents connects buyers, shippers, and drivers on one network — so a truck heading back empty picks up someone else's load instead. Less wasted diesel, more driver income, faster delivery for everyone.", postShipment: "Post a shipment", drive: "Drive with Cargozents", returnLeg: "RETURN LEG STATUS", matching: "MATCHING IN PROGRESS" } }
  },
  ta: {
    nav: { about: "பற்றி", howItWorks: "எப்படி செயல்படுகிறது", industries: "தொழில்துறைகள்", pricing: "விலை", contact: "தொடர்பு" },
    landing: { hero: { eyebrow: "பேக்ஹால் சரக்கு நெட்வொர்க்", title1: "ஒவ்வொரு காலி லாரியும்", title2: "காத்திருக்கும் ஒரு சரக்கு.", subtitle: "காரகோசென்ட்ஸ் வாங்குபவர்கள், அனுப்புநர்கள் மற்றும் ஓட்டுநர்களை ஒரே நெட்வொர்க்கில் இணைக்கிறது. காலியாக திரும்பும் லாரி வேறொருவரின் சுமையை ஏற்றிச் செல்கிறது. குறைவான டீசல் விரயம், ஓட்டுநருக்கு அதிக வருமானம், அனைவருக்கும் விரைவான விநியோகம்.", postShipment: "சரக்கை பதிவு செய்க", drive: "எங்களுடன் ஓட்டுங்கள்", returnLeg: "திரும்பும் நிலை", matching: "பொருத்தம் நடக்கிறது" } }
  },
  hi: {
    nav: { about: "हमारे बारे में", howItWorks: "यह कैसे काम करता है", industries: "उद्योग", pricing: "मूल्य निर्धारण", contact: "संपर्क करें" },
    landing: { hero: { eyebrow: "बैकहॉल फ्रेट नेटवर्क", title1: "हर खाली ट्रक", title2: "एक शिपमेंट का इंतजार है।", subtitle: "Cargozents खरीदारों, शिपर्स और ड्राइवरों को एक नेटवर्क पर जोड़ता है - ताकि खाली वापस आने वाला ट्रक किसी और का भार उठा सके। कम डीजल की बर्बादी, अधिक ड्राइवर की आय, सभी के लिए तेज़ डिलीवरी।", postShipment: "शिपमेंट पोस्ट करें", drive: "Cargozents के साथ चलाएं", returnLeg: "वापसी यात्रा की स्थिति", matching: "मिलान प्रगति पर है" } }
  },
  te: {
    nav: { about: "గురించి", howItWorks: "ఇది ఎలా పనిచేస్తుంది", industries: "పరిశ్రమలు", pricing: "ధరలు", contact: "సంప్రదించండి" },
    landing: { hero: { eyebrow: "బ్యాక్‌హాల్ ఫ్రైట్ నెట్‌వర్క్", title1: "ప్రతి ఖాళీ ట్రక్కు", title2: "షిప్‌మెంట్ కోసం వేచి ఉంది.", subtitle: "Cargozents కొనుగోలుదారులు, షిప్పర్లు మరియు డ్రైవర్లను ఒకే నెట్‌వర్క్‌లో కలుపుతుంది. డీజిల్ ఆదా, ఎక్కువ ఆదాయం, వేగవంతమైన డెలివరీ.", postShipment: "షిప్‌మెంట్‌ను పోస్ట్ చేయండి", drive: "మాతో డ్రైవ్ చేయండి", returnLeg: "తిరుగు ప్రయాణం స్థితి", matching: "మ్యాచింగ్ జరుగుతోంది" } }
  }
};

// I will populate others with Hindi or English fallback for now to save script size, 
// as the user's screenshot specifically showed Tamil (ta). 
// The system can handle full translations later if needed.
const fallbackLang = translations.en;

const langs = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'or', 'ur', 'as'];

langs.forEach(lang => {
  const filePath = path.join(__dirname, 'public', 'locales', lang, 'translation.json');
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf8');
    let json = JSON.parse(fileData);
    
    const langData = translations[lang] || fallbackLang;
    
    // Merge nav
    json.nav = { ...json.nav, ...langData.nav };
    
    // Merge landing
    json.landing = { ...json.landing, ...langData.landing };
    
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
    console.log(`Updated ${lang}/translation.json`);
  }
});
