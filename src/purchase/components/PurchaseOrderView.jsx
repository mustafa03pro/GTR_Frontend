// // PurchaseOrderView.jsx
// import React, { useEffect, useState } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { Loader } from 'lucide-react';

// const API_URL = import.meta.env.VITE_API_BASE_URL || '';

// const PurchaseOrderView = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [po, setPo] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (!id) return;
//     const load = async () => {
//       setLoading(true);
//       try {
//         const token = localStorage.getItem('token');
//         const res = await axios.get(`${API_URL}/purchase/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
//         setPo(res.data);
//       } catch (err) {
//         console.error('Failed to load PO', err);
//         setError('Unable to load purchase order.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [id]);

//   const openPrintWindow = (useLetterhead = false) => {
//     // build printable html (basic). You can enhance CSS/letterhead as needed.
//     const html = `
//       <html>
//         <head>
//           <title>Purchase Order ${po?.poNumber ?? ''}</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
//             .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
//             .company { font-weight:700; font-size:18px; }
//             table { width:100%; border-collapse: collapse; margin-top:10px; }
//             th,td { border:1px solid #ddd; padding:8px; text-align:left; font-size:13px; }
//             th { background:#f7f7f7; }
//             .right { text-align:right; }
//             .totals { margin-top:12px; width:300px; float:right; }
//           </style>
//         </head>
//         <body>
//           ${useLetterhead ? '<div style="border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:12px;"><strong>LETTERHEAD</strong></div>' : ''}
//           <div class="header">
//             <div>
//               <div class="company">${po?.supplierName ?? ''}</div>
//               <div>Ref: ${po?.reference ?? '-'}</div>
//             </div>
//             <div>
//               <div><strong>PO No:</strong> ${po?.poNumber ?? id}</div>
//               <div><strong>Date:</strong> ${po?.date ? new Date(po.date).toLocaleDateString() : ''}</div>
//             </div>
//           </div>

//           <table>
//             <thead>
//               <tr>
//                 <th>#</th><th>Item</th><th>Qty</th><th>Rate</th><th>Discount</th><th>Tax</th><th class="right">Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${ (po?.items || []).map((it, i) => `
//                 <tr>
//                   <td>${i+1}</td>
//                   <td>${it.itemName ?? it.description ?? '-'}</td>
//                   <td>${it.quantity ?? ''} ${it.unitName ?? ''}</td>
//                   <td>${(it.rate ?? 0).toFixed(2)}</td>
//                   <td>${(it.lineDiscount ?? 0).toFixed(2)}</td>
//                   <td>${(it.taxPercent ?? 0)}%</td>
//                   <td class="right">${(it.amount ?? 0).toFixed(2)}</td>
//                 </tr>
//               `).join('') }
//             </tbody>
//           </table>

//           <div class="totals">
//             <div><strong>Subtotal:</strong> ${(po?.subTotal ?? 0).toFixed(2)}</div>
//             <div><strong>Discount:</strong> ${(po?.totalDiscount ?? 0).toFixed(2)}</div>
//             <div><strong>Tax:</strong> ${(po?.totalTax ?? 0).toFixed(2)}</div>
//             <div style="font-size:16px;font-weight:700;margin-top:8px;"><strong>Total:</strong> ${(po?.totalAmount ?? 0).toFixed(2)} ${po?.currency ?? ''}</div>
//           </div>

//         </body>
//       </html>
//     `;
//     const w = window.open('', '_blank', 'toolbar=0,location=0,menubar=0');
//     w.document.write(html);
//     w.document.close();
//     // give it a short delay then trigger print
//     setTimeout(() => w.print(), 300);
//   };

//   const handleConvertToBill = async () => {
//     // Example: POST /purchase/orders/{id}/convert-to-bill
//     setActionLoading(true);
//     setError('');
//     try {
//       const token = localStorage.getItem('token');
//       // adapt endpoint to your backend. If not available, show helpful info.
//       await axios.post(`${API_URL}/purchase/orders/${id}/convert-to-bill`, null, { headers: { Authorization: `Bearer ${token}` } });
//       alert('Converted to bill successfully (if backend supports it).');
//       // reload PO or navigate to bill list as desired.
//     } catch (err) {
//       console.warn('convert-to-bill may not be implemented on backend', err);
//       alert('Convert to bill failed or endpoint not implemented. Check backend.');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleMoreAction = (action) => {
//     switch (action) {
//       case 'printLetterhead':
//         openPrintWindow(true);
//         break;
//       case 'email':
//         // fallback: prepare mailto with summary (you can implement server-side emailing)
//         window.location.href = `mailto:?subject=Purchase Order ${po?.poNumber ?? id}&body=Please find Purchase Order ${po?.poNumber ?? id}`;
//         break;
//       case 'downloadPdf':
//         // simple approach: use print window and user can to PDF; for server PDF generation call an API
//         openPrintWindow(false);
//         break;
//       default:
//         alert(`Action "${action}" selected. Implement as needed.`);
//     }
//   };

//   if (loading) return <div className="flex justify-center items-center h-64"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
//   if (!po) return <div className="p-6"> {error ? <div className="text-red-600">{error}</div> : <div>No purchase order found</div>} </div>;

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-4">
//         <div>
//           <h2 className="text-2xl font-semibold">Purchase Order {po.poNumber ?? `#${po.id}`}</h2>
//           <div className="text-sm text-foreground-muted">Created: {po.createdAt ? new Date(po.createdAt).toLocaleString() : ''}</div>
//         </div>

