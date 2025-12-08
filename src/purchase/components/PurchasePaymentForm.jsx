// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate, useParams, Link } from 'react-router-dom';
// import axios from 'axios';
// import { Save, Loader, ArrowLeft, AlertCircle } from 'lucide-react';

// const API_URL = import.meta.env.VITE_API_BASE_URL;

// const InputField = ({ label, ...props }) => (
//     <div>
//         <label htmlFor={props.id || props.name} className="block text-sm font-medium text-foreground-muted">{label}</label>
//         <input {...props} className="input mt-1 bg-background-muted border-border" />
//     </div>
// );

// const SelectField = ({ label, children, ...props }) => (
//     <div>
//         <label htmlFor={props.id || props.name} className="block text-sm font-medium text-foreground-muted">{label}</label>
//         <select {...props} className="input mt-1 bg-background-muted border-border">
//             {children}
//         </select>
//     </div>
// );

// const PurchasePaymentForm = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const isEditing = Boolean(id);

//     const [formData, setFormData] = useState({
//         supplierId: '',
//         amount: '',
//         paymentDate: new Date().toISOString().split('T')[0],
//         paymentMode: 'Bank Transfer',
//         paidThrough: '',
//         reference: '',
//         notes: '',
//         allocations: [],
//     });
//     const [suppliers, setSuppliers] = useState([]);
//     const [unpaidInvoices, setUnpaidInvoices] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');

//     useEffect(() => {
//         const fetchInitialData = async () => {
//             setLoading(true);
//             try {
//                 const token = localStorage.getItem('token');
//                 const headers = { Authorization: `Bearer ${token}` };//parties?type=SUPPLIER
                
//                 const suppliersRes = await axios.get(`${API_URL}/purchases/payments`, { headers });
//                 setSuppliers(suppliersRes.data.content || []);

//                 if (isEditing) {
//                     const paymentRes = await axios.get(`${API_URL}/purchases/payments/${id}`, { headers });
//                     const paymentData = paymentRes.data;
//                     setFormData({
//                         ...paymentData,
//                         paymentDate: paymentData.paymentDate ? new Date(paymentData.paymentDate).toISOString().split('T')[0] : '',
//                     });
//                     if (paymentData.supplierId) {
//                         fetchUnpaidInvoices(paymentData.supplierId, token);
//                     }
//                 }
//             } catch (err) {
//                 console.error("Failed to fetch initial data:", err);
//                 setError("Failed to load necessary data.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchInitialData();
//     }, [id, isEditing]);

//     const fetchUnpaidInvoices = async (supplierId, token) => {
//         if (!supplierId) {
//             setUnpaidInvoices([]);
//             return;
//         }
//         try {
//             // NOTE: The backend does not currently support filtering invoices by supplier or status.
//             // This is a client-side filter which is inefficient.
//             // A dedicated endpoint like `/api/purchases/invoices/unpaid?supplierId={id}` would be better.
//             const response = await axios.get(`${API_URL}/purchases/invoices`, {
//                 headers: { "Authorization": `Bearer ${token}` },
//                 params: { page: 0, size: 200 } // Fetch a large number to simulate getting all
//             });
//             const supplierInvoices = response.data.content.filter(inv => inv.supplierId === parseInt(supplierId));
//             setUnpaidInvoices(supplierInvoices);
//         } catch (err) {
//             console.error("Failed to fetch unpaid invoices:", err);
//             setError("Could not load unpaid invoices for the selected supplier.");
//         }
//     };

//     const handleSupplierChange = (e) => {
//         const newSupplierId = e.target.value;
//         setFormData(prev => ({ ...prev, supplierId: newSupplierId, allocations: [] }));
//         const token = localStorage.getItem('token');
//         fetchUnpaidInvoices(newSupplierId, token);
//     };

//     const handleHeaderChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleAllocationChange = (invoiceId, amountToAllocate) => {
//         const newAmount = parseFloat(amountToAllocate) || 0;
//         setFormData(prev => {
//             const existingAlloc = prev.allocations.find(a => a.invoiceId === invoiceId);
//             let newAllocations;

//             if (newAmount > 0) {
//                 if (existingAlloc) {
//                     newAllocations = prev.allocations.map(a => a.invoiceId === invoiceId ? { ...a, allocatedAmount: newAmount } : a);
//                 } else {
//                     newAllocations = [...prev.allocations, { invoiceId, allocatedAmount: newAmount }];
//                 }
//             } else {
//                 newAllocations = prev.allocations.filter(a => a.invoiceId !== invoiceId);
//             }
//             return { ...prev, allocations: newAllocations };
//         });
//     };

//     const totals = useMemo(() => {
//         const totalAllocated = formData.allocations.reduce((sum, alloc) => sum + (parseFloat(alloc.allocatedAmount) || 0), 0);
//         const totalPayment = parseFloat(formData.amount) || 0;
//         const amountInExcess = totalPayment - totalAllocated;
//         return { totalAllocated, amountInExcess };
//     }, [formData.allocations, formData.amount]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');

//         if (totals.amountInExcess < 0) {
//             setError("Total allocated amount cannot be greater than the payment amount.");
//             setLoading(false);
//             return;
//         }

//         try {
//             const token = localStorage.getItem('token');
//             const headers = { Authorization: `Bearer ${token}` };

//             if (isEditing) {
//                 await axios.put(`${API_URL}/purchases/payments/${id}`, formData, { headers });
//             } else {
//                 await axios.post(`${API_URL}/purchases/payments`, formData, { headers });
//             }
//             navigate('/purchase-dashboard/payments');
//         } catch (err) {
//             console.error("Failed to save payment:", err);
//             setError(err.response?.data?.message || "An error occurred while saving.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading && !isEditing) {
//         return <div className="flex justify-center items-center h-64"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
//     }

//     return (
//         <div className="bg-card p-6 rounded-xl shadow-sm">
//             <div className="flex justify-between items-center mb-6">
//                 <h1 className="text-2xl font-bold text-foreground">{isEditing ? `Edit Payment` : 'New Payment'}</h1>
//                 <Link to="/purchase-dashboard/payments" className="btn-secondary flex items-center gap-2">
//                     <ArrowLeft size={16} /> Back to List
//                 </Link>
//             </div>

//             {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span className="block sm:inline">{error}</span></div>}

