'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Benefits } from '@/components/Benefits';
import { CatalogMarketplace } from '@/components/CatalogMarketplace';
import { ImportCalculator } from '@/components/ImportCalculator';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { AdminPublishModal } from '@/components/AdminPublishModal';
import { FloatingContactButtons } from '@/components/FloatingContactButtons';
import { CustomRequestModal } from '@/components/CustomRequestModal';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
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

  const handleFilterChange = (filters: { brand: string; type: string; origin: string; transaction: string }) => {
    setActiveFilters(filters);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-600 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenAdminPublish={handleOpenAdminPublish}
      />

      {/* Hero Section with Quick Search Filter Engine */}
      <Hero
        onOpenAuth={handleOpenAuth}
        onFilterChange={handleFilterChange}
        onOpenCustomRequest={() => setCustomRequestOpen(true)}
      />

      {/* Trust & Benefits Grid */}
      <Benefits
        onOpenAuth={handleOpenAuth}
        onOpenCustomRequest={() => setCustomRequestOpen(true)}
      />

      {/* Complete Marketplace Catalog Section & Live Bidding with Supabase */}
      <CatalogMarketplace
        onOpenAuth={handleOpenAuth}
        userRole={userRole ?? 'client'}
        onOpenAdminPublish={handleOpenAdminPublish}
        initialFilters={activeFilters}
        onOpenCustomRequest={() => setCustomRequestOpen(true)}
      />

      {/* Freight & Customs Calculator for Venezuela */}
      <ImportCalculator />

      {/* Footer & Official Contacts (Caracas, Venezuela, Telegram, Instagram) */}
      <Footer onOpenAuth={handleOpenAuth} />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Admin Publishing Modal — only rendered for admin role */}
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
