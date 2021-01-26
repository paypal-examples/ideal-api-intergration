const express = require("express");
const { resolve } = require("path");
const axios = require("axios");
const dotenv = require("dotenv")

dotenv.config();

const { getAccessToken } = require("./oauth");
const { PAYPAL_API_BASE, WEBHOOK_ID, isProd } = require("./config");
const log = require("./logger")

const app = express();

const port = process.env.PORT || 8080;

app.use(express.static(resolve(__dirname, "../client")));
app.use(express.json());

/**
 * Page route handlers.
 */
app.get("/", (req, res) => {
  res.sendFile(resolve(__dirname, "../client/index.html"));
});

app.get("/success", (req, res) => {
  res.sendFile(resolve(__dirname, "../client/success.html"));
});

app.get("/cancel", (req, res) => {
  res.sendFile(resolve(__dirname, "../client/cancel.html"));
});

/**
 * API handlers.
 */
app.get("/api/orders", async (req, res) => {
  const { access_token } = await getAccessToken();

  const BASE_URL = `${isProd ? "https" : req.protocol}://${req.get("host")}`;

  /**
   * Example order,
   * these details would usually get pulled from the users cart session
   */
  const order = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "EUR",
          value: "1.00",
        },
      },
    ],
    application_context: {
      return_url: `${BASE_URL}/success.html`,
      cancel_url: `${BASE_URL}/cancel.html`,
    },
  };

  log.info("📦 Creating Order");

  /**
   * For more details on /v2/checkout/orders,
   * see https://developer.paypal.com/docs/api/orders/v2/#orders_create
   */
  const { data } = await axios({
    url: `${PAYPAL_API_BASE}/v2/checkout/orders`,
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    data: order,
  });
  
  res.json(data);
});

app.post("/api/orders/:orderId/confirm-payment-source", async (req, res) => {
  const { orderId } = req.params;
  const { access_token } = await getAccessToken();
  
  log.info("📦 Confirming Order");

  /**
   * For more details on /v2/checkout/orders/<orderId>/confirm-payment-source,
   * TODO: link
   */
  const { data } = await axios({
    url: `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/confirm-payment-source`,
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    data: req.body,
  });

  const redirectUrl = data.links.find((link) => link.rel === "payer-action")
    .href;

  res.json({
    redirectUrl,
  });
});

/**
 * Webhook handlers.
 */
app.post("/webhook", async (req, res) => {
  const { access_token } = await getAccessToken();

  const { event_type, resource } = req.body;
  const orderId = resource.id;

  log.info(`🪝 Recieved Webhook Event: ${event_type}`)
  
  /* verify the webhook signature */
  try {
    const { data } = await axios({
      url: `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      data: {
        transmission_id: req.headers["paypal-transmission-id"],
        transmission_time: req.headers["paypal-transmission-time"],
        cert_url: req.headers["paypal-cert-url"],
        auth_algo: req.headers["paypal-auth-algo"],
        transmission_sig: req.headers["paypal-transmission-sig"],
        webhook_id: WEBHOOK_ID,
        webhook_event: req.body,
      },
    });

    const { verification_status } = data;

    if (verification_status !== "SUCCESS") {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`);
    return res.sendStatus(400);
  }
  

  /* capture the order if approved */
  if (event_type === "CHECKOUT.ORDER.APPROVED") {
    try {
      const { data } = await axios({
        url: `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      });

      log.info(`💰 Payment captured!`);

    } catch (err) {
      log.error(`❌ Payment failed.`);
      return res.sendStatus(400);
    }
  }

  res.sendStatus(200);
});

app.listen(port, () => {
  log.info(`Example app listening at http://localhost:${port}`);
});