//         <div className="flex items-center gap-2">
//           <button onClick={() => openPrintWindow(false)} className="btn-secondary">Print</button>
//           <button onClick={() => openPrintWindow(true)} className="btn-secondary">Print On Letterhead</button>
//           <button onClick={handleConvertToBill} className="btn-primary" disabled={actionLoading}>{actionLoading ? 'Working...' : 'Convert to Bill'}</button>
//           <div className="relative">
//             <button className="btn-secondary">More ▾</button>
//             <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md p-2 z-50">
//               <button onClick={() => handleMoreAction('printLetterhead')} className="w-full text-left p-2 hover:bg-gray-50">Print On Letterhead</button>
//               <button onClick={() => handleMoreAction('downloadPdf')} className="w-full text-left p-2 hover:bg-gray-50">Download PDF</button>
//               <button onClick={() => handleMoreAction('email')} className="w-full text-left p-2 hover:bg-gray-50">Email</button>
//             </div>
//           </div>
//           <Link to={`/purchase-dashboard/purchase-orders/edit/${po.id}`} className="btn-secondary">Edit</Link>
//           <button onClick={() => navigate('/purchase-dashboard/purchase-orders')} className="btn-secondary">Back</button>
//         </div>
//       </div>

//       <div className="border p-4 rounded bg-white">
//         <div className="grid grid-cols-2 gap-4 mb-4">
//           <div>
//             <h3 className="font-semibold">Supplier</h3>
//             <div>{po.supplierName ?? '-'}</div>
//             <div className="text-sm text-foreground-muted">{po.supplierAddress ?? ''}</div>
//           </div>
//           <div>
//             <h3 className="font-semibold">PO Details</h3>
//             <div>PO#: {po.poNumber}</div>
//             <div>Date: {po.date ? new Date(po.date).toLocaleDateString() : ''}</div>
//             <div>Reference: {po.reference}</div>
//           </div>
//         </div>

//         <table className="min-w-full border-collapse">
//           <thead className="bg-background-muted">
//             <tr>
//               <th className="p-2 text-left">#</th>
//               <th className="p-2 text-left">Item / Description</th>
//               <th className="p-2 text-right">Qty</th>
//               <th className="p-2 text-right">Rate</th>
//               <th className="p-2 text-right">Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             {(po.items || []).map((it, i) => (
//               <tr key={i} className="border-b">
//                 <td className="p-2">{i+1}</td>
//                 <td className="p-2">{it.itemName ?? it.description ?? '-'}</td>
//                 <td className="p-2 text-right">{it.quantity ?? ''} {it.unitName ?? ''}</td>
//                 <td className="p-2 text-right">{(it.rate ?? 0).toFixed(2)}</td>
//                 <td className="p-2 text-right">{(it.amount ?? 0).toFixed(2)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <div className="mt-4 flex justify-end">
//           <div className="w-64">
//             <div className="flex justify-between"><span>Subtotal</span><span>{(po.subTotal ?? 0).toFixed(2)}</span></div>
//             <div className="flex justify-between"><span>Discount</span><span>{(po.totalDiscount ?? 0).toFixed(2)}</span></div>
//             <div className="flex justify-between"><span>Tax</span><span>{(po.totalTax ?? 0).toFixed(2)}</span></div>
//             <div className="border-t pt-2 mt-2 flex justify-between font-semibold"><span>Total</span><span>{(po.totalAmount ?? 0).toFixed(2)} {po.currency ?? ''}</span></div>
//           </div>
//         </div>

//         {po.attachments && po.attachments.length > 0 && (
//           <div className="mt-4">
//             <h4 className="font-semibold mb-2">Attachments</h4>
//             <ul className="space-y-1">
//               {po.attachments.map((a, idx) => (
//                 <li key={idx} className="text-sm">
//                   {a.fileName} {a.filePath ? (<a href={a.filePath} target="_blank" rel="noreferrer" className="text-primary underline">Open</a>) : null}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PurchaseOrderView;




// PurchaseOrderView.jsx
// import React, { useEffect, useState } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { Loader } from 'lucide-react';

// const API_URL = import.meta.env.VITE_API_BASE_URL || '';

// const PurchaseOrderView = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [po, setPo] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [grns, setGrns] = useState([]);
//   const [showGrnHistory, setShowGrnHistory] = useState(false);
//   const [grnLoading, setGrnLoading] = useState(false);

//   useEffect(() => {
//     if (!id) return;
//     const load = async () => {
//       setLoading(true);
//       try {
//         const token = localStorage.getItem('token');
//         const res = await axios.get(`${API_URL}/purchase/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
//         setPo(res.data);
//       } catch (err) {
//         console.error('Failed to load PO', err);
//         setError('Unable to load purchase order.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [id]);

