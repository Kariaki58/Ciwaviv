import { resend } from "../resend";

import { adminNewOrderEmail, customerEstimatedDeliveryEmail, customerOrderShippedEmail, customerOrderDeliveredEmail,
    customerOtpEmail, buyerOrderTrackingEmail, customerPaymentConfirmedEmail
} from "./templates";

// Send email to admin when new order is placed
export async function sendAdminOrderEmail(order: any) {
  return resend.emails.send({
    from: "Ciwaviv <support@ciwaviv.com>",
    to: "support@ciwaviv.com",
    ...adminNewOrderEmail(order),
  });
}

// Send email to customer when payment confirmed
export async function sendCustomerPaymentEmail(
  order: any
) {
  return resend.emails.send({
    from: "Ciwaviv <support@ciwaviv.com>",
    to: order.customer.email,
    ...buyerOrderTrackingEmail(order),
  });
}

export async function sendCustomerPaymentConfirmed(email: string, orderNumber: string, name: string) {
  return resend.emails.send({
    from: "Ciwaviv <support@ciwaviv.com>",
    to: email,
    ...customerPaymentConfirmedEmail(orderNumber, name),
  });
}

// Send email to customer when order shipped
export async function sendOrderShippedEmail(
  orderNumber: string,
  customerName: string,
  customerEmail: string,
  trackingNumber?: string
) {
  return resend.emails.send({
    from: "Ciwaviv <support@ciwaviv.com>",
    to: customerEmail,
    ...customerOrderShippedEmail(orderNumber, customerName, trackingNumber),
  });
}

// Send email to customer when order delivered
export async function sendOrderDeliveredEmail(
  orderNumber: string,
  customerName: string,
  customerEmail: string,
  shippingProvider: string,
  notes: string
) {
  return resend.emails.send({
    from: "Ciwaviv <support@ciwaviv.com>",
    to: customerEmail,
    ...customerOrderDeliveredEmail(orderNumber, customerName, shippingProvider, notes),
  });
}

// Send email when estimated delivery date is available
export async function sendEstimatedDeliveryEmail(
  orderNumber: string,
  customerName: string,
  customerEmail: string,
  estimatedDate: string
) {
  return resend.emails.send({
    from: "Ciwaviv <support@ciwaviv.com>",
    to: customerEmail,
    ...customerEstimatedDeliveryEmail(orderNumber, customerName, estimatedDate),
  });
}

// Send OTP if user lost order number
export async function sendLostOrderOtpEmail(
  customerEmail: string,
  customerName: string,
  otpCode: string
) {
  return resend.emails.send({
    from: "Ciwaviv <support@ciwaviv.com>",
    to: customerEmail,
    ...customerOtpEmail(customerName, otpCode),
  });
}
