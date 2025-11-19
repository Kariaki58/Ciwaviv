const brandColor = "#0affff";

const base = {
  container: `
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f9fafb;
    padding: 40px 0;
    color: #111827;
  `,
  contentBox: `
    background-color: #ffffff;
    max-width: 480px;
    margin: auto;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 0 10px rgba(0,0,0,0.05);
  `,
  header: `
    background-color: ${brandColor};
    color: #000000;
    padding: 32px 20px;
    text-align: center;
    font-size: 24px;
    font-weight: 700;
  `,
  section: `padding: 32px 24px; text-align: center;`,
  paragraph: `font-size: 17px; margin-bottom: 20px; line-height: 1.5;`,
  button: `
    display: inline-block;
    padding: 12px 24px;
    background-color: ${brandColor};
    color: #000;
    text-decoration: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    margin: 20px 0;
  `,
  footer: `
    background-color: ${brandColor};
    color: #000;
    text-align: center;
    padding: 20px;
    font-weight: 600;
    font-size: 16px;
  `,
};
const container = `
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #FAFAF5;
  padding: 40px 0;
  margin: 0;
  color: #111827;
`;

const contentBox = `
  background-color: #ffffff;
  max-width: 520px;
  margin: auto;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
`;

const header = `
  background-color: #0ea5e9;
  color: #ffffff;
  padding: 28px 20px;
  text-align: center;
  font-size: 22px;
  font-weight: 600;
`;

const section = `padding: 30px 25px;`;
const paragraph = `font-size: 16px; line-height: 1.5; margin-bottom: 16px;`;
const button = `
  display: inline-block;
  padding: 12px 24px;
  background-color: #0ea5e9;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  margin: 20px 0;
`;
const footer = `
  background-color: #0ea5e9;
  color: #ffffff;
  text-align: center;
  padding: 18px;
  font-weight: 500;
  font-size: 15px;
`;


export function adminNewOrderEmail(order: any) {
  const itemsHTML = order.items
    .map(
      (item: any) => `
      <tr>
        <td>${item.product?.name || item.productName}</td>
        <td>${item.quantity}</td>
        <td>₦${item.price.toLocaleString()}</td>
      </tr>`
    )
    .join("");

  return {
    subject: `🛍️ New Order Received – #${order.orderNumber}`,
    html: `
      <div style="${container}">
        <div style="${contentBox}">
          <div style="${header}">New Order Received</div>
          <div style="${section}">
            <p style="${paragraph}">
              A new order has been placed by <strong>${order.customer?.name || "a customer"}</strong>.
            </p>

            <table width="100%" border="0" cellspacing="0" cellpadding="8" 
                   style="border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th align="left">Product</th>
                  <th align="left">Qty</th>
                  <th align="left">Price</th>
                </tr>
              </thead>
              <tbody>${itemsHTML}</tbody>
            </table>

            <p style="${paragraph}"><strong>Total:</strong> ₦${order.totalAmount.toLocaleString()}</p>
            <p style="${paragraph}"><strong>Shipping:</strong> ₦${order.shippingFee?.toLocaleString() || 0}</p>

            <a href="${process.env.NEXT_PUBLIC_API_URL}/admindashboard/orders/${order.orderNumber}" style="${button}">
              View in Dashboard
            </a>
          </div>
          <div style="${footer}">Ciwaviv</div>
        </div>
      </div>
    `,
  };
}

export function buyerOrderTrackingEmail(order: any) {
  const itemsHTML = order.items
    .map(
      (item: any) => `
      <tr>
        <td>${item.product?.name || item.productName}</td>
        <td>${item.quantity}</td>
        <td>₦${item.price.toLocaleString()}</td>
      </tr>`
    )
    .join("");

  return {
    subject: `Your Ciwaviv Order #${order.orderNumber} Has Been Placed`,
    html: `
      <div style="${container}">
        <div style="${contentBox}">
          <div style="${header}">Order Confirmation</div>
          <div style="${section}">
            <p style="${paragraph}">Hi <strong>${order.customer?.firstName || "there"}</strong>,</p>
            <p style="${paragraph}">
              Thank you for shopping with Ciwaviv! Your order has been placed successfully.
            </p>
            <p style="${paragraph}">
                Tracking Id -> <strong>${order.orderNumber}</strong>
            </p>

            <table width="100%" border="0" cellspacing="0" cellpadding="8" 
                   style="border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th align="left">Product</th>
                  <th align="left">Qty</th>
                  <th align="left">Price</th>
                </tr>
              </thead>
              <tbody>${itemsHTML}</tbody>
            </table>

            <p style="${paragraph}"><strong>Total Paid:</strong> ₦${order.totalAmount.toLocaleString()}</p>

            ${
              order.trackingNumber
                ? `
                <p style="${paragraph}">
                  <strong>Tracking Number:</strong> ${order.trackingNumber}<br/>
                  <strong>Delivery Provider:</strong> ${order.shippingProvider || "Not assigned yet"}<br/>
                  <strong>Estimated Delivery:</strong> ${order.estimatedDelivery || "Pending"}
                </p>
              `
                : `
                <p style="${paragraph}">
                  Your tracking details will be sent once your order has been shipped.
                </p>`
            }

            <a href="${process.env.NEXT_PUBLIC_API_URL}/track-order?orderId=${order.orderNumber}" style="${button}">
              Track My Order
            </a>
          </div>
          <div style="${footer}">Ciwaviv</div>
        </div>
      </div>
    `,
  };
}

