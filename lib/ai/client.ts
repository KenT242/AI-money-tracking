/**
 * AI Client for Gemini 2.5 Flash Lite Integration
 * Handles transaction categorization using custom proxy server
 */

const AI_API_BASE_URL = process.env.AI_API_BASE_URL;
const AI_API_KEY = process.env.AI_API_KEY;

if (!AI_API_BASE_URL || !AI_API_KEY) {
  console.warn(
    "⚠️  AI_API_BASE_URL or AI_API_KEY not set. AI categorization will not work."
  );
}

export interface TransactionInput {
  description: string;
  amount: number;
  merchant?: string;
  date?: Date;
}

export interface CategorizationResult {
  category: string;
  confidence: number;
  reasoning?: string;
}

/**
 * Categorizes a transaction using Gemini AI
 */
export async function categorizeTransaction(
  transaction: TransactionInput
): Promise<CategorizationResult> {
  if (!AI_API_BASE_URL || !AI_API_KEY) {
    throw new Error("AI service not configured");
  }

  const prompt = buildCategorizationPrompt(transaction);

  try {
    const response = await fetch(`${AI_API_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content:
              "You are a financial transaction categorization assistant. Analyze transactions and categorize them accurately. Respond in JSON format only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);
    return {
      category: result.category || "Other",
      confidence: result.confidence || 0.5,
      reasoning: result.reasoning,
    };
  } catch (error) {
    console.error("AI categorization error:", error);
    throw error;
  }
}

/**
 * Builds the categorization prompt from transaction data
 */
function buildCategorizationPrompt(transaction: TransactionInput): string {
  const { description, amount, merchant, date } = transaction;

  return `Analyze this transaction and categorize it into one of these categories:
- Food & Dining
- Shopping
- Transportation
- Bills & Utilities
- Entertainment
- Healthcare
- Travel
- Education
- Personal Care
- Other

Transaction Details:
- Description: ${description}
- Amount: $${amount.toFixed(2)}
${merchant ? `- Merchant: ${merchant}` : ""}
${date ? `- Date: ${date.toISOString().split("T")[0]}` : ""}

Respond with JSON in this exact format:
{
  "category": "category name",
  "confidence": 0.95,
  "reasoning": "brief explanation"
}`;
}

/**
 * Prompt templates for different AI operations
 */
export const prompts = {
  categorization: buildCategorizationPrompt,
};
