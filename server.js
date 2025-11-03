// server.js — Minimal MCP-like Express server
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// Configure CORS for ChatGPT
app.use(cors({
  origin: ['https://chatgpt.com', 'https://chat.openai.com'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(bodyParser.json());

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://chatgpt.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});


// Serve a static descriptor — ChatGPT will GET this URL to learn the app's tools
app.get('/.well-known/mcp-descriptor.json', (req, res) => {
  const descPath = path.join(__dirname, 'mcp-descriptor.json');
  if (!fs.existsSync(descPath)) return res.status(500).json({ error: 'Descriptor missing' });

  try {
    const content = fs.readFileSync(descPath, 'utf8');
    const descriptor = JSON.parse(content);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', 'https://chatgpt.com');
    res.json(descriptor);
  } catch (error) {
    console.error('Error reading descriptor:', error);
    res.status(500).json({ error: 'Invalid descriptor file' });
  }
});


// Example tool: getWeather
app.post('/tool/getWeather', (req, res) => {
  const { city } = req.body || {};
  if (!city) return res.status(400).json({ error: 'Missing city in request body' });


  // Fake response — replace with a real API call (OpenWeatherMap, etc.)
  const result = {
    city,
    tempC: 24,
    condition: 'Partly cloudy',
    // _meta is optional and can contain a small HTML snippet to render in ChatGPT's UI
    _meta: `<div style="font-family:Arial,sans-serif;padding:6px;border-radius:8px;">
<strong>${city}</strong>: 24°C · Partly cloudy
<div style="font-size:11px;opacity:0.8">Click for full forecast</div>
</div>`
  };


  res.json(result);
});

// Personal Loan Information tool
app.post('/tool/getPersonalLoanInfo', (req, res) => {
  const { loanAmount = 100000, tenure = 96, loanVariant = 'flexi_hybrid', infoType } = req.body || {};

  if (!infoType) {
    return res.status(400).json({ error: 'Missing infoType in request body' });
  }

  // Validate loan amount
  if (loanAmount < 40000 || loanAmount > 5500000) {
    return res.status(400).json({ error: 'Loan amount must be between ₹40,000 and ₹55,00,000' });
  }

  // Validate tenure
  if (tenure < 12 || tenure > 96) {
    return res.status(400).json({ error: 'Tenure must be between 12 and 96 months' });
  }

  // Calculate EMI based on variant and amount
  const calculateEMI = (amount, tenureMonths, variant) => {
    let rate = 0.15; // 15% annual rate
    let monthlyRate = rate / 12;

    switch (variant) {
      case 'term_loan':
        // Standard EMI calculation
        return Math.round((amount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
          (Math.pow(1 + monthlyRate, tenureMonths) - 1));
      case 'flexi_hybrid':
        // Interest-only for first 24 months, then regular EMI
        if (tenureMonths <= 24) {
          return Math.round(amount * monthlyRate); // Interest only
        } else {
          return Math.round(amount * monthlyRate * 1.7); // Approximation for subsequent EMI
        }
      case 'flexi_dropline':
        return Math.round(amount * monthlyRate * 1.44); // Approximation
      default:
        return Math.round(amount * monthlyRate * 1.27);
    }
  };

  const eligibilityCriteria = {
    minAge: 21,
    maxAge: 80,
    nationality: "Indian",
    employment: "Public, private, or MNC",
    cibilScore: 650
  };

  const features = [
    "Disbursal in 24 hours",
    "Flexible tenures from 12 to 96 months",
    "No collateral required",
    "No hidden charges",
    "3 unique loan variants",
    "Loan amount up to ₹55 lakh",
    "Quick approval in 5 minutes",
    "No guarantor needed"
  ];

  const documentsRequired = [
    "Aadhaar/Passport/Voter ID/Driving License",
    "PAN Card",
    "Employee ID Card",
    "Salary slips of last 3 months",
    "Bank statements of previous 3 months",
    "Utility bills (Gas/Electricity/Phone)"
  ];

  const charges = {
    interestRate: "10% to 31% p.a.",
    processingFee: "Up to 3.93% of loan amount (inclusive of taxes)",
    prepaymentCharges: "Up to 4.72% for Term Loan, No charges for Flexi loans",
    bounceCharges: "₹700 to ₹1,200 per bounce"
  };

  const variants = [
    {
      name: "Term Loan",
      description: "Fixed EMIs covering both principal and interest",
      features: ["Single disbursement", "12-96 months tenure", "No flexi facility charges"]
    },
    {
      name: "Flexi Hybrid Term Loan",
      description: "Interest-only EMIs for initial 24 months, then regular EMIs",
      features: ["Flexible withdrawals", "No part-prepayment charges", "Interest-only EMIs initially"]
    },
    {
      name: "Flexi Term (Dropline) Loan",
      description: "Fixed EMIs on withdrawn amount with flexible repayment",
      features: ["Multiple withdrawals", "No part-prepayment charges", "Flexible repayment"]
    }
  ];

  const emiAmount = calculateEMI(loanAmount, tenure, loanVariant);

  let result = {
    loanAmount,
    tenure,
    loanVariant,
    emiAmount
  };

  // Add information based on requested type
  switch (infoType) {
    case 'emi_calculation':
      result.interestRate = "15% p.a. (approx)";
      result.processingFee = charges.processingFee;
      break;
    case 'eligibility':
      result.eligibility = eligibilityCriteria;
      break;
    case 'features':
      result.features = features;
      break;
    case 'interest_rates':
      result.charges = charges;
      break;
    case 'documents':
      result.documents = documentsRequired;
      break;
    case 'all':
      result.eligibility = eligibilityCriteria;
      result.features = features;
      result.documents = documentsRequired;
      result.charges = charges;
      result.variants = variants;
      result.interestRate = "15% p.a. (approx)";
      result.processingFee = charges.processingFee;
      break;
  }

  // Add meta HTML for rich display
  const variantName = variants.find(v => v.name.toLowerCase().includes(loanVariant.replace('_', ' ')))?.name || 'Personal Loan';

  result._meta = `<div style="font-family:Arial,sans-serif;padding:12px;border-radius:8px;background:#f8f9fa;border-left:4px solid #007bff;">
<h3 style="margin:0 0 8px 0;color:#007bff;">Bajaj Finserv ${variantName}</h3>
<div style="display:flex;gap:20px;margin-bottom:8px;">
<div><strong>Loan Amount:</strong> ₹${loanAmount.toLocaleString('en-IN')}</div>
<div><strong>EMI:</strong> ₹${emiAmount.toLocaleString('en-IN')}</div>
<div><strong>Tenure:</strong> ${tenure} months</div>
</div>
<div style="font-size:12px;color:#666;">
Interest rates from 10% p.a. • Quick approval in 5 minutes • No collateral required
</div>
<div style="font-size:11px;margin-top:4px;color:#888;">
Click to apply online or get more details
</div>
</div>`;

  res.json(result);
});


// Health check
app.get('/health', (req, res) => res.json({ ok: true }));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MCP-like server listening on http://localhost:${PORT}`));
