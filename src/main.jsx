import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import { createRoot } from 'react-dom/client';

import {
  Search,
  ShieldCheck,
  FileText,
  Mic,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  MapPin,
  Languages,
  Upload,
  ChevronRight,
  Home,
  UserRound,
  LayoutDashboard,
  Wallet,
  Zap,
  ExternalLink
} from 'lucide-react';

import {
  PeraWalletConnect
} from '@perawallet/connect';

import algosdk from 'algosdk';

import {
  x402Client
} from '@x402/core/client';

import {
  ExactAvmScheme
} from '@x402/avm/exact/client';

import {
  ALGORAND_TESTNET_CAIP2
} from '@x402/avm';

import {
  wrapFetchWithPayment
} from '@x402/fetch';

import './styles.css';


/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:4021';


// Always use the SDK's canonical Algorand TestNet CAIP-2 value.
// This prevents the client and server from using subtly different
// network identifiers.
// GoPlausible hosted facilitator compatibility: use the exact TestNet
// identifier it currently advertises. This MUST match the server route.
const ALGORAND_NETWORK = 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';


const peraWallet =
  new PeraWalletConnect({
    chainId: 416002,
    shouldShowSignTxnToast: true
  });


const SCHEMES = [
  {
    id: 1,
    name: 'PM Scholarship Opportunity',
    category: 'Education',
    description:
      'Education support opportunity for eligible students.',
    benefit:
      'Financial support for education-related expenses.',
    minAge: 16,
    maxAge: 30,
    maxIncome: 800000,
    occupations: [
      'Student',
      'Student / Learner'
    ],
    documents: [
      'Aadhaar Card',
      'Income Certificate',
      'Marksheet',
      'Bank Account'
    ],
    official:
      'https://www.myscheme.gov.in/'
  },

  {
    id: 2,
    name: 'MUDRA Business Support',
    category: 'Business',
    description:
      'Support pathway for eligible micro and small entrepreneurs.',
    benefit:
      'Access to business-oriented financial support.',
    minAge: 18,
    maxAge: 65,
    maxIncome: 1500000,
    occupations: [
      'Business',
      'Entrepreneur',
      'Self Employed',
      'Farmer'
    ],
    documents: [
      'Aadhaar Card',
      'PAN Card',
      'Bank Account',
      'Business Documents'
    ],
    official:
      'https://www.myscheme.gov.in/'
  },

  {
    id: 3,
    name: 'Housing Support Opportunity',
    category: 'Housing',
    description:
      'Housing-related support discovery for eligible citizens.',
    benefit:
      'Potential assistance toward housing requirements.',
    minAge: 18,
    maxAge: 70,
    maxIncome: 1200000,
    occupations: [
      'Farmer',
      'Business',
      'Self Employed',
      'Private Employee',
      'Government Employee'
    ],
    documents: [
      'Aadhaar Card',
      'Income Certificate',
      'Address Proof',
      'Bank Account'
    ],
    official:
      'https://www.myscheme.gov.in/'
  },

  {
    id: 4,
    name: 'Skill Development Opportunity',
    category: 'Skill Development',
    description:
      'Skill-development discovery pathway for citizens seeking training.',
    benefit:
      'Training and employment-oriented skill opportunities.',
    minAge: 16,
    maxAge: 45,
    maxIncome: 1000000,
    occupations: [
      'Student',
      'Unemployed',
      'Private Employee',
      'Self Employed',
      'Farmer'
    ],
    documents: [
      'Aadhaar Card',
      'Educational Certificate',
      'Bank Account',
      'Address Proof'
    ],
    official:
      'https://www.myscheme.gov.in/'
  }
];

function matchScheme(
  scheme,
  profile
) {

  let score = 50;

  const reasons = [];

  const age =
    Number(profile.age || 0);

  const income =
    Number(profile.income || 0);

  const occupation =
    String(
      profile.occupation || ''
    ).trim();


  if (
    age >= scheme.minAge &&
    age <= scheme.maxAge
  ) {

    score += 20;

    reasons.push(
      'Age fits'
    );

  } else {

    reasons.push(
      'Age may need verification'
    );

  }

  if (
    income > 0 &&
    income <= scheme.maxIncome
  ) {

    score += 15;

    reasons.push(
      'Income fits'
    );

  } else {

    reasons.push(
      'Income needs verification'
    );

  }


  if (
    scheme.occupations.includes(
      occupation
    )
  ) {

    score += 15;

    reasons.push(
      'Profile fits'
    );

  } else {

    reasons.push(
      'Occupation may need verification'
    );

  }


  score =
    Math.min(
      score,
      99
    );


  return {
    ...scheme,
    score,
    reasons
  };
}

