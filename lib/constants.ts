/**
 * Application-wide constants and configuration
 */

// ============================================================================
// UI Constants
// ============================================================================

export const UI_CONSTANTS = {
  // Pagination
  TRANSACTIONS_PER_PAGE: 10,

  // Chart dimensions
  CHART_HEIGHT: 350,
  PIE_CHART_HEIGHT: 280,
  PIE_INNER_RADIUS: 60,
  PIE_OUTER_RADIUS: 90,

  // Chat
  CHAT_HEIGHT: 700,
  AUTO_SCROLL_DELAY: 100,
  MESSAGE_ANIMATION_DELAY: 50,

  // Currency formatting
  CURRENCY_CODE: 'VND',
  CURRENCY_LOCALE: 'vi-VN',

  // Date formatting
  DATE_LOCALE: 'vi',

  // File size limits (example - adjust as needed)
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// ============================================================================
// Date Range Presets
// ============================================================================

export const DATE_RANGE_PRESETS = [
  { label: "Ngày hiện tại", key: "today" },
  { label: "Tuần hiện tại", key: "thisWeek" },
  { label: "Tháng hiện tại", key: "thisMonth" },
  { label: "Hôm qua", key: "yesterday" },
  { label: "Tuần trước", key: "lastWeek" },
  { label: "Tháng trước", key: "lastMonth" },
  { label: "3 tháng trước", key: "last3Months" },
] as const;

// ============================================================================
// Transaction Categories
// ============================================================================

export const TRANSACTION_CATEGORIES = {
  FOOD_DINING: "Food & Dining",
  SHOPPING: "Shopping",
  TRANSPORTATION: "Transportation",
  BILLS_UTILITIES: "Bills & Utilities",
  ENTERTAINMENT: "Entertainment",
  HEALTHCARE: "Healthcare",
  TRAVEL: "Travel",
  EDUCATION: "Education",
  PERSONAL_CARE: "Personal Care",
  SALARY: "Salary",
  FREELANCE: "Freelance",
  INVESTMENT: "Investment",
  OTHER: "Other",
} as const;

export const CATEGORY_LABELS_VI: Record<string, string> = {
  [TRANSACTION_CATEGORIES.FOOD_DINING]: "Ăn uống",
  [TRANSACTION_CATEGORIES.SHOPPING]: "Mua sắm",
  [TRANSACTION_CATEGORIES.TRANSPORTATION]: "Di chuyển",
  [TRANSACTION_CATEGORIES.BILLS_UTILITIES]: "Hóa đơn & Tiện ích",
  [TRANSACTION_CATEGORIES.ENTERTAINMENT]: "Giải trí",
  [TRANSACTION_CATEGORIES.HEALTHCARE]: "Y tế",
  [TRANSACTION_CATEGORIES.TRAVEL]: "Du lịch",
  [TRANSACTION_CATEGORIES.EDUCATION]: "Giáo dục",
  [TRANSACTION_CATEGORIES.PERSONAL_CARE]: "Chăm sóc cá nhân",
  [TRANSACTION_CATEGORIES.SALARY]: "Lương",
  [TRANSACTION_CATEGORIES.FREELANCE]: "Freelance",
  [TRANSACTION_CATEGORIES.INVESTMENT]: "Đầu tư",
  [TRANSACTION_CATEGORIES.OTHER]: "Khác",
} as const;

// ============================================================================
// Transaction Types
// ============================================================================

export const TRANSACTION_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
} as const;

export const TRANSACTION_TYPE_LABELS_VI: Record<string, string> = {
  [TRANSACTION_TYPES.INCOME]: "Thu nhập",
  [TRANSACTION_TYPES.EXPENSE]: "Chi tiêu",
} as const;

// ============================================================================
// Chart Colors
// ============================================================================

export const CHART_COLORS = {
  INCOME: "#10b981",
  EXPENSE: "#f43f5e",
  NET: "#8b5cf6",

  // Category colors for pie chart
  CATEGORY_PALETTE: [
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#f43f5e", // rose
    "#f59e0b", // amber
    "#10b981", // emerald
    "#06b6d4", // cyan
    "#6366f1", // indigo
    "#d946ef", // fuchsia
  ],
} as const;

// ============================================================================
// API Routes
// ============================================================================

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
    SIGNUP: "/api/auth/signup",
  },
  CHAT: "/api/chat",
  ANALYTICS: "/api/analytics",
  TRANSACTIONS: "/api/transactions",
  TRANSACTION_CATEGORIES: "/api/transactions/categories",
} as const;

// ============================================================================
// Page Routes
// ============================================================================

