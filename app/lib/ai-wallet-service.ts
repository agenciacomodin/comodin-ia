
import { 
  AIWallet,
  AITransaction,
  FinancialTransaction,
  AIUsageType,
  TransactionType,
  PaymentProvider,
  Prisma
} from '@prisma/client';
import { db } from './db';
import { Decimal } from '@prisma/client/runtime/library';

export interface AIUsageRequest {
  organizationId: string;
  userId?: string;
  userName?: string;
  usageType: AIUsageType;
  providerName: string;
  modelUsed?: string;
  providerCost: number; // Costo real que nos cobró el proveedor
  inputTokens?: number;
  outputTokens?: number;
  processingTime?: number;
  description?: string;
  metadata?: Record<string, any>;
}

export interface WalletRechargeRequest {
  organizationId: string;
  amount: number;
  currency: string;
  paymentProvider: PaymentProvider;
  paymentReference: string;
  userId?: string;
  userName?: string;
  description?: string;
}

export interface WalletStats {
  balance: number;
  totalSpent: number;
  totalRecharged: number;
  transactionCount: number;
  lowBalanceAlert: boolean;
  recentTransactions: AITransaction[];
}

export class AIWalletService {
  
  // Crear billetera automáticamente para nueva organización
  static async createWalletForOrganization(organizationId: string): Promise<AIWallet> {
    try {
      const existingWallet = await db.aIWallet.findUnique({
        where: { organizationId }
      });

      if (existingWallet) {
        return existingWallet;
      }

      const wallet = await db.aIWallet.create({
        data: {
          organizationId,
          balance: new Decimal(0),
          totalSpent: new Decimal(0),
          totalRecharged: new Decimal(0),
          transactionCount: 0,
          currency: 'USD',
          lowBalanceThreshold: new Decimal(10),
          alertsEnabled: true
        }
      });

      return wallet;
    } catch (error) {
      console.error('Error creating AI wallet:', error);
      throw new Error('Failed to create AI wallet');
    }
  }

  // Obtener billetera de una organización (crear si no existe)
  static async getOrCreateWallet(organizationId: string): Promise<AIWallet> {
    try {
      let wallet = await db.aIWallet.findUnique({
        where: { organizationId }
      });

      if (!wallet) {
        wallet = await this.createWalletForOrganization(organizationId);
      }

      return wallet;
    } catch (error) {
      console.error('Error getting wallet:', error);
      throw new Error('Failed to get wallet');
    }
  }

  // Verificar si hay saldo suficiente para un uso de IA
  static async hasSufficientBalance(organizationId: string, estimatedCost: number): Promise<boolean> {
    try {
      const wallet = await this.getOrCreateWallet(organizationId);
      const clientCost = estimatedCost * 1.30; // Aplicar margen del 30%
      
      return wallet.balance.toNumber() >= clientCost;
    } catch (error) {
      console.error('Error checking balance:', error);
      return false;
    }
  }

  // Procesar uso de IA (descontar del saldo)
  static async processAIUsage(request: AIUsageRequest): Promise<AITransaction> {
    try {
      return await db.$transaction(async (tx) => {
        // Obtener billetera
        const wallet = await tx.aIWallet.findUnique({
          where: { organizationId: request.organizationId }
        });

        if (!wallet) {
          throw new Error('Wallet not found');
        }

        // Calcular costo para el cliente (con margen del 30%)
        const providerCost = new Decimal(request.providerCost);
        const clientCost = providerCost.times(1.30);
        const currentBalance = wallet.balance;

        // Verificar saldo suficiente
        if (currentBalance.lessThan(clientCost)) {
          throw new Error(`Insufficient balance. Required: $${clientCost}, Available: $${currentBalance}`);
        }

        // Nuevo saldo después del descuento
        const newBalance = currentBalance.minus(clientCost);

        // Crear transacción de uso de IA
        const aiTransaction = await tx.aITransaction.create({
          data: {
            walletId: wallet.id,
            usageType: request.usageType,
            providerName: request.providerName,
            modelUsed: request.modelUsed,
            providerCost: providerCost,
            clientCost: clientCost,
            margin: new Decimal(0.30),
            inputTokens: request.inputTokens,
            outputTokens: request.outputTokens,
            totalTokens: (request.inputTokens || 0) + (request.outputTokens || 0),
            processingTime: request.processingTime,
            description: request.description,
            metadata: request.metadata,
            userId: request.userId,
            userName: request.userName,
            balanceAfter: newBalance
          }
        });

        // Actualizar billetera
        await tx.aIWallet.update({
          where: { id: wallet.id },
          data: {
            balance: newBalance,
            totalSpent: wallet.totalSpent.plus(clientCost),
            transactionCount: wallet.transactionCount + 1,
            updatedAt: new Date()
          }
        });

        // Crear registro en historial financiero
        await tx.financialTransaction.create({
          data: {
            organizationId: request.organizationId,
            type: TransactionType.AI_USAGE_DEDUCTION,
            amount: clientCost,
            currency: wallet.currency,
            description: `AI Usage: ${request.usageType} - ${request.providerName}`,
            reference: aiTransaction.id,
            aiTransactionId: aiTransaction.id,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            userId: request.userId,
            userName: request.userName,
            metadata: {
              usageType: request.usageType,
              providerName: request.providerName,
              modelUsed: request.modelUsed,
              tokens: (request.inputTokens || 0) + (request.outputTokens || 0)
            }
          }
        });

        return aiTransaction;
      });
    } catch (error: any) {
      console.error('Error processing AI usage:', error);
      throw new Error(`Failed to process AI usage: ${error.message}`);
    }
  }

