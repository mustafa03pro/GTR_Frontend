// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate, useParams, Link } from 'react-router-dom';
// import axios from 'axios';
// import { Plus, Trash2, Save, Loader, ArrowLeft } from 'lucide-react';

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

// const PurchaseInvoiceForm = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const isEditing = Boolean(id);

//     const [formData, setFormData] = useState({
//         billLedger: 'Purchase',
//         supplierId: '',
//         billNumber: '',
//         orderNumber: '',
//         billDate: new Date().toISOString().split('T')[0],
//         dueDate: '',
//         billType: 'Without Discount',
//         notes: '',
//         lines: [],
//         otherCharges: 0,
//     });
//     const [suppliers, setSuppliers] = useState([]);
//     const [rawMaterials, setRawMaterials] = useState([]);
//     const [units, setUnits] = useState([]);
//     const [taxes, setTaxes] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');

//     useEffect(() => {
//         const fetchData = async () => {
//             setLoading(true);
//             try {
//                 const token = localStorage.getItem('token');
//                 const headers = { Authorization: `Bearer ${token}` };

//                 const [suppliersRes, materialsRes, unitsRes, taxesRes] = await Promise.all([
//                     axios.get(`${API_URL}/parties?type=SUPPLIER`, { headers }),
//                     axios.get(`${API_URL}/production/raw-materials`, { headers }),
//                     axios.get(`${API_URL}/production/units`, { headers }),
//                     axios.get(`${API_URL}/production/taxes`, { headers }),
//                 ]);

//                 setSuppliers(suppliersRes.data.content || []);
//                 setRawMaterials(materialsRes.data.content || []);
//                 setUnits(unitsRes.data.content || []);
//                 setTaxes(taxesRes.data.content || []);

//                 if (isEditing) {
//                     const invRes = await axios.get(`${API_URL}/purchases/invoices/${id}`, { headers });
//                     setFormData({
//                         ...invRes.data,
//                         billDate: invRes.data.billDate ? new Date(invRes.data.billDate).toISOString().split('T')[0] : '',
//                         dueDate: invRes.data.dueDate ? new Date(invRes.data.dueDate).toISOString().split('T')[0] : '',
//                         lines: invRes.data.lines || [],
//                     });
//                 }
//             } catch (err) {
//                 console.error("Failed to fetch data:", err);
//                 setError("Failed to load necessary data. Please try again.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [id, isEditing]);

//     const handleHeaderChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleLineChange = (index, e) => {
//         const { name, value } = e.target;
//         const newLines = [...formData.lines];
//         newLines[index] = { ...newLines[index], [name]: value };
//         setFormData(prev => ({ ...prev, lines: newLines }));
//     };

//     const addLine = () => {
//         setFormData(prev => ({
//             ...prev,
//             lines: [
//                 ...prev.lines,
//                 {
//                     lineNumber: prev.lines.length + 1,
//                     itemId: '',
//                     description: '',
//                     quantityNet: 1,
//                     unitId: '',
//                     rate: 0,
//                     taxId: '',
//                     lineDiscount: 0,
//                 }
//             ]
//         }));
//     };

//     const removeLine = (index) => {
//         setFormData(prev => ({
//             ...prev,
//             lines: prev.lines.filter((_, i) => i !== index)
//         }));
//     };

//     const totals = useMemo(() => {
//         let subTotal = 0;
//         let totalDiscount = 0;
//         let totalTax = 0;

//         formData.lines.forEach(line => {
//             const quantity = parseFloat(line.quantityNet) || 0;
//             const rate = parseFloat(line.rate) || 0;
//             const lineDiscount = parseFloat(line.lineDiscount) || 0;
//             const lineAmount = (quantity * rate);
//             const netAmount = lineAmount - lineDiscount;

//             subTotal += lineAmount;
//             totalDiscount += lineDiscount;

//             const taxInfo = taxes.find(t => t.id === parseInt(line.taxId));
//             if (taxInfo) {
//                 const taxRate = parseFloat(line.taxPercent || taxInfo.rate) || 0;
//                 totalTax += netAmount * (taxRate / 100);
//             }
//         });

//         const otherCharges = parseFloat(formData.otherCharges) || 0;
//         const netTotal = (subTotal - totalDiscount) + totalTax + otherCharges;

//         return { subTotal, totalDiscount, totalTax, otherCharges, netTotal };
//     }, [formData.lines, formData.otherCharges, taxes]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');

//         const payload = {
//             ...formData,
//             lines: formData.lines.map(line => ({
//                 ...line,
//                 quantityNet: parseFloat(line.quantityNet) || 0,
//                 rate: parseFloat(line.rate) || 0,
//                 lineDiscount: parseFloat(line.lineDiscount) || 0,
//             }))
//         };

//         try {
//             const token = localStorage.getItem('token');
//             const headers = { Authorization: `Bearer ${token}` };

//             if (isEditing) {
//                 await axios.put(`${API_URL}/purchases/invoices/${id}`, payload, { headers });
//             } else {
//                 await axios.post(`${API_URL}/purchases/invoices`, payload, { headers });
//             }
//             navigate('/purchase-dashboard/bills');
//         } catch (err) {
//             console.error("Failed to save invoice:", err);
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
//                 <h1 className="text-2xl font-bold text-foreground">{isEditing ? `Edit Bill #${formData.billNumber}` : 'New Purchase Bill'}</h1>
//                 <Link to="/purchase-dashboard/bills" className="btn-secondary flex items-center gap-2">
//                     <ArrowLeft size={16} /> Back to List
//                 </Link>
//             </div>

//             {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span className="block sm:inline">{error}</span></div>}

