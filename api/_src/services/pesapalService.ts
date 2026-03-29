import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PESAPAL_URL = process.env.PESAPAL_ENV === 'live' 
  ? 'https://pay.pesapal.com/v3'
  : 'https://cyb.pesapal.com/v3';

export class PesaPalService {
  private static accessToken: string | null = null;
  private static tokenExpiry: number = 0;

  private static async getAccessToken() {
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(`${PESAPAL_URL}/api/Auth/RequestToken`, {
        consumer_key: process.env.PESAPAL_CONSUMER_KEY,
        consumer_secret: process.env.PESAPAL_CONSUMER_SECRET
      });

      if (response.data.token) {
        this.accessToken = response.data.token;
        // Token expires in 5 minutes (default for PesaPal v3 usually)
        this.tokenExpiry = now + 5 * 60 * 1000;
        return this.accessToken;
      }
      throw new Error('Failed to get PesaPal token');
    } catch (error: any) {
      console.error('PesaPal Auth Error:', error.response?.data || error.message);
      throw error;
    }
  }

  static async registerIPN(notificationUrl: string) {
    const token = await this.getAccessToken();
    try {
      const response = await axios.post(`${PESAPAL_URL}/api/URLSetup/RegisterIPN`, {
        url: notificationUrl,
        ipn_notification_type: 'GET'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('PesaPal IPN Error:', error.response?.data || error.message);
      throw error;
    }
  }

  static async submitOrderRequest(orderData: {
    id: string;
    currency: string;
    amount: number;
    description: string;
    callback_url: string;
    notification_id: string;
    billing_address: {
      email_address: string;
      phone_number: string;
      first_name: string;
      last_name: string;
    };
  }) {
    const token = await this.getAccessToken();
    try {
      const payload = {
        id: orderData.id,
        currency: orderData.currency,
        amount: orderData.amount,
        description: orderData.description,
        callback_url: orderData.callback_url,
        notification_id: orderData.notification_id,
        billing_address: orderData.billing_address
      };

      const response = await axios.post(`${PESAPAL_URL}/api/Transactions/SubmitOrderRequest`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('PesaPal Order Error:', error.response?.data || error.message);
      throw error;
    }
  }

  static async getTransactionStatus(orderTrackingId: string) {
    const token = await this.getAccessToken();
    try {
      const response = await axios.get(`${PESAPAL_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('PesaPal Status Error:', error.response?.data || error.message);
      throw error;
    }
  }
}
