// Configuration file for Private Lottery Application
// All lottery parameters and system settings

module.exports = {
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

  // Prize Distribution Configuration
  prizeDistribution: {
    6: 0.50, // 50% for 6 matches
    5: 0.30, // 30% for 5 matches
    4: 0.20, // 20% for 4 matches
    3: 0.00, // 0% for 3 or less matches
    houseEdge: 0.50 // 50% goes to house on each ticket
  },

  // Ticket Configuration
  ticket: {
    price: 100, // Price per ticket in currency units
    maxTicketsPerDraw: 10, // Maximum tickets per user per draw
    currency: '₪'
  },

  // Notification Configuration
  notifications: {
    sms: {
      enabled: false, // Enable/disable SMS notifications
      provider: 'twilio',
      drawReminder: {
        enabled: true,
        timeBeforeDraw: 1800 // 30 minutes before draw
      },
      winningNotification: {
        enabled: true,
        immediateNotification: true
      }
    },
    email: {
      enabled: false,
      provider: 'sendgrid'
    },
    web: {
      enabled: true,
      pushNotifications: true
    }
  },

  // Security Configuration
  security: {
    sessionTimeout: 86400000, // 24 hours in milliseconds
    maxLoginAttempts: 5,
    lockoutDuration: 900000, // 15 minutes in milliseconds
    passwordRequirements: {
      minLength: 8,
      requireUppercase: false, // Simplified for username-only system
      requireNumbers: false,
      requireSpecialChars: false
    }
  },

  // UI/UX Configuration
  ui: {
    languages: ['en', 'he'],
    defaultLanguage: 'he',
    animations: {
      enabled: true,
      coinRainDuration: 3000,
      confettiDuration: 5000
    },
    carousel: {
      autoRotate: true,
      rotationInterval: 4000,
      maxWinners: 10
    },
    theme: {
      primaryColor: '#fbbf24', // Gold/Yellow
      secondaryColor: '#1e293b', // Dark blue
      backgroundColor: '#f8fafc' // Light background
    }
  },

  // Database Configuration
  database: {
    connectionPoolSize: 10,
    queryTimeout: 30000,
    retryAttempts: 3
  },

  // External Services Configuration
  externalServices: {
    standardLottery: {
      enabled: true,
      url: 'https://www.pais.co.il/lotto',
      name: 'Israeli National Lottery'
    },
    socialMedia: {
      whatsapp: {
        enabled: true,
        number: '+972501234567' // Replace with actual number
      },
      telegram: {
        enabled: true,
        username: '@brachavehatzlacha' // Replace with actual username
      }
    }
  },

  // Development Configuration
  development: {
    enableDebugLogs: true,
    mockExternalServices: true,
    seedDatabase: true
  }
};