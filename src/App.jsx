import { useEffect, useMemo, useRef, useState } from 'react';
import HeartBackground from './components/HeartBackground.jsx';

const LOCATIONS = [
  {
    label: '44.8029, 20.4445',
    lat: 44.8029,
    lng: 20.4445,
    mapsUrl: 'https://maps.google.com/?q=44.8029,20.4445'
  },
  {
    label: '44.8170, 20.4503',
    lat: 44.817,
    lng: 20.4503,
    mapsUrl: 'https://maps.google.com/?q=44.8170,20.4503'
  },
  {
    label: '44.8051, 20.4485',
    lat: 44.8051,
    lng: 20.4485,
    mapsUrl: 'https://maps.google.com/?q=44.8051,20.4485'
  },
  {
    label: '44.80262, 20.44417',
    lat: 44.80262,
    lng: 20.44417,
    mapsUrl: 'https://maps.google.com/?q=44.80262,20.44417'
  }
];

const DAYS = ['Subota', 'Nedjelja', 'Ponedjeljak', 'Utorak'];
const TIMES = ['19h', '20h', '21h'];
const FOODS = [
  { label: 'Burger', icon: '🍔' },
  { label: 'Pizza', icon: '🍕' },
  { label: 'Steak', icon: '🥩' },
  { label: 'Sushi', icon: '🍣' },
  { label: 'Samo piće', icon: '🍷' }
];

const initialAnswers = {
  accepted: false,
  day: '',
  time: '',
  food: '',
  locationIndex: null
};

