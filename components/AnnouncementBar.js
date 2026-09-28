'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const messages = [
  'FREE EXPRESS DELIVERY ON ORDERS ABOVE ₹1999 — ALL INDIA',
  'USE CODE NIRAV10 FOR 10% OFF YOUR FIRST ORDER',
  '7-DAY HASSLE-FREE RETURNS & SIZE EXCHANGE',
  '100% CASH ON DELIVERY AVAILABLE ACROSS INDIA',
  'INTERNATIONAL SHIPPING AVAILABLE — WORLDWIDE DELIVERY',
  '240 GSM BIO-WASHED HEAVYWEIGHT COTTON — ULTRA LUXURY',
];

export default function AnnouncementBar() {
  // mounted guard prevents hydration mismatch — render nothing on server
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (!mounted || dismissed) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [mounted, dismissed]);

  // Don't render anything on server to avoid hydration mismatch
  if (!mounted || dismissed) return null;

  const handlePrev = () => setCurrent(prev => (prev - 1 + messages.length) % messages.length);
  const handleNext = () => setCurrent(prev => (prev + 1) % messages.length);

  return (
    <div className="announcement-bar" role="banner" aria-label="Store announcements">
      <div className="announcement-inner">
        {/* Use plain text arrows — NOT HTML entities to avoid SSR mismatch */}
        <button className="announcement-nav" onClick={handlePrev} aria-label="Previous announcement">
          {'<'}
        </button>

        <Link href="/products" className="announcement-text">
          {messages[current]}
        </Link>

        <button className="announcement-nav" onClick={handleNext} aria-label="Next announcement">
          {'>'}
        </button>
      </div>

      <button
        className="announcement-close"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
      >
        x
      </button>
    </div>
  );
}
