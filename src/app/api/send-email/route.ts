import { NextRequest, NextResponse } from 'next/server';
import { transporter } from '@/lib/nodemailer';

const ADMIN_EMAIL = 'makimportvzla@gmail.com';
const FROM = '"MAKIMPORT Venezuela" <makimportvzla@gmail.com>';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!process.env.GMAIL_APP_PASSWORD) {
      console.warn('[MAKIMPORT] GMAIL_APP_PASSWORD env var is missing. Email simulated.');
      return NextResponse.json({ success: true, message: 'Modo Simulación: Gmail SMTP no configurado.' });
    }

    // ─── Branch: Contract sent to buyer ──────────────────────────────────────
    if (body.type === 'contract_sent') {
      const {
        machineryTitle, machineryBrand, machineryModel, machineryVin,
        finalAmount, compradorNombre, compradorEmail, compradorCedula,
        compradorEstadoCivil, compradorTelefono, compradorCiudad,
        compradorEstado, compradorDestino, fechaContrato, pdfAttachment
      } = body;

      const attachments = pdfAttachment
        ? [{
            filename: `Contrato_${machineryBrand}_${machineryModel}_${compradorCedula}.pdf`,
            content: Buffer.from(pdfAttachment, 'base64'),
            contentType: 'application/pdf'
          }]
        : [];

      const contractHtml = `
        <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#0b0f19;color:#f1f5f9;padding:40px 20px;">
          <div style="max-width:600px;margin:0 auto;background:#0f172a;border:1px solid #1e293b;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#ea580c 0%,#d97706 100%);padding:35px 25px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:26px;font-weight:900;text-transform:uppercase;">MAKIMPORT VENEZUELA</h1>
              <p style="margin:5px 0 0;color:#ffedd5;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:2px;">Documento Legal de Compra-Venta</p>
            </div>
            <div style="padding:35px 25px;">
              <h2 style="color:#fff;font-size:16px;font-weight:800;margin:0 0 15px;border-bottom:2px solid #ea580c;padding-bottom:8px;text-transform:uppercase;">
                Adjudicación de Maquinaria
              </h2>
              <p style="color:#cbd5e1;font-size:13px;line-height:1.6;margin:0 0 20px;">
                Estimado(a) <strong>${compradorNombre}</strong>, encontrará adjunto a este correo el documento de Contrato de Compra-Venta generado conforme al Art. 1.474 del Código Civil de la República Bolivariana de Venezuela.
              </p>
              <div style="background:#1e293b;border:1px solid #334155;border-radius:10px;padding:15px;margin-bottom:20px;font-size:12.5px;">
                <h3 style="color:#ea580c;font-size:12px;font-weight:700;text-transform:uppercase;margin:0 0 10px;">👥 Partes Contratantes</h3>
                <table style="width:100%;border-collapse:collapse;line-height:1.6;">
                  <tr><td style="color:#64748b;width:35%;">Vendedor:</td><td style="color:#f8fafc;font-weight:bold;">MAKIMPORT VENEZUELA (RIF J-50123984-2)</td></tr>
                  <tr><td style="color:#64748b;">Comprador:</td><td style="color:#f8fafc;font-weight:bold;">${compradorNombre}</td></tr>
                  <tr><td style="color:#64748b;">C.I. / RIF:</td><td style="color:#f8fafc;font-family:monospace;">${compradorCedula}</td></tr>
                  <tr><td style="color:#64748b;">Estado Civil:</td><td style="color:#f8fafc;">${compradorEstadoCivil}</td></tr>
                  <tr><td style="color:#64748b;">Domicilio:</td><td style="color:#f8fafc;">${compradorCiudad}, Estado ${compradorEstado}</td></tr>
                </table>
              </div>
              <div style="background:#1e293b;border:1px solid #334155;border-radius:10px;padding:15px;margin-bottom:20px;font-size:12.5px;">
                <h3 style="color:#ea580c;font-size:12px;font-weight:700;text-transform:uppercase;margin:0 0 10px;">🏗️ Especificaciones del Equipo</h3>
                <table style="width:100%;border-collapse:collapse;line-height:1.6;">
                  <tr><td style="color:#64748b;width:35%;">Marca / Modelo:</td><td style="color:#f8fafc;font-weight:bold;">${machineryBrand} / ${machineryModel}</td></tr>
                  <tr><td style="color:#64748b;">Serial / VIN:</td><td style="color:#f8fafc;font-family:monospace;">${machineryVin}</td></tr>
                  <tr><td style="color:#64748b;">Monto Adjudicado:</td><td style="color:#fbbf24;font-weight:bold;font-size:15px;">$${Number(finalAmount).toLocaleString()} USD</td></tr>
                  <tr><td style="color:#64748b;">Puerto de Destino:</td><td style="color:#f8fafc;">${compradorDestino}</td></tr>
                  <tr><td style="color:#64748b;">Fecha del Contrato:</td><td style="color:#f8fafc;">${new Date(fechaContrato).toLocaleDateString('es-VE')}</td></tr>
                </table>
              </div>
              <div style="border-left:3px solid #ea580c;padding-left:12px;margin:20px 0;font-size:12px;color:#94a3b8;line-height:1.6;font-style:italic;">
                "EL VENDEDOR asume la responsabilidad del flete internacional hasta el puerto de arribo acordado. Los aranceles de nacionalización correrán por cuenta de EL COMPRADOR."
              </div>
              <div style="text-align:center;margin-top:30px;">
                <a href="https://wa.me/584146370819?text=${encodeURIComponent(`Hola! He recibido el contrato para ${machineryTitle}.`)}" style="background:#16a34a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1.5px;display:inline-block;">
                  🟢 Confirmar por WhatsApp
                </a>
              </div>
            </div>
            <div style="background:#090d16;padding:20px;border-top:1px solid #1e293b;text-align:center;font-size:11px;color:#475569;">
              <p style="margin:0;">© ${new Date().getFullYear()} MAKIMPORT Venezuela. Caracas, Venezuela.</p>
            </div>
          </div>
        </div>
      `;

      // Send to buyer
      await transporter.sendMail({
        from: FROM,
        to: compradorEmail,
        subject: `📄 CONTRATO DE ADJUDICACIÓN Y COMPRA-VENTA — ${machineryTitle.toUpperCase()}`,
        html: contractHtml,
        attachments
      });

      // CC to admin
      await transporter.sendMail({
        from: FROM,
        to: ADMIN_EMAIL,
        subject: `📄 NUEVO CONTRATO GENERADO — ${compradorNombre.toUpperCase()}`,
        html: `<p>Contrato enviado a <strong>${compradorNombre}</strong> (${compradorEmail}) para el equipo <strong>${machineryTitle}</strong>. Monto: <strong>$${Number(finalAmount).toLocaleString()} USD</strong>. Fecha: ${new Date(fechaContrato).toLocaleDateString('es-VE')}.</p>`,
        attachments
      });

      return NextResponse.json({ success: true });
    }

    // ─── Branch: Auction closed notification ─────────────────────────────────
    if (body.type === 'auction_closed') {
      const { machineryId, machineryTitle, machineryBrand, machineryModel, finalAmount, winnerName, winnerEmail, winnerPhone, closedAt } = body;

      const adminHtml = `
        <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#0b0f19;color:#f1f5f9;padding:40px 20px;">
          <div style="max-width:600px;margin:0 auto;background:#0f172a;border:1px solid #1e293b;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#ea580c 0%,#d97706 100%);padding:30px 20px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:26px;font-weight:900;text-transform:uppercase;">MAKIMPORT</h1>
              <p style="margin:5px 0 0;color:#ffedd5;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:2px;">Cierre y Adjudicación de Subasta</p>
            </div>
            <div style="padding:40px 30px;">
              <h2 style="color:#fff;font-size:18px;font-weight:800;margin:0 0 20px;border-bottom:2px solid #ea580c;padding-bottom:10px;">🏆 SUBASTA CERRADA CON ÉXITO</h2>
              <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:24px;">
                <h3 style="color:#ea580c;font-size:14px;font-weight:700;text-transform:uppercase;margin:0 0 15px;">🏗️ Detalles del Equipo</h3>
                <table style="width:100%;border-collapse:collapse;font-size:13px;line-height:1.8;">
                  <tr><td style="color:#64748b;font-weight:600;width:40%;">Equipo:</td><td style="color:#f8fafc;font-weight:bold;">${machineryTitle}</td></tr>
                  <tr><td style="color:#64748b;font-weight:600;">Marca / Modelo:</td><td style="color:#f8fafc;">${machineryBrand} / ${machineryModel}</td></tr>
                  <tr><td style="color:#64748b;font-weight:600;">ID del Equipo:</td><td style="color:#94a3b8;font-family:monospace;">${machineryId}</td></tr>
                  <tr><td style="color:#64748b;font-weight:600;">Monto Adjudicado:</td><td style="color:#fbbf24;font-weight:800;font-size:18px;">$${Number(finalAmount).toLocaleString()} USD</td></tr>
                  <tr><td style="color:#64748b;font-weight:600;">Fecha de Cierre:</td><td style="color:#f8fafc;">${new Date(closedAt).toLocaleString('es-VE')}</td></tr>
                </table>
              </div>
              <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;">
                <h3 style="color:#ea580c;font-size:14px;font-weight:700;text-transform:uppercase;margin:0 0 15px;">👤 Datos del Ganador</h3>
                <table style="width:100%;border-collapse:collapse;font-size:13px;line-height:1.8;">
                  <tr><td style="color:#64748b;font-weight:600;width:40%;">Nombre:</td><td style="color:#f8fafc;font-weight:bold;">${winnerName}</td></tr>
                  <tr><td style="color:#64748b;font-weight:600;">Correo:</td><td style="color:#38bdf8;"><a href="mailto:${winnerEmail}" style="color:#38bdf8;">${winnerEmail}</a></td></tr>
                  <tr><td style="color:#64748b;font-weight:600;">WhatsApp:</td><td style="color:#34d399;font-weight:bold;">${winnerPhone}</td></tr>
                </table>
              </div>
            </div>
            <div style="background:#090d16;padding:20px;border-top:1px solid #1e293b;text-align:center;font-size:11px;color:#475569;">
              <p style="margin:0;">© ${new Date().getFullYear()} MAKIMPORT. Caracas, Venezuela.</p>
            </div>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: FROM,
        to: ADMIN_EMAIL,
        subject: `🏆 SUBASTA FINALIZADA Y ADJUDICADA — ${machineryTitle.toUpperCase()}`,
        html: adminHtml
      });

      const winnerHtml = `
        <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#0b0f19;color:#f1f5f9;padding:40px 20px;">
          <div style="max-width:600px;margin:0 auto;background:#0f172a;border:1px solid #1e293b;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#22c55e 0%,#15803d 100%);padding:30px 20px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:26px;font-weight:900;text-transform:uppercase;">¡FELICITACIONES!</h1>
              <p style="margin:5px 0 0;color:#dcfce7;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:2px;">Has Ganado la Subasta en MAKIMPORT</p>
            </div>
            <div style="padding:40px 30px;">
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 25px;">Hola <strong>${winnerName}</strong>, tu oferta fue la ganadora. El siguiente equipo te ha sido adjudicado:</p>
              <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:24px;">
                <h3 style="color:#22c55e;font-size:14px;font-weight:700;text-transform:uppercase;margin:0 0 15px;">⚙️ Resumen de la Compra</h3>
                <table style="width:100%;border-collapse:collapse;font-size:13px;line-height:1.8;">
                  <tr><td style="color:#64748b;font-weight:600;width:40%;">Equipo:</td><td style="color:#f8fafc;font-weight:bold;">${machineryTitle}</td></tr>
                  <tr><td style="color:#64748b;font-weight:600;">Marca / Modelo:</td><td style="color:#f8fafc;">${machineryBrand} / ${machineryModel}</td></tr>
                  <tr><td style="color:#64748b;font-weight:600;">Tu Oferta Ganadora:</td><td style="color:#fbbf24;font-weight:800;font-size:18px;">$${Number(finalAmount).toLocaleString()} USD</td></tr>
                </table>
              </div>
              <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:30px;">
                <h3 style="color:#ea580c;font-size:14px;font-weight:700;text-transform:uppercase;margin:0 0 15px;">📋 Próximos Pasos</h3>
                <ol style="color:#cbd5e1;font-size:13px;line-height:1.6;padding-left:20px;margin:0;">
                  <li style="margin-bottom:8px;">Contáctate con nuestro equipo a través de WhatsApp o Telegram.</li>
                  <li style="margin-bottom:8px;">Un asesor validará tu orden y enviará la factura de reserva inicial.</li>
                  <li style="margin-bottom:8px;">Coordinamos la logística marítima hasta el puerto en Venezuela.</li>
                </ol>
              </div>
              <div style="text-align:center;margin:30px 0 10px;">
                <a href="https://wa.me/584146370819?text=${encodeURIComponent(`Hola! Gané la subasta de ${machineryTitle} por $${finalAmount} USD.`)}" style="background:#22c55e;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;display:inline-block;">Contactar por WhatsApp</a>
              </div>
            </div>
            <div style="background:#090d16;padding:20px;border-top:1px solid #1e293b;text-align:center;font-size:11px;color:#475569;">
              <p style="margin:0;">© ${new Date().getFullYear()} MAKIMPORT. Caracas, Venezuela.</p>
            </div>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: FROM,
        to: winnerEmail,
        subject: `🎉 ¡FELICIDADES! GANASTE LA SUBASTA — ${machineryTitle.toUpperCase()}`,
        html: winnerHtml
      });

      return NextResponse.json({ success: true });
    }

    // ─── Branch: Custom machinery request ────────────────────────────────────
    if (body.type === 'custom_request') {
      const { nombre, telefono, email, marca, modelo, anoMinimo, puerto, presupuesto } = body;

      await transporter.sendMail({
        from: FROM,
        to: ADMIN_EMAIL,
        replyTo: email,
        subject: '🔍 NUEVA SOLICITUD DE COTIZACIÓN PERSONALIZADA — MAKIMPORT',
        html: `
          <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#0b0f19;color:#f1f5f9;padding:40px 20px;">
            <div style="max-width:600px;margin:0 auto;background:#0f172a;border:1px solid #1e293b;border-radius:16px;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#ea580c 0%,#d97706 100%);padding:30px 20px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:26px;font-weight:900;text-transform:uppercase;">MAKIMPORT</h1>
                <p style="margin:5px 0 0;color:#ffedd5;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:2px;">Solicitud de Cotización Personalizada</p>
              </div>
              <div style="padding:40px 30px;">
                <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:24px;">
                  <h3 style="color:#ea580c;font-size:14px;font-weight:700;text-transform:uppercase;margin:0 0 15px;">⚙️ Equipo Solicitado</h3>
                  <table style="width:100%;border-collapse:collapse;font-size:13px;line-height:1.8;">
                    <tr><td style="color:#64748b;font-weight:600;width:40%;">Marca:</td><td style="color:#f8fafc;font-weight:bold;">${marca}</td></tr>
                    <tr><td style="color:#64748b;font-weight:600;">Modelo:</td><td style="color:#f8fafc;font-weight:bold;">${modelo}</td></tr>
                    <tr><td style="color:#64748b;font-weight:600;">Año Mínimo:</td><td style="color:#f8fafc;">${anoMinimo}</td></tr>
                    <tr><td style="color:#64748b;font-weight:600;">Puerto Destino:</td><td style="color:#f8fafc;">${puerto}</td></tr>
                    <tr><td style="color:#64748b;font-weight:600;">Presupuesto Máx.:</td><td style="color:#fbbf24;font-weight:800;font-size:16px;">$${Number(presupuesto).toLocaleString()} USD</td></tr>
                  </table>
                </div>
                <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;">
                  <h3 style="color:#ea580c;font-size:14px;font-weight:700;text-transform:uppercase;margin:0 0 15px;">👤 Datos del Cliente</h3>
                  <table style="width:100%;border-collapse:collapse;font-size:13px;line-height:1.8;">
                    <tr><td style="color:#64748b;font-weight:600;width:40%;">Nombre:</td><td style="color:#f8fafc;font-weight:bold;">${nombre}</td></tr>
                    <tr><td style="color:#64748b;font-weight:600;">Correo:</td><td style="color:#38bdf8;"><a href="mailto:${email}" style="color:#38bdf8;">${email}</a></td></tr>
                    <tr><td style="color:#64748b;font-weight:600;">Teléfono:</td><td style="color:#34d399;font-weight:bold;">${telefono}</td></tr>
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

      return NextResponse.json({ success: true });
    }

    // ─── Default branch: purchase request (compra inmediata) ─────────────────
    const { nombre, apellido, ciudad, email, telefono, machineryTitle, machineryId, machineryPrice } = body;

    await transporter.sendMail({
      from: FROM,
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: '🚨 NUEVA SOLICITUD DE COMPRA INMEDIATA — MAKIMPORT',
      html: `
        <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#0b0f19;color:#f1f5f9;padding:40px 20px;">
          <div style="max-width:600px;margin:0 auto;background:#0f172a;border:1px solid #1e293b;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#ea580c 0%,#d97706 100%);padding:30px 20px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:26px;font-weight:900;text-transform:uppercase;">MAKIMPORT</h1>
              <p style="margin:5px 0 0;color:#ffedd5;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:2px;">Venezuela Heavy Machinery</p>
            </div>
            <div style="padding:40px 30px;">
              <h2 style="color:#fff;font-size:20px;font-weight:800;margin:0 0 20px;border-bottom:2px solid #ea580c;padding-bottom:10px;">🚨 NUEVA SOLICITUD DE COMPRA INMEDIATA</h2>
              <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:24px;">
                <h3 style="color:#ea580c;font-size:14px;font-weight:700;text-transform:uppercase;margin:0 0 15px;">⚙️ Ficha del Equipo</h3>
                <table style="width:100%;border-collapse:collapse;font-size:13px;line-height:1.8;">
                  <tr><td style="color:#64748b;font-weight:600;width:35%;">Maquinaria:</td><td style="color:#f8fafc;font-weight:bold;">${machineryTitle}</td></tr>
                  <tr><td style="color:#64748b;font-weight:600;">ID del Equipo:</td><td style="color:#94a3b8;font-family:monospace;">${machineryId}</td></tr>
                  <tr><td style="color:#64748b;font-weight:600;">Precio de Compra:</td><td style="color:#fbbf24;font-weight:800;font-size:16px;">$${Number(machineryPrice).toLocaleString()} USD</td></tr>
                </table>
              </div>
              <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:30px;">
                <h3 style="color:#ea580c;font-size:14px;font-weight:700;text-transform:uppercase;margin:0 0 15px;">👤 Ficha del Comprador</h3>
                <table style="width:100%;border-collapse:collapse;font-size:13px;line-height:1.8;">
                  <tr><td style="color:#64748b;font-weight:600;width:35%;">Nombre y Apellido:</td><td style="color:#f8fafc;font-weight:bold;">${nombre} ${apellido}</td></tr>
                  <tr><td style="color:#64748b;font-weight:600;">Ciudad / Región:</td><td style="color:#f8fafc;">${ciudad}</td></tr>
                  <tr><td style="color:#64748b;font-weight:600;">Correo Electrónico:</td><td style="color:#38bdf8;"><a href="mailto:${email}" style="color:#38bdf8;">${email}</a></td></tr>
                  <tr><td style="color:#64748b;font-weight:600;">Teléfono / WhatsApp:</td><td style="color:#34d399;font-weight:bold;">${telefono}</td></tr>
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

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('[send-email API Exception]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
