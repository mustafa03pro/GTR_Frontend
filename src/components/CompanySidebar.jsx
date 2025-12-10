import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Sparkles } from 'lucide-react';

const CompanySidebar = ({ moduleName, navItems }) => {
    const username = localStorage.getItem('username') || 'Admin';
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const NavItem = ({ item }) => {
        return (
            <NavLink
                to={item.path}
                // Let NavLink handle the active state with a function
                className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
                        isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground-muted hover:bg-background-muted'
                    }`
                }
            >
                {/* The icon color can also be determined by NavLink's active state */}
                {({ isActive }) => (<><item.icon className={`h-5 w-5 mr-3 flex-shrink-0 ${isActive ? 'text-primary-foreground' : 'text-foreground-muted group-hover:text-foreground'}`} /><span>{item.name}</span></>)}
            </NavLink>
        );
    };

    return (
        <div className="flex flex-col h-full bg-card text-card-foreground w-64 border-r border-border">
            <div className="p-4 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-7 w-7 text-primary" />
                    <span className="font-bold text-xl text-foreground">{moduleName}</span>
                </div>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => <NavItem key={item.name} item={item} />)}
            </nav>
            <div className="p-4 border-t border-border flex-shrink-0">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-foreground-muted">Welcome, <span className="font-semibold text-foreground">{username}</span></p>
                    <button onClick={handleLogout} className="text-foreground-muted hover:text-red-600" title="Logout"><LogOut className="h-5 w-5" /></button>
                </div>
            </div>
        </div>
    );
};

export default CompanySidebar;
