// Enhanced FAQ data with more responses
const faqData = {
  tariff: "ENEO has 3 main tariffs: Residential (79.36 FCFA/kWh), Commercial (95.23 FCFA/kWh), and Industrial (85.67 FCFA/kWh).",
  payment: "You can pay using MTN Mobile Money or Orange Money through our secure payment gateway.",
  debt: "Your debt is automatically calculated and must be paid before receiving new energy units.",
  vat: "VAT rate is 19.25% applied to all energy purchases as per Cameroon tax regulations.",
  meter: "Enter your 8-digit meter number to check your tariff and calculate bills.",
  kwh: "kWh (kilowatt-hour) is the unit of energy consumption. 1 kWh = 1000 watts used for 1 hour.",
  bill: "Your bill includes: Energy cost + VAT (19.25%) + Any outstanding debt.",
  support: "For technical support, contact ENEO customer service at 8001 or visit eneo.cm",
  hello: "Hello! I'm your ENEO Assistant. How can I help you today?",
  hi: "Hi there! I'm here to help you with your ENEO energy billing questions.",
  help: "I can help you with: tariff information, payment methods, bill calculations, meter queries, and general ENEO support.",
  calculate: "You can use the calculators above to convert between amount and kWh. Just enter your meter number and the amount or kWh you want to calculate.",
  momo: "MTN Mobile Money payment is available. Click the 'Pay with MTN Mobile Money' button and enter your phone number to proceed.",
  orange: "Orange Money payment is available. Click the 'Pay with Orange Money' button and enter your phone number to proceed."
};

// Response patterns for better conversation
const responsePatterns = [
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
    responses: [
      "Hello! I'm your ENEO Assistant. How can I help you today?",
      "Hi there! Welcome to ENEO Energy Billing. What can I do for you?",
      "Hey! I'm here to help with all your energy billing questions."
    ]
  },
  {
    keywords: ['calculate', 'calculator', 'kwh', 'amount'],
    responses: [
      "You can use our calculators above! Enter your meter number and either the amount you want to pay or the kWh you need.",
      "To calculate your bill, use the calculators at the top of the page. Just input your 8-digit meter number.",
      "Our billing calculators can convert between FCFA and kWh. Try entering your meter number in either calculator."
    ]
  },
  {
    keywords: ['payment', 'pay', 'momo', 'mobile money', 'orange money'],
    responses: [
      "We accept MTN Mobile Money and Orange Money payments. Use the payment buttons after calculating your bill.",
      "You can pay with Mobile Money! Choose either MTN or Orange Money from the payment options.",
      "Payment is easy with Mobile Money. Just calculate your bill first, then select your preferred payment method."
    ]
  },
  {
    keywords: ['tariff', 'rate', 'price'],
    responses: [
      "ENEO has 3 tariffs: Residential (79.36 FCFA/kWh), Commercial (95.23 FCFA/kWh), and Industrial (85.67 FCFA/kWh).",
      "Energy rates depend on your meter type. Residential customers pay 79.36 FCFA per kWh.",
      "Your tariff rate is determined by your meter classification. Check with your meter number for specific rates."
    ]
  },
  {
    keywords: ['debt', 'owe', 'outstanding'],
    responses: [
      "Any outstanding debt is automatically included in your bill calculation and must be paid before receiving new energy units.",
      "Your debt will be deducted from your payment before allocating kWh to your meter.",
      "Outstanding amounts are handled automatically by our system when you make a payment."
    ]
  },
  {
    keywords: ['help', 'support', 'problem', 'issue'],
    responses: [
      "I can help with tariff info, payments, calculations, and general billing questions. For technical issues, call ENEO at 8001.",
      "What specific help do you need? I can assist with billing calculations, payment methods, or general ENEO information.",
      "For technical support, contact ENEO customer service at 8001 or visit eneo.cm. I can help with billing questions."
    ]
  },
  {
    keywords: ['website', 'official', 'eneo.cm', 'site'],
    responses: [
      "You can visit the official ENEO website at https://eneo.cm for more information and services.",
      "For official ENEO services, please visit eneo.cm or contact customer service at 8001.",
      "The official ENEO website is eneo.cm where you can access additional services."
    ]
  }
];

