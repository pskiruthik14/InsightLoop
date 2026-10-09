import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Layers,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Compass,
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
    <div className="min-h-screen bg-[#F9F8F4] text-[#2D3A31] flex flex-col font-sans selection:bg-[#DCCFC2] selection:text-[#2D3A31] relative overflow-hidden">
      {/* Top Navbar */}
      <header className="border-b border-[#E6E2DA] bg-[#F9F8F4]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4.5">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2D3A31] flex items-center justify-center text-[#F9F8F4] font-serif font-bold text-sm shadow-[0_4px_12px_rgba(45,58,49,0.15)]">
              IL
            </div>
            <div>
              <span className="font-serif font-semibold text-[#2D3A31] text-lg tracking-tight">InsightLoop</span>
              <span className="ml-2.5 text-[11px] font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#EDF1EB] text-[#4D6347] border border-[#8C9A84]/40">
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
            >
              Sign in
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDemoClick}
              isLoading={authLoading}
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
              Start analyzing
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-20 pb-16 max-w-5xl mx-auto text-center flex-1 flex flex-col justify-center">
        {/* Editorial Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EDF1EB] border border-[#8C9A84]/40 text-[#4D6347] text-xs font-medium mx-auto mb-8 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#8C9A84]" strokeWidth={1.5} />
          <span className="tracking-wide">Customer Feedback Aggregation & Sentiment Intelligence for MSMEs</span>
        </div>

        {/* Hero Headline in Playfair Display with Organic Italic Accent */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-semibold tracking-tight text-[#2D3A31] max-w-4xl mx-auto leading-[1.12]">
          Understand what your customers are <span className="italic font-normal text-[#8C9A84]">really</span> saying.
        </h1>

        <p className="text-base sm:text-lg text-[#5A695E] max-w-2xl mx-auto mt-6 font-sans leading-relaxed">
          Aggregate customer feedback from every channel, detect sentiment and recurring problems, and turn customer opinions into practical business decisions.
        </p>

        {/* Primary and Secondary Action Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <Button
            size="lg"
            variant="primary"
            rightIcon={<ArrowRight className="w-4 h-4" strokeWidth={1.5} />}
            onClick={() => {
              setAuthMode('register');
              setAuthModalOpen(true);
            }}
          >
            Start analyzing feedback
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleDemoClick}
            isLoading={authLoading}
          >
            Explore demo
          </Button>
        </div>

        {/* Architectural Roman Arch Showcase (Botanical Signature) */}
        <div className="mt-16 max-w-3xl mx-auto w-full">
          <div className="bg-white/90 rounded-t-[140px] rounded-b-3xl border border-[#E6E2DA] p-8 sm:p-12 shadow-[0_12px_40px_-8px_rgba(45,58,49,0.07)] text-left relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E2DA]/60 pb-6 mb-6">
              <div>
                <span className="text-[11px] font-sans uppercase tracking-widest text-[#8C9A84] font-medium">Customer Sentiment Health</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-serif text-3xl font-bold text-[#2D3A31]">72 / 100</span>
                  <span className="text-xs font-medium text-[#4D6347] bg-[#EDF1EB] px-2 py-0.5 rounded-full border border-[#8C9A84]/40">
                    +6.4% this month
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#5A695E]">
                <Clock className="w-3.5 h-3.5 text-[#8C9A84]" strokeWidth={1.5} />
                <span>4,284 verified customer reviews</span>
              </div>
            </div>

            {/* Quote with Aspect Breakdown */}
            <div className="space-y-4">
              <p className="font-serif italic text-lg sm:text-xl text-[#2D3A31] leading-relaxed">
                "The sourdough and filter coffee were exceptional, but weekend deliveries in Coimbatore arrived 45 minutes late."
              </p>
              
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs font-sans text-[#8C9A84] mr-2">Aspect Analysis:</span>
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#EDF1EB] text-[#2D3A31] border border-[#8C9A84]/40">
                  <CheckCircle2 className="w-3 h-3 text-[#4D6347]" strokeWidth={1.5} /> Food Quality: Positive
                </span>
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#FBF0ED] text-[#AA6552] border border-[#C27B66]/30">
                  Delivery Speed: Negative
                </span>
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#F2EDE6] text-[#5C5348] border border-[#DCCFC2]">
                  Pricing: Neutral
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Value Transformation Flow (The InsightLoop Pipeline) */}
        <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-white/70 border border-[#E6E2DA] max-w-4xl mx-auto shadow-xs">
          <p className="text-xs font-sans font-medium uppercase tracking-widest text-[#8C9A84] mb-5">
            The InsightLoop Pipeline
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-sans">
            <span className="px-3.5 py-1.5 rounded-full bg-[#F2EDE6] border border-[#E6E2DA] text-[#2D3A31]">Raw Feedback</span>
            <span className="text-[#8C9A84]">→</span>
            <span className="px-3.5 py-1.5 rounded-full bg-[#F2EDE6] border border-[#E6E2DA] text-[#2D3A31]">Clean Data</span>
            <span className="text-[#8C9A84]">→</span>
            <span className="px-3.5 py-1.5 rounded-full bg-[#EDF1EB] border border-[#8C9A84]/40 text-[#4D6347] font-medium">Sentiment</span>
            <span className="text-[#8C9A84]">→</span>
            <span className="px-3.5 py-1.5 rounded-full bg-[#F2EDE6] border border-[#E6E2DA] text-[#2D3A31]">Topics</span>
            <span className="text-[#8C9A84]">→</span>
            <span className="px-3.5 py-1.5 rounded-full bg-[#F5EBE1] border border-[#D8BCB0] text-[#8F5543]">Emotions</span>
            <span className="text-[#8C9A84]">→</span>
            <span className="px-3.5 py-1.5 rounded-full bg-[#FBF0ED] border border-[#C27B66]/30 text-[#AA6552]">Problems</span>
            <span className="text-[#8C9A84]">→</span>
            <span className="px-3.5 py-1.5 rounded-full bg-[#F2EDE6] border border-[#E6E2DA] text-[#2D3A31]">Trends</span>
            <span className="text-[#8C9A84]">→</span>
            <span className="px-4 py-1.5 rounded-full bg-[#2D3A31] text-[#F9F8F4] font-medium tracking-wide shadow-xs">Business Actions</span>
          </div>
        </div>

        {/* Staggered Organic Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left max-w-4xl mx-auto">
          {/* Card 1 */}
          <div className="p-7 rounded-3xl bg-white/80 border border-[#E6E2DA] shadow-[0_4px_20px_rgba(45,58,49,0.04)] space-y-3 hover:-translate-y-1 transition-all duration-500 ease-out">
            <div className="w-10 h-10 rounded-full bg-[#EDF1EB] border border-[#8C9A84]/30 text-[#4D6347] flex items-center justify-center">
              <Layers className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif font-semibold text-[#2D3A31] text-base">Aspect-Based Sentiment</h3>
            <p className="text-xs text-[#5A695E] leading-relaxed">
              Deconstruct reviews into distinct operational pillars: product quality, pricing, delivery speed, packaging, and service hygiene.
            </p>
          </div>

          {/* Card 2 (Staggered offset) */}
          <div className="p-7 rounded-3xl bg-white/80 border border-[#E6E2DA] shadow-[0_4px_20px_rgba(45,58,49,0.04)] space-y-3 md:translate-y-6 hover:translate-y-5 transition-all duration-500 ease-out">
            <div className="w-10 h-10 rounded-full bg-[#F5EBE1] border border-[#D8BCB0] text-[#AA6552] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif font-semibold text-[#2D3A31] text-base">Root-Cause Intelligence</h3>
            <p className="text-xs text-[#5A695E] leading-relaxed">
              Pinpoint operational bottlenecks with verifiable verbatim quotes, distinguishing hard evidence from hypothetical causes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-7 rounded-3xl bg-white/80 border border-[#E6E2DA] shadow-[0_4px_20px_rgba(45,58,49,0.04)] space-y-3 hover:-translate-y-1 transition-all duration-500 ease-out">
            <div className="w-10 h-10 rounded-full bg-[#EDF1EB] border border-[#8C9A84]/30 text-[#4D6347] flex items-center justify-center">
              <MessageSquare className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif font-semibold text-[#2D3A31] text-base">Multilingual Intelligence</h3>
            <p className="text-xs text-[#5A695E] leading-relaxed">
              Process customer voice in English, Tamil, Tanglish, and Hindi without ever losing the customer's true emotion or dialect.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="border-t border-[#E6E2DA] px-6 py-8 text-center text-xs text-[#8C9A84] bg-[#F9F8F4]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-serif text-sm text-[#2D3A31]">
            <span className="font-semibold">InsightLoop</span>
            <span className="text-[#8C9A84] text-xs font-sans">— Crafted for MSMEs & Customer Experience Teams</span>
          </div>
          <p>© 2026 InsightLoop Inc. Grounded in transparency, evidence, and natural customer intelligence.</p>
        </div>
      </footer>

      {/* Auth Modal (Login / Sign Up) */}
      <Modal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={authMode === 'login' ? 'Welcome back to InsightLoop' : 'Create your Business Account'}
        subtitle={
          authMode === 'login'
            ? 'Access your customer sentiment dashboard and operational intelligence.'
            : 'Get started in under 2 minutes. No credit card required.'
        }
        maxWidth="md"
      >
        <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs font-sans">
          {authError && (
            <div className="p-3 rounded-2xl bg-[#FBF0ED] border border-[#C27B66]/30 text-[#AA6552] text-xs">
              {authError}
            </div>
          )}

          {authMode === 'register' && (
            <>
              <div>
                <label className="block font-medium text-[#2D3A31] mb-1.5">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Arunachalam S."
                  className="w-full px-4 py-2.5 rounded-full border border-[#E6E2DA] bg-white focus:outline-none focus:ring-2 focus:ring-[#8C9A84] text-[#2D3A31]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#2D3A31] mb-1.5">Business Name</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Artisanal Roastery & Kitchen"
                  className="w-full px-4 py-2.5 rounded-full border border-[#E6E2DA] bg-white focus:outline-none focus:ring-2 focus:ring-[#8C9A84] text-[#2D3A31]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#2D3A31] mb-1.5">Business Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full border border-[#E6E2DA] bg-white focus:outline-none focus:ring-2 focus:ring-[#8C9A84] text-[#2D3A31]"
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
            <label className="block font-medium text-[#2D3A31] mb-1.5">Work Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@example.com"
              className="w-full px-4 py-2.5 rounded-full border border-[#E6E2DA] bg-white focus:outline-none focus:ring-2 focus:ring-[#8C9A84] text-[#2D3A31]"
            />
          </div>

          <div>
            <label className="block font-medium text-[#2D3A31] mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-full border border-[#E6E2DA] bg-white focus:outline-none focus:ring-2 focus:ring-[#8C9A84] text-[#2D3A31]"
            />
          </div>

          <Button type="submit" variant="primary" size="md" isLoading={authLoading} className="w-full mt-3">
            {authMode === 'login' ? 'Sign in' : 'Create Account & Continue'}
          </Button>

          <div className="pt-3 text-center text-xs text-[#8C9A84]">
            {authMode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-[#2D3A31] font-semibold underline hover:text-[#4D6347] cursor-pointer"
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
                  className="text-[#2D3A31] font-semibold underline hover:text-[#4D6347] cursor-pointer"
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