//   const openPrintWindow = (useLetterhead = false) => {
//     const html = `
//       <html>
//         <head>
//           <title>Purchase Order ${po?.poNumber ?? ''}</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
//             .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
//             .company { font-weight:700; font-size:18px; }
//             table { width:100%; border-collapse: collapse; margin-top:10px; }
//             th,td { border:1px solid #ddd; padding:8px; text-align:left; font-size:13px; }
//             th { background:#f7f7f7; }
//             .right { text-align:right; }
//             .totals { margin-top:12px; width:300px; float:right; }
//           </style>
//         </head>
//         <body>
//           ${useLetterhead ? '<div style="border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:12px;"><strong>LETTERHEAD</strong></div>' : ''}
//           <div class="header">
//             <div>
//               <div class="company">${po?.supplierName ?? ''}</div>
//               <div>Ref: ${po?.reference ?? '-'}</div>
//             </div>
//             <div>
//               <div><strong>PO No:</strong> ${po?.poNumber ?? id}</div>
//               <div><strong>Date:</strong> ${po?.date ? new Date(po.date).toLocaleDateString() : ''}</div>
//             </div>
//           </div>

//           <table>
//             <thead>
//               <tr>
//                 <th>#</th><th>Item</th><th>Qty</th><th>Rate</th><th>Discount</th><th>Tax</th><th class="right">Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${ (po?.items || []).map((it, i) => `
//                 <tr>
//                   <td>${i+1}</td>
//                   <td>${it.itemName ?? it.description ?? '-'}</td>
//                   <td>${it.quantity ?? ''} ${it.unitName ?? ''}</td>
//                   <td>${(it.rate ?? 0).toFixed(2)}</td>
//                   <td>${(it.lineDiscount ?? 0).toFixed(2)}</td>
//                   <td>${(it.taxPercent ?? 0)}%</td>
//                   <td class="right">${(it.amount ?? 0).toFixed(2)}</td>
//                 </tr>
//               `).join('') }
//             </tbody>
//           </table>

//           <div class="totals">
//             <div><strong>Subtotal:</strong> ${(po?.subTotal ?? 0).toFixed(2)}</div>
//             <div><strong>Discount:</strong> ${(po?.totalDiscount ?? 0).toFixed(2)}</div>
//             <div><strong>Tax:</strong> ${(po?.totalTax ?? 0).toFixed(2)}</div>
//             <div style="font-size:16px;font-weight:700;margin-top:8px;"><strong>Total:</strong> ${(po?.totalAmount ?? 0).toFixed(2)} ${po?.currency ?? ''}</div>
//           </div>

//         </body>
//       </html>
//     `;
//     const w = window.open('', '_blank', 'toolbar=0,location=0,menubar=0');
//     if (!w) { alert('Popup blocked. Allow popups to print.'); return; }
//     w.document.write(html);
//     w.document.close();
//     setTimeout(() => w.print(), 300);
//   };

//   const handleConvertToBill = async () => {
//     setActionLoading(true);
//     setError('');
//     try {
//       const token = localStorage.getItem('token');
//       await axios.post(`${API_URL}/purchase/orders/${id}/convert-to-bill`, null, { headers: { Authorization: `Bearer ${token}` } });
//       alert('Converted to bill successfully (if backend supports it).');
//     } catch (err) {
//       console.warn('convert-to-bill may not be implemented on backend', err);
//       alert('Convert to bill failed or endpoint not implemented. Check backend.');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const openAddGrn = () => {
//     navigate(`/purchase-dashboard/purchase-orders/${id}/grn/new`);
//   };

//   const loadGrnHistory = async () => {
//     setGrnLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${API_URL}/purchase/grns/by-order/${id}`, { headers: { Authorization: `Bearer ${token}` } });
//       setGrns(res.data || []);
//       setShowGrnHistory(true);
//     } catch (err) {
//       console.error('Failed to load GRN history', err);
//       alert('Failed to load GRN history.');
//     } finally {
//       setGrnLoading(false);
//     }
//   };

//   if (loading) return <div className="flex justify-center items-center h-64"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
//   if (!po) return <div className="p-6"> {error ? <div className="text-red-600">{error}</div> : <div>No purchase order found</div>} </div>;

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-4">
//         <div>
//           <h2 className="text-2xl font-semibold">Purchase Order {po.poNumber ?? `#${po.id}`}</h2>
//           <div className="text-sm text-foreground-muted">Created: {po.createdAt ? new Date(po.createdAt).toLocaleString() : ''}</div>
//         </div>

//         <div className="flex items-center gap-2">
//           <button onClick={() => openPrintWindow(false)} className="btn-secondary">Print</button>
//           <button onClick={() => openPrintWindow(true)} className="btn-secondary">Print On Letterhead</button>

//           <button onClick={handleConvertToBill} className="btn-primary" disabled={actionLoading}>{actionLoading ? 'Working...' : 'Convert to Bill'}</button>

//           <button onClick={openAddGrn} className="btn-secondary">Add GRN</button>
//           <button onClick={loadGrnHistory} className="btn-secondary">{grnLoading ? 'Loading...' : 'View GRN History'}</button>

//           <Link to={`/purchase-dashboard/purchase-orders/edit/${po.id}`} className="btn-secondary">Edit</Link>
//           <button onClick={() => navigate('/purchase-dashboard/purchase-orders')} className="btn-secondary">Back</button>
//         </div>
//       </div>

