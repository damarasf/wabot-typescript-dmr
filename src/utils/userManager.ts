import { User, UserLevel, Usage, FeatureType } from '../database/models';
import config from './config';
import moment from 'moment-timezone';

// Get user by phone number
export async function getUserByPhone(phone: string): Promise<User | null> {
  try {
    // Normalize phone number (remove non-digits)
    const normalizedPhone = phone.replace(/[^\d]/g, '');
    
    return await User.findOne({ 
      where: { phoneNumber: normalizedPhone } 
    });
  } catch (error) {
    console.error('Error getting user by phone:', error);
    return null;
  }
}

// Create new user
export async function createUser(phone: string): Promise<User> {
  try {
    // Normalize phone number (remove non-digits)
    const normalizedPhone = phone.replace(/[^\d]/g, '');
    
    const user = await User.create({
      phoneNumber: normalizedPhone,
      level: UserLevel.FREE,
      registeredAt: new Date(),
      lastActivity: new Date(),
    });
    
    console.log(`✅ User created: ${normalizedPhone}`);
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Update user's last active time
export async function updateUserActivity(user: User): Promise<void> {
  try {
    user.lastActivity = new Date();
    await user.save();
  } catch (error) {
    console.error('Error updating user activity:', error);
  }
}

// Check if user exists
export async function isUserRegistered(phone: string): Promise<boolean> {
  try {
    const user = await getUserByPhone(phone);
    return user !== null;
  } catch (error) {
    console.error('Error checking user registration:', error);
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
      },
    });
    return usage;
  } catch (error) {
    console.error('Error getting or creating usage:', error);
    throw error;
  }
}

// Increment usage count for a feature
export async function incrementUsage(userId: number, feature: FeatureType): Promise<Usage> {
  try {
    const usage = await getOrCreateUsage(userId, feature);
    usage.count += 1;
    await usage.save();
    
    console.log(`📊 Usage incremented for user ${userId}, feature ${feature}: ${usage.count}`);
    return usage;
  } catch (error) {
    console.error('Error incrementing usage:', error);
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
    const result = await Usage.update(
      { count: 0, lastReset: new Date() },
      { where: {} }
    );
    
    console.log(`✅ Reset usage for all users: ${result[0]} records updated`);
  } catch (error) {
    console.error('Error resetting all usage:', error);
    throw error;
  }
}

// Reset usage for a specific user
export async function resetUserUsage(userId: number): Promise<void> {
  try {
    const result = await Usage.update(
      { count: 0, lastReset: new Date() },
      { where: { userId } }
    );
    
    console.log(`✅ Reset usage for user ${userId}: ${result[0]} records updated`);
  } catch (error) {
    console.error('Error resetting user usage:', error);
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
    
    console.log(`✅ Custom limit set for user ${userId}, feature ${feature}: ${limit}`);
    return usage;
  } catch (error) {
    console.error('Error setting custom limit:', error);
    return null;
  }
}

// Set user level
export async function setUserLevel(userId: number, level: UserLevel): Promise<User | null> {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      console.warn(`User with ID ${userId} not found`);
      return null;
    }
    
    const oldLevel = user.level;
    user.level = level;
    await user.save();
    
    console.log(`✅ User level updated for ${userId}: ${UserLevel[oldLevel]} → ${UserLevel[level]}`);
    return user;
  } catch (error) {
    console.error('Error setting user level:', error);
    return null;
  }
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
