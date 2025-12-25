/**
 * AI Parser for natural language transaction input
 * Handles parsing user messages like "Bún bò 45k" into structured transactions
 */

import { ParsedTransaction } from "@/types";
import { AI_CONFIG, ERROR_MESSAGES, TRANSACTION_CATEGORIES } from "@/lib/constants";
import { CategoryService } from "@/services/category.service";

const AI_API_BASE_URL = process.env.AI_API_BASE_URL;
const AI_API_KEY = process.env.AI_API_KEY;

if (!AI_API_BASE_URL || !AI_API_KEY) {
  console.warn(
    "⚠️  AI_API_BASE_URL or AI_API_KEY not set. AI parsing will not work."
  );
}

/**
 * Parse natural language input into a structured transaction or multiple transactions
 * Example: "Bún bò 45k" -> { description: "Bún bò", amount: 45000, type: "expense", category: "Food & Dining" }
 * Example: "cơm 10k, 20k nước" -> returns first transaction, stores multiple
 */
export async function parseTransactionFromText(
  userInput: string,
  userId?: string
): Promise<ParsedTransaction & { multipleTransactions?: ParsedTransaction[] }> {
  if (!AI_API_BASE_URL || !AI_API_KEY) {
    throw new Error(ERROR_MESSAGES.AI.NOT_CONFIGURED);
  }

  // Get categories from database
  const categoryNames = await CategoryService.getCategoryNames(userId);

  const prompt = buildParsingPrompt(userInput, categoryNames);

  try {
    const response = await fetch(`${AI_API_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.MODEL,
        messages: [
          {
            role: "system",
            content: `You are a financial assistant that parses natural language transaction inputs in Vietnamese or English.
Extract transaction details and categorize them accurately.
Always respond in JSON format only.

Important rules:
- Vietnamese currency: k = 1,000 VND (ví dụ: 45k = 45,000 VND)
- Default type is "expense" unless it's clearly income (lương, thu nhập, etc.)
- Infer merchant/description from context
- Be smart about categorization based on Vietnamese context
- If input contains multiple transactions (separated by commas, dashes, or "and"), return them as an array in "transactions" field
- Otherwise, return a single transaction object`,
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
    let content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error(ERROR_MESSAGES.AI.NO_RESPONSE);
    }

    // Strip markdown code blocks if present (```json ... ```)
    content = content.trim();
    if (content.startsWith("```")) {
      content = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const result = JSON.parse(content);

    // Check if it's multiple transactions
    if (result.transactions && Array.isArray(result.transactions)) {
      const transactions = result.transactions.map((t: any) => ({
        description: t.description || userInput,
        amount: t.amount || 0,
        type: t.type || "expense",
        category: t.category || TRANSACTION_CATEGORIES.OTHER,
        merchant: t.merchant,
        confidence: t.confidence || AI_CONFIG.DEFAULT_CONFIDENCE,
        reasoning: t.reasoning,
      }));

      // Return first transaction with multipleTransactions array
      return {
        ...transactions[0],
        multipleTransactions: transactions,
      };
    }

    // Single transaction
    return {
      description: result.description || userInput,
      amount: result.amount || 0,
      type: result.type || "expense",
      category: result.category || TRANSACTION_CATEGORIES.OTHER,
      merchant: result.merchant,
      confidence: result.confidence || AI_CONFIG.DEFAULT_CONFIDENCE,
      reasoning: result.reasoning,
    };
  } catch (error) {
    console.error("AI parsing error:", error);
    throw error;
  }
}

/**
 * Build the parsing prompt from user input
 */
function buildParsingPrompt(
  userInput: string,
  categoryNames: { expense: string[]; income: string[] }
): string {
  const expenseCategories = categoryNames.expense.join(", ");
  const incomeCategories = categoryNames.income.join(", ");

  return `Parse this transaction input and extract details. The input may contain MULTIPLE transactions separated by commas, dashes, or "and".

"${userInput}"

Available categories:

EXPENSE categories: ${expenseCategories}

INCOME categories: ${incomeCategories}

Choose the most appropriate category from the list above based on the transaction description

IMPORTANT: If the input contains multiple transactions, return them as an array. Otherwise, return a single object.

For SINGLE transaction, respond with JSON:
{
  "description": "brief description",
  "amount": numeric_amount_in_VND,
  "type": "expense" or "income",
  "category": "category name",
  "merchant": "merchant name or null",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}

For MULTIPLE transactions, respond with JSON:
{
  "transactions": [
    {
      "description": "item 1",
      "amount": amount1,
      "type": "expense" or "income",
      "category": "category",
      "merchant": "merchant or null",
      "confidence": 0.0-1.0,
      "reasoning": "explanation"
    },
    {
      "description": "item 2",
      "amount": amount2,
      "type": "expense" or "income",
      "category": "category",
      "merchant": "merchant or null",
      "confidence": 0.0-1.0,
      "reasoning": "explanation"
    }
  ]
}

Examples:

Single transaction:
Input: "Bún bò 45k"
Output: {"description": "Bún bò", "amount": 45000, "type": "expense", "category": "Food & Dining", "merchant": null, "confidence": 0.95, "reasoning": "Food purchase"}

Multiple transactions:
Input: "cơm 10k, 20k nước"
Output: {"transactions": [{"description": "Cơm", "amount": 10000, "type": "expense", "category": "Food & Dining", "merchant": null, "confidence": 0.95, "reasoning": "Meal"}, {"description": "Nước", "amount": 20000, "type": "expense", "category": "Food & Dining", "merchant": null, "confidence": 0.9, "reasoning": "Beverage"}]}

Input: "ăn uống 40k"
Output: {"description": "Ăn uống", "amount": 40000, "type": "expense", "category": "Food & Dining", "merchant": null, "confidence": 0.9, "reasoning": "Food and drink"}

Input: "cafe 25k - grab 30k"
Output: {"transactions": [{"description": "Cafe", "amount": 25000, "type": "expense", "category": "Food & Dining", "merchant": null, "confidence": 0.95, "reasoning": "Coffee"}, {"description": "Grab", "amount": 30000, "type": "expense", "category": "Transportation", "merchant": "Grab", "confidence": 0.95, "reasoning": "Ride service"}]}`;
}
