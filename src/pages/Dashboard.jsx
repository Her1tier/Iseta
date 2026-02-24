import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/seller/DashboardLayout';
import Products from './Products';
import Settings from './Settings';
import Orders from './dashboard/Orders';
import Overview from './dashboard/Overview';

const Dashboard = () => {
    return (
        <DashboardLayout>
            <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/products" element={<Products />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </DashboardLayout>
    );
};

export default Dashboard;
