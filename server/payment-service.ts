import { storage } from "./storage";
import { logger } from "./logger";

export interface CryptoWallet {
  currency: string;
  address: string;
  qrCode?: string;
}

export class PaymentService {
  private static instance: PaymentService;
  private adminWallets: Map<string, CryptoWallet> = new Map();

  private constructor() {
    this.initializeDefaultWallets();
  }

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  private initializeDefaultWallets(): void {
    // Initialize with some default crypto wallets (for demo)
    this.adminWallets.set('btc', {
      currency: 'btc',
      address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2'
    });

    this.adminWallets.set('eth', {
      currency: 'eth',
      address: '0x742d35Cc6634C0532925a3b8D73e4F0a0d3e24f2'
    });

    this.adminWallets.set('ltc', {
      currency: 'ltc',
      address: 'LTC1234567890ABCDEFGHIJKLMNOPQRSTUV'
    });
  }

  getAdminWallets(): CryptoWallet[] {
    return Array.from(this.adminWallets.values());
  }

  updateAdminWallets(wallets: { [currency: string]: string }): void {
    for (const [currency, address] of Object.entries(wallets)) {
      this.adminWallets.set(currency.toLowerCase(), {
        currency: currency.toLowerCase(),
        address
      });
    }
    logger.info('Admin wallets updated', 'PAYMENT_SERVICE', { currencies: Object.keys(wallets) });
  }

  async submitCryptoPayment(userId: string, amount: string, txHash: string, currency: string): Promise<any> {
    try {
      // Get admin wallet address for the currency
      const adminWallet = this.adminWallets.get(currency.toLowerCase());
      const walletAddress = adminWallet ? adminWallet.address : 'pending_verification';
      
      const payment = await storage.createCryptoPayment({
        id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        amount,
        currency: currency.toLowerCase(),
        txHash,
        walletAddress,
        status: 'pending',
        submittedAt: new Date()
      });

      logger.info('Crypto payment submitted', 'PAYMENT_SERVICE', {
        paymentId: payment.id,
        userId,
        amount,
        currency,
        txHash,
        walletAddress
      });

      return payment;
    } catch (error) {
      logger.error('Failed to submit crypto payment', error as Error, 'PAYMENT_SERVICE');
      throw error;
    }
  }

  async getUserPayments(userId: string): Promise<any[]> {
    try {
      return await storage.getUserCryptoPayments(userId);
    } catch (error) {
      logger.error('Failed to get user payments', error as Error, 'PAYMENT_SERVICE');
      return [];
    }
  }

  async getPendingPayments(): Promise<any[]> {
    try {
      return await storage.getPendingCryptoPayments();
    } catch (error) {
      logger.error('Failed to get pending payments', error as Error, 'PAYMENT_SERVICE');
      return [];
    }
  }

  async approveCryptoPayment(paymentId: string, adminId: string, notes?: string): Promise<void> {
    try {
      // Get payment details
      const payment = await storage.getCryptoPayment(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'pending') {
        throw new Error('Payment is not pending');
      }

      // Update payment status
      await storage.updateCryptoPayment(paymentId, {
        status: 'approved',
        processedAt: new Date(),
        adminNotes: notes || 'Payment approved by admin'
      });

      // Add balance to user account
      await storage.updateUserBalance(payment.userId, payment.amount);

      // Create transaction record
      await storage.createTransaction({
        userId: payment.userId,
        type: 'deposit',
        amount: payment.amount,
        description: `Crypto deposit approved - ${payment.currency.toUpperCase()} - ${payment.txHash.substring(0, 10)}...`
      });

      logger.info('Crypto payment approved', 'PAYMENT_SERVICE', {
        paymentId,
        adminId,
        amount: payment.amount,
        userId: payment.userId
      });
    } catch (error) {
      logger.error('Failed to approve crypto payment', error as Error, 'PAYMENT_SERVICE');
      throw error;
    }
  }

  async rejectCryptoPayment(paymentId: string, adminId: string, notes: string): Promise<void> {
    try {
      // Get payment details
      const payment = await storage.getCryptoPayment(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'pending') {
        throw new Error('Payment is not pending');
      }

      // Update payment status
      await storage.updateCryptoPayment(paymentId, {
        status: 'rejected',
        processedAt: new Date(),
        adminNotes: notes
      });

      logger.info('Crypto payment rejected', 'PAYMENT_SERVICE', {
        paymentId,
        adminId,
        reason: notes,
        userId: payment.userId
      });
    } catch (error) {
      logger.error('Failed to reject crypto payment', error as Error, 'PAYMENT_SERVICE');
      throw error;
    }
  }

  async manualDeposit(userId: string, amount: string, adminId: string, description?: string): Promise<void> {
    try {
      // Validate amount
      const depositAmount = parseFloat(amount);
      if (depositAmount <= 0) {
        throw new Error('Invalid deposit amount');
      }

      // Add balance to user account
      await storage.updateUserBalance(userId, amount);

      // Create transaction record
      await storage.createTransaction({
        userId,
        type: 'deposit',
        amount,
        description: description || `Manual deposit by admin ${adminId}`
      });

      logger.info('Manual deposit processed', 'PAYMENT_SERVICE', {
        userId,
        amount,
        adminId,
        description
      });
    } catch (error) {
      logger.error('Failed to process manual deposit', error as Error, 'PAYMENT_SERVICE');
      throw error;
    }
  }

  async getPaymentStats(): Promise<{
    totalDeposits: number;
    pendingPayments: number;
    approvedPayments: number;
    rejectedPayments: number;
    totalVolume: string;
  }> {
    try {
      // Get all crypto payments (this would be a new storage method in production)
      // For now, we'll simulate the data
      return {
        totalDeposits: 156,
        pendingPayments: 3,
        approvedPayments: 142,
        rejectedPayments: 11,
        totalVolume: "45,280.50"
      };
    } catch (error) {
      logger.error('Failed to get payment stats', error as Error, 'PAYMENT_SERVICE');
      return {
        totalDeposits: 0,
        pendingPayments: 0,
        approvedPayments: 0,
        rejectedPayments: 0,
        totalVolume: "0.00"
      };
    }
  }
}

export const paymentService = PaymentService.getInstance();