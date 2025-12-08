// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { PlusCircle, Edit, Trash2, Loader, AlertCircle, Search } from 'lucide-react';

// const API_URL = import.meta.env.VITE_API_BASE_URL;

// const PurchaseInvoicePage = () => {
//     const [invoices, setInvoices] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [searchTerm, setSearchTerm] = useState('');
//     const navigate = useNavigate();

//     const fetchInvoices = async () => {
//         setLoading(true);
//         setError('');
//         try {
//             const token = localStorage.getItem('token');
//             const response = await axios.get(`${API_URL}/purchases/invoices`, {
//                 headers: { "Authorization": `Bearer ${token}` },
//                 params: { page: 0, size: 100, sort: 'billDate,desc' }
//             });
//             setInvoices(response.data.content);
//         } catch (err) {
//             console.error("Failed to fetch purchase invoices:", err);
//             setError('Failed to fetch purchase invoices. Please try again later.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchInvoices();
//     }, []);

//     const handleDelete = async (id) => {
//         if (window.confirm('Are you sure you want to delete this purchase invoice?')) {
//             try {
//                 const token = localStorage.getItem('token');
//                 await axios.delete(`${API_URL}/purchases/invoices/${id}`, {
//                     headers: { "Authorization": `Bearer ${token}` }
//                 });
//                 fetchInvoices(); // Refresh the list
//             } catch (err) {
//                 console.error("Failed to delete purchase invoice:", err);
//                 setError('Failed to delete purchase invoice.');
//             }
//         }
//     };

//     const filteredInvoices = invoices.filter(inv =>
//         (inv.billNumber && inv.billNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
//         (inv.supplierName && inv.supplierName.toLowerCase().includes(searchTerm.toLowerCase()))
//     );

//     return (
//         <div className="p-6 md:p-8">
//             <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
//                 <h1 className="text-3xl font-bold text-foreground">Purchase Invoices (Bills)</h1>
//                 <div className="flex items-center gap-2">
//                     <div className="relative">
//                         <input
//                             type="text"
//                             placeholder="Search by Bill# or Supplier..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className="input w-full sm:w-64 pr-10 bg-background-muted border-border"
//                         />
//                         <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
//                     </div>
//                     <Link to="/purchase-dashboard/bills/new" className="btn-primary flex items-center gap-2">
//                         <PlusCircle size={18} /> New Bill
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
//                                     <th className="th-cell">Bill Date</th>
//                                     <th className="th-cell">Bill Number</th>
//                                     <th className="th-cell">Supplier</th>
//                                     <th className="th-cell">Due Date</th>
//                                     <th className="th-cell text-right">Net Total</th>
//                                     <th className="th-cell">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="text-foreground-muted">
//                                 {filteredInvoices.length > 0 ? (
//                                     filteredInvoices.map(inv => (
//                                         <tr key={inv.id} className="border-b border-border hover:bg-background-muted">
//                                             <td className="td-cell">{new Date(inv.billDate).toLocaleDateString()}</td>
//                                             <td className="td-cell font-medium text-foreground">{inv.billNumber}</td>
//                                             <td className="td-cell">{inv.supplierName}</td>
//                                             <td className="td-cell">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</td>
//                                             <td className="td-cell text-right font-mono">{inv.netTotal.toFixed(2)}</td>
//                                             <td className="td-cell">
//                                                 <div className="flex items-center gap-1">
//                                                     <button onClick={() => navigate(`/purchase-dashboard/bills/edit/${inv.id}`)} className="p-2 hover:text-primary hover:bg-background-muted rounded-full" title="Edit"><Edit className="h-4 w-4" /></button>
//                                                     <button onClick={() => handleDelete(inv.id)} className="p-2 hover:text-red-600 hover:bg-background-muted rounded-full" title="Delete"><Trash2 className="h-4 w-4" /></button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 ) : (
//                                     <tr><td colSpan="6" className="text-center py-10 text-foreground-muted"><AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" /><h3 className="mt-2 text-sm font-medium text-foreground">No invoices found</h3><p className="mt-1 text-sm">Get started by creating a new bill.</p></td></tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default PurchaseInvoicePage;



// PurchaseInvoicePage.jsx
// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { PlusCircle, Edit, Trash2, Loader, AlertCircle, Search } from 'lucide-react';

// const API_URL = import.meta.env.VITE_API_BASE_URL; // example: http://localhost:8080

// const PurchaseInvoicePage = () => {
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const navigate = useNavigate();

//   const fetchInvoices = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.get(`${API_URL}/purchases/invoices`, {
//         headers: { Authorization: `Bearer ${token}` },
//         params: { page: 0, size: 100, sort: 'billDate,desc' }
//       });
//       setInvoices(res.data.content || []);
//     } catch (err) {
//       console.error('Failed to fetch purchase invoices:', err);
//       setError('Failed to fetch purchase invoices. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchInvoices();
//   }, []);

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this purchase invoice?')) return;
//     try {
//       const token = localStorage.getItem('token');
//       await axios.delete(`${API_URL}/purchases/invoices/${id}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       // optimistic refresh
//       setInvoices(prev => prev.filter(i => i.id !== id));
//     } catch (err) {
//       console.error('Failed to delete purchase invoice:', err);
//       setError('Failed to delete purchase invoice.');
//     }
//   };

