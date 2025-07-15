declare module "paystack-api" {
  export interface PaystackConfig {
    secretKey: string;
  }

  export interface InitializeTransactionData {
    email: string;
    amount: number;
    callback_url?: string;
    metadata?: Record<string, any>;
  }

  export interface InitializeTransactionResponse {
    status: boolean;
    message: string;
    data: {
      authorization_url: string;
      access_code: string;
      reference: string;
    };
  }

  export interface VerifyTransactionResponse {
    status: boolean;
    message: string;
    data: {
      id: number;
      status: string;
      reference: string;
      amount: number;
      currency: string;
      customer: {
        id: number;
        email: string;
      };
      metadata: Record<string, any>;
      subscription?: number;
    };
  }

  export class Paystack {
    constructor(config: PaystackConfig);

    transaction: {
      initialize(
        data: InitializeTransactionData
      ): Promise<InitializeTransactionResponse>;
      verify(reference: string): Promise<VerifyTransactionResponse>;
    };
  }

  export default Paystack;
}