function App() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState(initialAnswers);
  const [sendStatus, setSendStatus] = useState('idle');
  const hasSubmitted = useRef(false);

  const selectedLocation = useMemo(() => {
    if (answers.locationIndex === null) return null;
    return LOCATIONS[answers.locationIndex];
  }, [answers.locationIndex]);

  useEffect(() => {
    if (step !== 5 || hasSubmitted.current) return;

    hasSubmitted.current = true;
    const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;

    if (!webhookUrl) {
      setSendStatus('missing-url');
      return;
    }

    const payload = {
      ...answers,
      location: selectedLocation,
      timestamp: new Date().toISOString()
    };

    setSendStatus('sending');

    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Webhook failed with ${response.status}`);
        }
        setSendStatus('sent');
      })
      .catch(() => setSendStatus('error'));
  }, [answers, selectedLocation, step]);

  const updateAnswers = (patch) => {
    setAnswers((current) => ({ ...current, ...patch }));
  };

  return (
    <main className="appShell">
      <HeartBackground />
      <section className="flowLayer" aria-live="polite">
        <div key={step} className="questionPanel">
          {step === 1 && (
            <InviteStep
              onAccept={() => {
                updateAnswers({ accepted: true });
                setStep(2);
              }}
            />
          )}

          {step === 2 && (
            <ScheduleStep
              answers={answers}
              onSelect={updateAnswers}
              onNext={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <FoodStep
              selectedFood={answers.food}
              onSelect={(food) => updateAnswers({ food })}
              onNext={() => setStep(4)}
            />
          )}

          {step === 4 && (
            <LocationStep
              selectedIndex={answers.locationIndex}
              onSelect={(locationIndex) => updateAnswers({ locationIndex })}
              onNext={() => setStep(5)}
            />
          )}

          {step === 5 && (
            <FinalStep answers={answers} sendStatus={sendStatus} />
          )}
        </div>
      </section>
    </main>
  );
}

function InviteStep({ onAccept }) {
  const escapeZoneRef = useRef(null);
  const yesButtonRef = useRef(null);
  const noButtonRef = useRef(null);
  const lastEscapeIndex = useRef(-1);
  const [noPosition, setNoPosition] = useState({ left: '50%', top: 'calc(50% + 82px)' });

  const moveNoButton = (event) => {
    event.preventDefault();
    const zoneRect = escapeZoneRef.current?.getBoundingClientRect();
    const yesRect = yesButtonRef.current?.getBoundingClientRect();
    const noRect = noButtonRef.current?.getBoundingClientRect();
    if (!zoneRect || !yesRect) return;

    const buttonWidth = noRect?.width ?? 96;
    const buttonHeight = noRect?.height ?? 48;
    const safePadding = 8;
    const minX = safePadding + buttonWidth / 2;
    const maxX = zoneRect.width - buttonWidth / 2 - safePadding;
    const minY = safePadding + buttonHeight / 2;
    const maxY = zoneRect.height - buttonHeight / 2 - safePadding;
    const centerX = yesRect.left - zoneRect.left + yesRect.width / 2;
    const centerY = yesRect.top - zoneRect.top + yesRect.height / 2;
    const gapX = Math.min(136, zoneRect.width * 0.34);
    const gapY = Math.min(78, zoneRect.height * 0.32);
    const escapeOffsets = [
      { x: -gapX, y: 0 },
      { x: gapX, y: 0 },
      { x: 0, y: -gapY },
      { x: 0, y: gapY },
      { x: -gapX * 0.75, y: -gapY * 0.75 },
      { x: gapX * 0.75, y: -gapY * 0.75 },
      { x: -gapX * 0.75, y: gapY * 0.75 },
      { x: gapX * 0.75, y: gapY * 0.75 }
    ];
    const nextIndex = (lastEscapeIndex.current + 1) % escapeOffsets.length;

    lastEscapeIndex.current = nextIndex;
    const nextOffset = escapeOffsets[nextIndex];

    setNoPosition({
      left: `${clamp(centerX + nextOffset.x, minX, maxX)}px`,
      top: `${clamp(centerY + nextOffset.y, minY, maxY)}px`
    });
  };

  return (
    <>
      <p className="eyebrow">jedno važno pitanje</p>
      <h1>Želiš li izaći sa mnom na dejt?</h1>
      <div className="inviteActions" ref={escapeZoneRef}>
        <button className="primaryButton" type="button" onClick={onAccept} ref={yesButtonRef}>
          DA
        </button>
        <button
          className="secondaryButton runawayButton"
          type="button"
          ref={noButtonRef}
          style={noPosition}
          onClick={moveNoButton}
          onMouseEnter={moveNoButton}
          onMouseMove={moveNoButton}
          onTouchStart={moveNoButton}
        >
          NE
        </button>
      </div>
    </>
  );
}

function ScheduleStep({ answers, onSelect, onNext }) {
  const canContinue = answers.day && answers.time;

  return (
    <>
      <p className="eyebrow">biramo termin</p>
      <h1>Kada si slobodna?</h1>
      <div className="scheduleGrid">
        {DAYS.map((day) => (
          <div className={`dayGroup ${answers.day === day ? 'selectedGroup' : ''}`} key={day}>
            <button
              className="dayButton"
              type="button"
              onClick={() => onSelect({ day, time: '' })}
            >
              {day}
            </button>
            <div className="timeRow">
              {TIMES.map((time) => (
                <button
                  className={`choicePill ${
                    answers.day === day && answers.time === time ? 'selected' : ''
                  }`}
                  type="button"
                  key={time}
                  onClick={() => onSelect({ day, time })}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="primaryButton nextButton" type="button" onClick={onNext} disabled={!canContinue}>
        Dalje
      </button>
    </>
  );
}

function FoodStep({ selectedFood, onSelect, onNext }) {
  return (
    <>
      <p className="eyebrow">mood za večeru</p>
      <h1>U kakvom si raspoloženju za hranu?</h1>
      <div className="optionGrid">
        {FOODS.map((food) => (
          <button
            className={`optionButton ${selectedFood === food.label ? 'selected' : ''}`}
            type="button"
            key={food.label}
            onClick={() => onSelect(food.label)}
          >
            <span aria-hidden="true">{food.icon}</span>
            {food.label}
          </button>
        ))}
      </div>
      <button className="primaryButton nextButton" type="button" onClick={onNext} disabled={!selectedFood}>
        Dalje
      </button>
    </>
  );
}

function LocationStep({ selectedIndex, onSelect, onNext }) {
  return (
    <>
      <p className="eyebrow">biramo tačku na mapi</p>
      <h1>Koje koordinate zvuče najbolje?</h1>
      <div className="optionGrid mysteryGrid">
        {LOCATIONS.map((location, index) => (
          <button
            className={`optionButton ${selectedIndex === index ? 'selected' : ''}`}
            type="button"
            key={location.label}
            onClick={() => onSelect(index)}
          >
            <span aria-hidden="true">📍</span>
            {location.label}
          </button>
        ))}
      </div>
      <button
        className="primaryButton nextButton"
        type="button"
        onClick={onNext}
        disabled={selectedIndex === null}
      >
        Završiti
      </button>
    </>
  );
}

function FinalStep({ answers, sendStatus }) {
  const statusText = {
    idle: '',
    sending: 'Šaljem odgovor...',
    sent: 'Odgovor je poslan.',
    error: 'Odgovor nije poslan. Provjeri webhook URL pa pokušaj ponovo.',
    'missing-url': 'Webhook URL još nije podešen u .env fajlu.'
  }[sendStatus];

  return (
    <>
      <p className="eyebrow">dogovoreno</p>
      <h1>Vidimo se! ❤️</h1>
      <div className="summaryBox">
        <p>
          <strong>Dan:</strong> {answers.day}
        </p>
        <p>
          <strong>Termin:</strong> {answers.time}
        </p>
        <p>
          <strong>Hrana:</strong> {answers.food}
        </p>
        <p>
          <strong>Koordinate:</strong> {LOCATIONS[answers.locationIndex]?.label}
        </p>
      </div>
      {statusText && <p className={`sendStatus ${sendStatus}`}>{statusText}</p>}
    </>
  );
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default App;