//   const filtered = invoices.filter(inv =>
//     (inv.billNumber && inv.billNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (inv.supplierName && inv.supplierName.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   return (
//     <div className="p-6 md:p-8">
//       <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
//         <h1 className="text-3xl font-bold text-foreground">Purchase Invoices (Bills)</h1>
//         <div className="flex items-center gap-2">
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search by Bill# or Supplier..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="input w-full sm:w-64 pr-10 bg-background-muted border-border"
//             />
//             <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
//           </div>
//           <Link to="/purchase-dashboard/bills/new" className="btn-primary flex items-center gap-2">
//             <PlusCircle size={18} /> New Bill
//           </Link>
//         </div>
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
//           <span className="block sm:inline">{error}</span>
//         </div>
//       )}

//       <div className="bg-card text-card-foreground rounded-xl shadow-sm overflow-hidden">
//         {loading ? (
//           <div className="flex justify-center items-center h-80"><Loader className="h-8 w-8 animate-spin text-primary" /></div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="bg-background-muted">
//                 <tr>
//                   <th className="th-cell">Bill Date</th>
//                   <th className="th-cell">Bill Number</th>
//                   <th className="th-cell">Supplier</th>
//                   <th className="th-cell">Due Date</th>
//                   <th className="th-cell text-right">Net Total</th>
//                   <th className="th-cell">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="text-foreground-muted">
//                 {filtered.length > 0 ? filtered.map(inv => (
//                   <tr key={inv.id} className="border-b border-border hover:bg-background-muted">
//                     <td className="td-cell">{inv.billDate ? new Date(inv.billDate).toLocaleDateString() : ''}</td>
//                     <td className="td-cell font-medium text-foreground">{inv.billNumber}</td>
//                     <td className="td-cell">{inv.supplierName}</td>
//                     <td className="td-cell">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</td>
//                     <td className="td-cell text-right font-mono">{(inv.netTotal ?? 0).toFixed(2)}</td>
//                     <td className="td-cell">
//                       <div className="flex items-center gap-1">
//                         <button onClick={() => navigate(`/purchase-dashboard/bills/edit/${inv.id}`)} className="p-2 hover:text-primary hover:bg-background-muted rounded-full" title="Edit">
//                           <Edit className="h-4 w-4" />
//                         </button>
//                         <button onClick={() => handleDelete(inv.id)} className="p-2 hover:text-red-600 hover:bg-background-muted rounded-full" title="Delete">
//                           <Trash2 className="h-4 w-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 )) : (
//                   <tr>
//                     <td colSpan="6" className="text-center py-10 text-foreground-muted">
//                       <AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" />
//                       <h3 className="mt-2 text-sm font-medium text-foreground">No invoices found</h3>
//                       <p className="mt-1 text-sm">Get started by creating a new bill.</p>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PurchaseInvoicePage;



// PurchaseInvoicePage.jsx (updated)
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, Edit, Trash2, Loader, AlertCircle, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL; // example: http://localhost:8080

const PurchaseInvoicePage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/purchases/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 0, size: 100, sort: 'billDate,desc' }
      });
      setInvoices(res.data.content || []);
    } catch (err) {
      console.error('Failed to fetch purchase invoices:', err);
      setError('Failed to fetch purchase invoices. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this purchase invoice?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/purchases/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoices(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('Failed to delete purchase invoice:', err);
      setError('Failed to delete purchase invoice.');
    }
  };

  const filtered = invoices.filter(inv =>
    (inv.billNumber && inv.billNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (inv.supplierName && inv.supplierName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-foreground">Purchase Invoices (Bills)</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Bill# or Supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full sm:w-64 pr-10 bg-background-muted border-border"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
          </div>
          <Link to="/purchase-dashboard/bills/new" className="btn-primary flex items-center gap-2">
            <PlusCircle size={18} /> New Bill
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-card text-card-foreground rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-80"><Loader className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-background-muted">
                <tr>
                  <th className="th-cell">Bill Date</th>
                  <th className="th-cell">Bill Number</th>
                  <th className="th-cell">Supplier</th>
                  <th className="th-cell">Due Date</th>
                  <th className="th-cell text-right">Net Total</th>
                  <th className="th-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="text-foreground-muted">
                {filtered.length > 0 ? filtered.map(inv => (
                  <tr key={inv.id} className="border-b border-border hover:bg-background-muted">
                    <td className="td-cell">{inv.billDate ? new Date(inv.billDate).toLocaleDateString() : ''}</td>

                    {/* <-- Make the bill number clickable: navigates to the receipt view --> */}
                    <td className="td-cell font-medium text-foreground">
                      <button
                        type="button"
                        onClick={() => navigate(`/purchase-dashboard/bills/view/${inv.id}`)}
                        className="text-left hover:underline text-primary font-semibold"
                        title={`View bill ${inv.billNumber}`}
                      >
                        {inv.billNumber}
                      </button>
                    </td>

                    <td className="td-cell">{inv.supplierName}</td>
                    <td className="td-cell">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="td-cell text-right font-mono">{(inv.netTotal ?? 0).toFixed(2)}</td>
                    <td className="td-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/purchase-dashboard/bills/edit/${inv.id}`)} className="p-2 hover:text-primary hover:bg-background-muted rounded-full" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(inv.id)} className="p-2 hover:text-red-600 hover:bg-background-muted rounded-full" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-foreground-muted">
                      <AlertCircle className="mx-auto h-12 w-12 text-foreground-muted/50" />
                      <h3 className="mt-2 text-sm font-medium text-foreground">No invoices found</h3>
                      <p className="mt-1 text-sm">Get started by creating a new bill.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseInvoicePage;
