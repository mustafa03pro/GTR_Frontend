// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import axios from 'axios';
// import { Edit, Trash2, PlusCircle, Loader, Search, X, AlertCircle, ArrowLeft, Eye, Lock, Unlock, Copy, GripVertical } from 'lucide-react';
// import SearchableSelect from './SearchableSelect'; // Assuming a multi-select component exists

// const API_URL = import.meta.env.VITE_API_BASE_URL;
// const getAuthHeaders = () => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` });

// const initialBomItem = {
//     lineNumber: 1,
//     processId: '',
//     categoryId: '',
//     subCategoryId: '',
//     materials: [{ rawMaterialId: '', unitId: '', quantity: 1, notes: '' }]
// };

// // --- Form Component ---
// const BomForm = ({ item, onSave, onCancel }) => {
//     const [formData, setFormData] = useState({
//         productId: '',
//         bomName: '',
//         locked: false,
//         copyFromBomId: '',
//         items: [JSON.parse(JSON.stringify(initialBomItem))]
//     });
//     const [dependencies, setDependencies] = useState({
//         products: [], boms: [], processes: [], categories: [], subCategories: [], rawMaterials: [], units: []
//     });
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchDependencies = async () => {
//             setLoading(true);
//             try {
//                 const [prodRes, bomRes, procRes, catRes, rawMatRes, unitRes] = await Promise.all([
//                     axios.get(`${API_URL}/production/semi-finished`, { headers: getAuthHeaders() }),
//                     axios.get(`${API_URL}/production/boms`, { headers: getAuthHeaders() }),
//                     axios.get(`${API_URL}/production/processes`, { headers: getAuthHeaders() }),
//                     axios.get(`${API_URL}/production/categories`, { headers: getAuthHeaders() }),
//                     axios.get(`${API_URL}/production/raw-materials`, { headers: getAuthHeaders() }),
//                     axios.get(`${API_URL}/production/units`, { headers: getAuthHeaders() }),
//                 ]);
//                 setDependencies(prev => ({
//                     ...prev,
//                     products: prodRes.data.content || [],
//                     boms: bomRes.data.content || [],
//                     processes: procRes.data.content || [],
//                     categories: catRes.data || [],
//                     rawMaterials: rawMatRes.data.content || [],
//                     units: unitRes.data || [],
//                 }));
//             } catch (err) {
//                 console.error("Failed to fetch BOM form dependencies", err);
//                 alert("Failed to load required data for the form.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchDependencies();
//     }, []);

//     useEffect(() => {
//         if (item) {
//             setFormData({
//                 productId: item.productId || '',
//                 bomName: item.bomName || '',
//                 locked: item.locked || false,
//                 copyFromBomId: item.copyFromBomId || '',
//                 items: item.items?.length > 0 ? item.items : [JSON.parse(JSON.stringify(initialBomItem))]
//             });
//         }
//     }, [item]);

//     const fetchSubCategories = useCallback(async (categoryId, itemIndex) => {
//         if (!categoryId) return;
//         try {
//             const res = await axios.get(`${API_URL}/production/subcategories?categoryId=${categoryId}`, { headers: getAuthHeaders() });
//             setDependencies(prev => {
//                 const newSubCategories = { ...prev.subCategories, [itemIndex]: res.data || [] };
//                 return { ...prev, subCategories: newSubCategories };
//             });
//         } catch (err) {
//             console.error("Failed to fetch sub-categories", err);
//         }
//     }, []);

//     const handleItemChange = (index, field, value) => {
//         const newItems = [...formData.items];
//         newItems[index][field] = value;
//         if (field === 'categoryId') {
//             newItems[index].subCategoryId = ''; // Reset sub-category on category change
//             fetchSubCategories(value, index);
//         }
//         setFormData(prev => ({ ...prev, items: newItems }));
//     };

//     const handleMaterialChange = (itemIndex, matIndex, field, value) => {
//         const newItems = [...formData.items];
//         newItems[itemIndex].materials[matIndex][field] = value;
//         setFormData(prev => ({ ...prev, items: newItems }));
//     };

//     const addItem = () => {
//         const newItem = JSON.parse(JSON.stringify(initialBomItem));
//         newItem.lineNumber = formData.items.length + 1;
//         setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
//     };

//     const removeItem = (index) => {
//         const newItems = formData.items.filter((_, i) => i !== index).map((it, idx) => ({ ...it, lineNumber: idx + 1 }));
//         setFormData(prev => ({ ...prev, items: newItems }));
//     };

//     const addMaterial = (itemIndex) => {
//         const newItems = [...formData.items];
//         newItems[itemIndex].materials.push({ rawMaterialId: '', unitId: '', quantity: 1, notes: '' });
//         setFormData(prev => ({ ...prev, items: newItems }));
//     };

//     const removeMaterial = (itemIndex, matIndex) => {
//         const newItems = [...formData.items];
//         newItems[itemIndex].materials = newItems[itemIndex].materials.filter((_, i) => i !== matIndex);
//         setFormData(prev => ({ ...prev, items: newItems }));
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         onSave(formData);
//     };

//     if (loading) return <div className="flex justify-center p-8"><Loader className="animate-spin" /></div>;

//     return (
//         <div className="bg-card p-6 rounded-xl shadow-sm">
//             <div className="flex items-center gap-4 mb-6">
//                 <button onClick={onCancel} className="p-2 rounded-full hover:bg-background-muted"><ArrowLeft size={20} /></button>
//                 <h1 className="text-2xl font-bold text-foreground">{item?.id ? 'Edit' : 'Create'} Bill of Material</h1>
//             </div>
//             <form onSubmit={handleSubmit} className="space-y-6">
//                 {/* Header */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg">
//                     <div><label className="label">Product (SFG)</label><select name="productId" value={formData.productId} onChange={e => setFormData(prev => ({ ...prev, productId: e.target.value }))} className="input" required><option value="">Select Product</option>{dependencies.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
//                     <div><label className="label">BOM Name</label><input name="bomName" value={formData.bomName} onChange={e => setFormData(prev => ({ ...prev, bomName: e.target.value }))} className="input" required /></div>
//                     <div><label className="label">Copy From (Optional)</label><select name="copyFromBomId" value={formData.copyFromBomId} onChange={e => setFormData(prev => ({ ...prev, copyFromBomId: e.target.value }))} className="input"><option value="">Select BOM to copy</option>{dependencies.boms.map(b => <option key={b.id} value={b.id}>{b.bomName}</option>)}</select></div>
//                     <div><label className="label">Status</label><label className="flex items-center gap-2 mt-2"><input type="checkbox" name="locked" checked={formData.locked} onChange={e => setFormData(prev => ({ ...prev, locked: e.target.checked }))} /> Locked</label></div>
//                 </div>

//                 {/* Items */}
//                 <div className="space-y-4">
//                     <h3 className="text-lg font-semibold">BOM Items</h3>
//                     {formData.items.map((bomItem, itemIndex) => (
//                         <div key={itemIndex} className="p-4 border rounded-lg bg-background-muted space-y-4">
//                             <div className="flex justify-between items-start">
//                                 <div className="flex items-center gap-4">
//                                     <GripVertical className="h-5 w-5 text-foreground-muted cursor-grab" />
//                                     <span className="font-bold text-lg">{bomItem.lineNumber}</span>
//                                 </div>
//                                 <button type="button" onClick={() => removeItem(itemIndex)} className="text-red-500 hover:text-red-600 p-1"><Trash2 size={16} /></button>
//                             </div>

//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                 <div><label className="label">Process</label><select value={bomItem.processId} onChange={e => handleItemChange(itemIndex, 'processId', e.target.value)} className="input"><option value="">Select Process</option>{dependencies.processes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
//                                 <div><label className="label">Category</label><select value={bomItem.categoryId} onChange={e => handleItemChange(itemIndex, 'categoryId', e.target.value)} className="input"><option value="">Select Category</option>{dependencies.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
//                                 <div><label className="label">Sub Category</label><select value={bomItem.subCategoryId} onChange={e => handleItemChange(itemIndex, 'subCategoryId', e.target.value)} className="input" disabled={!bomItem.categoryId}><option value="">Select Sub Category</option>{(dependencies.subCategories[itemIndex] || []).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}</select></div>
//                             </div>

//                             {/* Materials */}
//                             <div className="space-y-2 pt-2 border-t">
//                                 <h4 className="font-semibold text-sm">Materials</h4>
//                                 {bomItem.materials.map((material, matIndex) => (
//                                     <div key={matIndex} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
//                                         <div className="md:col-span-2"><label className="label text-xs">Raw Material</label><select value={material.rawMaterialId} onChange={e => handleMaterialChange(itemIndex, matIndex, 'rawMaterialId', e.target.value)} className="input" required><option value="">Select Material</option>{dependencies.rawMaterials.map(rm => <option key={rm.id} value={rm.id}>{rm.name}</option>)}</select></div>
//                                         <div><label className="label text-xs">Quantity</label><input type="number" step="0.000001" value={material.quantity} onChange={e => handleMaterialChange(itemIndex, matIndex, 'quantity', e.target.value)} className="input" required /></div>
//                                         <div><label className="label text-xs">Unit</label><select value={material.unitId} onChange={e => handleMaterialChange(itemIndex, matIndex, 'unitId', e.target.value)} className="input"><option value="">Select Unit</option>{dependencies.units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
//                                         <div className="flex items-center gap-1">
//                                             <input value={material.notes} onChange={e => handleMaterialChange(itemIndex, matIndex, 'notes', e.target.value)} placeholder="Notes" className="input" />
//                                             <button type="button" onClick={() => removeMaterial(itemIndex, matIndex)} className="text-red-500 hover:text-red-600 p-1"><X size={16} /></button>
//                                         </div>
//                                     </div>
//                                 ))}
//                                 <button type="button" onClick={() => addMaterial(itemIndex)} className="btn-secondary btn-sm mt-2">Add Material</button>
//                             </div>
//                         </div>
//                     ))}
//                     <button type="button" onClick={addItem} className="btn-secondary w-full">Add BOM Item</button>
//                 </div>

//                 <div className="flex justify-end gap-2 pt-4">
//                     <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
//                     <button type="submit" className="btn-primary">Save BOM</button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// // --- Main List Component ---
// const Bom = ({ locationId }) => {
//     const [data, setData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [view, setView] = useState('list'); // 'list' or 'form'
//     const [editingItem, setEditingItem] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [currentPage, setCurrentPage] = useState(0);
//     const [pageSize, setPageSize] = useState(10);
//     const [totalPages, setTotalPages] = useState(0);

//     const fetchData = useCallback(async () => {
//         setLoading(true);
//         setError('');
//         try {
//             const params = { page: currentPage, size: pageSize, sort: 'createdAt,desc' };
//             const response = await axios.get(`${API_URL}/production/boms`, { headers: getAuthHeaders(), params });
//             setData(response.data.content || []);
//             setTotalPages(response.data.totalPages || 0);
//         } catch (err) {
//             setError('Failed to fetch BOMs.');
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     }, [currentPage, pageSize]);