//             <form onSubmit={handleSubmit} className="space-y-8">
//                 {/* Header Section */}
//                 <div className="p-4 border border-border rounded-lg">
//                     <h2 className="text-lg font-semibold text-foreground mb-4">Payment Details</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                         <SelectField label="Supplier" name="supplierId" value={formData.supplierId} onChange={handleSupplierChange} required>
//                             <option value="">Select Supplier</option>
//                             {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}
//                         </SelectField>
//                         <InputField label="Amount" name="amount" type="number" value={formData.amount} onChange={handleHeaderChange} required step="0.01" />
//                         <InputField label="Payment Date" name="paymentDate" type="date" value={formData.paymentDate} onChange={handleHeaderChange} required />
//                         <SelectField label="Payment Mode" name="paymentMode" value={formData.paymentMode} onChange={handleHeaderChange}>
//                             <option value="Bank Transfer">Bank Transfer</option>
//                             <option value="Cash">Cash</option>
//                             <option value="Cheque">Cheque</option>
//                         </SelectField>
//                         <InputField label="Paid Through Account" name="paidThrough" value={formData.paidThrough} onChange={handleHeaderChange} placeholder="e.g., Main Bank Account" />
//                         <InputField label="Reference #" name="reference" value={formData.reference} onChange={handleHeaderChange} />
//                         {formData.paymentMode === 'Cheque' && (
//                             <InputField label="Cheque #" name="chequeNumber" value={formData.chequeNumber} onChange={handleHeaderChange} />
//                         )}
//                         <div className="lg:col-span-4">
//                             <label htmlFor="notes" className="block text-sm font-medium text-foreground-muted">Notes</label>
//                             <textarea id="notes" name="notes" value={formData.notes} onChange={handleHeaderChange} rows="3" className="input mt-1 bg-background-muted border-border"></textarea>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Allocations Section */}
//                 {formData.supplierId && (
//                     <div className="p-4 border border-border rounded-lg">
//                         <h2 className="text-lg font-semibold text-foreground mb-4">Allocate Payment to Invoices</h2>
//                         <div className="overflow-x-auto">
//                             <table className="min-w-full">
//                                 <thead className="bg-background-muted">
//                                     <tr>
//                                         <th className="th-cell text-left">Bill Date</th>
//                                         <th className="th-cell text-left">Bill #</th>
//                                         <th className="th-cell text-right">Bill Amount</th>
//                                         <th className="th-cell text-right">Amount Due</th>
//                                         <th className="th-cell text-right w-1/4">Payment</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {unpaidInvoices.length > 0 ? (
//                                         unpaidInvoices.map(inv => {
//                                             const allocatedAmount = formData.allocations.find(a => a.invoiceId === inv.id)?.allocatedAmount || '';
//                                             // This is a simplification. A real app would track payments against invoices.
//                                             const amountDue = inv.netTotal; 
//                                             return (
//                                                 <tr key={inv.id} className="border-b border-border">
//                                                     <td className="td-cell">{new Date(inv.billDate).toLocaleDateString()}</td>
//                                                     <td className="td-cell font-medium">{inv.billNumber}</td>
//                                                     <td className="td-cell text-right font-mono">{inv.netTotal.toFixed(2)}</td>
//                                                     <td className="td-cell text-right font-mono text-red-600">{amountDue.toFixed(2)}</td>
//                                                     <td className="td-cell">
//                                                         <InputField
//                                                             type="number"
//                                                             value={allocatedAmount}
//                                                             onChange={(e) => handleAllocationChange(inv.id, e.target.value)}
//                                                             className="input text-right text-sm py-1"
//                                                             placeholder="0.00"
//                                                             max={amountDue}
//                                                         />
//                                                     </td>
//                                                 </tr>
//                                             );
//                                         })
//                                     ) : (
//                                         <tr>
//                                             <td colSpan="5" className="text-center py-6 text-foreground-muted">
//                                                 <AlertCircle className="mx-auto h-8 w-8 text-foreground-muted/50" />
//                                                 <p className="mt-2">No unpaid invoices found for this supplier.</p>
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 )}

//                 {/* Totals Section */}
//                 <div className="flex justify-end">
//                     <div className="w-full max-w-sm space-y-3 text-sm p-4 bg-background-muted rounded-lg">
//                         <div className="flex justify-between">
//                             <span className="text-foreground-muted">Total Payment Amount:</span>
//                             <span className="font-medium text-foreground">{(parseFloat(formData.amount) || 0).toFixed(2)}</span>
//                         </div>
//                         <div className="flex justify-between">
//                             <span className="text-foreground-muted">Amount Used for Payments:</span>
//                             <span className="font-medium text-foreground">{totals.totalAllocated.toFixed(2)}</span>
//                         </div>
//                         <div className="flex justify-between border-t border-border pt-3 mt-2">
//                             <span className="text-base font-bold text-foreground">
//                                 {totals.amountInExcess >= 0 ? 'Amount in Excess' : 'Amount to Allocate'}
//                             </span>
//                             <span className={`text-base font-bold ${totals.amountInExcess < 0 ? 'text-red-600' : 'text-green-600'}`}>
//                                 {Math.abs(totals.amountInExcess).toFixed(2)}
//                             </span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Actions */}
//                 <div className="flex justify-end gap-4 pt-6 border-t border-border">
//                     <button type="button" onClick={() => navigate('/purchase-dashboard/payments')} className="btn-secondary" disabled={loading}>
//                         Cancel
//                     </button>
//                     <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
//                         {loading ? <Loader className="animate-spin h-4 w-4" /> : <Save size={16} />}
//                         {isEditing ? 'Update' : 'Save'} Payment
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default PurchasePaymentForm;



// PurchasePaymentForm.jsx





// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate, useParams, Link } from 'react-router-dom';
// import axios from 'axios';
// import { Plus, Trash2, Save, Loader, ArrowLeft } from 'lucide-react';

// const API_URL = import.meta.env.VITE_API_BASE_URL;

// const Input = ({ label, ...props }) => (
//   <div>
//     <label className="block text-sm font-medium text-muted">{label}</label>
//     <input {...props} className="input mt-1" />
//   </div>
// );

// const Select = ({ label, children, ...props }) => (
//   <div>
//     <label className="block text-sm font-medium text-muted">{label}</label>
//     <select {...props} className="input mt-1">{children}</select>
//   </div>
// );

// const PurchasePaymentForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const isEditing = Boolean(id);

//   const [form, setForm] = useState({
//     supplierId: '',
//     amount: '',
//     payFullAmount: false,
//     taxDeducted: false,
//     tdsAmount: 0,
//     tdsSection: '',
//     paymentDate: new Date().toISOString().split('T')[0],
//     paymentMode: '',
//     paidThrough: '',
//     reference: '',
//     chequeNumber: '',
//     notes: '',
//     createdBy: '',
//     allocations: [],
//     attachments: []
//   });

