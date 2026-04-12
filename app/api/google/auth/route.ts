import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const runtime = 'nodejs';

/** Calendário completo + email: necessário para convites e para detectar convidado = conta conectada. */
const OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
];

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: 'Defina GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REDIRECT_URI.' },
      { status: 503 }
    );
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const url = oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: OAUTH_SCOPES,
  });

  return NextResponse.redirect(url);
}