//             <form onSubmit={handleSubmit} className="space-y-8">
//                 {/* Header Section */}
//                 <div className="p-4 border border-border rounded-lg">
//                     <h2 className="text-lg font-semibold text-foreground mb-4">Invoice Details</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                         <SelectField label="Supplier" name="supplierId" value={formData.supplierId} onChange={handleHeaderChange} required>
//                             <option value="">Select Supplier</option>
//                             {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}
//                         </SelectField>
//                         <InputField label="Bill Number" name="billNumber" value={formData.billNumber} onChange={handleHeaderChange} required />
//                         <InputField label="Bill Date" name="billDate" type="date" value={formData.billDate} onChange={handleHeaderChange} required />
//                         <InputField label="Due Date" name="dueDate" type="date" value={formData.dueDate} onChange={handleHeaderChange} />
//                         <InputField label="Order Number" name="orderNumber" value={formData.orderNumber} onChange={handleHeaderChange} placeholder="Optional PO number" />
//                         <SelectField label="Bill Type" name="billType" value={formData.billType} onChange={handleHeaderChange}>
//                             <option value="Without Discount">Without Discount</option>
//                             <option value="With Discount At Item Level">Item Level Discount</option>
//                             <option value="With Discount At Bill Order Level">Bill Level Discount</option>
//                         </SelectField>
//                         <div className="lg:col-span-4">
//                             <label htmlFor="notes" className="block text-sm font-medium text-foreground-muted">Notes</label>
//                             <textarea id="notes" name="notes" value={formData.notes} onChange={handleHeaderChange} rows="3" className="input mt-1 bg-background-muted border-border"></textarea>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Lines Section */}
//                 <div className="p-4 border border-border rounded-lg">
//                     <h2 className="text-lg font-semibold text-foreground mb-4">Items</h2>
//                     <div className="overflow-x-auto">
//                         <table className="min-w-full">
//                             <thead className="bg-background-muted">
//                                 <tr>
//                                     <th className="th-cell text-left">#</th>
//                                     <th className="th-cell text-left w-2/5">Item</th>
//                                     <th className="th-cell text-right">Qty</th>
//                                     <th className="th-cell text-left">Unit</th>
//                                     <th className="th-cell text-right">Rate</th>
//                                     <th className="th-cell text-left">Tax</th>
//                                     <th className="th-cell text-right">Discount</th>
//                                     <th className="th-cell text-right">Amount</th>
//                                     <th className="th-cell"></th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {formData.lines.map((line, index) => (
//                                     <tr key={index} className="border-b border-border">
//                                         <td className="td-cell">{line.lineNumber}</td>
//                                         <td className="td-cell">
//                                             <SelectField name="itemId" value={line.itemId} onChange={(e) => handleLineChange(index, e)} className="input text-sm">
//                                                 <option value="">Select Item</option>
//                                                 {rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
//                                             </SelectField>
//                                         </td>
//                                         <td className="td-cell"><InputField type="number" name="quantityNet" value={line.quantityNet} onChange={(e) => handleLineChange(index, e)} className="input text-right text-sm" /></td>
//                                         <td className="td-cell">
//                                             <SelectField name="unitId" value={line.unitId} onChange={(e) => handleLineChange(index, e)} className="input text-sm">
//                                                 <option value="">Unit</option>
//                                                 {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
//                                             </SelectField>
//                                         </td>
//                                         <td className="td-cell"><InputField type="number" name="rate" value={line.rate} onChange={(e) => handleLineChange(index, e)} className="input text-right text-sm" /></td>
//                                         <td className="td-cell">
//                                             <SelectField name="taxId" value={line.taxId} onChange={(e) => handleLineChange(index, e)} className="input text-sm">
//                                                 <option value="">Tax</option>
//                                                 {taxes.map(t => <option key={t.id} value={t.id}>{t.code} ({t.rate}%)</option>)}
//                                             </SelectField>
//                                         </td>
//                                         <td className="td-cell"><InputField type="number" name="lineDiscount" value={line.lineDiscount} onChange={(e) => handleLineChange(index, e)} className="input text-right text-sm" /></td>
//                                         <td className="td-cell text-right font-medium">{((line.quantityNet || 0) * (line.rate || 0)).toFixed(2)}</td>
//                                         <td className="td-cell">
//                                             <button type="button" onClick={() => removeLine(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
//                                                 <Trash2 size={16} />
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                     <button type="button" onClick={addLine} className="btn-secondary mt-4 flex items-center gap-2">
//                         <Plus size={16} /> Add Line
//                     </button>
//                 </div>

//                 {/* Totals Section */}
//                 <div className="flex justify-end">
//                     <div className="w-full max-w-sm space-y-2 text-sm">
//                         <div className="flex justify-between">
//                             <span className="text-foreground-muted">Subtotal:</span>
//                             <span className="font-medium text-foreground">{totals.subTotal.toFixed(2)}</span>
//                         </div>
//                         <div className="flex justify-between">
//                             <span className="text-foreground-muted">Total Discount:</span>
//                             <span className="font-medium text-foreground">{totals.totalDiscount.toFixed(2)}</span>
//                         </div>
//                         <div className="flex justify-between">
//                             <span className="text-foreground-muted">Total Tax:</span>
//                             <span className="font-medium text-foreground">{totals.totalTax.toFixed(2)}</span>
//                         </div>
//                         <div className="flex justify-between items-center">
//                             <span className="text-foreground-muted">Other Charges:</span>
//                             <InputField type="number" name="otherCharges" value={formData.otherCharges || ''} onChange={handleHeaderChange} className="input text-right text-sm w-24 py-1" />
//                         </div>
//                         <div className="flex justify-between border-t border-border pt-2 mt-2">
//                             <span className="text-lg font-bold text-foreground">Net Total:</span>
//                             <span className="text-lg font-bold text-foreground">{totals.netTotal.toFixed(2)}</span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Actions */}
//                 <div className="flex justify-end gap-4 pt-6 border-t border-border">
//                     <button type="button" onClick={() => navigate('/purchase-dashboard/bills')} className="btn-secondary" disabled={loading}>
//                         Cancel
//                     </button>
//                     <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
//                         {loading ? <Loader className="animate-spin h-4 w-4" /> : <Save size={16} />}
//                         {isEditing ? 'Update' : 'Save'} Bill
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default PurchaseInvoiceForm;



// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate, useParams, Link } from 'react-router-dom';
// import axios from 'axios';
// import { Plus, Trash2, Save, Loader, ArrowLeft } from 'lucide-react';

// const API_URL = import.meta.env.VITE_API_BASE_URL; // e.g. http://localhost:8080 or http://localhost:8080/api base depending on your env

// const InputField = ({ label, ...props }) => (
//   <div>
//     <label htmlFor={props.id || props.name} className="block text-sm font-medium text-foreground-muted">{label}</label>
//     <input {...props} className="input mt-1 bg-background-muted border-border" />
//   </div>
// );

// const SelectField = ({ label, children, ...props }) => (
//   <div>
//     <label htmlFor={props.id || props.name} className="block text-sm font-medium text-foreground-muted">{label}</label>
//     <select {...props} className="input mt-1 bg-background-muted border-border">
//       {children}
//     </select>
//   </div>
// );

// const PurchaseInvoiceForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const isEditing = Boolean(id);

//   const [formData, setFormData] = useState({
//     billLedger: 'Purchase',
//     supplierId: '',
//     billNumber: '',
//     orderNumber: '',
//     billDate: new Date().toISOString().split('T')[0],
//     dueDate: '',
//     billType: 'Without Discount',
//     grossNetEnabled: false,
//     notes: '',
//     lines: [],
//     attachments: [],
//     otherCharges: 0,
//     // server-calculated read-only fields (shown to user but not required to send)
//     subTotal: 0,
//     totalDiscount: 0,
//     grossTotal: 0,
//     totalTax: 0,
//     netTotal: 0,
//     createdBy: ''
//   });

