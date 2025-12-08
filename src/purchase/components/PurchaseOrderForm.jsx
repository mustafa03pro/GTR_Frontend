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

// const PurchaseOrderForm = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const isEditing = Boolean(id);

//     const [formData, setFormData] = useState({
//         orderCategory: 'Domestic',
//         supplierId: '',
//         poNumber: '',
//         reference: '',
//         date: new Date().toISOString().split('T')[0],
//         discountMode: 'Without Discount',
//         currency: 'AED',
//         remark: '',
//         status: 'Draft',
//         items: [],
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
//                     axios.get(`${API_URL}/parties?type=SUPPLIER`, { headers }), // Assuming this is the correct path for suppliers
//                     axios.get(`${API_URL}/production/raw-materials`, { headers }),
//                     axios.get(`${API_URL}/production/units`, { headers }),
//                     axios.get(`${API_URL}/production/taxes`, { headers }),
//                 ]);

//                 setSuppliers(suppliersRes.data.content || []);
//                 setRawMaterials(materialsRes.data.content || []);
//                 setUnits(unitsRes.data.content || []);
//                 setTaxes(taxesRes.data.content || []);

//                 if (isEditing) {
//                     const poRes = await axios.get(`${API_URL}/api/purchase/orders/${id}`, { headers });
//                     setFormData({
//                         ...poRes.data,
//                         date: poRes.data.date ? new Date(poRes.data.date).toISOString().split('T')[0] : '',
//                         items: poRes.data.items || [],
//                     });
//                 }
//             } catch (err) {
//                 console.error("Failed to fetch data:", err);
//                 setError("Failed to load necessary data. Please ensure related modules (Suppliers, Items, etc.) are set up.");
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

//     const handleItemChange = (index, e) => {
//         const { name, value, type, checked } = e.target;
//         const newItems = [...formData.items];
//         newItems[index] = { ...newItems[index], [name]: type === 'checkbox' ? checked : value };
//         setFormData(prev => ({ ...prev, items: newItems }));
//     };

//     const addItem = () => {
//         setFormData(prev => ({
//             ...prev,
//             items: [
//                 ...prev.items,
//                 {
//                     lineNumber: prev.items.length + 1,
//                     itemId: '',
//                     description: '',
//                     quantity: 1,
//                     unitId: '',
//                     rate: 0,
//                     taxId: '',
//                     lineDiscount: 0,
//                 }
//             ]
//         }));
//     };

//     const removeItem = (index) => {
//         setFormData(prev => ({
//             ...prev,
//             items: prev.items.filter((_, i) => i !== index)
//         }));
//     };

//     const totals = useMemo(() => {
//         let subTotal = 0;
//         let totalDiscount = 0;
//         let totalTax = 0;

//         formData.items.forEach(item => {
//             const quantity = parseFloat(item.quantity) || 0;
//             const rate = parseFloat(item.rate) || 0;
//             const lineDiscount = parseFloat(item.lineDiscount) || 0;
//             const itemAmount = (quantity * rate);
//             const netAmount = itemAmount - lineDiscount;
            
//             subTotal += itemAmount;
//             totalDiscount += lineDiscount;

//             const taxInfo = taxes.find(t => t.id === parseInt(item.taxId));
//             if (taxInfo && !item.taxExempt) {
//                 const taxRate = parseFloat(item.taxPercent || taxInfo.rate) || 0;
//                 totalTax += netAmount * (taxRate / 100);
//             }
//         });

//         const otherCharges = parseFloat(formData.otherCharges) || 0;
//         const totalAmount = (subTotal - totalDiscount) + totalTax + otherCharges;

//         return { subTotal, totalDiscount, totalTax, otherCharges, totalAmount };
//     }, [formData.items, formData.otherCharges, taxes]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');

//         const payload = {
//             ...formData,
//             items: formData.items.map(item => ({
//                 ...item,
//                 quantity: parseFloat(item.quantity) || 0,
//                 rate: parseFloat(item.rate) || 0,
//                 lineDiscount: parseFloat(item.lineDiscount) || 0,
//             }))
//         };

//         try {
//             const token = localStorage.getItem('token');
//             const headers = { Authorization: `Bearer ${token}` };

//             if (isEditing) {
//                 await axios.put(`${API_URL}/api/purchase/orders/${id}`, payload, { headers });
//             } else {
//                 await axios.post(`${API_URL}/api/purchase/orders`, payload, { headers });
//             }
//             navigate('/purchase-dashboard/purchase-orders');
//         } catch (err) {
//             console.error("Failed to save purchase order:", err);
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
//                 <h1 className="text-2xl font-bold text-foreground">{isEditing ? `Edit Purchase Order #${formData.poNumber}` : 'New Purchase Order'}</h1>
//                 <Link to="/purchase-dashboard/purchase-orders" className="btn-secondary flex items-center gap-2">
//                     <ArrowLeft size={16} /> Back to List
//                 </Link>
//             </div>

//             {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span className="block sm:inline">{error}</span></div>}

//             <form onSubmit={handleSubmit} className="space-y-8">
//                 {/* Header Section */}
//                 <div className="p-4 border border-border rounded-lg">
//                     <h2 className="text-lg font-semibold text-foreground mb-4">Order Details</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                         <SelectField label="Order Category" name="orderCategory" value={formData.orderCategory} onChange={handleHeaderChange}>
//                             <option value="Domestic">Domestic</option>
//                             <option value="Imported">Imported</option>
//                         </SelectField>
//                         <SelectField label="Supplier" name="supplierId" value={formData.supplierId} onChange={handleHeaderChange} required>
//                             <option value="">Select Supplier</option>
//                             {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}
//                         </SelectField>
//                         <InputField label="PO Number" name="poNumber" value={formData.poNumber} onChange={handleHeaderChange} placeholder="Auto-generated or manual" />
//                         <InputField label="Reference" name="reference" value={formData.reference} onChange={handleHeaderChange} />
//                         <InputField label="Date" name="date" type="date" value={formData.date} onChange={handleHeaderChange} required />
//                         <SelectField label="Discount Mode" name="discountMode" value={formData.discountMode} onChange={handleHeaderChange}>
//                             <option value="Without Discount">Without Discount</option>
//                             <option value="Item level">Item level</option>
//                             <option value="Order level">Order level</option>
//                         </SelectField>
//                         <SelectField label="Status" name="status" value={formData.status} onChange={handleHeaderChange}>
//                             <option value="Draft">Draft</option>
//                             <option value="Confirmed">Confirmed</option>
//                             <option value="Cancelled">Cancelled</option>
//                         </SelectField>
//                         <div className="lg:col-span-4">
//                             <label htmlFor="remark" className="block text-sm font-medium text-foreground-muted">Remarks</label>
//                             <textarea id="remark" name="remark" value={formData.remark} onChange={handleHeaderChange} rows="3" className="input mt-1 bg-background-muted border-border"></textarea>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Items Section */}
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
//                                 {formData.items.map((item, index) => (
//                                     <tr key={index} className="border-b border-border">
//                                         <td className="td-cell">{item.lineNumber}</td>
//                                         <td className="td-cell">
//                                             <SelectField name="itemId" value={item.itemId} onChange={(e) => handleItemChange(index, e)} className="input text-sm">
//                                                 <option value="">Select Item</option>
//                                                 {rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
//                                             </SelectField>
//                                         </td>
//                                         <td className="td-cell"><InputField type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e)} className="input text-right text-sm" /></td>
//                                         <td className="td-cell">
//                                             <SelectField name="unitId" value={item.unitId} onChange={(e) => handleItemChange(index, e)} className="input text-sm">
//                                                 <option value="">Unit</option>
//                                                 {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
//                                             </SelectField>
//                                         </td>
//                                         <td className="td-cell"><InputField type="number" name="rate" value={item.rate} onChange={(e) => handleItemChange(index, e)} className="input text-right text-sm" /></td>
//                                         <td className="td-cell">
//                                             <SelectField name="taxId" value={item.taxId} onChange={(e) => handleItemChange(index, e)} className="input text-sm">
//                                                 <option value="">Tax</option>
//                                                 {taxes.map(t => <option key={t.id} value={t.id}>{t.code} ({t.rate}%)</option>)}
//                                             </SelectField>
//                                         </td>
//                                         <td className="td-cell"><InputField type="number" name="lineDiscount" value={item.lineDiscount} onChange={(e) => handleItemChange(index, e)} className="input text-right text-sm" /></td>
//                                         <td className="td-cell text-right font-medium">{((item.quantity || 0) * (item.rate || 0)).toFixed(2)}</td>
//                                         <td className="td-cell">
//                                             <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
//                                                 <Trash2 size={16} />
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                     <button type="button" onClick={addItem} className="btn-secondary mt-4 flex items-center gap-2">
//                         <Plus size={16} /> Add Item
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
//                             <span className="text-lg font-bold text-foreground">Total Amount:</span>
//                             <span className="text-lg font-bold text-foreground">{totals.totalAmount.toFixed(2)} {formData.currency}</span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Actions */}
//                 <div className="flex justify-end gap-4 pt-6 border-t border-border">
//                     <button type="button" onClick={() => navigate('/purchase-dashboard/purchase-orders')} className="btn-secondary" disabled={loading}>
//                         Cancel
//                     </button>
//                     <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
//                         {loading ? <Loader className="animate-spin h-4 w-4" /> : <Save size={16} />}
//                         {isEditing ? 'Update' : 'Save'} Purchase Order
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default PurchaseOrderForm;



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

// const PurchaseOrderForm = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const isEditing = Boolean(id);

//     const [formData, setFormData] = useState({
//         orderCategory: 'Domestic',
//         supplierId: '',
//         poNumber: '',
//         reference: '',
//         date: new Date().toISOString().split('T')[0],
//         discountMode: 'Without Discount',
//         currency: 'AED',
//         remark: '',
//         status: 'Draft',
//         items: [],
//         attachments: [],
//         otherCharges: 0,
//         createdBy: '',
//     });

//     const [suppliers, setSuppliers] = useState([]);
//     const [rawMaterials, setRawMaterials] = useState([]);
//     const [units, setUnits] = useState([]);
//     const [taxes, setTaxes] = useState([]);
//     const [categories, setCategories] = useState([]);
//     const [subCategories, setSubCategories] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');

//     // fetch master data & existing PO if editing
//     useEffect(() => {
//         const fetchData = async () => {
//             setLoading(true);
//             try {
//                 const token = localStorage.getItem('token');
//                 const headers = { Authorization: `Bearer ${token}` };

//                 const calls = [
//                     axios.get(`${API_URL}/production/raw-materials`, { headers, params: { page: 0, size: 500 } }),
//                     axios.get(`${API_URL}/production/units`, { headers, params: { page: 0, size: 500 } }),
//                     axios.get(`${API_URL}/production/taxes`, { headers, params: { page: 0, size: 500 } }),
//                     axios.get(`${API_URL}/production/categories`, { headers, params: { page: 0, size: 500 } }),
//                     axios.get(`${API_URL}/production/sub-categories`, { headers }),//params: { page: 0, size: 500 }
//                 ];

//                 const [supRes, materialsRes, unitsRes, taxesRes, catsRes, subcatsRes] = await Promise.all(calls);

//                 // some endpoints may return { content: [...] } paging; handle both shapes
//                 setSuppliers(supRes.data.content || supRes.data || []);
//                 setRawMaterials(materialsRes.data.content || materialsRes.data || []);
//                 setUnits(unitsRes.data.content || unitsRes.data || []);
//                 setTaxes(taxesRes.data.content || taxesRes.data || []);
//                 setCategories(catsRes.data.content || catsRes.data || []);
//                 setSubCategories(subcatsRes.data.content || subcatsRes.data || []);

//                 if (isEditing) {
//                     const poRes = await axios.get(`${API_URL}/purchase/orders/${id}`, { headers });
//                     const po = poRes.data;
//                     setFormData({
//                         ...formData,
//                         ...po,
//                         date: po.date ? new Date(po.date).toISOString().split('T')[0] : '',
//                         items: (po.items || []).map(it => ({
//                             ...it,
//                             // keep fields the form expects: categoryId, subCategoryId, itemId, quantity, unitId, rate, taxId, taxPercent, taxExempt, lineDiscount, lineNumber
//                             categoryId: it.categoryId || '',
//                             subCategoryId: it.subCategoryId || '',
//                             itemId: it.itemId || '',
//                             description: it.description || '',
//                             quantity: it.quantity || 0,
//                             unitId: it.unitId || '',
//                             rate: it.rate || 0,
//                             taxId: it.taxId || '',
//                             taxPercent: it.taxPercent || '',
//                             taxExempt: !!it.taxExempt,
//                             lineDiscount: it.lineDiscount || 0,
//                             lineNumber: it.lineNumber || 1,
//                             id: it.id,
//                         })),
//                         attachments: (po.attachments || []).map(a => ({
//                             id: a.id,
//                             fileName: a.fileName,
//                             filePath: a.filePath,
//                             uploadedBy: a.uploadedBy,
//                             uploadedAt: a.uploadedAt
//                         })),
//                         otherCharges: po.otherCharges || 0,
//                         createdBy: po.createdBy || '',
//                     });
//                 }
//             } catch (err) {
//                 console.error("Failed to fetch data:", err);
//                 setError("Failed to load necessary data. Please ensure related modules are set up.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [id, isEditing]);

//     const handleHeaderChange = (e) => {
//         const { name, value, type } = e.target;
//         setFormData(prev => ({ ...prev, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value }));
//     };

//     const handleItemChange = (index, e) => {
//         const { name, value, type, checked } = e.target;
//         const newItems = [...formData.items];
//         newItems[index] = {
//             ...newItems[index],
//             [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value)
//         };
//         setFormData(prev => ({ ...prev, items: newItems }));
//     };

//     const addItem = () => {
//         setFormData(prev => ({
//             ...prev,
//             items: [
//                 ...prev.items,
//                 {
//                     lineNumber: prev.items.length + 1,
//                     categoryId: '',
//                     subCategoryId: '',
//                     itemId: '',
//                     description: '',
//                     quantity: 1,
//                     unitId: '',
//                     rate: 0,
//                     taxId: '',
//                     taxPercent: '',
//                     taxExempt: false,
//                     lineDiscount: 0,
//                 }
//             ]
//         }));
//     };

//     const removeItem = (index) => {
//         setFormData(prev => {
//             const items = prev.items.filter((_, i) => i !== index).map((it, idx) => ({ ...it, lineNumber: idx + 1 }));
//             return ({ ...prev, items });
//         });
//     };

//     const addAttachment = () => {
//         setFormData(prev => ({
//             ...prev,
//             attachments: [
//                 ...(prev.attachments || []),
//                 { fileName: '', filePath: '', uploadedBy: prev.createdBy || '', uploadedAt: new Date().toISOString() }
//             ]
//         }));
//     };

//     const removeAttachment = (index) => {
//         setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
//     };

//     const handleAttachmentChange = (index, e) => {
//         const { name, value } = e.target;
//         const attachments = [...formData.attachments];
//         attachments[index] = { ...attachments[index], [name]: value };
//         setFormData(prev => ({ ...prev, attachments }));
//     };

//     const totals = useMemo(() => {
//         let subTotal = 0;
//         let totalDiscount = 0;
//         let totalTax = 0;

//         formData.items.forEach(item => {
//             const quantity = parseFloat(item.quantity) || 0;
//             const rate = parseFloat(item.rate) || 0;
//             const lineDiscount = parseFloat(item.lineDiscount) || 0;

//             const itemAmount = quantity * rate;
//             const netAmount = Math.max(0, itemAmount - lineDiscount);

//             subTotal += itemAmount;
//             totalDiscount += lineDiscount;

//             // tax rate: use item.taxPercent override if provided, otherwise try to find tax master
//             const taxMaster = taxes.find(t => Number(t.id) === Number(item.taxId));
//             const taxRate = parseFloat(item.taxPercent ?? (taxMaster ? taxMaster.rate : 0)) || 0;

//             if (!item.taxExempt && taxRate > 0) {
//                 totalTax += netAmount * (taxRate / 100);
//             }
//         });

//         const otherCharges = parseFloat(formData.otherCharges) || 0;
//         const totalAmount = (subTotal - totalDiscount) + totalTax + otherCharges;

//         return { subTotal, totalDiscount, totalTax, otherCharges, totalAmount };
//     }, [formData.items, formData.otherCharges, taxes]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');

//         // map to backend request DTO
//         const payload = {
//             orderCategory: formData.orderCategory,
//             supplierId: formData.supplierId || null,
//             poNumber: formData.poNumber || null,
//             reference: formData.reference || null,
//             date: formData.date,
//             discountMode: formData.discountMode,
//             currency: formData.currency,
//             remark: formData.remark,
//             status: formData.status,
//             createdBy: formData.createdBy,
//             otherCharges: Number(formData.otherCharges) || 0,
//             items: (formData.items || []).map(it => ({
//                 lineNumber: it.lineNumber,
//                 categoryId: it.categoryId || null,
//                 subCategoryId: it.subCategoryId || null,
//                 itemId: it.itemId || null,
//                 description: it.description || null,
//                 quantity: Number(it.quantity) || 0,
//                 unitId: it.unitId || null,
//                 rate: Number(it.rate) || 0,
//                 taxId: it.taxId || null,
//                 taxExempt: !!it.taxExempt,
//                 taxPercent: it.taxPercent !== '' ? (Number(it.taxPercent) || 0) : null,
//                 lineDiscount: Number(it.lineDiscount) || 0
//             })),
//             attachments: (formData.attachments || []).map(a => ({
//                 fileName: a.fileName,
//                 filePath: a.filePath,
//                 uploadedBy: a.uploadedBy || formData.createdBy,
//                 uploadedAt: a.uploadedAt || new Date().toISOString()
//             }))
//         };

//         try {
//             const token = localStorage.getItem('token');
//             const headers = { Authorization: `Bearer ${token}` };

//             if (isEditing) {
//                 await axios.put(`${API_URL}/purchase/orders/${id}`, payload, { headers });
//             } else {
//                 await axios.post(`${API_URL}/purchase/orders`, payload, { headers });
//             }
//             navigate('/purchase-dashboard/purchase-orders');
//         } catch (err) {
//             console.error("Failed to save purchase order:", err);
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
//                 <h1 className="text-2xl font-bold text-foreground">{isEditing ? `Edit Purchase Order #${formData.poNumber || ''}` : 'New Purchase Order'}</h1>
//                 <Link to="/purchase-dashboard/purchase-orders" className="btn-secondary flex items-center gap-2">
//                     <ArrowLeft size={16} /> Back to List
//                 </Link>
//             </div>

