import Paystack from "paystack-api";

const paystack = new Paystack({ secretKey: process.env.PAYSTACK_SECRET_KEY! });

export const initializeTransaction = async (
  email: string,
  amount: number,
  metadata: any = {}
) => {
  // Paystack expects amount in kobo (NGN) or pesewas (GHS), so multiply by 100
  const response = await paystack.transaction.initialize({
    email,
    amount: amount * 100,
    metadata,
  });
  return response.data;
};

export const verifyTransaction = async (reference: string) => {
  const response = await paystack.transaction.verify(reference);
  return response.data;
};
