import { GoogleGenAI, Type } from '@google/genai';
import { Quote, SourcingRequest } from '../types/index.js';

let aiInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (aiInstance) return aiInstance;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  aiInstance = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  return aiInstance;
}

export interface StructuredSourcingOutput {
  title: string;
  category: string;
  productOrService: string;
  quantity: number;
  unit: string;
  budget: number;
  location: string;
  deliveryDeadline: string;
  qualityRequirements: string;
  specifications: string;
  customization: string;
  additionalRequirements: string;
}

const CATEGORIES = [
  'Corporate Apparel & Textiles',
  'Office & Commercial Furniture',
  'Industrial Supplies & PPE',
  'Commercial Printing & Packaging',
  'IT Hardware & Networking',
  'Agro-Allied & Commodities',
  'Building & Construction Materials',
  'Logistics & Freight Services',
];

// Fallback rule-based parsing if Gemini API key is missing or fails
function fallbackRuleBasedParser(prompt: string): StructuredSourcingOutput {
  const p = prompt.toLowerCase();
  
  // Category detection
  let category = 'Corporate Apparel & Textiles';
  if (p.includes('chair') || p.includes('desk') || p.includes('furniture') || p.includes('table') || p.includes('cabinet')) {
    category = 'Office & Commercial Furniture';
  } else if (p.includes('t-shirt') || p.includes('shirt') || p.includes('apparel') || p.includes('uniform') || p.includes('cloth') || p.includes('polo')) {
    category = 'Corporate Apparel & Textiles';
  } else if (p.includes('safety') || p.includes('boot') || p.includes('helmet') || p.includes('ppe') || p.includes('industrial') || p.includes('vest')) {
    category = 'Industrial Supplies & PPE';
  } else if (p.includes('print') || p.includes('box') || p.includes('package') || p.includes('bag') || p.includes('flyer') || p.includes('sticker')) {
    category = 'Commercial Printing & Packaging';
  } else if (p.includes('laptop') || p.includes('server') || p.includes('computer') || p.includes('monitor') || p.includes('router') || p.includes('tech')) {
    category = 'IT Hardware & Networking';
  }

  // Quantity detection
  const qtyMatch = prompt.match(/\b(\d{1,6})\s*(pcs|pieces|units|items|shirts|chairs|boxes|sets)?\b/i);
  const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 100;

  // Budget detection
  let budget = 0;
  const budgetMatch = prompt.match(/(?:₦|ngn|naira|budget\s*(?:is|of)?\s*)[:\s]*([0-9,]+(?:\.[0-9]+)?)\s*(?:million|m|k|thousand)?/i);
  if (budgetMatch) {
    let clean = budgetMatch[1].replace(/,/g, '');
    let val = parseFloat(clean);
    if (/million|m\b/i.test(prompt)) val = val < 1000 ? val * 1000000 : val;
    budget = val;
  }

  // Location detection
  const cities = ['Ibadan', 'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Benin City', 'Enugu', 'Kaduna'];
  const locMatch = cities.find((c) => p.includes(c.toLowerCase())) || 'Lagos';

  // Delivery deadline
  const timeMatch = prompt.match(/(?:within|in|delivery\s*(?:in|within))\s*(\d+\s*(?:days|weeks|months|day|week))/i);
  const deliveryDeadline = timeMatch ? `Within ${timeMatch[1]}` : 'Within 14 days';

  return {
    title: `Sourcing Request for ${quantity} units`,
    category,
    productOrService: prompt.slice(0, 80),
    quantity,
    unit: 'units',
    budget,
    location: locMatch,
    deliveryDeadline,
    qualityRequirements: 'Standard commercial grade',
    specifications: prompt,
    customization: prompt.includes('branded') || prompt.includes('custom') ? 'Custom branding required' : 'Standard specifications',
    additionalRequirements: 'Delivery with full inspection on receipt',
  };
}

