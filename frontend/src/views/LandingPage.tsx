import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  BarChart3,
  Layers,
  MessageSquare,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const LandingPage: React.FC<{ onEnterApp: () => void }> = ({ onEnterApp }) => {
  const { demoLogin, login, register } = useAuth();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Restaurant');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleDemoClick = async () => {
    setAuthLoading(true);
    try {
      await demoLogin();
      onEnterApp();
    } catch {
      setAuthError('Could not start demo session.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (authMode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, fullName, businessName, category);
      }
      onEnterApp();
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            IL
          </div>
          <div>
            <span className="font-semibold text-white text-base tracking-tight">InsightLoop</span>
            <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              MSME Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setAuthMode('login');
              setAuthModalOpen(true);
            }}
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Sign in
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDemoClick}
            isLoading={authLoading}
            className="border-slate-700 text-slate-200 bg-slate-800 hover:bg-slate-700"
          >
            Explore demo
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setAuthMode('register');
              setAuthModalOpen(true);
            }}
          >
            Start free trial
          </Button>
        </div>
      </header>

      {/* Hero Section (Section 4) */}
      <section className="px-6 py-20 max-w-5xl mx-auto text-center flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-medium mx-auto mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Customer Feedback Aggregation & Sentiment Intelligence for MSMEs</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Understand what your customers are really saying.
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mt-6 leading-relaxed">
          Aggregate customer feedback from every channel, detect sentiment and recurring problems, and turn customer opinions into practical business decisions.
        </p>

        {/* Primary and Secondary CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <Button
            size="lg"
            variant="primary"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => {
              setAuthMode('register');
              setAuthModalOpen(true);
            }}
            className="text-sm px-6 py-3"
          >
            Start analyzing feedback
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleDemoClick}
            isLoading={authLoading}
            className="text-sm px-6 py-3 border-slate-700 text-slate-200 bg-slate-800/80 hover:bg-slate-800"
          >
            Explore demo
          </Button>
        </div>

        {/* Value Transformation Flow (Section 1) */}
        <div className="mt-16 p-6 rounded-2xl bg-slate-800/40 border border-slate-800 max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
            The InsightLoop Pipeline
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-300">
            <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200">Raw Feedback</span>
            <span className="text-slate-500">→</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200">Clean Data</span>
            <span className="text-slate-500">→</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-emerald-300">Sentiment</span>
            <span className="text-slate-500">→</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-indigo-300">Topics</span>
            <span className="text-slate-500">→</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-amber-300">Emotions</span>
            <span className="text-slate-500">→</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-rose-300">Problems</span>
            <span className="text-slate-500">→</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-300">Trends</span>
            <span className="text-slate-500">→</span>
            <span className="px-3 py-1 rounded bg-indigo-600 text-white font-semibold shadow-xs">Business Actions</span>
          </div>
        </div>

        {/* Key Business Feature Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left max-w-4xl mx-auto">
          <div className="p-5 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm">Aspect-Based Sentiment (ABSA)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deconstruct reviews into distinct operational pillars: product quality, pricing, delivery speed, packaging, and hygiene.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm">Root-Cause Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Identify recurring bottlenecks with verifiable customer quotes and clear distinction between evidence and hypotheses.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm">Multilingual Support</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Process feedback in English, Tamil, Tanglish, and Hindi without losing original customer meaning or voice.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-6 text-center text-xs text-slate-500">
        <p>© 2026 InsightLoop Inc. Designed for MSMEs and customer-experience teams.</p>
      </footer>

      {/* Auth Modal (Login / Sign Up) */}
      <Modal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={authMode === 'login' ? 'Sign in to InsightLoop' : 'Create your Business Account'}
        subtitle={
          authMode === 'login'
            ? 'Enter your credentials to access your customer feedback dashboard.'
            : 'Get started in under 2 minutes. No credit card required.'
        }
        maxWidth="md"
      >
        <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs">
          {authError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {authError}
            </div>
          )}

          {authMode === 'register' && (
            <>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Arunachalam S."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Artisanal Roastery & Kitchen"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Business Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="Restaurant">Restaurant / Cafe</option>
                  <option value="Retail">Retail Store</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Hospitality">Hospitality</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="SaaS">SaaS</option>
                  <option value="Professional Services">Professional Services</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">Work Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@example.com"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <Button type="submit" variant="primary" size="md" isLoading={authLoading} className="w-full mt-2">
            {authMode === 'login' ? 'Sign in' : 'Create Account & Continue'}
          </Button>

          <div className="pt-2 text-center text-xs text-slate-500">
            {authMode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};