// ENEO API Configuration (Mock implementation - replace with actual API)
const ENEO_API = {
  baseUrl: 'https://api.eneo.cm', // Replace with actual ENEO API URL
  
  // Mock function to check meter status
  async checkMeterStatus(meterNumber) {
    try {
      // Replace this with actual API call
      const response = await fetch(`${this.baseUrl}/meter/${meterNumber}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Meter not found');
    } catch (error) {
      // Fallback to mock data when API is not available
      return {
        meterNumber: meterNumber,
        tariff: 'Residential',
        balance: Math.floor(Math.random() * 10000),
        debt: Math.floor(Math.random() * 5000),
        status: 'Active'
      };
    }
  },
  
  // Mock function to get live tariff rates
  async getTariffRates() {
    try {
      const response = await fetch(`${this.baseUrl}/tariffs`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Unable to fetch tariff rates');
    } catch (error) {
      // Fallback to hardcoded rates
      return {
        residential: 79.36,
        commercial: 95.23,
        industrial: 85.67
      };
    }
  }
};

function generateResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Check for meter number pattern (8 digits)
  const meterMatch = message.match(/\b\d{8}\b/);
  if (meterMatch) {
    const meterNumber = meterMatch[0];
    return `I found meter number ${meterNumber}. Let me check your account details... You can also visit https://eneo.cm for more services.`;
  }
  
  // Check for specific FAQ keywords first
  for (const [key, value] of Object.entries(faqData)) {
    if (lowerMessage.includes(key)) {
      return value;
    }
  }
  
  // Check response patterns
  for (const pattern of responsePatterns) {
    if (pattern.keywords.some(keyword => lowerMessage.includes(keyword))) {
      const randomIndex = Math.floor(Math.random() * pattern.responses.length);
      return pattern.responses[randomIndex];
    }
  }
  
  // Default responses for unmatched queries
  const defaultResponses = [
    "I'm here to help with ENEO billing questions. You can ask about tariffs, payments, calculations, or visit https://eneo.cm for more services.",
    "Could you please be more specific? I can help with energy billing, payment methods, tariff rates, or calculations. Visit eneo.cm for official services.",
    "I specialize in ENEO energy billing. Try asking about meter calculations, payment options, or tariff information.",
    "For detailed technical support, please contact ENEO at 8001 or visit https://eneo.cm. I can help with billing and payment questions."
  ];
  
  const randomIndex = Math.floor(Math.random() * defaultResponses.length);
  return defaultResponses[randomIndex];
}

function showTypingIndicator() {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) {
    indicator.style.display = "block";
  }
}

function hideTypingIndicator() {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) {
    indicator.style.display = "none";
  }
}

// Global variables for chatbot
let currentLanguage = 'en';
let speechEnabled = true;
let recognition = null;
let isListening = false;

// Language translations
const translations = {
  en: {
    welcome: "Hello! I'm your ENEO Assistant. What's your name?",
    greeting: "Nice to meet you! How can I help you today?",
    listening: "Listening... Speak now",
    voiceError: "Voice recognition error. Please try again.",
    voiceNotSupported: "Voice recognition not supported in this browser"
  },
  fr: {
    welcome: "Bonjour! Je suis votre assistant ENEO. Quel est votre nom?",
    greeting: "Ravi de vous rencontrer! Comment puis-je vous aider aujourd'hui?",
    listening: "J'écoute... Parlez maintenant",
    voiceError: "Erreur de reconnaissance vocale. Veuillez réessayer.",
    voiceNotSupported: "Reconnaissance vocale non supportée dans ce navigateur"
  }
};

function toggleChat() {
  const chatbot = document.getElementById("chatbot");
  const toggle = document.querySelector(".chat-toggle");

  if (chatbot.style.display === "none" || !chatbot.style.display) {
    chatbot.style.display = "flex";
    toggle.style.display = "none";
  } else {
    chatbot.style.display = "none";
    toggle.style.display = "block";
  }
}

