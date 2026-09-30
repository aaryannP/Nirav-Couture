'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderId: '',
    subject: 'Order Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', orderId: '', subject: 'Order Inquiry', message: '' });
  };

  return (
    <div style={{ padding: '48px 0 90px', background: '#FFFFFF' }}>
      <div className="container" style={{ maxWidth: '1040px' }}>
        {/* Breadcrumb */}
        <nav className="zed-breadcrumbs" style={{ marginBottom: '24px' }}>
          <Link href="/">Home</Link>
          <span>/</span>
          <span style={{ color: '#000000', fontWeight: '800' }}>Contact Us</span>
        </nav>

        <div style={{ marginBottom: '40px', borderBottom: '1px solid var(--border-light)', paddingBottom: '24px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            OFFICIAL MERCHANT SUPPORT
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: '900', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#000000' }}>
            CONTACT US
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '8px', maxWidth: '640px' }}>
            Have a question regarding your order, sizing, returns, or payment? Reach out to our team directly via phone, email, WhatsApp, or the form below.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>
          {/* Left Column: Registered Business & Contact Details (Bank / Payment Gateway KYC Compliant) */}
          <div style={{ background: '#F8F9FA', padding: '32px', borderRadius: '8px', border: '1px solid var(--border-medium)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px', color: '#000000' }}>
              MERCHANT & OFFICE DETAILS
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.9rem', color: '#222222' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  LEGAL / TRADE NAME
                </div>
                <div style={{ fontWeight: '800', color: '#000000' }}>NIRAV COUTURE (Nirav Prajapati)</div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  REGISTERED & OPERATING ADDRESS
                </div>
                <div style={{ lineHeight: '1.6' }}>
                  Studio 104, Heritage Corporate Hub,<br />
                  Near SG Highway, Bodakdev,<br />
                  Ahmedabad, Gujarat – 380054, India
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  TELEPHONE / WHATSAPP SUPPORT
                </div>
                <a href="tel:+917990629029" style={{ fontWeight: '800', color: '#000000', display: 'block' }}>
                  +91 79906 29029
                </a>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  CUSTOMER CARE & BILLING EMAIL
                </div>
                <a href="mailto:nirav@niravcouture.com" style={{ fontWeight: '800', color: '#000000', textDecoration: 'underline' }}>
                  nirav@niravcouture.com
                </a>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  OPERATING HOURS
                </div>
                <div>Monday to Saturday: 10:00 AM – 7:00 PM (IST)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Response time: Within 24 business hours
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-medium)', paddingTop: '16px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  GRIEVANCE REDRESSAL OFFICER
                </div>
                <div style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                  <strong>Name:</strong> Nirav Prajapati<br />
                  <strong>Email:</strong> nirav@niravcouture.com<br />
                  <strong>Phone:</strong> +91 79906 29029
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div style={{ background: '#FFFFFF', padding: '32px', borderRadius: '8px', border: '1px solid var(--border-medium)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px', color: '#000000' }}>
              SEND US A MESSAGE
            </h2>

            {submitted && (
              <div style={{ background: '#ECFDF5', border: '1px solid #10B981', color: '#065F46', padding: '14px 16px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.88rem', fontWeight: '700' }}>
                Thank you for contacting NIRAV COUTURE. Your inquiry has been registered and our support team will respond within 24 hours.
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="contact-name" style={{ display: 'block', fontSize: '0.76rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  Full Name *
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '4px', border: '1px solid var(--border-medium)', fontSize: '0.9rem' }}
                />
              </div>

              <div className="form-grid-2">
                <div>
                  <label htmlFor="contact-email" style={{ display: 'block', fontSize: '0.76rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '4px', border: '1px solid var(--border-medium)', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" style={{ display: 'block', fontSize: '0.76rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                    Phone Number *
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '4px', border: '1px solid var(--border-medium)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div>
                  <label htmlFor="contact-subject" style={{ display: 'block', fontSize: '0.76rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                    Inquiry Type
                  </label>
                  <select
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '4px', border: '1px solid var(--border-medium)', fontSize: '0.9rem', background: '#FFFFFF' }}
                  >
                    <option value="Order Inquiry">Order Status / Tracking</option>
                    <option value="Return / Exchange">Return, Exchange & Refund</option>
                    <option value="Payment Issue">Payment / Billing Query</option>
                    <option value="Size & Fit">Size & Fabric Inquiry</option>
                    <option value="Other">General Support</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-order-id" style={{ display: 'block', fontSize: '0.76rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                    Order ID (Optional)
                  </label>
                  <input
                    id="contact-order-id"
                    name="orderId"
                    type="text"
                    placeholder="e.g. ORD-84920"
                    value={formData.orderId}
                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '4px', border: '1px solid var(--border-medium)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" style={{ display: 'block', fontSize: '0.76rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows="4"
                  required
                  placeholder="How can we help you today?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '4px', border: '1px solid var(--border-medium)', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn-zed-solid" style={{ marginTop: '6px' }}>
                SUBMIT REQUEST
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
