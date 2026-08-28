export interface User {
    _id: string;
    email: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export type UserRole = 'user' | 'admin' | 'premium';
export interface Session {
    _id: string;
    userId: string;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
    createdAt: Date;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}
export interface AuthResponse {
    user: User;
    tokens: AuthTokens;
}
export interface Instrument {
    _id: string;
    symbol: string;
    name: string;
    exchange: string;
    segment: string;
    instrumentType: string;
    lotSize: number;
    tickSize: number;
    strikePrice?: number;
    expiryDate?: string;
    underlying?: string;
    isActive: boolean;
    metadata?: Record<string, unknown>;
}
export interface Quote {
    symbol: string;
    lastPrice: number;
    change: number;
    changePercent: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    totalTradedValue: number;
    averagePrice: number;
    bidPrice: number;
    bidQty: number;
    askPrice: number;
    askQty: number;
    lowerCircuitLimit: number;
    upperCircuitLimit: number;
    timestamp: Date;
}
export interface Candle {
    timestamp: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    trades?: number;
}
export interface HistoricalDataRequest {
    symbol: string;
    exchange: string;
    timeframe: Timeframe;
    from: Date;
    to: Date;
}
export type Timeframe = '1m' | '3m' | '5m' | '10m' | '15m' | '30m' | '60m' | '90m' | '1D' | '1W' | '1M';
export interface MarketOverview {
    nifty50: IndexData;
    bankNifty: IndexData;
    finNifty: IndexData;
    marketStatus: MarketStatus;
    advanceDecline: AdvanceDecline;
    sectorPerformance: SectorPerformance[];
    timestamp: Date;
}
export interface IndexData {
    symbol: string;
    value: number;
    change: number;
    changePercent: number;
    open: number;
    high: number;
    low: number;
    previousClose: number;
    yearHigh: number;
    yearLow: number;
}
export type MarketStatus = 'open' | 'closed' | 'pre_open' | 'post_close';
export interface AdvanceDecline {
    advances: number;
    declines: number;
    unchanged: number;
}
export interface SectorPerformance {
    name: string;
    value: number;
    change: number;
    changePercent: number;
}
export interface Portfolio {
    _id: string;
    userId: string;
    name: string;
    description?: string;
    holdings: Holding[];
    transactions: Transaction[];
    totalValue: number;
    investedValue: number;
    currentPnL: number;
    currentPnLPercent: number;
    dayPnL: number;
    dayPnLPercent: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface Holding {
    _id: string;
    symbol: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    investedValue: number;
    currentValue: number;
    unrealizedPnL: number;
    unrealizedPnLPercent: number;
    dayChange: number;
    dayChangePercent: number;
    allocation: number;
    sector?: string;
    industry?: string;
}
export interface Transaction {
    _id: string;
    symbol: string;
    type: 'buy' | 'sell';
    quantity: number;
    price: number;
    amount: number;
    charges: number;
    netAmount: number;
    date: Date;
    orderId?: string;
    notes?: string;
}
export interface Watchlist {
    _id: string;
    userId: string;
    name: string;
    symbols: WatchlistSymbol[];
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface WatchlistSymbol {
    _id: string;
    symbol: string;
    exchange: string;
    addedAt: Date;
    notes?: string;
    tags?: string[];
}
export interface Strategy {
    _id: string;
    userId: string;
    name: string;
    description?: string;
    type: StrategyType;
    rules: StrategyRule[];
    parameters: Record<string, unknown>;
    isActive: boolean;
    backtestResults?: BacktestSummary;
    performance?: StrategyPerformance;
    createdAt: Date;
    updatedAt: Date;
}
export type StrategyType = 'long' | 'short' | 'long_short';
export interface StrategyRule {
    id: string;
    type: 'entry' | 'exit' | 'stoploss' | 'target';
    condition: string;
    priority: number;
}
export interface BacktestSummary {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    profitFactor: number;
    maxDrawdown: number;
    totalReturn: number;
    annualizedReturn: number;
    sharpeRatio: number;
    sortinoRatio: number;
    averageWin: number;
    averageLoss: number;
    largestWin: number;
    largestLoss: number;
    averageHoldingPeriod: number;
    equityCurve: EquityPoint[];
}
export interface EquityPoint {
    date: Date;
    value: number;
    drawdown: number;
}
export interface StrategyPerformance {
    totalSignals: number;
    activeSignals: number;
    closedSignals: number;
    winRate: number;
    averageReturn: number;
    bestReturn: number;
    worstReturn: number;
}
export interface Order {
    _id: string;
    userId: string;
    strategyId?: string;
    symbol: string;
    exchange: string;
    orderType: OrderType;
    transactionType: TransactionType;
    quantity: number;
    price?: number;
    triggerPrice?: number;
    status: OrderStatus;
    filledQuantity: number;
    averagePrice: number;
    rejectReason?: string;
    placedAt: Date;
    updatedAt: Date;
    cancelledAt?: Date;
    completedAt?: Date;
}
export type OrderType = 'market' | 'limit' | 'sl' | 'slm';
export type TransactionType = 'buy' | 'sell';
export type OrderStatus = 'pending' | 'trigger_pending' | 'open' | 'complete' | 'cancelled' | 'rejected';
export interface Position {
    _id: string;
    userId: string;
    strategyId?: string;
    symbol: string;
    exchange: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    markToMark: number;
    pnl: number;
    pnlPercent: number;
    openedAt: Date;
    updatedAt: Date;
}
export interface TradeSetup {
    _id: string;
    userId: string;
    strategyId?: string;
    symbol: string;
    exchange: string;
    direction: 'long' | 'short';
    entryPrice: number;
    stopLoss: number;
    targets: TargetLevel[];
    quantity: number;
    riskReward: number;
    status: TradeSetupStatus;
    setupDate: Date;
    exitDate?: Date;
    exitPrice?: number;
    pnl?: number;
    pnlPercent?: number;
    notes?: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface TargetLevel {
    level: number;
    price: number;
    percent: number;
    achieved?: boolean;
    achievedAt?: Date;
}
export type TradeSetupStatus = 'active' | 'exited' | 'stopped' | 'target_hit' | 'cancelled';
export interface Alert {
    _id: string;
    userId: string;
    type: AlertType;
    symbol: string;
    condition: string;
    value: number;
    operator: AlertOperator;
    timeframe?: Timeframe;
    isActive: boolean;
    triggeredAt?: Date;
    expiresAt?: Date;
    notificationChannels: NotificationChannel[];
    message?: string;
    createdAt: Date;
    updatedAt: Date;
}
export type AlertType = 'price' | 'indicator' | 'volume' | 'percent_change';
export type AlertOperator = 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'crosses_above' | 'crosses_below';
export type NotificationChannel = 'email' | 'sms' | 'push' | 'webhook';
export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
    message?: string;
}
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, string[]>;
}
export interface AuditLog {
    _id: string;
    userId: string;
    action: string;
    entity: string;
    entityId?: string;
    changes?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}
//# sourceMappingURL=index.d.ts.map