'use client';
import { useState } from 'react';

export default function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href="https://wa.me/917990629029?text=Hi%20ERA43!%20I%20have%20an%20inquiry%20regarding%20an%20order."
      target="_blank"
      rel="noreferrer"
      aria-label="Contact us on WhatsApp"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        width: '54px',
        height: '54px',
        borderRadius: '50%',
        backgroundColor: isHovered ? '#25D366' : '#111111',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isHovered 
          ? '0 8px 24px rgba(37, 211, 102, 0.45)' 
          : '0 4px 16px rgba(0, 0, 0, 0.25)',
        transform: isHovered ? 'scale(1.08) translateY(-2px)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 999,
        cursor: 'pointer',
        textDecoration: 'none'
      }}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{
          transition: 'transform 0.3s ease',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)'
        }}
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.68C7.02 10.88 7.89 12.04 8.02 12.21C8.14 12.38 9.75 14.87 12.21 15.93C14.26 16.81 14.68 16.64 15.13 16.59C15.58 16.55 16.58 16 16.79 15.42C17 14.83 17 14.33 16.93 14.22C16.86 14.12 16.7 14.05 16.45 13.93C16.2 13.8 14.97 13.2 14.74 13.11C14.5 13.03 14.35 12.98 14.2 13.23C14.04 13.48 13.58 14.05 13.44 14.22C13.3 14.38 13.15 14.4 12.91 14.28C12.66 14.15 11.86 13.89 10.91 13.04C10.17 12.38 9.67 11.56 9.53 11.31C9.39 11.06 9.51 10.93 9.64 10.81C9.75 10.7 9.89 10.52 10.02 10.37C10.15 10.22 10.19 10.11 10.28 9.94C10.36 9.77 10.32 9.63 10.26 9.5C10.2 9.38 9.71 8.18 9.5 7.69C9.31 7.21 9.11 7.27 8.95 7.26C8.81 7.26 8.65 7.33 8.53 7.33Z" />
      </svg>
    </a>
  );
}