//             {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span className="block sm:inline">{error}</span></div>}

//             <form onSubmit={handleSubmit} className="space-y-8">
//                 {/* Header */}
//                 <div className="p-4 border border-border rounded-lg">
//                     <h2 className="text-lg font-semibold text-foreground mb-4">Order Details</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                         <SelectField label="Order Category" name="orderCategory" value={formData.orderCategory} onChange={handleHeaderChange}>
//                             <option value="Domestic">Domestic</option>
//                             <option value="Imported">Imported</option>
//                         </SelectField>

//                         <SelectField label="Supplier" name="supplierId" value={formData.supplierId || ''} onChange={handleHeaderChange} required>
//                             <option value="">Select Supplier</option>
//                             {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName || s.name || `${s.firstName || ''} ${s.lastName || ''}`}</option>)}
//                         </SelectField>

//                         <InputField label="PO Number" name="poNumber" value={formData.poNumber || ''} onChange={handleHeaderChange} placeholder="Auto-generated or manual" />
//                         <InputField label="Reference" name="reference" value={formData.reference || ''} onChange={handleHeaderChange} />

//                         <InputField label="Date" name="date" type="date" value={formData.date || ''} onChange={handleHeaderChange} required />
//                         <SelectField label="Discount Mode" name="discountMode" value={formData.discountMode || ''} onChange={handleHeaderChange}>
//                             <option value="Without Discount">Without Discount</option>
//                             <option value="Item level">Item level</option>
//                             <option value="Order level">Order level</option>
//                         </SelectField>

//                         <SelectField label="Currency" name="currency" value={formData.currency || 'AED'} onChange={handleHeaderChange}>
//                             <option value="AED">AED</option>
//                             <option value="USD">USD</option>
//                             <option value="EUR">EUR</option>
//                         </SelectField>

//                         <SelectField label="Status" name="status" value={formData.status || 'Draft'} onChange={handleHeaderChange}>
//                             <option value="Draft">Draft</option>
//                             <option value="Confirmed">Confirmed</option>
//                             <option value="Cancelled">Cancelled</option>
//                         </SelectField>

//                         <div className="lg:col-span-4">
//                             <label htmlFor="remark" className="block text-sm font-medium text-foreground-muted">Remarks</label>
//                             <textarea id="remark" name="remark" value={formData.remark || ''} onChange={handleHeaderChange} rows="3" className="input mt-1 bg-background-muted border-border"></textarea>
//                         </div>

//                         <InputField label="Created By" name="createdBy" value={formData.createdBy || ''} onChange={handleHeaderChange} />
//                     </div>
//                 </div>

//                 {/* Items */}
//                 <div className="p-4 border border-border rounded-lg">
//                     <h2 className="text-lg font-semibold text-foreground mb-4">Items</h2>
//                     <div className="overflow-x-auto">
//                         <table className="min-w-full">
//                             <thead className="bg-background-muted">
//                                 <tr>
//                                     <th className="th-cell text-left">#</th>
//                                     <th className="th-cell text-left w-2/5">Category / Item</th>
//                                     <th className="th-cell text-right">Qty</th>
//                                     <th className="th-cell text-left">Unit</th>
//                                     <th className="th-cell text-right">Rate</th>
//                                     <th className="th-cell text-left">Tax</th>
//                                     <th className="th-cell text-left">Tax % (ovr)</th>
//                                     <th className="th-cell text-right">Discount</th>
//                                     <th className="th-cell text-right">Amount</th>
//                                     <th className="th-cell"></th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {formData.items.map((item, index) => {
//                                     const quantity = parseFloat(item.quantity) || 0;
//                                     const rate = parseFloat(item.rate) || 0;
//                                     const lineDiscount = parseFloat(item.lineDiscount) || 0;
//                                     const amount = Math.max(0, (quantity * rate) - lineDiscount);
//                                     return (
//                                         <tr key={index} className="border-b border-border">
//                                             <td className="td-cell">{item.lineNumber}</td>
//                                             <td className="td-cell">
//                                                 <div className="grid grid-cols-2 gap-2">
//                                                     <select name="categoryId" value={item.categoryId || ''} onChange={(e) => handleItemChange(index, e)} className="input text-sm">
//                                                         <option value="">Category</option>
//                                                         {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                                                     </select>
//                                                     <select name="subCategoryId" value={item.subCategoryId || ''} onChange={(e) => handleItemChange(index, e)} className="input text-sm">
//                                                         <option value="">Subcategory</option>
//                                                         {subCategories
//                                                             .filter(sc => !item.categoryId || sc.categoryId === item.categoryId || sc.categoryId === (item.categoryId ? Number(item.categoryId) : null))
//                                                             .map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
//                                                     </select>
//                                                     <select name="itemId" value={item.itemId || ''} onChange={(e) => handleItemChange(index, e)} className="input text-sm col-span-2">
//                                                         <option value="">Select Item</option>
//                                                         {rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
//                                                     </select>
//                                                     <input name="description" value={item.description || ''} onChange={(e) => handleItemChange(index, e)} placeholder="Description (optional)" className="input text-sm col-span-2" />
//                                                 </div>
//                                             </td>
//                                             <td className="td-cell"><input type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e)} className="input text-right text-sm" /></td>
//                                             <td className="td-cell">
//                                                 <select name="unitId" value={item.unitId || ''} onChange={(e) => handleItemChange(index, e)} className="input text-sm">
//                                                     <option value="">Unit</option>
//                                                     {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
//                                                 </select>
//                                             </td>
//                                             <td className="td-cell"><input type="number" name="rate" value={item.rate} onChange={(e) => handleItemChange(index, e)} className="input text-right text-sm" /></td>
//                                             <td className="td-cell">
//                                                 <select name="taxId" value={item.taxId || ''} onChange={(e) => handleItemChange(index, e)} className="input text-sm">
//                                                     <option value="">Tax</option>
//                                                     {taxes.map(t => <option key={t.id} value={t.id}>{t.code} ({t.rate}%)</option>)}
//                                                 </select>
//                                                 <div className="flex items-center gap-2 mt-1">
//                                                     <input id={`taxExempt-${index}`} name="taxExempt" type="checkbox" checked={!!item.taxExempt} onChange={(e) => handleItemChange(index, e)} />
//                                                     <label htmlFor={`taxExempt-${index}`} className="text-xs">Tax Exempt</label>
//                                                 </div>
//                                             </td>
//                                             <td className="td-cell"><input type="number" name="taxPercent" value={item.taxPercent || ''} onChange={(e) => handleItemChange(index, e)} className="input text-right text-sm" placeholder="optional" /></td>
//                                             <td className="td-cell"><input type="number" name="lineDiscount" value={item.lineDiscount || 0} onChange={(e) => handleItemChange(index, e)} className="input text-right text-sm" /></td>
//                                             <td className="td-cell text-right font-medium">{amount.toFixed(2)}</td>
//                                             <td className="td-cell">
//                                                 <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
//                                                     <Trash2 size={16} />
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     )
//                                 })}
//                             </tbody>
//                         </table>
//                     </div>
//                     <button type="button" onClick={addItem} className="btn-secondary mt-4 flex items-center gap-2">
//                         <Plus size={16} /> Add Item
//                     </button>
//                 </div>

//                 {/* Attachments */}
//                 <div className="p-4 border border-border rounded-lg">
//                     <h2 className="text-lg font-semibold text-foreground mb-4">Attachments</h2>
//                     <div className="space-y-3">
//                         {(formData.attachments || []).map((att, idx) => (
//                             <div key={idx} className="grid grid-cols-6 gap-2 items-center">
//                                 <input name="fileName" value={att.fileName || ''} onChange={(e) => handleAttachmentChange(idx, e)} placeholder="File name" className="input col-span-2" />
//                                 <input name="filePath" value={att.filePath || ''} onChange={(e) => handleAttachmentChange(idx, e)} placeholder="Path / URL" className="input col-span-3" />
//                                 <button type="button" onClick={() => removeAttachment(idx)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={16} /></button>
//                                 <input name="uploadedBy" value={att.uploadedBy || ''} onChange={(e) => handleAttachmentChange(idx, e)} placeholder="Uploaded by" className="input col-span-2 mt-2" />
//                                 <input name="uploadedAt" value={att.uploadedAt || ''} onChange={(e) => handleAttachmentChange(idx, e)} type="datetime-local" className="input col-span-4 mt-2" />
//                             </div>
//                         ))}
//                     </div>
//                     <button type="button" onClick={addAttachment} className="btn-secondary mt-4 flex items-center gap-2">
//                         <Plus size={16} /> Add Attachment
//                     </button>
//                 </div>

//                 {/* Totals */}
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
//                             <InputField type="number" name="otherCharges" value={formData.otherCharges || 0} onChange={handleHeaderChange} className="input text-right text-sm w-24 py-1" />
//                         </div>
//                         <div className="flex justify-between border-t border-border pt-2 mt-2">
//                             <span className="text-lg font-bold text-foreground">Total Amount:</span>
//                             <span className="text-lg font-bold text-foreground">{totals.totalAmount.toFixed(2)} {formData.currency}</span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Actions */}
//                 <div className="flex justify-end gap-4 pt-6 border-t border-border">
//                     <button type="button" onClick={() => navigate('/purchase-dashboard/purchase-orders')} className="btn-secondary" disabled={loading}>
//                         Cancel
//                     </button>
//                     <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
//                         {loading ? <Loader className="animate-spin h-4 w-4" /> : <Save size={16} />}
//                         {isEditing ? 'Update' : 'Save'} Purchase Order
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default PurchaseOrderForm;



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

// const PurchaseOrderForm = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const isEditing = Boolean(id);

//     const [formData, setFormData] = useState({
//         orderCategory: 'Domestic',
//         supplierId: '',
//         poNumber: '',
//         reference: '',
//         date: new Date().toISOString().split('T')[0],
//         discountMode: 'Without Discount',
//         currency: 'AED',
//         remark: '',
//         status: 'Draft',
//         items: [],
//         attachments: [],
//         otherCharges: 0,
//         createdBy: '',
//     });

//     const [suppliers, setSuppliers] = useState([]);
//     const [rawMaterials, setRawMaterials] = useState([]);
//     const [units, setUnits] = useState([]);
//     const [taxes, setTaxes] = useState([]);
//     const [categories, setCategories] = useState([]);
//     // NOTE: subCategoriesByCategory is an object: { [categoryId]: [subCategory, ...] }
//     const [subCategoriesByCategory, setSubCategoriesByCategory] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');

//     /* ---------------- initial master-data + PO fetch ---------------- */
//     useEffect(() => {
//         const fetchData = async () => {
//             setLoading(true);
//             try {
//                 const token = localStorage.getItem('token');
//                 const headers = { Authorization: `Bearer ${token}` };

//                 // master data endpoints (using /api prefix to match backend controllers)
//                 const [
//                     rawMaterialsRes,
//                     unitsRes,
//                     taxesRes,
//                     categoriesRes,
//                     suppliersRes
//                 ] = await Promise.all([
//                     axios.get(`${API_URL}/production/raw-materials`, { headers, params: { page: 0, size: 500 } }),
//                     axios.get(`${API_URL}/production/units`, { headers, params: { page: 0, size: 500 } }),
//                     axios.get(`${API_URL}/production/taxes`, { headers, params: { page: 0, size: 500 } }),
//                     axios.get(`${API_URL}/production/categories`, { headers, params: { page: 0, size: 500 } }),
//                     // suppliers endpoint - your backend uses PartyRepository; this tries /api/parties with type=SUPPLIER
//                     axios.get(`${API_URL}/parties`, { headers, params: { type: 'SUPPLIER', page: 0, size: 500 } }),
//                 ]);

//                 setRawMaterials(rawMaterialsRes.data.content || rawMaterialsRes.data || []);
//                 setUnits(unitsRes.data.content || unitsRes.data || []);
//                 setTaxes(taxesRes.data.content || taxesRes.data || []);
//                 setCategories(categoriesRes.data.content || categoriesRes.data || []);
//                 setSuppliers(suppliersRes.data.content || suppliersRes.data || []);

//                 if (isEditing) {
//                     const poRes = await axios.get(`${API_URL}/purchase/orders/${id}`, { headers });
//                     const po = poRes.data;
//                     setFormData(prev => ({
//                         ...prev,
//                         ...po,
//                         date: po.date ? new Date(po.date).toISOString().split('T')[0] : '',
//                         items: (po.items || []).map(it => ({
//                             ...it,
//                             categoryId: it.categoryId || '',
//                             subCategoryId: it.subCategoryId || '',
//                             itemId: it.itemId || '',
//                             description: it.description || '',
//                             quantity: it.quantity || 0,
//                             unitId: it.unitId || '',
//                             rate: it.rate || 0,
//                             taxId: it.taxId || '',
//                             taxPercent: it.taxPercent || '',
//                             taxExempt: !!it.taxExempt,
//                             lineDiscount: it.lineDiscount || 0,
//                             lineNumber: it.lineNumber || 1,
//                             id: it.id,
//                         })),
//                         attachments: (po.attachments || []).map(a => ({
//                             id: a.id,
//                             fileName: a.fileName,
//                             filePath: a.filePath,
//                             uploadedBy: a.uploadedBy,
//                             uploadedAt: a.uploadedAt
//                         })),
//                         otherCharges: po.otherCharges || 0,
//                         createdBy: po.createdBy || '',
//                     }));

//                     // optionally pre-load subcategories for categories used in the PO (improves initial UX)
//                     const catIds = Array.from(new Set((po.items || []).map(it => it.categoryId).filter(Boolean)));
//                     await Promise.all(catIds.map(cid => fetchSubCategoriesForCategory(cid)));
//                 }
//             } catch (err) {
//                 console.error("Failed to fetch data:", err);
//                 setError("Failed to load necessary data. Please ensure related modules are set up.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [id, isEditing]);

//     /* ---------------- on-demand sub-category fetch + cache ---------------- */
//     const fetchSubCategoriesForCategory = async (categoryId) => {
//         if (!categoryId) return [];
//         if (subCategoriesByCategory[categoryId]) return subCategoriesByCategory[categoryId];

//         try {
//             const token = localStorage.getItem('token');
//             const headers = { Authorization: `Bearer ${token}` };
//             // Controller expects ?categoryId=...
//             const res = await axios.get(`${API_URL}/production/sub-categories`, {
//                 headers,
//                 params: { categoryId }
//             });
//             // controller returns List<ProSubCategoryResponse> (not paged) — handle both array and content
//             const data = res.data.content ?? res.data ?? [];
//             setSubCategoriesByCategory(prev => ({ ...prev, [categoryId]: data }));
//             return data;
//         } catch (err) {
//             console.warn(`No sub-categories for category ${categoryId}:`, err?.response?.status);
//             setSubCategoriesByCategory(prev => ({ ...prev, [categoryId]: [] }));
//             return [];
//         }
//     };

//     /* ---------------- form handlers ---------------- */
//     const handleHeaderChange = (e) => {
//         const { name, value, type } = e.target;
//         setFormData(prev => ({ ...prev, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value }));
//     };

//     const handleItemChange = (index, e) => {
//         const { name, value, type, checked } = e.target;
//         const newItems = [...formData.items];
//         newItems[index] = {
//             ...newItems[index],
//             [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value)
//         };
//         setFormData(prev => ({ ...prev, items: newItems }));
//     };

//     const addItem = () => {
//         setFormData(prev => ({
//             ...prev,
//             items: [
//                 ...prev.items,
//                 {
//                     lineNumber: prev.items.length + 1,
//                     categoryId: '',
//                     subCategoryId: '',
//                     itemId: '',
//                     description: '',
//                     quantity: 1,
//                     unitId: '',
//                     rate: 0,
//                     taxId: '',
//                     taxPercent: '',
//                     taxExempt: false,
//                     lineDiscount: 0,
//                 }
//             ]
//         }));
//     };

//     const removeItem = (index) => {
//         setFormData(prev => {
//             const items = prev.items.filter((_, i) => i !== index).map((it, idx) => ({ ...it, lineNumber: idx + 1 }));
//             return ({ ...prev, items });
//         });
//     };

//     const addAttachment = () => {
//         setFormData(prev => ({
//             ...prev,
//             attachments: [
//                 ...(prev.attachments || []),
//                 { fileName: '', filePath: '', uploadedBy: prev.createdBy || '', uploadedAt: new Date().toISOString() }
//             ]
//         }));
//     };

//     const removeAttachment = (index) => {
//         setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
//     };

//     const handleAttachmentChange = (index, e) => {
//         const { name, value } = e.target;
//         const attachments = [...formData.attachments];
//         attachments[index] = { ...attachments[index], [name]: value };
//         setFormData(prev => ({ ...prev, attachments }));
//     };

//     /* ---------------- totals ---------------- */
//     const totals = useMemo(() => {
//         let subTotal = 0;
//         let totalDiscount = 0;
//         let totalTax = 0;

//         formData.items.forEach(item => {
//             const quantity = parseFloat(item.quantity) || 0;
//             const rate = parseFloat(item.rate) || 0;
//             const lineDiscount = parseFloat(item.lineDiscount) || 0;

//             const itemAmount = quantity * rate;
//             const netAmount = Math.max(0, itemAmount - lineDiscount);

//             subTotal += itemAmount;
//             totalDiscount += lineDiscount;

//             const taxMaster = taxes.find(t => Number(t.id) === Number(item.taxId));
//             const taxRate = parseFloat(item.taxPercent ?? (taxMaster ? taxMaster.rate : 0)) || 0;

//             if (!item.taxExempt && taxRate > 0) {
//                 totalTax += netAmount * (taxRate / 100);
//             }
//         });

//         const otherCharges = parseFloat(formData.otherCharges) || 0;
//         const totalAmount = (subTotal - totalDiscount) + totalTax + otherCharges;

//         return { subTotal, totalDiscount, totalTax, otherCharges, totalAmount };
//     }, [formData.items, formData.otherCharges, taxes]);

//     /* ---------------- submit ---------------- */
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');