//   const [suppliers, setSuppliers] = useState([]);
//   const [invoices, setInvoices] = useState([]); // available invoices for allocation
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // fetch masters and invoice list (unpaid invoices ideally, backend may provide filter)
//   useEffect(() => {
//     const fetch = async () => {
//       setLoading(true);
//       try {
//         const token = localStorage.getItem('token');
//         const headers = { Authorization: `Bearer ${token}` };

//         const [supRes, invRes] = await Promise.all([
//           axios.get(`${API_URL}/parties`, { headers, params: { type: 'SUPPLIER', page: 0, size: 500 } }),
//           axios.get(`${API_URL}/purchases/invoices`, { headers, params: { page: 0, size: 500, sort: 'billDate,desc' } })
//         ]);

//         setSuppliers(supRes.data.content || supRes.data || []);
//         setInvoices(invRes.data.content || invRes.data || []);

//         if (isEditing) {
//           const paymentRes = await axios.get(`${API_URL}/purchases/payments/${id}`, { headers });
//           const d = paymentRes.data;
//           // normalize allocations and attachments
//           setForm({
//             supplierId: d.supplierId || '',
//             amount: d.amount ?? '',
//             payFullAmount: !!d.payFullAmount,
//             taxDeducted: !!d.taxDeducted,
//             tdsAmount: d.tdsAmount ?? 0,
//             tdsSection: d.tdsSection || '',
//             paymentDate: d.paymentDate ? new Date(d.paymentDate).toISOString().split('T')[0] : '',
//             paymentMode: d.paymentMode || '',
//             paidThrough: d.paidThrough || '',
//             reference: d.reference || '',
//             chequeNumber: d.chequeNumber || '',
//             notes: d.notes || '',
//             createdBy: d.createdBy || '',
//             allocations: (d.allocations || []).map(a => ({
//               id: a.id || null,
//               invoiceId: a.invoiceId,
//               allocatedAmount: a.allocatedAmount || 0,
//               allocationNote: a.allocationNote || ''
//             })),
//             attachments: (d.attachments || []).map(a => ({
//               id: a.id || null,
//               fileName: a.fileName || '',
//               filePath: a.filePath || '',
//               uploadedBy: a.uploadedBy || '',
//               uploadedAt: a.uploadedAt || ''
//             }))
//           });
//         }
//       } catch (err) {
//         console.error('Failed to load masters or invoices', err);
//         setError('Failed to load data.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetch();
//   }, [id, isEditing]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     const val = type === 'checkbox' ? checked : value;
//     setForm(prev => ({ ...prev, [name]: val }));
//   };

//   // allocation handlers
//   const addAllocation = () => {
//     setForm(prev => ({
//       ...prev,
//       allocations: [...prev.allocations, { invoiceId: '', allocatedAmount: 0, allocationNote: '' }]
//     }));
//   };

//   const removeAllocation = (index) => {
//     setForm(prev => ({ ...prev, allocations: prev.allocations.filter((_, i) => i !== index) }));
//   };

//   const updateAllocation = (index, e) => {
//     const { name, value } = e.target;
//     setForm(prev => {
//       const allocs = [...prev.allocations];
//       allocs[index] = { ...allocs[index], [name]: name === 'allocatedAmount' ? Number(value) : value };
//       return { ...prev, allocations: allocs };
//     });
//   };

//   // attachments
//   const addAttachment = () => {
//     setForm(prev => ({ ...prev, attachments: [...prev.attachments, { fileName: '', filePath: '', uploadedBy: prev.createdBy || '', uploadedAt: new Date().toISOString() }] }));
//   };
//   const removeAttachment = (idx) => setForm(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }));
//   const updateAttachment = (idx, e) => {
//     const { name, value } = e.target;
//     setForm(prev => {
//       const atts = [...prev.attachments];
//       atts[idx] = { ...atts[idx], [name]: value };
//       return { ...prev, attachments: atts };
//     });
//   };

//   // computed totals: sum of allocations, remaining, inExcess
//   const totals = useMemo(() => {
//     const amount = Number(form.amount || 0);
//     const sumAllocated = (form.allocations || []).reduce((s, a) => s + (Number(a.allocatedAmount || 0)), 0);
//     const amountUsedForPayments = sumAllocated;
//     const amountInExcess = Math.max(0, amount - sumAllocated);
//     const amountPaid = sumAllocated; // matches backend logic
//     return { amount, sumAllocated, amountUsedForPayments, amountInExcess, amountPaid };
//   }, [form.amount, form.allocations]);

//   const validate = () => {
//     if (!form.paymentDate) return 'Payment date is required';
//     if (!form.amount || Number(form.amount) <= 0) return 'Amount must be greater than 0';
//     return null;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const v = validate();
//     if (v) { setError(v); return; }
//     setError('');
//     setLoading(true);

//     const payload = {
//       supplierId: form.supplierId || null,
//       amount: Number(form.amount),
//       payFullAmount: !!form.payFullAmount,
//       taxDeducted: !!form.taxDeducted,
//       tdsAmount: form.tdsAmount ? Number(form.tdsAmount) : 0,
//       tdsSection: form.tdsSection || null,
//       paymentDate: form.paymentDate || null,
//       paymentMode: form.paymentMode || null,
//       paidThrough: form.paidThrough || null,
//       reference: form.reference || null,
//       chequeNumber: form.chequeNumber || null,
//       notes: form.notes || null,
//       createdBy: form.createdBy || null,
//       allocations: (form.allocations || []).map(a => ({
//         id: a.id || null,
//         invoiceId: a.invoiceId,
//         allocatedAmount: Number(a.allocatedAmount || 0),
//         allocationNote: a.allocationNote || null
//       })),
//       attachments: (form.attachments || []).map(a => ({
//         id: a.id || null,
//         fileName: a.fileName || null,
//         filePath: a.filePath || null,
//         uploadedBy: a.uploadedBy || null,
//         uploadedAt: a.uploadedAt || null
//       }))
//     };

//     try {
//       const token = localStorage.getItem('token');
//       const headers = { Authorization: `Bearer ${token}` };

//       if (isEditing) {
//         await axios.put(`${API_URL}/purchases/payments/${id}`, payload, { headers });
//       } else {
//         await axios.post(`${API_URL}/purchases/payments`, payload, { headers });
//       }
//       navigate('/purchase-dashboard/payments');
//     } catch (err) {
//       console.error('Failed to save payment', err);
//       setError(err?.response?.data?.message || 'Failed to save payment.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading && !isEditing) {
//     return <div className="flex justify-center items-center h-64"><Loader className="h-8 w-8 animate-spin" /></div>;
//   }

//   return (
//     <div className="bg-card p-6 rounded-xl shadow-sm">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">{isEditing ? `Edit Payment` : 'New Payment'}</h1>
//         <Link to="/purchase-dashboard/payments" className="btn-secondary flex items-center gap-2"><ArrowLeft size={16} /> Back to List</Link>
//       </div>

