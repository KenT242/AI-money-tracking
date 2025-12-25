import { NextRequest, NextResponse } from "next/server";
import { TransactionService } from "@/services/transaction.service";
import { getSession } from "@/lib/auth/session";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/transactions/[id]
 * Update a transaction
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.AUTH.UNAUTHORIZED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { amount, category, description, type } = body;

    // Validate data
    if (amount !== undefined && amount <= 0) {
      return NextResponse.json(
        { error: "Số tiền phải lớn hơn 0" },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Update transaction
    const updateData: any = {};
    if (amount !== undefined) updateData.amount = amount;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;

    const transaction = await TransactionService.updateTransaction(
      id,
      session.userId,
      updateData
    );

    if (!transaction) {
      return NextResponse.json(
        { error: "Không tìm thấy giao dịch" },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error("Update transaction error:", error);
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
 * DELETE /api/transactions/[id]
 * Delete a transaction
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.AUTH.UNAUTHORIZED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const { id } = await params;
    const deleted = await TransactionService.deleteTransaction(
      id,
      session.userId
    );

    if (!deleted) {
      return NextResponse.json(
        { error: "Không tìm thấy giao dịch" },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã xóa giao dịch",
    });
  } catch (error) {
    console.error("Delete transaction error:", error);
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.TRANSACTION.FAILED_TO_PROCESS,
        details: error instanceof Error ? error.message : ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR,
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
