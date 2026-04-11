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
    const { dogName, blockLabel, date } = await request.json();

    // In a full production app, you would fetch the customer's phone number from your database here.
    // For now, we will reroute it to the admin number so Mike gets physical proof it works!
    const customerRouteNumber = adminNumber; 

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