const ProfilePage =
  ({ profile, setProfile, t, findSchemes }) => {
    const isComplete =
      profile.name.trim().length > 0 &&
      Number(profile.age) > 0 &&
      Number(profile.income) >= 0 &&
      profile.occupation && profile.state;

    const filledCount = [profile.name, profile.age, profile.state, profile.occupation, profile.income]
      .filter(value => String(value ?? '').trim() !== '').length;

    return (
    <section className="page-section profile-page">

      <div className="section-heading profile-heading">

        <div>

          <span className="eyebrow">
            PROFILE • STEP 1
          </span>

          <h2>
            Tell us about yourself
          </h2>

          <p>
            Add a few basic details and BharatSahay will personalize
            the scheme recommendations for you.
          </p>

        </div>

      </div>


      <div className="profile-completion">
        <div className="completion-copy">
          <strong>Profile completion</strong>
          <span>{filledCount} of 5 fields</span>
        </div>
        <div className="completion-track" aria-hidden="true">
          <span style={{ width: `${filledCount * 20}%` }} />
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-card-head">
          <div>
            <span className="form-kicker">PERSONAL DETAILS</span>
            <h3>Build your citizen profile</h3>
          </div>
          <span className="secure-pill">Private &amp; secure</span>
        </div>

        <div className="form-grid">

          <label>

            <span>
              {t.name}
            </span>

            <input
              type="text"
              value={
                profile.name
              }
              onChange={event =>
                setProfile(prev => ({
                  ...prev,
                  name: event.target.value
                }))
              }
              placeholder="Enter your name"
            />

          </label>


          <label>

            <span>
              {t.age}
            </span>

            <input
              type="number"
              value={
                profile.age
              }
              onChange={event =>
                setProfile(prev => ({
                  ...prev,
                  age: event.target.value
                }))
              }
              placeholder="e.g. 21"
            />

          </label>


          <label>

            <span>
              {t.state}
            </span>

            <select
              value={
                profile.state
              }
              onChange={event =>
                setProfile(prev => ({
                  ...prev,
                  state: event.target.value
                }))
              }
            >

              <option>
                Uttar Pradesh
              </option>

              <option>
                Delhi
              </option>

              <option>
                Haryana
              </option>

              <option>
                Rajasthan
              </option>

              <option>
                Maharashtra
              </option>

              <option>
                Bihar
              </option>

              <option>
                Madhya Pradesh
              </option>

            </select>

          </label>


          <label>

            <span>
              {t.occupation}
            </span>

            <select
              value={
                profile.occupation
              }
              onChange={event =>
                setProfile(prev => ({
                  ...prev,
                  occupation: event.target.value
                }))
              }
            >

              <option>
                Student
              </option>

              <option>
                Unemployed
              </option>

              <option>
                Farmer
              </option>

              <option>
                Business
              </option>

              <option>
                Entrepreneur
              </option>

              <option>
                Self Employed
              </option>

              <option>
                Private Employee
              </option>

              <option>
                Government Employee
              </option>

            </select>

          </label>


          <label>

            <span>
              {t.income}
            </span>

            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={
                profile.income
              }
              onChange={event =>
                setProfile(prev => ({
                  ...prev,
                  income: event.target.value
                }))
              }
              placeholder="e.g. 300000"
            />

          </label>

        </div>


        <div className="profile-tip">
          <span>💡</span>
          <div>
            <strong>Why we ask</strong>
            <p>These details help us rank relevant government schemes. They are used for this prototype's matching flow.</p>
          </div>
        </div>

        <div className="profile-actions">

          <button
            className="primary-button profile-submit"
            onClick={findSchemes}
            disabled={!isComplete}
            title={!isComplete ? 'Complete your name, age and income first' : 'Find matching schemes'}
          >

            <Search
              size={18}
            />

            {t.findSchemes}

          </button>

        </div>

      </div>

    </section>
  );
};


