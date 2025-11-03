// MCP Server for Bajaj Personal Loan - ChatGPT App SDK
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import { z } from 'zod';

const app = express();
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// EMI Calculation Function
function calculateEMI(principal, tenureMonths, interestRatePA) {
  // Convert annual rate to monthly rate
  const monthlyRate = interestRatePA / (12 * 100);
  
  // EMI formula: P × r × (1 + r)^n / ((1 + r)^n - 1)
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
              (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  
  return Math.round(emi);
}

// Create MCP server instance
const server = new McpServer({
  name: 'bajaj-personal-loan-app',
  version: '0.1.0',
});

// Register EMI Calculator Tool
server.registerTool(
  'calculateEMI',
  {
    title: 'Calculate Personal Loan EMI',
    description: 'Calculate monthly EMI (Equated Monthly Installment) for Bajaj Personal Loan',
    inputSchema: {
      loanAmount: z.number().min(40000).max(5500000).describe('Loan amount (₹40,000 to ₹55,00,000)'),
      tenure: z.number().int().min(12).max(96).describe('Loan tenure in months (12 to 96)'),
      interestRate: z.number().min(10).max(31).default(15).optional().describe('Annual interest rate % (10% to 31% p.a.)'),
    },
  },
  async ({ loanAmount, tenure, interestRate = 15 }) => {
    const emiAmount = calculateEMI(loanAmount, tenure, interestRate);
    const totalPayment = emiAmount * tenure;
    const totalInterest = totalPayment - loanAmount;

    const result = {
      loanAmount: `₹${loanAmount.toLocaleString('en-IN')}`,
      tenure: `${tenure} months (${Math.floor(tenure / 12)} years ${tenure % 12} months)`,
      interestRate: `${interestRate}% p.a.`,
      monthlyEMI: `₹${emiAmount.toLocaleString('en-IN')}`,
      totalInterest: `₹${totalInterest.toLocaleString('en-IN')}`,
      totalPayment: `₹${totalPayment.toLocaleString('en-IN')}`,
      processingFee: 'Up to 3.93% of loan amount (inclusive of taxes)',
    };

    return {
      content: [
        {
          type: 'text',
          text: `**EMI Calculator Result**\n\n` +
                `💰 Loan Amount: ${result.loanAmount}\n` +
                `📅 Tenure: ${result.tenure}\n` +
                `📊 Interest Rate: ${result.interestRate}\n` +
                `💳 Monthly EMI: ${result.monthlyEMI}\n` +
                `📈 Total Interest: ${result.totalInterest}\n` +
                `💵 Total Payment: ${result.totalPayment}\n\n` +
                `⚠️ This is an indicative calculation. Actual rates may vary based on eligibility.`,
        },
      ],
    };
  }
);

// Register Personal Loan Info Tool
server.registerTool(
  'getPersonalLoanInfo',
  {
    title: 'Get Personal Loan Information',
    description: 'Get comprehensive personal loan information from Bajaj Finserv including interest rates, eligibility, features, documents required, and loan variants',
    inputSchema: {
      infoType: z.enum(['overview', 'eligibility', 'features', 'interest_rates', 'documents', 'variants', 'all'])
        .describe('Type of information requested'),
    },
  },
  async ({ infoType }) => {
    const loanInfo = {
      overview: {
        title: 'Bajaj Finserv Personal Loan Overview',
        description: 'Apply for instant personal loan online of up to ₹55 lakh with minimal documentation and simple eligibility criteria.',
        highlights: [
          '💰 Loan Amount: ₹40,000 to ₹55 lakh',
          '⏱️ Quick disbursal in 24 hours*',
          '📝 Minimal documentation',
          '🔒 No collateral required',
          '💯 No hidden charges',
          '📊 Interest rates starting @ 10% p.a.',
          '📅 Flexible tenures: 12 to 96 months',
        ],
        url: 'https://www.bajajfinserv.in/personal-loan',
      },
      
      eligibility: {
        title: 'Personal Loan Eligibility Criteria',
        criteria: {
          nationality: 'Indian',
          age: '21 years to 80 years',
          employedWith: 'Public, private, or MNC',
          cibilScore: '650 or higher',
          customerProfile: 'Self-employed or Salaried',
        },
        note: 'You should be 80 years or younger at the end of the loan tenure.',
      },

      features: {
        title: 'Key Features & Benefits',
        features: [
          {
            name: 'Disbursal in 24 hours',
            description: 'Your loan amount will be credited to your account within 24 hours* of application approval.',
          },
          {
            name: 'Flexible tenures',
            description: 'Plan your loan repayment and choose tenure that suits you best (12 to 96 months).',
          },
          {
            name: 'No collateral',
            description: 'You do not need any collateral or guarantor to get your loan.',
          },
          {
            name: 'No hidden charges',
            description: 'All applicable fees and charges are mentioned up front.',
          },
          {
            name: '3 unique variants',
            description: 'Pick the loan variant that suits you best: Term loan, Flexi Term (Dropline) Loan, and Flexi Hybrid Term Loan.',
          },
          {
            name: 'Loan of up to ₹55 lakh',
            description: 'Manage your small or large expenses with loans ranging from ₹40,000 to ₹55 lakh.',
          },
          {
            name: 'Approval in just 5 minutes',
            description: 'Complete your entire application online and get instant approval.',
          },
        ],
      },

      interest_rates: {
        title: 'Personal Loan Interest Rate and Charges',
        charges: [
          { type: 'Rate of interest per annum', amount: '10% to 31% p.a.' },
          { type: 'Processing fees', amount: 'Up to 3.93% of loan amount (inclusive of taxes)' },
          { type: 'Bounce charges', amount: '₹700 to ₹1,200 per bounce' },
          { type: 'Prepayment charges (Term Loan)', amount: 'Up to 4.72% (inclusive of taxes) on outstanding amount' },
          { type: 'Flexi Facility Charge', amount: '₹1,999 to ₹12,999 (for Flexi Loans only)' },
          { type: 'Penal charge', amount: 'Up to 36% per annum from due date' },
        ],
        note: 'Stamp duty is payable as per state laws and deducted upfront from loan amount.',
      },

      documents: {
        title: 'Documents Required for Personal Loan',
        documents: [
          'PAN Card',
          'Aadhaar Card / Passport / Voter ID / Driving License',
          'Latest 3 months salary slips',
          'Last 3 months bank account statements',
          'Employee ID card',
          'Address proof (utility bill, property tax receipt, etc.)',
          'Recent photograph',
        ],
        note: 'Additional documents may be required based on your profile.',
      },

      variants: {
        title: 'Compare Personal Loan Variants',
        variants: [
          {
            name: 'Term Loan',
            description: 'Fixed EMIs that cover both principal and interest',
            features: [
              'Fixed EMI throughout tenure',
              'Predictable payments',
              'Simple structure',
              'Best for regular income',
              'Tenure: 12 to 96 months',
            ],
            charges: 'No Flexi facility charges',
            partPrepayment: 'Up to 4.72% (inclusive of taxes)',
          },
          {
            name: 'Flexi Hybrid Term Loan',
            description: 'Interest-only EMIs for initial 24 months',
            features: [
              'Interest-only EMIs for first 24 months',
              'Principal repayment starts from 25th month',
              'Lower initial burden',
              'Multiple withdrawals allowed',
              'No part-prepayment charges',
            ],
            charges: 'Flexi facility charges: ₹1,999 to ₹12,999',
            tenure: 'Initial: 24 months, Subsequent: Up to 72 months',
          },
          {
            name: 'Flexi Term (Dropline) Loan',
            description: 'Fixed EMIs with flexible prepayment options',
            features: [
              'Fixed EMIs on withdrawn amount',
              'Decreasing principal over time',
              'Part payment options',
              'No part-prepayment charges',
              'Multiple withdrawals allowed',
            ],
            charges: 'Flexi facility charges: ₹1,999 to ₹12,999',
            tenure: '12 to 96 months',
          },
        ],
      },
    };

    let responseData;
    if (infoType === 'all') {
      responseData = loanInfo;
    } else {
      responseData = loanInfo[infoType];
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(responseData, null, 2),
        },
      ],
    };
  }
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true, status: 'MCP Server is running' });
});

// MCP endpoint using SSE transport
app.get('/mcp', async (req, res) => {
  const transport = new SSEServerTransport('/mcp', res);
  await server.connect(transport);
});

app.post('/mcp', async (req, res) => {
  const transport = new SSEServerTransport('/mcp', res);
  await server.connect(transport);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ MCP Server running on http://localhost:${PORT}`);
  console.log(`📡 MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