//     useEffect(() => {
//         fetchData();
//     }, [fetchData]);

//     const handleAdd = () => { setEditingItem(null); setView('form'); };
//     const handleEdit = (item) => { setEditingItem(item); setView('form'); };
//     const handleCancelForm = () => { setView('list'); setEditingItem(null); };

//     const handleSave = async (itemData) => {
//         const isUpdating = Boolean(editingItem?.id);
//         const url = isUpdating ? `${API_URL}/production/boms/${editingItem.id}` : `${API_URL}/production/boms`;
//         const method = isUpdating ? 'put' : 'post';

//         try {
//             await axiosmethod });
//             await fetchData();
//             handleCancelForm();
//         } catch (err) {
//             alert(`Error: ${err.response?.data?.message || 'Failed to save BOM.'}`);
//         }
//     };

//     const handleDelete = async (id) => {
//         if (window.confirm('Are you sure you want to delete this BOM?')) {
//             try {
//                 await axios.delete(`${API_URL}/production/boms/${id}`, { headers: getAuthHeaders() });
//                 await fetchData();
//             } catch (err) {
//                 alert(`Error: ${err.response?.data?.message || 'Failed to delete BOM.'}`);
//             }
//         }
//     };

//     const filteredData = useMemo(() => {
//         return data.filter(item =>
//             !searchTerm ||
//             item.bomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             (item.productName && item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
//         );
//     }, [data, searchTerm]);

