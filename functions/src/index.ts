import { Midi } from "@tonejs/midi"
import axios from "axios"
import * as admin from "firebase-admin"
import { FieldValue } from "firebase-admin/firestore"
import { Bytes } from "firebase/firestore"
import * as functions from "firebase-functions"
import { google } from "googleapis"
import md5 from "md5"

const stripe = require('stripe')(functions.config().stripe.secret_key);
const endpointSecret = functions.config().stripe.webhook_secret;

admin.initializeApp()

export const storeMidiFile = functions.region('europe-west2').https.onCall(async (data) => {
  const { midiFileUrl } = data

  try {
    // Check if the file already exists in Firestore
    const midiCollection = admin.firestore().collection("midis")
    const existingMidi = await midiCollection
      .where("url", "==", midiFileUrl)
      .limit(1)
      .get()

    if (!existingMidi.empty) {
      return {
        message: "This MIDI file is already stored.",
        docId: existingMidi.docs[0].id,
      }
    }

    // Download the MIDI file
    const midiResponse = await axios.get(midiFileUrl, {
      responseType: "arraybuffer",
    })
    const midiData = midiResponse.data
    const midiHash = md5(midiData)


    // Validate the MIDI file
    const midi = new Midi(midiData)
    if (!midi) {
      throw new functions.https.HttpsError("internal", "Invalid MIDI file.")
    }

    const midiName = getNameFromURL(midiFileUrl)

    // Save to Firestore
    const docRef = await midiCollection.add({
      url: midiFileUrl,
      data: midiData,
      name: midiName,
      hash: midiHash,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })
    return { message: "MIDI file has been stored.", docId: docRef.id }
  } catch (error) {
    console.error("An error occurred", error)
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while processing the MIDI file.",
    )
  }
})

export const disableApp = functions.region('europe-west2').pubsub
  .topic("budget-alert")
  .onPublish(async (m) => {
    const data = JSON.parse(Buffer.from(m.data, "base64").toString()) as {
      costAmount: number
      budgetAmount: number
    }
    if (data.costAmount <= data.budgetAmount) {
      console.info(`No action necessary. (Current cost: ${data.costAmount})`)
      return null
    }

    const auth = new google.auth.GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    })
    google.options({ auth })
    const projectId = await auth.getProjectId()

    await google.appengine("v1").apps.patch({
      appsId: projectId,
      updateMask: "serving_status",
      requestBody: { servingStatus: "USER_DISABLED" },
    })
    console.info(`App ${projectId} disabled`)

    return null
  })

export const syncUserToSongs = functions.region('europe-west2').firestore
  .document("users/{userId}")
  .onUpdate(async (change, context) => {
    const newValue = change.after.data()
    const userId = context.params.userId

    const songsRef = admin.firestore().collection("songs")
    const snapshot = await songsRef.where("userId", "==", userId).get()

    if (snapshot.empty) {
      console.log("No matching documents.")
      return null
    }

    return admin.firestore().runTransaction(async (transaction) => {
      snapshot.docs.forEach((doc) => {
        transaction.update(doc.ref, { user: newValue })
      })
    })
  })



export const uploadMidiData = functions.region('europe-west2').https.onCall(async (data) => {
  const { midiString, fileName } = data
  const midiData = Bytes.fromBase64String(midiString).toUint8Array()
  console.log("Receiving filename: "+ fileName)
  console.log("With data: "+ midiString)

  try {
    // Validate the MIDI file
    const midiFile = new Midi(midiData)
    if (!midiFile) {
      throw new functions.https.HttpsError("internal", "Invalid MIDI file.")
    }

    // Check if the file already exists in Firestore
    const midiCollection = admin.firestore().collection("midis")
    const midiHash = md5(midiData)
    const existingMidi = await midiCollection
      .where("hash", "==", midiHash)
      .limit(1)
      .get()

    if (!existingMidi.empty) {
      return {
        message: "This MIDI file is already stored.",
        docId: existingMidi.docs[0].id,
      }
    }

    // Save to Firestore
    const docRef = await midiCollection.add({
      url: "directUpload",
      data: midiData,
      name: fileName,
      hash: midiHash,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })
    return { message: "MIDI file has been stored.", docId: docRef.id }
  } catch (error) {
    console.error("An error occurred", error)
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while processing the MIDI file.",
    )
  }
})


