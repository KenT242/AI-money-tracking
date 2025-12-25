import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { CategoryService } from "@/services/category.service";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/lib/constants";

// Disable caching for this API route
export const dynamic = "force-dynamic";

/**
 * GET /api/categories/all
 * Get all categories with full information (including type)
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

    const userId = session.userId;

    // Get categories from database (default + user's custom) with full info
    const categories = await CategoryService.getCategories(userId);

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
