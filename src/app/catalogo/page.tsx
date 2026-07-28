'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { CatalogMarketplace } from '@/components/CatalogMarketplace';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { AdminPublishModal } from '@/components/AdminPublishModal';
import { FloatingContactButtons } from '@/components/FloatingContactButtons';
import { CustomRequestModal } from '@/components/CustomRequestModal';
import { useAuth } from '@/context/AuthContext';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export default function CatalogoPage() {
  const { userRole } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [adminPublishOpen, setAdminPublishOpen] = useState(false);
  const [customRequestOpen, setCustomRequestOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{ brand: string; type: string; origin: string; transaction: string } | undefined>(undefined);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenAdminPublish = () => {
    if (userRole !== 'admin') {
      handleOpenAuth('login');
      return;
    }
    setAdminPublishOpen(true);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-20 md:pb-0">
      
      {/* Navbar */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenAdminPublish={handleOpenAdminPublish}
      />

      <div className="pt-24">
        <CatalogMarketplace
          onOpenAuth={handleOpenAuth}
          userRole={userRole ?? 'client'}
          onOpenAdminPublish={handleOpenAdminPublish}
          onOpenCustomRequest={() => setCustomRequestOpen(true)}
          initialFilters={activeFilters}
        />
      </div>

      {/* Footer */}
      <Footer onOpenAuth={handleOpenAuth} />

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
      />

      {userRole === 'admin' && (
        <AdminPublishModal
          isOpen={adminPublishOpen}
          onClose={() => setAdminPublishOpen(false)}
          onMachineryCreated={() => {}}
        />
      )}

      {/* Custom Machinery Request Modal */}
      <CustomRequestModal
        isOpen={customRequestOpen}
        onClose={() => setCustomRequestOpen(false)}
      />

      {/* Floating Telegram & WhatsApp Contact Buttons */}
      <FloatingContactButtons />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        onSelectSubastas={() => {
          setActiveFilters({ brand: 'all', type: 'all', origin: 'all', transaction: 'auction' });
          const element = document.getElementById('catalogo-marketplace');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onOpenAdminPublish={handleOpenAdminPublish}
      />

    </main>
  );
}