//         const payload = {
//             orderCategory: formData.orderCategory,
//             supplierId: formData.supplierId || null,
//             poNumber: formData.poNumber || null,
//             reference: formData.reference || null,
//             date: formData.date,
//             discountMode: formData.discountMode,
//             currency: formData.currency,
//             remark: formData.remark,
//             status: formData.status,
//             createdBy: formData.createdBy,
//             otherCharges: Number(formData.otherCharges) || 0,
//             items: (formData.items || []).map(it => ({
//                 lineNumber: it.lineNumber,
//                 categoryId: it.categoryId || null,
//                 subCategoryId: it.subCategoryId || null,
//                 itemId: it.itemId || null,
//                 description: it.description || null,
//                 quantity: Number(it.quantity) || 0,
//                 unitId: it.unitId || null,
//                 rate: Number(it.rate) || 0,
//                 taxId: it.taxId || null,
//                 taxExempt: !!it.taxExempt,
//                 taxPercent: it.taxPercent !== '' ? (Number(it.taxPercent) || 0) : null,
//                 lineDiscount: Number(it.lineDiscount) || 0
//             })),
//             attachments: (formData.attachments || []).map(a => ({
//                 fileName: a.fileName,
//                 filePath: a.filePath,
//                 uploadedBy: a.uploadedBy || formData.createdBy,
//                 uploadedAt: a.uploadedAt || new Date().toISOString()
//             }))
//         };

//         try {
//             const token = localStorage.getItem('token');
//             const headers = { Authorization: `Bearer ${token}` };

//             if (isEditing) {
//                 await axios.put(`${API_URL}/purchase/orders/${id}`, payload, { headers });
//             } else {
//                 await axios.post(`${API_URL}/purchase/orders`, payload, { headers });
//             }
//             navigate('/purchase-dashboard/purchase-orders');
//         } catch (err) {
//             console.error("Failed to save purchase order:", err);
//             setError(err.response?.data?.message || "An error occurred while saving.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading && !isEditing) {
//         return <div className="flex justify-center items-center h-64"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
//     }

//     /* ---------------- render ---------------- */
//     return (
//         <div className="bg-card p-6 rounded-xl shadow-sm">
//             <div className="flex justify-between items-center mb-6">
//                 <h1 className="text-2xl font-bold text-foreground">{isEditing ? `Edit Purchase Order #${formData.poNumber || ''}` : 'New Purchase Order'}</h1>
//                 <Link to="/purchase-dashboard/purchase-orders" className="btn-secondary flex items-center gap-2">
//                     <ArrowLeft size={16} /> Back to List
//                 </Link>
//             </div>

//             {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span className="block sm:inline">{error}</span></div>}

//             <form onSubmit={handleSubmit} className="space-y-8">
//                 {/* Header */}
//                 <div className="p-4 border border-border rounded-lg">
//                     <h2 className="text-lg font-semibold text-foreground mb-4">Order Details</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                         <SelectField label="Order Category" name="orderCategory" value={formData.orderCategory} onChange={handleHeaderChange}>
//                             <option value="Domestic">Domestic</option>
//                             <option value="Imported">Imported</option>
//                         </SelectField>

//                         <SelectField label="Supplier" name="supplierId" value={formData.supplierId || ''} onChange={handleHeaderChange} required>
//                             <option value="">Select Supplier</option>
//                             {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName || s.name || `${s.firstName || ''} ${s.lastName || ''}`}</option>)}
//                         </SelectField>

//                         <InputField label="PO Number" name="poNumber" value={formData.poNumber || ''} onChange={handleHeaderChange} placeholder="Auto-generated or manual" />
//                         <InputField label="Reference" name="reference" value={formData.reference || ''} onChange={handleHeaderChange} />

//                         <InputField label="Date" name="date" type="date" value={formData.date || ''} onChange={handleHeaderChange} required />
//                         <SelectField label="Discount Mode" name="discountMode" value={formData.discountMode || ''} onChange={handleHeaderChange}>
//                             <option value="Without Discount">Without Discount</option>
//                             <option value="Item level">Item level</option>
//                             <option value="Order level">Order level</option>
//                         </SelectField>

//                         <SelectField label="Currency" name="currency" value={formData.currency || 'AED'} onChange={handleHeaderChange}>
//                             <option value="AED">AED</option>
//                             <option value="USD">USD</option>
//                             <option value="EUR">EUR</option>
//                         </SelectField>

//                         <SelectField label="Status" name="status" value={formData.status || 'Draft'} onChange={handleHeaderChange}>
//                             <option value="Draft">Draft</option>
//                             <option value="Confirmed">Confirmed</option>
//                             <option value="Cancelled">Cancelled</option>
//                         </SelectField>

//                         <div className="lg:col-span-4">
//                             <label htmlFor="remark" className="block text-sm font-medium text-foreground-muted">Remarks</label>
//                             <textarea id="remark" name="remark" value={formData.remark || ''} onChange={handleHeaderChange} rows="3" className="input mt-1 bg-background-muted border-border"></textarea>
//                         </div>

//                         <InputField label="Created By" name="createdBy" value={formData.createdBy || ''} onChange={handleHeaderChange} />
//                     </div>
//                 </div>

//                 {/* Items */}
//                 <div className="p-4 border border-border rounded-lg">
//                     <h2 className="text-lg font-semibold text-foreground mb-4">Items</h2>
//                     <div className="overflow-x-auto">
//                         <table className="min-w-full">
//                             <thead className="bg-background-muted">
//                                 <tr>
//                                     <th className="th-cell text-left">#</th>
//                                     <th className="th-cell text-left w-2/5">Category / Item</th>
//                                     <th className="th-cell text-right">Qty</th>
//                                     <th className="th-cell text-left">Unit</th>
//                                     <th className="th-cell text-right">Rate</th>
//                                     <th className="th-cell text-left">Tax</th>
//                                     <th className="th-cell text-left">Tax % (ovr)</th>
//                                     <th className="th-cell text-right">Discount</th>
//                                     <th className="th-cell text-right">Amount</th>
//                                     <th className="th-cell"></th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {formData.items.map((item, index) => {
//                                     const quantity = parseFloat(item.quantity) || 0;
//                                     const rate = parseFloat(item.rate) || 0;
//                                     const lineDiscount = parseFloat(item.lineDiscount) || 0;
//                                     const amount = Math.max(0, (quantity * rate) - lineDiscount);
//                                     return (
//                                         <tr key={index} className="border-b border-border">
//                                             <td className="td-cell">{item.lineNumber}</td>
//                                             <td className="td-cell">
//                                                 <div className="grid grid-cols-2 gap-2">
//                                                     <select
//                                                         name="categoryId"
//                                                         value={item.categoryId || ''}
//                                                         onChange={async (e) => {
//                                                             // update item category
//                                                             handleItemChange(index, e);
//                                                             const newCatId = e.target.value;
//                                                             // fetch & cache subcategories for this categoryId
//                                                             await fetchSubCategoriesForCategory(newCatId);
//                                                             // clear selected subCategoryId on category change
//                                                             setFormData(prev => {
//                                                                 const items = [...prev.items];
//                                                                 items[index] = { ...items[index], subCategoryId: '' };
//                                                                 return { ...prev, items };
//                                                             });
//                                                         }}
//                                                         className="input text-sm"
//                                                     >
//                                                         <option value="">Category</option>
//                                                         {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                                                     </select>

//                                                     <select
//                                                         name="subCategoryId"
//                                                         value={item.subCategoryId || ''}
//                                                         onChange={(e) => handleItemChange(index, e)}
//                                                         className="input text-sm"
//                                                     >
//                                                         <option value="">Subcategory</option>
//                                                         {(subCategoriesByCategory[item.categoryId] || []).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
//                                                     </select>

//                                                     <select name="itemId" value={item.itemId || ''} onChange={(e) => handleItemChange(index, e)} className="input text-sm col-span-2">
//                                                         <option value="">Select Item</option>
//                                                         {rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
//                                                     </select>

//                                                     <input name="description" value={item.description || ''} onChange={(e) => handleItemChange(index, e)} placeholder="Description (optional)" className="input text-sm col-span-2" />
//                                                 </div>
//                                             </td>
//                                             <td className="td-cell"><input type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e)} className="input text-right text-sm" /></td>
//                                             <td className="td-cell">
//                                                 <select name="unitId" value={item.unitId || ''} onChange={(e) => handleItemChange(index, e)} className="input text-sm">
//                                                     <option value="">Unit</option>
//                                                     {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
//                                                 </select>
//                                             </td>
//                                             <td className="td-cell"><input type="number" name="rate" value={item.rate} onChange={(e) => handleItemChange(index, e)} className="input text-right text-sm" /></td>
//                                             <td className="td-cell">
//                                                 <select name="taxId" value={item.taxId || ''} onChange={(e) => handleItemChange(index, e)} className="input text-sm">
//                                                     <option value="">Tax</option>
//                                                     {taxes.map(t => <option key={t.id} value={t.id}>{t.code} ({t.rate}%)</option>)}
//                                                 </select>
//                                                 <div className="flex items-center gap-2 mt-1">
//                                                     <input id={`taxExempt-${index}`} name="taxExempt" type="checkbox" checked={!!item.taxExempt} onChange={(e) => handleItemChange(index, e)} />
//                                                     <label htmlFor={`taxExempt-${index}`} className="text-xs">Tax Exempt</label>
//                                                 </div>
//                                             </td>
//                                             <td className="td-cell"><input type="number" name="taxPercent" value={item.taxPercent || ''} onChange={(e) => handleItemChange(index, e)} className="input text-right text-sm" placeholder="optional" /></td>
//                                             <td className="td-cell"><input type="number" name="lineDiscount" value={item.lineDiscount || 0} onChange={(e) => handleItemChange(index, e)} className="input text-right text-sm" /></td>
//                                             <td className="td-cell text-right font-medium">{amount.toFixed(2)}</td>
//                                             <td className="td-cell">
//                                                 <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
//                                                     <Trash2 size={16} />
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     )
//                                 })}
//                             </tbody>
//                         </table>
//                     </div>
//                     <button type="button" onClick={addItem} className="btn-secondary mt-4 flex items-center gap-2">
//                         <Plus size={16} /> Add Item
//                     </button>
//                 </div>

//                 {/* Attachments */}
//                 <div className="p-4 border border-border rounded-lg">
//                     <h2 className="text-lg font-semibold text-foreground mb-4">Attachments</h2>
//                     <div className="space-y-3">
//                         {(formData.attachments || []).map((att, idx) => (
//                             <div key={idx} className="grid grid-cols-6 gap-2 items-center">
//                                 <input name="fileName" value={att.fileName || ''} onChange={(e) => handleAttachmentChange(idx, e)} placeholder="File name" className="input col-span-2" />
//                                 <input name="filePath" value={att.filePath || ''} onChange={(e) => handleAttachmentChange(idx, e)} placeholder="Path / URL" className="input col-span-3" />
//                                 <button type="button" onClick={() => removeAttachment(idx)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={16} /></button>
//                                 <input name="uploadedBy" value={att.uploadedBy || ''} onChange={(e) => handleAttachmentChange(idx, e)} placeholder="Uploaded by" className="input col-span-2 mt-2" />
//                                 <input name="uploadedAt" value={att.uploadedAt || ''} onChange={(e) => handleAttachmentChange(idx, e)} type="datetime-local" className="input col-span-4 mt-2" />
//                             </div>
//                         ))}
//                     </div>
//                     <button type="button" onClick={addAttachment} className="btn-secondary mt-4 flex items-center gap-2">
//                         <Plus size={16} /> Add Attachment
//                     </button>
//                 </div>

//                 {/* Totals */}
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
//                             <InputField type="number" name="otherCharges" value={formData.otherCharges || 0} onChange={handleHeaderChange} className="input text-right text-sm w-24 py-1" />
//                         </div>
//                         <div className="flex justify-between border-t border-border pt-2 mt-2">
//                             <span className="text-lg font-bold text-foreground">Total Amount:</span>
//                             <span className="text-lg font-bold text-foreground">{totals.totalAmount.toFixed(2)} {formData.currency}</span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Actions */}
//                 <div className="flex justify-end gap-4 pt-6 border-t border-border">
//                     <button type="button" onClick={() => navigate('/purchase-dashboard/purchase-orders')} className="btn-secondary" disabled={loading}>
//                         Cancel
//                     </button>
//                     <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
//                         {loading ? <Loader className="animate-spin h-4 w-4" /> : <Save size={16} />}
//                         {isEditing ? 'Update' : 'Save'} Purchase Order
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default PurchaseOrderForm;




// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import { useNavigate, useParams, Link } from 'react-router-dom';
// import axios from 'axios';
// import { Plus, Trash2, Save, Loader, ArrowLeft } from 'lucide-react';

// const API_URL = import.meta.env.VITE_API_BASE_URL;

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

// const PurchaseOrderForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const isEditing = Boolean(id);
//   const fileInputRef = useRef(null);

//   const [formData, setFormData] = useState({
//     orderCategory: 'Domestic',
//     supplierId: '',
//     poNumber: '',
//     reference: '',
//     date: new Date().toISOString().split('T')[0],
//     discountMode: 'Without Discount',
//     currency: 'AED',
//     remark: '',
//     status: 'Draft',
//     items: [],
//     attachments: [],
//     otherCharges: 0,
//     createdBy: '',
//   });

//   const [suppliers, setSuppliers] = useState([]);
//   const [rawMaterials, setRawMaterials] = useState([]);
//   const [units, setUnits] = useState([]);
//   const [taxes, setTaxes] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [subCategoriesByCategory, setSubCategoriesByCategory] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState('');

//   /* ---------------- initial master-data + PO fetch ---------------- */
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const token = localStorage.getItem('token');
//         const headers = { Authorization: `Bearer ${token}` };

//         const [
//           rawMaterialsRes,
//           unitsRes,
//           taxesRes,
//           categoriesRes,
//           suppliersRes
//         ] = await Promise.all([
//           axios.get(`${API_URL}/production/raw-materials`, { headers, params: { page: 0, size: 500 } }),
//           axios.get(`${API_URL}/production/units`, { headers, params: { page: 0, size: 500 } }),
//           axios.get(`${API_URL}/production/taxes`, { headers, params: { page: 0, size: 500 } }),
//           axios.get(`${API_URL}/production/categories`, { headers, params: { page: 0, size: 500 } }),
//           axios.get(`${API_URL}/parties`, { headers, params: { type: 'SUPPLIER', page: 0, size: 500 } }),
//         ]);

//         setRawMaterials(rawMaterialsRes.data.content || rawMaterialsRes.data || []);
//         setUnits(unitsRes.data.content || unitsRes.data || []);
//         setTaxes(taxesRes.data.content || taxesRes.data || []);
//         setCategories(categoriesRes.data.content || categoriesRes.data || []);
//         setSuppliers(suppliersRes.data.content || suppliersRes.data || []);

//         if (isEditing) {
//           const poRes = await axios.get(`${API_URL}/purchase/orders/${id}`, { headers });
//           const po = poRes.data;
//           setFormData(prev => ({
//             ...prev,
//             ...po,
//             date: po.date ? new Date(po.date).toISOString().split('T')[0] : '',
//             items: (po.items || []).map(it => ({
//               ...it,
//               categoryId: it.categoryId || '',
//               subCategoryId: it.subCategoryId || '',
//               itemId: it.itemId || '',
//               description: it.description || '',
//               quantity: it.quantity || 0,
//               unitId: it.unitId || '',
//               rate: it.rate || 0,
//               taxId: it.taxId || '',
//               taxPercent: it.taxPercent || '',
//               taxExempt: !!it.taxExempt,
//               lineDiscount: it.lineDiscount || 0,
//               lineNumber: it.lineNumber || 1,
//               id: it.id,
//             })),
//             attachments: (po.attachments || []).map(a => ({
//               id: a.id,
//               fileName: a.fileName,
//               filePath: a.filePath,
//               uploadedBy: a.uploadedBy,
//               uploadedAt: a.uploadedAt
//             })),
//             otherCharges: po.otherCharges || 0,
//             createdBy: po.createdBy || '',
//           }));

//           // preload subcategories for categories used in the PO
//           const catIds = Array.from(new Set((po.items || []).map(it => it.categoryId).filter(Boolean)));
//           await Promise.all(catIds.map(cid => fetchSubCategoriesForCategory(cid)));
//         }
//       } catch (err) {
//         console.error("Failed to fetch data:", err);
//         setError("Failed to load necessary data. Please ensure related modules are set up.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id, isEditing]);

//   /* ---------------- on-demand sub-category fetch + cache ---------------- */
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
//       console.warn(`No sub-categories for category ${categoryId}:`, err?.response?.status);
//       setSubCategoriesByCategory(prev => ({ ...prev, [categoryId]: [] }));
//       return [];
//     }
//   };

//   /* ---------------- form handlers ---------------- */
//   const handleHeaderChange = (e) => {
//     const { name, value, type } = e.target;
//     setFormData(prev => ({ ...prev, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value }));
//   };

//   const handleItemChange = (index, e) => {
//     const { name, value, type, checked } = e.target;
//     const newItems = [...formData.items];
//     newItems[index] = {
//       ...newItems[index],
//       [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value)
//     };
//     setFormData(prev => ({ ...prev, items: newItems }));
//   };

//   const addItem = () => {
//     setFormData(prev => ({
//       ...prev,
//       items: [
//         ...prev.items,
//         {
//           lineNumber: prev.items.length + 1,
//           categoryId: '',
//           subCategoryId: '',
//           itemId: '',
//           description: '',
//           quantity: 1,
//           unitId: '',
//           rate: 0,
//           taxId: '',
//           taxPercent: '',
//           taxExempt: false,
//           lineDiscount: 0,
//         }
//       ]
//     }));
//   };

//   const removeItem = (index) => {
//     setFormData(prev => {
//       const items = prev.items.filter((_, i) => i !== index).map((it, idx) => ({ ...it, lineNumber: idx + 1 }));
//       return ({ ...prev, items });
//     });
//   };

//   /* ---------------- Attachments: only button + upload ---------------- */

//   // open picker
//   const onAddAttachmentClick = () => {
//     if (fileInputRef.current) fileInputRef.current.click();
//   };

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
//       const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' };

//       const res = await axios.post(`${API_URL}/uploads`, fd, { headers });
//       // expect { fileName, filePath } or similar
//       const fileName = res.data.fileName ?? file.name;
//       const filePath = res.data.filePath ?? res.data.path ?? '';

