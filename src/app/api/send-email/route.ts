import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend Client
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!process.env.RESEND_API_KEY) {
      console.warn('[MAKIMPORT] Resend API Key is missing in environment variables.');
      return NextResponse.json({ success: true, message: 'Modo Simulación: Resend no configurado.' });
    }

    // ─── Branch: Custom machinery request ───────────────────────────────────
    if (body.type === 'custom_request') {
      const { nombre, telefono, email, marca, modelo, anoMinimo, puerto, presupuesto } = body;

      const { data, error } = await resend.emails.send({
        from: 'MAKIMPORT <onboarding@resend.dev>',
        to: ['makimportvzla@gmail.com'],
        subject: '🔍 NUEVA SOLICITUD DE COTIZACIÓN PERSONALIZADA - MAKIMPORT',
        html: `
          <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#0b0f19;color:#f1f5f9;padding:40px 20px;text-align:center;">
            <div style="max-width:600px;margin:0 auto;background:#0f172a;border:1px solid #1e293b;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.5);">
              <div style="background:linear-gradient(135deg,#ea580c 0%,#d97706 100%);padding:30px 20px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:26px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">MAKIMPORT</h1>
                <p style="margin:5px 0 0;color:#ffedd5;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:2px;">Solicitud de Cotización Personalizada</p>
              </div>
              <div style="padding:40px 30px;text-align:left;">
                <h2 style="color:#fff;font-size:18px;font-weight:800;margin:0 0 20px;border-bottom:2px solid #ea580c;padding-bottom:10px;display:inline-block;">
                  🔍 ENCARGO DE MAQUINARIA
                </h2>
                <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 25px;">Un cliente ha enviado un encargo de maquinaria personalizado a través del catálogo.</p>

                <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:24px;">
                  <h3 style="color:#ea580c;font-size:14px;font-weight:700;text-transform:uppercase;margin:0 0 15px;letter-spacing:1px;">⚙️ Equipo Solicitado</h3>
                  <table style="width:100%;border-collapse:collapse;font-size:13px;line-height:1.8;">
                    <tr><td style="color:#64748b;font-weight:600;width:40%;">Marca:</td><td style="color:#f8fafc;font-weight:bold;">${marca}</td></tr>
                    <tr><td style="color:#64748b;font-weight:600;">Modelo:</td><td style="color:#f8fafc;font-weight:bold;">${modelo}</td></tr>
                    <tr><td style="color:#64748b;font-weight:600;">Año Mínimo:</td><td style="color:#f8fafc;">${anoMinimo}</td></tr>
                    <tr><td style="color:#64748b;font-weight:600;">Puerto Destino:</td><td style="color:#f8fafc;">${puerto}</td></tr>
                    <tr><td style="color:#64748b;font-weight:600;">Presupuesto Máx.:</td><td style="color:#fbbf24;font-weight:800;font-size:16px;">$${Number(presupuesto).toLocaleString()} USD</td></tr>
                  </table>
                </div>

                <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:30px;">
                  <h3 style="color:#ea580c;font-size:14px;font-weight:700;text-transform:uppercase;margin:0 0 15px;letter-spacing:1px;">👤 Datos del Cliente</h3>
                  <table style="width:100%;border-collapse:collapse;font-size:13px;line-height:1.8;">
                    <tr><td style="color:#64748b;font-weight:600;width:40%;">Nombre:</td><td style="color:#f8fafc;font-weight:bold;">${nombre}</td></tr>
                    <tr><td style="color:#64748b;font-weight:600;">Correo:</td><td style="color:#38bdf8;font-weight:bold;"><a href="mailto:${email}" style="color:#38bdf8;text-decoration:none;">${email}</a></td></tr>
                    <tr><td style="color:#64748b;font-weight:600;">Teléfono:</td><td style="color:#34d399;font-weight:bold;">${telefono}</td></tr>
                  </table>
                </div>
              </div>
              <div style="background:#090d16;padding:20px;border-top:1px solid #1e293b;text-align:center;font-size:11px;color:#475569;">
                <p style="margin:0;">© ${new Date().getFullYear()} MAKIMPORT. Caracas, Venezuela.</p>
              </div>
            </div>
          </div>
        `,
      });

      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, data });
    }

    // ─── Default branch: purchase request ────────────────────────────────────
    const { nombre, apellido, ciudad, email, telefono, machineryTitle, machineryId, machineryPrice } = body;

    const { data, error } = await resend.emails.send({
      from: 'MAKIMPORT <onboarding@resend.dev>',
      to: ['makimportvzla@gmail.com'],
      subject: '🚨 NUEVA SOLICITUD DE COMPRA INMEDIATA - MAKIMPORT',
      html: `
        <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background-color:#0b0f19;color:#f1f5f9;padding:40px 20px;text-align:center;">
          <div style="max-width:600px;margin:0 auto;background-color:#0f172a;border:1px solid #1e293b;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
            <div style="background:linear-gradient(135deg,#ea580c 0%,#d97706 100%);padding:30px 20px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">MAKIMPORT</h1>
              <p style="margin:5px 0 0;color:#ffedd5;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:2px;">Venezuela Heavy Machinery</p>
            </div>
            <div style="padding:40px 30px;text-align:left;">
              <h2 style="color:#ffffff;font-size:20px;font-weight:800;margin:0 0 20px;border-bottom:2px solid #ea580c;padding-bottom:10px;display:inline-block;">
                🚨 NUEVA SOLICITUD DE COMPRA INMEDIATA
              </h2>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 25px;">Un cliente interesado ha solicitado la compra inmediata de una maquinaria a través del portal.</p>

              <div style="background-color:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:24px;">
                <h3 style="color:#ea580c;font-size:14px;font-weight:700;text-transform:uppercase;margin:0 0 15px;letter-spacing:1px;">⚙️ Ficha del Equipo</h3>
                <table style="width:100%;border-collapse:collapse;font-size:13px;line-height:1.8;">
                  <tr><td style="color:#64748b;font-weight:600;width:35%;">Maquinaria:</td><td style="color:#f8fafc;font-weight:bold;">${machineryTitle}</td></tr>
                  <tr><td style="color:#64748b;font-weight:600;">ID del Equipo:</td><td style="color:#94a3b8;font-family:monospace;">${machineryId}</td></tr>
                  <tr><td style="color:#64748b;font-weight:600;">Precio de Compra:</td><td style="color:#fbbf24;font-weight:800;font-size:16px;">$${Number(machineryPrice).toLocaleString()} USD</td></tr>
                </table>
              </div>

              <div style="background-color:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:30px;">
                <h3 style="color:#ea580c;font-size:14px;font-weight:700;text-transform:uppercase;margin:0 0 15px;letter-spacing:1px;">👤 Ficha del Comprador</h3>
                <table style="width:100%;border-collapse:collapse;font-size:13px;line-height:1.8;">
                  <tr><td style="color:#64748b;font-weight:600;width:35%;">Nombre y Apellido:</td><td style="color:#f8fafc;font-weight:bold;">${nombre} ${apellido}</td></tr>
                  <tr><td style="color:#64748b;font-weight:600;">Ciudad / Región:</td><td style="color:#f8fafc;">${ciudad}</td></tr>
                  <tr><td style="color:#64748b;font-weight:600;">Correo Electrónico:</td><td style="color:#38bdf8;font-weight:bold;"><a href="mailto:${email}" style="color:#38bdf8;text-decoration:none;">${email}</a></td></tr>
                  <tr><td style="color:#64748b;font-weight:600;">Teléfono / WhatsApp:</td><td style="color:#34d399;font-weight:bold;">${telefono}</td></tr>
                </table>
              </div>

              <div style="text-align:center;margin:35px 0 10px;">
                <a href="https://makimport.com/catalogo?item=${machineryId}" style="background:linear-gradient(135deg,#ea580c 0%,#d97706 100%);color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;display:inline-block;">Ver Detalle en Plataforma</a>
              </div>
            </div>
            <div style="background-color:#090d16;padding:20px;border-top:1px solid #1e293b;text-align:center;font-size:11px;color:#475569;">
              <p style="margin:0 0 5px;">Este correo fue generado automáticamente por la plataforma MAKIMPORT Venezuela.</p>
              <p style="margin:0;">© ${new Date().getFullYear()} MAKIMPORT. Caracas, Venezuela.</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('[Resend Error]:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[send-email API Exception]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
