import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import BillPay from './pages/BillPay';
import ConstructionCard from './pages/ConstructionCard';
import Capital from './pages/Capital';
import Expenses from './pages/Expenses';
import Procurement from './pages/Procurement';
import Insights from './pages/Insights';
import Inbox from './pages/Inbox';
import People from './pages/People';

function PlaceholderPage({ title }) {
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-semibold text-ramp-gray-900">{title}</h2>
      <p className="text-ramp-gray-500 mt-2">Coming soon</p>
    </div>
  );
}

export default function App() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <Layout selectedProject={selectedProject} onProjectChange={setSelectedProject}>
      <Routes>
        <Route path="/" element={<Navigate to="/insights" replace />} />
        <Route path="/bill-pay" element={<BillPay selectedProject={selectedProject} />} />
        <Route path="/expenses" element={<ConstructionCard selectedProject={selectedProject} />} />
        <Route path="/expenses/card-transactions" element={<ConstructionCard selectedProject={selectedProject} />} />
        <Route path="/expenses/reimbursements" element={<Expenses selectedProject={selectedProject} />} />
        <Route path="/capital" element={<Capital />} />
        <Route path="/procurement" element={<Procurement selectedProject={selectedProject} />} />
        <Route path="/procurement/requests" element={<Procurement selectedProject={selectedProject} />} />
        <Route path="/procurement/purchase-orders" element={<Procurement selectedProject={selectedProject} />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/search" element={<PlaceholderPage title="Search" />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/people" element={<People selectedProject={selectedProject} />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
      </Routes>
    </Layout>
  );
}
