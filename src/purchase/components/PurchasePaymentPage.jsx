// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { PlusCircle, Edit, Trash2, Loader, AlertCircle, Search } from 'lucide-react';

// const API_URL = import.meta.env.VITE_API_BASE_URL;

// const PurchasePaymentPage = () => {
//     const [payments, setPayments] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [searchTerm, setSearchTerm] = useState('');
//     const navigate = useNavigate();

//     const fetchPayments = async () => {
//         setLoading(true);
//         setError('');
//         try {
//             const token = localStorage.getItem('token');
//             const response = await axios.get(`${API_URL}/purchases/payments`, {
//                 headers: { "Authorization": `Bearer ${token}` },
//                 params: { page: 0, size: 100, sort: 'paymentDate,desc' }
//             });
//             setPayments(response.data.content);
//         } catch (err) {
//             console.error("Failed to fetch purchase payments:", err);
//             setError('Failed to fetch payments. Please try again later.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchPayments();
//     }, []);

//     const handleDelete = async (id) => {
//         if (window.confirm('Are you sure you want to delete this payment?')) {
//             try {
//                 const token = localStorage.getItem('token');
//                 await axios.delete(`${API_URL}/purchases/payments/${id}`, {
//                     headers: { "Authorization": `Bearer ${token}` }
//                 });
//                 fetchPayments(); // Refresh the list
//             } catch (err) {
//                 console.error("Failed to delete payment:", err);
//                 setError('Failed to delete payment.');
//             }
//         }
//     };

//     const filteredPayments = payments.filter(p =>
//         (p.reference && p.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
//         (p.supplierName && p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()))
//     );

//     return (
//         <div className="p-6 md:p-8">
//             <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
//                 <h1 className="text-3xl font-bold text-foreground">Payments Made</h1>
//                 <div className="flex items-center gap-2">
//                     <div className="relative">
//                         <input
//                             type="text"
//                             placeholder="Search by Ref# or Supplier..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className="input w-full sm:w-64 pr-10 bg-background-muted border-border"
//                         />
//                         <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
//                     </div>
//                     <Link to="/purchase-dashboard/payments/new" className="btn-primary flex items-center gap-2">
//                         <PlusCircle size={18} /> New Payment
//                     </Link>
//                 </div>
//             </div>

//             {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span className="block sm:inline">{error}</span></div>}

//             <div className="bg-card text-card-foreground rounded-xl shadow-sm overflow-hidden">
//                 {loading ? (
//                     <div className="flex justify-center items-center h-80"><Loader className="h-8 w-8 animate-spin text-primary" /></div>
//                 ) : (
//                     <div className="overflow-x-auto">
//                         <table className="min-w-full">
//                             <thead className="bg-background-muted">
//                                 <tr>
//                                     <th className="th-cell">Payment Date</th>
//                                     <th className="th-cell">Reference #</th>
//                                     <th className="th-cell">Supplier</th>
//                                     <th className="th-cell">Payment Mode</th>
//                                     <th className="th-cell text-right">Amount</th>
//                                     <th className="th-cell">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="text-foreground-muted">
//                                 {filteredPayments.length > 0 ? (
//                                     filteredPayments.map(p => (
//                                         <tr key={p.id} className="border-b border-border hover:bg-background-muted">
//                                             <td className="td-cell">{new Date(p.paymentDate).toLocaleDateString()}</td>
//                                             <td className="td-cell font-medium text-foreground">{p.reference}</td>
//                                             <td className="td-cell">{p.supplierName}</td>
//                                             <td className="td-cell">{p.paymentMode}</td>
//                                             <td className="td-cell text-right font-mono">{p.amount.toFixed(2)}</td>
//                                             <td className="td-cell">
//                                                 <div className="flex items-center gap-1">
//                                                     <button onClick={() => navigate(`/purchase-dashboard/payments/edit/${p.id}`)} className="p-2 hover:text-primary hover:bg-background-muted rounded-full" title="Edit"><Edit className="h-4 w-4" /></button>
//                                                     <button onClick={() => handleDelete(p.id)} className="p-2 hover:text-red-600 hover:bg-background-muted rounded-full" title="Delete"><Trash2 className="h-4 w-4" /></button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 ) : (
//                                     <tr><td colSpan="6" className="text-center py-10 text-foreground-muted"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No payments found</h3><p className="mt-1 text-sm">Get started by creating a new payment.</p></td></tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default PurchasePaymentPage;



// PurchasePaymentPage.jsx
// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { PlusCircle, Edit, Trash2, Loader, AlertCircle, Search } from 'lucide-react';

// const API_URL = import.meta.env.VITE_API_BASE_URL;

// const PurchasePaymentPage = () => {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [search, setSearch] = useState('');
//   const navigate = useNavigate();

