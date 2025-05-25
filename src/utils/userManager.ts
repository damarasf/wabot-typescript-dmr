import { User, UserLevel, Usage, FeatureType, Language } from '../database/models';
import config from './config';
import moment from 'moment-timezone';
import { log } from './logger';
import { normalizePhoneNumber, isOwner } from './phoneUtils';

// Simple in-memory cache for frequently accessed users
// Cache will be cleared on application restart
const userCache = new Map<string, { user: User; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

// Set up automatic cache cleanup interval
const CLEANUP_INTERVAL = 2 * 60 * 1000; // Cleanup every 2 minutes
const cleanupTimer = setInterval(() => {
  clearExpiredCache();
}, CLEANUP_INTERVAL);

// Graceful cleanup on process exit
process.on('exit', () => {
  clearInterval(cleanupTimer);
});

process.on('SIGINT', () => {
  clearInterval(cleanupTimer);
});

process.on('SIGTERM', () => {
  clearInterval(cleanupTimer);
});

// Clear expired cache entries
function clearExpiredCache(): void {
  const now = Date.now();
  const sizeBefore = userCache.size;
  
  for (const [key, value] of userCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      userCache.delete(key);
    }
  }
  
  // Only log if entries were cleaned and debug is enabled
  if (process.env.LOG_LEVEL === 'debug' && sizeBefore > userCache.size) {
    log.debug(`Cache cleanup: removed ${sizeBefore - userCache.size} expired entries, ${userCache.size} remaining`);
  }
}

