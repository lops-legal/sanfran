import React, { useState, useEffect } from 'react';
import './ConsentBanner.css';

// Simple consent banner respecting IAB TCF basics (placeholder implementation)
export const ConsentBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [consent, setConsent] = useState({ analytics: false, marketing: false, functional: true });

  useEffect(() => {
    const stored = localStorage.getItem('privacyConsent');
    if (!stored) {
      setVisible(true);
    } else {
      // Parse stored consent to keep UI in sync
      setConsent(JSON.parse(stored));
    }
  }, []);

  const acceptAll = () => {
    const all = { analytics: true, marketing: true, functional: true };
    localStorage.setItem('privacyConsent', JSON.stringify(all));
    setConsent(all);
    setVisible(false);
  };

  const rejectAll = () => {
    const none = { analytics: false, marketing: false, functional: true };
    localStorage.setItem('privacyConsent', JSON.stringify(none));
    setConsent(none);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="consent-banner">
      <p>Utilizamos cookies para melhorar sua experiência. Aceita?
        <button onClick={acceptAll} className="consent-accept">Aceitar tudo</button>
        <button onClick={rejectAll} className="consent-reject">Recusar</button>
      </p>
    </div>
  );
};

export default ConsentBanner;
