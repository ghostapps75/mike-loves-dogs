import { NextResponse } from 'next/server';
import twilio from 'twilio';

// Initialize the Twilio client only if env vars are present
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const adminNumber = process.env.ADMIN_NOTIFICATION_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function POST(request: Request) {
  try {
    const { dogName, ownerName, blockLabel, date } = await request.json();

    if (!client || !twilioNumber || !adminNumber) {
      console.log('Twilio is technically disabled due to missing Environment Variables', { dogName, ownerName, blockLabel });
      return NextResponse.json({ success: true, warning: 'Simulated mode: Missing Twilio keys' });
    }

    const message = await client.messages.create({
      body: `🐶 New Request: ${ownerName} just requested the [${blockLabel}] spot for ${dogName} on ${date}.`,
      from: twilioNumber,
      to: adminNumber,
    });

    console.log(`Twilio Message Sent to Mike: ${message.sid}`);
    return NextResponse.json({ success: true, messageId: message.sid });

  } catch (error: any) {
    console.error('Twilio notify-mike Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
