import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Edit, Trash2, PlusCircle, Loader, Search, X, AlertCircle, ArrowLeft, Package } from 'lucide-react';
import SearchableSelect from './SearchableSelect'; // Assuming a multi-select component exists

const API_URL = import.meta.env.VITE_API_BASE_URL;
const getAuthHeaders = () => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` });

const DEFAULT_STATE = {
  inventoryType: 'Semi Finished Good',
  name: '',
  itemCode: '',
  description: '',
  product: true,
  service: false,
  purchase: true,
  sales: true,
  roll: false,
  scrapItem: false,
  categoryId: '',
  subCategoryId: '',
  jobOrderType: 'Extrusion',
  issueUnitId: '',
  purchaseUnitId: '',
  purchaseToIssueRelation: 1,
  wastagePercent: 0,
  reorderLimit: 0,
  priceCategoryId: '',
  purchasePrice: 0,
  salesPrice: 0,
  taxInclusive: false,
  taxId: '',
  taxRate: 0,
  imagePath: '',
  bomItemIds: [],
  processIds: [],
  toolIds: [],
  toolStationIds: []
};

const JOB_ORDER_TYPES = ['Extrusion', 'Printing', 'Cutting'];

// --- Form Component for Semi Finished Good ---
const SemiFinishedGoodForm = ({ item, onSave, onCancel, locationId }) => {
    const [formData, setFormData] = useState(DEFAULT_STATE);
    const [dependencies, setDependencies] = useState({
        categories: [], subCategories: [], units: [], priceCategories: [], taxes: [],
        rawMaterials: [], processes: [], tools: [], toolStations: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDependencies = async () => {
            setLoading(true);
            try {
                const [
                  catRes, unitRes, priceCatRes, taxRes, rawMatRes, procRes, toolRes, toolStatRes
                ] = await Promise.all([
                    axios.get(`${API_URL}/production/categories`, { headers: getAuthHeaders() }),
                    axios.get(`${API_URL}/production/units`, { headers: getAuthHeaders() }),
                    axios.get(`${API_URL}/production/price-categories`, { headers: getAuthHeaders() }),
                    axios.get(`${API_URL}/production/taxes`, { headers: getAuthHeaders() }),
                    axios.get(`${API_URL}/production/raw-materials`, { headers: getAuthHeaders() }),
                    axios.get(`${API_URL}/production/processes`, { headers: getAuthHeaders() }),
                    axios.get(`${API_URL}/production/tools`, { headers: getAuthHeaders() }),
                    axios.get(`${API_URL}/production/work-stations`, { headers: getAuthHeaders() }),
                ]);
                setDependencies({
                    categories: catRes.data.content || catRes.data || [],
                    subCategories: [], // loaded when category selected
                    units: unitRes.data.content || unitRes.data || [],
                    priceCategories: priceCatRes.data.content || priceCatRes.data || [],
                    taxes: taxRes.data.content || taxRes.data || [],
                    rawMaterials: rawMatRes.data.content || rawMatRes.data || [],
                    processes: procRes.data.content || procRes.data || [],
                    tools: toolRes.data.content || toolRes.data || [],
                    toolStations: toolStatRes.data.content || toolStatRes.data || []
                });
            } catch (err) {
                console.error("Failed to fetch form dependencies", err);
                alert("Failed to load necessary data for the form.");
            } finally {
                setLoading(false);
            }
        };
        fetchDependencies();
    }, []);

    useEffect(() => {
        if (item) {
            setFormData(prev => ({
              ...prev,
              ...DEFAULT_STATE,
              ...item,
              purchase: item.purchase ?? true,
              sales: item.sales ?? true,
              inventoryType: item.inventoryType || DEFAULT_STATE.inventoryType,
              jobOrderType: item.jobOrderType || DEFAULT_STATE.jobOrderType
            }));
        }
    }, [item]);

    // Fetch sub-categories when categoryId changes
    useEffect(() => {
        if (!formData.categoryId) {
            setDependencies(prev => ({ ...prev, subCategories: [] }));
            return;
        }

        const fetchSubCategories = async () => {
            try {
                const res = await axios.get(`${API_URL}/production/subcategories?categoryId=${formData.categoryId}`, { headers: getAuthHeaders() });
                setDependencies(prev => ({ ...prev, subCategories: res.data.content || res.data || [] }));
            } catch (err) {
                console.error("Failed to fetch sub-categories", err);
                setDependencies(prev => ({ ...prev, subCategories: [] }));
            }
        };

        fetchSubCategories();
    }, [formData.categoryId]);

      // auto-generate item code from name if itemCode empty
    useEffect(() => {
        if (!formData.itemCode && formData.name) {
        const code = formData.name.trim().toUpperCase().replace(/\s+/g, '-').slice(0, 30);
        setFormData(prev => ({ ...prev, itemCode: code }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.name]);

    const handleChange = e => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
            return;
        }
        if (type === 'file') {
            // store just filename (or handle upload separately)
            setFormData(prev => ({ ...prev, imagePath: files[0] ? files[0].name : '' }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'categoryId') setFormData(prev => ({ ...prev, subCategoryId: '' }));
    };

    const handleCreateSubCategory = async () => {
        const title = window.prompt('Enter new sub-category name');
        if (!title) return;
        try {
            const res = await axios.post(`${API_URL}/production/subcategories`, { name: title, categoryId: formData.categoryId }, { headers: getAuthHeaders() });
            const newSub = res.data;
            setDependencies(prev => ({ ...prev, subCategories: [...prev.subCategories, newSub] }));
            setFormData(prev => ({ ...prev, subCategoryId: newSub.id }));
        } catch (err) {
            console.error('Failed to create sub-category', err);
            alert('Failed to create sub-category.');
        }
    };

    const handleMultiSelect = (name, selectedIds) => {
        setFormData(prev => ({ ...prev, [name]: selectedIds }));
    };

    const handleSubmit = e => {
        e.preventDefault();
        onSave({ ...formData });
    };

    if (loading) return <div className="flex justify-center p-8"><Loader className="animate-spin" /></div>;

    const toOptions = (items, valueKey = 'id', labelKey = 'name') => items.map(i => ({ value: i[valueKey], label: i[labelKey] }));

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm max-w-full">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100"><ArrowLeft size={18} /></button>
                <h1 className="text-xl font-semibold">{item?.id ? 'Edit' : 'Add New'} Semi Finished Good</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Top row: Inventory type, Job order type, Item for checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Inventory Type</label>
                        <select name="inventoryType" value={formData.inventoryType} onChange={handleChange} className="w-full input">
                            <option>Raw Material</option>
                            <option>Finished Good</option>
                            <option>Semi Finished Good</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Job Order Type</label>
                        <select name="jobOrderType" value={formData.jobOrderType || ''} onChange={handleChange} className="w-full input">
                            {JOB_ORDER_TYPES.map(j => <option key={j} value={j}>{j}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2"><input type="checkbox" name="purchase" checked={formData.purchase} onChange={handleChange} /> Purchase</label>
                            <label className="flex items-center gap-2"><input type="checkbox" name="sales" checked={formData.sales} onChange={handleChange} /> Sales</label>
                            <label className="flex items-center gap-2"><input type="checkbox" name="roll" checked={formData.roll} onChange={handleChange} /> Is Roll</label>
                            <label className="flex items-center gap-2"><input type="checkbox" name="scrapItem" checked={formData.scrapItem} onChange={handleChange} /> Scrap Item</label>
                        </div>
                    </div>
                </div>

                {/* Basic fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="label">Name</label>
                        <input name="name" value={formData.name} onChange={handleChange} className="input" required />
                    </div>
                    <div>
                        <label className="label">Item Code</label>
                        <input name="itemCode" value={formData.itemCode} onChange={handleChange} className="input" placeholder="Auto Generate..." />
                    </div>
                    <div>
                        <label className="label">Description</label>
                        <input name="description" value={formData.description} onChange={handleChange} className="input" />
                    </div>
                </div>

                {/* Category & Subcategory (searchable + create) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="label">Category</label>
                        <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="input">
                            <option value="">Select Category</option>
                            {dependencies.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="label">Sub Category</label>
                        <div className="flex gap-2">
                            <select name="subCategoryId" value={formData.subCategoryId} onChange={handleChange} className="input flex-1" disabled={!formData.categoryId}>
                                <option value="">{dependencies.subCategories.length ? 'Select Sub Category' : 'No sub-categories'}</option>
                                {dependencies.subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <button type="button" onClick={handleCreateSubCategory} className="btn-secondary">+ Add New</button>
                        </div>
                    </div>

                    <div>
                        <label className="label">Image</label>
                        <input type="file" name="image" onChange={handleChange} className="input" />
                    </div>

                    <div>
                        <label className="label">Price Category</label>
                        <select name="priceCategoryId" value={formData.priceCategoryId} onChange={handleChange} className="input">
                            <option value="">Select Category</option>
                            {dependencies.priceCategories.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Units + relation inline (matches screenshot) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="label">Issue Unit</label>
                        <select name="issueUnitId" value={formData.issueUnitId} onChange={handleChange} className="input">
                            <option value="">Select Unit</option>
                            {dependencies.units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label">Purchase Unit</label>
                        <select name="purchaseUnitId" value={formData.purchaseUnitId} onChange={handleChange} className="input">
                            <option value="">Select Unit</option>
                            {dependencies.units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label">Relation (1 Purchase Unit = )</label>
                        <input name="purchaseToIssueRelation" value={formData.purchaseToIssueRelation} onChange={handleChange} className="input" type="number" min="0.0001" step="0.0001" />
                    </div>
                    <div>
                        <label className="label">Wastage %</label>
                        <input name="wastagePercent" value={formData.wastagePercent} onChange={handleChange} className="input" type="number" step="0.01" />
                    </div>
                </div>

                {/* Pricing, reorder, tax */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="label">Purchase Price</label>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-l-md">AED</span>
                            <input name="purchasePrice" type="number" value={formData.purchasePrice} onChange={handleChange} className="input flex-1 rounded-l-none" />
                        </div>
                    </div>

                    <div>
                        <label className="label">Sales Price</label>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-l-md">AED</span>
                            <input name="salesPrice" type="number" value={formData.salesPrice} onChange={handleChange} className="input flex-1 rounded-l-none" />
                        </div>
                    </div>

                    <div>
                        <label className="label">Reorder Limit</label>
                        <input name="reorderLimit" value={formData.reorderLimit} onChange={handleChange} className="input" type="number" />
                    </div>

                    <div>
                        <label className="label">Tax</label>
                        <div className="flex gap-2">
                            <select name="taxId" value={formData.taxId} onChange={handleChange} className="input flex-1">
                                <option value="">Select Tax</option>
                                {dependencies.taxes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <input name="taxRate" value={formData.taxRate} onChange={handleChange} className="input w-24" type="number" placeholder="%" />
                        </div>
                    </div>
                </div>

                {/* associations - BOM, Processes, Tools, Workstations */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">BOM Items (Raw Materials)</label>
                        <SearchableSelect
                            options={toOptions(dependencies.rawMaterials)}
                            selected={formData.bomItemIds}
                            onSelect={(ids) => handleMultiSelect('bomItemIds', ids)}
                            creatable={false}
                            placeholder="Select BOM items..."
                        />
                    </div>
                    <div>
                        <label className="label">Processes</label>
                        <SearchableSelect
                            options={toOptions(dependencies.processes)}
                            selected={formData.processIds}
                            onSelect={(ids) => handleMultiSelect('processIds', ids)}
                            placeholder="Select processes..."
                        />
                    </div>
                    <div>
                        <label className="label">Tools</label>
                        <SearchableSelect
                            options={toOptions(dependencies.tools)}
                            selected={formData.toolIds}
                            onSelect={(ids) => handleMultiSelect('toolIds', ids)}
                            placeholder="Select tools..."
                        />
                    </div>
                    <div>
                        <label className="label">Tool Stations</label>
                        <SearchableSelect
                            options={toOptions(dependencies.toolStations, 'id', 'workstationName')}
                            selected={formData.toolStationIds}
                            onSelect={(ids) => handleMultiSelect('toolStationIds', ids)}
                            placeholder="Select tool stations..."
                        />
                    </div>
                </div> 

                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Save</button>
                </div>
            </form>
        </div>
    );
};

// --- Main List Component ---
const SemiFinishedGood = ({ locationId }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = { page: currentPage, size: pageSize, sort: 'updatedAt,desc' };
            const response = await axios.get(`${API_URL}/production/semi-finished`, { headers: getAuthHeaders(), params });
            setData(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
        } catch (err) {
            setError('Failed to fetch semi-finished goods.');
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

    const handleSave = async (itemData) => {
        const isUpdating = Boolean(editingItem?.id);
        const url = isUpdating ? `${API_URL}/production/semi-finished/${editingItem.id}` : `${API_URL}/production/semi-finished`;
        const method = isUpdating ? 'put' : 'post';

        try {
            await axios[method](url, itemData, { headers: getAuthHeaders() });
            await fetchData();
            handleCancelForm();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed to save item.'}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await axios.delete(`${API_URL}/production/semi-finished/${id}`, { headers: getAuthHeaders() });
                await fetchData(); // Refetch data to update the list
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete item.'}`);
            }
        }
    };

    const filteredData = useMemo(() => {
        // Client-side filtering for location and search term as API doesn't seem to support it directly
        let filtered = data;
        if (locationId && locationId !== 'all') {
            // Assuming tenantId is used for location filtering on the backend, but no locationId on response.
            // This is a placeholder for client-side filtering if needed.
            // filtered = data.filter(item => String(item.locationId) === String(locationId));
        }
        return filtered.filter(item =>
            !searchTerm ||
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.itemCode && item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [data, searchTerm, locationId]);

    if (view === 'form') {
        return <SemiFinishedGoodForm item={editingItem} onSave={handleSave} onCancel={handleCancelForm} />;
    }

    return (
        <div className="p-6 bg-card rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Manage Semi Finished Goods</h3>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input type="text" placeholder="Search by name or code..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input w-full sm:w-64 pr-10 bg-background-muted border-border" />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                    </div>
                    <button onClick={handleAdd} className="flex items-center gap-2 btn-secondary"><PlusCircle size={16} /> Add Item</button>
                </div>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-background-muted">
                        <tr>
                            <th className="th-cell">Item Code</th>
                            <th className="th-cell">Name</th>
                            <th className="th-cell">Category</th>
                            <th className="th-cell">Sales Price</th>
                            <th className="th-cell">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border text-foreground-muted">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-10"><Loader className="animate-spin h-8 w-8 text-primary mx-auto" /></td></tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-background-muted transition-colors">
                                    <td className="td-cell font-mono text-xs">{item.itemCode}</td>
                                    <td className="td-cell font-medium text-foreground">{item.name}</td>
                                    <td className="td-cell">{item.categoryName || 'N/A'}</td>
                                    <td className="td-cell text-right">{item.salesPrice?.toFixed(2) || '0.00'}</td>
                                    <td className="td-cell">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleEdit(item)} className="text-primary hover:text-primary/80 p-1" title="Edit"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600 p-1" title="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="text-center py-10"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No items found</h3><p className="mt-1 text-sm">Get started by adding a new semi-finished good.</p></td></tr>
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
}

export default SemiFinishedGood;