import { log } from './logger';

/**
 * Anti-Spam Configuration and Utilities
 * Comprehensive spam prevention and account protection system
 */

export interface AntiSpamConfig {
  maxMessagesPerHour: number;
  maxMessagesPerDay: number;
  minMessageInterval: number;
  maxRecipientsPerBatch: number;
  batchDelay: number;
  randomDelayRange: { min: number; max: number };
  accountWarmingPeriod: number; // days
}

export interface AccountLimits {
  messagesPerHour: number;
  messagesPerDay: number;
  delayBetweenMessages: number;
  maxBatchSize: number;
}

// Default anti-spam configuration
export const DEFAULT_ANTI_SPAM_CONFIG: AntiSpamConfig = {
  maxMessagesPerHour: 60,
  maxMessagesPerDay: 300,
  minMessageInterval: 5000, // 5 seconds
  maxRecipientsPerBatch: 10,
  batchDelay: 300000, // 5 minutes between batches
  randomDelayRange: { min: 3000, max: 7000 }, // 3-7 seconds random
  accountWarmingPeriod: 30 // 30 days warming period
};

// Account age-based limits
export const ACCOUNT_LIMITS: { [key: string]: AccountLimits } = {
  NEW_ACCOUNT: {
    messagesPerHour: 10,
    messagesPerDay: 50,
    delayBetweenMessages: 10000, // 10 seconds
    maxBatchSize: 5
  },
  WARMING_ACCOUNT: {
    messagesPerHour: 25,
    messagesPerDay: 150,
    delayBetweenMessages: 6000, // 6 seconds
    maxBatchSize: 8
  },
  ESTABLISHED_ACCOUNT: {
    messagesPerHour: 50,
    messagesPerDay: 300,
    delayBetweenMessages: 4000, // 4 seconds
    maxBatchSize: 15
  }
};

// Spam keyword detection
const SPAM_KEYWORDS = [
  'promo', 'diskon', 'gratis', 'bonus', 'menang', 'jutaan', 'milyar',
  'klik', 'daftar', 'join', 'WA.ME', 'bit.ly', 'tinyurl', 'short.link',
  'dapatkan', 'raih', 'peluang', 'investasi', 'profit', 'modal',
  'penipuan', 'scam', 'pinjaman', 'kredit', 'uang', 'transfer'
];

// Business account indicators
const BUSINESS_INDICATORS = [
  'bot', 'auto', 'service', 'noreply', 'admin', 'support',
  'cs', 'customer', 'official', 'verified', 'team'
];

/**
 * Message sending tracker for rate limiting
 */
class MessageTracker {
  private hourlyCount: number = 0;
  private dailyCount: number = 0;
  private lastHourReset: number = Date.now();
  private lastDayReset: number = Date.now();
  private lastMessageTime: number = 0;
  private blockedCount: number = 0;
  private failedCount: number = 0;
  private currentBackoff: number = 0;

  /**
   * Check if sending is allowed based on rate limits
   */
  canSend(limits: AccountLimits): boolean {
    this.resetCountersIfNeeded();
    
    // Check if in backoff period
    if (this.currentBackoff > Date.now()) {
      return false;
    }

    // Check hourly limit
    if (this.hourlyCount >= limits.messagesPerHour) {
      log.warn(`Hourly limit reached: ${this.hourlyCount}/${limits.messagesPerHour}`);
      return false;
    }

    // Check daily limit
    if (this.dailyCount >= limits.messagesPerDay) {
      log.warn(`Daily limit reached: ${this.dailyCount}/${limits.messagesPerDay}`);
      return false;
    }

    // Check minimum interval
    const timeSinceLastMessage = Date.now() - this.lastMessageTime;
    if (timeSinceLastMessage < limits.delayBetweenMessages) {
      return false;
    }

    return true;
  }

  /**
   * Record a sent message
   */
  recordSent(): void {
    this.hourlyCount++;
    this.dailyCount++;
    this.lastMessageTime = Date.now();
    
    log.debug(`Message sent. Hourly: ${this.hourlyCount}, Daily: ${this.dailyCount}`);
  }

  /**
   * Record a failed/blocked message
   */
  recordFailed(isBlocked: boolean = false): void {
    this.failedCount++;
    
    if (isBlocked) {
      this.blockedCount++;
      
      // Implement exponential backoff for blocked messages
      const backoffTime = Math.min(Math.pow(2, this.blockedCount) * 60000, 3600000); // Max 1 hour
      this.currentBackoff = Date.now() + backoffTime;
      
      log.error(`Message blocked! Implementing backoff for ${backoffTime/1000} seconds`);
    }
  }

  /**
   * Reset counters when time periods expire
   */
  private resetCountersIfNeeded(): void {
    const now = Date.now();
    
    // Reset hourly counter
    if (now - this.lastHourReset >= 3600000) { // 1 hour
      this.hourlyCount = 0;
      this.lastHourReset = now;
      log.debug('Hourly counter reset');
    }
    
    // Reset daily counter
    if (now - this.lastDayReset >= 86400000) { // 24 hours
      this.dailyCount = 0;
      this.lastDayReset = now;
      this.blockedCount = Math.max(0, this.blockedCount - 1); // Reduce blocked count over time
      log.info('Daily counter reset');
    }
  }

