import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { TransactionService } from "@/services/transaction.service";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/lib/constants";

// Disable caching for this API route
export const dynamic = "force-dynamic";

/**
 * GET /api/transactions
 * Get paginated transactions with optional category filter
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.AUTH.UNAUTHORIZED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const userId = session.userId;

    // Build filter
    const filter: any = { userId };

    if (category && category !== "all") {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Get transactions with pagination
    const result = await TransactionService.getTransactionsPaginated(
      filter,
      page,
      limit
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.TRANSACTION.FAILED_TO_FETCH,
        details:
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR,
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
