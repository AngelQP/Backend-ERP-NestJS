import { Injectable } from "@nestjs/common";
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {

  private template = (url: string) => `
    <div style="margin:0;padding:0;background-color:#f5f3ff;font-family:Inter,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr>
          <td align="center">

            <!-- Card -->
            <table width="100%" max-width="500" cellpadding="0" cellspacing="0"
              style="background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 10px 20px rgba(0,0,0,0.05);">

              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom:20px;">

                  <table width="64" height="64" cellpadding="0" cellspacing="0" 
                    style="
                      border-radius:16px;
                      background:linear-gradient(135deg,#a855f7,#c084fc);
                    ">
                    <tr>
                      <td align="center" valign="middle"
                        style="
                          font-size:28px;
                          color:#ffffff;
                          font-weight:bold;
                        ">
                        🎂
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Title -->
              <tr>
                <td align="center" style="font-size:24px;font-weight:700;color:#1f2937;padding-bottom:10px;">
                  Dulce Control
                </td>
              </tr>

              <!-- Subtitle -->
              <tr>
                <td align="center" style="font-size:16px;color:#6b7280;padding-bottom:25px;">
                  Verifica tu cuenta para comenzar
                </td>
              </tr>

              <!-- Button -->
              <tr>
                <td align="center" style="padding-bottom:25px;">
                  <a href="${url}" style="
                    display:inline-block;
                    padding:14px 28px;
                    background-color:#a855f7;
                    color:#ffffff !important;
                    text-decoration:none;
                    border-radius:8px;
                    font-weight:600;
                    font-size:16px;
                    font-family:Arial, sans-serif;
                  ">
                    Verificar cuenta
                  </a>
                </td>
              </tr>

              <!-- Info -->
              <tr>
                <td align="center" style="font-size:14px;color:#6b7280;padding-bottom:10px;">
                  Este enlace expirará en 10 minutos.
                </td>
              </tr>

              <!-- Fallback -->
              <tr>
                <td align="center" style="font-size:12px;color:#9ca3af;">
                  Si el botón no funciona, copia y pega este enlace en tu navegador:
                  <br/>
                  <a href="${url}" style="color:#a855f7;">${url}</a>
                </td>
              </tr>

            </table>

            <!-- Footer -->
            <table width="100%" max-width="500" style="margin-top:20px;">
              <tr>
                <td align="center" style="font-size:12px;color:#9ca3af;">
                  © ${new Date().getFullYear()} Dulce Control
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
    </div>
  `;

  private templateReset = (url: string) => `
    <div style="margin:0;padding:0;background-color:#f5f3ff;font-family:Inter,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr>
          <td align="center">

            <table width="100%" max-width="500" cellpadding="0" cellspacing="0"
              style="background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 10px 20px rgba(0,0,0,0.05);">

              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom:20px;">
                  <table width="64" height="64" cellpadding="0" cellspacing="0" 
                    style="border-radius:16px;background:linear-gradient(135deg,#a855f7,#c084fc);">
                    <tr>
                      <td align="center" valign="middle"
                        style="font-size:28px;color:#ffffff;font-weight:bold;">
                        🔐
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Title -->
              <tr>
                <td align="center" style="font-size:24px;font-weight:700;color:#1f2937;padding-bottom:10px;">
                  Restablecer contraseña
                </td>
              </tr>

              <!-- Subtitle -->
              <tr>
                <td align="center" style="font-size:16px;color:#6b7280;padding-bottom:25px;">
                  Haz clic en el botón para crear una nueva contraseña
                </td>
              </tr>

              <!-- Button -->
              <tr>
                <td align="center" style="padding-bottom:25px;">
                  <a href="${url}" style="
                    display:inline-block;
                    padding:14px 28px;
                    background-color:#a855f7;
                    color:#ffffff !important;
                    text-decoration:none;
                    border-radius:8px;
                    font-weight:600;
                    font-size:16px;
                    font-family:Arial, sans-serif;
                  ">
                    Restablecer contraseña
                  </a>
                </td>
              </tr>

              <!-- Info -->
              <tr>
                <td align="center" style="font-size:14px;color:#6b7280;padding-bottom:10px;">
                  Este enlace expirará en 10 minutos.
                </td>
              </tr>

              <!-- Fallback -->
              <tr>
                <td align="center" style="font-size:12px;color:#9ca3af;">
                  Si el botón no funciona, copia y pega este enlace en tu navegador:
                  <br/>
                  <a href="${url}" style="color:#a855f7;">${url}</a>
                </td>
              </tr>

            </table>

            <table width="100%" max-width="500" style="margin-top:20px;">
              <tr>
                <td align="center" style="font-size:12px;color:#9ca3af;">
                  © ${new Date().getFullYear()} Dulce Control
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
    </div>
  `;

  private transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // STARTTLS
    // family: 4, // 👈 IMPORTANTE (evita IPv6 error)
    auth: {
      user: process.env.BREVO_LOGIN,
      pass: process.env.BREVO_SMTP_KEY,
    },
  });

   async sendVerificationEmail(to: string, url: string) {

    await this.transporter.sendMail({
      from: `"Dulce Control ERP" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Verifica tu cuenta',
      html: this.template(url),
    });

  }

  async sendResetPasswordEmail(to: string, url: string) {
    await this.transporter.sendMail({
      from: `"Dulce Control ERP" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Restablecer contraseña',
      html: this.templateReset(url), 
    });
  }
}