//   const fetchPayments = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${API_URL}/purchases/payments`, {
//         headers: { Authorization: `Bearer ${token}` },
//         params: { page: 0, size: 200, sort: 'paymentDate,desc' }
//       });
//       setPayments(res.data.content || []);
//     } catch (err) {
//       console.error('Failed to fetch payments', err);
//       setError('Failed to fetch payments.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchPayments(); }, []);

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this payment?')) return;
//     try {
//       const token = localStorage.getItem('token');
//       await axios.delete(`${API_URL}/purchases/payments/${id}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setPayments(prev => prev.filter(p => p.id !== id));
//     } catch (err) {
//       console.error('Failed to delete payment', err);
//       setError('Failed to delete payment.');
//     }
//   };

//   const filtered = payments.filter(p =>
//     (p.reference && p.reference.toLowerCase().includes(search.toLowerCase())) ||
//     (p.supplierName && p.supplierName.toLowerCase().includes(search.toLowerCase()))
//   );

//   return (
//     <div className="p-6 md:p-8">
//       <div className="flex justify-between items-center mb-6 gap-4">
//         <h1 className="text-3xl font-bold">Purchase Payments</h1>
//         <div className="flex items-center gap-2">
//           <div className="relative">
//             <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Supplier or Ref" className="input pr-10 w-64" />
//             <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
//           </div>
//           <Link to="/purchase-dashboard/payments/new" className="btn-primary flex items-center gap-2"><PlusCircle size={18} /> New Payment</Link>
//         </div>
//       </div>

//       {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

//       <div className="bg-card rounded-xl shadow-sm overflow-hidden">
//         {loading ? (
//           <div className="flex justify-center items-center h-64"><Loader className="h-8 w-8 animate-spin" /></div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="bg-background-muted">
//                 <tr>
//                   <th className="th-cell">Date</th>
//                   <th className="th-cell">Supplier</th>
//                   <th className="th-cell">Amount</th>
//                   <th className="th-cell">Paid Through</th>
//                   <th className="th-cell">Reference</th>
//                   <th className="th-cell">Amount Used</th>
//                   <th className="th-cell">In Excess</th>
//                   <th className="th-cell">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.length ? filtered.map(p => (
//                   <tr key={p.id} className="border-b hover:bg-background-muted">
//                     <td className="td-cell">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : ''}</td>
//                     <td className="td-cell font-medium">{p.supplierName}</td>
//                     <td className="td-cell">{(p.amount ?? 0).toFixed(2)}</td>
//                     <td className="td-cell">{p.paidThrough || p.paymentMode || '—'}</td>
//                     <td className="td-cell">{p.reference || '—'}</td>
//                     <td className="td-cell">{(p.amountUsedForPayments ?? 0).toFixed(2)}</td>
//                     <td className="td-cell">{(p.amountInExcess ?? 0).toFixed(2)}</td>
//                     <td className="td-cell">
//                       <div className="flex gap-2">
//                         <button onClick={() => navigate(`/purchase-dashboard/payments/edit/${p.id}`)} className="p-2 hover:bg-background-muted rounded"><Edit className="h-4 w-4" /></button>
//                         <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-600 rounded"><Trash2 className="h-4 w-4" /></button>
//                       </div>
//                     </td>
//                   </tr>
//                 )) : (
//                   <tr><td colSpan="8" className="text-center py-12 text-muted"><AlertCircle className="mx-auto h-12 w-12" /><div className="mt-2">No payments found</div></td></tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PurchasePaymentPage;


// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { PlusCircle, Edit, Trash2, Loader, AlertCircle, Search } from 'lucide-react';

// const API_URL = import.meta.env.VITE_API_BASE_URL;

// const PurchasePaymentPage = () => {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const navigate = useNavigate();

//   const fetchPayments = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${API_URL}/purchases/payments`, {
//         headers: { Authorization: `Bearer ${token}` },
//         params: { page: 0, size: 200, sort: 'createdAt,desc' }
//       });
//       // pageable response -> data.content
//       setPayments(res.data.content || res.data || []);
//     } catch (err) {
//       console.error('Failed to fetch purchase payments:', err);
//       setError('Failed to load payments. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPayments();
//   }, []);

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this payment?')) return;
//     try {
//       const token = localStorage.getItem('token');
//       await axios.delete(`${API_URL}/purchases/payments/${id}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       fetchPayments();
//     } catch (err) {
//       console.error('Failed to delete payment', err);
//       setError('Failed to delete payment.');
//     }
//   };

//   const filtered = payments.filter(p =>
//     (p.supplierName && p.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (p.reference && p.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (p.createdBy && p.createdBy.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   return (
//     <div className="p-6 md:p-8">
//       <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
//         <h1 className="text-3xl font-bold text-foreground">Purchase Payments</h1>
//         <div className="flex items-center gap-2">
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search by Supplier, Reference or Creator..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="input w-full sm:w-64 pr-10 bg-background-muted border-border"
//             />
//             <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
//           </div>
//           <Link to="/purchase-dashboard/payments/new" className="btn-primary flex items-center gap-2">
//             <PlusCircle size={18} /> New Payment
//           </Link>
//         </div>
//       </div>

//       {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