//       const att = {
//         id: null,
//         fileName,
//         filePath,
//         uploadedBy: formData.createdBy || '',
//         uploadedAt: new Date().toISOString()
//       };

//       setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), att] }));
//     } catch (err) {
//       console.error('Upload error:', err);
//       setError('File upload failed.');
//     } finally {
//       setUploading(false);
//       if (fileInputRef.current) fileInputRef.current.value = '';
//     }
//   };

//   const removeAttachment = (index) => {
//     setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
//   };

//   /* ---------------- totals ---------------- */
//   const totals = useMemo(() => {
//     let subTotal = 0;
//     let totalDiscount = 0;
//     let totalTax = 0;

//     formData.items.forEach(item => {
//       const quantity = parseFloat(item.quantity) || 0;
//       const rate = parseFloat(item.rate) || 0;
//       const lineDiscount = parseFloat(item.lineDiscount) || 0;

//       const itemAmount = quantity * rate;
//       const netAmount = Math.max(0, itemAmount - lineDiscount);

//       subTotal += itemAmount;
//       totalDiscount += lineDiscount;

//       const taxMaster = taxes.find(t => Number(t.id) === Number(item.taxId));
//       const taxRate = parseFloat(item.taxPercent ?? (taxMaster ? taxMaster.rate : 0)) || 0;

//       if (!item.taxExempt && taxRate > 0) {
//         totalTax += netAmount * (taxRate / 100);
//       }
//     });

//     const otherCharges = parseFloat(formData.otherCharges) || 0;
//     const totalAmount = (subTotal - totalDiscount) + totalTax + otherCharges;

//     return { subTotal, totalDiscount, totalTax, otherCharges, totalAmount };
//   }, [formData.items, formData.otherCharges, taxes]);

//   /* ---------------- submit ---------------- */
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     const payload = {
//       orderCategory: formData.orderCategory,
//       supplierId: formData.supplierId || null,
//       poNumber: formData.poNumber || null,
//       reference: formData.reference || null,
//       date: formData.date,
//       discountMode: formData.discountMode,
//       currency: formData.currency,
//       remark: formData.remark,
//       status: formData.status,
//       createdBy: formData.createdBy,
//       otherCharges: Number(formData.otherCharges) || 0,
//       items: (formData.items || []).map(it => ({
//         lineNumber: it.lineNumber,
//         categoryId: it.categoryId || null,
//         subCategoryId: it.subCategoryId || null,
//         itemId: it.itemId || null,
//         description: it.description || null,
//         quantity: Number(it.quantity) || 0,
//         unitId: it.unitId || null,
//         rate: Number(it.rate) || 0,
//         taxId: it.taxId || null,
//         taxExempt: !!it.taxExempt,
//         taxPercent: it.taxPercent !== '' ? (Number(it.taxPercent) || 0) : null,
//         lineDiscount: Number(it.lineDiscount) || 0
//       })),
//       attachments: (formData.attachments || []).map(a => ({
//         fileName: a.fileName,
//         filePath: a.filePath,
//         uploadedBy: a.uploadedBy || formData.createdBy,
//         uploadedAt: a.uploadedAt || new Date().toISOString()
//       }))
//     };

//     try {
//       const token = localStorage.getItem('token');
//       const headers = { Authorization: `Bearer ${token}` };

//       if (isEditing) {
//         await axios.put(`${API_URL}/purchase/orders/${id}`, payload, { headers });
//       } else {
//         await axios.post(`${API_URL}/purchase/orders`, payload, { headers });
//       }
//       navigate('/purchase-dashboard/purchase-orders');
//     } catch (err) {
//       console.error("Failed to save purchase order:", err);
//       setError(err.response?.data?.message || "An error occurred while saving.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading && !isEditing) {
//     return <div className="flex justify-center items-center h-64"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
//   }

//   /* ---------------- render ---------------- */
//   return (
//     <div className="bg-card p-6 rounded-xl shadow-sm">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-foreground">{isEditing ? `Edit Purchase Order #${formData.poNumber || ''}` : 'New Purchase Order'}</h1>
//         <Link to="/purchase-dashboard/purchase-orders" className="btn-secondary flex items-center gap-2">
//           <ArrowLeft size={16} /> Back to List
//         </Link>
//       </div>

//       {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span className="block sm:inline">{error}</span></div>}

//       <form onSubmit={handleSubmit} className="space-y-8">
//         {/* Header */}
//         <div className="p-4 border border-border rounded-lg">
//           <h2 className="text-lg font-semibold text-foreground mb-4">Order Details</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             <SelectField label="Order Category" name="orderCategory" value={formData.orderCategory} onChange={handleHeaderChange}>
//               <option value="Domestic">Domestic</option>
//               <option value="Imported">Imported</option>
//             </SelectField>

//             <SelectField label="Supplier" name="supplierId" value={formData.supplierId || ''} onChange={handleHeaderChange} required>
//               <option value="">Select Supplier</option>
//               {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName || s.name || `${s.firstName || ''} ${s.lastName || ''}`}</option>)}
//             </SelectField>

//             <InputField label="PO Number" name="poNumber" value={formData.poNumber || ''} onChange={handleHeaderChange} placeholder="Auto-generated or manual" />
//             <InputField label="Reference" name="reference" value={formData.reference || ''} onChange={handleHeaderChange} />

//             <InputField label="Date" name="date" type="date" value={formData.date || ''} onChange={handleHeaderChange} required />
//             <SelectField label="Discount Mode" name="discountMode" value={formData.discountMode || ''} onChange={handleHeaderChange}>
//               <option value="Without Discount">Without Discount</option>
//               <option value="Item level">Item level</option>
//               <option value="Order level">Order level</option>
//             </SelectField>

//             <SelectField label="Currency" name="currency" value={formData.currency || 'AED'} onChange={handleHeaderChange}>
//               <option value="AED">AED</option>
//               <option value="USD">USD</option>
//               <option value="EUR">EUR</option>
//             </SelectField>

//             <SelectField label="Status" name="status" value={formData.status || 'Draft'} onChange={handleHeaderChange}>
//               <option value="Draft">Draft</option>
//               <option value="Confirmed">Confirmed</option>
//               <option value="Cancelled">Cancelled</option>
//             </SelectField>

//             <div className="lg:col-span-4">
//               <label htmlFor="remark" className="block text-sm font-medium text-foreground-muted">Remarks</label>
//               <textarea id="remark" name="remark" value={formData.remark || ''} onChange={handleHeaderChange} rows="3" className="input mt-1 bg-background-muted border-border"></textarea>
//             </div>

//             <InputField label="Created By" name="createdBy" value={formData.createdBy || ''} onChange={handleHeaderChange} />
//           </div>
//         </div>

//         {/* Items */}
//         <div className="p-4 border border-border rounded-lg">
//           <h2 className="text-lg font-semibold text-foreground mb-4">Items</h2>
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="bg-background-muted">
//                 <tr>
//                   <th className="th-cell text-left">#</th>
//                   <th className="th-cell text-left w-2/5">Category / Item</th>
//                   <th className="th-cell text-right">Qty</th>
//                   <th className="th-cell text-left">Unit</th>
//                   <th className="th-cell text-right">Rate</th>
//                   <th className="th-cell text-left">Tax</th>
//                   <th className="th-cell text-left">Tax % (ovr)</th>
//                   <th className="th-cell text-right">Discount</th>
//                   <th className="th-cell text-right">Amount</th>
//                   <th className="th-cell"></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {formData.items.map((item, index) => {
//                   const quantity = parseFloat(item.quantity) || 0;
//                   const rate = parseFloat(item.rate) || 0;
//                   const lineDiscount = parseFloat(item.lineDiscount) || 0;
//                   const amount = Math.max(0, (quantity * rate) - lineDiscount);
//                   return (
//                     <tr key={index} className="border-b border-border">
//                       <td className="td-cell">{item.lineNumber}</td>
//                       <td className="td-cell">
//                         <div className="grid grid-cols-2 gap-2">
//                           <select
//                             name="categoryId"
//                             value={item.categoryId || ''}
//                             onChange={async (e) => {
//                               handleItemChange(index, e);
//                               const newCatId = e.target.value;
//                               await fetchSubCategoriesForCategory(newCatId);
//                               setFormData(prev => {
//                                 const items = [...prev.items];
//                                 items[index] = { ...items[index], subCategoryId: '' };
//                                 return { ...prev, items };
//                               });
//                             }}
//                             className="input text-sm"
//                           >
//                             <option value="">Category</option>
//                             {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                           </select>

//                           <select
//                             name="subCategoryId"
//                             value={item.subCategoryId || ''}
//                             onChange={(e) => handleItemChange(index, e)}
//                             className="input text-sm"
//                           >
//                             <option value="">Subcategory</option>
//                             {(subCategoriesByCategory[item.categoryId] || []).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
//                           </select>

//                           <select name="itemId" value={item.itemId || ''} onChange={(e) => handleItemChange(index, e)} className="input text-sm col-span-2">
//                             <option value="">Select Item</option>
//                             {rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
//                           </select>

//                           <input name="description" value={item.description || ''} onChange={(e) => handleItemChange(index, e)} placeholder="Description (optional)" className="input text-sm col-span-2" />
//                         </div>
//                       </td>
//                       <td className="td-cell"><input type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e)} className="input text-right text-sm" /></td>
//                       <td className="td-cell">
//                         <select name="unitId" value={item.unitId || ''} onChange={(e) => handleItemChange(index, e)} className="input text-sm">
//                           <option value="">Unit</option>
//                           {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
//                         </select>
//                       </td>
//                       <td className="td-cell"><input type="number" name="rate" value={item.rate} onChange={(e) => handleItemChange(index, e)} className="input text-right text-sm" /></td>
//                       <td className="td-cell">
//                         <select name="taxId" value={item.taxId || ''} onChange={(e) => handleItemChange(index, e)} className="input text-sm">
//                           <option value="">Tax</option>
//                           {taxes.map(t => <option key={t.id} value={t.id}>{t.code} ({t.rate}%)</option>)}
//                         </select>
//                         <div className="flex items-center gap-2 mt-1">
//                           <input id={`taxExempt-${index}`} name="taxExempt" type="checkbox" checked={!!item.taxExempt} onChange={(e) => handleItemChange(index, e)} />
//                           <label htmlFor={`taxExempt-${index}`} className="text-xs">Tax Exempt</label>
//                         </div>
//                       </td>
//                       <td className="td-cell"><input type="number" name="taxPercent" value={item.taxPercent || ''} onChange={(e) => handleItemChange(index, e)} className="input text-right text-sm" placeholder="optional" /></td>
//                       <td className="td-cell"><input type="number" name="lineDiscount" value={item.lineDiscount || 0} onChange={(e) => handleItemChange(index, e)} className="input text-right text-sm" /></td>
//                       <td className="td-cell text-right font-medium">{amount.toFixed(2)}</td>
//                       <td className="td-cell">
//                         <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
//                           <Trash2 size={16} />
//                         </button>
//                       </td>
//                     </tr>
//                   )
//                 })}
//               </tbody>
//             </table>
//           </div>
//           <button type="button" onClick={addItem} className="btn-secondary mt-4 flex items-center gap-2">
//             <Plus size={16} /> Add Item
//           </button>
//         </div>

//         {/* Attachments: single button + upload */}
//         <div className="p-4 border border-border rounded-lg">
//           <h2 className="text-lg font-semibold text-foreground mb-4">Attachments</h2>

//           <div className="space-y-2">
//             {(formData.attachments || []).length === 0 && <div className="text-sm text-foreground-muted">No attachments uploaded.</div>}
//             {(formData.attachments || []).map((att, idx) => (
//               <div key={idx} className="flex items-center justify-between gap-4 border p-2 rounded">
//                 <div>
//                   <div className="font-medium">{att.fileName}</div>
//                   <div className="text-xs text-foreground-muted">{att.uploadedAt ? new Date(att.uploadedAt).toLocaleString() : ''}</div>
//                   {att.filePath && <div className="text-xs"><a className="text-primary underline" href={att.filePath} target="_blank" rel="noreferrer">Open</a></div>}
//                 </div>
//                 <div>
//                   <button type="button" onClick={() => removeAttachment(idx)} className="p-2 text-red-500 rounded"><Trash2 /></button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <input ref={fileInputRef} type="file" className="hidden" onChange={onFileSelected} />
//           <div className="mt-4 flex items-center gap-4">
//             <button type="button" onClick={onAddAttachmentClick} className="btn-secondary flex items-center gap-2" disabled={uploading}>
//               <Plus size={16} /> Add Attachment
//             </button>
//             {uploading && <span className="text-sm">Uploading...</span>}
//           </div>
//         </div>

//         {/* Totals */}
//         <div className="flex justify-end">
//           <div className="w-full max-w-sm space-y-2 text-sm">
//             <div className="flex justify-between">
//               <span className="text-foreground-muted">Subtotal:</span>
//               <span className="font-medium text-foreground">{totals.subTotal.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-foreground-muted">Total Discount:</span>
//               <span className="font-medium text-foreground">{totals.totalDiscount.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-foreground-muted">Total Tax:</span>
//               <span className="font-medium text-foreground">{totals.totalTax.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-foreground-muted">Other Charges:</span>
//               <InputField type="number" name="otherCharges" value={formData.otherCharges || 0} onChange={handleHeaderChange} className="input text-right text-sm w-24 py-1" />
//             </div>
//             <div className="flex justify-between border-t border-border pt-2 mt-2">
//               <span className="text-lg font-bold text-foreground">Total Amount:</span>
//               <span className="text-lg font-bold text-foreground">{totals.totalAmount.toFixed(2)} {formData.currency}</span>
//             </div>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex justify-end gap-4 pt-6 border-t border-border">
//           <button type="button" onClick={() => navigate('/purchase-dashboard/purchase-orders')} className="btn-secondary" disabled={loading}>
//             Cancel
//           </button>
//           <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
//             {loading ? <Loader className="animate-spin h-4 w-4" /> : <Save size={16} />}
//             {isEditing ? 'Update' : 'Save'} Purchase Order
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default PurchaseOrderForm;

// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { useNavigate, useParams, Link } from 'react-router-dom';
// import axios from 'axios';
// import { Plus, Trash2, Save, Loader, ArrowLeft } from 'lucide-react';

// const API_URL = import.meta.env.VITE_API_BASE_URL;

// // Small input/select helpers that match your UI classes
// const InputField = ({ label, ...props }) => (
//   <div>
//     <label htmlFor={props.id || props.name} className="block text-sm font-medium text-foreground-muted">{label}</label>
//     <input {...props} className="input mt-1 bg-background-muted border-border" />
//   </div>
// );

// const SelectField = ({ label, children, ...props }) => (
//   <div>
//     <label htmlFor={props.id || props.name} className="block text-sm font-medium text-foreground-muted">{label}</label>
//     <select {...props} className="input mt-1 bg-background-muted border-border">{children}</select>
//   </div>
// );

// export default function PurchaseOrderForm() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const isEditing = Boolean(id);
//   const fileInputRef = useRef(null);

//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState('');

//   // master data + form state
//   const [suppliers, setSuppliers] = useState([]);
//   const [rawMaterials, setRawMaterials] = useState([]);
//   const [units, setUnits] = useState([]);
//   const [taxes, setTaxes] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [subCategoriesByCategory, setSubCategoriesByCategory] = useState({});

//   const [formData, setFormData] = useState({
//     orderCategory: 'Domestic',
//     supplierId: '',
//     poNumber: '',
//     reference: '',
//     date: new Date().toISOString().split('T')[0],
//     discountMode: 'Without Discount',
//     currency: 'AED',
//     remark: '',
//     status: 'Draft',
//     createdBy: '',
//     items: [],
//     attachments: []
//   });

//   // --- load masters + (optional) PO
//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       setError('');
//       try {
//         const token = localStorage.getItem('token');
//         const headers = { Authorization: `Bearer ${token}` };

//         const [
//           rawMaterialsRes,
//           unitsRes,
//           taxesRes,
//           categoriesRes,
//           suppliersRes
//         ] = await Promise.all([
//           axios.get(`${API_URL}/production/raw-materials`, { headers, params: { page: 0, size: 500 } }),
//           axios.get(`${API_URL}/production/units`, { headers, params: { page: 0, size: 500 } }),
//           axios.get(`${API_URL}/production/taxes`, { headers, params: { page: 0, size: 500 } }),
//           axios.get(`${API_URL}/production/categories`, { headers, params: { page: 0, size: 500 } }),
//           axios.get(`${API_URL}/parties`, { headers, params: { type: 'SUPPLIER', page: 0, size: 500 } })
//         ]);

//         setRawMaterials(rawMaterialsRes.data.content ?? rawMaterialsRes.data ?? []);
//         setUnits(unitsRes.data.content ?? unitsRes.data ?? []);
//         setTaxes(taxesRes.data.content ?? taxesRes.data ?? []);
//         setCategories(categoriesRes.data.content ?? categoriesRes.data ?? []);
//         setSuppliers(suppliersRes.data.content ?? suppliersRes.data ?? []);

//         if (isEditing) {
//           const poRes = await axios.get(`${API_URL}/purchase/orders/${id}`, { headers });
//           const po = poRes.data;

//           // normalize items & attachments to the form shape
//           setFormData(prev => ({
//             ...prev,
//             orderCategory: po.orderCategory ?? prev.orderCategory,
//             supplierId: po.supplierId ?? '',
//             poNumber: po.poNumber ?? '',
//             reference: po.reference ?? '',
//             date: po.date ? new Date(po.date).toISOString().split('T')[0] : prev.date,
//             discountMode: po.discountMode ?? prev.discountMode,
//             currency: po.currency ?? prev.currency,
//             remark: po.remark ?? '',
//             status: po.status ?? prev.status,
//             createdBy: po.createdBy ?? '',
//             items: (po.items ?? []).map(it => ({
//               id: it.id ?? undefined,
//               lineNumber: it.lineNumber ?? 1,
//               categoryId: it.categoryId ?? '',
//               subCategoryId: it.subCategoryId ?? '',
//               itemId: it.itemId ?? '',
//               description: it.description ?? '',
//               quantity: it.quantity ?? 0,
//               unitId: it.unitId ?? '',
//               rate: it.rate ?? 0,
//               taxId: it.taxId ?? '',
//               taxExempt: !!it.taxExempt,
//               taxPercent: it.taxPercent ?? '',
//               lineDiscount: it.lineDiscount ?? 0
//             })),
//             attachments: (po.attachments ?? []).map(a => ({
//               id: a.id ?? null,
//               fileName: a.fileName ?? '',
//               filePath: a.filePath ?? '',
//               uploadedBy: a.uploadedBy ?? '',
//               uploadedAt: a.uploadedAt ?? new Date().toISOString()
//             }))
//           }));

//           // preload subcategories used in PO
//           const catIds = Array.from(new Set((po.items ?? []).map(i => i.categoryId).filter(Boolean)));
//           await Promise.all(catIds.map(cid => fetchSubCategoriesForCategory(cid)));
//         }
//       } catch (err) {
//         console.error('Failed to load masters or PO', err);
//         setError('Failed to load supporting data. Check token/backends.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id, isEditing]);

//   // fetch sub categories (cached)
//   const fetchSubCategoriesForCategory = async (categoryId) => {
//     if (!categoryId) return [];
//     if (subCategoriesByCategory[categoryId]) return subCategoriesByCategory[categoryId];

//     try {
//       const token = localStorage.getItem('token');
//       const headers = { Authorization: `Bearer ${token}` };
//       const res = await axios.get(`${API_URL}/production/sub-categories`, { headers, params: { categoryId } });
//       const arr = res.data.content ?? res.data ?? [];
//       setSubCategoriesByCategory(prev => ({ ...prev, [categoryId]: arr }));
//       return arr;
//     } catch (err) {
//       console.warn('no sub-cats', err);
//       setSubCategoriesByCategory(prev => ({ ...prev, [categoryId]: [] }));
//       return [];
//     }
//   };

//   // --- form handlers
//   const handleHeaderChange = (e) => {
//     const { name, value, type } = e.target;
//     setFormData(prev => ({ ...prev, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value }));
//   };

//   const handleItemChange = (index, e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => {
//       const items = [...prev.items];
//       items[index] = {
//         ...items[index],
//         [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value)
//       };
//       return { ...prev, items };
//     });
//   };

//   const addItem = () => {
//     setFormData(prev => ({
//       ...prev,
//       items: [
//         ...prev.items,
//         {
//           lineNumber: prev.items.length + 1,
//           categoryId: '',
//           subCategoryId: '',
//           itemId: '',
//           description: '',
//           quantity: 1,
//           unitId: '',
//           rate: 0,
//           taxId: '',
//           taxExempt: false,
//           taxPercent: '',
//           lineDiscount: 0
//         }
//       ]
//     }));
//   };

//   const removeItem = (index) => {
//     setFormData(prev => {
//       const items = prev.items.filter((_, i) => i !== index).map((it, i) => ({ ...it, lineNumber: i + 1 }));
//       return { ...prev, items };
//     });
//   };

//   // --- attachments: single Add button (upload)
//   const onAddAttachmentClick = () => {
//     if (fileInputRef.current) fileInputRef.current.click();
//   };

//   const onFileSelected = async (e) => {
//     const files = e.target.files;
//     if (!files || files.length === 0) return;
//     const file = files[0];

//     setUploading(true);
//     setError('');
//     try {
//       const token = localStorage.getItem('token');
//       const fd = new FormData();
//       fd.append('file', file);

//       const res = await axios.post(`${API_URL}/uploads`, fd, {
//         headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
//       });

//       // backend should return fileName/filePath (adapt if different)
//       const fileName = res.data.fileName ?? file.name;
//       const filePath = res.data.filePath ?? res.data.path ?? '';

//       const att = {
//         id: null,
//         fileName,
//         filePath,
//         uploadedBy: formData.createdBy || '',
//         uploadedAt: new Date().toISOString()
//       };

//       setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), att] }));
//     } catch (err) {
//       console.error('Upload failed', err);
//       setError('Attachment upload failed.');
//     } finally {
//       setUploading(false);
//       if (fileInputRef.current) fileInputRef.current.value = '';
//     }
//   };

//   const removeAttachment = (idx) => {
//     setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }));
//   };

//   // --- totals (client preview only)
//   const totals = useMemo(() => {
//     let subTotal = 0;
//     let totalDiscount = 0;
//     let totalTax = 0;

//     (formData.items || []).forEach(it => {
//       const qty = Number(it.quantity) || 0;
//       const rate = Number(it.rate) || 0;
//       const lineDiscount = Number(it.lineDiscount) || 0;

//       const amount = qty * rate;
//       const net = Math.max(0, amount - lineDiscount);

//       subTotal += amount;
//       totalDiscount += lineDiscount;

//       const taxMaster = taxes.find(t => String(t.id) === String(it.taxId));
//       const taxRate = Number(it.taxPercent ?? (taxMaster ? taxMaster.rate : 0)) || 0;
//       if (!it.taxExempt && taxRate > 0) totalTax += net * (taxRate / 100);
//     });

//     // backend DTO doesn't include otherCharges in your request DTO; omit from request.
//     const otherCharges = 0;
//     const totalAmount = (subTotal - totalDiscount) + totalTax + otherCharges;

//     return { subTotal, totalDiscount, totalTax, otherCharges, totalAmount };
//   }, [formData.items, taxes]);

//   // --- submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     // Build payload matching PurPurchaseOrderRequest
//     const payload = {
//       orderCategory: formData.orderCategory,
//       supplierId: formData.supplierId || null,
//       poNumber: formData.poNumber || null,
//       reference: formData.reference || null,
//       date: formData.date,
//       discountMode: formData.discountMode,
//       currency: formData.currency,
//       remark: formData.remark || null,
//       status: formData.status,
//       createdBy: formData.createdBy || null,
//       // items -> PurPurchaseOrderItemRequest
//       items: (formData.items || []).map(it => ({
//         lineNumber: it.lineNumber,
//         categoryId: it.categoryId || null,
//         subCategoryId: it.subCategoryId || null,
//         itemId: it.itemId || null,
//         description: it.description || null,
//         quantity: it.quantity || 0,
//         unitId: it.unitId || null,
//         rate: it.rate || 0,
//         taxId: it.taxId || null,
//         taxExempt: !!it.taxExempt,
//         taxPercent: it.taxPercent !== '' ? (Number(it.taxPercent) || 0) : null,
//         lineDiscount: it.lineDiscount || 0
//       })),
//       // attachments -> PurPurchaseOrderAttachmentRequest
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
//         await axios.put(`${API_URL}/purchase/orders/${id}`, payload, { headers });
//       } else {
//         await axios.post(`${API_URL}/purchase/orders`, payload, { headers });
//       }

//       navigate('/purchase-dashboard/purchase-orders');
//     } catch (err) {
//       console.error('Failed to save PO', err);
//       setError(err?.response?.data?.message || 'Failed to save purchase order.');
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
//         <h1 className="text-2xl font-bold text-foreground">{isEditing ? `Edit Purchase Order #${formData.poNumber || ''}` : 'New Purchase Order'}</h1>
//         <Link to="/purchase-dashboard/purchase-orders" className="btn-secondary flex items-center gap-2">
//           <ArrowLeft size={16} /> Back to List
//         </Link>
//       </div>

//       {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

//       <form onSubmit={handleSubmit} className="space-y-8">
//         {/* Header */}
//         <div className="p-4 border border-border rounded-lg">
//           <h2 className="text-lg font-semibold text-foreground mb-4">Order Details</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             <SelectField label="Order Category" name="orderCategory" value={formData.orderCategory} onChange={handleHeaderChange}>
//               <option value="Domestic">Domestic</option>
//               <option value="Imported">Imported</option>
//             </SelectField>

//             <SelectField label="Supplier" name="supplierId" value={formData.supplierId || ''} onChange={handleHeaderChange} required>
//               <option value="">Select Supplier</option>
//               {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName || s.name || `${s.firstName || ''} ${s.lastName || ''}`}</option>)}
//             </SelectField>

//             <InputField label="PO Number" name="poNumber" value={formData.poNumber || ''} onChange={handleHeaderChange} placeholder="Auto or manual" />
//             <InputField label="Reference" name="reference" value={formData.reference || ''} onChange={handleHeaderChange} />

//             <InputField label="Date" name="date" type="date" value={formData.date || ''} onChange={handleHeaderChange} />
//             <SelectField label="Discount Mode" name="discountMode" value={formData.discountMode || ''} onChange={handleHeaderChange}>
//               <option value="Without Discount">Without Discount</option>
//               <option value="Item level">Item level</option>
//               <option value="Order level">Order level</option>
//             </SelectField>

//             <SelectField label="Currency" name="currency" value={formData.currency || 'AED'} onChange={handleHeaderChange}>
//               <option value="AED">AED</option>
//               <option value="USD">USD</option>
//               <option value="EUR">EUR</option>
//             </SelectField>

//             <SelectField label="Status" name="status" value={formData.status || 'Draft'} onChange={handleHeaderChange}>
//               <option value="Draft">Draft</option>
//               <option value="Confirmed">Confirmed</option>
//               <option value="Cancelled">Cancelled</option>
//             </SelectField>

//             <div className="lg:col-span-4">
//               <label className="block text-sm font-medium text-foreground-muted">Remarks</label>
//               <textarea name="remark" value={formData.remark || ''} onChange={handleHeaderChange} className="input mt-1 bg-background-muted border-border" rows={3} />
//             </div>

//             <InputField label="Created By" name="createdBy" value={formData.createdBy || ''} onChange={handleHeaderChange} />
//           </div>
//         </div>

//         {/* Items */}
//         <div className="p-4 border border-border rounded-lg">
//           <h2 className="text-lg font-semibold text-foreground mb-4">Items</h2>
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="bg-background-muted">
//                 <tr>
//                   <th className="th-cell">#</th>
//                   <th className="th-cell">Category / Item</th>
//                   <th className="th-cell">Qty</th>
//                   <th className="th-cell">Unit</th>
//                   <th className="th-cell">Rate</th>
//                   <th className="th-cell">Tax</th>
//                   <th className="th-cell">Tax % (ovr)</th>
//                   <th className="th-cell">Discount</th>
//                   <th className="th-cell text-right">Amount</th>
//                   <th className="th-cell" />
//                 </tr>
//               </thead>
//               <tbody>
//                 {(formData.items || []).map((it, idx) => {
//                   const qty = Number(it.quantity) || 0;
//                   const rate = Number(it.rate) || 0;
//                   const discount = Number(it.lineDiscount) || 0;
//                   const amount = Math.max(0, (qty * rate) - discount);
//                   return (
//                     <tr key={idx} className="border-b border-border">
//                       <td className="td-cell">{it.lineNumber}</td>

//                       <td className="td-cell">
//                         <div className="grid grid-cols-2 gap-2">
//                           <select
//                             name="categoryId"
//                             value={it.categoryId || ''}
//                             onChange={async (e) => {
//                               handleItemChange(idx, e);
//                               const catId = e.target.value;
//                               await fetchSubCategoriesForCategory(catId);
//                               setFormData(prev => {
//                                 const items = [...prev.items];
//                                 items[idx] = { ...items[idx], subCategoryId: '' };
//                                 return { ...prev, items };
//                               });
//                             }}
//                             className="input text-sm"
//                           >
//                             <option value="">Category</option>
//                             {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                           </select>

//                           <select name="subCategoryId" value={it.subCategoryId || ''} onChange={(e) => handleItemChange(idx, e)} className="input text-sm">
//                             <option value="">Subcategory</option>
//                             {(subCategoriesByCategory[it.categoryId] || []).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
//                           </select>

//                           <select name="itemId" value={it.itemId || ''} onChange={(e) => handleItemChange(idx, e)} className="input text-sm col-span-2">
//                             <option value="">Select Item</option>
//                             {rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
//                           </select>

//                           <input name="description" value={it.description || ''} onChange={(e) => handleItemChange(idx, e)} placeholder="Description (optional)" className="input text-sm col-span-2" />
//                         </div>
//                       </td>

//                       <td className="td-cell"><input type="number" name="quantity" value={it.quantity} onChange={(e) => handleItemChange(idx, e)} className="input text-right text-sm" /></td>

//                       <td className="td-cell">
//                         <select name="unitId" value={it.unitId || ''} onChange={(e) => handleItemChange(idx, e)} className="input text-sm">
//                           <option value="">Unit</option>
//                           {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
//                         </select>
//                       </td>

//                       <td className="td-cell"><input type="number" name="rate" value={it.rate} onChange={(e) => handleItemChange(idx, e)} className="input text-right text-sm" /></td>

//                       <td className="td-cell">
//                         <select name="taxId" value={it.taxId || ''} onChange={(e) => handleItemChange(idx, e)} className="input text-sm">
//                           <option value="">Tax</option>
//                           {taxes.map(t => <option key={t.id} value={t.id}>{t.code} ({t.rate}%)</option>)}
//                         </select>
//                         <div className="flex items-center gap-2 mt-1">
//                           <input id={`taxExempt-${idx}`} name="taxExempt" type="checkbox" checked={!!it.taxExempt} onChange={(e) => handleItemChange(idx, e)} />
//                           <label htmlFor={`taxExempt-${idx}`} className="text-xs">Tax Exempt</label>
//                         </div>
//                       </td>

//                       <td className="td-cell"><input type="number" name="taxPercent" value={it.taxPercent || ''} onChange={(e) => handleItemChange(idx, e)} className="input text-right text-sm" placeholder="optional" /></td>

//                       <td className="td-cell"><input type="number" name="lineDiscount" value={it.lineDiscount || 0} onChange={(e) => handleItemChange(idx, e)} className="input text-right text-sm" /></td>

//                       <td className="td-cell text-right font-medium">{amount.toFixed(2)}</td>

//                       <td className="td-cell">
//                         <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
//                           <Trash2 size={16} />
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           <button type="button" onClick={addItem} className="btn-secondary mt-4 flex items-center gap-2">
//             <Plus size={16} /> Add Item
//           </button>
//         </div>

//         {/* Attachments: single Add button only */}
//         <div className="p-4 border border-border rounded-lg">
//           <h2 className="text-lg font-semibold text-foreground mb-4">Attachments</h2>

//           <div className="space-y-2">
//             {(formData.attachments || []).length === 0 && <div className="text-sm text-foreground-muted">No attachments uploaded.</div>}
//             {(formData.attachments || []).map((a, idx) => (
//               <div key={idx} className="flex items-center justify-between gap-4 border p-2 rounded">
//                 <div>
//                   <div className="font-medium">{a.fileName}</div>
//                   <div className="text-xs text-foreground-muted">{a.uploadedAt ? new Date(a.uploadedAt).toLocaleString() : ''}</div>
//                   {a.filePath && <div className="text-xs"><a className="text-primary underline" href={a.filePath} target="_blank" rel="noreferrer">Open</a></div>}
//                 </div>
//                 <div>
//                   <button type="button" onClick={() => removeAttachment(idx)} className="p-2 text-red-500 rounded"><Trash2 /></button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <input ref={fileInputRef} type="file" className="hidden" onChange={onFileSelected} />
//           <div className="mt-4 flex items-center gap-4">
//             <button type="button" onClick={onAddAttachmentClick} className="btn-secondary flex items-center gap-2" disabled={uploading}>
//               <Plus size={16} /> Add Attachment
//             </button>
//             {uploading && <span className="text-sm">Uploading...</span>}
//           </div>
//         </div>

//         {/* Totals */}
//         <div className="flex justify-end">
//           <div className="w-full max-w-sm space-y-2 text-sm">
//             <div className="flex justify-between">
//               <span className="text-foreground-muted">Subtotal:</span>
//               <span className="font-medium text-foreground">{totals.subTotal.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-foreground-muted">Total Discount:</span>
//               <span className="font-medium text-foreground">{totals.totalDiscount.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-foreground-muted">Total Tax:</span>
//               <span className="font-medium text-foreground">{totals.totalTax.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between border-t border-border pt-2 mt-2">
//               <span className="text-lg font-bold text-foreground">Total Amount:</span>
//               <span className="text-lg font-bold text-foreground">{totals.totalAmount.toFixed(2)} {formData.currency}</span>
//             </div>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex justify-end gap-4 pt-6 border-t border-border">
//           <button type="button" onClick={() => navigate('/purchase-dashboard/purchase-orders')} className="btn-secondary" disabled={loading}>
//             Cancel
//           </button>
//           <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
//             {loading ? <Loader className="animate-spin h-4 w-4" /> : <Save size={16} />}
//             {isEditing ? 'Update' : 'Save'} Purchase Order
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }


// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { useNavigate, useParams, Link } from 'react-router-dom';
// import axios from 'axios';
// import { Plus, Trash2, Save, Loader, ArrowLeft } from 'lucide-react';

// const API_URL = import.meta.env.VITE_API_BASE_URL; // e.g. http://localhost:8080

// const InputField = ({ label, ...props }) => (
//   <div>
//     <label htmlFor={props.id || props.name} className="block text-sm font-medium text-foreground-muted">{label}</label>
//     <input {...props} className="input mt-1 bg-background-muted border-border" />
//   </div>
// );

// const SelectField = ({ label, children, ...props }) => (
//   <div>
//     <label htmlFor={props.id || props.name} className="block text-sm font-medium text-foreground-muted">{label}</label>
//     <select {...props} className="input mt-1 bg-background-muted border-border">{children}</select>
//   </div>
// );

// export default function PurchaseOrderForm() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const isEditing = Boolean(id);
//   const fileInputRef = useRef(null);

//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState('');

//   // masters + caches
//   const [suppliers, setSuppliers] = useState([]);
//   const [rawMaterials, setRawMaterials] = useState([]);
//   const [units, setUnits] = useState([]);
//   const [taxes, setTaxes] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [subCategoriesByCategory, setSubCategoriesByCategory] = useState({});

//   // form state
//   const [formData, setFormData] = useState({
//     orderCategory: 'Domestic',
//     supplierId: '',
//     poNumber: '',
//     reference: '',
//     date: new Date().toISOString().split('T')[0],
//     discountMode: 'Without Discount',
//     currency: 'AED',
//     remark: '',
//     status: 'Draft',
//     createdBy: '',
//     items: [],
//     attachments: []
//   });

//   // load master data and optionally existing PO
//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       setError('');
//       try {
//         const token = localStorage.getItem('token');
//         const headers = { Authorization: `Bearer ${token}` };

