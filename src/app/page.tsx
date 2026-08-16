'use client';

import React, { useState, useEffect } from 'react';
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
import { PostularEquipoModal } from '@/components/PostularEquipoModal';
import { useAuth } from '@/context/AuthContext';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { OnboardingModal } from '@/components/OnboardingModal';

export default function Home() {
  const { userRole } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [adminPublishOpen, setAdminPublishOpen] = useState(false);
  const [customRequestOpen, setCustomRequestOpen] = useState(false);
  const [postularEquipoOpen, setPostularEquipoOpen] = useState(false);

  const [activeFilters, setActiveFilters] = useState<{ brand: string; type: string; origin: string; transaction: string } | undefined>(undefined);

  // Deep-link: read ?id= from URL on mount to auto-open a specific machinery modal
  const [initialItemId, setInitialItemId] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (id) setInitialItemId(id);
    }
  }, []);

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
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-600 selection:text-white pb-20 md:pb-0">
      
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
        onOpenPostularEquipo={() => setPostularEquipoOpen(true)}
      />

      {/* Trust & Benefits Grid */}
      <Benefits
        onOpenAuth={handleOpenAuth}
        onOpenCustomRequest={() => setCustomRequestOpen(true)}
        onOpenPostularEquipo={() => setPostularEquipoOpen(true)}
      />

      {/* Complete Marketplace Catalog Section & Live Bidding with Supabase */}
      <CatalogMarketplace
        onOpenAuth={handleOpenAuth}
        userRole={userRole ?? 'client'}
        onOpenAdminPublish={handleOpenAdminPublish}
        initialFilters={activeFilters}
        initialItemId={initialItemId}
        onOpenCustomRequest={() => setCustomRequestOpen(true)}
        onOpenPostularEquipo={() => setPostularEquipoOpen(true)}
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

      {/* Postular Equipo Modal — Para propietarios que quieren vender */}
      <PostularEquipoModal
        isOpen={postularEquipoOpen}
        onClose={() => setPostularEquipoOpen(false)}
      />

      {/* Floating Telegram & WhatsApp Contact Buttons */}
      <FloatingContactButtons />

      {/* First-time Onboarding Tour */}
      <OnboardingModal />

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
