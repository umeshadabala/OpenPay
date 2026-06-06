import crypto from 'crypto';

export interface WebhookPayload {
  event: 'payment.received';
  merchantCode: string;
  amount: string;
  utr: string | null;
  sender: string;
  rawSms: string;
  timestamp: string;
  reasoning: string[];
}

/**
 * Sends a secure signed webhook to the merchant's endpoint
 */
export async function sendWebhook(
  url: string,
  secret: string,
  payload: WebhookPayload
): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const payloadString = JSON.stringify(payload);
    
    // Sign payload using HMAC-SHA256 with the webhook secret
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-OpenPay-Signature': signature,
        'User-Agent': 'OpenPay-Webhook-Agent/1.0',
      },
      body: payloadString,
    });

    if (response.ok) {
      console.log(`Webhook sent successfully to ${url}, status: ${response.status}`);
      return { success: true, status: response.status };
    } else {
      console.error(`Webhook to ${url} failed with status: ${response.status}`);
      return { success: false, status: response.status, error: `HTTP Error ${response.status}` };
    }
  } catch (error: any) {
    console.error(`Failed to send webhook to ${url}:`, error);
    return { success: false, error: error.message || 'Network error' };
  }
}
