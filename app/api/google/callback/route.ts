import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const oauthError = request.nextUrl.searchParams.get('error');

  if (oauthError) {
    return new NextResponse(
      `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/><title>OAuth</title></head><body><p>Erro do Google: ${oauthError}</p></body></html>`,
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  if (!code) {
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"/><title>OAuth — início</title></head>
<body>
  <h1>Esta página não deve ser aberta diretamente</h1>
  <p>O Google só envia o código de autorização quando redireciona para cá <strong>depois</strong> do login. Se você digitou ou marcou favorito só o endereço <code>/api/google/callback</code>, não haverá <code>?code=...</code> na URL.</p>
  <p><strong>Comece por aqui:</strong> <a href="/api/google/auth">Abrir fluxo de login (/api/google/auth)</a></p>
  <p>Depois de autorizar, o Google voltará para esta rota com o código e o refresh token será mostrado.</p>
</body>
</html>`;
    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return new NextResponse('Configuração do servidor incompleta.', { status: 503 });
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  let tokens;
  try {
    const tokenResponse = await oauth2.getToken(code);
    tokens = tokenResponse.tokens;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Falha ao trocar o código por tokens.';
    return new NextResponse(
      `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/></head><body><p>${msg}</p></body></html>`,
      { status: 502, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const refreshToken = tokens.refresh_token;
  if (!refreshToken) {
    return new NextResponse(
      `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/></head><body>
        <p>Não foi devolvido um refresh token.</p>
        <p>Em <strong>Conta Google → Segurança → Acesso de apps de terceiros</strong>, remova o acesso deste app e acione de novo:
        <a href="/api/google/auth">/api/google/auth</a></p>
      </body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"/><title>Token obtido</title></head>
<body>
  <h1>Refresh token</h1>
  <p>Adicione ao seu <code>.env.local</code> (uma linha):</p>
  <pre style="white-space:pre-wrap;word-break:break-all;background:#f4f4f4;padding:1rem;">GOOGLE_REFRESH_TOKEN=${refreshToken}</pre>
  <p>Reinicie o servidor de desenvolvimento e tente agendar de novo.</p>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
