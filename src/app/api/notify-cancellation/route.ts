import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const adminNumber = process.env.ADMIN_NOTIFICATION_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function POST(request: Request) {
  try {
    const { dogName, blockLabel, date, customerPhone } = await request.json();

    // Use the actual customer's phone if provided, but fallback to the admin's phone.
    const customerRouteNumber = customerPhone || adminNumber; 

    if (!client || !twilioNumber || !customerRouteNumber) {
      console.log('Twilio is technically disabled due to missing Environment Variables', { dogName, blockLabel });
      return NextResponse.json({ success: true, warning: 'Simulated mode: Missing Twilio keys' });
    }

    const message = await client.messages.create({
      body: `⚠️ Schedule Update: Mike has unfortunately had to cancel the [${blockLabel}] for ${dogName} on ${date}.`,
      from: twilioNumber,
      to: customerRouteNumber,
    });

    console.log(`Twilio Cancellation Message Sent to Customer: ${message.sid}`);
    return NextResponse.json({ success: true, messageId: message.sid });

  } catch (error: any) {
    console.error('Twilio notify-cancellation Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