function getNameFromURL(path: string) {
  return path.split("/").pop()
}


export const createPaymentIntent = functions.region('europe-west2').https.onCall(async (data, context) => {
  const priceId = data.priceId;
  const userId = data.userId;
  console.log("PriceId received: "+priceId+" and userId: " + userId)

  const price = await stripe.prices.retrieve(priceId);
  console.log("Price amount is "+price.unit_amount+" "+price.currency)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: price.unit_amount, // Use the amount from the price object
    currency: price.currency, // Use the currency from the price object
    payment_method_types: ['card'],
    metadata: {integration_check: 'accept_a_payment'}
  });

  console.log("Payment intent created. Current secret: "+paymentIntent.client_secret)

  const intentCollection = admin.firestore().collection("paymentIntents")
  const existingSecret = await intentCollection
    .where("clientSecret", "==", paymentIntent.client_secret)
    .limit(1)
    .get()

  if (!existingSecret.empty) {
    return {
      clientSecret: null
    }
  }

  // Save to Firestore
  const docRef = await intentCollection.add({
    priceId: priceId,
    userId: userId,
    clientSecret: paymentIntent.client_secret,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    paymentReceived: false
  })

  return {
    clientSecret: paymentIntent.client_secret,
    paymentAmount: paymentIntent.amount,
    paymentCurrency: paymentIntent.currency,
  };
});

// @ts-ignore
export const handleStripeWebhook = functions.region('europe-west2').https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed due to some reason.");
    if (err instanceof Error) {
      console.error('Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log('PaymentIntent was successful!', paymentIntent);

    const intentCollection = admin.firestore().collection("paymentIntents")
    const existingSecret = await intentCollection
      .where("clientSecret", "==", paymentIntent.client_secret)
      .limit(1)
      .get()

    if (existingSecret.empty) {
      console.log("Could not find payment intent in DB, received client Secret: " + paymentIntent.client_secret);
      res.status(500).json({ received: true });
    }

    const docRef = existingSecret.docs[0].ref;
    await docRef.update({
      paymentReceived: true,
      updatedAt: FieldValue.serverTimestamp()
    });
    console.log("Payment intent updated in DB, received client Secret: " + paymentIntent.client_secret);
  }

  res.status(200).json({ received: true });
});


export const deleteOldIntents = functions.region('europe-west2').pubsub.schedule('0 0 * * *').onRun(async (context) => {
  try {
    // const oneDayAgo = admin.firestore.Timestamp.now().toMillis() - 24 * 60 * 60 * 1000;
    const oneDayAgo = admin.firestore.Timestamp.fromMillis(admin.firestore.Timestamp.now().toMillis() - 24 * 60 * 60 * 1000);

    const intentCollection = admin.firestore().collection('paymentIntents');
    const oldIntents = await intentCollection
      .where('createdAt', '<=', oneDayAgo)
      .where('paymentReceived', '==', false)
      .get();

    console.log("Found "+oldIntents.docs.length+" old intents.");

    const batch = admin.firestore().batch();

    oldIntents.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log(`Deleted ${oldIntents.docs.length} old intents.`);
  } catch (err){
    console.error('Error deleting old intents:', err);
  }
});


export const deleteOldMidis = functions.region('europe-west2').pubsub.schedule('0 0 * * *').onRun(async (context) => {
  try {
    const oneDayAgo = admin.firestore.Timestamp.fromMillis(admin.firestore.Timestamp.now().toMillis() - 24 * 60 * 60 * 1000);

    const midiCollection = admin.firestore().collection('midis');
    const oldMidis = await midiCollection
      .where('createdAt', '<=', oneDayAgo)
      .get();

    console.log("Found "+oldMidis.docs.length+" old midis.");

    const batch = admin.firestore().batch();

    oldMidis.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log(`Deleted ${oldMidis.docs.length} old midis.`);
  } catch (err){
    console.error('Error deleting old midis:', err);
  }
});