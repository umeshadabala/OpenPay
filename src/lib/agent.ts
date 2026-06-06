import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

interface AgentResult {
  isCredit: boolean;
  parsedAmount: string | null;
  parsedUtr: string | null;
  parsedSender: string | null;
  confidence: number;
  reasoning: string[];
}

/**
 * Payment Parsing Agent using Gemini AI
 * Extracts structured details from raw SMS notifications
 */
export async function parseTransactionAgent(
  smsText: string,
  senderHeader: string | null
): Promise<AgentResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback to rules if key is not set
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.log('Gemini API key not configured. Using rule-based regex parser fallback.');
    return ruleBasedParser(smsText, senderHeader);
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    
    // We use gemini-2.5-flash since it's fast and cheap
    const model = ai.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            isCredit: { type: SchemaType.BOOLEAN },
            parsedAmount: { type: SchemaType.STRING, nullable: true },
            parsedUtr: { type: SchemaType.STRING, nullable: true },
            parsedSender: { type: SchemaType.STRING, nullable: true },
            confidence: { type: SchemaType.NUMBER },
            reasoning: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
          },
          required: ['isCredit', 'parsedAmount', 'parsedUtr', 'parsedSender', 'confidence', 'reasoning'],
        },
      },
    });

    const prompt = `
You are the OpenPay Payment Notification Parsing Agent.
Your job is to analyze an incoming SMS notification received on a merchant's mobile device and extract transaction parameters.

SMS Notification Details:
- Header Sender: ${senderHeader || 'Unknown'}
- Raw SMS Text: "${smsText}"

Tasks:
1. Determine if this SMS represents a credit / deposit / inbound payment into the user's account.
   - Set isCredit=true if money was credited, received, added, deposited, or transferred in.
   - Set isCredit=false for OTPs, debits, marketing spam, balance inquiries, or personal messages.
2. Extract the exact payment amount. Format as a string number (e.g. "100.00"). If none, set to null.
3. Extract the 12-digit UPI Reference Number (also known as UTR, Ref No, or Transaction ID). Set to null if not found.
4. Extract the originating bank or service name (e.g. HDFC, SBI, Paytm, PhonePe, ICICI, GooglePay).
5. Determine your extraction confidence (between 0.0 and 1.0).
6. Detail your extraction steps in short, clear monospaced-style reasoning bullet points.

Return a JSON object matching the requested schema.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed: AgentResult = JSON.parse(text);

    return parsed;
  } catch (error) {
    console.error('Gemini parsing failed, falling back to rule parser:', error);
    return ruleBasedParser(smsText, senderHeader);
  }
}

/**
 * Fallback Rule-based Regex Parser
 */
function ruleBasedParser(smsText: string, senderHeader: string | null): AgentResult {
  const isCreditKeywords = ['credited', 'received', 'deposited', 'added', 'credit', 'inward', 'recieved'];
  const lowercaseSms = smsText.toLowerCase();
  
  // 1. Determine if it is a credit transaction
  const hasCreditKeyword = isCreditKeywords.some(keyword => lowercaseSms.includes(keyword));
  const isDebit = lowercaseSms.includes('debited') || lowercaseSms.includes('sent') || lowercaseSms.includes('withdrawn');
  const isCredit = hasCreditKeyword && !isDebit;

  // 2. Parse Amount
  let parsedAmount: string | null = null;
  const amountRegex = /(?:Rs\.?|INR|₹)\s*(\d+(?:\.\d{1,2})?)/i;
  const amountMatch = smsText.match(amountRegex);
  
  if (amountMatch && amountMatch[1]) {
    parsedAmount = parseFloat(amountMatch[1]).toFixed(2);
  } else {
    // general price lookup
    const genericPriceRegex = /\b\d+(?:\.\d{2})\b/;
    const genericMatch = smsText.match(genericPriceRegex);
    if (genericMatch) {
      parsedAmount = parseFloat(genericMatch[0]).toFixed(2);
    }
  }

  // 3. Parse UTR
  let parsedUtr: string | null = null;
  const utrRegex = /(?:UPI\s+Ref|Ref|UTR|Ref\s+No|Reference|ref\s+no)\s*(?:No\.?)?\s*(\d{12})/i;
  const utrMatch = smsText.match(utrRegex);
  
  if (utrMatch && utrMatch[1]) {
    parsedUtr = utrMatch[1];
  } else {
    const genericUtrRegex = /\b(\d{12})\b/;
    const genericMatch = smsText.match(genericUtrRegex);
    if (genericMatch && genericMatch[1]) {
      parsedUtr = genericMatch[1];
    }
  }

  // 4. Parse Sender Bank
  let parsedSender: string | null = 'Unknown';
  if (senderHeader) {
    parsedSender = senderHeader.replace(/^[A-Z]{2}-/, ''); // remove carrier prefix (e.g. AX-HDFCBK -> HDFCBK)
  } else {
    const banks = ['hdfc', 'sbi', 'icici', 'paytm', 'phonepe', 'axis', 'pnb', 'bob'];
    for (const bank of banks) {
      if (lowercaseSms.includes(bank)) {
        parsedSender = bank.toUpperCase();
        break;
      }
    }
  }

  const reasoning = [
    isCredit ? 'Credit keywords detected in SMS alert' : 'No credit indicators found in text',
    parsedAmount ? `Extracted amount ₹${parsedAmount} via regex` : 'Failed to isolate transaction amount',
    parsedUtr ? `Isolated UPI Reference UTR: ${parsedUtr}` : 'UPI reference number not found in text logs',
    `Identified sender bank source as ${parsedSender} (Rule Fallback)`
  ];

  return {
    isCredit,
    parsedAmount,
    parsedUtr,
    parsedSender,
    confidence: isCredit && parsedAmount && parsedUtr ? 0.90 : 0.40,
    reasoning,
  };
}