//     if (view === 'form') {
//         return <BomForm item={editingItem} onSave={handleSave} onCancel={handleCancelForm} />;
//     }

//     return (
//         <div className="p-6 bg-card rounded-xl shadow-sm">
//             <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-semibold text-foreground">Manage Bill of Materials</h3>
//                 <div className="flex items-center gap-2">
//                     <div className="relative">
//                         <input type="text" placeholder="Search by BOM or Product name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input w-full sm:w-64 pr-10 bg-background-muted border-border" />
//                         <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
//                     </div>
//                     <button onClick={handleAdd} className="flex items-center gap-2 btn-secondary"><PlusCircle size={16} /> Add BOM</button>
//                 </div>
//             </div>

//             {error && <p className="text-red-500 mb-4">{error}</p>}

//             <div className="overflow-x-auto border border-border rounded-lg">
//                 <table className="min-w-full divide-y divide-border">
//                     <thead className="bg-background-muted">
//                         <tr>
//                             <th className="th-cell">BOM Name</th>
//                             <th className="th-cell">Product</th>
//                             <th className="th-cell">Status</th>
//                             <th className="th-cell">Created At</th>
//                             <th className="th-cell">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody className="bg-card divide-y divide-border text-foreground-muted">
//                         {loading ? (
//                             <tr><td colSpan="5" className="text-center py-10"><Loader className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>
//                         ) : filteredData.length > 0 ? (
//                             filteredData.map((item) => (
//                                 <tr key={item.id} className="hover:bg-background-muted transition-colors">
//                                     <td className="td-cell font-medium text-foreground">{item.bomName}</td>
//                                     <td className="td-cell">{item.productName || 'N/A'}</td>
//                                     <td className="td-cell">
//                                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.locked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
//                                             {item.locked ? <Lock className="h-3 w-3 mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
//                                             {item.locked ? 'Locked' : 'Active'}
//                                         </span>
//                                     </td>
//                                     <td className="td-cell">{new Date(item.createdAt).toLocaleDateString()}</td>
//                                     <td className="td-cell">
//                                         <div className="flex items-center gap-2">
//                                             <button onClick={() => alert('View details not implemented yet.')} className="text-blue-500 hover:text-blue-600 p-1" title="View"><Eye size={16} /></button>
//                                             <button onClick={() => handleEdit(item)} className="text-primary hover:text-primary/80 p-1" title="Edit"><Edit size={16} /></button>
//                                             <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600 p-1" title="Delete"><Trash2 size={16} /></button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))
//                         ) : (
//                             <tr><td colSpan="5" className="text-center py-10"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No BOMs found</h3><p className="mt-1 text-sm">Get started by creating a new Bill of Material.</p></td></tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Pagination Controls */}
//             <div className="flex justify-between items-center mt-4 text-sm text-foreground-muted">
//                 <div>
//                     <span>Showing {filteredData.length} of {data.length} results</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                     <span>Page {totalPages > 0 ? currentPage + 1 : 0} of {totalPages}</span>
//                     <button onClick={() => setCurrentPage(p => Math.max(p - 1, 0))} disabled={currentPage === 0} className="btn-secondary btn-sm disabled:opacity-50">
//                         Previous
//                     </button>
//                     <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages - 1))} disabled={currentPage >= totalPages - 1} className="btn-secondary btn-sm disabled:opacity-50">
//                         Next
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Bom;