// Get user by phone number with caching
export async function getUserByPhone(phone: string): Promise<User | null> {
  try {
    // Normalize phone number using utility function
    const normalizedPhone = normalizePhoneNumber(phone);
    log.debug(`getUserByPhone: ${phone} -> normalized: ${normalizedPhone}`);
    
    // Check cache first
    const cached = userCache.get(normalizedPhone);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      log.debug(`getUserByPhone result: FOUND (cached) for ${normalizedPhone}`);
      return cached.user;
    }
    
    const user = await User.findOne({ 
      where: { phoneNumber: normalizedPhone } 
    });
    
    // Cache the result if user found
    if (user) {
      userCache.set(normalizedPhone, {
        user,
        timestamp: Date.now()
      });
      
      // Periodically clear expired cache entries
      if (userCache.size > 100) { // Clear when cache gets large
        clearExpiredCache();
      }
    }
    
    log.debug(`getUserByPhone result: ${user ? 'FOUND' : 'NOT FOUND'} for ${normalizedPhone}`);
    return user;
  } catch (error) {
    log.error('Error getting user by phone', {
      phone,
      normalizedPhone: normalizePhoneNumber(phone),
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

// Create new user
export async function createUser(phone: string): Promise<User> {
  try {
    log.debug(`Creating user with phone: ${phone}`);
    
    // Normalize phone number using utility function
    const normalizedPhone = normalizePhoneNumber(phone);
    log.debug(`Normalized phone: ${normalizedPhone}`);
    
    // Double-check if user already exists to prevent duplicates
    const existingUser = await User.findOne({ 
      where: { phoneNumber: normalizedPhone } 
    });
    
    if (existingUser) {
      log.warn(`User already exists with phone: ${normalizedPhone}, returning existing user`);
      return existingUser;
    }
    
    // Determine user level - Owner gets Admin level, others get Free
    const userLevel = isOwner(phone, config.ownerNumber) ? UserLevel.ADMIN : UserLevel.FREE;
    log.debug(`Determined user level: ${UserLevel[userLevel]} (isOwner: ${isOwner(phone, config.ownerNumber)})`);
    
    const user = await User.create({
      phoneNumber: normalizedPhone,
      level: userLevel,
      language: Language.INDONESIAN,
      registeredAt: new Date(),
      lastActivity: new Date(),
    });
    
    log.user(`User created: ${normalizedPhone} with level ${UserLevel[userLevel]}`);
    return user;
  } catch (error) {
    log.error('Error creating user', {
      phone,
      normalizedPhone: normalizePhoneNumber(phone),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

// Invalidate user cache - call this when user data changes
function invalidateUserCache(phoneNumber: string): void {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  userCache.delete(normalizedPhone);
}

// Update user's last active time
export async function updateUserActivity(user: User): Promise<void> {
  try {
    user.lastActivity = new Date();
    await user.save();
    
    // Invalidate cache to ensure fresh data
    invalidateUserCache(user.phoneNumber);
    
    // Remove logging for performance - this happens very frequently
  } catch (error) {
    log.error('Error updating user activity', error);
  }
}

// Check if user exists
export async function isUserRegistered(phone: string): Promise<boolean> {  try {
    const user = await getUserByPhone(phone);
    return user !== null;
  } catch (error) {
    log.error('Error checking user registration', error);
    return false;
  }
}

// Get or create usage record for a feature
export async function getOrCreateUsage(userId: number, feature: FeatureType): Promise<Usage> {
  try {
    const [usage] = await Usage.findOrCreate({
      where: { userId, feature },
      defaults: {
        userId,
        feature,
        count: 0,
        date: new Date(),
        lastReset: new Date(),
      },    });
    return usage;
  } catch (error) {
    log.error('Error getting or creating usage', error);
    throw error;
  }
}

// Increment usage count for a feature
export async function incrementUsage(userId: number, feature: FeatureType): Promise<Usage> {
  try {
    const usage = await getOrCreateUsage(userId, feature);    usage.count += 1;
    await usage.save();
    
    // Only log debug information if debug level is enabled
    if (process.env.LOG_LEVEL === 'debug') {
      log.debug(`Usage incremented for user ${userId}, feature ${feature}: ${usage.count}`);
    }
    return usage;
  } catch (error) {
    log.error('Error incrementing usage', error);
    throw error;
  }
}

// Check if user has reached limit for a feature
export async function checkLimit(user: User, feature: FeatureType): Promise<{ hasReachedLimit: boolean; currentUsage: number; maxUsage: number }> {
  // Owners have unlimited usage
  if (user.phoneNumber === config.ownerNumber) {
    return { hasReachedLimit: false, currentUsage: 0, maxUsage: Infinity };
  }
  
  // Admins have unlimited usage
  if (user.level === UserLevel.ADMIN) {
    return { hasReachedLimit: false, currentUsage: 0, maxUsage: Infinity };
  }
    // Get current usage
  const usage = await getOrCreateUsage(user.id, feature);
  
  let maxUsage: number;
  
  // Determine max usage based on usage custom limit or user level
  if (usage.customLimit !== null) {
    maxUsage = usage.customLimit;
  } else if (user.level === UserLevel.PREMIUM) {
    maxUsage = config.premiumLimit;
  } else {
    maxUsage = config.freeLimit;
  }
  
  // Check if limit is reached
  const hasReachedLimit = usage.count >= maxUsage;
  
  return {
    hasReachedLimit,
    currentUsage: usage.count,
    maxUsage,
  };
}

// Reset usage for all users
export async function resetAllUsage(): Promise<void> {
  try {
    // Use bulk update for better performance
    const result = await Usage.update(
      { 
        count: 0, 
        lastReset: new Date() 
      },
      { 
        where: {},
        // Add transaction support for data consistency
        // logging: false // Disable query logging for bulk operations
      }
    );
    
    log.success(`Reset usage for all users: ${result[0]} records updated`);
  } catch (error) {
    log.error('Error resetting all usage', error);
    throw error;
  }
}

// Reset usage for a specific user
export async function resetUserUsage(userId: number): Promise<void> {
  try {
    // Use bulk update for better performance
    const result = await Usage.update(
      { 
        count: 0, 
        lastReset: new Date() 
      },
      { 
        where: { userId },
        // logging: false // Disable query logging for bulk operations
      }
    );
    
    log.success(`Reset usage for user ${userId}: ${result[0]} records updated`);
  } catch (error) {
    log.error('Error resetting user usage', error);
    throw error;
  }
}

// Set custom limit for a user's specific feature
export async function setCustomLimit(userId: number, feature: FeatureType, limit: number): Promise<Usage | null> {
  try {
    if (limit < 0) {
      throw new Error('Limit cannot be negative');
    }
    
    const usage = await getOrCreateUsage(userId, feature);
    usage.customLimit = limit;
    await usage.save();
      log.success(`Custom limit set for user ${userId}, feature ${feature}: ${limit}`);
    return usage;
  } catch (error) {
    log.error('Error setting custom limit', error);
    return null;
  }
}

// Set user level
export async function setUserLevel(userId: number, level: UserLevel): Promise<User | null> {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      log.warn(`User with ID ${userId} not found`);
      return null;
    }
    
    const oldLevel = user.level;
    user.level = level;
    await user.save();
    
    // Invalidate cache to ensure fresh data
    invalidateUserCache(user.phoneNumber);
    
    log.user(`User level updated for ${userId}: ${UserLevel[oldLevel]} → ${UserLevel[level]}`);
    return user;
  } catch (error) {
    log.error('Error setting user level', error);
    return null;
  }
}

// Export cache invalidation function for external use
export function invalidateCache(phoneNumber: string): void {
  invalidateUserCache(phoneNumber);
}

export default {
  getUserByPhone,
  createUser,
  updateUserActivity,
  isUserRegistered,
  checkLimit,
  incrementUsage,
  resetAllUsage,
  resetUserUsage,
  setCustomLimit,
  setUserLevel,
};
