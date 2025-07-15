// Configuration file for Private Lottery Application
// All lottery parameters and system settings

export default {
  // Draw Configuration
  draw: {
    frequency: 'weekly', // weekly, daily, custom
    drawTime: '20:00', // Default draw time (24h format)
    lockTimeBeforeDraw: 60, // seconds before draw to lock participation
    numbersRange: {
      min: 1,
      max: 37,
      count: 6
    }
  },

  // Jackpot Configuration
  jackpot: {
    updateInterval: 3600000, // 1 hour in milliseconds
    minimumAmount: 10000, // Minimum jackpot amount in currency units
    incrementRange: {
      min: 500,
      max: 2000
    }
  },

  // User Rank Configuration
  userRanks: {
    silver: {
      threshold: 10,
      name: 'Silver',
      benefits: ['Basic support', 'Standard notifications']
    },
    gold: {
      threshold: 100,
      name: 'Gold',
      benefits: ['Priority support', 'Advanced statistics', 'Bonus draws']
    },
    diamond: {
      threshold: 500,
      name: 'Diamond',
      benefits: ['VIP support', 'Exclusive events', 'Higher bonuses', 'Personal account manager']
    }
  },

  // Referral System Configuration
  referral: {
    bonusAmount: 100, // Amount in currency units
    minimumDepositForBonus: 1000, // Minimum deposit to trigger referral bonus
    multipleReferralBonus: {
      threshold: 5, // Number of referrals needed
      bonusAmount: 1000 // Bonus amount for multiple referrals
    }
  },

  // Email Configuration
  email: {
    enabled: true,
    templates: {
      welcome: {
        subject: 'Welcome to BrachaVeHatzlacha',
        template: 'welcome'
      },
      drawResults: {
        subject: 'Draw Results Available',
        template: 'draw_results'
      },
      winnerNotification: {
        subject: 'Congratulations! You Won!',
        template: 'winner_notification'
      }
    }
  },

  // SMS Configuration
  notifications: {
    sms: {
      enabled: false, // Set to false by default - requires Twilio setup
      provider: 'twilio',
      templates: {
        drawReminder: 'Draw starting in 5 minutes! Good luck!',
        winnerNotification: 'Congratulations! You won {amount} in draw #{drawNumber}!',
        balanceUpdate: 'Your balance has been updated. New balance: {balance}'
      }
    },
    email: {
      enabled: true,
      provider: 'hostinger'
    }
  },

  // Security Configuration
  security: {
    sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    passwordMinLength: 6,
    requireEmailVerification: false,
    enable2FA: false
  },

  // Payment Configuration
  payments: {
    currency: '₪',
    minimumDeposit: 50,
    maximumDeposit: 10000,
    ticketPrice: 20,
    welcomeBonus: 100,
    crypto: {
      enabled: true,
      wallets: {
        bitcoin: {
          enabled: true,
          address: null // Set by admin
        },
        ethereum: {
          enabled: true,
          address: null // Set by admin
        },
        litecoin: {
          enabled: true,
          address: null // Set by admin
        }
      }
    }
  },

  // Rate Limiting Configuration
  rateLimiting: {
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100 // Per IP
    },
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 5 // Per IP
    }
  }
};