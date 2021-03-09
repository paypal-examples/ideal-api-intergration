# API Intergration with iDEAL 


This integration uses Paypal's REST API to accept iDEAL payments


See a [hosted version](https://ideal-api-intergration.herokuapp.com/)

**Features:**
- EUR Bank transfers 💶
- Paypal REST API intergration 
- Receiving Webhook events  🪝


**Demo:** 

<p align="center">
  <img src="./ideal-api-intergration.gif" alt="Collecting an iDEAL payment">
</p>

## How to run locally

This server example implementation uses Node.js 

1. Clone the repo  `git clone git@github.com:paypal-examples/ideal-api-intergration.git`

2. Run `npm install`


3. Copy the .env.example file into a file named .env

```
cp .env.example .env
```

and configure your `.env` config file with your Paypal Sandbox
`CLIENT_ID` and `CLIENT_SECRET`

these can be obtained [here](https://developer.paypal.com/docs/api-basics/sandbox/credentials/)


(If you would like to run the example without configuring webhooks you can skip 4 & 5)

4.  Run the local webhook server `npm run webhook-server` take note of the webhookId 


5. Update your `.env` file with the `WEBHOOK_ID` value


6. Update `client/index.html` `<script>` src `clientId` param with your `CLIENT_ID`

   `https://www.paypal.com/sdk/js?client-id=<CLIENT_ID>&...`


7. Start the server, in another terminal run `npm start`


8. Navigate to http://localhost:8080/



&nbsp;

###### Credits

Shaylan Dias