//       <div className="border p-4 rounded bg-white">
//         {/* ... PO details & table (same as before) ... */}
//         <div className="grid grid-cols-2 gap-4 mb-4">
//           <div>
//             <h3 className="font-semibold">Supplier</h3>
//             <div>{po.supplierName ?? '-'}</div>
//             <div className="text-sm text-foreground-muted">{po.supplierAddress ?? ''}</div>
//           </div>
//           <div>
//             <h3 className="font-semibold">PO Details</h3>
//             <div>PO#: {po.poNumber}</div>
//             <div>Date: {po.date ? new Date(po.date).toLocaleDateString() : ''}</div>
//             <div>Reference: {po.reference}</div>
//           </div>
//         </div>

//         <table className="min-w-full border-collapse">
//           <thead className="bg-background-muted">
//             <tr>
//               <th className="p-2 text-left">#</th>
//               <th className="p-2 text-left">Item / Description</th>
//               <th className="p-2 text-right">Qty</th>
//               <th className="p-2 text-right">Rate</th>
//               <th className="p-2 text-right">Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             {(po.items || []).map((it, i) => (
//               <tr key={i} className="border-b">
//                 <td className="p-2">{i+1}</td>
//                 <td className="p-2">{it.itemName ?? it.description ?? '-'}</td>
//                 <td className="p-2 text-right">{it.quantity ?? ''} {it.unitName ?? ''}</td>
//                 <td className="p-2 text-right">{(it.rate ?? 0).toFixed(2)}</td>
//                 <td className="p-2 text-right">{(it.amount ?? 0).toFixed(2)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <div className="mt-4 flex justify-end">
//           <div className="w-64">
//             <div className="flex justify-between"><span>Subtotal</span><span>{(po.subTotal ?? 0).toFixed(2)}</span></div>
//             <div className="flex justify-between"><span>Discount</span><span>{(po.totalDiscount ?? 0).toFixed(2)}</span></div>
//             <div className="flex justify-between"><span>Tax</span><span>{(po.totalTax ?? 0).toFixed(2)}</span></div>
//             <div className="border-t pt-2 mt-2 flex justify-between font-semibold"><span>Total</span><span>{(po.totalAmount ?? 0).toFixed(2)} {po.currency ?? ''}</span></div>
//           </div>
//         </div>

//         {po.attachments && po.attachments.length > 0 && (
//           <div className="mt-4">
//             <h4 className="font-semibold mb-2">Attachments</h4>
//             <ul className="space-y-1">
//               {po.attachments.map((a, idx) => (
//                 <li key={idx} className="text-sm">
//                   {a.fileName} {a.filePath ? (<a href={a.filePath} target="_blank" rel="noreferrer" className="text-primary underline">Open</a>) : null}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>

//       {/* GRN History panel */}
//       {showGrnHistory && (
//         <div className="mt-6 bg-white border rounded p-4">
//           <div className="flex justify-between items-center mb-3">
//             <h3 className="font-semibold">GRN History</h3>
//             <button onClick={() => setShowGrnHistory(false)} className="btn-secondary">Close</button>
//           </div>

//           {grns.length === 0 ? (
//             <div className="text-sm text-foreground-muted">No GRNs recorded for this PO.</div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full">
//                 <thead className="bg-background-muted">
//                   <tr><th className="th-cell">GRN#</th><th className="th-cell">Date</th><th className="th-cell">Items</th><th className="th-cell">Actions</th></tr>
//                 </thead>
//                 <tbody>
//                   {grns.map(g => (
//                     <tr key={g.id} className="border-b">
//                       <td className="td-cell font-medium">{g.grnNumber}</td>
//                       <td className="td-cell">{g.grnDate}</td>
//                       <td className="td-cell">
//                         {(g.items || []).map(it => (
//                           <div key={it.id} className="text-sm">{it.itemName || it.description || '--'} — {it.receivedQuantity}</div>
//                         ))}
//                       </td>
//                       <td className="td-cell">
//                         {/* If you have a print endpoint you can open it; else you can implement in-frontend print */}
//                         <button onClick={() => window.open(`${API_URL}/purchase/grns/${g.id}/print`, '_blank')} className="btn-secondary mr-2">Print</button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default PurchaseOrderView;



// // PurchaseOrderView.jsx
// import React, { useEffect, useState } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { Loader } from 'lucide-react';

// const API_URL = import.meta.env.VITE_API_BASE_URL || '';

// const PurchaseOrderView = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [po, setPo] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [grns, setGrns] = useState([]);
//   const [showGrnHistory, setShowGrnHistory] = useState(false);
//   const [grnLoading, setGrnLoading] = useState(false);
//   const [showMore, setShowMore] = useState(false);

//   useEffect(() => {
//     if (!id) return;
//     const load = async () => {
//       setLoading(true);
//       try {
//         const token = localStorage.getItem('token');
//         const res = await axios.get(`${API_URL}/purchase/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
//         setPo(res.data);
//       } catch (err) {
//         console.error('Failed to load PO', err);
//         setError('Unable to load purchase order.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [id]);