export async function parseSourcingPrompt(naturalLanguagePrompt: string): Promise<StructuredSourcingOutput> {
  const ai = getAIClient();
  if (!ai) {
    return fallbackRuleBasedParser(naturalLanguagePrompt);
  }

  try {
    const prompt = `You are the lead procurement AI engine for AI Middleman, a commercial sourcing marketplace in Nigeria.
Convert the user's natural language procurement request into structured procurement requirements.

Supported main categories:
${CATEGORIES.map((c) => `- ${c}`).join('\n')}

Extract accurate details. Convert currency to Nigerian Naira (NGN) numeric integer without symbols (e.g., 1.5 million -> 1500000, 8 million -> 8000000).
If specific fields are omitted, infer reasonable procurement defaults.

User Request: "${naturalLanguagePrompt}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Short professional procurement title' },
            category: { type: Type.STRING, description: 'Best matching category from the supported categories' },
            productOrService: { type: Type.STRING, description: 'The exact product or service required' },
            quantity: { type: Type.INTEGER, description: 'Quantity required as positive integer' },
            unit: { type: Type.STRING, description: 'Unit of measure e.g. units, pieces, cartons, sets' },
            budget: { type: Type.NUMBER, description: 'Budget in NGN numeric value (e.g. 1500000), 0 if unspecified' },
            location: { type: Type.STRING, description: 'Delivery city or state in Nigeria e.g. Ibadan, Lagos, Abuja' },
            deliveryDeadline: { type: Type.STRING, description: 'Delivery timeframe e.g. Within 14 days' },
            qualityRequirements: { type: Type.STRING, description: 'Quality standard, materials or grade specified' },
            specifications: { type: Type.STRING, description: 'Detailed technical or aesthetic specifications' },
            customization: { type: Type.STRING, description: 'Customization, branding or printing details' },
            additionalRequirements: { type: Type.STRING, description: 'Packaging, inspection, warranty or logistics requirements' },
          },
          required: ['title', 'category', 'productOrService', 'quantity', 'unit', 'budget', 'location', 'deliveryDeadline', 'specifications'],
        },
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text) as StructuredSourcingOutput;
      return parsed;
    }
  } catch (err) {
    console.warn('Gemini extraction failed, falling back to rule-based parser:', err);
  }

  return fallbackRuleBasedParser(naturalLanguagePrompt);
}

export async function analyzeQuotesComparison(request: SourcingRequest, quotes: Quote[]): Promise<{
  summary: string;
  bestValueSupplierId: string;
  fastestSupplierId: string;
  comparisons: {
    supplierId: string;
    supplierName: string;
    pros: string[];
    cons: string[];
    riskAssessment: string;
  }[];
  recommendation: string;
}> {
  if (quotes.length === 0) {
    return {
      summary: 'No quotes have been submitted for this request yet.',
      bestValueSupplierId: '',
      fastestSupplierId: '',
      comparisons: [],
      recommendation: 'Awaiting supplier quotes to perform AI analysis.',
    };
  }

  const ai = getAIClient();
  const quotesData = quotes.map((q) => ({
    id: q.id,
    supplierId: q.supplierId,
    supplierName: q.supplierName,
    rating: q.supplierRating,
    verification: q.supplierVerification,
    totalPrice: q.totalPrice,
    unitPrice: q.unitPrice,
    deliveryDays: q.deliveryTimeDays,
    warranty: q.warranty,
    paymentTerms: q.paymentTerms,
    notes: q.notes,
  }));

  if (!ai) {
    // Intelligent deterministic analysis
    const sortedByPrice = [...quotes].sort((a, b) => a.totalPrice - b.totalPrice);
    const sortedByTime = [...quotes].sort((a, b) => a.deliveryTimeDays - b.deliveryTimeDays);
    const cheapest = sortedByPrice[0];
    const fastest = sortedByTime[0];

    return {
      summary: `Analyzed ${quotes.length} competitive quotes. Price ranges from ₦${cheapest.totalPrice.toLocaleString()} to ₦${sortedByPrice[sortedByPrice.length - 1].totalPrice.toLocaleString()}.`,
      bestValueSupplierId: cheapest.supplierId,
      fastestSupplierId: fastest.supplierId,
      comparisons: quotes.map((q) => ({
        supplierId: q.supplierId,
        supplierName: q.supplierName,
        pros: [
          `Unit price: ₦${q.unitPrice.toLocaleString()}`,
          `Delivery within ${q.deliveryTimeDays} days`,
          `${q.supplierRating}★ rating with ${q.supplierVerification.replace('_', ' ')} status`,
        ],
        cons: [q.warranty ? `Warranty: ${q.warranty}` : 'Standard warranty terms apply'],
        riskAssessment: q.supplierRating >= 4.8 ? 'Low risk - Verified track record' : 'Moderate risk - verify sample before bulk delivery',
      })),
      recommendation: `${cheapest.supplierName} provides the most competitive financial offer at ₦${cheapest.totalPrice.toLocaleString()}, while ${fastest.supplierName} offers the expedited turnaround (${fastest.deliveryTimeDays} days).`,
    };
  }

  try {
    const prompt = `You are a procurement expert reviewing supplier quotes for:
Request: "${request.title}" (${request.quantity} units, Budget: ₦${request.budget.toLocaleString()}, Location: ${request.location})
Received Quotes:
${JSON.stringify(quotesData, null, 2)}

Provide a strict, professional commercial comparison. Do NOT invent missing information. Highlight price vs lead time trade-offs, warranty conditions, and risk flags.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            bestValueSupplierId: { type: Type.STRING },
            fastestSupplierId: { type: Type.STRING },
            comparisons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  supplierId: { type: Type.STRING },
                  supplierName: { type: Type.STRING },
                  pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                  cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                  riskAssessment: { type: Type.STRING },
                },
                required: ['supplierId', 'supplierName', 'pros', 'cons', 'riskAssessment'],
              },
            },
            recommendation: { type: Type.STRING },
          },
          required: ['summary', 'bestValueSupplierId', 'fastestSupplierId', 'comparisons', 'recommendation'],
        },
      },
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
  } catch (err) {
    console.warn('AI Quote analysis error, using fallback:', err);
  }

  const cheapest = [...quotes].sort((a, b) => a.totalPrice - b.totalPrice)[0];
  const fastest = [...quotes].sort((a, b) => a.deliveryTimeDays - b.deliveryTimeDays)[0];

  return {
    summary: `Compared ${quotes.length} received quotes. Price variance observed across vendors.`,
    bestValueSupplierId: cheapest.supplierId,
    fastestSupplierId: fastest.supplierId,
    comparisons: quotes.map((q) => ({
      supplierId: q.supplierId,
      supplierName: q.supplierName,
      pros: [`₦${q.totalPrice.toLocaleString()} total`, `${q.deliveryTimeDays} days delivery`],
      cons: [`Payment terms: ${q.paymentTerms}`],
      riskAssessment: 'Standard commercial risk assessment',
    })),
    recommendation: `Consider ${cheapest.supplierName} for best cost efficiency or ${fastest.supplierName} for fastest lead time.`,
  };
}