//       {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded">
//           <Select label="Supplier" name="supplierId" value={form.supplierId} onChange={handleChange}>
//             <option value="">Select Supplier</option>
//             {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName || s.name || `${s.firstName || ''} ${s.lastName || ''}`}</option>)}
//           </Select>

//           <Input label="Amount" name="amount" type="number" step="0.01" value={form.amount} onChange={handleChange} />

//           <div className="flex items-center gap-2">
//             <input id="payFullAmount" name="payFullAmount" type="checkbox" checked={!!form.payFullAmount} onChange={handleChange} />
//             <label htmlFor="payFullAmount">Pay Full Amount</label>
//           </div>

//           <div className="flex flex-col">
//             <div className="flex items-center gap-2">
//               <input id="taxDeducted" name="taxDeducted" type="checkbox" checked={!!form.taxDeducted} onChange={handleChange} />
//               <label htmlFor="taxDeducted">TDS Deducted</label>
//             </div>
//             <div className="grid grid-cols-2 gap-2 mt-2">
//               <input name="tdsAmount" type="number" step="0.01" placeholder="TDS Amount" value={form.tdsAmount} onChange={handleChange} className="input" />
//               <input name="tdsSection" placeholder="TDS Section" value={form.tdsSection} onChange={handleChange} className="input" />
//             </div>
//           </div>

//           <Input label="Payment Date" name="paymentDate" type="date" value={form.paymentDate} onChange={handleChange} />
//           <Input label="Payment Mode" name="paymentMode" value={form.paymentMode} onChange={handleChange} />
//           <Input label="Paid Through (Account)" name="paidThrough" value={form.paidThrough} onChange={handleChange} />
//           <Input label="Reference" name="reference" value={form.reference} onChange={handleChange} />
//           <Input label="Cheque Number" name="chequeNumber" value={form.chequeNumber} onChange={handleChange} />
//           <div className="col-span-full">
//             <label className="block text-sm">Notes</label>
//             <textarea name="notes" value={form.notes} onChange={handleChange} className="input mt-1" rows="3" />
//           </div>
//           <Input label="Created By" name="createdBy" value={form.createdBy} onChange={handleChange} />
//         </div>

//         {/* Allocations */}
//         <div className="p-4 border rounded">
//           <div className="flex justify-between items-center mb-3">
//             <h3 className="font-semibold">Allocations</h3>
//             <button type="button" onClick={addAllocation} className="btn-secondary flex items-center gap-2"><Plus /> Add Allocation</button>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="bg-background-muted">
//                 <tr>
//                   <th className="th-cell">#</th>
//                   <th className="th-cell">Invoice</th>
//                   <th className="th-cell">Invoice Amount</th>
//                   <th className="th-cell">Allocate Amount</th>
//                   <th className="th-cell">Note</th>
//                   <th className="th-cell"></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {form.allocations.map((a, idx) => {
//                   const inv = invoices.find(i => i.id === Number(a.invoiceId));
//                   return (
//                     <tr key={idx} className="border-b">
//                       <td className="td-cell">{idx + 1}</td>
//                       <td className="td-cell">
//                         <select name="invoiceId" value={a.invoiceId || ''} onChange={(e) => updateAllocation(idx, e)} className="input">
//                           <option value="">Select invoice</option>
//                           {invoices.map(invOpt => <option key={invOpt.id} value={invOpt.id}>{invOpt.billNumber || (`#${invOpt.id}`)} — {invOpt.supplierName || ''}</option>)}
//                         </select>
//                         {inv && <div className="text-xs text-muted mt-1">Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</div>}
//                       </td>
//                       <td className="td-cell">{inv ? (inv.netTotal ?? 0).toFixed(2) : '—'}</td>
//                       <td className="td-cell">
//                         <input name="allocatedAmount" type="number" step="0.01" value={a.allocatedAmount || 0} onChange={(e) => updateAllocation(idx, e)} className="input" />
//                       </td>
//                       <td className="td-cell"><input name="allocationNote" value={a.allocationNote || ''} onChange={(e) => updateAllocation(idx, e)} className="input" /></td>
//                       <td className="td-cell">
//                         <button type="button" onClick={() => removeAllocation(idx)} className="p-2 text-red-500 rounded"><Trash2 /></button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//                 {form.allocations.length === 0 && <tr><td colSpan="6" className="text-center py-6 text-muted">No allocations. Add to apply payment to invoices.</td></tr>}
//               </tbody>
//             </table>
//           </div>

//           <div className="mt-4 text-sm space-y-1">
//             <div className="flex justify-between"><span>Amount</span><span>{totals.amount.toFixed(2)}</span></div>
//             <div className="flex justify-between"><span>Allocated</span><span>{totals.sumAllocated.toFixed(2)}</span></div>
//             <div className="flex justify-between"><span>Amount Used</span><span>{totals.amountUsedForPayments.toFixed(2)}</span></div>
//             <div className="flex justify-between"><span>In Excess</span><span>{totals.amountInExcess.toFixed(2)}</span></div>
//           </div>
//         </div>

//         {/* Attachments */}
//         <div className="p-4 border rounded">
//           <div className="flex justify-between items-center mb-3">
//             <h3 className="font-semibold">Attachments</h3>
//             <button type="button" onClick={addAttachment} className="btn-secondary flex items-center gap-2"><Plus /> Add</button>
//           </div>

//           <div className="space-y-3">
//             {form.attachments.map((att, idx) => (
//               <div key={idx} className="grid grid-cols-6 gap-2 items-center">
//                 <input name="fileName" value={att.fileName || ''} onChange={(e) => updateAttachment(idx, e)} placeholder="File name" className="input col-span-2" />
//                 <input name="filePath" value={att.filePath || ''} onChange={(e) => updateAttachment(idx, e)} placeholder="Path or URL" className="input col-span-3" />
//                 <button type="button" onClick={() => removeAttachment(idx)} className="p-2 text-red-500 rounded"><Trash2 /></button>
//                 <input name="uploadedBy" value={att.uploadedBy || ''} onChange={(e) => updateAttachment(idx, e)} placeholder="Uploaded by" className="input col-span-2 mt-2" />
//                 <input name="uploadedAt" value={att.uploadedAt || ''} onChange={(e) => updateAttachment(idx, e)} type="datetime-local" className="input col-span-4 mt-2" />
//               </div>
//             ))}
//             {form.attachments.length === 0 && <div className="text-sm text-muted">No attachments</div>}
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex justify-end gap-4">
//           <button type="button" onClick={() => navigate('/purchase-dashboard/payments')} className="btn-secondary">Cancel</button>
//           <button type="submit" className="btn-primary flex items-center gap-2">
//             {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Save />} {isEditing ? 'Update' : 'Save'} Payment
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default PurchasePaymentForm;




















// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import { useNavigate, useParams, Link } from 'react-router-dom';
// import axios from 'axios';
// import { Plus, Trash2, Save, Loader, ArrowLeft } from 'lucide-react';

// const API_URL = import.meta.env.VITE_API_BASE_URL;

// const Input = ({ label, ...props }) => (
//   <div>
//     <label className="block text-sm font-medium text-foreground-muted">{label}</label>
//     <input {...props} className="input mt-1 bg-background-muted border-border" />
//   </div>
// );

// const Select = ({ label, children, ...props }) => (
//   <div>
//     <label className="block text-sm font-medium text-foreground-muted">{label}</label>
//     <select {...props} className="input mt-1 bg-background-muted border-border">{children}</select>
//   </div>
// );

// const PurchasePaymentForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const isEditing = Boolean(id);
//   const fileInputRef = useRef(null);

//   const [form, setForm] = useState({
//     supplierId: '',
//     amount: '',
//     payFullAmount: false,
//     taxDeducted: false,
//     tdsAmount: 0,
//     tdsSection: '',
//     paymentDate: new Date().toISOString().split('T')[0],
//     paymentMode: '',
//     paidThrough: '',
//     reference: '',
//     chequeNumber: '',
//     notes: '',
//     createdBy: '',
//     allocations: [], // { invoiceId, allocatedAmount, allocationNote }
//     attachments: []  // { fileName, filePath, uploadedBy, uploadedAt }
//   });

