// PurchaseInvoiceView.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Printer, CreditCard, MoreVertical, Edit, Loader } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

const ActionBtn = ({ children, onClick, className = '' }) => (
  <button type="button" onClick={onClick} className={`btn-secondary flex items-center gap-2 ${className}`}>
    {children}
  </button>
);

const PurchaseInvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printableRef = useRef(null);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/purchases/invoices/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInvoice(res.data);
      } catch (err) {
        console.error('Failed to load invoice', err);
        setError('Failed to load invoice. Make sure the backend endpoint exists and you are authenticated.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onPrint = (useLetterhead = false) => {
    // print the printableRef contents in a new window
    if (!printableRef.current) return;
    const html = printableRef.current.innerHTML;
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>Print - ${invoice?.billNumber || 'Invoice'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #111 }
            .receipt { width: 100%; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 6px 8px; border: 1px solid #ccc; }
            .right { text-align: right; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>`);
    w.document.close();
    w.focus();
    // wait a tick for resources then print
    setTimeout(() => { w.print(); /* w.close(); */ }, 300);
  };

  const onRecordPayment = () => {
    // navigate to new payment page with invoice info in query string so Payment form can prefill
    const amount = invoice?.netTotal ?? 0;
    navigate(`/purchase-dashboard/payments/new?invoiceId=${id}&amount=${amount}`);
  };

  const onConvert = () => {
    // placeholder for "Convert to ..." actions, implement backend call if needed
    alert('Convert action clicked — implement backend call here.');
  };

  const handleMoreAction = (action) => {
    setIsMoreMenuOpen(false); // Close dropdown
    if (action === 'print') onPrint(false);
    else if (action === 'printLetterhead') onPrint(true);
    else if (action === 'email') {
      window.location.href = `mailto:?subject=Invoice ${invoice?.billNumber || id}&body=Please find attached invoice ${invoice?.billNumber || id}.`;
    }
    else onConvert();
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
  if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>;
  if (!invoice) return null;

  return (
    <div className="bg-card p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/purchase-dashboard/bills')} className="btn-secondary flex items-center gap-2"><ArrowLeft /> Back to List</button>
          <h1 className="text-2xl font-bold">{`Bill ${invoice.billNumber || ''}`}</h1>
        </div>

        <div className="flex items-center gap-2">
          <ActionBtn onClick={() => navigate(`/purchase-dashboard/bills/edit/${id}`)}><Edit /> Edit</ActionBtn>
          <ActionBtn onClick={onRecordPayment}><CreditCard /> Record Payment</ActionBtn>
          <div className="relative" ref={moreMenuRef}>
            <button onClick={() => setIsMoreMenuOpen(prev => !prev)} className="btn-secondary flex items-center gap-2"><MoreVertical /> More</button>
            {isMoreMenuOpen && (
              <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg w-48 z-10">
                <button onClick={() => handleMoreAction('print')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Print</button>
                <button onClick={() => handleMoreAction('printLetterhead')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Print on Letterhead</button>
                <button onClick={() => handleMoreAction('email')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Email</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audit / status */}
      <div className="mb-4 text-sm text-foreground-muted">Created: {invoice.createdAt ? new Date(invoice.createdAt).toLocaleString() : '-'}</div>

      {/* Printable area */}
      <div ref={printableRef} className="bg-white p-6 border border-border rounded">
        {/* Simple receipt layout — adapt/replace with your actual print template */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="font-bold text-lg">{invoice.supplierName || 'Supplier'}</div>
            <div className="text-sm text-foreground-muted">{invoice.supplierAddress || ''}</div>
          </div>
          <div className="text-right">
            <div><strong>Bill No:</strong> {invoice.billNumber}</div>
            <div><strong>Date:</strong> {invoice.billDate ? new Date(invoice.billDate).toLocaleDateString() : ''}</div>
            <div><strong>Due:</strong> {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</div>
          </div>
        </div>

        <table className="min-w-full mb-4">
          <thead>
            <tr className="bg-background-muted">
              <th className="text-left py-2 px-3">#</th>
              <th className="text-left py-2 px-3">Item</th>
              <th className="text-right py-2 px-3">Qty</th>
              <th className="text-right py-2 px-3">Rate</th>
              <th className="text-right py-2 px-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.lines || []).map((l, idx) => (
              <tr key={idx}>
                <td className="py-2 px-3">{l.lineNumber}</td>
                <td className="py-2 px-3">{l.itemName || l.description || '-'}</td>
                <td className="py-2 px-3 text-right">{(l.quantityNet ?? l.quantity ?? 0)}</td>
                <td className="py-2 px-3 text-right">{(l.rate ?? 0).toFixed(2)}</td>
                <td className="py-2 px-3 text-right">{(l.amount ?? 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between"><span>Subtotal</span><span>{(invoice.subTotal ?? 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Total Discount</span><span>{(invoice.totalDiscount ?? 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Total Tax</span><span>{(invoice.totalTax ?? 0).toFixed(2)}</span></div>
            <div className="flex justify-between border-t pt-2 mt-2"><strong>Total</strong><strong>{(invoice.netTotal ?? invoice.totalAmount ?? 0).toFixed(2)}</strong></div>
          </div>
        </div>

        {/* attachments (simple list) */}
        {invoice.attachments && invoice.attachments.length > 0 && (
          <div className="mt-4">
            <strong>Attachments</strong>
            <ul className="list-disc ml-6">
              {invoice.attachments.map((a, i) => <li key={i}>{a.fileName}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* optional: small footer / operations */}
      <div className="mt-6 text-sm text-foreground-muted">Operations: print / record payment / convert are available here (implement server side for convert).</div>
    </div>
  );
};

export default PurchaseInvoiceView;
