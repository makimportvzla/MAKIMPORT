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

    // ─── Branch: Auction closed notification ─────────────────────────────────
    if (body.type === 'auction_closed') {
      const {
        machineryId,
        machineryTitle,
        machineryBrand,
        machineryModel,
        finalAmount,
        winnerName,
        winnerEmail,
        winnerPhone,
        closedAt
      } = body;

      // 1. Send email to admin
      const { data: adminData, error: adminError } = await resend.emails.send({
        from: 'MAKIMPORT <onboarding@resend.dev>',
        to: ['makimportvzla@gmail.com'],
        subject: `🏆 SUBASTA FINALIZADA Y ADJUDICADA - ${machineryTitle.toUpperCase()}`,
        html: `
          <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#0b0f19;color:#f1f5f9;padding:40px 20px;text-align:center;">
            <div style="max-width:600px;margin:0 auto;background:#0f172a;border:1px solid #1e293b;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.5);">
              <div style="background:linear-gradient(135deg,#ea580c 0%,#d97706 100%);padding:30px 20px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:26px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">MAKIMPORT</h1>
                <p style="margin:5px 0 0;color:#ffedd5;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:2px;">Cierre y Adjudicación de Subasta</p>
              </div>
              <div style="padding:40px 30px;text-align:left;">
                <h2 style="color:#fff;font-size:18px;font-weight:800;margin:0 0 20px;border-bottom:2px solid #ea580c;padding-bottom:10px;display:inline-block;">
                  🏆 SUBASTA CERRADA CON ÉXITO
                </h2>
                <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 25px;">Una subasta ha finalizado y el equipo ha sido adjudicado al postor con la oferta más alta.</p>

                <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:24px;">
                  <h3 style="color:#ea580c;font-size:14px;font-weight:700;text-transform:uppercase;margin:0 0 15px;letter-spacing:1px;">🏗️ Detalles del Equipo</h3>
                  <table style="width:100%;border-collapse:collapse;font-size:13px;line-height:1.8;">
                    <tr><td style="color:#64748b;font-weight:600;width:40%;">Equipo:</td><td style="color:#f8fafc;font-weight:bold;">${machineryTitle}</td></tr>
                    <tr><td style="color:#64748b;font-weight:600;">Marca / Modelo:</td><td style="color:#f8fafc;">${machineryBrand} / ${machineryModel}</td></tr>
                    <tr><td style="color:#64748b;font-weight:600;">ID del Equipo:</td><td style="color:#94a3b8;font-family:monospace;">${machineryId}</td></tr>
                    <tr><td style="color:#64748b;font-weight:600;">Monto Adjudicado:</td><td style="color:#fbbf24;font-weight:800;font-size:18px;">$${Number(finalAmount).toLocaleString()} USD</td></tr>
                    <tr><td style="color:#64748b;font-weight:600;">Fecha de Cierre:</td><td style="color:#f8fafc;">${new Date(closedAt).toLocaleString('es-VE')}</td></tr>
                  </table>
                </div>

                <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:30px;">
                  <h3 style="color:#ea580c;font-size:14px;font-weight:700;text-transform:uppercase;margin:0 0 15px;letter-spacing:1px;">👤 Datos del Ganador</h3>
                  <table style="width:100%;border-collapse:collapse;font-size:13px;line-height:1.8;">
                    <tr><td style="color:#64748b;font-weight:600;width:40%;">Nombre Completo:</td><td style="color:#f8fafc;font-weight:bold;">${winnerName}</td></tr>
                    <tr><td style="color:#64748b;font-weight:600;">Correo Electrónico:</td><td style="color:#38bdf8;font-weight:bold;"><a href="mailto:${winnerEmail}" style="color:#38bdf8;text-decoration:none;">${winnerEmail}</a></td></tr>
                    <tr><td style="color:#64748b;font-weight:600;">Teléfono / WhatsApp:</td><td style="color:#34d399;font-weight:bold;">${winnerPhone}</td></tr>
                  </table>
                </div>
              </div>
              <div style="background:#090d16;padding:20px;border-top:1px solid #1e293b;text-align:center;font-size:11px;color:#475569;">
                <p style="margin:0;">© ${new Date().getFullYear()} MAKIMPORT. Caracas, Venezuela.</p>
              </div>
            </div>
          </div>
        `
      });

      if (adminError) {
        console.error('[Resend Admin Error]:', adminError);
        return NextResponse.json({ success: false, error: adminError.message }, { status: 400 });
      }

      // 2. Send email to winner
      const { data: winnerData, error: winnerError } = await resend.emails.send({
        from: 'MAKIMPORT <onboarding@resend.dev>',
        to: [winnerEmail],
        subject: `🎉 ¡FELICIDADES! GANASTE LA SUBASTA - ${machineryTitle.toUpperCase()}`,
        html: `
          <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#0b0f19;color:#f1f5f9;padding:40px 20px;text-align:center;">
            <div style="max-width:600px;margin:0 auto;background:#0f172a;border:1px solid #1e293b;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.5);">
              <div style="background:linear-gradient(135deg,#22c55e 0%,#15803d 100%);padding:30px 20px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:26px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">¡FELICITACIONES!</h1>
                <p style="margin:5px 0 0;color:#dcfce7;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:2px;">Has Ganado la Subasta en MAKIMPORT</p>
              </div>
              <div style="padding:40px 30px;text-align:left;">
                <h2 style="color:#fff;font-size:18px;font-weight:800;margin:0 0 20px;border-bottom:2px solid #22c55e;padding-bottom:10px;display:inline-block;">
                  🏆 ADJUDICACIÓN DE MAQUINARIA
                </h2>
                <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 25px;">Hola <strong>${winnerName}</strong>, tu oferta ha sido la ganadora. El siguiente equipo te ha sido adjudicado:</p>

                <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:24px;">
                  <h3 style="color:#22c55e;font-size:14px;font-weight:700;text-transform:uppercase;margin:0 0 15px;letter-spacing:1px;">⚙️ Resumen de la Compra</h3>
                  <table style="width:100%;border-collapse:collapse;font-size:13px;line-height:1.8;">
                    <tr><td style="color:#64748b;font-weight:600;width:40%;">Equipo:</td><td style="color:#f8fafc;font-weight:bold;">${machineryTitle}</td></tr>
                    <tr><td style="color:#64748b;font-weight:600;">Marca / Modelo:</td><td style="color:#f8fafc;">${machineryBrand} / ${machineryModel}</td></tr>
                    <tr><td style="color:#64748b;font-weight:600;">Tu Oferta Ganadora:</td><td style="color:#fbbf24;font-weight:800;font-size:18px;">$${Number(finalAmount).toLocaleString()} USD</td></tr>
                  </table>
                </div>

                <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:30px;">
                  <h3 style="color:#ea580c;font-size:14px;font-weight:700;text-transform:uppercase;margin:0 0 15px;letter-spacing:1px;">📋 Próximos Pasos</h3>
                  <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0 0 10px;">Para coordinar el pago, la nacionalización y el despacho de tu equipo:</p>
                  <ol style="color:#cbd5e1;font-size:13px;line-height:1.6;padding-left:20px;margin:0;">
                    <li style="margin-bottom:8px;">Ponte en contacto con nuestro equipo de soporte a través de WhatsApp o Telegram desde la aplicación.</li>
                    <li style="margin-bottom:8px;">Un asesor comercial validará tu orden y te enviará la factura de adjudicación (reserva/inicial).</li>
                    <li style="margin-bottom:8px;">Coordinaremos la logística marítima hasta el puerto seleccionado en Venezuela.</li>
                  </ol>
                </div>

                <div style="text-align:center;margin:30px 0 10px;">
                  <a href="https://t.me/makimportvzla?text=Hola!%20Fui%20el%20ganador%20de%20la%20subasta%20del%20${encodeURIComponent(machineryTitle)}%20por%20un%20monto%20de%20$${finalAmount}%20USD." style="background:#22c55e;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;display:inline-block;margin-right:10px;">Contactar por Telegram</a>
                  <a href="https://wa.me/584146370819?text=Hola!%20Fui%20el%20ganador%20de%20la%20subasta%20del%20${encodeURIComponent(machineryTitle)}%20por%20un%20monto%20de%20$${finalAmount}%20USD." style="background:#16a34a;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;display:inline-block;">Contactar por WhatsApp</a>
                </div>
              </div>
              <div style="background:#090d16;padding:20px;border-top:1px solid #1e293b;text-align:center;font-size:11px;color:#475569;">
                <p style="margin:0;">© ${new Date().getFullYear()} MAKIMPORT. Caracas, Venezuela.</p>
              </div>
            </div>
          </div>
        `
      });

      if (winnerError) {
        console.error('[Resend Winner Error]:', winnerError);
        return NextResponse.json({ success: false, error: winnerError.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, adminData, winnerData });
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