//       <div className="bg-card text-card-foreground rounded-xl shadow-sm overflow-hidden">
//         {loading ? (
//           <div className="flex justify-center items-center h-80"><Loader className="h-8 w-8 animate-spin text-primary" /></div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="bg-background-muted">
//                 <tr>
//                   <th className="th-cell">Payment Date</th>
//                   <th className="th-cell">Supplier</th>
//                   <th className="th-cell">Amount</th>
//                   <th className="th-cell">Amount Paid</th>
//                   <th className="th-cell">In Excess</th>
//                   <th className="th-cell">Reference</th>
//                   <th className="th-cell">Created By</th>
//                   <th className="th-cell">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="text-foreground-muted">
//                 {filtered.length > 0 ? filtered.map(p => (
//                   <tr key={p.id} className="border-b border-border hover:bg-background-muted">
//                     <td className="td-cell">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '—'}</td>
//                     <td className="td-cell font-medium text-foreground">{p.supplierName || '—'}</td>
//                     <td className="td-cell">{(p.amount ?? 0).toFixed(2)}</td>
//                     <td className="td-cell">{(p.amountPaid ?? 0).toFixed(2)}</td>
//                     <td className="td-cell">{(p.amountInExcess ?? 0).toFixed(2)}</td>
//                     <td className="td-cell">{p.reference || '—'}</td>
//                     <td className="td-cell">{p.createdBy || '—'}</td>
//                     <td className="td-cell">
//                       <div className="flex items-center gap-1">
//                         <button onClick={() => navigate(`/purchase-dashboard/payments/edit/${p.id}`)} className="p-2 hover:text-primary hover:bg-background-muted rounded-full" title="Edit"><Edit className="h-4 w-4" /></button>
//                         <button onClick={() => handleDelete(p.id)} className="p-2 hover:text-red-600 hover:bg-background-muted rounded-full" title="Delete"><Trash2 className="h-4 w-4" /></button>
//                       </div>
//                     </td>
//                   </tr>
//                 )) : (
//                   <tr><td colSpan="8" className="text-center py-10 text-foreground-muted"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No payments found</h3><p className="mt-1 text-sm">Create a new payment to get started.</p></td></tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PurchasePaymentPage;


// src/purchase/components/PurchasePaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, Edit, Trash2, Loader, AlertCircle, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const PurchasePaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/purchases/payments`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 0, size: 200, sort: 'createdAt,desc' }
      });
      setPayments(res.data.content || res.data || []);
    } catch (err) {
      console.error('Failed to fetch purchase payments:', err);
      setError('Failed to load payments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/purchases/payments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPayments();
    } catch (err) {
      console.error('Failed to delete payment', err);
      setError('Failed to delete payment.');
    }
  };

  const filtered = payments.filter(p =>
    (p.supplierName && p.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.reference && p.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.createdBy && p.createdBy.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-foreground">Purchase Payments</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Supplier, Reference or Creator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full sm:w-64 pr-10 bg-background-muted border-border"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
          </div>
          <Link to="/purchase-dashboard/payments/new" className="btn-primary flex items-center gap-2">
            <PlusCircle size={18} /> New Payment
          </Link>
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-card text-card-foreground rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-80"><Loader className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-background-muted">
                <tr>
                  <th className="th-cell">Payment Date</th>
                  <th className="th-cell">Supplier</th>
                  <th className="th-cell">Amount</th>
                  <th className="th-cell">Amount Paid</th>
                  <th className="th-cell">In Excess</th>
                  <th className="th-cell">Reference</th>
                  <th className="th-cell">Created By</th>
                  <th className="th-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="text-foreground-muted">
                {filtered.length > 0 ? filtered.map(p => (
                  <tr key={p.id} className="border-b border-border hover:bg-background-muted">
                    <td className="td-cell">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '—'}</td>
                    <td className="td-cell font-medium text-foreground">{p.supplierName || '—'}</td>
                    <td className="td-cell">{(p.amount ?? 0).toFixed(2)}</td>
                    <td className="td-cell">{(p.amountPaid ?? 0).toFixed(2)}</td>
                    <td className="td-cell">{(p.amountInExcess ?? 0).toFixed(2)}</td>

                    {/* <-- clickable reference: opens view/print page --> */}
                    <td className="td-cell">
                      <Link
                        to={`/purchase-dashboard/payments/view/${p.id}`}
                        className="font-medium hover:underline text-foreground"
                        title="View payment receipt"
                      >
                        {p.reference || `#${p.id}`}
                      </Link>
                    </td>

                    <td className="td-cell">{p.createdBy || '—'}</td>
                    <td className="td-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/purchase-dashboard/payments/edit/${p.id}`)} className="p-2 hover:text-primary hover:bg-background-muted rounded-full" title="Edit"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 hover:text-red-600 hover:bg-background-muted rounded-full" title="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="8" className="text-center py-10 text-foreground-muted"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No payments found</h3><p className="mt-1 text-sm">Create a new payment to get started.</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchasePaymentPage;
