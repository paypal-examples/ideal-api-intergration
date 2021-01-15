const CLIENT_ID =
  process.env.CLIENT_ID;

const CLIENT_SECRET =
  process.env.CLIENT_SECRET;

const isProd = process.env.NODE_ENV === "production";

const PAYPAL_API_URL = isProd
  ? "https://api.paypal.com"
  : "https://api.sandbox.paypal.com";


module.exports = {
  isProd,
  PAYPAL_API_URL,
  CLIENT_ID,
  CLIENT_SECRET,
};