function handleChatKeypress(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

async function sendMessage() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();

  if (!message) return;

  addMessage(message, "user");
  input.value = "";

  // Show typing indicator
  showTypingIndicator();

  try {
    // Check if message contains meter number for API call
    const meterMatch = message.match(/\b\d{8}\b/);
    if (meterMatch) {
      const meterData = await ENEO_API.checkMeterStatus(meterMatch[0]);
      setTimeout(() => {
        hideTypingIndicator();
        const response = `Meter ${meterData.meterNumber} - Status: ${meterData.status}, Balance: ${meterData.balance} FCFA, Debt: ${meterData.debt} FCFA. Visit https://eneo.cm for more details.`;
        addMessage(response, "bot");
        if (speechEnabled) {
          speak(response);
        }
      }, 1000);
    } else {
      // Regular response generation
      setTimeout(() => {
        hideTypingIndicator();
        const response = generateResponse(message);
        addMessage(response, "bot");
        if (speechEnabled) {
          speak(response);
        }
      }, 800 + Math.random() * 800);
    }
  } catch (error) {
    setTimeout(() => {
      hideTypingIndicator();
      const errorResponse = "I'm having trouble connecting to ENEO services right now, but I can still help with general questions. You can also visit https://eneo.cm directly.";
      addMessage(errorResponse, "bot");
      if (speechEnabled) {
        speak(errorResponse);
      }
    }, 1000);
  }
}

function addMessage(text, sender) {
  const messages = document.getElementById("messages");
  const div = document.createElement("div");
  div.className = `message ${sender}-message`;
  
  // Handle different message types
  if (sender === 'system') {
    div.style.backgroundColor = '#f0f8ff';
    div.style.color = '#666';
    div.style.fontStyle = 'italic';
    div.style.textAlign = 'center';
    div.style.padding = '5px';
    div.style.margin = '5px 0';
    div.style.borderRadius = '15px';
  }
  
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function setLanguage(lang) {
  currentLanguage = lang;
  
  // Update active language button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  if (event && event.target) {
    event.target.classList.add('active');
  }
  
  // Restart speech recognition with new language if it was active
  if (isListening) {
    stopVoiceRecognition();
    setTimeout(() => {
      toggleVoiceRecognition();
    }, 100);
  }
  
  console.log(`Language switched to: ${lang}`);
}

async function requestMicrophonePermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop()); // Stop the stream, we just needed permission
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    alert('Microphone access is required for voice chat. Please allow microphone access and try again.');
    return false;
  }
}

function initVoiceRecognition() {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    // Enhanced configuration for better audio capture
    recognition.continuous = false;
    recognition.interimResults = true; // Show interim results
    recognition.maxAlternatives = 1;
    recognition.grammars = null;
    
    recognition.onstart = function() {
      isListening = true;
      console.log('Voice recognition started');
      updateVoiceStatus(translations[currentLanguage].listening);
      updateVoiceButton(true);
      
      // Add visual feedback that mic is active
      addMessage("🎤 Listening... speak now", "system");
    };

    recognition.onresult = function(event) {
      let finalTranscript = '';
      let interimTranscript = '';
      
      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update input field with interim results
      const chatInput = document.getElementById('chatInput');
      if (chatInput) {
        chatInput.value = finalTranscript + interimTranscript;
      }
      
      // If we have a final result, process it
      if (finalTranscript.trim()) {
        console.log('Final transcript:', finalTranscript);
        setTimeout(() => {
          if (chatInput) {
            chatInput.value = finalTranscript.trim();
          }
          sendMessage();
        }, 500);
      }
    };

    recognition.onspeechstart = function() {
      console.log('Speech detected');
      updateVoiceStatus('Speech detected...');
    };

    recognition.onspeechend = function() {
      console.log('Speech ended');
      updateVoiceStatus('Processing...');
    };

    recognition.onaudiostart = function() {
      console.log('Audio capture started');
    };

    recognition.onaudioend = function() {
      console.log('Audio capture ended');
    };

    recognition.onerror = function(event) {
      console.error('Speech recognition error:', event.error);
      isListening = false;
      
      let errorMessage = translations[currentLanguage].voiceError;
      
      switch(event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Audio capture failed. Check microphone permissions.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech service not allowed. Try using HTTPS.';
          break;
      }
      
      updateVoiceStatus(errorMessage);
      updateVoiceButton(false);
      addMessage(`❌ ${errorMessage}`, "system");
    };

    recognition.onend = function() {
      console.log('Voice recognition ended');
      isListening = false;
      updateVoiceStatus('');
      updateVoiceButton(false);
    };
    
    return true;
  }
  return false;
}

async function toggleVoiceRecognition() {
  // Check if recognition is supported
  if (!recognition && !initVoiceRecognition()) {
    alert(translations[currentLanguage].voiceNotSupported);
    return;
  }
  
  if (isListening) {
    stopVoiceRecognition();
  } else {
    // Request microphone permission first
    const hasPermission = await requestMicrophonePermission();
    if (hasPermission) {
      startVoiceRecognition();
    }
  }
}

