import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './i18n';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import StoreCreated from './pages/StoreCreated';

import StoreFront from './pages/StoreFront';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/store-created" element={<StoreCreated />} />
                <Route path="/dashboard/*" element={<Dashboard />} />

                {/* Dynamic Store Route - Matches any top-level path not matched above */}
                <Route path="/:slug" element={<StoreFront />} />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default App;
