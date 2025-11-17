import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Edit, Trash2, PlusCircle, Loader, Search, X, AlertCircle, ArrowLeft, Package } from 'lucide-react';
import SearchableSelect from './SearchableSelect'; // Assuming a multi-select component exists

const API_URL = import.meta.env.VITE_API_BASE_URL;
const getAuthHeaders = () => ({ "Authorization": `Bearer ${localStorage.getItem('token')}` });

// --- Form Component for Semi Finished Good ---
const SemiFinishedGoodForm = ({ item, onSave, onCancel, locationId }) => {
    const [formData, setFormData] = useState({
        name: '', itemCode: '', description: '', inventoryType: 'Semi Finished Good',
        product: true, service: false, purchase: false, sales: true, roll: false, scrapItem: false,
        categoryId: '', subCategoryId: '', issueUnitId: '', purchaseUnitId: '',
        purchaseToIssueRelation: 1, wastagePercent: 0, reorderLimit: 0,
        priceCategoryId: '', purchasePrice: 0, salesPrice: 0, taxInclusive: false, taxId: '', taxRate: 0,
        imagePath: '', bomItemIds: [], processIds: [], toolIds: [], toolStationIds: []
    });
    const [dependencies, setDependencies] = useState({
        categories: [], subCategories: [], units: [], priceCategories: [], taxes: [],
        rawMaterials: [], processes: [], tools: [], toolStations: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDependencies = async () => {
            setLoading(true);
            try {
                const [catRes, subCatRes, unitRes, priceCatRes, taxRes, rawMatRes, procRes, toolRes, toolStatRes] = await Promise.all([
                    axios.get(`${API_URL}/production/categories`, { headers: getAuthHeaders() }),
                    axios.get(`${API_URL}/production/subcategory`, { headers: getAuthHeaders() }),
                    axios.get(`${API_URL}/production/units`, { headers: getAuthHeaders() }),
                    axios.get(`${API_URL}/production/price-categories`, { headers: getAuthHeaders() }),
                    axios.get(`${API_URL}/production/taxes`, { headers: getAuthHeaders() }),
                    axios.get(`${API_URL}/products/raw-material`, { headers: getAuthHeaders() }), // Assuming endpoint
                    axios.get(`${API_URL}/production/processes`, { headers: getAuthHeaders() }),
                    axios.get(`${API_URL}/production/tools`, { headers: getAuthHeaders() }),
                    axios.get(`${API_URL}/production/work-stations`, { headers: getAuthHeaders() }),
                ]);
                setDependencies({
                    categories: catRes.data.content || catRes.data,
                    subCategories: subCatRes.data.content || subCatRes.data,
                    units: unitRes.data.content || unitRes.data,
                    priceCategories: priceCatRes.data.content || priceCatRes.data,
                    taxes: taxRes.data.content || taxRes.data,
                    rawMaterials: rawMatRes.data.content || rawMatRes.data,
                    processes: procRes.data.content || procRes.data,
                    tools: toolRes.data.content || toolRes.data,
                    toolStations: toolStatRes.data.content || toolStatRes.data,
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
            setFormData({
                name: item.name || '',
                itemCode: item.itemCode || '',
                description: item.description || '',
                inventoryType: item.inventoryType || 'Semi Finished Good',
                product: item.product ?? true,
                service: item.service ?? false,
                purchase: item.purchase ?? false,
                sales: item.sales ?? true,
                roll: item.roll ?? false,
                scrapItem: item.scrapItem ?? false,
                categoryId: item.categoryId || '',
                subCategoryId: item.subCategoryId || '',
                issueUnitId: item.issueUnitId || '',
                purchaseUnitId: item.purchaseUnitId || '',
                purchaseToIssueRelation: item.purchaseToIssueRelation || 1,
                wastagePercent: item.wastagePercent || 0,
                reorderLimit: item.reorderLimit || 0,
                priceCategoryId: item.priceCategoryId || '',
                purchasePrice: item.purchasePrice || 0,
                salesPrice: item.salesPrice || 0,
                taxInclusive: item.taxInclusive ?? false,
                taxId: item.taxId || '',
                taxRate: item.taxRate || 0,
                imagePath: item.imagePath || '',
                bomItemIds: item.bomItemIds || [],
                processIds: item.processIds || [],
                toolIds: item.toolIds || [],
                toolStationIds: item.toolStationIds || [],
            });
        }
    }, [item]);

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
        <div className="bg-card p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onCancel} className="p-2 rounded-full hover:bg-background-muted"><ArrowLeft size={20} /></button>
                <h1 className="text-2xl font-bold text-foreground">{item?.id ? 'Edit' : 'Add'} Semi Finished Good</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="label">Name</label><input name="name" value={formData.name} onChange={handleChange} className="input" required /></div>
                    <div><label className="label">Item Code</label><input name="itemCode" value={formData.itemCode} onChange={handleChange} className="input" /></div>
                    <div><label className="label">Description</label><input name="description" value={formData.description} onChange={handleChange} className="input" /></div>
                </div>

                {/* Units & Category */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div><label className="label">Category</label><select name="categoryId" value={formData.categoryId} onChange={handleChange} className="input"><option value="">Select Category</option>{dependencies.categories.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
                    <div><label className="label">Sub Category</label><select name="subCategoryId" value={formData.subCategoryId} onChange={handleChange} className="input"><option value="">Select Sub Category</option>{dependencies.subCategories.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
                    <div><label className="label">Issue Unit</label><select name="issueUnitId" value={formData.issueUnitId} onChange={handleChange} className="input"><option value="">Select Unit</option>{dependencies.units.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
                    <div><label className="label">Purchase Unit</label><select name="purchaseUnitId" value={formData.purchaseUnitId} onChange={handleChange} className="input"><option value="">Select Unit</option>{dependencies.units.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
                </div>

                {/* Pricing & Tax */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div><label className="label">Purchase Price</label><input name="purchasePrice" type="number" value={formData.purchasePrice} onChange={handleChange} className="input" /></div>
                    <div><label className="label">Sales Price</label><input name="salesPrice" type="number" value={formData.salesPrice} onChange={handleChange} className="input" /></div>
                    <div><label className="label">Price Category</label><select name="priceCategoryId" value={formData.priceCategoryId} onChange={handleChange} className="input"><option value="">Select Category</option>{dependencies.priceCategories.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
                    <div><label className="label">Tax</label><select name="taxId" value={formData.taxId} onChange={handleChange} className="input"><option value="">Select Tax</option>{dependencies.taxes.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
                </div>

                {/* Associations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">BOM Items (Raw Materials)</label>
                        <SearchableSelect options={toOptions(dependencies.rawMaterials)} selected={formData.bomItemIds} onSelect={(ids) => handleMultiSelect('bomItemIds', ids)} placeholder="Select BOM items..." />
                    </div>
                    <div>
                        <label className="label">Processes</label>
                        <SearchableSelect options={toOptions(dependencies.processes)} selected={formData.processIds} onSelect={(ids) => handleMultiSelect('processIds', ids)} placeholder="Select processes..." />
                    </div>
                    <div>
                        <label className="label">Tools</label>
                        <SearchableSelect options={toOptions(dependencies.tools)} selected={formData.toolIds} onSelect={(ids) => handleMultiSelect('toolIds', ids)} placeholder="Select tools..." />
                    </div>
                    <div>
                        <label className="label">Tool Stations</label>
                        <SearchableSelect options={toOptions(dependencies.toolStations, 'id', 'workstationName')} selected={formData.toolStationIds} onSelect={(ids) => handleMultiSelect('toolStationIds', ids)} placeholder="Select tool stations..." />
                    </div>
                </div>

                {/* Flags */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t">
                    <label className="flex items-center gap-2"><input type="checkbox" name="product" checked={formData.product} onChange={handleChange} /> Product</label>
                    <label className="flex items-center gap-2"><input type="checkbox" name="sales" checked={formData.sales} onChange={handleChange} /> Sales Item</label>
                    <label className="flex items-center gap-2"><input type="checkbox" name="purchase" checked={formData.purchase} onChange={handleChange} /> Purchase Item</label>
                    <label className="flex items-center gap-2"><input type="checkbox" name="service" checked={formData.service} onChange={handleChange} /> Service</label>
                    <label className="flex items-center gap-2"><input type="checkbox" name="roll" checked={formData.roll} onChange={handleChange} /> Is Roll</label>
                    <label className="flex items-center gap-2"><input type="checkbox" name="scrapItem" checked={formData.scrapItem} onChange={handleChange} /> Scrap Item</label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Save Item</button>
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
            const response = await axios.get(`${API_URL}/products/semi-finished`, { headers: getAuthHeaders(), params });
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
        const url = isUpdating ? `${API_URL}/products/semi-finished/${editingItem.id}` : `${API_URL}/products/semi-finished`;
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
                await axios.delete(`${API_URL}/products/semi-finished/${id}`, { headers: getAuthHeaders() });
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
        return <SemiFinishedGoodForm item={editingItem} onSave={handleSave} onCancel={handleCancelForm} locationId={locationId} />;
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