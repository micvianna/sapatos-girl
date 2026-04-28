import React from 'react';
import { motion } from 'framer-motion';
import './Institutional.css';

export default function Returns() {
  return (
    <motion.div
      className="institutional-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="institutional-hero">
        <div className="hero-placeholder" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')`,
          height: '300px',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} />
      </div>

      <h1>RETURNS & EXCHANGES</h1>
      <p className="institutional-subtitle">
        We want you to recognize the power of your ATALAIA shoe the moment you put it on. 
        But if the fit isn't right, we've created a white-glove process — no stress, no bureaucracy.
      </p>

      <section className="policy-section">
        <h2>Return Policy</h2>
        <ul>
          <li>
            <strong>7-day window:</strong> You have <em>7 calendar days</em> from delivery to request a return 
            or exchange under Art. 49 of the Consumer Defense Code (CDC).
          </li>
          <li>
            <strong>Pristine condition required:</strong> The item must show <em>no signs of wear on the sole</em>, 
            and must be returned in the original packaging (magna box, tissue paper, and dust bags).
          </li>
          <li>
            <strong>First exchange free:</strong> Your first size exchange is complimentary with prepaid return shipping.
          </li>
        </ul>
      </section>

      <section className="policy-section policy-sale">
        <h2>SALE & LAST PIECES</h2>
        <div className="policy-highlight">
          <p>
            Items marked as <strong>SALE</strong> or <strong>ÚLTIMAS PEÇAS</strong> (LAST PIECES) 
            are <em>not eligible for cash refunds</em>. Returns of these items will be issued exclusively 
            as <strong>store credit / voucher</strong> to be used on future purchases at ATALAIA.
          </p>
          <p>
            Bespoke (made-to-order) pieces from the Ateliê line are final sale and cannot be returned or exchanged.
          </p>
        </div>
      </section>

      <section className="policy-section">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step">
            <span className="step-number">01</span>
            <h3>Contact SAC</h3>
            <p>Reach out to our customer service team and declare your return or exchange intention.</p>
          </div>
          <div className="step">
            <span className="step-number">02</span>
            <h3>Receive VIP Code</h3>
            <p>You'll receive a logistics code. In capital cities, we schedule a courier pickup at your address.</p>
          </div>
          <div className="step">
            <span className="step-number">03</span>
            <h3>Quality Check</h3>
            <p>Once received at our Quality Center, the item is inspected within 48h for condition verification.</p>
          </div>
          <div className="step">
            <span className="step-number">04</span>
            <h3>Resolution</h3>
            <p>New sizing dispatched via express shipping, or refund/store credit processed within 5 business days.</p>
          </div>
        </div>
      </section>

      <p className="cta-section">
        To start your return,{' '}
        <a href="/contato" className="institutional-link">contact us here</a>.
      </p>
    </motion.div>
  );
}
