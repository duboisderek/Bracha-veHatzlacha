export const translations = {
  en: {
    // Header
    balance: "Balance",
    language: "Language",
    
    // Dashboard Stats
    nextDraw: "Next Draw",
    myTickets: "My Tickets",
    totalWinnings: "Total Winnings",
    referrals: "Referrals",
    jackpot: "Jackpot",
    activeForNextDraw: "Active for next draw",
    lifetimeEarnings: "Lifetime earnings",
    thisMonth: "this month",
    friendsJoined: "Friends joined",
    earnedFromReferrals: "earned from referrals",
    
    // Number Selection
    selectYourLuckyNumbers: "Select Your Lucky Numbers",
    chooseNumbers: "Choose 6 numbers (1-37)",
    yourSelectedNumbers: "Your Selected Numbers",
    selected: "selected",
    costPerTicket: "Cost per ticket",
    quickPick: "Quick Pick",
    purchaseTicket: "Purchase Ticket",
    
    // Quick Actions
    quickActions: "Quick Actions",
    addFunds: "Add Funds",
    myHistory: "My History",
    supportChat: "Support Chat",
    
    // Referral
    referFriends: "Refer Friends",
    referralDescription: "Earn ₪100 for each friend who joins and makes a deposit!",
    progressToBonus: "Progress to ₪1,000 bonus:",
    referralsCount: "referrals",
    
    // Tickets
    myActiveTickets: "My Active Tickets",
    ticket: "Ticket",
    cost: "Cost",
    active: "Active",
    
    // Last Draw Results
    lastDrawResults: "Last Draw Results",
    draw: "Draw",
    matches: "matches",
    winner: "winner",
    winners: "winners",
    each: "each",
    
    // Messages
    congratulations: "Congratulations!",
    youWon: "You've won",
    with: "with",
    matchingNumbers: "matching numbers",
    yourWinningNumbers: "Your winning numbers:",
    viewUpdatedBalance: "View Updated Balance",
    close: "Close",
    
    // Errors
    insufficientBalance: "Insufficient balance",
    alreadyHaveTicket: "You already have a ticket for this draw",
    mustSelect6Numbers: "You must select exactly 6 numbers",
    loginRequired: "Please log in to continue",
  },
  he: {
    // Header
    balance: "יתרה",
    language: "שפה",
    
    // Dashboard Stats
    nextDraw: "הגרלה הבאה",
    myTickets: "הכרטיסים שלי",
    totalWinnings: "סך זכיות",
    referrals: "הפניות",
    jackpot: "קופה",
    activeForNextDraw: "פעילים להגרלה הבאה",
    lifetimeEarnings: "זכיות כלליות",
    thisMonth: "החודש",
    friendsJoined: "חברים הצטרפו",
    earnedFromReferrals: "הושג מהפניות",
    
    // Number Selection
    selectYourLuckyNumbers: "בחר את המספרים המזליים שלך",
    chooseNumbers: "בחר 6 מספרים (1-37)",
    yourSelectedNumbers: "המספרים שבחרת",
    selected: "נבחרו",
    costPerTicket: "עלות כרטיס",
    quickPick: "בחירה מהירה",
    purchaseTicket: "רכישת כרטיס",
    
    // Quick Actions
    quickActions: "פעולות מהירות",
    addFunds: "הוספת כספים",
    myHistory: "ההיסטוריה שלי",
    supportChat: "צ'אט תמיכה",
    
    // Referral
    referFriends: "הפנה חברים",
    referralDescription: "הרוויח ₪100 עבור כל חבר שמצטרף ומבצע הפקדה!",
    progressToBonus: "התקדמות לבונוס ₪1,000:",
    referralsCount: "הפניות",
    
    // Tickets
    myActiveTickets: "הכרטיסים הפעילים שלי",
    ticket: "כרטיס",
    cost: "עלות",
    active: "פעיל",
    
    // Last Draw Results
    lastDrawResults: "תוצאות הגרלה אחרונה",
    draw: "הגרלה",
    matches: "התאמות",
    winner: "זוכה",
    winners: "זוכים",
    each: "כל אחד",
    
    // Messages
    congratulations: "מזל טוב!",
    youWon: "זכית ב",
    with: "עם",
    matchingNumbers: "מספרים תואמים",
    yourWinningNumbers: "המספרים הזוכים שלך:",
    viewUpdatedBalance: "צפה ביתרה מעודכנת",
    close: "סגור",
    
    // Errors
    insufficientBalance: "יתרה לא מספקת",
    alreadyHaveTicket: "כבר יש לך כרטיס להגרלה זו",
    mustSelect6Numbers: "עליך לבחור בדיוק 6 מספרים",
    loginRequired: "נא להתחבר כדי להמשיך",
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

export const getTranslation = (key: TranslationKey, language: Language): string => {
  return translations[language][key] || translations.en[key] || key;
};
