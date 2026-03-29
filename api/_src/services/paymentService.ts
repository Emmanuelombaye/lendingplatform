import Flutterwave from 'flutterwave-node-v3';
import dotenv from 'dotenv';

dotenv.config();

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY || '',
  process.env.FLW_SECRET_KEY || ''
);

export class PaymentService {
  /**
   * Initiate a processing fee payment
   * @param data Payment details
   */
  static async initiateProcessingFee(data: {
    amount: number;
    email: string;
    phone: string;
    fullName: string;
    tx_ref: string; // This should be unique, e.g., FEE-APP_ID-TIMESTAMP
    callback_url: string;
  }) {
    try {
      const payload = {
        tx_ref: data.tx_ref,
        amount: data.amount,
        currency: "TZS",
        redirect_url: data.callback_url,
        customer: {
          email: data.email,
          phonenumber: data.phone,
          name: data.fullName,
        },
        customizations: {
          title: "Vertex Loans Processing Fee",
          description: "Payment for loan application processing fee",
          logo: "https://vertexloans.onrender.com/logovertex.png",
        },
      };

      const response = await flw.Checkout.hosted(payload);
      return response;
    } catch (error) {
      console.error("Flutterwave initiation error:", error);
      throw error;
    }
  }

  /**
   * Verify a transaction
   * @param transactionId Flutterwave transaction ID
   */
  static async verifyTransaction(transactionId: string) {
    try {
      const response = await flw.Transaction.verify({ id: transactionId });
      return response;
    } catch (error) {
      console.error("Flutterwave verification error:", error);
      throw error;
    }
  }
}