function startVoiceRecognition() {
  if (recognition && !isListening) {
    recognition.lang = getLanguageCode(currentLanguage);
    try {
      recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      updateVoiceStatus(translations[currentLanguage].voiceError);
    }
  }
}

function stopVoiceRecognition() {
  if (recognition && isListening) {
    recognition.stop();
  }
}

function getLanguageCode(lang) {
  const langCodes = {
    'en': 'en-US',
    'fr': 'fr-FR',
    'es': 'es-ES',
    'de': 'de-DE'
  };
  return langCodes[lang] || 'en-US';
}

function updateVoiceStatus(message) {
  const statusElement = document.getElementById('voiceStatus');
  if (statusElement) {
    statusElement.textContent = message;
  }
}

function updateVoiceButton(listening) {
  const voiceBtn = document.getElementById('voiceBtn');
  if (voiceBtn) {
    if (listening) {
      voiceBtn.style.background = '#ff4444';
      voiceBtn.style.animation = 'pulse 1s infinite';
    } else {
      voiceBtn.style.background = '';
      voiceBtn.style.animation = '';
    }
  }
}

function toggleSpeech() {
  speechEnabled = !speechEnabled;
  const speechToggle = document.getElementById('speechToggle');
  if (speechToggle) {
    speechToggle.textContent = speechEnabled ? 'ON' : 'OFF';
    speechToggle.style.color = speechEnabled ? '#4CAF50' : '#f44336';
  }
  
  // Stop any ongoing speech
  if (!speechEnabled && 'speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}

function speak(text) {
  if (speechEnabled && 'speechSynthesis' in window) {
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageCode(currentLanguage);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    // Handle speech errors
    utterance.onerror = function(event) {
      console.error('Speech synthesis error:', event.error);
    };
    
    speechSynthesis.speak(utterance);
  }
}

function askForName() {
  const namePrompt = "What's your name so I can assist you better?";
  addMessage(namePrompt, "bot");
  if (speechEnabled) {
    speak(namePrompt);
  }
}

// Connect to ENEO website function
function connectToEneo() {
  window.open('https://eneo.cm', '_blank');
}

// Add CSS for pulse animation
function addPulseAnimation() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  `;
  document.head.appendChild(style);
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add pulse animation styles
  addPulseAnimation();
  
  // Initialize voice recognition
  initVoiceRecognition();
  
  // Initialize speech synthesis voices
  if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = function() {
      console.log('Speech synthesis voices loaded');
    };
  }
  
  // Initialize chatbot with welcome message
  setTimeout(() => {
    const welcomeMsg = translations[currentLanguage].welcome;
    addMessage(welcomeMsg, "bot");
    if (speechEnabled) {
      speak(welcomeMsg);
    }
  }, 1000);
  
  // Set up initial UI states
  const speechToggle = document.getElementById('speechToggle');
  if (speechToggle) {
    speechToggle.textContent = speechEnabled ? 'ON' : 'OFF';
    speechToggle.style.color = speechEnabled ? '#4CAF50' : '#f44336';
  }
});

// Enhanced voice testing and debugging
function testMicrophone() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function(stream) {
        console.log('Microphone access granted');
        addMessage("✅ Microphone test successful! You can now use voice chat.", "system");
        
        // Test audio levels
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        
        microphone.connect(analyser);
        analyser.fftSize = 256;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        function checkAudioLevel() {
          analyser.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((a, b) => a + b, 0);
          const average = sum / bufferLength;
          
          if (average > 10) {
            console.log('Audio detected, level:', average);
          }
          
          setTimeout(checkAudioLevel, 100);
        }
        
        checkAudioLevel();
        
        // Stop the test stream after 3 seconds
        setTimeout(() => {
          stream.getTracks().forEach(track => track.stop());
          audioContext.close();
        }, 3000);
      })
      .catch(function(error) {
        console.error('Microphone test failed:', error);
        addMessage("❌ Microphone test failed. Please check permissions.", "system");
      });
  } else {
    addMessage("❌ Microphone not supported in this browser.", "system");
  }
}

// Export functions for global access
window.toggleChat = toggleChat;
window.handleChatKeypress = handleChatKeypress;
window.sendMessage = sendMessage;
window.setLanguage = setLanguage;
window.toggleVoiceRecognition = toggleVoiceRecognition;
window.toggleSpeech = toggleSpeech;
window.connectToEneo = connectToEneo;
window.testMicrophone = testMicrophone;