//   const openPrintWindow = (useLetterhead = false) => {
//     const html = `
//       <html>
//         <head>
//           <title>Purchase Order ${po?.poNumber ?? ''}</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
//             .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
//             .company { font-weight:700; font-size:18px; }
//             table { width:100%; border-collapse: collapse; margin-top:10px; }
//             th,td { border:1px solid #ddd; padding:8px; text-align:left; font-size:13px; }
//             th { background:#f7f7f7; }
//             .right { text-align:right; }
//             .totals { margin-top:12px; width:300px; float:right; }
//           </style>
//           <link rel="stylesheet" href="/path/to/your/main.css"> <!-- Optional: Link to your main stylesheet for consistency -->

//         </head>
//         <body>
//           ${useLetterhead ? '<div style="border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:12px;"><strong>LETTERHEAD</strong></div>' : ''}
//           <div class="header">
//             <div>
//               <div class="company">${po?.supplierName ?? ''}</div>
//               <div>Ref: ${po?.reference ?? '-'}</div>
//             </div>
//             <div>
//               <div><strong>PO No:</strong> ${po?.poNumber ?? id}</div>
//               <div><strong>Date:</strong> ${po?.date ? new Date(po.date).toLocaleDateString() : ''}</div>
//             </div>
//           </div>

//           <table>
//             <thead>
//               <tr>
//                 <th>#</th><th>Item</th><th>Qty</th><th>Rate</th><th>Discount</th><th>Tax</th><th class="right">Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${ (po?.items || []).map((it, i) => `
//                 <tr>
//                   <td>${i+1}</td>
//                   <td>${it.itemName ?? it.description ?? '-'}</td>
//                   <td>${it.quantity ?? ''} ${it.unitName ?? ''}</td>
//                   <td>${(it.rate ?? 0).toFixed(2)}</td>
//                   <td>${(it.lineDiscount ?? 0).toFixed(2)}</td>
//                   <td>${(it.taxPercent ?? 0)}%</td>
//                   <td class="right">${(it.amount ?? 0).toFixed(2)}</td>
//                 </tr>
//               `).join('') }
//             </tbody>
//           </table>

//           <div class="totals">
//             <div><strong>Subtotal:</strong> ${(po?.subTotal ?? 0).toFixed(2)}</div>
//             <div><strong>Discount:</strong> ${(po?.totalDiscount ?? 0).toFixed(2)}</div>
//             <div><strong>Tax:</strong> ${(po?.totalTax ?? 0).toFixed(2)}</div>
//             <div style="font-size:16px;font-weight:700;margin-top:8px;"><strong>Total:</strong> ${(po?.totalAmount ?? 0).toFixed(2)} ${po?.currency ?? ''}</div>
//           </div>

//         </body>
//       </html>
//     `;
//     const w = window.open('', '_blank', 'toolbar=0,location=0,menubar=0');
//     if (!w) { alert('Popup blocked. Allow popups to print.'); return; }
//     w.document.write(html);
//     w.document.close();
//     setTimeout(() => w.print(), 300);
//   };

//   const handleConvertToBill = async () => {
//     setActionLoading(true);
//     setError('');
//     try {
//       const token = localStorage.getItem('token');
//       await axios.post(`${API_URL}/purchase/orders/${id}/convert-to-bill`, null, { headers: { Authorization: `Bearer ${token}` } });
//       alert('Converted to bill successfully (if backend supports it).');
//     } catch (err) {
//       console.warn('convert-to-bill may not be implemented on backend', err);
//       alert('Convert to bill failed or endpoint not implemented. Check backend.');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const openAddGrn = () => {
//     navigate(`/purchase-dashboard/purchase-orders/${id}/grn/new`);
//   };

//   const loadGrnHistory = async () => {
//     setGrnLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${API_URL}/purchase/grns/by-order/${id}`, { headers: { Authorization: `Bearer ${token}` } });
//       setGrns(res.data || []);
//       setShowGrnHistory(true);
//     } catch (err) {
//       console.error('Failed to load GRN history', err);
//       alert('Failed to load GRN history.');
//     } finally {
//       setGrnLoading(false);
//     }
//   };

//   const handleMoreAction = (action) => {
//     setShowMore(false); // Close dropdown after action
//     switch (action) {
//       case 'print':
//         openPrintWindow(false);
//         break;
//       case 'printLetterhead':
//         openPrintWindow(true);
//         break;
//       case 'email':
//         window.location.href = `mailto:?subject=Purchase Order ${po?.poNumber ?? id}&body=Please find attached Purchase Order ${po?.poNumber ?? id}.`;
//         break;
//       default:
//         alert(`Action "${action}" is not implemented.`);
//     }
//   };

//   if (loading) return <div className="flex justify-center items-center h-64"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
//   if (!po) return <div className="p-6"> {error ? <div className="text-red-600">{error}</div> : <div>No purchase order found</div>} </div>;

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-4">
//         <div>
//           <h2 className="text-2xl font-semibold">Purchase Order {po.poNumber ?? `#${po.id}`}</h2>
//           <div className="text-sm text-foreground-muted">Created: {po.createdAt ? new Date(po.createdAt).toLocaleString() : ''}</div>
//         </div>

