import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
class BajajPersonalLoanServer {
    constructor() {
        this.server = new Server({
            name: "bajaj-personal-loan-server",
            version: "1.0.0",
        }, {
            capabilities: {
                resources: {},
                tools: {},
            },
        });
        this.setupHandlers();
    }
    setupHandlers() {
        // List available resources
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
            resources: [
                {
                    uri: "ui://loan/personal-loan-dashboard.html",
                    mimeType: "text/html+skybridge",
                    name: "Personal Loan Dashboard",
                    description: "Interactive personal loan information dashboard",
                },
                {
                    uri: "ui://loan/emi-calculator.html",
                    mimeType: "text/html+skybridge",
                    name: "EMI Calculator",
                    description: "Interactive EMI calculator widget",
                },
                {
                    uri: "ui://loan/loan-comparison.html",
                    mimeType: "text/html+skybridge",
                    name: "Loan Comparison",
                    description: "Compare different loan variants",
                },
            ],
        }));
        // Read resource content
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const { uri } = request.params;
            switch (uri) {
                case "ui://loan/personal-loan-dashboard.html":
                    return {
                        contents: [
                            {
                                uri,
                                mimeType: "text/html+skybridge",
                                text: this.getPersonalLoanDashboardHTML(),
                                _meta: {
                                    "openai/widgetPrefersBorder": true,
                                    "openai/widgetDomain": "https://chatgpt.com",
                                    "openai/widgetCSP": {
                                        connect_domains: ["https://chatgpt.com"],
                                        resource_domains: ["https://*.oaistatic.com"],
                                    },
                                },
                            },
                        ],
                    };
                case "ui://loan/emi-calculator.html":
                    return {
                        contents: [
                            {
                                uri,
                                mimeType: "text/html+skybridge",
                                text: this.getEMICalculatorHTML(),
                                _meta: {
                                    "openai/widgetPrefersBorder": true,
                                    "openai/widgetDomain": "https://chatgpt.com",
                                    "openai/widgetCSP": {
                                        connect_domains: ["https://chatgpt.com"],
                                        resource_domains: ["https://*.oaistatic.com"],
                                    },
                                },
                            },
                        ],
                    };
                case "ui://loan/loan-comparison.html":
                    return {
                        contents: [
                            {
                                uri,
                                mimeType: "text/html+skybridge",
                                text: this.getLoanComparisonHTML(),
                                _meta: {
                                    "openai/widgetPrefersBorder": true,
                                    "openai/widgetDomain": "https://chatgpt.com",
                                    "openai/widgetCSP": {
                                        connect_domains: ["https://chatgpt.com"],
                                        resource_domains: ["https://*.oaistatic.com"],
                                    },
                                },
                            },
                        ],
                    };
                default:
                    throw new Error(`Unknown resource: ${uri}`);
            }
        });
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "show_personal_loan_info",
                    description: "Display comprehensive personal loan information from Bajaj Finserv",
                    inputSchema: {
                        type: "object",
                        properties: {
                            section: {
                                type: "string",
                                enum: ["overview", "features", "eligibility", "variants"],
                                description: "Which section of loan information to display",
                            },
                        },
                    },
                    _meta: {
                        "openai/outputTemplate": "ui://loan/personal-loan-dashboard.html",
                        "openai/toolInvocation/invoking": "Loading personal loan information...",
                        "openai/toolInvocation/invoked": "Personal loan information displayed",
                    },
                },
                {
                    name: "calculate_emi",
                    description: "Calculate EMI for personal loan with different parameters",
                    inputSchema: {
                        type: "object",
                        properties: {
                            amount: {
                                type: "number",
                                minimum: 40000,
                                maximum: 5500000,
                                description: "Loan amount in rupees",
                            },
                            tenure: {
                                type: "number",
                                minimum: 12,
                                maximum: 96,
                                description: "Loan tenure in months",
                            },
                            interestRate: {
                                type: "number",
                                minimum: 10,
                                maximum: 31,
                                description: "Annual interest rate percentage",
                            },
                        },
                        required: ["amount", "tenure", "interestRate"],
                    },
                    _meta: {
                        "openai/outputTemplate": "ui://loan/emi-calculator.html",
                        "openai/toolInvocation/invoking": "Calculating EMI...",
                        "openai/toolInvocation/invoked": "EMI calculated successfully",
                    },
                },
                {
                    name: "compare_loan_variants",
                    description: "Compare different personal loan variants offered by Bajaj Finserv",
                    inputSchema: {
                        type: "object",
                        properties: {
                            amount: {
                                type: "number",
                                minimum: 40000,
                                maximum: 5500000,
                                description: "Loan amount for comparison",
                            },
                        },
                    },
                    _meta: {
                        "openai/outputTemplate": "ui://loan/loan-comparison.html",
                        "openai/toolInvocation/invoking": "Comparing loan variants...",
                        "openai/toolInvocation/invoked": "Loan variants comparison ready",
                    },
                },
            ],
        }));
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            switch (name) {
                case "show_personal_loan_info":
                    return this.handlePersonalLoanInfo(args);
                case "calculate_emi":
                    return this.handleEMICalculation(args);
                case "compare_loan_variants":
                    return this.handleLoanComparison(args);
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        });
    }
    handlePersonalLoanInfo(args) {
        const loanData = this.getPersonalLoanData();
        return {
            content: [
                {
                    type: "text",
                    text: "Here's the comprehensive personal loan information from Bajaj Finserv. You can explore different loan features, eligibility criteria, and benefits.",
                },
            ],
            structuredContent: {
                section: args.section || "overview",
                loanInfo: loanData,
            },
            _meta: {
                lastUpdated: new Date().toISOString(),
            },
        };
    }
    handleEMICalculation(args) {
        const monthlyRate = args.interestRate / 12 / 100;
        const emi = Math.round((args.amount * monthlyRate * Math.pow(1 + monthlyRate, args.tenure)) /
            (Math.pow(1 + monthlyRate, args.tenure) - 1));
        const totalAmount = emi * args.tenure;
        const totalInterest = totalAmount - args.amount;
        return {
            content: [
                {
                    type: "text",
                    text: `EMI calculated for loan amount ₹${args.amount.toLocaleString("en-IN")} over ${args.tenure} months at ${args.interestRate}% p.a.`,
                },
            ],
            structuredContent: {
                calculation: {
                    loanAmount: args.amount,
                    tenure: args.tenure,
                    interestRate: args.interestRate,
                    emi,
                    totalAmount,
                    totalInterest,
                },
            },
        };
    }
    handleLoanComparison(args) {
        const amount = args.amount || 100000;
        const variants = this.getLoanVariants(amount);
        return {
            content: [
                {
                    type: "text",
                    text: "Here's a comparison of different personal loan variants. Each variant has unique features and repayment structures.",
                },
            ],
            structuredContent: {
                amount,
                variants,
            },
        };
    }
    getPersonalLoanData() {
        return {
            overview: {
                title: "Bajaj Finserv Personal Loan",
                subtitle: "For salaried & self-employed individuals | No collateral required | Simple process",
                rating: 4.8,
                reviews: "2,58,868",
                keyPoints: [
                    "No collateral and no hidden charges",
                    "Online application and disbursement in 24 hours*",
                    "Attractive interest rates starting @ 10% p.a.",
                    "Quick approval in 5 minutes*",
                ],
            },
            features: [
                {
                    icon: "⏰",
                    title: "Disbursal in 24 hours*",
                    description: "Your loan amount will be credited to your account within 24 hours* of application approval.",
                },
                {
                    icon: "📅",
                    title: "Flexible tenures",
                    description: "Plan your loan repayment and choose tenure that suits you best.",
                },
                {
                    icon: "🔓",
                    title: "No collateral",
                    description: "You do not need any collateral or guarantor to get your loan.",
                },
                {
                    icon: "💰",
                    title: "No hidden charges",
                    description: "All applicable fees and charges are mentioned up front. There are no hidden charges.",
                },
            ],
            eligibility: {
                nationality: "Indian",
                age: "21 years to 80 years",
                employment: "Public, private, or MNC",
                cibilScore: "650 or higher",
                customerProfile: "Self-employed or Salaried",
            },
            interestRates: {
                min: 10,
                max: 31,
                unit: "% p.a.",
            },
            loanAmount: {
                min: 40000,
                max: 5500000,
            },
        };
    }
    getLoanVariants(amount) {
        return [
            {
                name: "Term Loan",
                description: "Fixed EMIs covering both principal and interest",
                features: [
                    "Fixed EMIs that cover both the principal and interest",
                    "Tenure: 12 months to 96 months",
                    "Single disbursement of the loan amount",
                    "Pre-payment charges apply",
                ],
                emi: "₹1,571",
                tenure: "96 months",
            },
            {
                name: "Flexi Hybrid Term Loan",
                description: "Interest-only EMIs initially, then regular EMIs",
                features: [
                    "Interest-only EMIs for the initial part of the loan tenure",
                    "Initial tenure: 24 months, Subsequent tenure: Up to 72 months",
                    "No part-prepayment charges",
                    "Withdraw and prepay conveniently from your sanctioned loan limit",
                ],
                emi: "₹1,250 (Initial) / ₹2,115 (Subsequent)",
                tenure: "24 + 72 months",
            },
            {
                name: "Flexi Term (Dropline) Loan",
                description: "Fixed EMIs with flexible withdrawal facility",
                features: [
                    "Fixed EMIs that cover both the principal and interest on the withdrawn amount",
                    "Tenure: 12 months to 96 months",
                    "No part-prepayment charges",
                    "Withdraw and prepay conveniently from your sanctioned loan limit",
                ],
                emi: "₹1,795",
                tenure: "12-96 months",
            },
        ];
    }
    getPersonalLoanDashboardHTML() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bajaj Personal Loan Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header h1 {
            color: #2c3e50;
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #7f8c8d;
            font-size: 1.1rem;
            margin-bottom: 20px;
        }
        
        .rating {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .stars {
            color: #f39c12;
            font-size: 1.5rem;
        }
        
        .rating-text {
            font-weight: 600;
            color: #2c3e50;
        }
        
        .key-points {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .key-point {
            background: #e8f5e8;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #27ae60;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }
        
        .feature-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }
        
        .feature-icon {
            font-size: 3rem;
            margin-bottom: 15px;
            display: block;
        }
        
        .feature-title {
            font-size: 1.3rem;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .feature-desc {
            color: #7f8c8d;
            line-height: 1.5;
        }
        
        .eligibility-section {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .section-title {
            font-size: 2rem;
            color: #2c3e50;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .eligibility-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .eligibility-item {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        
        .eligibility-label {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .eligibility-value {
            color: #27ae60;
            font-weight: 500;
        }
        
        .cta-section {
            background: linear-gradient(45deg, #3498db, #2980b9);
            color: white;
            padding: 40px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .cta-button {
            background: #e74c3c;
            color: white;
            padding: 15px 40px;
            border: none;
            border-radius: 25px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s ease;
            margin-top: 20px;
        }
        
        .cta-button:hover {
            background: #c0392b;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }
            
            .features-grid {
                grid-template-columns: 1fr;
            }
            
            .container {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 id="loan-title">Bajaj Finserv Personal Loan</h1>
            <p id="loan-subtitle">For salaried & self-employed individuals | No collateral required | Simple process</p>
            
            <div class="rating">
                <span class="stars">★★★★★</span>
                <span class="rating-text">4.8</span>
                <span class="rating-text">|</span>
                <span class="rating-text" id="review-count">2,58,868 reviews</span>
            </div>
            
            <div class="key-points" id="key-points">
                <!-- Key points will be populated by JavaScript -->
            </div>
        </div>
        
        <div class="features-grid" id="features-grid">
            <!-- Features will be populated by JavaScript -->
        </div>
        
        <div class="eligibility-section">
            <h2 class="section-title">Eligibility Criteria</h2>
            <div class="eligibility-grid" id="eligibility-grid">
                <!-- Eligibility criteria will be populated by JavaScript -->
            </div>
        </div>
        
        <div class="cta-section">
            <h2>Ready to Apply?</h2>
            <p>Get your personal loan approved in just 5 minutes with minimal documentation.</p>
            <button class="cta-button" onclick="initiateApplication()">Apply Now</button>
        </div>
    </div>
    
    <script>
        // Get data from MCP server
        const loanData = window.openai?.toolOutput?.loanInfo || {};
        
        function populateContent() {
            const overview = loanData.overview || {};
            const features = loanData.features || [];
            const eligibility = loanData.eligibility || {};
            
            // Populate header
            if (overview.title) {
                document.getElementById('loan-title').textContent = overview.title;
            }
            if (overview.subtitle) {
                document.getElementById('loan-subtitle').textContent = overview.subtitle;
            }
            if (overview.reviews) {
                document.getElementById('review-count').textContent = overview.reviews + ' reviews';
            }
            
            // Populate key points
            const keyPointsContainer = document.getElementById('key-points');
            if (overview.keyPoints) {
                keyPointsContainer.innerHTML = overview.keyPoints.map(point => 
                    '<div class="key-point">' + point + '</div>'
                ).join('');
            }
            
            // Populate features
            const featuresContainer = document.getElementById('features-grid');
            if (features.length > 0) {
                featuresContainer.innerHTML = features.map(feature => 
                    '<div class="feature-card">' +
                    '<span class="feature-icon">' + feature.icon + '</span>' +
                    '<h3 class="feature-title">' + feature.title + '</h3>' +
                    '<p class="feature-desc">' + feature.description + '</p>' +
                    '</div>'
                ).join('');
            }
            
            // Populate eligibility
            const eligibilityContainer = document.getElementById('eligibility-grid');
            if (Object.keys(eligibility).length > 0) {
                eligibilityContainer.innerHTML = Object.entries(eligibility).map(([key, value]) => 
                    '<div class="eligibility-item">' +
                    '<div class="eligibility-label">' + key.charAt(0).toUpperCase() + key.slice(1) + '</div>' +
                    '<div class="eligibility-value">' + value + '</div>' +
                    '</div>'
                ).join('');
            }
        }
        
        function initiateApplication() {
            if (window.openai && window.openai.openExternal) {
                window.openai.openExternal('https://www.bajajfinserv.in/personal-loan');
            } else {
                alert('Personal loan application process would start here.');
            }
        }
        
        // Initialize content when page loads
        document.addEventListener('DOMContentLoaded', populateContent);
        
        // Also try to populate immediately in case DOMContentLoaded already fired
        populateContent();
    </script>
</body>
</html>
`;
    }
    getEMICalculatorHTML() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EMI Calculator</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        
        .calculator-container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }
        
        .calculator-title {
            text-align: center;
            color: #2c3e50;
            font-size: 2.2rem;
            margin-bottom: 30px;
        }
        
        .input-group {
            margin-bottom: 25px;
        }
        
        .input-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #2c3e50;
        }
        
        .input-field {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #bdc3c7;
            border-radius: 10px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }
        
        .input-field:focus {
            outline: none;
            border-color: #3498db;
        }
        
        .slider-container {
            margin-top: 10px;
        }
        
        .slider {
            width: 100%;
            height: 6px;
            border-radius: 5px;
            background: #bdc3c7;
            outline: none;
            -webkit-appearance: none;
        }
        
        .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #3498db;
            cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #3498db;
            cursor: pointer;
            border: none;
        }
        
        .results-container {
            background: linear-gradient(45deg, #27ae60, #2ecc71);
            border-radius: 15px;
            padding: 30px;
            margin-top: 30px;
            color: white;
        }
        
        .result-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .result-item:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }
        
        .result-label {
            font-weight: 500;
        }
        
        .result-value {
            font-weight: 700;
            font-size: 1.1rem;
        }
        
        .emi-highlight {
            text-align: center;
            font-size: 2.5rem;
            font-weight: 800;
            margin: 20px 0;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }
    </style>
</head>
<body>
    <div class="calculator-container">
        <h1 class="calculator-title">Personal Loan EMI Calculator</h1>
        
        <div class="input-group">
            <label class="input-label">Loan Amount (₹)</label>
            <input type="number" class="input-field" id="loanAmount" 
                   min="40000" max="5500000" value="100000">
            <div class="slider-container">
                <input type="range" class="slider" id="amountSlider" 
                       min="40000" max="5500000" value="100000" step="10000">
            </div>
        </div>
        
        <div class="input-group">
            <label class="input-label">Tenure (Months)</label>
            <input type="number" class="input-field" id="tenure" 
                   min="12" max="96" value="36">
            <div class="slider-container">
                <input type="range" class="slider" id="tenureSlider" 
                       min="12" max="96" value="36" step="6">
            </div>
        </div>
        
        <div class="input-group">
            <label class="input-label">Interest Rate (% per annum)</label>
            <input type="number" class="input-field" id="interestRate" 
                   min="10" max="31" value="15" step="0.1">
            <div class="slider-container">
                <input type="range" class="slider" id="rateSlider" 
                       min="10" max="31" value="15" step="0.1">
            </div>
        </div>
        
        <div class="results-container" id="results">
            <div class="emi-highlight" id="emiAmount">₹3,140</div>
            
            <div class="result-item">
                <span class="result-label">Monthly EMI</span>
                <span class="result-value" id="monthlyEmi">₹3,140</span>
            </div>
            
            <div class="result-item">
                <span class="result-label">Total Amount Payable</span>
                <span class="result-value" id="totalAmount">₹1,13,040</span>
            </div>
            
            <div class="result-item">
                <span class="result-label">Total Interest</span>
                <span class="result-value" id="totalInterest">₹13,040</span>
            </div>
        </div>
    </div>
    
    <script>
        // Get calculation data from MCP server
        const calculationData = window.openai?.toolOutput?.calculation || {};
        
        // DOM elements
        const loanAmountInput = document.getElementById('loanAmount');
        const tenureInput = document.getElementById('tenure');
        const interestRateInput = document.getElementById('interestRate');
        
        const amountSlider = document.getElementById('amountSlider');
        const tenureSlider = document.getElementById('tenureSlider');
        const rateSlider = document.getElementById('rateSlider');
        
        const emiAmount = document.getElementById('emiAmount');
        const monthlyEmi = document.getElementById('monthlyEmi');
        const totalAmount = document.getElementById('totalAmount');
        const totalInterest = document.getElementById('totalInterest');
        
        function formatCurrency(amount) {
            return '₹' + amount.toLocaleString('en-IN');
        }
        
        function calculateEMI(principal, tenure, rate) {
            const monthlyRate = rate / 12 / 100;
            const emi = Math.round(
                (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
                (Math.pow(1 + monthlyRate, tenure) - 1)
            );
            return emi;
        }
        
        function updateCalculation() {
            const principal = parseInt(loanAmountInput.value) || 100000;
            const months = parseInt(tenureInput.value) || 36;
            const rate = parseFloat(interestRateInput.value) || 15;
            
            const emi = calculateEMI(principal, months, rate);
            const total = emi * months;
            const interest = total - principal;
            
            emiAmount.textContent = formatCurrency(emi);
            monthlyEmi.textContent = formatCurrency(emi);
            totalAmount.textContent = formatCurrency(total);
            totalInterest.textContent = formatCurrency(interest);
        }
        
        function syncInputs() {
            // Sync sliders with inputs
            amountSlider.value = loanAmountInput.value;
            tenureSlider.value = tenureInput.value;
            rateSlider.value = interestRateInput.value;
        }
        
        function setupEventListeners() {
            // Input field listeners
            loanAmountInput.addEventListener('input', () => {
                amountSlider.value = loanAmountInput.value;
                updateCalculation();
            });
            
            tenureInput.addEventListener('input', () => {
                tenureSlider.value = tenureInput.value;
                updateCalculation();
            });
            
            interestRateInput.addEventListener('input', () => {
                rateSlider.value = interestRateInput.value;
                updateCalculation();
            });
            
            // Slider listeners
            amountSlider.addEventListener('input', () => {
                loanAmountInput.value = amountSlider.value;
                updateCalculation();
            });
            
            tenureSlider.addEventListener('input', () => {
                tenureInput.value = tenureSlider.value;
                updateCalculation();
            });
            
            rateSlider.addEventListener('input', () => {
                interestRateInput.value = rateSlider.value;
                updateCalculation();
            });
        }
        
        function initializeWithServerData() {
            if (calculationData.loanAmount) {
                loanAmountInput.value = calculationData.loanAmount;
                amountSlider.value = calculationData.loanAmount;
            }
            
            if (calculationData.tenure) {
                tenureInput.value = calculationData.tenure;
                tenureSlider.value = calculationData.tenure;
            }
            
            if (calculationData.interestRate) {
                interestRateInput.value = calculationData.interestRate;
                rateSlider.value = calculationData.interestRate;
            }
            
            if (calculationData.emi) {
                emiAmount.textContent = formatCurrency(calculationData.emi);
                monthlyEmi.textContent = formatCurrency(calculationData.emi);
            }
            
            if (calculationData.totalAmount) {
                totalAmount.textContent = formatCurrency(calculationData.totalAmount);
            }
            
            if (calculationData.totalInterest) {
                totalInterest.textContent = formatCurrency(calculationData.totalInterest);
            }
        }
        
        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            initializeWithServerData();
            setupEventListeners();
            updateCalculation();
        });
        
        // Also initialize immediately
        initializeWithServerData();
        setupEventListeners();
        updateCalculation();
    </script>
</body>
</html>
`;
    }
    getLoanComparisonHTML() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loan Variants Comparison</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        
        .comparison-container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }
        
        .comparison-title {
            text-align: center;
            color: #2c3e50;
            font-size: 2.2rem;
            margin-bottom: 30px;
        }
        
        .amount-display {
            text-align: center;
            font-size: 1.3rem;
            color: #7f8c8d;
            margin-bottom: 40px;
        }
        
        .variants-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 30px;
        }
        
        .variant-card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            border: 3px solid transparent;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .variant-card:hover {
            transform: translateY(-5px);
            border-color: #3498db;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }
        
        .variant-card.recommended::before {
            content: 'RECOMMENDED';
            position: absolute;
            top: 15px;
            right: -35px;
            background: #e74c3c;
            color: white;
            padding: 5px 40px;
            font-size: 0.8rem;
            font-weight: 600;
            transform: rotate(45deg);
            z-index: 1;
        }
        
        .variant-name {
            font-size: 1.5rem;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .variant-desc {
            color: #7f8c8d;
            margin-bottom: 20px;
            line-height: 1.5;
        }
        
        .emi-info {
            background: linear-gradient(45deg, #3498db, #2980b9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .emi-amount {
            font-size: 1.8rem;
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .emi-tenure {
            font-size: 0.9rem;
            opacity: 0.9;
        }
        
        .features-list {
            list-style: none;
        }
        
        .features-list li {
            padding: 8px 0;
            border-bottom: 1px solid #ecf0f1;
            color: #2c3e50;
            position: relative;
            padding-left: 20px;
        }
        
        .features-list li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #27ae60;
            font-weight: bold;
        }
        
        .features-list li:last-child {
            border-bottom: none;
        }
        
        .choose-btn {
            width: 100%;
            padding: 12px;
            background: #27ae60;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s ease;
            margin-top: 20px;
        }
        
        .choose-btn:hover {
            background: #229954;
        }
        
        .comparison-note {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-top: 30px;
            text-align: center;
            color: #7f8c8d;
        }
        
        @media (max-width: 768px) {
            .variants-grid {
                grid-template-columns: 1fr;
            }
            
            .comparison-container {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="comparison-container">
        <h1 class="comparison-title">Personal Loan Variants Comparison</h1>
        <div class="amount-display" id="amount-display">
            Compare loan variants for ₹1,00,000
        </div>
        
        <div class="variants-grid" id="variants-grid">
            <!-- Variants will be populated by JavaScript -->
        </div>
        
        <div class="comparison-note">
            <strong>Note:</strong> All calculations are approximate. Actual rates and EMI may vary based on your profile and creditworthiness. 
            *Terms and conditions apply.
        </div>
    </div>
    
    <script>
        // Get comparison data from MCP server
        const comparisonData = window.openai?.toolOutput || {};
        
        function formatCurrency(amount) {
            return '₹' + amount.toLocaleString('en-IN');
        }
        
        function populateComparison() {
            const amount = comparisonData.amount || 100000;
            const variants = comparisonData.variants || [];
            
            // Update amount display
            document.getElementById('amount-display').textContent = 
                'Compare loan variants for ' + formatCurrency(amount);
            
            // Populate variants
            const variantsContainer = document.getElementById('variants-grid');
            
            if (variants.length > 0) {
                variantsContainer.innerHTML = variants.map((variant, index) => {
                    const isRecommended = index === 1; // Make Flexi Hybrid recommended
                    
                    return '<div class="variant-card' + (isRecommended ? ' recommended' : '') + '">' +
                        '<h3 class="variant-name">' + variant.name + '</h3>' +
                        '<p class="variant-desc">' + variant.description + '</p>' +
                        
                        '<div class="emi-info">' +
                        '<div class="emi-amount">' + variant.emi + '</div>' +
                        '<div class="emi-tenure">' + variant.tenure + '</div>' +
                        '</div>' +
                        
                        '<ul class="features-list">' +
                        variant.features.map(feature => '<li>' + feature + '</li>').join('') +
                        '</ul>' +
                        
                        '<button class="choose-btn" onclick="selectVariant(\'' + variant.name + '\')">' +
                        'Choose This Variant' +
                        '</button>' +
                        '</div>';
                }).join('');
            } else {
                // Default variants if no data from server
                variantsContainer.innerHTML = getDefaultVariantsHTML();
            }
        }
        
        function getDefaultVariantsHTML() {
            const defaultVariants = [
                {
                    name: "Term Loan",
                    description: "Fixed EMIs covering both principal and interest",
                    emi: "₹1,571",
                    tenure: "96 months",
                    features: [
                        "Fixed EMIs that cover both principal and interest",
                        "Tenure: 12 months to 96 months",
                        "Single disbursement of loan amount",
                        "Pre-payment charges apply"
                    ]
                },
                {
                    name: "Flexi Hybrid Term Loan",
                    description: "Interest-only EMIs initially, then regular EMIs",
                    emi: "₹1,250 / ₹2,115",
                    tenure: "24 + 72 months",
                    features: [
                        "Interest-only EMIs for first 24 months",
                        "Lower initial EMI burden",
                        "No part-prepayment charges",
                        "Flexible withdrawal facility"
                    ]
                },
                {
                    name: "Flexi Term (Dropline) Loan",
                    description: "Fixed EMIs with flexible withdrawal",
                    emi: "₹1,795",
                    tenure: "12-96 months",
                    features: [
                        "Fixed EMIs on withdrawn amount",
                        "Multiple withdrawals allowed",
                        "No part-prepayment charges",
                        "Annual maintenance charges apply"
                    ]
                }
            ];
            
            return defaultVariants.map((variant, index) => {
                const isRecommended = index === 1;
                
                return '<div class="variant-card' + (isRecommended ? ' recommended' : '') + '">' +
                    '<h3 class="variant-name">' + variant.name + '</h3>' +
                    '<p class="variant-desc">' + variant.description + '</p>' +
                    
                    '<div class="emi-info">' +
                    '<div class="emi-amount">' + variant.emi + '</div>' +
                    '<div class="emi-tenure">' + variant.tenure + '</div>' +
                    '</div>' +
                    
                    '<ul class="features-list">' +
                    variant.features.map(feature => '<li>' + feature + '</li>').join('') +
                    '</ul>' +
                    
                    '<button class="choose-btn" onclick="selectVariant(\'' + variant.name + '\')">' +
                    'Choose This Variant' +
                    '</button>' +
                    '</div>';
            }).join('');
        }
        
        function selectVariant(variantName) {
            if (window.openai && window.openai.openExternal) {
                window.openai.openExternal('https://www.bajajfinserv.in/personal-loan?variant=' + encodeURIComponent(variantName));
            } else {
                alert('You selected: ' + variantName + '\\n\\nThis would typically redirect to the application form.');
            }
        }
        
        // Initialize content
        document.addEventListener('DOMContentLoaded', populateComparison);
        
        // Also try to populate immediately
        populateComparison();
    </script>
</body>
</html>
`;
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }
}
// Start the server
const server = new BajajPersonalLoanServer();
server.run().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
