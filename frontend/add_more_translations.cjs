const fs = require('fs');
const path = require('path');

const translations = {
  en: {
    landing: {
      problem: {
        eyebrow: "THE BACKHAUL PROBLEM",
        title: "Half the trip is usually wasted.",
        without: {
          label: "WITHOUT CARGOZENTS",
          title: "The return trip runs empty.",
          line1: "Truck delivers, then drives back with nothing on board.",
          line2: "Diesel, tolls, and driver time are spent for zero revenue.",
          line3: "The next shipment waits for a truck that was already on the road."
        },
        with: {
          label: "WITH CARGOZENTS",
          title: "The return trip earns.",
          line1: "A nearby shipment is matched to the truck’s return route.",
          line2: "The driver earns on a leg that used to be a pure cost.",
          line3: "The shipper gets a truck that was already headed their way."
        }
      },
      howItWorks: {
        eyebrow: "HOW IT WORKS",
        title: "Three steps, one network.",
        step1: {
          title: "A load enters the network",
          body: "A buyer orders from a shipper’s catalog, or a shipper posts a shipment directly — goods, weight, pickup, and drop."
        },
        step2: {
          title: "Cargozents matches the truck",
          body: "The dispatch engine checks nearby drivers already heading that way — especially ones about to run their return leg empty."
        },
        step3: {
          title: "The driver delivers and gets paid",
          body: "Pickup, live tracking, drop-off, and payout — the driver earns on a leg that used to cost them money."
        }
      },
      roles: {
        eyebrow: "ONE NETWORK, FOUR ROLES",
        title: "Built for everyone in the chain.",
        buyer: { code: "BUYER", desc: "Order directly from a shipper’s catalog and track delivery to your door." },
        shipper: { code: "SHIPPER", desc: "Sell products or post one-off shipments — request a truck whenever you need one." },
        driver: { code: "DRIVER", desc: "Declare your route and capacity, accept matched loads, get paid per trip." },
        admin: { code: "ADMIN", desc: "Verify drivers and vehicles, assign trucks to requests, and monitor the network." }
      },
      cta: {
        title: "Stop paying for empty kilometers.",
        subtitle: "Join as a shipper, driver, or buyer — the network works better the moment you’re on it.",
        createAccount: "Create your account",
        talkToUs: "Talk to us"
      },
      footer: {
        faqs: "FAQS",
        terms: "TERMS",
        privacy: "PRIVACY",
        builtFor: "BUILT FOR INDIAN FREIGHT."
      }
    }
  },
  ta: {
    landing: {
      problem: {
        eyebrow: "பேக்ஹால் சிக்கல்",
        title: "பயணத்தின் பாதி பொதுவாக வீணாகிறது.",
        without: {
          label: "காரகோசென்ட்ஸ் இல்லாமல்",
          title: "திரும்பும் பயணம் காலியாக இயங்குகிறது.",
          line1: "லாரி விநியோகிக்கிறது, பின்னர் சுமை இல்லாமல் திரும்பிச் செல்கிறது.",
          line2: "டீசல், சுங்கச்சாவடிகள் மற்றும் ஓட்டுநரின் நேரம் பூஜ்ஜிய வருவாய்க்காக செலவிடப்படுகிறது.",
          line3: "அடுத்த சரக்கு ஏற்கனவே சாலையில் உள்ள லாரிக்காக காத்திருக்கிறது."
        },
        with: {
          label: "காரகோசென்ட்ஸ் உடன்",
          title: "திரும்பும் பயணம் சம்பாதிக்கிறது.",
          line1: "அருகிலுள்ள சரக்கு லாரியின் திரும்பும் பாதையுடன் பொருந்துகிறது.",
          line2: "ஓட்டுநர் செலவாக இருந்த பயணத்தில் சம்பாதிக்கிறார்.",
          line3: "அனுப்புநர் ஏற்கனவே அவர்கள் வழியில் சென்றுகொண்டிருக்கும் லாரியைப் பெறுகிறார்."
        }
      },
      howItWorks: {
        eyebrow: "எப்படி செயல்படுகிறது",
        title: "மூன்று படிகள், ஒரு நெட்வொர்க்.",
        step1: {
          title: "ஒரு சுமை நெட்வொர்க்கில் நுழைகிறது",
          body: "வாங்குபவர் அனுப்புநரின் பட்டியலிலிருந்து ஆர்டர் செய்கிறார், அல்லது அனுப்புநர் நேரடியாக ஒரு சரக்கை பதிவு செய்கிறார்."
        },
        step2: {
          title: "காரகோசென்ட்ஸ் லாரியை பொருத்துகிறது",
          body: "அனுப்புதல் இயந்திரம் ஏற்கனவே அந்த வழியில் செல்லும் அருகிலுள்ள ஓட்டுநர்களை சரிபார்க்கிறது - குறிப்பாக காலியாக திரும்பும் ஓட்டுநர்களை."
        },
        step3: {
          title: "ஓட்டுநர் வழங்கி பணம் பெறுகிறார்",
          body: "பிக்அப், நேரடி கண்காணிப்பு, டிராப்-ஆஃப் மற்றும் பணம் செலுத்துதல் - ஓட்டுநர் அவர்களுக்கு செலவான பயணத்தில் சம்பாதிக்கிறார்."
        }
      },
      roles: {
        eyebrow: "ஒரு நெட்வொர்க், நான்கு பாத்திரங்கள்",
        title: "சங்கிலியில் உள்ள அனைவருக்கும் உருவாக்கப்பட்டது.",
        buyer: { code: "வாங்குபவர்", desc: "அனுப்புநரின் பட்டியலிலிருந்து நேரடியாக ஆர்டர் செய்து, உங்கள் வீட்டு வாசலுக்கு விநியோகத்தை கண்காணிக்கவும்." },
        shipper: { code: "அனுப்புநர்", desc: "தயாரிப்புகளை விற்கவும் அல்லது சரக்குகளை பதிவு செய்யவும் - உங்களுக்கு தேவைப்படும்போது லாரியை கோருங்கள்." },
        driver: { code: "ஓட்டுநர்", desc: "உங்கள் பாதை மற்றும் திறனை அறிவித்து, பொருந்திய சுமைகளை ஏற்று, ஒவ்வொரு பயணத்திற்கும் பணம் பெறுங்கள்." },
        admin: { code: "நிர்வாகி", desc: "ஓட்டுநர்கள் மற்றும் வாகனங்களை சரிபார்க்கவும், கோரிக்கைகளுக்கு லாரிகளை ஒதுக்கவும், மற்றும் நெட்வொர்க்கை கண்காணிக்கவும்." }
      },
      cta: {
        title: "காலி கிலோமீட்டர்களுக்கு பணம் செலுத்துவதை நிறுத்துங்கள்.",
        subtitle: "ஒரு அனுப்புநராக, ஓட்டுநராக அல்லது வாங்குபவராக சேரவும் - நீங்கள் நெட்வொர்க்கில் இருக்கும்போது அது சிறப்பாக செயல்படுகிறது.",
        createAccount: "உங்கள் கணக்கை உருவாக்கவும்",
        talkToUs: "எங்களுடன் பேசுங்கள்"
      },
      footer: {
        faqs: "கேள்விகள்",
        terms: "விதிமுறைகள்",
        privacy: "தனியுரிமை",
        builtFor: "இந்திய சரக்குகளுக்காக உருவாக்கப்பட்டது."
      }
    }
  },
  hi: {
    landing: {
      problem: {
        eyebrow: "बैकहॉल की समस्या",
        title: "यात्रा का आधा हिस्सा आमतौर पर बर्बाद हो जाता है।",
        without: {
          label: "कारगोज़ेंट्स के बिना",
          title: "वापसी की यात्रा खाली रहती है।",
          line1: "ट्रक डिलीवरी करता है, फिर बिना किसी भार के वापस आ जाता है।",
          line2: "शून्य राजस्व के लिए डीजल, टोल और ड्राइवर का समय खर्च होता है।",
          line3: "अगला शिपमेंट एक ऐसे ट्रक का इंतजार करता है जो पहले से ही सड़क पर था।"
        },
        with: {
          label: "कारगोज़ेंट्स के साथ",
          title: "वापसी की यात्रा कमाती है।",
          line1: "पास के एक शिपमेंट को ट्रक के वापसी मार्ग से मिलाया जाता है।",
          line2: "ड्राइवर उस यात्रा पर कमाता है जो पहले शुद्ध लागत हुआ करती थी।",
          line3: "शिपर को एक ट्रक मिलता है जो पहले से ही उनके रास्ते जा रहा था।"
        }
      },
      howItWorks: {
        eyebrow: "यह कैसे काम करता है",
        title: "तीन कदम, एक नेटवर्क।",
        step1: {
          title: "एक भार नेटवर्क में प्रवेश करता है",
          body: "एक खरीदार शिपर के कैटलॉग से ऑर्डर करता है, या एक शिपर सीधे एक शिपमेंट पोस्ट करता है।"
        },
        step2: {
          title: "कारगोज़ेंट्स ट्रक का मिलान करता है",
          body: "डिस्पैच इंजन पास के उन ड्राइवरों की जांच करता है जो पहले से ही उस रास्ते जा रहे हैं - विशेष रूप से वे जो अपनी वापसी यात्रा खाली चलाने वाले हैं।"
        },
        step3: {
          title: "ड्राइवर वितरित करता है और भुगतान प्राप्त करता है",
          body: "पिकअप, लाइव ट्रैकिंग, ड्रॉप-ऑफ़, और पेआउट - ड्राइवर उस यात्रा पर कमाता है जिसमें पहले उनका पैसा खर्च होता था।"
        }
      },
      roles: {
        eyebrow: "एक नेटवर्क, चार भूमिकाएं",
        title: "श्रृंखला में सभी के लिए बनाया गया।",
        buyer: { code: "खरीदार", desc: "शिपर के कैटलॉग से सीधे ऑर्डर करें और अपने दरवाजे तक डिलीवरी को ट्रैक करें।" },
        shipper: { code: "शिपर", desc: "उत्पादों को बेचें या शिपमेंट पोस्ट करें - जब भी आपको आवश्यकता हो ट्रक का अनुरोध करें।" },
        driver: { code: "ड्राइवर", desc: "अपना मार्ग और क्षमता घोषित करें, मिलान किए गए भार को स्वीकार करें, प्रति यात्रा भुगतान प्राप्त करें।" },
        admin: { code: "एडमिन", desc: "ड्राइवरों और वाहनों को सत्यापित करें, अनुरोधों को ट्रक असाइन करें, और नेटवर्क की निगरानी करें।" }
      },
      cta: {
        title: "खाली किलोमीटर के लिए भुगतान करना बंद करें।",
        subtitle: "शिपर, ड्राइवर, या खरीदार के रूप में जुड़ें - जिस पल आप इस पर होते हैं, नेटवर्क बेहतर काम करता है।",
        createAccount: "अपना खाता बनाएं",
        talkToUs: "हमसे बात करें"
      },
      footer: {
        faqs: "सामान्य प्रश्न",
        terms: "नियम",
        privacy: "गोपनीयता",
        builtFor: "भारतीय माल ढुलाई के लिए निर्मित।"
      }
    }
  },
  te: {
    landing: {
      problem: {
        eyebrow: "బ్యాక్‌హాల్ సమస్య",
        title: "ప్రయాణంలో సగం సాధారణంగా వృధా అవుతుంది.",
        without: {
          label: "కార్గోజెంట్స్ లేకుండా",
          title: "తిరుగు ప్రయాణం ఖాళీగా సాగుతుంది.",
          line1: "ట్రక్కు పంపిణీ చేస్తుంది, ఆపై ఎటువంటి లోడ్ లేకుండా తిరిగి వస్తుంది.",
          line2: "సున్నా ఆదాయం కోసం డీజిల్, టోల్ మరియు డ్రైవర్ సమయం ఖర్చు చేయబడుతుంది.",
          line3: "తదుపరి షిప్‌మెంట్ ఇప్పటికే రోడ్డుపై ఉన్న ట్రక్కు కోసం వేచి ఉంటుంది."
        },
        with: {
          label: "కార్గోజెంట్స్ తో",
          title: "తిరుగు ప్రయాణం సంపాదిస్తుంది.",
          line1: "సమీపంలోని షిప్‌మెంట్ ట్రక్కు తిరుగు మార్గానికి సరిపోతుంది.",
          line2: "డ్రైవర్ ఒకప్పుడు స్వచ్ఛమైన ఖర్చుగా ఉన్న ప్రయాణంలో సంపాదిస్తాడు.",
          line3: "షిప్పర్ ఇప్పటికే తమ మార్గంలో వెళ్తున్న ట్రక్కును పొందుతాడు."
        }
      },
      howItWorks: {
        eyebrow: "ఇది ఎలా పనిచేస్తుంది",
        title: "మూడు దశలు, ఒక నెట్‌వర్క్.",
        step1: {
          title: "ఒక లోడ్ నెట్‌వర్క్‌లోకి ప్రవేశిస్తుంది",
          body: "కొనుగోలుదారు షిప్పర్ కేటలాగ్ నుండి ఆర్డర్ చేస్తాడు లేదా షిప్పర్ నేరుగా షిప్‌మెంట్‌ను పోస్ట్ చేస్తాడు."
        },
        step2: {
          title: "కార్గోజెంట్స్ ట్రక్కును జత చేస్తుంది",
          body: "డిస్పాచ్ ఇంజిన్ సమీపంలోని డ్రైవర్లను ఇప్పటికే ఆ మార్గంలో వెళుతుందో లేదో తనిఖీ చేస్తుంది - ముఖ్యంగా తమ తిరుగు ప్రయాణాన్ని ఖాళీగా నడపబోతున్న వారిని."
        },
        step3: {
          title: "డ్రైవర్ బట్వాడా చేసి చెల్లింపు పొందుతాడు",
          body: "పికప్, లైవ్ ట్రాకింగ్, డ్రాప్-ఆఫ్ మరియు చెల్లింపు - డ్రైవర్ ఒకప్పుడు తమకు డబ్బు ఖర్చు అయిన ప్రయాణంలో సంపాదిస్తాడు."
        }
      },
      roles: {
        eyebrow: "ఒక నెట్‌వర్క్, నాలుగు పాత్రలు",
        title: "గొలుసులోని ప్రతి ఒక్కరి కోసం నిర్మించబడింది.",
        buyer: { code: "కొనుగోలుదారు", desc: "షిప్పర్ కేటలాగ్ నుండి నేరుగా ఆర్డర్ చేయండి మరియు మీ గుమ్మానికి డెలివరీని ట్రాక్ చేయండి." },
        shipper: { code: "షిప్పర్", desc: "ఉత్పత్తులను విక్రయించండి లేదా షిప్‌మెంట్‌లను పోస్ట్ చేయండి - మీకు అవసరమైనప్పుడు ట్రక్కును అభ్యర్థించండి." },
        driver: { code: "డ్రైవర్", desc: "మీ మార్గం మరియు సామర్థ్యాన్ని ప్రకటించండి, సరిపోలిన లోడ్‌లను అంగీకరించండి, ప్రతి ప్రయాణానికి చెల్లించండి." },
        admin: { code: "అడ్మిన్", desc: "డ్రైవర్లు మరియు వాహనాలను ధృవీకరించండి, అభ్యర్థనలకు ట్రక్కులను కేటాయించండి మరియు నెట్‌వర్క్‌ను పర్యవేక్షించండి." }
      },
      cta: {
        title: "ఖాళీ కిలోమీటర్లకు చెల్లించడం ఆపండి.",
        subtitle: "షిప్పర్, డ్రైవర్ లేదా కొనుగోలుదారుగా చేరండి - మీరు నెట్‌వర్క్‌లో ఉన్నప్పుడు అది మెరుగ్గా పనిచేస్తుంది.",
        createAccount: "మీ ఖాతాను సృష్టించండి",
        talkToUs: "మాతో మాట్లాడండి"
      },
      footer: {
        faqs: "తరచుగా అడిగే ప్రశ్నలు",
        terms: "నిబంధనలు",
        privacy: "గోప్యత",
        builtFor: "భారతీయ సరుకు రవాణా కోసం నిర్మించబడింది."
      }
    }
  }
};

const fallbackLang = translations.en;
const langs = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'or', 'ur', 'as'];

langs.forEach(lang => {
  const filePath = path.join(__dirname, 'public', 'locales', lang, 'translation.json');
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf8');
    let json = JSON.parse(fileData);
    
    const langData = translations[lang] || fallbackLang;
    
    // Merge new landing page sub-objects
    json.landing = json.landing || {};
    json.landing.problem = { ...json.landing.problem, ...langData.landing.problem };
    json.landing.howItWorks = { ...json.landing.howItWorks, ...langData.landing.howItWorks };
    json.landing.roles = { ...json.landing.roles, ...langData.landing.roles };
    json.landing.cta = { ...json.landing.cta, ...langData.landing.cta };
    json.landing.footer = { ...json.landing.footer, ...langData.landing.footer };
    
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
    console.log(`Updated all components for ${lang}/translation.json`);
  }
});
