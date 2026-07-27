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

export default function CatalogoPage() {
  const { userRole } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [adminPublishOpen, setAdminPublishOpen] = useState(false);
  const [customRequestOpen, setCustomRequestOpen] = useState(false);

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
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
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

    </main>
  );
}
