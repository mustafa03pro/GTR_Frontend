// src/purchase/components/PurchasePaymentView.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Printer, FileText } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

export default function PurchasePaymentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/purchases/payments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPayment(res.data);
      } catch (err) {
        console.error('Failed to load payment', err);
        setError('Failed to load payment.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handlePrint = () => {
    if (!payment) return;
    const content = document.getElementById('payment-print-area')?.innerHTML || '';
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(`
      <html><head><title>Payment Receipt ${payment.reference || payment.id}</title>
      <style>body{font-family:Arial,Helvetica,sans-serif;padding:20px} table{width:100%;border-collapse:collapse}td,th{padding:6px;border:1px solid #ddd}</style>
      </head><body>${content}</body></html>
    `);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 300);
  };

  // Optional: open invoice/bill from allocations
  const goToInvoice = (invoiceId) => {
    if (!invoiceId) return;
    navigate(`/purchase-dashboard/bills/view/${invoiceId}`);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!payment) return <div className="p-6">Payment not found</div>;

  return (
    <div className="bg-card p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-secondary"><ArrowLeft /></button>
          <h1 className="text-xl font-bold">Payment — {payment.reference || `#${payment.id}`}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="btn-secondary flex items-center gap-2"><Printer /> Print</button>
          {/* Placeholder for other actions */}
          <button onClick={() => alert('More actions (export/logs)')} className="btn-secondary flex items-center gap-2"><FileText /> More</button>
        </div>
      </div>

      <div id="payment-print-area" className="border p-4 bg-white">
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
          <div>
            <h3 style={{margin:0}}>{payment.supplierName || 'Supplier'}</h3>
            <div style={{fontSize:12, color:'#666'}}>{payment.paidThrough ? `Paid Through: ${payment.paidThrough}` : ''}</div>
            <div style={{fontSize:12, color:'#666'}}>{payment.notes || ''}</div>
          </div>

          <div style={{textAlign:'right'}}>
            <div><strong>Ref:</strong> {payment.reference || `#${payment.id}`}</div>
            <div><strong>Date:</strong> {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : ''}</div>
            <div style={{marginTop:8, padding:'8px 12px', background:'#e6f9ed', borderRadius:6}}>
              <strong>Amount</strong><div style={{fontSize:18}}>{(payment.amount ?? 0).toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Allocations</h4>
          <table style={{width:'100%'}}>
            <thead><tr><th style={{textAlign:'left'}}>Invoice</th><th style={{textAlign:'right'}}>Allocated</th></tr></thead>
            <tbody>
              {(payment.allocations || []).map((a, idx) => (
                <tr key={idx}>
                  <td>
                    <button onClick={() => goToInvoice(a.invoiceId)} className="text-primary underline">{a.invoiceNumber || `#${a.invoiceId}`}</button>
                  </td>
                  <td style={{textAlign:'right'}}>{(a.allocatedAmount ?? 0).toFixed(2)}</td>
                </tr>
              ))}
              {(payment.allocations || []).length === 0 && <tr><td colSpan="2" className="text-foreground-muted py-4 text-center">No allocations</td></tr>}
            </tbody>
          </table>
        </div>

        {/* optional: attachments */}
        {payment.attachments && payment.attachments.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold">Attachments</h4>
            <ul className="mt-2">
              {payment.attachments.map((att, i) => (
                <li key={i}><a href={att.filePath || '#'} target="_blank" rel="noreferrer" className="text-primary underline">{att.fileName}</a></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
