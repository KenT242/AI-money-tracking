import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { TransactionService } from "@/services/transaction.service";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/lib/constants";

// Disable caching for this API route
export const dynamic = "force-dynamic";

/**
 * GET /api/transactions/categories
 * Get unique categories for the user's transactions
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
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const userId = session.userId;

    // Build filter
    const filter: any = { userId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Get unique categories
    const categories = await TransactionService.getUniqueCategories(filter);

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch categories",
        details:
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR,
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
