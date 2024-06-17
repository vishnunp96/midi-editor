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

interface CardFormProps {
  disabled: boolean;
}

const CardForm = styled.form<CardFormProps>`
    width: 400px;
    padding: 20px;
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    background-color: #4d4d4d;
    border-radius: 10px;
    box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.2);
    overflow: hidden;
    position: relative;


    &::after {
        content: ${({ disabled }) => (disabled ? '""' : 'none')};
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 1;
        background-color: rgba(0, 0, 0, 0.5);
    }
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

interface AppearingMessageProps {
  delay?: number;
  transition?: number;
}

const AppearingMessage = styled.div<AppearingMessageProps>`
  opacity: 0;
  //transition: opacity 0.5s ease-in-out;
  //transition-delay: 1s;
  transition: opacity ${({ transition = 0.5 }) => transition}s ease-in-out;
  transition-delay: ${({ delay= 0 }) => delay}s;
  &.visible {
    opacity: 1;
  }
`;


interface CheckoutFormProps {
  reload: number;
  onClickDownload: () => void;
  setItemValue: React.Dispatch<React.SetStateAction< string >>;
  setErrorMessage: React.Dispatch<React.SetStateAction< string | null >>;
  setSuccess: React.Dispatch<React.SetStateAction< boolean >>;
}

const CheckoutForm: FC<CheckoutFormProps> = ({ reload,
                                               onClickDownload,
                                               setItemValue,
                                               setErrorMessage,
                                               setSuccess })  => {
  const stripe = useStripe();
  const elements = useElements();
  const { paymentHandler } = useStores();
  const {
    authStore: { authUser: user },
  } = useStores()
  const [clientSecret, setClientSecret] = useState('');
  const [disablePay, setDisablePay] = useState(false);
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState('');

  useEffect(() => {
    console.log("Use effect being called.")
    setDisablePay(false);
    setClientSecret('');
    setErrorMessage(null);
    setSuccess(false);
    setItemValue('');
    if (user?.uid) {
      // Call PaymentHandler to create Payment Intent on component mount
      paymentHandler.getPaymentIntent('price_1PRf762M0t6YOSni1MtUdSYO', user?.uid).then(({clientSecret, paymentAmount, paymentCurrency}) => {
        setClientSecret(clientSecret);
        setItemValue("Payment Amount: " + (paymentAmount / 100.0).toFixed(2) + " " + paymentCurrency.toUpperCase())
      });
    } else {
      console.log("User not signed in.")
    }
  }, [reload]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setDisablePay(true);
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
      onClickDownload();
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
    <CardForm onSubmit={handleSubmit} disabled={disablePay}>
      <CustomerInput
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={disablePay}
      />
      <CustomerInput
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={disablePay}
      />
      <CardElementContainer>
        <CardElement options={cardStyle} />
      </CardElementContainer>
      <button type="submit" disabled={!stripe || !clientSecret || disablePay}>Pay</button>
    </CardForm>
  );
};

export const PagePayment: FC = () => {
  const rootStore = useStores()
  const { song, paymentHandler } = rootStore
  const prompt = usePrompt()
  const localized = useLocalization()
  const toast = useToast()
  const [itemValue, setItemValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [reload, setReload] = useState(0);




  const recordSong = async () => {
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
    await recordSong();
    console.log("savecreate done");
    saveSong(rootStore)();
  };

  return (
    <>
      <h2>Payment Page</h2>
      <AppearingMessage transition={0.2} className={itemValue ? '' : 'visible'}>
        <h2>Loading Portal...</h2>
      </AppearingMessage>
      <AppearingMessage delay={0.2} className={itemValue ? 'visible' : ''}>
        <h2>{itemValue}</h2>
      </AppearingMessage>
      <AppearingMessage delay={0.7} className={itemValue ? 'visible' : ''}>
        <Elements stripe={stripePromise}>
          <CheckoutForm reload={reload}
                        onClickDownload={onClickDownload}
                        setItemValue={setItemValue}
                        setErrorMessage={setErrorMessage}
                        setSuccess={setSuccess}/>
        </Elements>
      </AppearingMessage>
      <AppearingMessage className={errorMessage ? 'visible' : ''}>
        <h2>{errorMessage}</h2>
      </AppearingMessage>
      <AppearingMessage className={success ? 'visible' : ''}>
        <h2>{success && 'Payment successful!'}</h2>
      </AppearingMessage>
      {errorMessage && <button onClick={() => setReload(reload+1)}>Re-try Payment</button>}
    </>
  );
};