  // Recargar billetera
  static async rechargeWallet(request: WalletRechargeRequest): Promise<FinancialTransaction> {
    try {
      return await db.$transaction(async (tx) => {
        // Obtener o crear billetera
        const wallet = await this.getOrCreateWallet(request.organizationId);
        
        const rechargeAmount = new Decimal(request.amount);
        const currentBalance = wallet.balance;
        const newBalance = currentBalance.plus(rechargeAmount);

        // Actualizar billetera
        await tx.aIWallet.update({
          where: { id: wallet.id },
          data: {
            balance: newBalance,
            totalRecharged: wallet.totalRecharged.plus(rechargeAmount),
            transactionCount: wallet.transactionCount + 1,
            updatedAt: new Date()
          }
        });

        // Crear registro en historial financiero
        const financialTransaction = await tx.financialTransaction.create({
          data: {
            organizationId: request.organizationId,
            type: TransactionType.WALLET_RECHARGE,
            amount: rechargeAmount,
            currency: request.currency,
            description: request.description || `Wallet recharge via ${request.paymentProvider}`,
            reference: request.paymentReference,
            paymentProvider: request.paymentProvider,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            userId: request.userId,
            userName: request.userName,
            metadata: {
              paymentProvider: request.paymentProvider,
              paymentReference: request.paymentReference
            }
          }
        });

        return financialTransaction;
      });
    } catch (error) {
      console.error('Error recharging wallet:', error);
      throw new Error('Failed to recharge wallet');
    }
  }

  // Obtener estadísticas de la billetera
  static async getWalletStats(organizationId: string): Promise<WalletStats> {
    try {
      const wallet = await this.getOrCreateWallet(organizationId);
      
      const recentTransactions = await db.aITransaction.findMany({
        where: { wallet: { organizationId } },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      const lowBalanceAlert = wallet.balance.lessThanOrEqualTo(wallet.lowBalanceThreshold);

      return {
        balance: wallet.balance.toNumber(),
        totalSpent: wallet.totalSpent.toNumber(),
        totalRecharged: wallet.totalRecharged.toNumber(),
        transactionCount: wallet.transactionCount,
        lowBalanceAlert,
        recentTransactions
      };
    } catch (error) {
      console.error('Error getting wallet stats:', error);
      throw new Error('Failed to get wallet stats');
    }
  }

  // Obtener historial de transacciones de IA
  static async getAITransactionHistory(
    organizationId: string, 
    page: number = 1, 
    limit: number = 50
  ): Promise<{ transactions: AITransaction[], total: number }> {
    try {
      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        db.aITransaction.findMany({
          where: { wallet: { organizationId } },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        db.aITransaction.count({
          where: { wallet: { organizationId } }
        })
      ]);

      return { transactions, total };
    } catch (error) {
      console.error('Error getting AI transaction history:', error);
      throw new Error('Failed to get transaction history');
    }
  }

  // Obtener historial financiero completo
  static async getFinancialHistory(
    organizationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ transactions: FinancialTransaction[], total: number }> {
    try {
      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        db.financialTransaction.findMany({
          where: { organizationId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        db.financialTransaction.count({
          where: { organizationId }
        })
      ]);

      return { transactions, total };
    } catch (error) {
      console.error('Error getting financial history:', error);
      throw new Error('Failed to get financial history');
    }
  }

  // Configurar alertas de saldo bajo
  static async updateLowBalanceSettings(
    organizationId: string,
    threshold: number,
    alertsEnabled: boolean
  ): Promise<AIWallet> {
    try {
      const wallet = await this.getOrCreateWallet(organizationId);

      return await db.aIWallet.update({
        where: { id: wallet.id },
        data: {
          lowBalanceThreshold: new Decimal(threshold),
          alertsEnabled
        }
      });
    } catch (error) {
      console.error('Error updating low balance settings:', error);
      throw new Error('Failed to update settings');
    }
  }
}