//         <div className="flex items-center gap-2">
//           <button onClick={openAddGrn} className="btn-secondary">Add GRN</button>
//           <button onClick={loadGrnHistory} className="btn-secondary">{grnLoading ? 'Loading...' : 'View GRN History'}</button>
//           <button onClick={handleConvertToBill} className="btn-primary" disabled={actionLoading}>{actionLoading ? 'Working...' : 'Convert to Bill'}</button>
//           <Link to={`/purchase-dashboard/purchase-orders/edit/${po.id}`} className="btn-secondary">Edit</Link>
//           <div className="relative">
//             <button onClick={() => setShowMore(!showMore)} className="btn-secondary">More ▾</button>
//             {showMore && (
//               <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg p-1 z-50" onMouseLeave={() => setShowMore(false)}>
//                 <button onClick={() => handleMoreAction('print')} className="w-full text-left p-2 text-sm hover:bg-gray-100 rounded">Print</button>
//                 <button onClick={() => handleMoreAction('printLetterhead')} className="w-full text-left p-2 text-sm hover:bg-gray-100 rounded">Print on Letterhead</button>
//                 <button onClick={() => handleMoreAction('email')} className="w-full text-left p-2 text-sm hover:bg-gray-100 rounded">Email PO</button>
//               </div>
//             )}
//           </div>

//           <button onClick={() => navigate('/purchase-dashboard/purchase-orders')} className="btn-secondary">Back</button>
//         </div>
//       </div>

//       <div className="border p-4 rounded bg-white">
//         <div className="grid grid-cols-2 gap-4 mb-4">
//           <div>
//             <h3 className="font-semibold">Supplier</h3>
//             <div>{po.supplierName ?? '-'}</div>
//             <div className="text-sm text-foreground-muted">{po.supplierAddress ?? ''}</div>
//           </div>
//           <div>
//             <h3 className="font-semibold">PO Details</h3>
//             <div>PO#: {po.poNumber}</div>
//             <div>Date: {po.date ? new Date(po.date).toLocaleDateString() : ''}</div>
//             <div>Reference: {po.reference}</div>
//           </div>
//         </div>

//         <table className="min-w-full border-collapse">
//           <thead className="bg-background-muted">
//             <tr>
//               <th className="p-2 text-left">#</th>
//               <th className="p-2 text-left">Item / Description</th>
//               <th className="p-2 text-right">Qty</th>
//               <th className="p-2 text-right">Rate</th>
//               <th className="p-2 text-right">Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             {(po.items || []).map((it, i) => (
//               <tr key={i} className="border-b">
//                 <td className="p-2">{i+1}</td>
//                 <td className="p-2">{it.itemName ?? it.description ?? '-'}</td>
//                 <td className="p-2 text-right">{it.quantity ?? ''} {it.unitName ?? ''}</td>
//                 <td className="p-2 text-right">{(it.rate ?? 0).toFixed(2)}</td>
//                 <td className="p-2 text-right">{(it.amount ?? 0).toFixed(2)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <div className="mt-4 flex justify-end">
//           <div className="w-64">
//             <div className="flex justify-between"><span>Subtotal</span><span>{(po.subTotal ?? 0).toFixed(2)}</span></div>
//             <div className="flex justify-between"><span>Discount</span><span>{(po.totalDiscount ?? 0).toFixed(2)}</span></div>
//             <div className="flex justify-between"><span>Tax</span><span>{(po.totalTax ?? 0).toFixed(2)}</span></div>
//             <div className="border-t pt-2 mt-2 flex justify-between font-semibold"><span>Total</span><span>{(po.totalAmount ?? 0).toFixed(2)} {po.currency ?? ''}</span></div>
//           </div>
//         </div>

//         {po.attachments && po.attachments.length > 0 && (
//           <div className="mt-4">
//             <h4 className="font-semibold mb-2">Attachments</h4>
//             <ul className="space-y-1">
//               {po.attachments.map((a, idx) => (
//                 <li key={idx} className="text-sm">
//                   {a.fileName} {a.filePath ? (<a href={a.filePath} target="_blank" rel="noreferrer" className="text-primary underline">Open</a>) : null}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>

//       {/* GRN History panel */}
//       {showGrnHistory && (
//         <div className="mt-6 bg-white border rounded p-4">
//           <div className="flex justify-between items-center mb-3">
//             <h3 className="font-semibold">GRN History</h3>
//             <button onClick={() => setShowGrnHistory(false)} className="btn-secondary">Close</button>
//           </div>

//           {grns.length === 0 ? (
//             <div className="text-sm text-foreground-muted">No GRNs recorded for this PO.</div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full">
//                 <thead className="bg-gray-100">
//                   <tr>
//                     <th className="p-2 text-left text-sm font-semibold text-gray-600">GRN#</th>
//                     <th className="p-2 text-left text-sm font-semibold text-gray-600">Date</th>
//                     <th className="p-2 text-left text-sm font-semibold text-gray-600">Items</th>
//                     <th className="p-2 text-left text-sm font-semibold text-gray-600">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {grns.map(g => (
//                     <tr key={g.id} className="border-b">
//                       <td className="p-2 align-top font-medium">{g.grnNumber}</td>
//                       <td className="p-2 align-top">{g.grnDate ? new Date(g.grnDate).toLocaleDateString() : ''}</td>
//                       <td className="p-2 align-top">
//                         {(g.items || []).map(it => (
//                           <div key={it.id} className="text-sm">{it.itemName || it.description || '--'} — Received: {it.receivedQuantity}</div>
//                         ))}
//                       </td>
//                       <td className="p-2 align-top">
//                         <button onClick={() => navigate(`/purchase-dashboard/grns/${g.id}`)} className="btn-secondary mr-2">View</button>
//                         <button onClick={() => window.open(`${API_URL}/purchase/grns/${g.id}/print`, '_blank')} className="btn-secondary">Print</button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default PurchaseOrderView;



