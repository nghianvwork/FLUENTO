import { useState } from 'react';
import { paymentApi } from '../../services/apiServices';
import toast from 'react-hot-toast';

const plans = [
  { id: 'free', name: 'Free', price: 0, desc: 'Goi trai nghiem co ban' },
  { id: 'premium', name: 'Premium', price: 149000, desc: 'Khong gioi han AI, room, report' },
  { id: 'premium-plus', name: 'Premium Plus', price: 249000, desc: 'Full features + gia su 1-1' },
];

export default function Billing() {
  const [amount, setAmount] = useState<number>(149000);
  const [orderInfo, setOrderInfo] = useState('ENOVA Premium');
  const [bankCode, setBankCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (amount <= 0) {
      toast.error('Please select a paid plan');
      return;
    }
    setLoading(true);
    try {
      const res = await paymentApi.createVnpay({ amount, orderInfo, bankCode: bankCode || undefined });
      const url = res.data.data.paymentUrl;
      if (!url) throw new Error('No payment URL');
      window.location.href = url;
    } catch {
      toast.error('Cannot create VNPay payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">💳 Billing & Subscription</div>
        <div className="page-subtitle">Nang cap goi Premium de mo khoa toan bo tinh nang</div>
      </div>

      <div className="card-grid">
        {plans.map((plan) => (
          <div key={plan.id} className={`card ${amount === plan.price ? 'card-active' : ''}`}>
            <div className="card-title" style={{ marginBottom: 6 }}>{plan.name}</div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              {plan.price === 0 ? '0d' : `${plan.price.toLocaleString('vi-VN')}d`}
            </div>
            <div className="card-desc" style={{ marginBottom: 16 }}>{plan.desc}</div>
            <button className="btn btn-secondary" onClick={() => {
              setAmount(plan.price);
              setOrderInfo(`ENOVA ${plan.name}`);
            }}>
              Chon goi
            </button>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24, maxWidth: 560 }}>
        <div className="input-group">
          <label className="input-label">So tien (VND)</label>
          <input className="input" type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">Noi dung don hang</label>
          <input className="input" value={orderInfo} onChange={(e) => setOrderInfo(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Bank code (optional)</label>
          <input className="input" placeholder="VD: VNBANK" value={bankCode} onChange={(e) => setBankCode(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-full" onClick={handleCheckout} disabled={loading}>
          {loading ? 'Dang tao thanh toan...' : 'Thanh toan VNPay'}
        </button>
      </div>
    </div>
  );
}