  /**
   * Get current statistics
   */
  getStats() {
    this.resetCountersIfNeeded();
    return {
      hourlyCount: this.hourlyCount,
      dailyCount: this.dailyCount,
      blockedCount: this.blockedCount,
      failedCount: this.failedCount,
      isInBackoff: this.currentBackoff > Date.now(),
      backoffEndsAt: new Date(this.currentBackoff)
    };
  }
}

// Global message tracker instance
export const messageTracker = new MessageTracker();

/**
 * Check if message content appears to be spam
 */
export function isSpamContent(message: string): boolean {
  if (!message || message.length < 10) return false;
  
  const lowerMessage = message.toLowerCase();
  
  // Count spam keywords
  const spamKeywordCount = SPAM_KEYWORDS.filter(keyword => 
    lowerMessage.includes(keyword)
  ).length;
  
  // Check for excessive caps
  const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
  
  // Check for excessive punctuation
  const punctuationRatio = (message.match(/[!?.,]/g) || []).length / message.length;
  
  // Check for URLs
  const hasUrl = /https?:\/\/|www\.|\.com|\.id|wa\.me/i.test(message);
  
  // Spam detection logic
  const spamScore = 
    (spamKeywordCount >= 3 ? 30 : spamKeywordCount * 10) +
    (capsRatio > 0.5 ? 25 : 0) +
    (punctuationRatio > 0.1 ? 15 : 0) +
    (hasUrl ? 20 : 0);
    
  log.debug(`Spam score for message: ${spamScore}/100`);
  
  return spamScore >= 50;
}

/**
 * Validate if recipient is safe to send messages to
 */
export async function validateRecipient(client: any, phoneNumber: string): Promise<boolean> {
  try {
    const contact = await client.getContact(`${phoneNumber}@c.us`);
    
    // Skip business accounts (higher spam detection risk)
    if (contact.isBusiness) {
      log.debug(`Skipping business account: ${phoneNumber}`);
      return false;
    }
    
    // Check for bot/service indicators in name
    const name = (contact.name || contact.pushname || '').toLowerCase();
    const hasBusinessIndicator = BUSINESS_INDICATORS.some(indicator => 
      name.includes(indicator)
    );
    
    if (hasBusinessIndicator) {
      log.debug(`Skipping potential bot/service account: ${phoneNumber}`);
      return false;
    }
    
    return true;
  } catch (error) {
    log.warn(`Could not validate recipient ${phoneNumber}:`, error);
    return false;
  }
}

/**
 * Get smart delay with randomization
 */
export function getSmartDelay(baseDelay: number, addRandomness: boolean = true): number {
  if (!addRandomness) return baseDelay;
  
  const randomFactor = 0.5 + Math.random(); // 0.5 to 1.5 multiplier
  const delay = Math.floor(baseDelay * randomFactor);
  
  return Math.max(delay, 2000); // Minimum 2 seconds
}

/**
 * Determine account limits based on account age
 */
export function getAccountLimits(accountCreatedDays: number): AccountLimits {
  if (accountCreatedDays < 7) {
    return ACCOUNT_LIMITS.NEW_ACCOUNT;
  } else if (accountCreatedDays < 30) {
    return ACCOUNT_LIMITS.WARMING_ACCOUNT;
  } else {
    return ACCOUNT_LIMITS.ESTABLISHED_ACCOUNT;
  }
}

/**
 * Handle sending errors with appropriate responses
 */
export async function handleSendingError(
  error: any, 
  recipient: string, 
  onCriticalError?: () => Promise<void>
): Promise<void> {
  const errorMessage = (error.message || '').toLowerCase();
  
  if (errorMessage.includes('blocked') || errorMessage.includes('spam')) {
    messageTracker.recordFailed(true);
    
    log.error(`SPAM DETECTION: Message to ${recipient} was blocked as spam`);
    
    if (onCriticalError) {
      await onCriticalError();
    }
  } else if (errorMessage.includes('rate')) {
    log.warn(`Rate limit hit for ${recipient}`);
    messageTracker.recordFailed(false);
  } else {
    log.error(`Failed to send to ${recipient}:`, error);
    messageTracker.recordFailed(false);
  }
}

/**
 * Create safe broadcast batches
 */
export function createSafeBatches<T>(items: T[], limits: AccountLimits): T[][] {
  const batches: T[][] = [];
  const batchSize = limits.maxBatchSize;
  
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  
  return batches;
}

/**
 * Safe delay with jitter
 */
export function safeDelay(ms: number): Promise<void> {
  const jitter = Math.random() * 1000; // 0-1 second jitter
  return new Promise(resolve => setTimeout(resolve, ms + jitter));
}

export default {
  messageTracker,
  isSpamContent,
  validateRecipient,
  getSmartDelay,
  getAccountLimits,
  handleSendingError,
  createSafeBatches,
  safeDelay,
  DEFAULT_ANTI_SPAM_CONFIG,
  ACCOUNT_LIMITS
};