//         const [
//           rawMaterialsRes,
//           unitsRes,
//           taxesRes,
//           categoriesRes,
//           suppliersRes
//         ] = await Promise.all([
//           axios.get(`${API_URL}/production/raw-materials`, { headers, params: { page: 0, size: 500 } }),
//           axios.get(`${API_URL}/production/units`, { headers, params: { page: 0, size: 500 } }),
//           axios.get(`${API_URL}/production/taxes`, { headers, params: { page: 0, size: 500 } }),
//           axios.get(`${API_URL}/production/categories`, { headers, params: { page: 0, size: 500 } }),
//           axios.get(`${API_URL}/parties`, { headers, params: { type: 'SUPPLIER', page: 0, size: 500 } })
//         ]);

//         setRawMaterials(rawMaterialsRes.data.content ?? rawMaterialsRes.data ?? []);
//         setUnits(unitsRes.data.content ?? unitsRes.data ?? []);
//         setTaxes(taxesRes.data.content ?? taxesRes.data ?? []);
//         setCategories(categoriesRes.data.content ?? categoriesRes.data ?? []);
//         setSuppliers(suppliersRes.data.content ?? suppliersRes.data ?? []);

//         if (isEditing) {
//           const poRes = await axios.get(`${API_URL}/purchase/orders/${id}`, { headers });
//           const po = poRes.data;
//           setFormData(prev => ({
//             ...prev,
//             orderCategory: po.orderCategory ?? prev.orderCategory,
//             supplierId: po.supplierId ?? '',
//             poNumber: po.poNumber ?? '',
//             reference: po.reference ?? '',
//             date: po.date ? new Date(po.date).toISOString().split('T')[0] : prev.date,
//             discountMode: po.discountMode ?? prev.discountMode,
//             currency: po.currency ?? prev.currency,
//             remark: po.remark ?? '',
//             status: po.status ?? prev.status,
//             createdBy: po.createdBy ?? '',
//             items: (po.items ?? []).map(it => ({
//               id: it.id ?? undefined,
//               lineNumber: it.lineNumber ?? 1,
//               categoryId: it.categoryId ?? '',
//               subCategoryId: it.subCategoryId ?? '',
//               itemId: it.itemId ?? '',
//               description: it.description ?? '',
//               quantity: it.quantity ?? 0,
//               unitId: it.unitId ?? '',
//               rate: it.rate ?? 0,
//               taxId: it.taxId ?? '',
//               taxExempt: !!it.taxExempt,
//               taxPercent: it.taxPercent ?? '',
//               lineDiscount: it.lineDiscount ?? 0
//             })),
//             attachments: (po.attachments ?? []).map(a => ({
//               id: a.id ?? null,
//               fileName: a.fileName ?? '',
//               filePath: a.filePath ?? '',
//               uploadedBy: a.uploadedBy ?? '',
//               uploadedAt: a.uploadedAt ?? new Date().toISOString()
//             }))
//           }));

//           const catIds = Array.from(new Set((po.items ?? []).map(i => i.categoryId).filter(Boolean)));
//           await Promise.all(catIds.map(cid => fetchSubCategoriesForCategory(cid)));
//         }
//       } catch (err) {
//         console.error('Failed to load masters/po', err);
//         setError('Failed to load required data. Check backend/token.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id, isEditing]);

//   // fetch sub-categories (cached)
//   const fetchSubCategoriesForCategory = async (categoryId) => {
//     if (!categoryId) return [];
//     if (subCategoriesByCategory[categoryId]) return subCategoriesByCategory[categoryId];
//     try {
//       const token = localStorage.getItem('token');
//       const headers = { Authorization: `Bearer ${token}` };
//       const res = await axios.get(`${API_URL}/production/sub-categories`, { headers, params: { categoryId } });
//       const arr = res.data.content ?? res.data ?? [];
//       setSubCategoriesByCategory(prev => ({ ...prev, [categoryId]: arr }));
//       return arr;
//     } catch (err) {
//       setSubCategoriesByCategory(prev => ({ ...prev, [categoryId]: [] }));
//       return [];
//     }
//   };

//   // handlers
//   const handleHeaderChange = (e) => {
//     const { name, value, type } = e.target;
//     setFormData(prev => ({ ...prev, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value }));
//   };

//   const handleItemChange = (index, e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => {
//       const items = [...prev.items];
//       items[index] = { ...items[index], [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value) };
//       return { ...prev, items };
//     });
//   };

//   const addItem = () => {
//     setFormData(prev => ({
//       ...prev,
//       items: [...prev.items, {
//         lineNumber: prev.items.length + 1,
//         categoryId: '',
//         subCategoryId: '',
//         itemId: '',
//         description: '',
//         quantity: 1,
//         unitId: '',
//         rate: 0,
//         taxId: '',
//         taxExempt: false,
//         taxPercent: '',
//         lineDiscount: 0
//       }]
//     }));
//   };

//   const removeItem = (index) => {
//     setFormData(prev => {
//       const items = prev.items.filter((_, i) => i !== index).map((it, i) => ({ ...it, lineNumber: i + 1 }));
//       return { ...prev, items };
//     });
//   };

//   // Attachments: single Add button — uploads file to /uploads then appends attachment record
//   const onAddAttachmentClick = () => fileInputRef.current && fileInputRef.current.click();

//   const onFileSelected = async (e) => {
//     const files = e.target.files;
//     if (!files || files.length === 0) return;
//     const file = files[0];
//     setUploading(true);
//     setError('');
//     try {
//       const token = localStorage.getItem('token');
//       const fd = new FormData();
//       fd.append('file', file);

//       const res = await axios.post(`${API_URL}/uploads`, fd, {
//         headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
//       });

//       // adapt returned shape if your upload API differs
//       const fileName = res.data.fileName ?? file.name;
//       const filePath = res.data.filePath ?? res.data.path ?? '';

//       const att = {
//         id: null,
//         fileName,
//         filePath,
//         uploadedBy: formData.createdBy || '',
//         uploadedAt: new Date().toISOString()
//       };

//       setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), att] }));
//     } catch (err) {
//       console.error('Upload failed', err);
//       setError('Attachment upload failed.');
//     } finally {
//       setUploading(false);
//       if (fileInputRef.current) fileInputRef.current.value = '';
//     }
//   };

//   const removeAttachment = (idx) => setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }));

//   // totals (client preview)
//   const totals = useMemo(() => {
//     let subTotal = 0;
//     let totalDiscount = 0;
//     let totalTax = 0;

//     (formData.items || []).forEach(it => {
//       const qty = Number(it.quantity) || 0;
//       const rate = Number(it.rate) || 0;
//       const lineDiscount = Number(it.lineDiscount) || 0;
//       const amount = qty * rate;
//       const net = Math.max(0, amount - lineDiscount);

//       subTotal += amount;
//       totalDiscount += lineDiscount;

//       const taxMaster = taxes.find(t => String(t.id) === String(it.taxId));
//       const taxRate = Number(it.taxPercent ?? (taxMaster ? taxMaster.rate : 0)) || 0;
//       if (!it.taxExempt && taxRate > 0) totalTax += net * (taxRate / 100);
//     });

//     // backend request DTO doesn't include otherCharges — preview only
//     const otherCharges = 0;
//     const totalAmount = (subTotal - totalDiscount) + totalTax + otherCharges;

//     return { subTotal, totalDiscount, totalTax, otherCharges, totalAmount };
//   }, [formData.items, taxes]);

//   // submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     const payload = {
//       orderCategory: formData.orderCategory,
//       supplierId: formData.supplierId || null,
//       poNumber: formData.poNumber || null,
//       reference: formData.reference || null,
//       date: formData.date,
//       discountMode: formData.discountMode,
//       currency: formData.currency,
//       remark: formData.remark || null,
//       status: formData.status,
//       createdBy: formData.createdBy || null,
//       items: (formData.items || []).map(it => ({
//         lineNumber: it.lineNumber,
//         categoryId: it.categoryId || null,
//         subCategoryId: it.subCategoryId || null,
//         itemId: it.itemId || null,
//         description: it.description || null,
//         quantity: it.quantity || 0,
//         unitId: it.unitId || null,
//         rate: it.rate || 0,
//         taxId: it.taxId || null,
//         taxExempt: !!it.taxExempt,
//         taxPercent: it.taxPercent !== '' ? (Number(it.taxPercent) || 0) : null,
//         lineDiscount: Number(it.lineDiscount) || 0
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
//         await axios.put(`${API_URL}/purchase/orders/${id}`, payload, { headers });
//       } else {
//         await axios.post(`${API_URL}/purchase/orders`, payload, { headers });
//       }

//       navigate('/purchase-dashboard/purchase-orders');
//     } catch (err) {
//       console.error('Failed to save PO', err);
//       setError(err?.response?.data?.message || 'Failed to save purchase order.');
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
//         <h1 className="text-2xl font-bold text-foreground">{isEditing ? `Edit Purchase Order #${formData.poNumber || ''}` : 'New Purchase Order'}</h1>
//         <Link to="/purchase-dashboard/purchase-orders" className="btn-secondary flex items-center gap-2">
//           <ArrowLeft size={16} /> Back to List
//         </Link>
//       </div>

//       {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

//       <form onSubmit={handleSubmit} className="space-y-8">
//         {/* Header */}
//         <div className="p-4 border border-border rounded-lg">
//           <h2 className="text-lg font-semibold text-foreground mb-4">Order Details</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             <SelectField label="Order Category" name="orderCategory" value={formData.orderCategory} onChange={handleHeaderChange}>
//               <option value="Domestic">Domestic</option>
//               <option value="Imported">Imported</option>
//             </SelectField>

//             <SelectField label="Supplier" name="supplierId" value={formData.supplierId || ''} onChange={handleHeaderChange} required>
//               <option value="">Select Supplier</option>
//               {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName || s.name || `${s.firstName || ''} ${s.lastName || ''}`}</option>)}
//             </SelectField>

//             <InputField label="PO Number" name="poNumber" value={formData.poNumber || ''} onChange={handleHeaderChange} placeholder="Auto or manual" />
//             <InputField label="Reference" name="reference" value={formData.reference || ''} onChange={handleHeaderChange} />

//             <InputField label="Date" name="date" type="date" value={formData.date || ''} onChange={handleHeaderChange} />
//             <SelectField label="Discount Mode" name="discountMode" value={formData.discountMode || ''} onChange={handleHeaderChange}>
//               <option value="Without Discount">Without Discount</option>
//               <option value="Item level">Item level</option>
//               <option value="Order level">Order level</option>
//             </SelectField>

//             <SelectField label="Currency" name="currency" value={formData.currency || 'AED'} onChange={handleHeaderChange}>
//               <option value="AED">AED</option>
//               <option value="USD">USD</option>
//               <option value="EUR">EUR</option>
//             </SelectField>

//             <SelectField label="Status" name="status" value={formData.status || 'Draft'} onChange={handleHeaderChange}>
//               <option value="Draft">Draft</option>
//               <option value="Confirmed">Confirmed</option>
//               <option value="Cancelled">Cancelled</option>
//             </SelectField>

//             <div className="lg:col-span-4">
//               <label className="block text-sm font-medium text-foreground-muted">Remarks</label>
//               <textarea name="remark" value={formData.remark || ''} onChange={handleHeaderChange} className="input mt-1 bg-background-muted border-border" rows={3} />
//             </div>

//             <InputField label="Created By" name="createdBy" value={formData.createdBy || ''} onChange={handleHeaderChange} />
//           </div>
//         </div>

//         {/* Items */}
//         <div className="p-4 border border-border rounded-lg">
//           <h2 className="text-lg font-semibold text-foreground mb-4">Items</h2>
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="bg-background-muted">
//                 <tr>
//                   <th className="th-cell">#</th>
//                   <th className="th-cell">Category / Item</th>
//                   <th className="th-cell">Qty</th>
//                   <th className="th-cell">Unit</th>
//                   <th className="th-cell">Rate</th>
//                   <th className="th-cell">Tax</th>
//                   <th className="th-cell">Tax % (ovr)</th>
//                   <th className="th-cell">Discount</th>
//                   <th className="th-cell text-right">Amount</th>
//                   <th className="th-cell" />
//                 </tr>
//               </thead>
//               <tbody>
//                 {(formData.items || []).map((it, idx) => {
//                   const qty = Number(it.quantity) || 0;
//                   const rate = Number(it.rate) || 0;
//                   const discount = Number(it.lineDiscount) || 0;
//                   const amount = Math.max(0, (qty * rate) - discount);
//                   return (
//                     <tr key={idx} className="border-b border-border">
//                       <td className="td-cell">{it.lineNumber}</td>
//                       <td className="td-cell">
//                         <div className="grid grid-cols-2 gap-2">
//                           <select
//                             name="categoryId"
//                             value={it.categoryId || ''}
//                             onChange={async (e) => {
//                               handleItemChange(idx, e);
//                               const newCat = e.target.value;
//                               await fetchSubCategoriesForCategory(newCat);
//                               setFormData(prev => {
//                                 const items = [...prev.items];
//                                 items[idx] = { ...items[idx], subCategoryId: '' };
//                                 return { ...prev, items };
//                               });
//                             }}
//                             className="input text-sm"
//                           >
//                             <option value="">Category</option>
//                             {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                           </select>

//                           <select name="subCategoryId" value={it.subCategoryId || ''} onChange={(e) => handleItemChange(idx, e)} className="input text-sm">
//                             <option value="">Subcategory</option>
//                             {(subCategoriesByCategory[it.categoryId] || []).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
//                           </select>

//                           <select name="itemId" value={it.itemId || ''} onChange={(e) => handleItemChange(idx, e)} className="input text-sm col-span-2">
//                             <option value="">Select Item</option>
//                             {rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
//                           </select>

//                           <input name="description" value={it.description || ''} onChange={(e) => handleItemChange(idx, e)} placeholder="Description (optional)" className="input text-sm col-span-2" />
//                         </div>
//                       </td>

//                       <td className="td-cell"><input type="number" name="quantity" value={it.quantity} onChange={(e) => handleItemChange(idx, e)} className="input text-right text-sm" /></td>

//                       <td className="td-cell">
//                         <select name="unitId" value={it.unitId || ''} onChange={(e) => handleItemChange(idx, e)} className="input text-sm">
//                           <option value="">Unit</option>
//                           {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
//                         </select>
//                       </td>

//                       <td className="td-cell"><input type="number" name="rate" value={it.rate} onChange={(e) => handleItemChange(idx, e)} className="input text-right text-sm" /></td>

//                       <td className="td-cell">
//                         <select name="taxId" value={it.taxId || ''} onChange={(e) => handleItemChange(idx, e)} className="input text-sm">
//                           <option value="">Tax</option>
//                           {taxes.map(t => <option key={t.id} value={t.id}>{t.code} ({t.rate}%)</option>)}
//                         </select>
//                         <div className="flex items-center gap-2 mt-1">
//                           <input id={`taxExempt-${idx}`} name="taxExempt" type="checkbox" checked={!!it.taxExempt} onChange={(e) => handleItemChange(idx, e)} />
//                           <label htmlFor={`taxExempt-${idx}`} className="text-xs">Tax Exempt</label>
//                         </div>
//                       </td>

//                       <td className="td-cell"><input type="number" name="taxPercent" value={it.taxPercent || ''} onChange={(e) => handleItemChange(idx, e)} className="input text-right text-sm" placeholder="optional" /></td>

//                       <td className="td-cell"><input type="number" name="lineDiscount" value={it.lineDiscount || 0} onChange={(e) => handleItemChange(idx, e)} className="input text-right text-sm" /></td>

//                       <td className="td-cell text-right font-medium">{amount.toFixed(2)}</td>

//                       <td className="td-cell">
//                         <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
//                           <Trash2 size={16} />
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           <button type="button" onClick={addItem} className="btn-secondary mt-4 flex items-center gap-2">
//             <Plus size={16} /> Add Item
//           </button>
//         </div>

//         {/* Attachments */}
//         <div className="p-4 border border-border rounded-lg">
//           <h2 className="text-lg font-semibold text-foreground mb-4">Attachments</h2>

//           <div className="space-y-2">
//             {(formData.attachments || []).length === 0 && <div className="text-sm text-foreground-muted">No attachments uploaded.</div>}
//             {(formData.attachments || []).map((a, idx) => (
//               <div key={idx} className="flex items-center justify-between gap-4 border p-2 rounded">
//                 <div>
//                   <div className="font-medium">{a.fileName}</div>
//                   <div className="text-xs text-foreground-muted">{a.uploadedAt ? new Date(a.uploadedAt).toLocaleString() : ''}</div>
//                   {a.filePath && <div className="text-xs"><a className="text-primary underline" href={a.filePath} target="_blank" rel="noreferrer">Open</a></div>}
//                 </div>
//                 <div>
//                   <button type="button" onClick={() => removeAttachment(idx)} className="p-2 text-red-500 rounded"><Trash2 /></button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <input ref={fileInputRef} type="file" className="hidden" onChange={onFileSelected} />
//           <div className="mt-4 flex items-center gap-4">
//             <button type="button" onClick={onAddAttachmentClick} className="btn-secondary flex items-center gap-2" disabled={uploading}>
//               <Plus size={16} /> Add Attachment
//             </button>
//             {uploading && <span className="text-sm">Uploading...</span>}
//           </div>
//         </div>

//         {/* Totals */}
//         <div className="flex justify-end">
//           <div className="w-full max-w-sm space-y-2 text-sm">
//             <div className="flex justify-between">
//               <span className="text-foreground-muted">Subtotal:</span>
//               <span className="font-medium text-foreground">{totals.subTotal.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-foreground-muted">Total Discount:</span>
//               <span className="font-medium text-foreground">{totals.totalDiscount.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-foreground-muted">Total Tax:</span>
//               <span className="font-medium text-foreground">{totals.totalTax.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between border-t border-border pt-2 mt-2">
//               <span className="text-lg font-bold text-foreground">Total Amount:</span>
//               <span className="text-lg font-bold text-foreground">{totals.totalAmount.toFixed(2)} {formData.currency}</span>
//             </div>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex justify-end gap-4 pt-6 border-t border-border">
//           <button type="button" onClick={() => navigate('/purchase-dashboard/purchase-orders')} className="btn-secondary" disabled={loading}>
//             Cancel
//           </button>
//           <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
//             {loading ? <Loader className="animate-spin h-4 w-4" /> : <Save size={16} />} {isEditing ? 'Update' : 'Save'} Purchase Order
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }


// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { useNavigate, useParams, Link } from 'react-router-dom';
// import axios from 'axios';
// import { Plus, Trash2, Save, Loader, ArrowLeft } from 'lucide-react';

// const API_URL = import.meta.env.VITE_API_BASE_URL || ''; // e.g. http://localhost:8080

// const InputField = ({ label, ...props }) => (
//   <div>
//     <label htmlFor={props.id || props.name} className="block text-sm font-medium text-foreground-muted">{label}</label>
//     <input {...props} className="input mt-1 bg-background-muted border-border" />
//   </div>
// );

// const SelectField = ({ label, children, ...props }) => (
//   <div>
//     <label htmlFor={props.id || props.name} className="block text-sm font-medium text-foreground-muted">{label}</label>
//     <select {...props} className="input mt-1 bg-background-muted border-border">{children}</select>
//   </div>
// );

// export default function PurchaseOrderForm() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const isEditing = Boolean(id);
//   const fileInputRef = useRef(null);

//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState('');

//   // masters + caches
//   const [suppliers, setSuppliers] = useState([]);
//   const [rawMaterials, setRawMaterials] = useState([]);
//   const [units, setUnits] = useState([]);
//   const [taxes, setTaxes] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [subCategoriesByCategory, setSubCategoriesByCategory] = useState({});

//   // form state
//   const [formData, setFormData] = useState({
//     orderCategory: 'Domestic',
//     supplierId: '',
//     poNumber: '',
//     reference: '',
//     date: new Date().toISOString().split('T')[0],
//     discountMode: 'Without Discount',
//     currency: 'AED',
//     remark: '',
//     status: 'Draft',
//     createdBy: '',
//     items: [],
//     attachments: []
//   });

//   // load master data and existing PO (if editing)
//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       setError('');
//       try {
//         const token = localStorage.getItem('token');
//         const headers = { Authorization: `Bearer ${token}` };

//         const [
//           rawMaterialsRes,
//           unitsRes,
//           taxesRes,
//           categoriesRes,
//           suppliersRes
//         ] = await Promise.all([
//           axios.get(`${API_URL}/production/raw-materials`, { headers, params: { page: 0, size: 500 } }),
//           axios.get(`${API_URL}/production/units`, { headers, params: { page: 0, size: 500 } }),
//           axios.get(`${API_URL}/production/taxes`, { headers, params: { page: 0, size: 500 } }),
//           axios.get(`${API_URL}/production/categories`, { headers, params: { page: 0, size: 500 } }),
//           axios.get(`${API_URL}/parties`, { headers, params: { type: 'SUPPLIER', page: 0, size: 500 } })
//         ]);

//         setRawMaterials(rawMaterialsRes.data.content ?? rawMaterialsRes.data ?? []);
//         setUnits(unitsRes.data.content ?? unitsRes.data ?? []);
//         setTaxes(taxesRes.data.content ?? taxesRes.data ?? []);
//         setCategories(categoriesRes.data.content ?? categoriesRes.data ?? []);
//         setSuppliers(suppliersRes.data.content ?? suppliersRes.data ?? []);

//         if (isEditing) {
//           const poRes = await axios.get(`${API_URL}/purchase/orders/${id}`, { headers });
//           const po = poRes.data;
//           setFormData(prev => ({
//             ...prev,
//             orderCategory: po.orderCategory ?? prev.orderCategory,
//             supplierId: po.supplierId ?? '',
//             poNumber: po.poNumber ?? '',
//             reference: po.reference ?? '',
//             date: po.date ? new Date(po.date).toISOString().split('T')[0] : prev.date,
//             discountMode: po.discountMode ?? prev.discountMode,
//             currency: po.currency ?? prev.currency,
//             remark: po.remark ?? '',
//             status: po.status ?? prev.status,
//             createdBy: po.createdBy ?? '',
//             items: (po.items ?? []).map(it => ({
//               id: it.id ?? undefined,
//               lineNumber: it.lineNumber ?? 1,
//               categoryId: it.categoryId ?? '',
//               subCategoryId: it.subCategoryId ?? '',
//               itemId: it.itemId ?? '',
//               description: it.description ?? '',
//               quantity: it.quantity ?? 0,
//               unitId: it.unitId ?? '',
//               rate: it.rate ?? 0,
//               taxId: it.taxId ?? '',
//               taxExempt: !!it.taxExempt,
//               taxPercent: it.taxPercent ?? '',
//               lineDiscount: it.lineDiscount ?? 0
//             })),
//             attachments: (po.attachments ?? []).map(a => ({
//               id: a.id ?? null,
//               fileName: a.fileName ?? '',
//               filePath: a.filePath ?? '',
//               uploadedBy: a.uploadedBy ?? '',
//               uploadedAt: a.uploadedAt ?? new Date().toISOString()
//             }))
//           }));

//           const catIds = Array.from(new Set((po.items ?? []).map(i => i.categoryId).filter(Boolean)));
//           await Promise.all(catIds.map(cid => fetchSubCategoriesForCategory(cid)));
//         }
//       } catch (err) {
//         console.error('Failed to load masters/po', err);
//         setError('Failed to load required data. Check backend/token.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id, isEditing]);

//   // fetch subcategories
//   const fetchSubCategoriesForCategory = async (categoryId) => {
//     if (!categoryId) return [];
//     if (subCategoriesByCategory[categoryId]) return subCategoriesByCategory[categoryId];
//     try {
//       const token = localStorage.getItem('token');
//       const headers = { Authorization: `Bearer ${token}` };
//       const res = await axios.get(`${API_URL}/production/sub-categories`, { headers, params: { categoryId } });
//       const arr = res.data.content ?? res.data ?? [];
//       setSubCategoriesByCategory(prev => ({ ...prev, [categoryId]: arr }));
//       return arr;
//     } catch (err) {
//       setSubCategoriesByCategory(prev => ({ ...prev, [categoryId]: [] }));
//       return [];
//     }
//   };

//   // header/item handlers
//   const handleHeaderChange = (e) => {
//     const { name, value, type } = e.target;
//     setFormData(prev => ({ ...prev, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value }));
//   };

//   const handleItemChange = (index, e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => {
//       const items = [...prev.items];
//       items[index] = { ...items[index], [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value) };
//       return { ...prev, items };
//     });
//   };

//   const addItem = () => {
//     setFormData(prev => ({
//       ...prev,
//       items: [...prev.items, {
//         lineNumber: prev.items.length + 1,
//         categoryId: '',
//         subCategoryId: '',
//         itemId: '',
//         description: '',
//         quantity: 1,
//         unitId: '',
//         rate: 0,
//         taxId: '',
//         taxExempt: false,
//         taxPercent: '',
//         lineDiscount: 0
//       }]
//     }));
//   };

//   const removeItem = (index) => {
//     setFormData(prev => {
//       const items = prev.items.filter((_, i) => i !== index).map((it, i) => ({ ...it, lineNumber: i + 1 }));
//       return { ...prev, items };
//     });
//   };

//   // Attachments: single Add button -> open file picker -> upload -> append attachment (no path inputs)
//   const onAddAttachmentClick = () => fileInputRef.current && fileInputRef.current.click();

//   // upload helper: tries primary URL then alternate if 404
//   const tryUpload = async (fd, headers) => {
//     const candidates = [
//       `${API_URL.replace(/\/$/, '')}/uploads`,
//       `${API_URL.replace(/\/$/, '')}/api/uploads`
//     ].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);

//     let lastErr;
//     for (const url of candidates) {
//       try {
//         const res = await axios.post(url, fd, { headers });
//         return res;
//       } catch (err) {
//         lastErr = err;
//         const status = err?.response?.status;
//         // if not 404, bail out (auth/server error)
//         if (status && status !== 404) break;
//         // otherwise continue to next candidate
//       }
//     }
//     throw lastErr;
//   };

//   const onFileSelected = async (e) => {
//     const files = e.target.files;
//     if (!files || files.length === 0) return;
//     const file = files[0];
//     setUploading(true);
//     setError('');
//     try {
//       const token = localStorage.getItem('token');
//       const fd = new FormData();
//       fd.append('file', file);

//       const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' };
//       const res = await tryUpload(fd, headers); // will try primary and alternate

//       const fileName = res?.data?.fileName ?? file.name;
//       const filePath = res?.data?.filePath ?? res?.data?.path ?? '';

//       const att = {
//         id: null,
//         fileName,
//         filePath,
//         uploadedBy: formData.createdBy || '',
//         uploadedAt: new Date().toISOString()
//       };

//       setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), att] }));
//     } catch (err) {
//       console.error('Upload failed', err);
//       setError(err?.response?.data?.message || 'Attachment upload failed.');
//     } finally {
//       setUploading(false);
//       if (fileInputRef.current) fileInputRef.current.value = '';
//     }
//   };

//   const removeAttachment = (idx) => setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }));

//   // totals (client-side preview)
//   const totals = useMemo(() => {
//     let subTotal = 0;
//     let totalDiscount = 0;
//     let totalTax = 0;

//     (formData.items || []).forEach(it => {
//       const qty = Number(it.quantity) || 0;
//       const rate = Number(it.rate) || 0;
//       const lineDiscount = Number(it.lineDiscount) || 0;
//       const amount = qty * rate;
//       const net = Math.max(0, amount - lineDiscount);

//       subTotal += amount;
//       totalDiscount += lineDiscount;

//       const taxMaster = taxes.find(t => String(t.id) === String(it.taxId));
//       const taxRate = Number(it.taxPercent ?? (taxMaster ? taxMaster.rate : 0)) || 0;
//       if (!it.taxExempt && taxRate > 0) totalTax += net * (taxRate / 100);
//     });

//     const otherCharges = 0;
//     const totalAmount = (subTotal - totalDiscount) + totalTax + otherCharges;
//     return { subTotal, totalDiscount, totalTax, otherCharges, totalAmount };
//   }, [formData.items, taxes]);

//   // submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     const payload = {
//       orderCategory: formData.orderCategory,
//       supplierId: formData.supplierId || null,
//       poNumber: formData.poNumber || null,
//       reference: formData.reference || null,
//       date: formData.date,
//       discountMode: formData.discountMode,
//       currency: formData.currency,
//       remark: formData.remark || null,
//       status: formData.status,
//       createdBy: formData.createdBy || null,
//       items: (formData.items || []).map(it => ({
//         lineNumber: it.lineNumber,
//         categoryId: it.categoryId || null,
//         subCategoryId: it.subCategoryId || null,
//         itemId: it.itemId || null,
//         description: it.description || null,
//         quantity: it.quantity || 0,
//         unitId: it.unitId || null,
//         rate: it.rate || 0,
//         taxId: it.taxId || null,
//         taxExempt: !!it.taxExempt,
//         taxPercent: it.taxPercent !== '' ? (Number(it.taxPercent) || 0) : null,
//         lineDiscount: Number(it.lineDiscount) || 0
//       })),
//       attachments: (formData.attachments || []).map(a => ({
//         fileName: a.fileName || null,
//         filePath: a.filePath || null,
//         uploadedBy: a.uploadedBy || formData.createdBy || null,
//         uploadedAt: a.uploadedAt || new Date().toISOString()
//       }))
//     };

//     try {
//       const token = localStorage.getItem('token');
//       const headers = { Authorization: `Bearer ${token}` };

//       if (isEditing) {
//         await axios.put(`${API_URL.replace(/\/$/, '')}/purchase/orders/${id}`, payload, { headers });
//       } else {
//         await axios.post(`${API_URL.replace(/\/$/, '')}/purchase/orders`, payload, { headers });
//       }

//       navigate('/purchase-dashboard/purchase-orders');
//     } catch (err) {
//       console.error('Failed to save PO', err);
//       setError(err?.response?.data?.message || 'Failed to save purchase order.');
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
//         <h1 className="text-2xl font-bold text-foreground">{isEditing ? `Edit Purchase Order #${formData.poNumber || ''}` : 'New Purchase Order'}</h1>
//         <Link to="/purchase-dashboard/purchase-orders" className="btn-secondary flex items-center gap-2">
//           <ArrowLeft size={16} /> Back to List
//         </Link>
//       </div>

//       {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

//       <form onSubmit={handleSubmit} className="space-y-8">
//         {/* Header */}
//         <div className="p-4 border border-border rounded-lg">
//           <h2 className="text-lg font-semibold text-foreground mb-4">Order Details</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             <SelectField label="Order Category" name="orderCategory" value={formData.orderCategory} onChange={handleHeaderChange}>
//               <option value="Domestic">Domestic</option>
//               <option value="Imported">Imported</option>
//             </SelectField>

//             <SelectField label="Supplier" name="supplierId" value={formData.supplierId || ''} onChange={handleHeaderChange} required>
//               <option value="">Select Supplier</option>
//               {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName || s.name || `${s.firstName || ''} ${s.lastName || ''}`}</option>)}
//             </SelectField>

//             <InputField label="PO Number" name="poNumber" value={formData.poNumber || ''} onChange={handleHeaderChange} placeholder="Auto or manual" />
//             <InputField label="Reference" name="reference" value={formData.reference || ''} onChange={handleHeaderChange} />

//             <InputField label="Date" name="date" type="date" value={formData.date || ''} onChange={handleHeaderChange} />
//             <SelectField label="Discount Mode" name="discountMode" value={formData.discountMode || ''} onChange={handleHeaderChange}>
//               <option value="Without Discount">Without Discount</option>
//               <option value="Item level">Item level</option>
//               <option value="Order level">Order level</option>
//             </SelectField>

//             <SelectField label="Currency" name="currency" value={formData.currency || 'AED'} onChange={handleHeaderChange}>
//               <option value="AED">AED</option>
//               <option value="USD">USD</option>
//               <option value="EUR">EUR</option>
//             </SelectField>

//             <SelectField label="Status" name="status" value={formData.status || 'Draft'} onChange={handleHeaderChange}>
//               <option value="Draft">Draft</option>
//               <option value="Confirmed">Confirmed</option>
//               <option value="Cancelled">Cancelled</option>
//             </SelectField>

//             <div className="lg:col-span-4">
//               <label className="block text-sm font-medium text-foreground-muted">Remarks</label>
//               <textarea name="remark" value={formData.remark || ''} onChange={handleHeaderChange} className="input mt-1 bg-background-muted border-border" rows={3} />
//             </div>

//             <InputField label="Created By" name="createdBy" value={formData.createdBy || ''} onChange={handleHeaderChange} />
//           </div>
//         </div>

//         {/* Items */}
//         <div className="p-4 border border-border rounded-lg">
//           <h2 className="text-lg font-semibold text-foreground mb-4">Items</h2>
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="bg-background-muted">
//                 <tr>
//                   <th className="th-cell">#</th>
//                   <th className="th-cell">Category / Item</th>
//                   <th className="th-cell">Qty</th>
//                   <th className="th-cell">Unit</th>
//                   <th className="th-cell">Rate</th>
//                   <th className="th-cell">Tax</th>
//                   <th className="th-cell">Tax % (ovr)</th>
//                   <th className="th-cell">Discount</th>
//                   <th className="th-cell text-right">Amount</th>
//                   <th className="th-cell" />
//                 </tr>
//               </thead>
//               <tbody>
//                 {(formData.items || []).map((it, idx) => {
//                   const qty = Number(it.quantity) || 0;
//                   const rate = Number(it.rate) || 0;
//                   const discount = Number(it.lineDiscount) || 0;
//                   const amount = Math.max(0, (qty * rate) - discount);
//                   return (
//                     <tr key={idx} className="border-b border-border">
//                       <td className="td-cell">{it.lineNumber}</td>
//                       <td className="td-cell">
//                         <div className="grid grid-cols-2 gap-2">
//                           <select
//                             name="categoryId"
//                             value={it.categoryId || ''}
//                             onChange={async (e) => {
//                               handleItemChange(idx, e);
//                               const newCat = e.target.value;
//                               await fetchSubCategoriesForCategory(newCat);
//                               setFormData(prev => {
//                                 const items = [...prev.items];
//                                 items[idx] = { ...items[idx], subCategoryId: '' };
//                                 return { ...prev, items };
//                               });
//                             }}
//                             className="input text-sm"
//                           >
//                             <option value="">Category</option>
//                             {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                           </select>

//                           <select name="subCategoryId" value={it.subCategoryId || ''} onChange={(e) => handleItemChange(idx, e)} className="input text-sm">
//                             <option value="">Subcategory</option>
//                             {(subCategoriesByCategory[it.categoryId] || []).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
//                           </select>

//                           <select name="itemId" value={it.itemId || ''} onChange={(e) => handleItemChange(idx, e)} className="input text-sm col-span-2">
//                             <option value="">Select Item</option>
//                             {rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
//                           </select>

//                           <input name="description" value={it.description || ''} onChange={(e) => handleItemChange(idx, e)} placeholder="Description (optional)" className="input text-sm col-span-2" />
//                         </div>
//                       </td>

//                       <td className="td-cell"><input type="number" name="quantity" value={it.quantity} onChange={(e) => handleItemChange(idx, e)} className="input text-right text-sm" /></td>

//                       <td className="td-cell">
//                         <select name="unitId" value={it.unitId || ''} onChange={(e) => handleItemChange(idx, e)} className="input text-sm">
//                           <option value="">Unit</option>
//                           {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
//                         </select>
//                       </td>

//                       <td className="td-cell"><input type="number" name="rate" value={it.rate} onChange={(e) => handleItemChange(idx, e)} className="input text-right text-sm" /></td>

//                       <td className="td-cell">
//                         <select name="taxId" value={it.taxId || ''} onChange={(e) => handleItemChange(idx, e)} className="input text-sm">
//                           <option value="">Tax</option>
//                           {taxes.map(t => <option key={t.id} value={t.id}>{t.code} ({t.rate}%)</option>)}
//                         </select>
//                         <div className="flex items-center gap-2 mt-1">
//                           <input id={`taxExempt-${idx}`} name="taxExempt" type="checkbox" checked={!!it.taxExempt} onChange={(e) => handleItemChange(idx, e)} />
//                           <label htmlFor={`taxExempt-${idx}`} className="text-xs">Tax Exempt</label>
//                         </div>
//                       </td>

//                       <td className="td-cell"><input type="number" name="taxPercent" value={it.taxPercent || ''} onChange={(e) => handleItemChange(idx, e)} className="input text-right text-sm" placeholder="optional" /></td>