import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Edit,
  Trash2,
  PlusCircle,
  Loader,
  Search,
  X,
  AlertCircle,
  ArrowLeft,
  Eye,
  Lock,
  Unlock,
  GripVertical
} from 'lucide-react';
import SearchableSelect from './SearchableSelect'; // keep your existing component

const API_URL = import.meta.env.VITE_API_BASE_URL;
const getAuthHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// normalize API responses that sometimes return { content: [...] } or [...] directly
const extractList = (res) => {
  if (!res) return [];
  return res.data?.content ?? res.data ?? [];
};

const initialBomItem = {
  lineNumber: 1,
  processId: '',
  categoryId: '',
  subCategoryId: '',
  materials: [{ rawMaterialId: '', unitId: '', quantity: 1, notes: '' }]
};

// --- BOM Form Component ---
const BomForm = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    productId: '',
    bomName: '',
    locked: false,
    copyFromBomId: '',
    items: [JSON.parse(JSON.stringify(initialBomItem))]
  });

  const [dependencies, setDependencies] = useState({
    products: [],
    boms: [],
    processes: [],
    categories: [],
    subCategories: {}, // keyed by itemIndex: { [index]: [subcats] }
    rawMaterials: [],
    units: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDependencies = async () => {
      setLoading(true);
      try {
        const [prodRes, bomRes, procRes, catRes, rawMatRes, unitRes] = await Promise.all([
          axios.get(`${API_URL}/production/semi-finished`, { headers: getAuthHeaders() }),
          axios.get(`${API_URL}/production/boms`, { headers: getAuthHeaders() }),
          axios.get(`${API_URL}/production/processes`, { headers: getAuthHeaders() }),
          axios.get(`${API_URL}/production/categories`, { headers: getAuthHeaders() }),
          axios.get(`${API_URL}/production/raw-materials`, { headers: getAuthHeaders() }),
          axios.get(`${API_URL}/production/units`, { headers: getAuthHeaders() })
        ]);

        setDependencies(prev => ({
          ...prev,
          products: extractList(prodRes),
          boms: extractList(bomRes),
          processes: extractList(procRes),
          categories: extractList(catRes),
          rawMaterials: extractList(rawMatRes),
          units: extractList(unitRes)
        }));
      } catch (err) {
        console.error('Failed to fetch BOM form dependencies', err);
        alert('Failed to load required data for the form.');
      } finally {
        setLoading(false);
      }
    };

    fetchDependencies();
  }, []);

  useEffect(() => {
    if (!item) return;
    setFormData({
      productId: item.productId || '',
      bomName: item.bomName || '',
      locked: !!item.locked,
      copyFromBomId: item.copyFromBomId || '',
      items: item.items?.length > 0 ? item.items.map((it, idx) => ({ ...it, lineNumber: idx + 1 })) : [JSON.parse(JSON.stringify(initialBomItem))]
    });
  }, [item]);

  const fetchSubCategories = useCallback(async (categoryId, itemIndex) => {
    if (!categoryId && itemIndex !== 0) {
      // clear if no category
      setDependencies(prev => ({ ...prev, subCategories: { ...(prev.subCategories || {}), [itemIndex]: [] } }));
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/production/subcategories?categoryId=${categoryId}`, { headers: getAuthHeaders() });
      setDependencies(prev => ({
        ...prev,
        subCategories: { ...(prev.subCategories || {}), [itemIndex]: extractList(res) }
      }));
    } catch (err) {
      console.error('Failed to fetch sub-categories', err);
      setDependencies(prev => ({ ...prev, subCategories: { ...(prev.subCategories || {}), [itemIndex]: [] } }));
    }
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // when category changes, reset subCategory and fetch its list
    if (field === 'categoryId') {
      newItems[index].subCategoryId = '';
      fetchSubCategories(value, index);
    }
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleMaterialChange = (itemIndex, matIndex, field, value) => {
    const newItems = [...formData.items];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      materials: newItems[itemIndex].materials.map((m, i) => (i === matIndex ? { ...m, [field]: value } : m))
    };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    const newItem = JSON.parse(JSON.stringify(initialBomItem));
    newItem.lineNumber = formData.items.length + 1;
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index).map((it, idx) => ({ ...it, lineNumber: idx + 1 }));
    // also remove any subCategories mapping for that index (rebuild mapping)
    const newSubCats = {};
    const prevSub = dependencies.subCategories || {};
    let shift = 0;
    for (let i = 0; i <= Math.max(Object.keys(prevSub).length - 1, formData.items.length); i++) {
      if (i === index) { shift = 1; continue; }
      if (prevSub[i]) newSubCats[i - shift] = prevSub[i];
    }
    setDependencies(prev => ({ ...prev, subCategories: newSubCats }));
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addMaterial = (itemIndex) => {
    const newItems = [...formData.items];
    newItems[itemIndex].materials.push({ rawMaterialId: '', unitId: '', quantity: 1, notes: '' });
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const removeMaterial = (itemIndex, matIndex) => {
    const newItems = [...formData.items];
    newItems[itemIndex].materials = newItems[itemIndex].materials.filter((_, i) => i !== matIndex);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  // simple inline sub-category creation (prompt -> POST)
  const createSubCategory = async (itemIndex) => {
    const name = window.prompt('Enter new sub-category name');
    if (!name) return;
    const categoryId = formData.items[itemIndex]?.categoryId || '';
    if (!categoryId) return alert('Select a Category first.');
    try {
      const res = await axios.post(`${API_URL}/production/subcategories`, { name, categoryId }, { headers: getAuthHeaders() });
      // append new subcategory and select it
      const newSub = res.data;
      setDependencies(prev => {
        const existing = prev.subCategories?.[itemIndex] ?? [];
        return { ...prev, subCategories: { ...(prev.subCategories || {}), [itemIndex]: [...existing, newSub] } };
      });
      handleItemChange(itemIndex, 'subCategoryId', newSub.id);
    } catch (err) {
      console.error('Failed to create sub-category', err);
      alert('Failed to create sub-category');
    }
  };

  const validateBeforeSave = () => {
    if (!formData.productId) return 'Select a product (SFG).';
    if (!formData.bomName || formData.bomName.trim() === '') return 'Provide a BOM name.';
    for (const item of formData.items) {
      for (const mat of item.materials) {
        if (!mat.rawMaterialId) return 'Every material row must have a raw material selected.';
        if (!mat.quantity || Number(mat.quantity) <= 0) return 'Every material must have a quantity greater than 0.';
      }
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validateBeforeSave();
    if (error) return alert(error);
    onSave(formData);
  };

  if (loading) return <div className="flex justify-center p-8"><Loader className="animate-spin" /></div>;

  return (
    <div className="bg-card p-6 rounded-xl shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-background-muted"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-foreground">{item?.id ? 'Edit' : 'Create'} Bill of Material</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg">
          <div>
            <label className="label">Product (SFG)</label>
            <select
              name="productId"
              value={formData.productId}
              onChange={e => setFormData(prev => ({ ...prev, productId: e.target.value }))}
              className="input"
              required
            >
              <option value="">Select Product</option>
              {dependencies.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label">BOM Name</label>
            <input
              name="bomName"
              value={formData.bomName}
              onChange={e => setFormData(prev => ({ ...prev, bomName: e.target.value }))}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Copy From (Optional)</label>
            <select
              name="copyFromBomId"
              value={formData.copyFromBomId}
              onChange={e => setFormData(prev => ({ ...prev, copyFromBomId: e.target.value }))}
              className="input"
            >
              <option value="">Select BOM to copy</option>
              {dependencies.boms.map(b => <option key={b.id} value={b.id}>{b.bomName}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Status</label>
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                name="locked"
                checked={formData.locked}
                onChange={e => setFormData(prev => ({ ...prev, locked: e.target.checked }))}
              /> Locked
            </label>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">BOM Items</h3>

          {formData.items.map((bomItem, itemIndex) => (
            <div key={itemIndex} className="p-4 border rounded-lg bg-background-muted space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <GripVertical className="h-5 w-5 text-foreground-muted cursor-grab" />
                  <span className="font-bold text-lg">#{bomItem.lineNumber}</span>
                </div>
                <button type="button" onClick={() => removeItem(itemIndex)} className="text-red-500 hover:text-red-600 p-1">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Process</label>
                  <select
                    value={bomItem.processId}
                    onChange={e => handleItemChange(itemIndex, 'processId', e.target.value)}
                    className="input"
                  >
                    <option value="">Select Process</option>
                    {dependencies.processes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Category</label>
                  <select
                    value={bomItem.categoryId}
                    onChange={e => handleItemChange(itemIndex, 'categoryId', e.target.value)}
                    className="input"
                  >
                    <option value="">Select Category</option>
                    {dependencies.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Sub Category</label>
                  <div className="flex gap-2">
                    <select
                      value={bomItem.subCategoryId}
                      onChange={e => handleItemChange(itemIndex, 'subCategoryId', e.target.value)}
                      className="input flex-1"
                      disabled={!bomItem.categoryId}
                    >
                      <option value="">Select Sub Category</option>
                      {(dependencies.subCategories?.[itemIndex] || []).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                    </select>
                    <button type="button" onClick={() => createSubCategory(itemIndex)} className="btn-secondary">+ Add New</button>
                  </div>
                </div>
              </div>

              {/* Materials */}
              <div className="space-y-2 pt-2 border-t">
                <h4 className="font-semibold text-sm">Materials</h4>

                {bomItem.materials.map((material, matIndex) => (
                  <div key={matIndex} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                    <div className="md:col-span-2">
                      <label className="label text-xs">Raw Material</label>
                      <select
                        value={material.rawMaterialId}
                        onChange={e => handleMaterialChange(itemIndex, matIndex, 'rawMaterialId', e.target.value)}
                        className="input"
                        required
                      >
                        <option value="">Select Material</option>
                        {dependencies.rawMaterials.map(rm => <option key={rm.id} value={rm.id}>{rm.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="label text-xs">Quantity</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={material.quantity}
                        onChange={e => handleMaterialChange(itemIndex, matIndex, 'quantity', e.target.value)}
                        className="input"
                        required
                      />
                    </div>

                    <div>
                      <label className="label text-xs">Unit</label>
                      <select
                        value={material.unitId}
                        onChange={e => handleMaterialChange(itemIndex, matIndex, 'unitId', e.target.value)}
                        className="input"
                      >
                        <option value="">Select Unit</option>
                        {dependencies.units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center gap-1">
                      <input
                        value={material.notes}
                        onChange={e => handleMaterialChange(itemIndex, matIndex, 'notes', e.target.value)}
                        placeholder="Notes"
                        className="input"
                      />
                      <button type="button" onClick={() => removeMaterial(itemIndex, matIndex)} className="text-red-500 hover:text-red-600 p-1">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                <button type="button" onClick={() => addMaterial(itemIndex)} className="btn-secondary btn-sm mt-2">Add Material</button>
              </div>
            </div>
          ))}

          <button type="button" onClick={addItem} className="btn-secondary w-full">Add BOM Item</button>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">Save BOM</button>
        </div>
      </form>
    </div>
  );
};

// --- Main BOM List Component ---
const Bom = ({ locationId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: currentPage, size: pageSize, sort: 'createdAt,desc' };
      const response = await axios.get(`${API_URL}/production/boms`, { headers: getAuthHeaders(), params });
      setData(response.data?.content ?? response.data ?? []);
      setTotalPages(response.data?.totalPages ?? 0);
    } catch (err) {
      setError('Failed to fetch BOMs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => { setEditingItem(null); setView('form'); };
  const handleEdit = (item) => { setEditingItem(item); setView('form'); };
  const handleCancelForm = () => { setView('list'); setEditingItem(null); };

  // fixed save handler (previously had a syntax error)
  const handleSave = async (itemData) => {
    const isUpdating = Boolean(editingItem?.id);
    const url = isUpdating ? `${API_URL}/production/boms/${editingItem.id}` : `${API_URL}/production/boms`;
    const method = isUpdating ? 'put' : 'post';
    try {
      await axios[method](url, itemData, { headers: getAuthHeaders() });
      await fetchData();
      handleCancelForm();
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || 'Failed to save BOM.'}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this BOM?')) {
      try {
        await axios.delete(`${API_URL}/production/boms/${id}`, { headers: getAuthHeaders() });
        await fetchData();
      } catch (err) {
        alert(`Error: ${err.response?.data?.message || 'Failed to delete BOM.'}`);
      }
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(i =>
      !searchTerm ||
      (i.bomName && i.bomName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.productName && i.productName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [data, searchTerm]);

  if (view === 'form') {
    return <BomForm item={editingItem} onSave={handleSave} onCancel={handleCancelForm} />;
  }

  return (
    <div className="p-6 bg-card rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Manage Bill of Materials</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by BOM or Product name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input w-full sm:w-64 pr-10 bg-background-muted border-border"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
          </div>
          <button onClick={handleAdd} className="flex items-center gap-2 btn-secondary"><PlusCircle size={16} /> Add BOM</button>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background-muted">
            <tr>
              <th className="th-cell">BOM Name</th>
              <th className="th-cell">Product</th>
              <th className="th-cell">Status</th>
              <th className="th-cell">Created At</th>
              <th className="th-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border text-foreground-muted">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-10"><Loader className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>
            ) : filteredData.length > 0 ? (
              filteredData.map(b => (
                <tr key={b.id} className="hover:bg-background-muted transition-colors">
                  <td className="td-cell font-medium text-foreground">{b.bomName}</td>
                  <td className="td-cell">{b.productName || 'N/A'}</td>
                  <td className="td-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${b.locked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {b.locked ? <Lock className="h-3 w-3 mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
                      {b.locked ? 'Locked' : 'Active'}
                    </span>
                  </td>
                  <td className="td-cell">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="td-cell">
                    <div className="flex items-center gap-2">
                      <button onClick={() => alert('View details not implemented yet.')} className="text-blue-500 hover:text-blue-600 p-1" title="View"><Eye size={16} /></button>
                      <button onClick={() => handleEdit(b)} className="text-primary hover:text-primary/80 p-1" title="Edit"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:text-red-600 p-1" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-10">
                  <AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" />
                  <h3 className="mt-2 text-sm font-medium text-foreground">No BOMs found</h3>
                  <p className="mt-1 text-sm">Get started by creating a new Bill of Material.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4 text-sm text-foreground-muted">
        <div>
          <span>Showing {filteredData.length} of {data.length} results</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Page {totalPages > 0 ? currentPage + 1 : 0} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 0))} disabled={currentPage === 0} className="btn-secondary btn-sm disabled:opacity-50">
            Previous
          </button>
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages - 1))} disabled={currentPage >= totalPages - 1} className="btn-secondary btn-sm disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Bom;