export function customerPaymentConfirmedEmail(
  orderNumber: string,
  name: string
) {
  return {
    subject: `🎉 Payment Confirmed for Order #${orderNumber}`,
    html: `
      <div style="${base.container}">
        <div style="${base.contentBox}">
          <div style="${base.header}">Payment Confirmed</div>
          <div style="${base.section}">
            <p style="${base.paragraph}">
              Hi <strong>${name}</strong>, your payment for order 
              <strong>#${orderNumber}</strong> has been successfully confirmed.
            </p>
            <p style="${base.paragraph}">
              We’ll begin processing your order right away.
            </p>
          </div>
          <div style="${base.footer}">Ciwaviv</div>
        </div>
      </div>
    `,
  };
}

export function customerOrderShippedEmail(
  orderNumber: string,
  name: string,
  trackingNumber?: string
) {
  return {
    subject: `🚚 Order #${orderNumber} Has Been Shipped`,
    html: `
      <div style="${base.container}">
        <div style="${base.contentBox}">
          <div style="${base.header}">Order Shipped</div>
          <div style="${base.section}">
            <p style="${base.paragraph}">Hi <strong>${name}</strong>, your order has been shipped!</p>
            ${
              trackingNumber
                ? `<p style="${base.paragraph}">Tracking Number: <strong>${trackingNumber}</strong></p>`
                : ""
            }
            <a href="${process.env.NEXT_PUBLIC_API_URL}/track-order/${orderNumber}" style="${base.button}">
              Track Order
            </a>
          </div>
          <div style="${base.footer}">Ciwaviv</div>
        </div>
      </div>
    `,
  };
}

export function customerOrderDeliveredEmail(
  orderNumber: string,
  name: string,
  shippingProvider: string,
  notes: string
) {
  const brandColor = "#0affff";

  const base = {
    container: `
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      padding: 40px 0;
      text-align: center;
    `,
    contentBox: `
      background-color: #ffffff;
      border-radius: 12px;
      max-width: 600px;
      margin: 0 auto;
      padding: 30px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    `,
    header: `
      font-size: 24px;
      font-weight: bold;
      color: ${brandColor};
      margin-bottom: 20px;
    `,
    section: `
      text-align: left;
      margin-top: 10px;
    `,
    paragraph: `
      font-size: 15px;
      color: #333333;
      line-height: 1.6;
      margin-bottom: 12px;
    `,
    infoBox: `
      background-color: #f0faff;
      border-left: 4px solid ${brandColor};
      padding: 12px 16px;
      border-radius: 8px;
      margin-top: 12px;
      margin-bottom: 20px;
    `,
    button: `
      display: inline-block;
      background-color: ${brandColor};
      color: #000;
      text-decoration: none;
      font-weight: 600;
      padding: 12px 22px;
      border-radius: 6px;
      margin-top: 18px;
    `,
    footer: `
      font-size: 12px;
      color: #888;
      margin-top: 25px;
    `,
  };

  return {
    subject: `📦 Order #${orderNumber} Delivered`,
    html: `
      <div style="${base.container}">
        <div style="${base.contentBox}">
          <div style="${base.header}">Order Delivered</div>
          <div style="${base.section}">
            <p style="${base.paragraph}">
              Hi <strong>${name}</strong>, your order <strong>#${orderNumber}</strong> has been successfully delivered!
            </p>

            <div style="${base.infoBox}">
              <p style="${base.paragraph}">
                <strong>Shipping Provider:</strong> ${shippingProvider || "N/A"}<br/>
                <strong>Notes:</strong> ${notes || "No additional notes provided."}
              </p>
            </div>

            <p style="${base.paragraph}">
              We hope you enjoy your purchase. Please confirm when you’ve received your package.
            </p>
          </div>

          <div style="${base.footer}">
            Thank you for shopping with <strong>Ciwaviv</strong> 💙
          </div>
        </div>
      </div>
    `,
  };
}


export function customerEstimatedDeliveryEmail(
  orderNumber: string,
  name: string,
  estimatedDate: string
) {
  return {
    subject: `📅 Estimated Delivery Date for Order #${orderNumber}`,
    html: `
      <div style="${base.container}">
        <div style="${base.contentBox}">
          <div style="${base.header}">Estimated Delivery</div>
          <div style="${base.section}">
            <p style="${base.paragraph}">
              Hi <strong>${name}</strong>, your order <strong>#${orderNumber}</strong> 
              is expected to arrive by <strong>${estimatedDate}</strong>.
            </p>
          </div>
          <div style="${base.footer}">Ciwaviv</div>
        </div>
      </div>
    `,
  };
}

export function customerOtpEmail(name: string, otp: string) {
  return {
    subject: "🔐 Verify Your Email - Ciwaviv Order Access",
    html: `
      <div style="${base.container}">
        <div style="${base.contentBox}">
          <div style="${base.header}">Verify Your Order Access</div>
          <div style="${base.section}">
            <p style="${base.paragraph}">
              Hi <strong>${name}</strong>, use the OTP below to verify your email and retrieve your order number.
            </p>
            <div style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 20px 0;">
              ${otp}
            </div>
            <p style="font-size: 14px; color: #6b7280;">
              This code expires in 10 minutes.
            </p>
          </div>
          <div style="${base.footer}">Ciwaviv</div>
        </div>
      </div>
    `,
  };
}
