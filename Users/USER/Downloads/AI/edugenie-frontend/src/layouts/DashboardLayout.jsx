import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './DashboardLayout.css';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="dashboard-layout">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="dashboard-main-wrapper">
                <Navbar
                    onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
                />
                <main className="dashboard-content-area">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
