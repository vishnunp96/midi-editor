import React, { useEffect, useState, FC } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useStores } from '../../../hooks/useStores'; // Adjust the import path as needed
import { usePrompt } from "../../../hooks/usePrompt"
import { useLocalization } from "../../../../common/localize/useLocalization"
import { useToast } from "../../../hooks/useToast"
import { createSong } from "../../../actions/cloudSong"
import { saveSong } from "../../../actions"
import styled from "@emotion/styled"

const stripePromise = loadStripe('pk_test_51PRePO2M0t6YOSnidFRanvy4y5YUlW2kFxgycXGlFfqcB8VGEwnCrTXyhjCeG47yMeKUulSXnkbXx5ckJ5EVhUmr00Y5MRFC9D');


const CardForm = styled.form`
    width: 400px;
    padding: 20px;
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    background-color: #4d4d4d;
    border-radius: 10px;
    box-shadow: 0 4px 10px 0 rgba(0,0,0,0.2);
    overflow: hidden;
`

const CustomerInput = styled.input`
    margin: 5px;
    padding: 5px;
    background-color: #ffc4c4;
    border-radius: 5px;
    border: 1px solid #000000;
`

const CardElementContainer = styled.div`
    margin: 5px;
    padding: 40px 15px;
    background-color: #151515;
    border-radius: 5px;
    box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.2);
`

const CheckoutForm: FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { paymentHandler } = useStores();
  const {
    authStore: { authUser: user },
  } = useStores()
  const [clientSecret, setClientSecret] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    console.log("Use effect being called.")
    if (user?.uid) {
      // Call PaymentHandler to create Payment Intent on component mount
      paymentHandler.getPaymentIntent('price_1PRf762M0t6YOSni1MtUdSYO', user?.uid).then((clientSecret) => {
        setClientSecret(clientSecret);
      });
    } else {
      console.log("User not signed in.")
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
        billing_details:{
          name: name,
          email: email
        }
      }
    });

    if (error && error.message) {
      console.log("Error occurred with the payment");
      setErrorMessage(error.message);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      console.log("Payment success")
      setSuccess(true);
    }
  };

  const cardStyle = {
    style: {
      base: {
        iconColor: '#c4f0ff',
        color: '#fff',
        fontWeight: '500',
        fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
        fontSize: '16px',
        fontSmoothing: 'antialiased',
        ':-webkit-autofill': {
          color: '#fce883',
        },
        '::placeholder': {
          color: '#87BBFD',
        },
      },
      invalid: {
        iconColor: '#FFC7EE',
        color: '#FFC7EE',
      },
    }
  };

  return (
    <CardForm onSubmit={handleSubmit}>
      <CustomerInput
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <CustomerInput
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <CardElementContainer>
        <CardElement options={cardStyle} />
      </CardElementContainer>
      <button type="submit" disabled={!stripe || !clientSecret}>Pay</button>
      {errorMessage && <div>{errorMessage}</div>}
      {success && <div>Payment successful!</div>}
    </CardForm>
  );
};

export const PagePayment: FC = () => {
  const rootStore = useStores()
  const { song, paymentHandler } = rootStore
  const prompt = usePrompt()
  const localized = useLocalization()
  const toast = useToast()

  const saveOrCreateSong = async () => {
    if (song.name.length === 0) {
      const text = await prompt.show({
        title: localized("save-as", "Save as"),
      });
      if (text !== null && text.length > 0) {
        song.name = text;
      }
    }
    console.log("Current song name: ", song.name);
    await createSong(rootStore)(song);
    toast.success(localized("song-created", "Song created"));
  };

  const onClickDownload = async () => {
    await saveOrCreateSong();
    console.log("savecreate done");
    // close();
    saveSong(rootStore)();
  };

  return (
    <div>
      <h2>Payment Page</h2>
      <div>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
};