export default function App() {

  const [
    activePage,
    setActivePage
  ] = useState('home');


  const [
    language,
    setLanguage
  ] = useState('en');


  const [
    profile,
    setProfile
  ] = useState({
    name: '',
    age: '',
    state: 'Uttar Pradesh',
    occupation: 'Student',
    income: ''
  });


  const [
    results,
    setResults
  ] = useState([]);


  const [
    searchText,
    setSearchText
  ] = useState('');


  const [
    selectedScheme,
    setSelectedScheme
  ] = useState(null);


  const [
    uploadedFile,
    setUploadedFile
  ] = useState(null);


  const [
    extractedData,
    setExtractedData
  ] = useState(null);


  const [
    walletAddress,
    setWalletAddress
  ] = useState('');


  const [
    walletBusy,
    setWalletBusy
  ] = useState(false);

  const [
    paymentBusy,
    setPaymentBusy
  ] = useState(false);


  const [
    paymentError,
    setPaymentError
  ] = useState('');


  const [
    premiumInsight,
    setPremiumInsight
  ] = useState(null);


  const [
    txId,
    setTxId
  ] = useState('');


  const [
    message,
    setMessage
  ] = useState('');

  useEffect(() => {

    let mounted = true;

    const restoreWallet =
      async () => {

        try {

          const accounts =
            await peraWallet.reconnectSession();

          if (
            mounted &&
            accounts &&
            accounts.length > 0
          ) {

            setWalletAddress(
              accounts[0]
            );

          }

        } catch (error) {

          console.log(
            'No existing Pera session.'
          );

        }

      };


    restoreWallet();


    return () => {
      mounted = false;
    };

  }, []);


  const connectWallet =
    async () => {

      setWalletBusy(true);

      try {

        const accounts =
          await peraWallet.connect();

        if (
          accounts &&
          accounts.length > 0
        ) {

          setWalletAddress(
            accounts[0]
          );

          setMessage(
            'Pera Wallet connected on Algorand TestNet.'
          );

        }

      } catch (error) {

        console.error(
          'Pera connection error:',
          error
        );

        setPaymentError(
          error?.message ||
          'Could not connect Pera Wallet.'
        );

      } finally {

        setWalletBusy(false);

      }

    };


  const disconnectWallet =
    async () => {

      try {

        await peraWallet.disconnect();

      } catch (error) {

        console.warn(
          'Wallet disconnect error:',
          error
        );

      }

      setWalletAddress('');

      setMessage(
        'Wallet disconnected.'
      );

    };


  const findSchemes =
    () => {

      const ranked =
        SCHEMES
          .map(
            scheme =>
              matchScheme(
                scheme,
                profile
              )
          )
          .sort(
            (a, b) =>
              b.score - a.score
          );

      setResults(
        ranked
      );

      setActivePage(
        'results'
      );

      setMessage(
        'Your personalized scheme matches are ready.'
      );

    };


  const filteredResults =
    useMemo(() => {

      if (!searchText.trim()) {
        return results;
      }

      const q =
        searchText
          .toLowerCase()
          .trim();

      return results.filter(
        scheme =>
          scheme.name
            .toLowerCase()
            .includes(q) ||
          scheme.category
            .toLowerCase()
            .includes(q) ||
          scheme.description
            .toLowerCase()
            .includes(q)
      );

    }, [
      results,
      searchText
    ]);


  const handleDocumentUpload =
    event => {

      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      setUploadedFile(
        file
      );

      setExtractedData({
        document:
          file.name,

        fields: {
          name:
            profile.name ||
            'Detected Name',

          income:
            profile.income
              ? `₹${Number(profile.income).toLocaleString('en-IN')}`
              : 'Detected Income',

          date:
            new Date().toLocaleDateString('en-IN')
        }
      });

      setMessage(
        'Document uploaded. Extraction preview generated.'
      );

    };

  const createPeraSigner =
    () => {

      return {

        address:
          walletAddress,

        signTransactions:
          async (
            txns,
            indexesToSign
          ) => {

            console.log(
              'x402 transactions:',
              txns
            );


            const signSet =
              indexesToSign ||
              txns.map(
                (_, index) =>
                  index
              );

            const txnGroup =
              txns.map(
                (rawTxn, index) => ({

                  txn:
                    algosdk.decodeUnsignedTransaction(
                      rawTxn
                    ),

                  signers:
                    signSet.includes(
                      index
                    )
                      ? [
                          walletAddress
                        ]
                      : []

                })
              );


            console.log(
              'Opening Pera Wallet for signing...'
            );


            const signed =
              await peraWallet.signTransaction(
                [txnGroup]
              );

            console.log(
              'Pera signed transactions:',
              signed
            );

            // Pera returns only the transactions that it was asked to sign.
            // x402, however, needs the COMPLETE atomic group in the payload:
            // signed transactions at indexesToSign and the original unsigned
            // transactions at the other indexes (typically the facilitator
            // fee-payer transaction).
            const signedMap = new Map();
            let signedPosition = 0;

            for (let index = 0; index < txns.length; index++) {
              if (!signSet.includes(index)) continue;

              const walletSigned = signed?.[signedPosition];
              if (walletSigned == null) {
                throw new Error(
                  `Pera did not return a signed transaction for group index ${index}.`
                );
              }

              // Pera normally returns Uint8Array. Keep compatibility with
              // base64 strings returned by some wallet/browser versions.
              let normalized = walletSigned;
              if (typeof walletSigned === 'string') {
                const binary = atob(walletSigned);
                normalized = Uint8Array.from(
                  binary,
                  (char) => char.charCodeAt(0)
                );
              }

              if (!(normalized instanceof Uint8Array)) {
                normalized = new Uint8Array(normalized);
              }

              signedMap.set(index, normalized);
              signedPosition++;
            }

            return txns.map((rawTxn, index) => {
              if (signSet.includes(index)) {
                return signedMap.get(index);
              }

              // IMPORTANT: preserve the original unsigned transaction.
              // Returning null here can produce an incomplete paymentGroup
              // for fee-abstracted Algorand x402 payments.
              return rawTxn;
            });

          }

      };

    };

  const unlockPremiumInsight =
    async () => {

      setPaymentError('');
      setPremiumInsight(null);
      setTxId('');
      setPaymentBusy(true);

      try {

        if (!walletAddress) {
          await connectWallet();
          setPaymentBusy(false);
          return;
        }

        // Pre-flight check: Verify backend resource server is reachable and payTo is configured
        try {
          const healthRes = await fetch(`${API_BASE}/api/health`);
          if (healthRes.ok) {
            const health = await healthRes.json();
            if (!health.payToConfigured) {
              throw new Error(
                'The backend resource server does not have a payment receiving address configured. Please set AVM_ADDRESS in server/.env.'
              );
            }
          } else {
            console.warn('Backend /api/health returned non-OK status:', healthRes.status);
          }
        } catch (healthErr) {
          if (healthErr.message.includes('backend resource server does not have')) {
            throw healthErr;
          }
          console.warn('Backend health check error (server offline or unreachable):', healthErr);
          throw new Error(
            `Unable to reach BharatSahay server at ${API_BASE}. Make sure the backend is running ("npm run server") and CORS allows your origin.`
          );
        }

        const signer =
          createPeraSigner();

        const client =
          new x402Client();

        client.register(
          ALGORAND_NETWORK,
          new ExactAvmScheme(
            signer
          )
        );

        console.log(
          'x402 Algorand scheme registered:',
          ALGORAND_NETWORK
        );

        const fetchWithPayment =
          wrapFetchWithPayment(
            fetch,
            client
          );

        console.log(
          'Requesting paid endpoint...'
        );

        const response =
          await fetchWithPayment(
            `${API_BASE}/api/paid-scheme-insight`,
            {
              method: 'GET',
              headers: {
                Accept:
                  'application/json'
              }
            }
          );

        console.log(
          'x402 response status:',
          response.status
        );

        console.log(
          'x402 response headers:',
          Object.fromEntries(response.headers.entries())
        );

        const receipt =
          response.headers.get(
            'PAYMENT-RESPONSE'
          ) ||
          response.headers.get(
            'X-PAYMENT-RESPONSE'
          ) ||
          response.headers.get(
            'payment-response'
          );

        const paymentErrorHeader =
          response.headers.get(
            'PAYMENT-ERROR'
          ) ||
          response.headers.get(
            'payment-error'
          );

        let decodedReceipt = null;
        if (receipt) {
          try {
            decodedReceipt =
              JSON.parse(
                atob(receipt)
              );

            console.log(
              'Decoded PAYMENT-RESPONSE:',
              decodedReceipt
            );
          } catch (error) {
            console.warn(
              'Could not decode payment response header:',
              error
            );
          }
        }

        let data = {};
        try {
          data = await response.json();
        } catch {
          // Response may not have JSON body
        }

        console.log(
          'Premium API response data:',
          data
        );

        const extractedTx =
          data?.transaction ||
          decodedReceipt?.transaction ||
          decodedReceipt?.txId ||
          decodedReceipt?.txID ||
          '';

        if (extractedTx) {
          setTxId(extractedTx);
        }

        if (!response.ok) {
          console.error(
            'Payment endpoint returned non-OK status:',
            response.status,
            { data, decodedReceipt, paymentErrorHeader }
          );

          const errorDetail =
            data?.errorMessage ||
            data?.errorReason ||
            decodedReceipt?.errorMessage ||
            decodedReceipt?.errorReason ||
            paymentErrorHeader ||
            data?.error ||
            data?.message ||
            `Payment request failed (${response.status})`;

          const finalError = extractedTx
            ? `${errorDetail} (Transaction: ${extractedTx})`
            : errorDetail;

          throw new Error(finalError);
        }

        setPremiumInsight(
          data
        );

        setMessage(
          'Payment successful. Premium AI insight unlocked.'
        );

      } catch (error) {
        console.error(
          'x402 payment failed:',
          error
        );

        let userMessage = error?.message || 'x402 payment failed.';

        if (userMessage.includes('Failed to fetch') || userMessage.includes('NetworkError')) {
          userMessage = `Network connection failed when communicating with ${API_BASE}. Check that the backend server is running and CORS allows the request.`;
        } else if (userMessage.includes('User rejected') || userMessage.includes('cancelled') || userMessage.includes('4100')) {
          userMessage = 'Transaction signing was cancelled in Pera Wallet.';
        } else if (userMessage.includes('overspend') || userMessage.includes('balance') || userMessage.includes('underflow')) {
          userMessage = 'Insufficient balance: Your connected wallet needs TestNet ALGO for transaction fees and TestNet USDC.';
        } else if (userMessage.includes('optin') || userMessage.includes('opt-in') || userMessage.includes('asset')) {
          userMessage = 'Asset error: Ensure both payer and receiver wallets are opted into USDC TestNet asset 10458941.';
        }

        setPaymentError(userMessage);

      } finally {
        setPaymentBusy(false);
      }

    };

  const text = {

    en: {

      home:
        'Home',

      profile:
        'Profile',

      results:
        'Find Schemes',

      documents:
        'Documents',

      dashboard:
        'Dashboard',

      heroTitle:
        'Find government schemes made for you.',

      heroSubtitle:
        'Tell BharatSahay a little about yourself and discover relevant government opportunities with clear reasons, document guidance and official-source verification.',

      createProfile:
        'Create My Profile',

      findSchemes:
        'Find My Schemes',

      name:
        'Full Name',

      age:
        'Age',

      state:
        'State',

      occupation:
        'Occupation',

      income:
        'Annual Family Income',

      premium:
        'Premium AI Recommendation',

      pay:
        'Pay $0.01 & unlock insight',

      connected:
        'TestNet wallet connected',

      connect:
        'Connect Pera Wallet',

      documentsTitle:
        'Document Intelligence',

      upload:
        'Upload Document'

    },

    hi: {

      home:
        'होम',

      profile:
        'प्रोफ़ाइल',

      results:
        'योजनाएँ खोजें',

      documents:
        'दस्तावेज़',

      dashboard:
        'डैशबोर्ड',

      heroTitle:
        'अपने लिए सही सरकारी योजनाएँ खोजें।',

      heroSubtitle:
        'अपनी जानकारी दें और BharatSahay से अपने लिए उपयुक्त योजनाएँ, कारण और आवश्यक दस्तावेज़ आसानी से जानें।',

      createProfile:
        'प्रोफ़ाइल बनाएँ',

      findSchemes:
        'मेरी योजनाएँ खोजें',

      name:
        'पूरा नाम',

      age:
        'आयु',

      state:
        'राज्य',

      occupation:
        'व्यवसाय',

      income:
        'वार्षिक पारिवारिक आय',

      premium:
        'प्रीमियम AI सुझाव',

      pay:
        '$0.01 भुगतान करके सुझाव खोलें',

      connected:
        'TestNet Wallet जुड़ा है',

      connect:
        'Pera Wallet जोड़ें',

      documentsTitle:
        'दस्तावेज़ इंटेलिजेंस',

      upload:
        'दस्तावेज़ अपलोड करें'

    }

  };


  const t =
    text[language];

  const Navigation =
    () => (

      <nav className="navbar">

        <div
          className="brand"
          onClick={() =>
            setActivePage('home')
          }
        >

          <div className="brand-icon">
            🇮🇳
          </div>

          <div>
            <strong>
              BharatSahay
            </strong>

            <span>
              Citizen AI
            </span>
          </div>

        </div>


        <div className="nav-links">

          <button
            onClick={() =>
              setActivePage('home')
            }
          >
            <Home size={17} />
            {t.home}
          </button>


          <button
            onClick={() =>
              setActivePage('profile')
            }
          >
            <UserRound size={17} />
            {t.profile}
          </button>


          <button
            onClick={() =>
              setActivePage('results')
            }
          >
            <Search size={17} />
            {t.results}
          </button>


          <button
            onClick={() =>
              setActivePage('documents')
            }
          >
            <FileText size={17} />
            {t.documents}
          </button>


          <button
            onClick={() =>
              setActivePage('dashboard')
            }
          >
            <LayoutDashboard size={17} />
            {t.dashboard}
          </button>

        </div>


        <div className="nav-actions">

          <button
            className="language-button"
            onClick={() =>
              setLanguage(
                language === 'en'
                  ? 'hi'
                  : 'en'
              )
            }
          >

            <Languages
              size={17}
            />

            {language === 'en'
              ? 'हिन्दी'
              : 'English'}

          </button>


          {walletAddress ? (

            <button
              className="wallet-button connected"
              onClick={
                disconnectWallet
              }
            >

              <Wallet
                size={17}
              />

              {walletAddress.slice(
                0,
                6
              )}
              ...
              {walletAddress.slice(
                -4
              )}

            </button>

          ) : (

            <button
              className="wallet-button"
              onClick={
                connectWallet
              }
              disabled={walletBusy}
            >

              <Wallet
                size={17}
              />

              {walletBusy
                ? 'Connecting...'
                : 'Connect Wallet'}

            </button>

          )}

        </div>

      </nav>

    );

  const HomePage =
    () => (

      <>

        <section className="hero">

          <div className="hero-content">

            <div className="badge">
              <Sparkles
                size={16}
              />
              Citizen AI • Prototype
            </div>


            <h1>
              {t.heroTitle}
            </h1>


            <p>
              {t.heroSubtitle}
            </p>


            <div className="hero-buttons">

              <button
                className="primary-button"
                onClick={() =>
                  setActivePage(
                    'profile'
                  )
                }
              >

                {t.createProfile}

                <ArrowRight
                  size={18}
                />

              </button>


              <button
                className="secondary-button"
                onClick={() =>
                  setActivePage(
                    'documents'
                  )
                }
              >

                <FileText
                  size={18}
                />

                Document Intelligence

              </button>

            </div>


            <div className="trust-row">

              <div>
                <CheckCircle2
                  size={17}
                />
                Explainable matching
              </div>

              <div>
                <ShieldCheck
                  size={17}
                />
                Verification-first
              </div>

              <div>
                <Languages
                  size={17}
                />
                English + Hindi
              </div>

            </div>

          </div>


          <div className="hero-card">

            <div className="hero-card-top">

              <span>
                ✨ Personalized match
              </span>

              <span>
                AI
              </span>

            </div>


            <div className="match-preview">

              <div className="match-score">
                92%
              </div>

              <div>
                <strong>
                  Best match found
                </strong>

                <p>
                  Based on age, income,
                  state and occupation.
                </p>
              </div>

            </div>


            <div className="mini-scheme">

              <div>
                <strong>
                  Skill Development
                </strong>

                <span>
                  Skill Development
                </span>
              </div>

              <b>
                92%
              </b>

            </div>


            <div className="mini-scheme">

              <div>
                <strong>
                  Education Support
                </strong>

                <span>
                  Education
                </span>
              </div>

              <b>
                88%
              </b>

            </div>


            <div className="mini-scheme">

              <div>
                <strong>
                  Business Support
                </strong>

                <span>
                  Business
                </span>
              </div>

              <b>
                81%
              </b>

            </div>

          </div>

        </section>


        <section className="feature-grid">

          <div className="feature-card">

            <Search />

            <h3>
              Discover
            </h3>

            <p>
              Find relevant opportunities
              without searching dozens of
              pages.
            </p>

          </div>


          <div className="feature-card">

            <Sparkles />

            <h3>
              Explain
            </h3>

            <p>
              See a match score and the
              reasons behind the recommendation.
            </p>

          </div>


          <div className="feature-card">

            <FileText />

            <h3>
              Prepare
            </h3>

            <p>
              Understand which documents
              you should keep ready.
            </p>

          </div>


          <div className="feature-card">

            <ShieldCheck />

            <h3>
              Verify
            </h3>

            <p>
              Use official government sources
              before making an application.
            </p>

          </div>

        </section>


        <section className="premium-section">

          <div className="premium-content">

            <div className="premium-badge">
              <Zap size={16} />
              x402 • ALGORAND TESTNET
            </div>


            <h2>
              {t.premium}
            </h2>


            <p>
              Pay <strong>$0.01 USDC</strong> per
              request. BharatSahay uses x402
              to request payment, your Pera Wallet
              signs the Algorand TestNet transaction,
              and GoPlausible verifies and settles it.
            </p>


            <div className="payment-actions">

              <button
                className="payment-button"
                onClick={
                  unlockPremiumInsight
                }
                disabled={
                  paymentBusy
                }
              >

                <Zap
                  size={18}
                />

                {paymentBusy
                  ? 'Processing payment...'
                  : t.pay}

              </button>


              {walletAddress && (

                <div className="wallet-status">

                  <CheckCircle2
                    size={17}
                  />

                  {t.connected}

                </div>

              )}

            </div>


            {paymentError && (

              <div className="payment-error">

                <XCircle
                  size={18}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span>
                    {paymentError}
                  </span>

                  {txId && (
                    <div style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>
                      <strong>On-chain Tx: </strong>
                      <a
                        href={`https://lora.algokit.io/testnet/transaction/${txId}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#b91c1c', textDecoration: 'underline' }}
                      >
                        {txId} ↗
                      </a>
                    </div>
                  )}
                </div>

              </div>

            )}


            {premiumInsight && (

              <div className="premium-result">

                <div className="success-title">

                  <CheckCircle2
                    size={20}
                  />

                  Premium insight unlocked

                </div>


                <h3>
                  {premiumInsight.title}
                </h3>


                <p>
                  {premiumInsight.insight}
                </p>


                {Array.isArray(
                  premiumInsight.recommendations
                ) && (

                  <ul>

                    {premiumInsight.recommendations.map(
                      (item, index) => (

                        <li
                          key={index}
                        >
                          {item}
                        </li>

                      )
                    )}

                  </ul>

                )}


                {txId && (

                  <div className="transaction-id">

                    <strong>
                      Transaction:
                    </strong>

                    <a
                      href={`https://lora.algokit.io/testnet/transaction/${txId}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#0d9488', textDecoration: 'underline', wordBreak: 'break-all' }}
                    >
                      {txId} ↗
                    </a>

                  </div>

                )}

              </div>

            )}

          </div>

        </section>

      </>

    );


  const ResultsPage =
    () => (

      <section className="page-section">

        <div className="section-heading">

          <div>

            <span className="eyebrow">
              RESULTS
            </span>

            <h2>
              Your scheme matches
            </h2>

            <p>
              These are prototype estimates,
              not official eligibility decisions.
            </p>

          </div>

        </div>


        <div className="results-toolbar">

          <div className="search-box">

            <Search
              size={18}
            />

            <input
              value={
                searchText
              }
              onChange={event =>
                setSearchText(
                  event.target.value
                )
              }
              placeholder="Search schemes..."
            />

          </div>

        </div>


        {filteredResults.length === 0 ? (

          <div className="empty-state">

            <Search
              size={40}
            />

            <h3>
              No matches yet
            </h3>

            <p>
              Create your profile to
              generate personalized results.
            </p>

            <button
              className="primary-button"
              onClick={() =>
                setActivePage(
                  'profile'
                )
              }
            >
              Create Profile
            </button>

          </div>

        ) : (

          <div className="scheme-grid">

            {filteredResults.map(
              scheme => (

                <div
                  className="scheme-card"
                  key={
                    scheme.id
                  }
                >

                  <div className="scheme-card-header">

                    <span className="category">
                      {scheme.category}
                    </span>

                    <span className="score">
                      {scheme.score}%
                    </span>

                  </div>


                  <h3>
                    {scheme.name}
                  </h3>


                  <p>
                    {scheme.description}
                  </p>


                  <div className="score-bar">

                    <div
                      style={{
                        width:
                          `${scheme.score}%`
                      }}
                    />

                  </div>


                  <div className="reasons">

                    {scheme.reasons.map(
                      (
                        reason,
                        index
                      ) => (

                        <span
                          key={index}
                        >

                          <CheckCircle2
                            size={15}
                          />

                          {reason}

                        </span>

                      )
                    )}

                  </div>


                  <div className="scheme-docs">

                    <FileText
                      size={16}
                    />

                    {scheme.documents.length}
                    {' '}
                    documents

                  </div>


                  <button
                    className="scheme-button"
                    onClick={() =>
                      setSelectedScheme(
                        scheme
                      )
                    }
                  >

                    View Details

                    <ChevronRight
                      size={17}
                    />

                  </button>

                </div>

              )
            )}

          </div>

        )}

      </section>

    );

  const DocumentsPage =
    () => (

      <section className="page-section">

        <div className="section-heading">

          <div>

            <span className="eyebrow">
              DOCUMENT INTELLIGENCE
            </span>

            <h2>
              {t.documentsTitle}
            </h2>

            <p>
              Upload a document to see the
              prototype extraction preview.
            </p>

          </div>

        </div>


        <div className="document-grid">

          <div className="upload-card">

            <div className="upload-icon">
              <Upload />
            </div>

            <h3>
              {t.upload}
            </h3>

            <p>
              PDF, JPG or PNG
            </p>


            <label className="upload-button">

              <Upload
                size={17}
              />

              Choose File

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={
                  handleDocumentUpload
                }
                hidden
              />

            </label>


            {uploadedFile && (

              <div className="uploaded-file">

                <FileText
                  size={17}
                />

                {uploadedFile.name}

              </div>

            )}

          </div>


          <div className="extraction-card">

            <div className="card-heading">

              <Sparkles
                size={18}
              />

              <h3>
                Extraction Preview
              </h3>

            </div>


            {extractedData ? (

              <>

                <div className="document-name">

                  <strong>
                    Document:
                  </strong>

                  {extractedData.document}

                </div>


                {Object.entries(
                  extractedData.fields
                ).map(
                  (
                    [
                      key,
                      value
                    ]
                  ) => (

                    <div
                      className="extracted-field"
                      key={key}
                    >

                      <span>
                        {key}
                      </span>

                      <strong>
                        {value}
                      </strong>

                    </div>

                  )
                )}

              </>

            ) : (

              <div className="empty-extraction">

                <FileText
                  size={38}
                />

                <p>
                  Upload a document to
                  preview extracted fields.
                </p>

              </div>

            )}

          </div>

        </div>


        <div className="document-note">

          <ShieldCheck
            size={20}
          />

          <div>

            <strong>
              Privacy & verification
            </strong>

            <p>
              This is a hackathon prototype.
              Production document processing
              should use consent, encryption,
              secure storage and controlled retention.
            </p>

          </div>

        </div>

      </section>

    );


  const DashboardPage =
    () => (

      <section className="page-section">

        <div className="section-heading">

          <div>

            <span className="eyebrow">
              DASHBOARD
            </span>

            <h2>
              Your BharatSahay snapshot
            </h2>

          </div>

        </div>


        <div className="dashboard-grid">

          <div className="dashboard-card">

            <span>
              Profile
            </span>

            <strong>
              {profile.name ||
                'Not created'}
            </strong>

            <p>
              {profile.age
                ? `${profile.age} years • ${profile.state}`
                : 'Create your profile'}
            </p>

          </div>


          <div className="dashboard-card">

            <span>
              Matches
            </span>

            <strong>
              {results.length}
            </strong>

            <p>
              Ranked opportunities
            </p>

          </div>


          <div className="dashboard-card">

            <span>
              Documents
            </span>

            <strong>
              {uploadedFile
                ? 1
                : 0}
            </strong>

            <p>
              Uploaded in prototype
            </p>

          </div>


          <div className="dashboard-card">

            <span>
              Wallet
            </span>

            <strong>
              {walletAddress
                ? 'Connected'
                : 'Not connected'}
            </strong>

            <p>
              Algorand TestNet
            </p>

          </div>

        </div>


        <div className="dashboard-flow">

          <div>
            01
            <span>
              Profile
            </span>
          </div>

          <ArrowRight />

          <div>
            02
            <span>
              Match
            </span>
          </div>

          <ArrowRight />

          <div>
            03
            <span>
              Explain
            </span>
          </div>

          <ArrowRight />

          <div>
            04
            <span>
              Prepare
            </span>
          </div>

          <ArrowRight />

          <div>
            05
            <span>
              Verify
            </span>
          </div>

        </div>

      </section>

    );


  const SchemeModal =
    () => {

      if (!selectedScheme) {
        return null;
      }


      return (

        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedScheme(
              null
            )
          }
        >

          <div
            className="modal"
            onClick={event =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <span className="category">
                  {selectedScheme.category}
                </span>

                <h2>
                  {selectedScheme.name}
                </h2>

              </div>


              <button
                className="close-button"
                onClick={() =>
                  setSelectedScheme(
                    null
                  )
                }
              >
                ×
              </button>

            </div>


            <div className="modal-score">

              <strong>
                {selectedScheme.score}%
              </strong>

              <span>
                Estimated profile match
              </span>

            </div>


            <p>
              {selectedScheme.description}
            </p>


            <div className="modal-section">

              <h3>
                Why this may fit
              </h3>

              {selectedScheme.reasons.map(
                (
                  reason,
                  index
                ) => (

                  <div
                    className="modal-reason"
                    key={index}
                  >

                    <CheckCircle2
                      size={16}
                    />

                    {reason}

                  </div>

                )
              )}

            </div>


            <div className="modal-section">

              <h3>
                Required documents
              </h3>

              <div className="document-list">

                {selectedScheme.documents.map(
                  document => (

                    <span
                      key={document}
                    >
                      <FileText
                        size={15}
                      />
                      {document}
                    </span>

                  )
                )}

              </div>

            </div>


            <div className="modal-benefit">

              <strong>
                Benefit
              </strong>

              <p>
                {selectedScheme.benefit}
              </p>

            </div>


            <div className="modal-actions">

              <a
                href={
                  selectedScheme.official
                }
                target="_blank"
                rel="noreferrer"
                className="primary-button"
              >

                Verify Official Source

                <ExternalLink
                  size={17}
                />

              </a>


              <button
                className="secondary-button"
                onClick={() =>
                  setSelectedScheme(
                    null
                  )
                }
              >
                Close
              </button>

            </div>


            <div className="verification-warning">

              <ShieldCheck
                size={17}
              />

              This score is a prototype estimate.
              Always verify current eligibility
              and application requirements on the
              official government source.

            </div>

          </div>

        </div>

      );

    };

  let pageContent;


  if (
    activePage === 'profile'
  ) {

    pageContent =
      <ProfilePage
        profile={profile}
        setProfile={setProfile}
        t={t}
        findSchemes={findSchemes}
      />;

  } else if (
    activePage === 'results'
  ) {

    pageContent =
      <ResultsPage />;

  } else if (
    activePage === 'documents'
  ) {

    pageContent =
      <DocumentsPage />;

  } else if (
    activePage === 'dashboard'
  ) {

    pageContent =
      <DashboardPage />;

  } else {

    pageContent =
      <HomePage />;

  }


  return (

    <div className="app-shell">

      <Navigation />


      {message && (

        <div className="global-message">

          <CheckCircle2
            size={17}
          />

          {message}

          <button
            onClick={() =>
              setMessage('')
            }
          >
            ×
          </button>

        </div>

      )}


      <main>

        {pageContent}

      </main>


      <footer className="footer">

        <div>

          <strong>
            BharatSahay
          </strong>

          <span>
            Citizen-first Government Scheme Discovery
          </span>

        </div>


        <div className="footer-right">

          <span>
            React + Vite
          </span>

          <span>
            x402
          </span>

          <span>
            Algorand TestNet
          </span>

        </div>

      </footer>


      <SchemeModal />

    </div>

  );

}


const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found in index.html.');
}

createRoot(rootElement).render(<App />);
