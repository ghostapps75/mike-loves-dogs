import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
// For this tutorial/demo, we'll just text Mike's actual physical test phone back since we aren't registering actual customer phone numbers yet.
const adminNumber = process.env.ADMIN_NOTIFICATION_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function POST(request: Request) {
  try {
    const { dogName, blockLabel, date, customerPhone } = await request.json();

    // Use the actual customer's phone if provided, but fallback to the admin's phone.
    // NOTE: Twilio free trials will fail if customerPhone is unverified. 
    // If you haven't verified it in Twilio, the SMS will be blocked!
    const customerRouteNumber = customerPhone || adminNumber; 

    if (!client || !twilioNumber || !customerRouteNumber) {
      console.log('Twilio is technically disabled due to missing Environment Variables', { dogName, blockLabel });
      return NextResponse.json({ success: true, warning: 'Simulated mode: Missing Twilio keys' });
    }

    const message = await client.messages.create({
      body: `✅ Great news! Mike approved ${dogName} for the [${blockLabel}] on ${date}.`,
      from: twilioNumber,
      to: customerRouteNumber, // Routing to admin phone temporarily due to unverified numbers
    });

    console.log(`Twilio Message Sent to Customer: ${message.sid}`);
    return NextResponse.json({ success: true, messageId: message.sid });

  } catch (error: any) {
    console.error('Twilio notify-customer Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