// PurchaseOrderView.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const PurchaseOrderView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [grns, setGrns] = useState([]);
  const [showGrnHistory, setShowGrnHistory] = useState(false);
  const [grnLoading, setGrnLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenantId'); // if your app stores tenant here
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (tenantId) headers['X-Tenant-ID'] = tenantId;
    return headers;
  };

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/purchase/orders/${id}`, { headers: getAuthHeaders() });
        setPo(res.data);
      } catch (err) {
        if (err.response) {
          console.error('Failed to load PO', err.response.status, err.response.data);
        } else if (err.request) {
          console.error('No response when loading PO', err.request);
        } else {
          console.error('Error loading PO', err.message);
        }
        setError('Unable to load purchase order.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const openPrintWindow = (useLetterhead = false) => {
    if (!po) {
      alert('Nothing to print (purchase order not loaded).');
      return;
    }

    const rows = (po.items || []).map((it, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${(it.itemName ?? it.description ?? '-')}</td>
        <td>${it.quantity ?? ''} ${it.unitName ?? ''}</td>
        <td>${(it.rate ?? 0).toFixed(2)}</td>
        <td>${(it.lineDiscount ?? 0).toFixed(2)}</td>
        <td>${(it.taxPercent ?? 0)}%</td>
        <td class="right">${(it.amount ?? 0).toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Purchase Order ${po?.poNumber ?? ''}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
          .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
          .company { font-weight:700; font-size:18px; }
          table { width:100%; border-collapse: collapse; margin-top:10px; }
          th,td { border:1px solid #ddd; padding:8px; text-align:left; font-size:13px; }
          th { background:#f7f7f7; }
          .right { text-align:right; }
          .totals { margin-top:12px; width:300px; float:right; }
        </style>
      </head>
      <body>
        ${useLetterhead ? '<div style="border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:12px;"><strong>LETTERHEAD</strong></div>' : ''}
        <div class="header">
          <div>
            <div class="company">${po?.supplierName ?? ''}</div>
            <div>Ref: ${po?.reference ?? '-'}</div>
          </div>
          <div>
            <div><strong>PO No:</strong> ${po?.poNumber ?? id}</div>
            <div><strong>Date:</strong> ${po?.date ? new Date(po.date).toLocaleDateString() : ''}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th><th>Item</th><th>Qty</th><th>Rate</th><th>Discount</th><th>Tax</th><th class="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="totals">
          <div><strong>Subtotal:</strong> ${(po?.subTotal ?? 0).toFixed(2)}</div>
          <div><strong>Discount:</strong> ${(po?.totalDiscount ?? 0).toFixed(2)}</div>
          <div><strong>Tax:</strong> ${(po?.totalTax ?? 0).toFixed(2)}</div>
          <div style="font-size:16px;font-weight:700;margin-top:8px;"><strong>Total:</strong> ${(po?.totalAmount ?? 0).toFixed(2)} ${po?.currency ?? ''}</div>
        </div>

      </body>
      </html>`;

    const w = window.open('', '_blank', 'toolbar=0,location=0,menubar=0');
    if (!w) { alert('Popup blocked. Allow popups to print.'); return; }
    w.document.write(html);
    w.document.close();
    try {
      w.focus();
      // give browser a moment to render the new doc
      setTimeout(() => w.print(), 400);
    } catch (e) {
      // some browsers block print() or cross-origin issues may happen
      console.warn('Print invocation failed', e);
    }
  };

  const handleConvertToBill = async () => {
    setActionLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/purchase/orders/${id}/convert-to-bill`, null, { headers: getAuthHeaders() });
      alert('Converted to bill successfully (if backend supports it).');
    } catch (err) {
      if (err.response) {
        console.warn('convert-to-bill response', err.response.status, err.response.data);
        if (err.response.status === 404) {
          alert('Convert-to-bill endpoint not implemented on backend (404).');
        } else {
          alert('Convert to bill failed: ' + (err.response.data?.error || err.response.status));
        }
      } else {
        console.warn('convert-to-bill request error', err);
        alert('Convert to bill failed (network or CORS).');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const openAddGrn = () => {
    navigate(`/purchase-dashboard/purchase-orders/${id}/grn/new`);
  };

  const loadGrnHistory = async () => {
    setGrnLoading(true);
    try {
      const res = await axios.get(`${API_URL}/purchase/grns/by-order/${id}`, { headers: getAuthHeaders() });
      setGrns(res.data || []);
      setShowGrnHistory(true);
    } catch (err) {
      if (err.response) {
        console.error('Failed to load GRN history', err.response.status, err.response.data);
      } else {
        console.error('Failed to load GRN history', err);
      }
      alert('Failed to load GRN history.');
    } finally {
      setGrnLoading(false);
    }
  };

  const handleMoreAction = (action) => {
    setShowMore(false); // Close dropdown after action
    switch (action) {
      case 'print':
        openPrintWindow(false);
        break;
      case 'printLetterhead':
        openPrintWindow(true);
        break;
      case 'email':
        window.location.href = `mailto:?subject=Purchase Order ${po?.poNumber ?? id}&body=Please find attached Purchase Order ${po?.poNumber ?? id}.`;
        break;
      default:
        alert(`Action "${action}" is not implemented.`);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
  if (!po) return <div className="p-6"> {error ? <div className="text-red-600">{error}</div> : <div>No purchase order found</div>} </div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Purchase Order {po.poNumber ?? `#${po.id}`}</h2>
          <div className="text-sm text-foreground-muted">Created: {po.createdAt ? new Date(po.createdAt).toLocaleString() : ''}</div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={openAddGrn} className="btn-secondary">Add GRN</button>
          <button onClick={loadGrnHistory} className="btn-secondary">{grnLoading ? 'Loading...' : 'View GRN History'}</button>
          <button onClick={handleConvertToBill} className="btn-primary" disabled={actionLoading}>{actionLoading ? 'Working...' : 'Convert to Bill'}</button>
          <Link to={`/purchase-dashboard/purchase-orders/edit/${po.id}`} className="btn-secondary">Edit</Link>
          <div className="relative">
            <button onClick={() => setShowMore(!showMore)} className="btn-secondary">More ▾</button>
            {showMore && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg p-1 z-50" onMouseLeave={() => setShowMore(false)}>
                <button onClick={() => handleMoreAction('print')} className="w-full text-left p-2 text-sm hover:bg-gray-100 rounded">Print</button>
                <button onClick={() => handleMoreAction('printLetterhead')} className="w-full text-left p-2 text-sm hover:bg-gray-100 rounded">Print on Letterhead</button>
                <button onClick={() => handleMoreAction('email')} className="w-full text-left p-2 text-sm hover:bg-gray-100 rounded">Email PO</button>
              </div>
            )}
          </div>

          <button onClick={() => navigate('/purchase-dashboard/purchase-orders')} className="btn-secondary">Back</button>
        </div>
      </div>

      <div className="border p-4 rounded bg-white">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-semibold">Supplier</h3>
            <div>{po.supplierName ?? '-'}</div>
            <div className="text-sm text-foreground-muted">{po.supplierAddress ?? ''}</div>
          </div>
          <div>
            <h3 className="font-semibold">PO Details</h3>
            <div>PO#: {po.poNumber}</div>
            <div>Date: {po.date ? new Date(po.date).toLocaleDateString() : ''}</div>
            <div>Reference: {po.reference}</div>
          </div>
        </div>

        <table className="min-w-full border-collapse">
          <thead className="bg-background-muted">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Item / Description</th>
              <th className="p-2 text-right">Qty</th>
              <th className="p-2 text-right">Rate</th>
              <th className="p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(po.items || []).map((it, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{it.itemName ?? it.description ?? '-'}</td>
                <td className="p-2 text-right">{it.quantity ?? ''} {it.unitName ?? ''}</td>
                <td className="p-2 text-right">{(it.rate ?? 0).toFixed(2)}</td>
                <td className="p-2 text-right">{(it.amount ?? 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-64">
            <div className="flex justify-between"><span>Subtotal</span><span>{(po.subTotal ?? 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>{(po.totalDiscount ?? 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{(po.totalTax ?? 0).toFixed(2)}</span></div>
            <div className="border-t pt-2 mt-2 flex justify-between font-semibold"><span>Total</span><span>{(po.totalAmount ?? 0).toFixed(2)} {po.currency ?? ''}</span></div>
          </div>
        </div>

        {po.attachments && po.attachments.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Attachments</h4>
            <ul className="space-y-1">
              {po.attachments.map((a, idx) => (
                <li key={idx} className="text-sm">
                  {a.fileName} {a.filePath ? (<a href={a.filePath} target="_blank" rel="noreferrer" className="text-primary underline">Open</a>) : null}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* GRN History panel */}
      {showGrnHistory && (
        <div className="mt-6 bg-white border rounded p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">GRN History</h3>
            <button onClick={() => setShowGrnHistory(false)} className="btn-secondary">Close</button>
          </div>

          {grns.length === 0 ? (
            <div className="text-sm text-foreground-muted">No GRNs recorded for this PO.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left text-sm font-semibold text-gray-600">GRN#</th>
                    <th className="p-2 text-left text-sm font-semibold text-gray-600">Date</th>
                    <th className="p-2 text-left text-sm font-semibold text-gray-600">Items</th>
                    <th className="p-2 text-left text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grns.map(g => (
                    <tr key={g.id} className="border-b">
                      <td className="p-2 align-top font-medium">{g.grnNumber}</td>
                      <td className="p-2 align-top">{g.grnDate ? new Date(g.grnDate).toLocaleDateString() : ''}</td>
                      <td className="p-2 align-top">
                        {(g.items || []).map(it => (
                          <div key={it.id} className="text-sm">{it.itemName || it.description || '--'} — Received: {it.receivedQuantity}</div>
                        ))}
                      </td>
                      <td className="p-2 align-top">
                        <button onClick={() => navigate(`/purchase-dashboard/grns/${g.id}`)} className="btn-secondary mr-2">View</button>
                        <button onClick={() => window.open(`${API_URL}/api/purchase/grns/${g.id}/print`, '_blank')} className="btn-secondary">Print</button> 
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderView;