//                       <td className="td-cell"><input type="number" name="lineDiscount" value={it.lineDiscount || 0} onChange={(e) => handleItemChange(idx, e)} className="input text-right text-sm" /></td>

//                       <td className="td-cell text-right font-medium">{amount.toFixed(2)}</td>

//                       <td className="td-cell">
//                         <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
//                           <Trash2 size={16} />
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           <button type="button" onClick={addItem} className="btn-secondary mt-4 flex items-center gap-2">
//             <Plus size={16} /> Add Item
//           </button>
//         </div>

//         {/* Attachments */}
//         <div className="p-4 border border-border rounded-lg">
//           <h2 className="text-lg font-semibold text-foreground mb-4">Attachments</h2>

//           <div className="space-y-2">
//             {(formData.attachments || []).length === 0 && <div className="text-sm text-foreground-muted">No attachments uploaded.</div>}
//             {(formData.attachments || []).map((a, idx) => (
//               <div key={idx} className="flex items-center justify-between gap-4 border p-2 rounded">
//                 <div>
//                   <div className="font-medium">{a.fileName}</div>
//                   <div className="text-xs text-foreground-muted">{a.uploadedAt ? new Date(a.uploadedAt).toLocaleString() : ''}</div>
//                   {a.filePath && <div className="text-xs"><a className="text-primary underline" href={a.filePath} target="_blank" rel="noreferrer">Open</a></div>}
//                 </div>
//                 <div>
//                   <button type="button" onClick={() => removeAttachment(idx)} className="p-2 text-red-500 rounded"><Trash2 /></button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <input ref={fileInputRef} type="file" className="hidden" onChange={onFileSelected} />
//           <div className="mt-4 flex items-center gap-4">
//             <button type="button" onClick={onAddAttachmentClick} className="btn-secondary flex items-center gap-2" disabled={uploading}>
//               <Plus size={16} /> Add Attachment
//             </button>
//             {uploading && <span className="text-sm">Uploading...</span>}
//           </div>
//         </div>

//         {/* Totals */}
//         <div className="flex justify-end">
//           <div className="w-full max-w-sm space-y-2 text-sm">
//             <div className="flex justify-between">
//               <span className="text-foreground-muted">Subtotal:</span>
//               <span className="font-medium text-foreground">{totals.subTotal.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-foreground-muted">Total Discount:</span>
//               <span className="font-medium text-foreground">{totals.totalDiscount.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-foreground-muted">Total Tax:</span>
//               <span className="font-medium text-foreground">{totals.totalTax.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between border-t border-border pt-2 mt-2">
//               <span className="text-lg font-bold text-foreground">Total Amount:</span>
//               <span className="text-lg font-bold text-foreground">{totals.totalAmount.toFixed(2)} {formData.currency}</span>
//             </div>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex justify-end gap-4 pt-6 border-t border-border">
//           <button type="button" onClick={() => navigate('/purchase-dashboard/purchase-orders')} className="btn-secondary" disabled={loading}>
//             Cancel
//           </button>
//           <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
//             {loading ? <Loader className="animate-spin h-4 w-4" /> : <Save size={16} />} {isEditing ? 'Update' : 'Save'} Purchase Order
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }



import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Save, Loader, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

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

const PurchaseOrderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // masters
  const [suppliers, setSuppliers] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [units, setUnits] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategoriesByCategory, setSubCategoriesByCategory] = useState({});

  const [form, setForm] = useState({
    orderCategory: 'Domestic',
    supplierId: '',
    poNumber: '',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    discountMode: 'Without Discount',
    currency: 'AED',
    remark: '',
    status: 'Draft',
    createdBy: '',
    items: [], // each: { lineNumber, categoryId, subCategoryId, itemId, description, quantity, unitId, rate, taxId, taxExempt, taxPercent, lineDiscount }
    attachments: [] // metadata-only: { id, fileName, filePath, uploadedBy, uploadedAt }
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [
          rawRes,
          unitRes,
          taxRes,
          catRes,
          supRes
        ] = await Promise.all([
          axios.get(`${API_URL}/production/raw-materials`, { headers, params: { page: 0, size: 500 } }),
          axios.get(`${API_URL}/production/units`, { headers, params: { page: 0, size: 500 } }),
          axios.get(`${API_URL}/production/taxes`, { headers, params: { page: 0, size: 500 } }),
          axios.get(`${API_URL}/production/categories`, { headers, params: { page: 0, size: 500 } }),
          axios.get(`${API_URL}/parties`, { headers, params: { type: 'SUPPLIER', page: 0, size: 500 } })
        ]);

        setRawMaterials(rawRes.data.content ?? rawRes.data ?? []);
        setUnits(unitRes.data.content ?? unitRes.data ?? []);
        setTaxes(taxRes.data.content ?? taxRes.data ?? []);
        setCategories(catRes.data.content ?? catRes.data ?? []);
        setSuppliers(supRes.data.content ?? supRes.data ?? []);

        if (isEditing) {
          const poRes = await axios.get(`${API_URL}/purchase/orders/${id}`, { headers });
          const po = poRes.data;
          setForm(prev => ({
            ...prev,
            orderCategory: po.orderCategory ?? prev.orderCategory,
            supplierId: po.supplierId ?? '',
            poNumber: po.poNumber ?? '',
            reference: po.reference ?? '',
            date: po.date ? new Date(po.date).toISOString().split('T')[0] : prev.date,
            discountMode: po.discountMode ?? prev.discountMode,
            currency: po.currency ?? prev.currency,
            remark: po.remark ?? '',
            status: po.status ?? prev.status,
            createdBy: po.createdBy ?? '',
            items: (po.items ?? []).map(it => ({
              id: it.id ?? null,
              lineNumber: it.lineNumber ?? 1,
              categoryId: it.categoryId ?? '',
              subCategoryId: it.subCategoryId ?? '',
              itemId: it.itemId ?? '',
              description: it.description ?? '',
              quantity: it.quantity ?? 0,
              unitId: it.unitId ?? '',
              rate: it.rate ?? 0,
              taxId: it.taxId ?? '',
              taxExempt: !!it.taxExempt,
              taxPercent: it.taxPercent ?? '',
              lineDiscount: it.lineDiscount ?? 0
            })),
            attachments: (po.attachments ?? []).map(a => ({
              id: a.id ?? null,
              fileName: a.fileName ?? '',
              filePath: a.filePath ?? '',
              uploadedBy: a.uploadedBy ?? '',
              uploadedAt: a.uploadedAt ?? new Date().toISOString()
            }))
          }));

          // prefetch subcategories for categories used
          const catIds = Array.from(new Set((po.items ?? []).map(it => it.categoryId).filter(Boolean)));
          await Promise.all(catIds.map(cid => fetchSubCategoriesForCategory(cid)));
        }
      } catch (err) {
        console.error('Failed to load masters/po', err);
        setError('Failed to load supporting data. Check backend/token.');
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing]);

  const fetchSubCategoriesForCategory = async (categoryId) => {
    if (!categoryId) return [];
    if (subCategoriesByCategory[categoryId]) return subCategoriesByCategory[categoryId];
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_URL}/production/sub-categories`, { headers, params: { categoryId } });
      const arr = res.data.content ?? res.data ?? [];
      setSubCategoriesByCategory(prev => ({ ...prev, [categoryId]: arr }));
      return arr;
    } catch (err) {
      setSubCategoriesByCategory(prev => ({ ...prev, [categoryId]: [] }));
      return [];
    }
  };

  // header handlers
  const handleHeaderChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value }));
  };

  // item handlers
  const handleItemChange = (idx, e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value) };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, {
        lineNumber: prev.items.length + 1,
        categoryId: '',
        subCategoryId: '',
        itemId: '',
        description: '',
        quantity: 1,
        unitId: '',
        rate: 0,
        taxId: '',
        taxExempt: false,
        taxPercent: '',
        lineDiscount: 0
      }]
    }));
  };

  const removeItem = (idx) => {
    setForm(prev => {
      const items = prev.items.filter((_, i) => i !== idx).map((it, i) => ({ ...it, lineNumber: i + 1 }));
      return { ...prev, items };
    });
  };

  // attachments (metadata-only) - single Add button
  const onAddAttachmentClick = () => fileInputRef.current && fileInputRef.current.click();

  const onFileSelected = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    // metadata-only (no server upload). filePath left empty.
    const att = {
      id: null,
      fileName: file.name,
      filePath: '', // no server upload here; metadata-only per requirement
      uploadedBy: form.createdBy || '',
      uploadedAt: new Date().toISOString()
    };
    setForm(prev => ({ ...prev, attachments: [...prev.attachments, att] }));

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (idx) => setForm(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }));

  // totals preview (client-side)
  const totals = useMemo(() => {
    let subTotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    (form.items || []).forEach(it => {
      const qty = Number(it.quantity) || 0;
      const rate = Number(it.rate) || 0;
      const lineDiscount = Number(it.lineDiscount) || 0;
      const amount = qty * rate;
      const net = Math.max(0, amount - lineDiscount);

      subTotal += amount;
      totalDiscount += lineDiscount;

      const taxMaster = taxes.find(t => String(t.id) === String(it.taxId));
      const taxRate = Number(it.taxPercent ?? (taxMaster ? taxMaster.rate : 0)) || 0;
      if (!it.taxExempt && taxRate > 0) totalTax += net * (taxRate / 100);
    });

    const otherCharges = 0; // your backend stores otherCharges on PO? adjust if needed
    const totalAmount = (subTotal - totalDiscount) + totalTax + otherCharges;
    return { subTotal, totalDiscount, totalTax, otherCharges, totalAmount };
  }, [form.items, taxes]);

  // submit
  const validate = () => {
    if (!form.date) return 'Date is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }

    setLoading(true);
    setError('');
    const payload = {
      orderCategory: form.orderCategory,
      supplierId: form.supplierId || null,
      poNumber: form.poNumber || null,
      reference: form.reference || null,
      date: form.date,
      discountMode: form.discountMode,
      currency: form.currency,
      remark: form.remark || null,
      status: form.status,
      createdBy: form.createdBy || null,
      items: (form.items || []).map(it => ({
        lineNumber: it.lineNumber,
        categoryId: it.categoryId || null,
        subCategoryId: it.subCategoryId || null,
        itemId: it.itemId || null,
        description: it.description || null,
        quantity: it.quantity || 0,
        unitId: it.unitId || null,
        rate: it.rate || 0,
        taxId: it.taxId || null,
        taxExempt: !!it.taxExempt,
        taxPercent: it.taxPercent !== '' ? (Number(it.taxPercent) || 0) : null,
        lineDiscount: Number(it.lineDiscount) || 0
      })),
      attachments: (form.attachments || []).map(a => ({
        id: a.id || null,
        fileName: a.fileName || null,
        filePath: a.filePath || null,
        uploadedBy: a.uploadedBy || form.createdBy || null,
        uploadedAt: a.uploadedAt || null
      }))
    };

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (isEditing) {
        await axios.put(`${API_URL.replace(/\/$/, '')}/purchase/orders/${id}`, payload, { headers });
      } else {
        await axios.post(`${API_URL.replace(/\/$/, '')}/purchase/orders`, payload, { headers });
      }

      navigate('/purchase-dashboard/purchase-orders');
    } catch (err) {
      console.error('Failed to save PO', err);
      setError(err?.response?.data?.message || 'Failed to save purchase order.');
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
        <h1 className="text-2xl font-bold text-foreground">{isEditing ? `Edit Purchase Order #${form.poNumber || ''}` : 'New Purchase Order'}</h1>
        <Link to="/purchase-dashboard/purchase-orders" className="btn-secondary flex items-center gap-2"><ArrowLeft size={16} /> Back to List</Link>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="p-4 border rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select label="Order Category" name="orderCategory" value={form.orderCategory} onChange={handleHeaderChange}>
              <option value="Domestic">Domestic</option>
              <option value="Imported">Imported</option>
            </Select>

            <Select label="Supplier" name="supplierId" value={form.supplierId || ''} onChange={handleHeaderChange}>
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName || s.name || `${s.firstName || ''} ${s.lastName || ''}`}</option>)}
            </Select>

            <Input label="PO Number" name="poNumber" value={form.poNumber || ''} onChange={handleHeaderChange} />
            <Input label="Reference" name="reference" value={form.reference || ''} onChange={handleHeaderChange} />

            <Input label="Date" name="date" type="date" value={form.date || ''} onChange={handleHeaderChange} />
            <Select label="Discount Mode" name="discountMode" value={form.discountMode || ''} onChange={handleHeaderChange}>
              <option value="Without Discount">Without Discount</option>
              <option value="Item level">Item level</option>
              <option value="Order level">Order level</option>
            </Select>

            <Select label="Currency" name="currency" value={form.currency || 'AED'} onChange={handleHeaderChange}>
              <option value="AED">AED</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </Select>

            <Select label="Status" name="status" value={form.status || 'Draft'} onChange={handleHeaderChange}>
              <option value="Draft">Draft</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </Select>

            <div className="lg:col-span-4">
              <label className="block text-sm font-medium text-foreground-muted">Remarks</label>
              <textarea name="remark" value={form.remark || ''} onChange={handleHeaderChange} className="input mt-1 bg-background-muted border-border" rows={3} />
            </div>

            <Input label="Created By" name="createdBy" value={form.createdBy || ''} onChange={handleHeaderChange} />
          </div>
        </div>

        {/* Items */}
        <div className="p-4 border rounded">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Items</h3>
            <button type="button" onClick={addItem} className="btn-secondary flex items-center gap-2"><Plus /> Add Item</button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-background-muted">
                <tr>
                  <th className="th-cell">#</th>
                  <th className="th-cell">Category / Item</th>
                  <th className="th-cell">Qty</th>
                  <th className="th-cell">Unit</th>
                  <th className="th-cell">Rate</th>
                  <th className="th-cell">Tax</th>
                  <th className="th-cell">Tax %</th>
                  <th className="th-cell">Discount</th>
                  <th className="th-cell text-right">Amount</th>
                  <th className="th-cell" />
                </tr>
              </thead>
              <tbody>
                {(form.items || []).map((it, idx) => {
                  const qty = Number(it.quantity) || 0;
                  const rate = Number(it.rate) || 0;
                  const discount = Number(it.lineDiscount) || 0;
                  const amount = Math.max(0, (qty * rate) - discount);
                  return (
                    <tr key={idx} className="border-b">
                      <td className="td-cell">{it.lineNumber}</td>
                      <td className="td-cell">
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            name="categoryId"
                            value={it.categoryId || ''}
                            onChange={async (e) => {
                              handleItemChange(idx, e);
                              const newCat = e.target.value;
                              await fetchSubCategoriesForCategory(newCat);
                              setForm(prev => {
                                const items = [...prev.items];
                                items[idx] = { ...items[idx], subCategoryId: '' };
                                return { ...prev, items };
                              });
                            }}
                            className="input text-sm"
                          >
                            <option value="">Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>

                          <select name="subCategoryId" value={it.subCategoryId || ''} onChange={(e) => handleItemChange(idx, e)} className="input text-sm">
                            <option value="">Subcategory</option>
                            {(subCategoriesByCategory[it.categoryId] || []).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                          </select>

                          <select name="itemId" value={it.itemId || ''} onChange={(e) => handleItemChange(idx, e)} className="input text-sm col-span-2">
                            <option value="">Select Item</option>
                            {rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>

                          <input name="description" value={it.description || ''} onChange={(e) => handleItemChange(idx, e)} placeholder="Description (optional)" className="input text-sm col-span-2" />
                        </div>
                      </td>

                      <td className="td-cell"><input type="number" name="quantity" value={it.quantity} onChange={(e) => handleItemChange(idx, e)} className="input text-right text-sm" /></td>

                      <td className="td-cell">
                        <select name="unitId" value={it.unitId || ''} onChange={(e) => handleItemChange(idx, e)} className="input text-sm">
                          <option value="">Unit</option>
                          {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                      </td>

                      <td className="td-cell"><input type="number" name="rate" value={it.rate} onChange={(e) => handleItemChange(idx, e)} className="input text-right text-sm" /></td>

                      <td className="td-cell">
                        <select name="taxId" value={it.taxId || ''} onChange={(e) => handleItemChange(idx, e)} className="input text-sm">
                          <option value="">Tax</option>
                          {taxes.map(t => <option key={t.id} value={t.id}>{t.code} ({t.rate}%)</option>)}
                        </select>
                        <div className="flex items-center gap-2 mt-1">
                          <input id={`taxExempt-${idx}`} name="taxExempt" type="checkbox" checked={!!it.taxExempt} onChange={(e) => handleItemChange(idx, e)} />
                          <label htmlFor={`taxExempt-${idx}`} className="text-xs">Tax Exempt</label>
                        </div>
                      </td>

                      <td className="td-cell"><input type="number" name="taxPercent" value={it.taxPercent || ''} onChange={(e) => handleItemChange(idx, e)} className="input text-right text-sm" placeholder="optional" /></td>

                      <td className="td-cell"><input type="number" name="lineDiscount" value={it.lineDiscount || 0} onChange={(e) => handleItemChange(idx, e)} className="input text-right text-sm" /></td>

                      <td className="td-cell text-right font-medium">{amount.toFixed(2)}</td>

                      <td className="td-cell"><button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-500 rounded"><Trash2 /></button></td>
                    </tr>
                  );
                })}
                {form.items.length === 0 && <tr><td colSpan="10" className="text-center py-6 text-foreground-muted">No items added</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attachments: metadata only, single Add button */}
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

        {/* Totals preview */}
        <div className="flex justify-end">
          <div className="w-full max-w-sm space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-foreground-muted">Subtotal:</span><span className="font-medium">{totals.subTotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-foreground-muted">Total Discount:</span><span className="font-medium">{totals.totalDiscount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-foreground-muted">Total Tax:</span><span className="font-medium">{totals.totalTax.toFixed(2)}</span></div>
            <div className="flex justify-between border-t border-border pt-2 mt-2"><span className="text-lg font-bold">Total Amount:</span><span className="text-lg font-bold">{totals.totalAmount.toFixed(2)} {form.currency}</span></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/purchase-dashboard/purchase-orders')} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Save size={16} />} {isEditing ? 'Update' : 'Save'} Purchase Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseOrderForm;