//   // master data
//   const [suppliers, setSuppliers] = useState([]);
//   const [rawMaterials, setRawMaterials] = useState([]);
//   const [units, setUnits] = useState([]);
//   const [taxes, setTaxes] = useState([]);
//   const [categories, setCategories] = useState([]);
//   // cache subcategories per category id: { [categoryId]: [...] }
//   const [subCategoriesByCategory, setSubCategoriesByCategory] = useState({});

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchMasterAndInvoice = async () => {
//       setLoading(true);
//       setError('');
//       try {
//         const token = localStorage.getItem('token');
//         const headers = { Authorization: `Bearer ${token}` };

//         // fetch master data in parallel (use /api/ prefix if your backend expects it)
//         const [
//           suppliersRes,
//           materialsRes,
//           unitsRes,
//           taxesRes,
//           categoriesRes
//         ] = await Promise.all([
//           axios.get(`${API_URL}/parties`, { headers, params: { type: 'SUPPLIER', page: 0, size: 500 } }),
//           axios.get(`${API_URL}/production/raw-materials`, { headers, params: { page: 0, size: 500 } }),
//           axios.get(`${API_URL}/production/units`, { headers, params: { page: 0, size: 500 } }),
//           axios.get(`${API_URL}/production/taxes`, { headers, params: { page: 0, size: 500 } }),
//           axios.get(`${API_URL}/production/categories`, { headers, params: { page: 0, size: 500 } })
//         ]);

//         setSuppliers(suppliersRes.data.content ?? suppliersRes.data ?? []);
//         setRawMaterials(materialsRes.data.content ?? materialsRes.data ?? []);
//         setUnits(unitsRes.data.content ?? unitsRes.data ?? []);
//         setTaxes(taxesRes.data.content ?? taxesRes.data ?? []);
//         setCategories(categoriesRes.data.content ?? categoriesRes.data ?? []);

//         if (isEditing) {
//           const invRes = await axios.get(`${API_URL}/purchases/invoices/${id}`, { headers });
//           const inv = invRes.data;

//           // populate formData - keep server calced totals read-only
//           setFormData(prev => ({
//             ...prev,
//             billLedger: inv.billLedger ?? prev.billLedger,
//             supplierId: inv.supplierId ?? '',
//             billNumber: inv.billNumber ?? '',
//             orderNumber: inv.orderNumber ?? '',
//             billDate: inv.billDate ? new Date(inv.billDate).toISOString().split('T')[0] : '',
//             dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
//             billType: inv.billType ?? prev.billType,
//             grossNetEnabled: inv.grossNetEnabled ?? false,
//             notes: inv.notes ?? '',
//             otherCharges: inv.otherCharges ?? 0,
//             subTotal: inv.subTotal ?? 0,
//             totalDiscount: inv.totalDiscount ?? 0,
//             grossTotal: inv.grossTotal ?? 0,
//             totalTax: inv.totalTax ?? 0,
//             netTotal: inv.netTotal ?? 0,
//             createdBy: inv.createdBy ?? '',
//             lines: (inv.lines || []).map(l => ({
//               id: l.id,
//               lineNumber: l.lineNumber,
//               categoryId: l.categoryId ?? '',
//               subCategoryId: l.subCategoryId ?? '',
//               itemId: l.itemId ?? '',
//               description: l.description ?? '',
//               quantityGross: l.quantityGross ?? '',
//               quantityNet: l.quantityNet ?? 1,
//               unitId: l.unitId ?? '',
//               rate: l.rate ?? 0,
//               amount: l.amount ?? 0,
//               taxId: l.taxId ?? '',
//               taxPercent: l.taxPercent ?? '',
//               lineDiscount: l.lineDiscount ?? 0
//             })),
//             attachments: (inv.attachments || []).map(a => ({
//               id: a.id,
//               fileName: a.fileName,
//               filePath: a.filePath,
//               uploadedBy: a.uploadedBy,
//               uploadedAt: a.uploadedAt
//             }))
//           }));

//           // preload subcategories for categories present in invoice (UX nicety)
//           const catIds = Array.from(new Set((inv.lines || []).map(l => l.categoryId).filter(Boolean)));
//           await Promise.all(catIds.map(cid => fetchSubCategoriesForCategory(cid)));
//         }
//       } catch (err) {
//         console.error("Failed to fetch data:", err);
//         setError("Failed to load necessary data. Check backend endpoints and token.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMasterAndInvoice();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id, isEditing]);

//   // fetch sub-cats for a category and cache
//   const fetchSubCategoriesForCategory = async (categoryId) => {
//     if (!categoryId) return [];
//     if (subCategoriesByCategory[categoryId]) return subCategoriesByCategory[categoryId];

//     try {
//       const token = localStorage.getItem('token');
//       const headers = { Authorization: `Bearer ${token}` };
//       const res = await axios.get(`${API_URL}/production/sub-categories`, { headers, params: { categoryId } });
//       const data = res.data.content ?? res.data ?? [];
//       setSubCategoriesByCategory(prev => ({ ...prev, [categoryId]: data }));
//       return data;
//     } catch (err) {
//       console.warn("No sub-categories or failed to fetch for category", categoryId, err?.response?.status);
//       setSubCategoriesByCategory(prev => ({ ...prev, [categoryId]: [] }));
//       return [];
//     }
//   };

//   const handleHeaderChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value) }));
//   };

//   const handleLineChange = (index, e) => {
//     const { name, value, type, checked } = e.target;
//     const newLines = [...formData.lines];
//     newLines[index] = {
//       ...newLines[index],
//       [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value)
//     };
//     setFormData(prev => ({ ...prev, lines: newLines }));
//   };

//   const addLine = () => {
//     setFormData(prev => ({
//       ...prev,
//       lines: [
//         ...prev.lines,
//         {
//           lineNumber: prev.lines.length + 1,
//           categoryId: '',
//           subCategoryId: '',
//           itemId: '',
//           description: '',
//           quantityGross: '',
//           quantityNet: 1,
//           unitId: '',
//           rate: 0,
//           amount: 0,
//           taxId: '',
//           taxPercent: '',
//           lineDiscount: 0
//         }
//       ]
//     }));
//   };

//   const removeLine = (index) => {
//     setFormData(prev => {
//       const lines = prev.lines.filter((_, i) => i !== index).map((l, idx) => ({ ...l, lineNumber: idx + 1 }));
//       return { ...prev, lines };
//     });
//   };

//   const addAttachment = () => {
//     setFormData(prev => ({
//       ...prev,
//       attachments: [
//         ...(prev.attachments || []),
//         { fileName: '', filePath: '', uploadedBy: prev.createdBy || '', uploadedAt: new Date().toISOString() }
//       ]
//     }));
//   };

//   const removeAttachment = (index) => {
//     setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
//   };

//   const handleAttachmentChange = (index, e) => {
//     const { name, value } = e.target;
//     const atts = [...formData.attachments];
//     atts[index] = { ...atts[index], [name]: value };
//     setFormData(prev => ({ ...prev, attachments: atts }));
//   };

//   // compute client-side totals for preview; server will compute authoritative totals
//   const totalsPreview = useMemo(() => {
//     let subTotal = 0;
//     let totalDiscount = 0;
//     let totalTax = 0;

//     formData.lines.forEach(line => {
//       const q = parseFloat(line.quantityNet) || 0;
//       const rate = parseFloat(line.rate) || 0;
//       const discount = parseFloat(line.lineDiscount) || 0;
//       const amount = parseFloat(line.amount) || (q * rate);
//       const netAmount = Math.max(0, amount - discount);

//       subTotal += amount;
//       totalDiscount += discount;

//       // get tax percent either from line override or tax master
//       const taxMaster = taxes.find(t => Number(t.id) === Number(line.taxId));
//       const taxRate = parseFloat(line.taxPercent ?? (taxMaster ? taxMaster.rate : 0)) || 0;
//       if (!line.taxExempt && taxRate > 0) {
//         totalTax += netAmount * (taxRate / 100);
//       }
//     });

//     const otherCharges = parseFloat(formData.otherCharges) || 0;
//     const gross = subTotal.subtract ? subTotal.subtract(totalDiscount) : (subTotal - totalDiscount); // safe for numbers
//     const net = (subTotal - totalDiscount) + totalTax + otherCharges;
//     return {
//       subTotal,
//       totalDiscount,
//       totalTax,
//       otherCharges,
//       grossTotal: (subTotal - totalDiscount) + totalTax,
//       netTotal: net
//     };
//   }, [formData.lines, formData.otherCharges, taxes]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     // Build payload matching PurPurchaseInvoiceRequest
//     const payload = {
//       billLedger: formData.billLedger,
//       supplierId: formData.supplierId || null,
//       billNumber: formData.billNumber || null,
//       orderNumber: formData.orderNumber || null,
//       billDate: formData.billDate,
//       dueDate: formData.dueDate || null,
//       billType: formData.billType,
//       grossNetEnabled: !!formData.grossNetEnabled,
//       notes: formData.notes || null,
//       otherCharges: formData.otherCharges ? Number(formData.otherCharges) : null,
//       createdBy: formData.createdBy || null,
//       // lines -> PurPurchaseInvoiceItemRequest
//       lines: (formData.lines || []).map(l => ({
//         lineNumber: l.lineNumber,
//         categoryId: l.categoryId || null,
//         subCategoryId: l.subCategoryId || null,
//         itemId: l.itemId || null,
//         description: l.description || null,
//         quantityGross: l.quantityGross !== '' ? (Number(l.quantityGross) || null) : null,
//         quantityNet: l.quantityNet !== '' ? (Number(l.quantityNet) || 0) : 0,
//         unitId: l.unitId || null,
//         rate: l.rate !== '' ? (Number(l.rate) || 0) : 0,
//         amount: l.amount !== '' ? (Number(l.amount) || null) : null,
//         taxId: l.taxId || null,
//         taxPercent: l.taxPercent !== '' ? (Number(l.taxPercent) || null) : null,
//         lineDiscount: l.lineDiscount !== '' ? (Number(l.lineDiscount) || 0) : 0
//       })),
//       attachments: (formData.attachments || []).map(a => ({
//         fileName: a.fileName || null,
//         filePath: a.filePath || null,
//         uploadedBy: a.uploadedBy || formData.createdBy || null,
//         uploadedAt: a.uploadedAt || null
//       }))
//     };

//     try {
//       const token = localStorage.getItem('token');
//       const headers = { Authorization: `Bearer ${token}` };

//       if (isEditing) {
//         await axios.put(`${API_URL}/purchases/invoices/${id}`, payload, { headers });
//       } else {
//         await axios.post(`${API_URL}/purchases/invoices`, payload, { headers });
//       }

//       navigate('/purchase-dashboard/bills');
//     } catch (err) {
//       console.error("Failed to save invoice:", err);
//       setError(err.response?.data?.message || "An error occurred while saving.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading && !isEditing) {
//     return <div className="flex justify-center items-center h-64"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
//   }

//   return (
//     <div className="bg-card p-6 rounded-xl shadow-sm">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-foreground">{isEditing ? `Edit Bill #${formData.billNumber}` : 'New Purchase Bill'}</h1>
//         <Link to="/purchase-dashboard/bills" className="btn-secondary flex items-center gap-2">
//           <ArrowLeft size={16} /> Back to List
//         </Link>
//       </div>

//       {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span className="block sm:inline">{error}</span></div>}

//       <form onSubmit={handleSubmit} className="space-y-8">
//         {/* Header Section */}
//         <div className="p-4 border border-border rounded-lg">
//           <h2 className="text-lg font-semibold text-foreground mb-4">Invoice Details</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             <SelectField label="Bill Ledger" name="billLedger" value={formData.billLedger} onChange={handleHeaderChange}>
//               <option value="Purchase">Purchase</option>
//               <option value="Purchase (Import)">Purchase (Import)</option>
//             </SelectField>

//             <SelectField label="Supplier" name="supplierId" value={formData.supplierId} onChange={handleHeaderChange} required>
//               <option value="">Select Supplier</option>
//               {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName || s.name || `${s.firstName || ''} ${s.lastName || ''}`}</option>)}
//             </SelectField>

//             <InputField label="Bill Number" name="billNumber" value={formData.billNumber} onChange={handleHeaderChange} required />
//             <InputField label="Order Number (PO #)" name="orderNumber" value={formData.orderNumber} onChange={handleHeaderChange} />

//             <InputField label="Bill Date" name="billDate" type="date" value={formData.billDate} onChange={handleHeaderChange} required />
//             <InputField label="Due Date" name="dueDate" type="date" value={formData.dueDate} onChange={handleHeaderChange} />

//             <SelectField label="Bill Type" name="billType" value={formData.billType} onChange={handleHeaderChange}>
//               <option value="Without Discount">Without Discount</option>
//               <option value="With Discount At Item Level">With Discount At Item Level</option>
//               <option value="With Discount At Bill Order Level">With Discount At Bill Order Level</option>
//             </SelectField>

//             <div className="flex items-center gap-2">
//               <input id="grossNetEnabled" name="grossNetEnabled" type="checkbox" checked={!!formData.grossNetEnabled} onChange={handleHeaderChange} />
//               <label htmlFor="grossNetEnabled" className="text-sm">Enable Gross/Net Quantities</label>
//             </div>

//             <div className="lg:col-span-4">
//               <label htmlFor="notes" className="block text-sm font-medium text-foreground-muted">Notes</label>
//               <textarea id="notes" name="notes" value={formData.notes} onChange={handleHeaderChange} rows="3" className="input mt-1 bg-background-muted border-border"></textarea>
//             </div>

//             <InputField label="Created By" name="createdBy" value={formData.createdBy} onChange={handleHeaderChange} />
//           </div>
//         </div>

//         {/* Lines */}
//         <div className="p-4 border border-border rounded-lg">
//           <h2 className="text-lg font-semibold text-foreground mb-4">Items</h2>
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="bg-background-muted">
//                 <tr>
//                   <th className="th-cell">#</th>
//                   <th className="th-cell w-48">Category</th>
//                   <th className="th-cell w-48">Subcategory</th>
//                   <th className="th-cell">Item / Description</th>
//                   <th className="th-cell">Qty (Gross)</th>
//                   <th className="th-cell">Qty (Net)</th>
//                   <th className="th-cell">Unit</th>
//                   <th className="th-cell">Rate</th>
//                   <th className="th-cell">Amount</th>
//                   <th className="th-cell">Tax</th>
//                   <th className="th-cell">Tax %</th>
//                   <th className="th-cell">Discount</th>
//                   <th className="th-cell"></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {formData.lines.map((line, idx) => {
//                   const amt = parseFloat(line.amount) || ((parseFloat(line.quantityNet) || 0) * (parseFloat(line.rate) || 0));
//                   return (
//                     <tr key={idx} className="border-b border-border">
//                       <td className="td-cell">{line.lineNumber}</td>

//                       <td className="td-cell">
//                         <select
//                           name="categoryId"
//                           value={line.categoryId || ''}
//                           onChange={async (e) => {
//                             handleLineChange(idx, e);
//                             const newCat = e.target.value;
//                             await fetchSubCategoriesForCategory(newCat);
//                             // clear subCategoryId when category changes
//                             setFormData(prev => {
//                               const lines = [...prev.lines];
//                               lines[idx] = { ...lines[idx], subCategoryId: '' };
//                               return { ...prev, lines };
//                             });
//                           }}
//                           className="input text-sm"
//                         >
//                           <option value="">Category</option>
//                           {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                         </select>
//                       </td>

//                       <td className="td-cell">
//                         <select name="subCategoryId" value={line.subCategoryId || ''} onChange={(e) => handleLineChange(idx, e)} className="input text-sm">
//                           <option value="">Subcategory</option>
//                           {(subCategoriesByCategory[line.categoryId] || []).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
//                         </select>
//                       </td>

//                       <td className="td-cell">
//                         <select name="itemId" value={line.itemId || ''} onChange={(e) => handleLineChange(idx, e)} className="input text-sm">
//                           <option value="">Select Item</option>
//                           {rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
//                         </select>
//                         <input name="description" value={line.description || ''} onChange={(e) => handleLineChange(idx, e)} placeholder="Description (optional)" className="input mt-1 text-sm" />
//                       </td>

//                       <td className="td-cell"><input type="number" name="quantityGross" value={line.quantityGross ?? ''} onChange={(e) => handleLineChange(idx, e)} className="input text-sm" /></td>
//                       <td className="td-cell"><input type="number" name="quantityNet" value={line.quantityNet ?? ''} onChange={(e) => handleLineChange(idx, e)} className="input text-sm" /></td>

//                       <td className="td-cell">
//                         <select name="unitId" value={line.unitId || ''} onChange={(e) => handleLineChange(idx, e)} className="input text-sm">
//                           <option value="">Unit</option>
//                           {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
//                         </select>
//                       </td>

//                       <td className="td-cell"><input type="number" name="rate" value={line.rate ?? 0} onChange={(e) => handleLineChange(idx, e)} className="input text-right text-sm" /></td>

//                       <td className="td-cell text-right font-medium">{(amt || 0).toFixed(4)}</td>

//                       <td className="td-cell">
//                         <select name="taxId" value={line.taxId || ''} onChange={(e) => handleLineChange(idx, e)} className="input text-sm">
//                           <option value="">Tax</option>
//                           {taxes.map(t => <option key={t.id} value={t.id}>{t.code} ({t.rate}%)</option>)}
//                         </select>
//                       </td>

//                       <td className="td-cell"><input type="number" name="taxPercent" value={line.taxPercent ?? ''} onChange={(e) => handleLineChange(idx, e)} className="input text-right text-sm" placeholder="override %" /></td>

//                       <td className="td-cell"><input type="number" name="lineDiscount" value={line.lineDiscount ?? 0} onChange={(e) => handleLineChange(idx, e)} className="input text-right text-sm" /></td>

//                       <td className="td-cell">
//                         <button type="button" onClick={() => removeLine(idx)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
//                           <Trash2 size={16} />
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           <button type="button" onClick={addLine} className="btn-secondary mt-4 flex items-center gap-2">
//             <Plus size={16} /> Add Line
//           </button>
//         </div>

//         {/* Attachments */}
//         <div className="p-4 border border-border rounded-lg">
//           <h2 className="text-lg font-semibold text-foreground mb-4">Attachments</h2>
//           <div className="space-y-3">
//             {(formData.attachments || []).map((att, idx) => (
//               <div key={idx} className="grid grid-cols-6 gap-2 items-center">
//                 <input name="fileName" value={att.fileName || ''} onChange={(e) => handleAttachmentChange(idx, e)} placeholder="File name" className="input col-span-2" />
//                 <input name="filePath" value={att.filePath || ''} onChange={(e) => handleAttachmentChange(idx, e)} placeholder="Path / URL" className="input col-span-3" />
//                 <button type="button" onClick={() => removeAttachment(idx)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={16} /></button>
//                 <input name="uploadedBy" value={att.uploadedBy || ''} onChange={(e) => handleAttachmentChange(idx, e)} placeholder="Uploaded by" className="input col-span-2 mt-2" />
//                 <input name="uploadedAt" value={att.uploadedAt || ''} onChange={(e) => handleAttachmentChange(idx, e)} type="datetime-local" className="input col-span-4 mt-2" />
//               </div>
//             ))}
//           </div>
//           <button type="button" onClick={addAttachment} className="btn-secondary mt-4 flex items-center gap-2">
//             <Plus size={16} /> Add Attachment
//           </button>
//         </div>

//         {/* Totals (server authoritative) */}
//         <div className="flex justify-end">
//           <div className="w-full max-w-sm space-y-2 text-sm">
//             <div className="flex justify-between">
//               <span className="text-foreground-muted">Subtotal:</span>
//               <span className="font-medium text-foreground">{(formData.subTotal ?? totalsPreview.subTotal ?? 0).toFixed(4)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-foreground-muted">Total Discount:</span>
//               <span className="font-medium text-foreground">{(formData.totalDiscount ?? totalsPreview.totalDiscount ?? 0).toFixed(4)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-foreground-muted">Total Tax:</span>
//               <span className="font-medium text-foreground">{(formData.totalTax ?? totalsPreview.totalTax ?? 0).toFixed(4)}</span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-foreground-muted">Other Charges:</span>
//               <InputField type="number" name="otherCharges" value={formData.otherCharges ?? 0} onChange={handleHeaderChange} className="input text-right text-sm w-24 py-1" />
//             </div>
//             <div className="flex justify-between">
//               <span className="text-foreground-muted">Gross Total:</span>
//               <span className="font-medium text-foreground">{(formData.grossTotal ?? totalsPreview.grossTotal ?? 0).toFixed(4)}</span>
//             </div>
//             <div className="flex justify-between border-t border-border pt-2 mt-2">
//               <span className="text-lg font-bold text-foreground">Net Total:</span>
//               <span className="text-lg font-bold text-foreground">{(formData.netTotal ?? totalsPreview.netTotal ?? 0).toFixed(4)}</span>
//             </div>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex justify-end gap-4 pt-6 border-t border-border">
//           <button type="button" onClick={() => navigate('/purchase-dashboard/bills')} className="btn-secondary" disabled={loading}>
//             Cancel
//           </button>
//           <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
//             {loading ? <Loader className="animate-spin h-4 w-4" /> : <Save size={16} />}
//             {isEditing ? 'Update' : 'Save'} Bill
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default PurchaseInvoiceForm;




import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { Plus, Trash2, Save, Loader, ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL || "";

// Small input/select helpers to keep markup tidy
const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-foreground-muted">{label}</label>
    <input {...props} className="input mt-1 bg-background-muted border-border" />
  </div>
);
const SelectField = ({ label, children, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-foreground-muted">{label}</label>
    <select {...props} className="input mt-1 bg-background-muted border-border">{children}</select>
  </div>
);

/**
 * PurchaseInvoiceForm
 *
 * - Aligns fields to PurPurchaseInvoiceRequest and PurPurchaseInvoiceItemRequest DTOs.
 * - Lines include quantityGross, quantityNet, rate, amount, taxPercent, lineDiscount (matching backend types).
 * - Attachments: single "Add Attachment" button only — no upload endpoint call. Clicking it opens file picker,
 *   the frontend captures file.name and current timestamp and stores filePath as empty string. That metadata is
 *   sent to backend as part of invoice.create/update.
 */
const PurchaseInvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    billLedger: "Purchase",
    supplierId: "",
    billNumber: "",
    orderNumber: "",
    billDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    billType: "Without Discount",
    grossNetEnabled: false,
    notes: "",
    lines: [],
    attachments: [], // each: { fileName, filePath, uploadedBy, uploadedAt }
    otherCharges: 0,
    createdBy: ""
  });

  const [suppliers, setSuppliers] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [units, setUnits] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategoriesByCategory, setSubCategoriesByCategory] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingIndicator, setUploadingIndicator] = useState(false); // small UI indicator for "processing" attachments
  const [error, setError] = useState("");

  useEffect(() => {
    // load master data and invoice if editing
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [
          suppliersRes,
          materialsRes,
          unitsRes,
          taxesRes,
          categoriesRes
        ] = await Promise.all([
          axios.get(`${API_URL}/parties`, { headers, params: { type: "SUPPLIER", page: 0, size: 500 } }),
          axios.get(`${API_URL}/production/raw-materials`, { headers, params: { page: 0, size: 500 } }),
          axios.get(`${API_URL}/production/units`, { headers, params: { page: 0, size: 500 } }),
          axios.get(`${API_URL}/production/taxes`, { headers, params: { page: 0, size: 500 } }),
          axios.get(`${API_URL}/production/categories`, { headers, params: { page: 0, size: 500 } })
        ]);

        setSuppliers(suppliersRes.data.content ?? suppliersRes.data ?? []);
        setRawMaterials(materialsRes.data.content ?? materialsRes.data ?? []);
        setUnits(unitsRes.data.content ?? unitsRes.data ?? []);
        setTaxes(taxesRes.data.content ?? taxesRes.data ?? []);
        setCategories(categoriesRes.data.content ?? categoriesRes.data ?? []);

        if (isEditing) {
          const invRes = await axios.get(`${API_URL}/purchases/invoices/${id}`, { headers });
          const inv = invRes.data;
          setFormData(prev => ({
            ...prev,
            billLedger: inv.billLedger ?? prev.billLedger,
            supplierId: inv.supplierId ?? "",
            billNumber: inv.billNumber ?? "",
            orderNumber: inv.orderNumber ?? "",
            billDate: inv.billDate ? new Date(inv.billDate).toISOString().split("T")[0] : prev.billDate,
            dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split("T")[0] : "",
            billType: inv.billType ?? prev.billType,
            grossNetEnabled: !!inv.grossNetEnabled,
            notes: inv.notes ?? "",
            otherCharges: inv.otherCharges ?? 0,
            createdBy: inv.createdBy ?? "",
            lines: (inv.lines || []).map(l => ({
              id: l.id,
              lineNumber: l.lineNumber,
              categoryId: l.categoryId ?? "",
              subCategoryId: l.subCategoryId ?? "",
              itemId: l.itemId ?? "",
              description: l.description ?? "",
              quantityGross: l.quantityGross ?? "",
              quantityNet: l.quantityNet ?? 1,
              unitId: l.unitId ?? "",
              rate: l.rate ?? 0,
              amount: l.amount ?? ((l.quantityNet ?? 0) * (l.rate ?? 0)),
              taxId: l.taxId ?? "",
              taxPercent: l.taxPercent ?? "",
              lineDiscount: l.lineDiscount ?? 0
            })),
            attachments: (inv.attachments || []).map(a => ({
              id: a.id,
              fileName: a.fileName,
              filePath: a.filePath,
              uploadedBy: a.uploadedBy,
              uploadedAt: a.uploadedAt
            }))
          }));

          // preload subcategories used by invoice lines (UX)
          const catIds = Array.from(new Set((inv.lines || []).map(l => l.categoryId).filter(Boolean)));
          await Promise.all(catIds.map(cid => fetchSubCategoriesForCategory(cid)));
        }
      } catch (err) {
        console.error("Failed to load masters or invoice", err);
        setError("Failed to load required data. Check backend endpoints/token.");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing]);

  // load subcategories for a category (cached)
  const fetchSubCategoriesForCategory = async (categoryId) => {
    if (!categoryId) return [];
    if (subCategoriesByCategory[categoryId]) return subCategoriesByCategory[categoryId];
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_URL}/production/sub-categories`, { headers, params: { categoryId } });
      const payload = res.data.content ?? res.data ?? [];
      setSubCategoriesByCategory(prev => ({ ...prev, [categoryId]: payload }));
      return payload;
    } catch (err) {
      console.warn("Failed to fetch subcategories", categoryId, err);
      setSubCategoriesByCategory(prev => ({ ...prev, [categoryId]: [] }));
      return [];
    }
  };

  // handle top-level changes
  const handleHeaderChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : (type === "number" ? (value === "" ? "" : Number(value)) : value);
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  // line changes: align to backend field names quantityGross/Net etc.
  const handleLineChange = async (index, e) => {
    const { name, value, type } = e.target;
    setFormData(prev => {
      const lines = [...prev.lines];
      const rawVal = type === "number" ? (value === "" ? "" : Number(value)) : value;
      lines[index] = { ...lines[index], [name]: rawVal };

      // Auto compute amount when qty/rate/discount change (backend will be authoritative on save)
      const qty = Number(lines[index].quantityNet || 0);
      const rate = Number(lines[index].rate || 0);
      const discount = Number(lines[index].lineDiscount || 0);
      if (name !== "amount") {
        lines[index].amount = Math.max(0, (qty * rate) - discount);
      } else {
        lines[index].amount = Number(rawVal || 0);
      }

      return { ...prev, lines };
    });

    // if category changed, fetch subcategories and clear subCategory
    if (e.target.name === "categoryId") {
      const catId = e.target.value;
      await fetchSubCategoriesForCategory(catId);
      setFormData(prev => {
        const lines = [...prev.lines];
        lines[index] = { ...lines[index], subCategoryId: "" };
        return { ...prev, lines };
      });
    }
  };

  const addLine = () => {
    setFormData(prev => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          lineNumber: prev.lines.length + 1,
          categoryId: "",
          subCategoryId: "",
          itemId: "",
          description: "",
          quantityGross: "",
          quantityNet: 1,
          unitId: "",
          rate: 0,
          amount: 0,
          taxId: "",
          taxPercent: "",
          lineDiscount: 0
        }
      ]
    }));
  };
  const removeLine = (index) => {
    setFormData(prev => {
      const lines = prev.lines.filter((_, i) => i !== index).map((l, idx) => ({ ...l, lineNumber: idx + 1 }));
      return { ...prev, lines };
    });
  };

  // Attachments: single Add Attachment button only.
  // We do NOT call a server upload endpoint here. We only capture metadata:
  // { fileName, filePath: '', uploadedBy, uploadedAt } and send to backend in invoice payload.
  const onAddAttachmentClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const onFileSelected = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadingIndicator(true);
    setTimeout(() => {
      // simulate small delay for UX
      const att = {
        id: null,
        fileName: file.name,
        filePath: "", // intentionally empty because we are not uploading bytes here
        uploadedBy: formData.createdBy || "",
        uploadedAt: new Date().toISOString()
      };
      setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), att] }));
      setUploadingIndicator(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 300);
  };

  const removeAttachment = (idx) => {
    setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }));
  };

  // totals: compute preview client-side; backend will also compute authoritative totals on save
  const totalsPreview = useMemo(() => {
    let subTotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    (formData.lines || []).forEach(line => {
      const qty = Number(line.quantityNet || 0);
      const rate = Number(line.rate || 0);
      const discount = Number(line.lineDiscount || 0);
      const amount = Number(line.amount ?? (qty * rate));
      const netAmount = Math.max(0, amount - discount);

      subTotal += amount;
      totalDiscount += discount;

      // tax percent: use line.taxPercent override else use tax master rate
      const masterTax = taxes.find(t => Number(t.id) === Number(line.taxId));
      const taxRate = Number(line.taxPercent ?? (masterTax ? masterTax.rate : 0)) || 0;
      if (taxRate > 0) totalTax += (netAmount * (taxRate / 100));
    });

    const otherCharges = Number(formData.otherCharges || 0);
    const gross = (subTotal - totalDiscount) + totalTax;
    const net = gross + otherCharges;

    return {
      subTotal,
      totalDiscount,
      totalTax,
      otherCharges,
      grossTotal: gross,
      netTotal: net
    };
  }, [formData.lines, formData.otherCharges, taxes]);

  const validate = () => {
    if (!formData.billDate) return "Bill date required";
    if (!formData.supplierId) return "Supplier required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setLoading(true);
    setError("");

    // Build payload matching backend DTOs
    const payload = {
      billLedger: formData.billLedger,
      supplierId: formData.supplierId || null,
      billNumber: formData.billNumber || null,
      orderNumber: formData.orderNumber || null,
      billDate: formData.billDate,
      dueDate: formData.dueDate || null,
      billType: formData.billType,
      grossNetEnabled: !!formData.grossNetEnabled,
      notes: formData.notes || null,
      otherCharges: formData.otherCharges ? Number(formData.otherCharges) : 0,
      createdBy: formData.createdBy || null,
      lines: (formData.lines || []).map(l => ({
        lineNumber: l.lineNumber,
        categoryId: l.categoryId || null,
        subCategoryId: l.subCategoryId || null,
        itemId: l.itemId || null,
        description: l.description || null,
        quantityGross: l.quantityGross !== "" ? Number(l.quantityGross) : null,
        quantityNet: l.quantityNet !== "" ? Number(l.quantityNet) : 0,
        unitId: l.unitId || null,
        rate: l.rate !== "" ? Number(l.rate) : 0,
        amount: l.amount !== "" ? Number(l.amount) : null,
        taxId: l.taxId || null,
        taxPercent: l.taxPercent !== "" ? Number(l.taxPercent) : null,
        lineDiscount: l.lineDiscount !== "" ? Number(l.lineDiscount) : 0
      })),
      attachments: (formData.attachments || []).map(a => ({
        fileName: a.fileName || null,
        filePath: a.filePath || null,
        uploadedBy: a.uploadedBy || formData.createdBy || null,
        uploadedAt: a.uploadedAt || null
      }))
    };

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      if (isEditing) {
        await axios.put(`${API_URL}/purchases/invoices/${id}`, payload, { headers });
      } else {
        await axios.post(`${API_URL}/purchases/invoices`, payload, { headers });
      }
      navigate("/purchase-dashboard/bills");
    } catch (err) {
      console.error("Failed to save invoice", err);
      setError(err?.response?.data?.message || "Failed to save invoice.");
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
        <h1 className="text-2xl font-bold text-foreground">{isEditing ? `Edit Bill #${formData.billNumber}` : "New Purchase Bill"}</h1>
        <Link to="/purchase-dashboard/bills" className="btn-secondary flex items-center gap-2">
          <ArrowLeft size={16} /> Back to List
        </Link>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="p-4 border border-border rounded-lg">
          <h2 className="text-lg font-semibold text-foreground mb-4">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SelectField label="Bill Ledger" name="billLedger" value={formData.billLedger} onChange={handleHeaderChange}>
              <option value="Purchase">Purchase</option>
            </SelectField>

            <SelectField label="Supplier" name="supplierId" value={formData.supplierId} onChange={handleHeaderChange}>
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName || s.name || `${s.firstName || ""} ${s.lastName || ""}`}</option>)}
            </SelectField>

            <InputField label="Bill Number" name="billNumber" value={formData.billNumber} onChange={handleHeaderChange} />
            <InputField label="Order Number (PO #)" name="orderNumber" value={formData.orderNumber} onChange={handleHeaderChange} />

            <InputField label="Bill Date" name="billDate" type="date" value={formData.billDate} onChange={handleHeaderChange} />
            <InputField label="Due Date" name="dueDate" type="date" value={formData.dueDate} onChange={handleHeaderChange} />

            <SelectField label="Bill Type" name="billType" value={formData.billType} onChange={handleHeaderChange}>
              <option value="Without Discount">Without Discount</option>
              <option value="With Discount At Item Level">With Discount At Item Level</option>
              <option value="With Discount At Bill Order Level">With Discount At Bill Order Level</option>
            </SelectField>

            <div className="flex items-center gap-2">
              <input id="grossNetEnabled" name="grossNetEnabled" type="checkbox" checked={!!formData.grossNetEnabled} onChange={handleHeaderChange} />
              <label htmlFor="grossNetEnabled" className="text-sm">Enable Gross/Net Quantities</label>
            </div>

            <div className="lg:col-span-4">
              <label className="block text-sm font-medium text-foreground-muted">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleHeaderChange} rows={3} className="input mt-1 bg-background-muted border-border" />
            </div>

            <InputField label="Created By" name="createdBy" value={formData.createdBy} onChange={handleHeaderChange} />
          </div>
        </div>

        {/* Lines */}
        <div className="p-4 border border-border rounded-lg">
          <h2 className="text-lg font-semibold text-foreground mb-4">Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-background-muted">
                <tr>
                  <th className="th-cell">#</th>
                  <th className="th-cell">Category</th>
                  <th className="th-cell">Subcategory</th>
                  <th className="th-cell">Item / Description</th>
                  <th className="th-cell">Qty (Gross)</th>
                  <th className="th-cell">Qty (Net)</th>
                  <th className="th-cell">Unit</th>
                  <th className="th-cell">Rate</th>
                  <th className="th-cell">Amount</th>
                  <th className="th-cell">Tax</th>
                  <th className="th-cell">Tax %</th>
                  <th className="th-cell">Discount</th>
                  <th className="th-cell"></th>
                </tr>
              </thead>
              <tbody>
                {formData.lines.map((line, idx) => {
                  const computedAmount = Number(line.amount ?? (Number(line.quantityNet || 0) * Number(line.rate || 0)));
                  return (
                    <tr key={idx} className="border-b border-border">
                      <td className="td-cell">{line.lineNumber}</td>

                      <td className="td-cell">
                        <select
                          name="categoryId"
                          value={line.categoryId || ""}
                          onChange={async (e) => {
                            await handleLineChange(idx, e);
                            await fetchSubCategoriesForCategory(e.target.value);
                          }}
                          className="input text-sm"
                        >
                          <option value="">Category</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </td>

                      <td className="td-cell">
                        <select name="subCategoryId" value={line.subCategoryId || ""} onChange={(e) => handleLineChange(idx, e)} className="input text-sm">
                          <option value="">Subcategory</option>
                          {(subCategoriesByCategory[line.categoryId] || []).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                        </select>
                      </td>

                      <td className="td-cell">
                        <select name="itemId" value={line.itemId || ""} onChange={(e) => handleLineChange(idx, e)} className="input text-sm">
                          <option value="">Select Item</option>
                          {rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                        <input name="description" value={line.description || ""} onChange={(e) => handleLineChange(idx, e)} placeholder="Description (optional)" className="input mt-1 text-sm" />
                      </td>

                      <td className="td-cell"><input type="number" name="quantityGross" value={line.quantityGross ?? ""} onChange={(e) => handleLineChange(idx, e)} className="input text-sm" /></td>
                      <td className="td-cell"><input type="number" name="quantityNet" value={line.quantityNet ?? ""} onChange={(e) => handleLineChange(idx, e)} className="input text-sm" /></td>

                      <td className="td-cell">
                        <select name="unitId" value={line.unitId || ""} onChange={(e) => handleLineChange(idx, e)} className="input text-sm">
                          <option value="">Unit</option>
                          {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                      </td>

                      <td className="td-cell"><input type="number" name="rate" value={line.rate ?? 0} onChange={(e) => handleLineChange(idx, e)} className="input text-right text-sm" /></td>

                      <td className="td-cell text-right font-medium">{(computedAmount || 0).toFixed(4)}</td>

                      <td className="td-cell">
                        <select name="taxId" value={line.taxId || ""} onChange={(e) => handleLineChange(idx, e)} className="input text-sm">
                          <option value="">Tax</option>
                          {taxes.map(t => <option key={t.id} value={t.id}>{t.code} ({t.rate}%)</option>)}
                        </select>
                      </td>

                      <td className="td-cell"><input type="number" name="taxPercent" value={line.taxPercent ?? ""} onChange={(e) => handleLineChange(idx, e)} className="input text-right text-sm" placeholder="override %" /></td>

                      <td className="td-cell"><input type="number" name="lineDiscount" value={line.lineDiscount ?? 0} onChange={(e) => handleLineChange(idx, e)} className="input text-right text-sm" /></td>

                      <td className="td-cell">
                        <button type="button" onClick={() => removeLine(idx)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={addLine} className="btn-secondary mt-4 flex items-center gap-2"><Plus size={16} /> Add Line</button>
        </div>

        {/* Attachments - single button only */}
        <div className="p-4 border border-border rounded-lg">
          <h2 className="text-lg font-semibold text-foreground mb-4">Attachments</h2>

          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-foreground-muted">{(formData.attachments || []).length} uploaded</div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onAddAttachmentClick} className="btn-secondary flex items-center gap-2" disabled={uploadingIndicator}>
                <Plus /> Add Attachment
              </button>
              {uploadingIndicator && <span className="text-sm">Processing...</span>}
            </div>
          </div>

          {/* hidden file input to capture file name only */}
          <input ref={fileInputRef} type="file" className="hidden" onChange={onFileSelected} />

          <div className="space-y-2">
            {formData.attachments.length === 0 && <div className="text-sm text-foreground-muted">No attachments uploaded.</div>}
            {formData.attachments.map((att, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 border p-2 rounded">
                <div>
                  <div className="font-medium">{att.fileName}</div>
                  <div className="text-xs text-foreground-muted">{att.uploadedAt ? new Date(att.uploadedAt).toLocaleString() : ""}</div>
                  {att.filePath && <div className="text-xs"><a className="text-primary underline" href={att.filePath} target="_blank" rel="noreferrer">Open</a></div>}
                </div>
                <div><button type="button" onClick={() => removeAttachment(idx)} className="p-2 text-red-500 rounded"><Trash2 /></button></div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals preview */}
        <div className="flex justify-end">
          <div className="w-full max-w-sm space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-foreground-muted">Subtotal:</span><span className="font-medium text-foreground">{totalsPreview.subTotal.toFixed(4)}</span></div>
            <div className="flex justify-between"><span className="text-foreground-muted">Total Discount:</span><span className="font-medium text-foreground">{totalsPreview.totalDiscount.toFixed(4)}</span></div>
            <div className="flex justify-between"><span className="text-foreground-muted">Total Tax:</span><span className="font-medium text-foreground">{totalsPreview.totalTax.toFixed(4)}</span></div>
            <div className="flex justify-between items-center">
              <span className="text-foreground-muted">Other Charges:</span>
              <input type="number" name="otherCharges" value={formData.otherCharges ?? 0} onChange={handleHeaderChange} className="input text-right text-sm w-24 py-1" />
            </div>
            <div className="flex justify-between"><span className="text-foreground-muted">Gross Total:</span><span className="font-medium text-foreground">{totalsPreview.grossTotal.toFixed(4)}</span></div>
            <div className="flex justify-between border-t border-border pt-2 mt-2"><span className="text-lg font-bold text-foreground">Net Total:</span><span className="text-lg font-bold text-foreground">{totalsPreview.netTotal.toFixed(4)}</span></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-border">
          <button type="button" onClick={() => navigate("/purchase-dashboard/bills")} className="btn-secondary" disabled={loading}>Cancel</button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Save size={16} />} {isEditing ? "Update" : "Save"} Bill
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseInvoiceForm;
