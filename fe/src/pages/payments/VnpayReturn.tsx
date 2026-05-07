import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function VnpayReturn() {
  const query = useQuery();
  const navigate = useNavigate();

  const responseCode = query.get('vnp_ResponseCode');
  const txnRef = query.get('vnp_TxnRef');
  const amount = query.get('vnp_Amount');

  const success = responseCode === '00';

  return (
    <div>
      <div className="page-header">
        <div className="page-title">VNPay Return</div>
        <div className="page-subtitle">Ket qua thanh toan</div>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
          {success ? 'Thanh toan thanh cong' : 'Thanh toan that bai'}
        </div>
        <div className="text-sm text-muted">Ma giao dich: {txnRef || 'N/A'}</div>
        <div className="text-sm text-muted" style={{ marginBottom: 16 }}>
          So tien: {amount ? Number(amount) / 100 : 'N/A'} VND
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/app')}>Ve dashboard</button>
      </div>
    </div>
  );
}
