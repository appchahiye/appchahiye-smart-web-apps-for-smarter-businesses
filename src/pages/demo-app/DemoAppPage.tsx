import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoAppStore } from '@/stores/demoAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DemoAppLayout } from './components/DemoAppLayout';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import ReportsPage from './pages/ReportsPage';
import { Store, Wrench, Stethoscope, X } from 'lucide-react';
import type { BusinessType } from '@shared/types';
const businessTypes: { name: BusinessType; icon: React.ElementType; description: string }[] = [
  { name: 'Retail', icon: Store, description: 'Manage inventory, sales, and customers for your shop.' },
  { name: 'Service', icon: Wrench, description: 'Track clients, projects, and billings for your services.' },
  { name: 'Clinic', icon: Stethoscope, description: 'Handle patient records, appointments, and treatments.' },
];
const OnboardingScreen = () => {
  const setBusinessType = useDemoAppStore(state => state.setBusinessType);
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Card className="w-full max-w-2xl text-center shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Welcome to the Interactive Demo!</CardTitle>
            <CardDescription className="text-lg">
              Select your business type to see a tailored experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {businessTypes.map(({ name, icon: Icon, description }) => (
              <motion.div
                key={name}
                whileHover={{ y: -5, boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)' }}
                className="p-1"
              >
                <button
                  onClick={() => setBusinessType(name)}
                  className="w-full h-full p-6 rounded-lg border bg-background text-left flex flex-col items-center space-y-4 transition-all"
                >
                  <Icon className="w-12 h-12 text-primary" />
                  <h3 className="text-xl font-semibold">{name}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </button>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
export default function DemoAppPage() {
  const businessType = useDemoAppStore(state => state.businessType);
  const resetDemo = useDemoAppStore(state => state.resetDemo);
  const navigate = useNavigate();
  const handleClose = () => {
    resetDemo();
    navigate('/');
  };
  return (
    <div className="fixed inset-0 bg-background z-[100]">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClose}
        className="absolute top-4 right-4 z-50 rounded-full bg-background/50 backdrop-blur-sm"
      >
        <X className="h-6 w-6" />
      </Button>
      <AnimatePresence mode="wait">
        {!businessType ? (
          <motion.div key="onboarding" exit={{ opacity: 0, scale: 0.9 }}>
            <OnboardingScreen />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <DemoAppLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/reports" element={<ReportsPage />} />
              </Routes>
            </DemoAppLayout>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}