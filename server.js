// server.js - Fixed version
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const crypto = require("crypto");
const cheerio = require("cheerio");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// MongoDB Connection with better error handling
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/eneo_billing",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    console.log(
      "Continuing without database - chatbot will work with limited features"
    );
  });

// Schemas (same as original)
const meterSchema = new mongoose.Schema({
  meterNumber: { type: String, required: true, unique: true },
  tariff: {
    type: String,
    required: true,
    enum: ["residential", "commercial", "industrial"],
  },
  rate: { type: Number, required: true },
  debt: { type: Number, default: 0 },
  ownerName: String,
  address: String,
  createdAt: { type: Date, default: Date.now },
});

const Meter = mongoose.model("Meter", meterSchema);

const transactionSchema = new mongoose.Schema({
  meterNumber: String,
  amount: Number,
  kwh: Number,
  paymentMethod: String,
  transactionId: String,
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: String,
  preferredLanguage: { type: String, default: "en" },
  chatHistory: [
    {
      message: String,
      response: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Constants
const VAT_RATE = 0.1925;

// Enhanced FAQ data with multilingual support
const faqData = {
  en: {
    tariffs:
      "ENEO offers three main electricity tariffs in Cameroon: Residential tariff at 79.36 FCFA/kWh for households, Commercial tariff at 95.23 FCFA/kWh for businesses, and Industrial tariff at 85.67 FCFA/kWh for industries. All tariffs include a 19.25% VAT as per Cameroon regulations.",
    payment:
      "ENEO accepts payments through multiple channels: Mobile Money (MTN MoMo and Orange Money), bank transfers, ENEO agencies, and authorized dealers. You can also pay online through the ENEO website or mobile app.",
    contact:
      "ENEO Customer Service: Call 8001 (toll-free) from any network in Cameroon, visit eneo.cm, or go to any ENEO agency. Emergency line: 8001. Technical support available 24/7.",
    prepaid:
      "ENEO prepaid meters allow you to buy electricity units in advance. Simply recharge your meter using the 20-digit code received after payment. Units are credited instantly to your meter.",
    bill: "ENEO bills include: Energy consumption (kWh × tariff rate), VAT (19.25%), fixed charges, and any outstanding debt. Bills are issued monthly for postpaid customers.",
    connection:
      "To get a new ENEO connection: Visit nearest ENEO agency with required documents (ID, proof of residence, property documents), pay connection fees, schedule technical visit, and await installation.",
    outage:
      "For power outages: Check if it's a general outage in your area, verify your meter has units (for prepaid), contact ENEO at 8001 to report the outage, or visit eneo.cm for outage updates.",
    greeting:
      "Hello {name}! I'm your ENEO assistant. How can I help you today?",
    default:
      "I'm sorry {name}, I didn't understand your question. You can ask me about ENEO tariffs, payments, contact information, prepaid meters, bills, new connections, or power outages.",
  },
  fr: {
    tariffs:
      "ENEO propose trois tarifs électriques principaux au Cameroun : Tarif résidentiel à 79,36 FCFA/kWh pour les ménages, Tarif commercial à 95,23 FCFA/kWh pour les entreprises, et Tarif industriel à 85,67 FCFA/kWh pour les industries. Tous les tarifs incluent une TVA de 19,25% selon la réglementation camerounaise.",
    payment:
      "ENEO accepte les paiements par plusieurs canaux : Mobile Money (MTN MoMo et Orange Money), virements bancaires, agences ENEO, et revendeurs agréés. Vous pouvez également payer en ligne via le site web ENEO ou l'application mobile.",
    contact:
      "Service Client ENEO : Appelez le 8001 (gratuit) depuis n'importe quel réseau au Cameroun, visitez eneo.cm, ou rendez-vous dans n'importe quelle agence ENEO. Ligne d'urgence : 8001. Support technique disponible 24h/24.",
    prepaid:
      "Les compteurs prépayés ENEO vous permettent d'acheter des unités d'électricité à l'avance. Rechargez simplement votre compteur en utilisant le code à 20 chiffres reçu après paiement. Les unités sont créditées instantanément sur votre compteur.",
    bill: "Les factures ENEO incluent : Consommation d'énergie (kWh × taux tarifaire), TVA (19,25%), frais fixes, et toute dette impayée. Les factures sont émises mensuellement pour les clients postpayés.",
    connection:
      "Pour obtenir un nouveau branchement ENEO : Visitez l'agence ENEO la plus proche avec les documents requis (pièce d'identité, justificatif de domicile, documents de propriété), payez les frais de branchement, planifiez la visite technique, et attendez l'installation.",
    outage:
      "Pour les pannes de courant : Vérifiez s'il s'agit d'une panne générale dans votre zone, vérifiez que votre compteur a des unités (pour le prépayé), contactez ENEO au 8001 pour signaler la panne, ou visitez eneo.cm pour les mises à jour des pannes.",
    greeting:
      "Bonjour {name} ! Je suis votre assistant ENEO. Comment puis-je vous aider aujourd'hui ?",
    default:
      "Je suis désolé {name}, je n'ai pas compris votre question. Vous pouvez me demander des informations sur les tarifs ENEO, les paiements, les contacts, les compteurs prépayés, les factures, les nouveaux branchements, ou les pannes de courant.",
  },
};

// FIXED: Enhanced chatbot route with better error handling
app.post("/api/chatbot/message", async (req, res) => {
  console.log("Chatbot request received:", req.body);

  try {
    const { message, language = "auto", userName = "Guest", userId } = req.body;

    // Validate input
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Message is required",
        response: "Please provide a message.",
      });
    }

    let user = null;

    // Try to handle user management, but don't fail if database is unavailable
    try {
      if (userId && mongoose.connection.readyState === 1) {
        user = await User.findOne({ userId });
        if (!user) {
          user = new User({
            userId,
            name: userName,
            preferredLanguage: language === "auto" ? "en" : language,
          });
          await user.save();
        } else if (userName !== "Guest" && user.name !== userName) {
          user.name = userName;
          await user.save();
        }
      }
    } catch (dbError) {
      console.warn(
        "Database operation failed, continuing without user management:",
        dbError.message
      );
    }

    // Detect language if auto
    const detectedLang =
      language === "auto" ? detectLanguage(message) : language;
    const finalLang = ["en", "fr"].includes(detectedLang)
      ? detectedLang
      : user?.preferredLanguage || "en";

    // Update user's preferred language (if database available)
    try {
      if (
        user &&
        user.preferredLanguage !== finalLang &&
        mongoose.connection.readyState === 1
      ) {
        user.preferredLanguage = finalLang;
        await user.save();
      }
    } catch (dbError) {
      console.warn(
        "Failed to update user language preference:",
        dbError.message
      );
    }

    const displayName = user?.name || userName;

    // Generate response
    const response = await generateChatbotResponse(
      message,
      finalLang,
      displayName
    );

    // Save to chat history (if database available)
    try {
      if (user && mongoose.connection.readyState === 1) {
        user.chatHistory.push({
          message,
          response,
          timestamp: new Date(),
        });
        // Keep only last 50 messages
        if (user.chatHistory.length > 50) {
          user.chatHistory = user.chatHistory.slice(-50);
        }
        await user.save();
      }
    } catch (dbError) {
      console.warn("Failed to save chat history:", dbError.message);
    }

    console.log("Chatbot response generated:", {
      response,
      language: finalLang,
    });

    res.json({
      success: true,
      response,
      language: finalLang,
      userName: displayName,
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      response: "I'm sorry, I'm having trouble right now. Please try again.",
    });
  }
});

let CAMPAY_PAYMENT_API = "https://www.campay.net/api";
let CAMPAY_PAYMENT_TOKEN = "0675a6a0848213fb0dc2ea6ac15a042e8d285d75";

app.post("/api/payment", async (req, res) => {
  let { amount, currency, phone, externalId, payer, payerMessage, payeeNote } = req.body;
  const headersList = {
    Authorization: `Token ${CAMPAY_PAYMENT_TOKEN}`,
    "Content-Type": "application/json",
  };
  let amt = 100;
  const bodyContent = JSON.stringify({
    amount: amt.toString(),
    from: "237" + phone,
    description: payerMessage,
    external_reference: externalId, // put a unique external id for transaction
  });
  try {
    const response = await fetch(`${CAMPAY_PAYMENT_API}/collect/`, {
      method: "POST",
      body: bodyContent,
      headers: headersList,
    });
    const paymentStatusResponse = await response.json();
    console.log("paymentStatusResponse", paymentStatusResponse);
    return res.status(200).json(paymentStatusResponse);
  } catch (error) {
    console.error("Error initialing payment:", error);
    return res
      .status(400)
      .send({
        message: "Transaction failed please start back",
        statusError: true,
      });
  }
});

app.put("/api/verify/:id", async (req, res) => {
  //:id is the transaction id obtain from the the initial payment function
  const headersList = {
    Authorization: `Token ${CAMPAY_PAYMENT_TOKEN}`,
    "Content-Type": "application/json",
  };
console.log(req.body);
  try {
    const response = await fetch(
      `${CAMPAY_PAYMENT_API}/transaction/${req.params.id}/`,
      {
        method: "GET",
        headers: headersList,
      }
    );
    const paymentStatusResponse = await response.json();
    console.log(paymentStatusResponse);
    if (paymentStatusResponse.status === "SUCCESSFUL") {
      console.log(req.body);
      //logic for successful payment
    }
    // note if payment not yet validated or failed it with not enter the above if function
    return res.status(200).json(paymentStatusResponse);
  } catch (error) {
    console.error("Error polling payment status:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// FIXED: Simplified chatbot response generation
async function generateChatbotResponse(message, language, userName) {
  try {
    console.log("Generating response for:", { message, language, userName });

    const messageLower = message.toLowerCase().trim();
    const faq = faqData[language] || faqData["en"];

    // Check for greeting
    const greetings = ["hello", "hi", "bonjour", "salut", "hey", "hallo"];
    if (greetings.some((greeting) => messageLower.includes(greeting))) {
      return faq.greeting.replace("{name}", userName);
    }

    // Check FAQ data first
    for (const [key, value] of Object.entries(faq)) {
      if (key === "greeting" || key === "default") continue;

      const keywords = getKeywordsForTopic(key, language);
      if (keywords.some((keyword) => messageLower.includes(keyword))) {
        return value.replace("{name}", userName);
      }
    }

    // FIXED: Simplified web search with better error handling
    try {
      const webSearchResult = await searchEneoWebsite(message, language);
      if (webSearchResult && webSearchResult.trim()) {
        return `${userName}, ${webSearchResult}`;
      }
    } catch (error) {
      console.warn(
        "Website search failed, using default response:",
        error.message
      );
    }

    // Default response if nothing found
    return faq.default.replace("{name}", userName);
  } catch (error) {
    console.error("Error generating chatbot response:", error);
    const faq = faqData[language] || faqData["en"];
    return faq.default.replace("{name}", userName);
  }
}

// FIXED: Simplified and more reliable web search
async function searchEneoWebsite(query, language) {
  try {
    console.log("Searching ENEO website for:", query);

    // Simplified search with better error handling
    const searchUrl =
      language === "fr" ? `https://www.eneo.cm/fr/` : `https://www.eneo.cm/en/`;

    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 10000,
      maxRedirects: 3,
    });

    const extractedContent = extractEneoContent(response.data, query, language);
    console.log("Extracted content:", extractedContent ? "Found" : "Not found");

    return extractedContent;
  } catch (error) {
    console.warn("ENEO website search failed:", error.message);
    return null;
  }
}

// FIXED: Simplified content extraction
function extractEneoContent(html, query, language) {
  try {
    const $ = cheerio.load(html);
    const queryKeywords = query
      .toLowerCase()
      .split(" ")
      .filter((word) => word.length > 2);

    // Remove unwanted elements
    $("script, style, nav, footer, header, .menu, .navigation").remove();

    // Look for content in common containers
    const contentSelectors = [".content", ".main", "article", ".info", "p"];

    for (const selector of contentSelectors) {
      const elements = $(selector);

      for (let i = 0; i < elements.length; i++) {
        const text = $(elements[i]).text().trim();

        if (text.length > 50 && text.length < 400) {
          const textLower = text.toLowerCase();
          const matchCount = queryKeywords.filter((keyword) =>
            textLower.includes(keyword)
          ).length;

          if (matchCount > 0) {
            return text.substring(0, 300) + (text.length > 300 ? "..." : "");
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.warn("Content extraction error:", error.message);
    return null;
  }
}

// FIXED: Simplified language detection
function detectLanguage(text) {
  const textLower = text.toLowerCase();

  const frenchIndicators = [
    "bonjour",
    "merci",
    "comment",
    "pourquoi",
    "combien",
    "facture",
    "paiement",
    "électricité",
    "où",
    "que",
    "qui",
  ];
  const englishIndicators = [
    "hello",
    "thank",
    "how",
    "why",
    "much",
    "bill",
    "payment",
    "electricity",
    "where",
    "what",
    "who",
  ];

  let frenchScore = frenchIndicators.filter((word) =>
    textLower.includes(word)
  ).length;
  let englishScore = englishIndicators.filter((word) =>
    textLower.includes(word)
  ).length;

  // Default to English if no clear indicators
  return frenchScore > englishScore ? "fr" : "en";
}

// FIXED: Enhanced keywords with more variations
function getKeywordsForTopic(topic, language) {
  const keywords = {
    en: {
      tariffs: [
        "tariff",
        "rate",
        "price",
        "cost",
        "billing",
        "charge",
        "fee",
        "amount",
      ],
      payment: [
        "payment",
        "pay",
        "momo",
        "orange",
        "money",
        "transfer",
        "transaction",
      ],
      contact: [
        "contact",
        "phone",
        "call",
        "support",
        "help",
        "service",
        "customer",
      ],
      prepaid: ["prepaid", "recharge", "units", "token", "credit", "top", "up"],
      bill: ["bill", "invoice", "statement", "debt", "balance", "due", "owe"],
      connection: [
        "connection",
        "installation",
        "new",
        "subscribe",
        "connect",
        "install",
      ],
      outage: [
        "outage",
        "blackout",
        "power",
        "electricity",
        "cut",
        "off",
        "down",
        "fault",
      ],
    },
    fr: {
      tariffs: [
        "tarif",
        "prix",
        "coût",
        "facturation",
        "charge",
        "frais",
        "montant",
      ],
      payment: [
        "paiement",
        "payer",
        "momo",
        "orange",
        "argent",
        "virement",
        "transaction",
      ],
      contact: [
        "contact",
        "téléphone",
        "appeler",
        "support",
        "aide",
        "service",
        "client",
      ],
      prepaid: [
        "prépayé",
        "recharge",
        "unités",
        "jeton",
        "crédit",
        "rechargement",
      ],
      bill: ["facture", "relevé", "dette", "solde", "dû", "devoir"],
      connection: [
        "branchement",
        "installation",
        "nouveau",
        "abonnement",
        "connecter",
        "installer",
      ],
      outage: [
        "panne",
        "coupure",
        "électricité",
        "courant",
        "arrêt",
        "défaillance",
      ],
    },
  };

  return keywords[language]?.[topic] || keywords["en"][topic] || [];
}

// Test endpoint to verify chatbot is working
app.get("/api/chatbot/test", (req, res) => {
  res.json({
    success: true,
    message: "Chatbot API is working!",
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// Keep all other routes from original code...
// (meter routes, payment routes, etc. - they remain the same)

app.get("/api/meter/:meterNumber", async (req, res) => {
  try {
    const meter = await Meter.findOne({ meterNumber: req.params.meterNumber });
    if (!meter) {
      return res.status(404).json({ error: "Meter not found" });
    }
    res.json(meter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/calculate/kwh", async (req, res) => {
  try {
    const { meterNumber, amount } = req.body;

    const meter = await Meter.findOne({ meterNumber });
    if (!meter) {
      return res.status(404).json({ error: "Meter not found" });
    }

    const amount_to_pay = amount;
    const vat = 0.1925 * amount_to_pay;
    const debt_payment = 0.1 * amount_to_pay;
    const energy_amount = amount_to_pay - vat - debt_payment;
    const kwh = energy_amount / meter.rate;

    res.json({
      meterNumber,
      tariff: meter.tariff,
      rate: meter.rate,
      currentDebt: meter.debt,
      amountToPay: amount_to_pay,
      vat: parseFloat(vat.toFixed(2)),
      debtPayment: parseFloat(debt_payment.toFixed(2)),
      energyAmount: parseFloat(energy_amount.toFixed(2)),
      kwh: parseFloat(kwh.toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Enhanced ENEO Chatbot Server running on port ${PORT}`);
  console.log(`Test the chatbot at: http://localhost:${PORT}/api/chatbot/test`);
});

module.exports = app;