//   const [suppliers, setSuppliers] = useState([]);
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       try {
//         const token = localStorage.getItem('token');
//         const headers = { Authorization: `Bearer ${token}` };

//         // fetch suppliers and invoices for allocations
//         const [supRes, invRes] = await Promise.all([
//           axios.get(`${API_URL}/parties`, { headers, params: { type: 'SUPPLIER', page: 0, size: 500 } }),
//           axios.get(`${API_URL}/purchases/invoices`, { headers, params: { page: 0, size: 500, sort: 'billDate,desc' } })
//         ]);

//         setSuppliers(supRes.data.content || supRes.data || []);
//         setInvoices(invRes.data.content || invRes.data || []);

//         if (isEditing) {
//           const payRes = await axios.get(`${API_URL}/purchases/payments/${id}`, { headers });
//           const d = payRes.data;
//           setForm({
//             supplierId: d.supplierId || '',
//             amount: d.amount ?? '',
//             payFullAmount: !!d.payFullAmount,
//             taxDeducted: !!d.taxDeducted,
//             tdsAmount: d.tdsAmount ?? 0,
//             tdsSection: d.tdsSection || '',
//             paymentDate: d.paymentDate ? new Date(d.paymentDate).toISOString().split('T')[0] : '',
//             paymentMode: d.paymentMode || '',
//             paidThrough: d.paidThrough || '',
//             reference: d.reference || '',
//             chequeNumber: d.chequeNumber || '',
//             notes: d.notes || '',
//             createdBy: d.createdBy || '',
//             allocations: (d.allocations || []).map(a => ({ id: a.id || null, invoiceId: a.invoiceId, allocatedAmount: a.allocatedAmount || 0, allocationNote: a.allocationNote || '' })),
//             attachments: (d.attachments || []).map(a => ({ id: a.id || null, fileName: a.fileName, filePath: a.filePath, uploadedBy: a.uploadedBy, uploadedAt: a.uploadedAt }))
//           });
//         }
//       } catch (err) {
//         console.error('Failed to load masters', err);
//         setError('Failed to load supporting data.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();
//   }, [id, isEditing]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     const val = type === 'checkbox' ? checked : value;
//     setForm(prev => ({ ...prev, [name]: val }));
//   };

//   // allocations handlers
//   const addAllocation = () => setForm(prev => ({ ...prev, allocations: [...prev.allocations, { invoiceId: '', allocatedAmount: 0, allocationNote: '' }] }));
//   const removeAllocation = (idx) => setForm(prev => ({ ...prev, allocations: prev.allocations.filter((_, i) => i !== idx) }));
//   const updateAllocation = (idx, e) => {
//     const { name, value } = e.target;
//     setForm(prev => {
//       const arr = [...prev.allocations];
//       arr[idx] = { ...arr[idx], [name]: name === 'allocatedAmount' ? Number(value) : value };
//       return { ...prev, allocations: arr };
//     });
//   };

//   // attachments: single Add button opens file picker -> upload -> append returned filePath and fileName
//   const onAddAttachmentClick = () => fileInputRef.current && fileInputRef.current.click();

//   const onFileSelected = async (e) => {
//     const files = e.target.files;
//     if (!files || files.length === 0) return;
//     const file = files[0];

//     setUploading(true);
//     setError('');
//     try {
//       const fd = new FormData();
//       fd.append('file', file);
//       const token = localStorage.getItem('token');
//       const res = await axios.post(`${API_URL}/uploads`, fd, {
//         headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
//       });
//       const { fileName, filePath } = res.data;
//       const att = { id: null, fileName: fileName || file.name, filePath: filePath || '', uploadedBy: form.createdBy || '', uploadedAt: new Date().toISOString() };
//       setForm(prev => ({ ...prev, attachments: [...prev.attachments, att] }));
//     } catch (err) {
//       console.error('Upload failed', err);
//       setError('File upload failed.');
//     } finally {
//       setUploading(false);
//       if (fileInputRef.current) fileInputRef.current.value = '';
//     }
//   };

//   const removeAttachment = (idx) => setForm(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }));

//   const totals = useMemo(() => {
//     const amount = Number(form.amount || 0);
//     const sumAllocated = (form.allocations || []).reduce((s, a) => s + (Number(a.allocatedAmount || 0)), 0);
//     const amountPaid = sumAllocated;
//     const amountUsedForPayments = sumAllocated;
//     const amountInExcess = Math.max(0, amount - sumAllocated);
//     return { amount, sumAllocated, amountPaid, amountUsedForPayments, amountInExcess };
//   }, [form.amount, form.allocations]);

//   const validate = () => {
//     if (!form.paymentDate) return 'Payment date is required';
//     if (!form.amount || Number(form.amount) <= 0) return 'Amount must be greater than zero';
//     return null;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const v = validate();
//     if (v) { setError(v); return; }
//     setLoading(true);
//     setError('');

//     const payload = {
//       supplierId: form.supplierId || null,
//       amount: Number(form.amount),
//       payFullAmount: !!form.payFullAmount,
//       taxDeducted: !!form.taxDeducted,
//       tdsAmount: form.tdsAmount ? Number(form.tdsAmount) : 0,
//       tdsSection: form.tdsSection || null,
//       paymentDate: form.paymentDate || null,
//       paymentMode: form.paymentMode || null,
//       paidThrough: form.paidThrough || null,
//       reference: form.reference || null,
//       chequeNumber: form.chequeNumber || null,
//       notes: form.notes || null,
//       createdBy: form.createdBy || null,
//       allocations: (form.allocations || []).map(a => ({ id: a.id || null, invoiceId: a.invoiceId, allocatedAmount: Number(a.allocatedAmount || 0), allocationNote: a.allocationNote || null })),
//       attachments: (form.attachments || []).map(a => ({ id: a.id || null, fileName: a.fileName || null, filePath: a.filePath || null, uploadedBy: a.uploadedBy || null, uploadedAt: a.uploadedAt || null }))
//     };

//     try {
//       const token = localStorage.getItem('token');
//       const headers = { Authorization: `Bearer ${token}` };

//       if (isEditing) {
//         await axios.put(`${API_URL}/purchases/payments/${id}`, payload, { headers });
//       } else {
//         await axios.post(`${API_URL}/purchases/payments`, payload, { headers });
//       }
//       navigate('/purchase-dashboard/payments');
//     } catch (err) {
//       console.error('Failed to save payment', err);
//       setError(err?.response?.data?.message || 'Failed to save payment.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading && !isEditing) {
//     return <div className="flex justify-center items-center h-64"><Loader className="h-8 w-8 animate-spin text-primary" /></div>;
//   }

//   return (
//     <div className="bg-card p-6 rounded-xl shadow-sm">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-foreground">{isEditing ? 'Edit Payment' : 'New Payment'}</h1>
//         <Link to="/purchase-dashboard/payments" className="btn-secondary flex items-center gap-2"><ArrowLeft size={16} /> Back to List</Link>
//       </div>

//       {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded">
//           <Select label="Supplier" name="supplierId" value={form.supplierId} onChange={handleChange}>
//             <option value="">Select Supplier</option>
//             {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName || s.name || `${s.firstName || ''} ${s.lastName || ''}`}</option>)}
//           </Select>

//           <Input label="Amount" name="amount" type="number" step="0.01" value={form.amount} onChange={handleChange} />
//           <div className="flex items-center gap-2">
//             <input id="payFullAmount" name="payFullAmount" type="checkbox" checked={!!form.payFullAmount} onChange={handleChange} />
//             <label htmlFor="payFullAmount">Pay Full Amount</label>
//           </div>

//           <div>
//             <div className="flex items-center gap-2">
//               <input id="taxDeducted" name="taxDeducted" type="checkbox" checked={!!form.taxDeducted} onChange={handleChange} />
//               <label htmlFor="taxDeducted">TDS Deducted</label>
//             </div>
//             <div className="grid grid-cols-2 gap-2 mt-2">
//               <input name="tdsAmount" type="number" step="0.01" placeholder="TDS Amount" value={form.tdsAmount} onChange={handleChange} className="input" />
//               <input name="tdsSection" placeholder="TDS Section" value={form.tdsSection} onChange={handleChange} className="input" />
//             </div>
//           </div>

//           <Input label="Payment Date" name="paymentDate" type="date" value={form.paymentDate} onChange={handleChange} />
//           <Input label="Payment Mode" name="paymentMode" value={form.paymentMode} onChange={handleChange} />
//           <Input label="Paid Through" name="paidThrough" value={form.paidThrough} onChange={handleChange} />
//           <Input label="Reference" name="reference" value={form.reference} onChange={handleChange} />
//           <Input label="Cheque Number" name="chequeNumber" value={form.chequeNumber} onChange={handleChange} />
//           <div className="col-span-full">
//             <label className="block text-sm font-medium text-foreground-muted">Notes</label>
//             <textarea name="notes" value={form.notes} onChange={handleChange} className="input mt-1 bg-background-muted border-border" rows={3} />
//           </div>
//           <Input label="Created By" name="createdBy" value={form.createdBy} onChange={handleChange} />
//         </div>

//         {/* Allocations */}
//         <div className="p-4 border rounded">
//           <div className="flex justify-between items-center mb-3">
//             <h3 className="font-semibold">Allocations</h3>
//             <button type="button" onClick={addAllocation} className="btn-secondary flex items-center gap-2"><Plus /> Add Allocation</button>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="bg-background-muted">
//                 <tr>
//                   <th className="th-cell">#</th>
//                   <th className="th-cell">Invoice</th>
//                   <th className="th-cell">Invoice Total</th>
//                   <th className="th-cell">Allocate</th>
//                   <th className="th-cell">Note</th>
//                   <th className="th-cell" />
//                 </tr>
//               </thead>
//               <tbody>
//                 {form.allocations.map((a, idx) => {
//                   const inv = invoices.find(i => Number(i.id) === Number(a.invoiceId));
//                   return (
//                     <tr key={idx} className="border-b">
//                       <td className="td-cell">{idx + 1}</td>
//                       <td className="td-cell">
//                         <select name="invoiceId" value={a.invoiceId || ''} onChange={(e) => updateAllocation(idx, e)} className="input">
//                           <option value="">Select invoice</option>
//                           {invoices.map(invOpt => <option key={invOpt.id} value={invOpt.id}>{invOpt.billNumber || (`#${invOpt.id}`)} — {invOpt.supplierName || ''}</option>)}
//                         </select>
//                       </td>
//                       <td className="td-cell">{inv ? (inv.netTotal ?? 0).toFixed(2) : '—'}</td>
//                       <td className="td-cell"><input name="allocatedAmount" type="number" step="0.01" value={a.allocatedAmount || 0} onChange={(e) => updateAllocation(idx, e)} className="input" /></td>
//                       <td className="td-cell"><input name="allocationNote" value={a.allocationNote || ''} onChange={(e) => updateAllocation(idx, e)} className="input" /></td>
//                       <td className="td-cell"><button type="button" onClick={() => removeAllocation(idx)} className="p-2 text-red-500 rounded"><Trash2 /></button></td>
//                     </tr>
//                   );
//                 })}
//                 {form.allocations.length === 0 && <tr><td colSpan="6" className="text-center py-6 text-foreground-muted">No allocations added</td></tr>}
//               </tbody>
//             </table>
//           </div>

//           <div className="mt-4 text-sm space-y-1">
//             <div className="flex justify-between"><span>Amount</span><span>{totals.amount.toFixed(2)}</span></div>
//             <div className="flex justify-between"><span>Allocated</span><span>{totals.sumAllocated.toFixed(2)}</span></div>
//             <div className="flex justify-between"><span>In Excess</span><span>{totals.amountInExcess.toFixed(2)}</span></div>
//           </div>
//         </div>

//         {/* Attachments */}
//         <div className="p-4 border rounded">
//           <div className="flex justify-between items-center mb-3">
//             <h3 className="font-semibold">Attachments</h3>
//             <div className="flex items-center gap-2">
//               <button type="button" onClick={onAddAttachmentClick} className="btn-secondary flex items-center gap-2" disabled={uploading}><Plus /> Add</button>
//               {uploading && <span className="text-sm">Uploading...</span>}
//             </div>
//           </div>

//           <input ref={fileInputRef} type="file" className="hidden" onChange={onFileSelected} />

//           <div className="space-y-2">
//             {form.attachments.length === 0 && <div className="text-sm text-foreground-muted">No attachments uploaded.</div>}
//             {form.attachments.map((att, idx) => (
//               <div key={idx} className="flex items-center justify-between gap-4 border p-2 rounded">
//                 <div>
//                   <div className="font-medium">{att.fileName}</div>
//                   <div className="text-xs text-foreground-muted">{att.uploadedAt ? new Date(att.uploadedAt).toLocaleString() : ''}</div>
//                   {att.filePath && <div className="text-xs"><a className="text-primary underline" href={att.filePath} target="_blank" rel="noreferrer">Open</a></div>}
//                 </div>
//                 <div><button type="button" onClick={() => removeAttachment(idx)} className="p-2 text-red-500 rounded"><Trash2 /></button></div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex justify-end gap-4">
//           <button type="button" onClick={() => navigate('/purchase-dashboard/payments')} className="btn-secondary">Cancel</button>
//           <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
//             {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Save size={16} />} {isEditing ? 'Update' : 'Save'} Payment
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default PurchasePaymentForm;




import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Save, Loader, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-foreground-muted">{label}</label>
    <input {...props} className="input mt-1 bg-background-muted border-border" />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-foreground-muted">{label}</label>
    <select {...props} className="input mt-1 bg-background-muted border-border">{children}</select>
  </div>
);

const PurchasePaymentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    supplierId: '',
    amount: '',
    payFullAmount: false,
    taxDeducted: false,
    tdsAmount: 0,
    tdsSection: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: '',
    paidThrough: '',
    reference: '',
    chequeNumber: '',
    notes: '',
    createdBy: '',
    allocations: [], // { invoiceId, allocatedAmount, allocationNote }
    attachments: []  // { fileName, filePath, uploadedBy, uploadedAt }
  });

  const [suppliers, setSuppliers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // fetch suppliers and invoices for allocations
        const [supRes, invRes] = await Promise.all([
          axios.get(`${API_URL}/parties`, { headers, params: { type: 'SUPPLIER', page: 0, size: 500 } }),
          axios.get(`${API_URL}/purchases/invoices`, { headers, params: { page: 0, size: 500, sort: 'billDate,desc' } })
        ]);

        setSuppliers(supRes.data.content || supRes.data || []);
        setInvoices(invRes.data.content || invRes.data || []);

        if (isEditing) {
          const payRes = await axios.get(`${API_URL}/purchases/payments/${id}`, { headers });
          const d = payRes.data;
          setForm({
            supplierId: d.supplierId || '',
            amount: d.amount ?? '',
            payFullAmount: !!d.payFullAmount,
            taxDeducted: !!d.taxDeducted,
            tdsAmount: d.tdsAmount ?? 0,
            tdsSection: d.tdsSection || '',
            paymentDate: d.paymentDate ? new Date(d.paymentDate).toISOString().split('T')[0] : '',
            paymentMode: d.paymentMode || '',
            paidThrough: d.paidThrough || '',
            reference: d.reference || '',
            chequeNumber: d.chequeNumber || '',
            notes: d.notes || '',
            createdBy: d.createdBy || '',
            allocations: (d.allocations || []).map(a => ({ id: a.id || null, invoiceId: a.invoiceId, allocatedAmount: a.allocatedAmount || 0, allocationNote: a.allocationNote || '' })),
            attachments: (d.attachments || []).map(a => ({ id: a.id || null, fileName: a.fileName, filePath: a.filePath, uploadedBy: a.uploadedBy, uploadedAt: a.uploadedAt }))
          });
        }
      } catch (err) {
        console.error('Failed to load masters', err);
        setError('Failed to load supporting data.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setForm(prev => ({ ...prev, [name]: val }));
  };

  // allocations handlers
  const addAllocation = () => setForm(prev => ({ ...prev, allocations: [...prev.allocations, { invoiceId: '', allocatedAmount: 0, allocationNote: '' }] }));
  const removeAllocation = (idx) => setForm(prev => ({ ...prev, allocations: prev.allocations.filter((_, i) => i !== idx) }));
  const updateAllocation = (idx, e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const arr = [...prev.allocations];
      arr[idx] = { ...arr[idx], [name]: name === 'allocatedAmount' ? Number(value) : value };
      return { ...prev, allocations: arr };
    });
  };

  // attachments: single Add button opens file picker -> capture metadata only (no upload)
  const onAddAttachmentClick = () => fileInputRef.current && fileInputRef.current.click();

  const onFileSelected = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    // Create metadata only (no actual upload). filePath left empty (or you could use URL.createObjectURL for preview).
    const att = {
      id: null,
      fileName: file.name,
      filePath: '', // empty since no server upload. Use object URL for preview if desired.
      uploadedBy: form.createdBy || '',
      uploadedAt: new Date().toISOString()
    };

    setForm(prev => ({ ...prev, attachments: [...prev.attachments, att] }));

    // clear the input so user can re-select the same file later if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (idx) => setForm(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }));

  const totals = useMemo(() => {
    const amount = Number(form.amount || 0);
    const sumAllocated = (form.allocations || []).reduce((s, a) => s + (Number(a.allocatedAmount || 0)), 0);
    const amountPaid = sumAllocated;
    const amountUsedForPayments = sumAllocated;
    const amountInExcess = Math.max(0, amount - sumAllocated);
    return { amount, sumAllocated, amountPaid, amountUsedForPayments, amountInExcess };
  }, [form.amount, form.allocations]);

  const validate = () => {
    if (!form.paymentDate) return 'Payment date is required';
    if (!form.amount || Number(form.amount) <= 0) return 'Amount must be greater than zero';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setLoading(true);
    setError('');

    const payload = {
      supplierId: form.supplierId || null,
      amount: Number(form.amount),
      payFullAmount: !!form.payFullAmount,
      taxDeducted: !!form.taxDeducted,
      tdsAmount: form.tdsAmount ? Number(form.tdsAmount) : 0,
      tdsSection: form.tdsSection || null,
      paymentDate: form.paymentDate || null,
      paymentMode: form.paymentMode || null,
      paidThrough: form.paidThrough || null,
      reference: form.reference || null,
      chequeNumber: form.chequeNumber || null,
      notes: form.notes || null,
      createdBy: form.createdBy || null,
      allocations: (form.allocations || []).map(a => ({ id: a.id || null, invoiceId: a.invoiceId, allocatedAmount: Number(a.allocatedAmount || 0), allocationNote: a.allocationNote || null })),
      attachments: (form.attachments || []).map(a => ({ id: a.id || null, fileName: a.fileName || null, filePath: a.filePath || null, uploadedBy: a.uploadedBy || null, uploadedAt: a.uploadedAt || null }))
    };

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (isEditing) {
        await axios.put(`${API_URL}/purchases/payments/${id}`, payload, { headers });
      } else {
        await axios.post(`${API_URL}/purchases/payments`, payload, { headers });
      }
      navigate('/purchase-dashboard/payments');
    } catch (err) {
      console.error('Failed to save payment', err);
      setError(err?.response?.data?.message || 'Failed to save payment.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEditing) {
    return <div className="flex justify-center items-center h-64"><Loader className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="bg-card p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">{isEditing ? 'Edit Payment' : 'New Payment'}</h1>
        <Link to="/purchase-dashboard/payments" className="btn-secondary flex items-center gap-2"><ArrowLeft size={16} /> Back to List</Link>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded">
          <Select label="Supplier" name="supplierId" value={form.supplierId} onChange={handleChange}>
            <option value="">Select Supplier</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName || s.name || `${s.firstName || ''} ${s.lastName || ''}`}</option>)}
          </Select>

          <Input label="Amount" name="amount" type="number" step="0.01" value={form.amount} onChange={handleChange} />
          <div className="flex items-center gap-2">
            <input id="payFullAmount" name="payFullAmount" type="checkbox" checked={!!form.payFullAmount} onChange={handleChange} />
            <label htmlFor="payFullAmount">Pay Full Amount</label>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <input id="taxDeducted" name="taxDeducted" type="checkbox" checked={!!form.taxDeducted} onChange={handleChange} />
              <label htmlFor="taxDeducted">TDS Deducted</label>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <input name="tdsAmount" type="number" step="0.01" placeholder="TDS Amount" value={form.tdsAmount} onChange={handleChange} className="input" />
              <input name="tdsSection" placeholder="TDS Section" value={form.tdsSection} onChange={handleChange} className="input" />
            </div>
          </div>

          <Input label="Payment Date" name="paymentDate" type="date" value={form.paymentDate} onChange={handleChange} />
          <Input label="Payment Mode" name="paymentMode" value={form.paymentMode} onChange={handleChange} />
          <Input label="Paid Through" name="paidThrough" value={form.paidThrough} onChange={handleChange} />
          <Input label="Reference" name="reference" value={form.reference} onChange={handleChange} />
          <Input label="Cheque Number" name="chequeNumber" value={form.chequeNumber} onChange={handleChange} />
          <div className="col-span-full">
            <label className="block text-sm font-medium text-foreground-muted">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="input mt-1 bg-background-muted border-border" rows={3} />
          </div>
          <Input label="Created By" name="createdBy" value={form.createdBy} onChange={handleChange} />
        </div>

        {/* Allocations */}
        <div className="p-4 border rounded">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Allocations</h3>
            <button type="button" onClick={addAllocation} className="btn-secondary flex items-center gap-2"><Plus /> Add Allocation</button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-background-muted">
                <tr>
                  <th className="th-cell">#</th>
                  <th className="th-cell">Invoice</th>
                  <th className="th-cell">Invoice Total</th>
                  <th className="th-cell">Allocate</th>
                  <th className="th-cell">Note</th>
                  <th className="th-cell" />
                </tr>
              </thead>
              <tbody>
                {form.allocations.map((a, idx) => {
                  const inv = invoices.find(i => Number(i.id) === Number(a.invoiceId));
                  return (
                    <tr key={idx} className="border-b">
                      <td className="td-cell">{idx + 1}</td>
                      <td className="td-cell">
                        <select name="invoiceId" value={a.invoiceId || ''} onChange={(e) => updateAllocation(idx, e)} className="input">
                          <option value="">Select invoice</option>
                          {invoices.map(invOpt => <option key={invOpt.id} value={invOpt.id}>{invOpt.billNumber || (`#${invOpt.id}`)} — {invOpt.supplierName || ''}</option>)}
                        </select>
                      </td>
                      <td className="td-cell">{inv ? (inv.netTotal ?? 0).toFixed(2) : '—'}</td>
                      <td className="td-cell"><input name="allocatedAmount" type="number" step="0.01" value={a.allocatedAmount || 0} onChange={(e) => updateAllocation(idx, e)} className="input" /></td>
                      <td className="td-cell"><input name="allocationNote" value={a.allocationNote || ''} onChange={(e) => updateAllocation(idx, e)} className="input" /></td>
                      <td className="td-cell"><button type="button" onClick={() => removeAllocation(idx)} className="p-2 text-red-500 rounded"><Trash2 /></button></td>
                    </tr>
                  );
                })}
                {form.allocations.length === 0 && <tr><td colSpan="6" className="text-center py-6 text-foreground-muted">No allocations added</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm space-y-1">
            <div className="flex justify-between"><span>Amount</span><span>{totals.amount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Allocated</span><span>{totals.sumAllocated.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>In Excess</span><span>{totals.amountInExcess.toFixed(2)}</span></div>
          </div>
        </div>

        {/* Attachments (metadata-only) */}
        <div className="p-4 border rounded">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Attachments</h3>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onAddAttachmentClick} className="btn-secondary flex items-center gap-2"><Plus /> Add</button>
            </div>
          </div>

          <input ref={fileInputRef} type="file" className="hidden" onChange={onFileSelected} />

          <div className="space-y-2">
            {form.attachments.length === 0 && <div className="text-sm text-foreground-muted">No attachments added.</div>}
            {form.attachments.map((att, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 border p-2 rounded">
                <div>
                  <div className="font-medium">{att.fileName}</div>
                  <div className="text-xs text-foreground-muted">{att.uploadedAt ? new Date(att.uploadedAt).toLocaleString() : ''}</div>
                  {att.filePath && <div className="text-xs"><a className="text-primary underline" href={att.filePath} target="_blank" rel="noreferrer">Open</a></div>}
                </div>
                <div><button type="button" onClick={() => removeAttachment(idx)} className="p-2 text-red-500 rounded"><Trash2 /></button></div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/purchase-dashboard/payments')} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Save size={16} />} {isEditing ? 'Update' : 'Save'} Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchasePaymentForm;