export const PAGE_ROUTES = {
  HOME: "/",
  ANALYTICS: "/analytics",
  AUTH: {
    SIGNIN: "/auth/signin",
    SIGNUP: "/auth/signup",
  },
} as const;

// ============================================================================
// Session Configuration
// ============================================================================

export const SESSION_CONFIG = {
  COOKIE_NAME: "money_app_session",
  MAX_AGE: 30 * 24 * 60 * 60, // 30 days in seconds
  PASSWORD_MIN_LENGTH: 8,
} as const;

// ============================================================================
// AI Configuration
// ============================================================================

export const AI_CONFIG = {
  MODEL: "gemini-2.5-flash-lite",
  DEFAULT_CONFIDENCE: 0.8,
  CONFIDENCE_THRESHOLD: 0.7,
} as const;

// ============================================================================
// Analytics Thresholds
// ============================================================================

export const ANALYTICS_THRESHOLDS = {
  DAILY_VIEW_MAX_DAYS: 1,
  WEEKLY_VIEW_MAX_DAYS: 7,
  MONTHLY_VIEW_MAX_DAYS: 90,
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  AUTH: {
    UNAUTHORIZED: "Unauthorized - Please login",
    INVALID_CREDENTIALS: "Invalid username or password",
    USER_EXISTS: "User already exists",
  },
  TRANSACTION: {
    INVALID_AMOUNT: "❌ Không thể xác định số tiền hợp lệ.\n\nVui lòng nhập lại với format rõ ràng hơn.\nVí dụ: 'Bún bò 45k' hoặc 'Cafe 25000'",
    MESSAGE_REQUIRED: "Message is required",
    FAILED_TO_PROCESS: "Failed to process transaction",
    FAILED_TO_FETCH: "Failed to fetch transactions",
  },
  AI: {
    NOT_CONFIGURED: "AI service not configured",
    NO_RESPONSE: "No response from AI",
  },
  GENERAL: {
    UNKNOWN_ERROR: "Unknown error",
    SERVER_ERROR: "Server error",
  },
} as const;

// ============================================================================
// Success Messages
// ============================================================================

export const SUCCESS_MESSAGES = {
  TRANSACTION: {
    SAVED_PREFIX: "✅ Đã lưu",
    AMOUNT_PREFIX: "💰 Số tiền:",
    CATEGORY_PREFIX: "📂 Danh mục:",
    MERCHANT_PREFIX: "🏪 Người bán:",
    REASONING_PREFIX: "💡",
    TOTAL_PREFIX: "💰 Tổng cộng:",
  },
  AUTH: {
    LOGIN_SUCCESS: "Đăng nhập thành công",
    LOGOUT_SUCCESS: "Đăng xuất thành công",
  },
} as const;

// ============================================================================
// Welcome Messages
// ============================================================================

export const WELCOME_MESSAGES = {
  CHAT_WELCOME: "👋 Xin chào! Nhập giao dịch của bạn theo ngôn ngữ tự nhiên.\n\nVí dụ:\n• Bún bò 45k\n• Grab đi làm 35k\n• Lương tháng 10 triệu",
} as const;

// ============================================================================
// Placeholder Messages
// ============================================================================

export const PLACEHOLDER_MESSAGES = {
  CHAT_INPUT: "💰 Ví dụ: Bún bò 45k, Grab 30k, Lương 10 triệu...",
  SEARCH: "Tìm kiếm...",
  USERNAME: "Nhập tên đăng nhập",
  PASSWORD: "Nhập mật khẩu",
} as const;

// ============================================================================
// Quick Example Transactions
// ============================================================================

export const QUICK_EXAMPLES = [
  "Cafe 25k",
  "Grab 40k",
  "Cơm 50k",
] as const;

// ============================================================================
// Chart Configuration
// ============================================================================

export const CHART_CONFIG = {
  STROKE_WIDTH: {
    INCOME: 3,
    EXPENSE: 3,
    NET: 2,
  },
  DOT_RADIUS: {
    INCOME: 4,
    EXPENSE: 4,
    NET: 3,
  },
  ACTIVE_DOT_RADIUS: 6,
  GRID_STROKE_DASHARRAY: "3 3",
  GRID_OPACITY: 0.3,
} as const;

// ============================================================================
// HTTP Status Codes
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ============================================================================
// Type Exports
// ============================================================================

export type TransactionCategory = typeof TRANSACTION_CATEGORIES[keyof typeof TRANSACTION_CATEGORIES];
export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];
export type DateRangePresetKey = typeof DATE_RANGE_PRESETS[number]['key'];
