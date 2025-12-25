import { NextRequest, NextResponse } from "next/server";
import { parseTransactionFromText } from "@/lib/ai/parser";
import { TransactionService } from "@/services/transaction.service";
import { getSession } from "@/lib/auth/session";
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  UI_CONSTANTS,
} from "@/lib/constants";

// Disable caching for this API route
export const dynamic = "force-dynamic";

/**
 * POST /api/chat
 * Process natural language transaction input
 */
export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.AUTH.UNAUTHORIZED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.TRANSACTION.MESSAGE_REQUIRED },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const userId = session.userId;

    // Parse transaction from natural language
    const parsed = await parseTransactionFromText(message, userId);

    // Validate amount
    if (!parsed.amount || parsed.amount <= 0) {
      return NextResponse.json(
        {
          error: "Invalid amount",
          message: ERROR_MESSAGES.TRANSACTION.INVALID_AMOUNT,
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Check if there are multiple transactions
    if (parsed.multipleTransactions && parsed.multipleTransactions.length > 1) {
      // Create all transactions
      const transactions = await Promise.all(
        parsed.multipleTransactions.map((t) =>
          TransactionService.createTransaction(
            {
              userId,
              description: t.description,
              amount: t.amount,
              type: t.type,
              category: t.category,
              merchant: t.merchant,
              date: new Date(),
              aiCategorized: true,
              aiConfidence: t.confidence,
            },
            false
          )
        )
      );

      // Build response message for multiple transactions
      const responseMessage = buildMultipleTransactionsMessage(parsed.multipleTransactions);

      return NextResponse.json({
        success: true,
        message: responseMessage,
        transactions,
        parsed,
        count: transactions.length,
      });
    }

    // Single transaction
    const transaction = await TransactionService.createTransaction(
      {
        userId,
        description: parsed.description,
        amount: parsed.amount,
        type: parsed.type,
        category: parsed.category,
        merchant: parsed.merchant,
        date: new Date(),
        aiCategorized: true,
        aiConfidence: parsed.confidence,
      },
      false // Don't use AI categorization again since we already parsed
    );

    // Build response message
    const responseMessage = buildResponseMessage(parsed, transaction);

    return NextResponse.json({
      success: true,
      message: responseMessage,
      transaction,
      parsed,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.TRANSACTION.FAILED_TO_PROCESS,
        details: error instanceof Error ? error.message : ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR,
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * Build a friendly response message for the user
 */
function buildResponseMessage(
  parsed: any,
  transaction: any
): string {
  const amountFormatted = new Intl.NumberFormat(UI_CONSTANTS.CURRENCY_LOCALE, {
    style: "currency",
    currency: UI_CONSTANTS.CURRENCY_CODE,
  }).format(parsed.amount);

  const typeText = parsed.type === "income" ? "thu nhập" : "chi tiêu";

  return `${SUCCESS_MESSAGES.TRANSACTION.SAVED_PREFIX} ${typeText}: ${parsed.description}
${SUCCESS_MESSAGES.TRANSACTION.AMOUNT_PREFIX} ${amountFormatted}
${SUCCESS_MESSAGES.TRANSACTION.CATEGORY_PREFIX} ${parsed.category}
${parsed.merchant ? `${SUCCESS_MESSAGES.TRANSACTION.MERCHANT_PREFIX} ${parsed.merchant}` : ""}
${parsed.reasoning ? `\n${SUCCESS_MESSAGES.TRANSACTION.REASONING_PREFIX} ${parsed.reasoning}` : ""}`;
}

/**
 * Build a friendly response message for multiple transactions
 */
function buildMultipleTransactionsMessage(
  transactions: any[]
): string {
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalFormatted = new Intl.NumberFormat(UI_CONSTANTS.CURRENCY_LOCALE, {
    style: "currency",
    currency: UI_CONSTANTS.CURRENCY_CODE,
  }).format(totalAmount);

  let message = `${SUCCESS_MESSAGES.TRANSACTION.SAVED_PREFIX} ${transactions.length} giao dịch:\n\n`;

  transactions.forEach((t, index) => {
    const amountFormatted = new Intl.NumberFormat(UI_CONSTANTS.CURRENCY_LOCALE, {
      style: "currency",
      currency: UI_CONSTANTS.CURRENCY_CODE,
    }).format(t.amount);

    message += `${index + 1}. ${t.description} - ${amountFormatted} (${t.category})\n`;
  });

  message += `\n${SUCCESS_MESSAGES.TRANSACTION.TOTAL_PREFIX} ${totalFormatted}`;

  return message;
}
