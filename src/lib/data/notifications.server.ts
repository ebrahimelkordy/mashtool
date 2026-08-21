/**
 * NOTIFICATION SERVICE
 * --------------------
 * Sends email notifications through Resend to admin and customers.
 * Credentials come from environment variables.
 */
import type { Order } from "./types";
import { getSettings } from "./repository.server";

export type NotifyResult =
  | { sent: true; id: string }
  | { sent: false; reason: "not_configured" | "provider_error"; detail: string };

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );

function orderHtml(order: Order) {
  const isBespoke = order.type === "bespoke";
  const title = isBespoke ? "New Bespoke Commission Request" : "New Store Order Received";
  const badgeBg = isBespoke ? "#d97706" : "#2563eb";
  const typeText = isBespoke ? "Custom Bespoke Order" : "Standard Catalog Piece";

  const optionsStr = order.selectedOptions.length
    ? order.selectedOptions.map((o) => `${o.optionName}: ${o.valueLabel}`).join(" | ")
    : "No custom options";

  const priceText = order.total === null ? "Requires Admin Quoting" : `$${order.total}`;

  return `
  <!DOCTYPE html>
  <html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f5f0; margin: 0; padding: 20px; direction: ltr; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #efe5da; }
      .header { background: #4a2e2b; padding: 30px 20px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px; }
      .header p { margin: 8px 0 0; font-size: 13px; color: #e5d3c5; }
      .badge { display: inline-block; background: ${badgeBg}; color: #ffffff; padding: 4px 12px; border-radius: 50px; font-size: 12px; font-weight: bold; margin-top: 10px; }
      .content { padding: 30px 25px; }
      .section-title { font-size: 15px; font-weight: bold; color: #4a2e2b; border-bottom: 2px solid #f3ece4; padding-bottom: 8px; margin-bottom: 15px; }
      .data-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
      .data-table td { padding: 10px 12px; font-size: 14px; border-bottom: 1px dashed #f0e6dd; }
      .data-table td.label { color: #8c766b; font-weight: 600; width: 35%; }
      .data-table td.value { color: #2c221e; font-weight: 500; }
      .highlight-box { background: #faf4ee; border-left: 4px solid #4a2e2b; padding: 15px; border-radius: 8px; margin-bottom: 25px; font-size: 14px; color: #3a2b25; }
      .btn { display: block; width: 100%; background: #4a2e2b; color: #ffffff !important; text-align: center; padding: 14px 0; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 15px; margin-top: 20px; }
      .footer { background: #faf5f0; padding: 15px; text-align: center; font-size: 12px; color: #9c8a80; border-top: 1px solid #efe5da; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🌸 Mashtool Atelier</h1>
        <p>${escapeHtml(title)}</p>
        <span class="badge">${escapeHtml(order.orderNumber)}</span>
      </div>
      
      <div class="content">
        <div class="section-title">📋 Order Details</div>
        <table class="data-table">
          <tr>
            <td class="label">Order Type:</td>
            <td class="value"><strong>${escapeHtml(typeText)}</strong></td>
          </tr>
          <tr>
            <td class="label">Item Name:</td>
            <td class="value">${escapeHtml(order.productName ?? "Bespoke Custom Order")}</td>
          </tr>
          <tr>
            <td class="label">Quantity:</td>
            <td class="value">${escapeHtml(String(order.quantity))} units</td>
          </tr>
          <tr>
            <td class="label">Options & Specs:</td>
            <td class="value">${escapeHtml(optionsStr)}</td>
          </tr>
          <tr>
            <td class="label">Estimated Total:</td>
            <td class="value" style="color: #4a2e2b; font-size: 16px; font-weight: bold;">${escapeHtml(priceText)}</td>
          </tr>
        </table>

        <div class="section-title">👤 Customer Contact</div>
        <table class="data-table">
          <tr>
            <td class="label">Customer Name:</td>
            <td class="value"><strong>${escapeHtml(order.customerName)}</strong></td>
          </tr>
          <tr>
            <td class="label">Phone:</td>
            <td class="value" dir="ltr">${escapeHtml(order.phone)}</td>
          </tr>
          <tr>
            <td class="label">WhatsApp:</td>
            <td class="value" dir="ltr">${escapeHtml(order.whatsapp ?? "Same as phone")}</td>
          </tr>
          <tr>
            <td class="label">Delivery Address:</td>
            <td class="value">${escapeHtml(order.address ?? "Not specified")}</td>
          </tr>
        </table>

        ${
          order.notes
            ? `<div class="section-title">💬 Customer Notes</div>
               <div class="highlight-box">${escapeHtml(order.notes)}</div>`
            : ""
        }

        <a href="https://mashtool.vercel.app/admin/orders" class="btn">Open Admin Atelier 🎯</a>
      </div>

      <div class="footer">
        Automated notification for new order activity on Mashtool Atelier.
      </div>
    </div>
  </body>
  </html>
  `;
}

export async function notifyAdminOfOrder(order: Order): Promise<NotifyResult> {
  const apiKey = process.env["RESEND_API_KEY"];
  const from = process.env["RESEND_FROM_EMAIL"];
  const { adminNotificationEmail } = await getSettings();

  if (!apiKey || !from) {
    return {
      sent: false,
      reason: "not_configured",
      detail: "Email provider is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL missing).",
    };
  }
  if (!adminNotificationEmail) {
    return {
      sent: false,
      reason: "not_configured",
      detail: "No admin notification email set in dashboard settings.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from,
      to: [adminNotificationEmail],
      subject: `New ${order.type === "bespoke" ? "bespoke request" : "order"} ${order.orderNumber}`,
      html: orderHtml(order),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error(`Resend request failed [${response.status}]: ${detail}`);
    return { sent: false, reason: "provider_error", detail: `[${response.status}] ${detail}` };
  }

  const body = (await response.json()) as { id?: string };
  return { sent: true, id: body.id ?? "" };
}