export async function generateNegotiationProposal(
  request: SourcingRequest,
  quote: Quote,
  targetPrice: number,
  userNotes?: string
): Promise<{ proposalMessage: string; suggestedCounterOffer: number; strategicRationale: string }> {
  const ai = getAIClient();
  const discountPercent = (((quote.totalPrice - targetPrice) / quote.totalPrice) * 100).toFixed(1);

  if (!ai) {
    return {
      proposalMessage: `Dear ${quote.supplierName},\n\nThank you for submitting your quote (Ref: ${quote.id}) for our procurement of ${request.quantity} units of ${request.productOrService}.\n\nWe are very impressed with your credentials and would like to confirm this order today. However, our approved project budget caps total expenditure at ₦${targetPrice.toLocaleString()} (reflecting a ${discountPercent}% adjustment on your initial quote of ₦${quote.totalPrice.toLocaleString()}).\n\nIf you can meet us at this price point, we are ready to initiate Direct Bank Transfer payment immediately.\n\nBest regards,\nProcurement Team`,
      suggestedCounterOffer: targetPrice,
      strategicRationale: `A ${discountPercent}% price adjustment is within standard commercial volume concession ranges for immediate order commitment.`,
    };
  }

  try {
    const prompt = `You are an AI negotiation strategist representing a Nigerian enterprise buyer.
Draft a highly persuasive, professional, and respectful negotiation proposal to a verified supplier.

Context:
- Procurement Title: "${request.title}"
- Quantity: ${request.quantity} units
- Original Quote: ₦${quote.totalPrice.toLocaleString()} (Unit: ₦${quote.unitPrice.toLocaleString()})
- Target Price: ₦${targetPrice.toLocaleString()}
- Supplier: ${quote.supplierName}
- Buyer Notes: "${userNotes || 'Ready to pay immediately if agreed'}"

Format as JSON with proposalMessage, suggestedCounterOffer (number), and strategicRationale.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            proposalMessage: { type: Type.STRING },
            suggestedCounterOffer: { type: Type.NUMBER },
            strategicRationale: { type: Type.STRING },
          },
          required: ['proposalMessage', 'suggestedCounterOffer', 'strategicRationale'],
        },
      },
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
  } catch (err) {
    console.warn('AI negotiation generation fallback:', err);
  }

  return {
    proposalMessage: `Dear ${quote.supplierName},\n\nWe appreciate your quote of ₦${quote.totalPrice.toLocaleString()} for ${request.title}. We are prepared to proceed and confirm this order if we can settle on ₦${targetPrice.toLocaleString()}.\n\nThank you,\nProcurement Lead`,
    suggestedCounterOffer: targetPrice,
    strategicRationale: 'Target price aligned with committed purchase intent.',
  };
}
