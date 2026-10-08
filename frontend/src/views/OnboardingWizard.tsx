import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { CheckCircle2, ArrowRight, ArrowLeft, Building2, Target, Share2, Users } from 'lucide-react';

export const OnboardingWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { business, completeOnboarding } = useAuth();

  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState(business?.name || '');
  const [category, setCategory] = useState(business?.category || 'Restaurant');
  const [size, setSize] = useState('10-49 employees');
  const [selectedSources, setSelectedSources] = useState<string[]>([
    'Google Reviews',
    'WhatsApp',
    'CSV Upload',
  ]);
  const [primaryGoal, setPrimaryGoal] = useState('Reduce complaints & improve delivery satisfaction');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Restaurant',
    'Retail',
    'E-commerce',
    'Healthcare',
    'Education',
    'Hospitality',
    'Manufacturing',
    'SaaS',
    'Professional Services',
    'Other',
  ];

  const sizes = [
    '1-9 employees',
    '10-49 employees',
    '50-249 employees',
    '250+ employees',
  ];

  const allSources = [
    'Google Reviews',
    'WhatsApp',
    'Email',
    'Website',
    'Social Media',
    'CSV Upload',
    'Manual Entry',
  ];

  const goals = [
    'Improve customer satisfaction',
    'Reduce complaints',
    'Improve product quality',
    'Improve service',
    'Understand customers',
    'Monitor brand reputation',
  ];

  const toggleSource = (src: string) => {
    setSelectedSources((prev) =>
      prev.includes(src) ? prev.filter((s) => s !== src) : [...prev, src]
    );
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding({
        business_name: businessName,
        category,
        size,
        sources: selectedSources,
        primary_goal: primaryGoal,
      });
      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Step {step} of 5</span>
            <span>{Math.round((step / 5) * 100)}% Completed</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Business Name */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">What is your business name?</h2>
              <p className="text-xs text-slate-500">This will be used to label your workspace and intelligence reports.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Artisanal Roastery & Kitchen"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Step 2: Category */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Select your industry category</h2>
              <p className="text-xs text-slate-500">Helps calibrate our operational aspect dictionary.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-3 text-left rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    category === cat
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-semibold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Size */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">How large is your team?</h2>
              <p className="text-xs text-slate-500">Allows us to benchmark customer volume against similar MSMEs.</p>
            </div>
            <div className="space-y-2">
              {sizes.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSize(s)}
                  className={`w-full p-3.5 text-left rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                    size === s
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-semibold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span>{s}</span>
                  {size === s && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Feedback Sources */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Where do you receive customer feedback?</h2>
              <p className="text-xs text-slate-500">Select all channels your business actively monitors.</p>
            </div>
            <div className="space-y-2">
              {allSources.map((src) => {
                const isSelected = selectedSources.includes(src);
                return (
                  <button
                    type="button"
                    key={src}
                    onClick={() => toggleSource(src)}
                    className={`w-full p-3 text-left rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-semibold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span>{src}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded border-slate-300 text-indigo-600"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Primary Goal */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">What is your primary focus?</h2>
              <p className="text-xs text-slate-500">InsightLoop will tailor executive action priorities based on this goal.</p>
            </div>
            <div className="space-y-2">
              {goals.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setPrimaryGoal(g)}
                  className={`w-full p-3 text-left rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                    primaryGoal === g
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-semibold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span>{g}</span>
                  {primaryGoal === g && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => setStep(step + 1)}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={handleFinish}
            >
              Finish & Open Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
