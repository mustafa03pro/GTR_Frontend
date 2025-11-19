import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { Settings, Factory, List, MapPin, Layers, Package, SlidersHorizontal, LayoutGrid, Loader } from 'lucide-react';
import GeneralSettings from './GeneralSettings';
import WorkGroup from './WorkGroup';
import ManageProcess from './ManageProcess';
import SemiFinishedGood from './SemiFinishedGood';
import Bom from './Bom';
import ProParameter from './ProParameter';
import ProCategories from './ProCategories';
import ProRawMaterial from './ProRawMaterial';


const API_URL = import.meta.env.VITE_API_BASE_URL;

const productionNavLinks = [
    { name: 'General', icon: Settings, component: GeneralSettings, color: 'text-cyan-500' },
    { name: 'Workgroup', icon: Factory, component: WorkGroup, color: 'text-orange-500' },
    { name: 'Manage Process', icon: Layers, component: ManageProcess, color: 'text-green-500' },
    { name: 'Parameter', icon: SlidersHorizontal, component: ProParameter, color: 'text-indigo-500' },
    { name: 'Categories', icon: LayoutGrid, component: ProCategories, color: 'text-rose-500' },
    { name: 'Raw Materials', icon: Package, component: ProRawMaterial, color: 'text-amber-500' },
    { name: 'BOM', icon: List, component: Bom, color: 'text-purple-500' },
    { name: 'Semi Finished Good', icon: Package, component: SemiFinishedGood, color: 'text-yellow-600' },
];

const ProductionSettings = () => {
    const [activeTab, setActiveTab] = useState(productionNavLinks[0].name);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('all'); // Default to 'all' immediately
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLocations = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token'); // Assuming token is needed
                const res = await axios.get(`${API_URL}/locations`, { headers: { Authorization: `Bearer ${token}` } }); // Ensure this endpoint is correct
                setLocations(res.data);
            } catch (err) {
                console.error("Failed to fetch locations:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLocations();
    }, []);

    const renderContent = () => {
        const activeLink = productionNavLinks.find(link => link.name === activeTab);
        const Component = activeLink ? activeLink.component : GeneralSettings;
        // Pass the selectedLocation ID to the active component
        return <Component locationId={selectedLocation} />;
    };

    return (
        <div className="p-6 md:p-8 h-full flex flex-col">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Production Configuration</h1>
                    <p className="text-slate-500 mt-1">Manage company-wide settings for the Production module.</p>
                </div>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                    <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="input pl-10 pr-8 appearance-none w-full sm:w-56 bg-background-muted border-border text-foreground-muted hover:border-primary"
                        disabled={loading}
                    >
                        <option value="all">All Locations</option>
                        {loading 
                            ? <option>Loading...</option> 
                            : locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {productionNavLinks.map(link => (
                        <button
                            key={link.name}
                            onClick={() => setActiveTab(link.name)}
                            className={`whitespace-nowrap flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors group ${
                                activeTab === link.name ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-blue-600 hover:border-blue-300'
                            }`}
                        >
                            <link.icon className={`h-5 w-5 ${link.color} ${activeTab !== link.name && 'opacity-70 group-hover:opacity-100'}`} />
                            <span>{link.name}</span>
                        </button>
                    ))}
                </nav>
            </div>
            <div className="mt-6 flex-grow overflow-hidden">{renderContent()}</div>
        </div>
    );
}

export default ProductionSettings;
