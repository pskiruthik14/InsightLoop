import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-[#F9F8F4] flex items-center justify-center p-6 font-sans relative selection:bg-[#DCCFC2] selection:text-[#2D3A31]">
      <div className="max-w-lg w-full bg-white/95 rounded-3xl shadow-[0_16px_50px_rgba(45,58,49,0.08)] border border-[#E6E2DA] p-8 sm:p-10 space-y-7">
        {/* Progress Bar & Header */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-sans text-[#8C9A84]">
            <span className="uppercase tracking-wider font-medium">Step {step} of 5</span>
            <span className="font-medium">{Math.round((step / 5) * 100)}% Completed</span>
          </div>
          <div className="w-full h-1.5 bg-[#F2EDE6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2D3A31] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Business Name */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-serif font-semibold text-[#2D3A31]">What is your business name?</h2>
              <p className="text-xs text-[#8C9A84]">This will be used to label your workspace and intelligence reports.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#2D3A31] mb-1.5">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Artisanal Roastery & Kitchen"
                className="w-full px-4 py-2.5 text-sm rounded-full border border-[#E6E2DA] bg-[#F9F8F4] focus:outline-none focus:ring-2 focus:ring-[#8C9A84] text-[#2D3A31]"
              />
            </div>
          </div>
        )}

        {/* Step 2: Category */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-serif font-semibold text-[#2D3A31]">Select your industry category</h2>
              <p className="text-xs text-[#8C9A84]">Helps calibrate our operational aspect dictionary.</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-3.5 text-left rounded-2xl border text-xs font-medium transition-all duration-300 cursor-pointer ${
                    category === cat
                      ? 'border-[#2D3A31] bg-[#EDF1EB] text-[#2D3A31] font-semibold shadow-xs'
                      : 'border-[#E6E2DA] hover:border-[#8C9A84] bg-white text-[#5C6B5F]'
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
              <h2 className="text-xl font-serif font-semibold text-[#2D3A31]">How large is your team?</h2>
              <p className="text-xs text-[#8C9A84]">Allows us to benchmark customer volume against similar MSMEs.</p>
            </div>
            <div className="space-y-2.5">
              {sizes.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSize(s)}
                  className={`w-full p-4 text-left rounded-2xl border text-xs font-medium transition-all duration-300 flex items-center justify-between cursor-pointer ${
                    size === s
                      ? 'border-[#2D3A31] bg-[#EDF1EB] text-[#2D3A31] font-semibold shadow-xs'
                      : 'border-[#E6E2DA] hover:border-[#8C9A84] bg-white text-[#5C6B5F]'
                  }`}
                >
                  <span>{s}</span>
                  {size === s && <CheckCircle2 className="w-4 h-4 text-[#4D6347]" strokeWidth={1.5} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Feedback Sources */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-serif font-semibold text-[#2D3A31]">Where do you receive customer feedback?</h2>
              <p className="text-xs text-[#8C9A84]">Select all channels your business actively monitors.</p>
            </div>
            <div className="space-y-2.5">
              {allSources.map((src) => {
                const isSelected = selectedSources.includes(src);
                return (
                  <button
                    type="button"
                    key={src}
                    onClick={() => toggleSource(src)}
                    className={`w-full p-3.5 text-left rounded-2xl border text-xs font-medium transition-all duration-300 flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#2D3A31] bg-[#EDF1EB] text-[#2D3A31] font-semibold shadow-xs'
                        : 'border-[#E6E2DA] hover:border-[#8C9A84] bg-white text-[#5C6B5F]'
                    }`}
                  >
                    <span>{src}</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#2D3A31] bg-[#2D3A31] text-white' : 'border-[#DCCFC2]'}`}>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={2} />}
                    </span>
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
              <h2 className="text-xl font-serif font-semibold text-[#2D3A31]">What is your primary focus?</h2>
              <p className="text-xs text-[#8C9A84]">InsightLoop will tailor executive action priorities based on this goal.</p>
            </div>
            <div className="space-y-2.5">
              {goals.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setPrimaryGoal(g)}
                  className={`w-full p-3.5 text-left rounded-2xl border text-xs font-medium transition-all duration-300 flex items-center justify-between cursor-pointer ${
                    primaryGoal === g
                      ? 'border-[#2D3A31] bg-[#EDF1EB] text-[#2D3A31] font-semibold shadow-xs'
                      : 'border-[#E6E2DA] hover:border-[#8C9A84] bg-white text-[#5C6B5F]'
                  }`}
                >
                  <span>{g}</span>
                  {primaryGoal === g && <CheckCircle2 className="w-4 h-4 text-[#4D6347]" strokeWidth={1.5} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-5 border-t border-[#E6E2DA]">
          {step > 1 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" strokeWidth={1.5} />}
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
              rightIcon={<ArrowRight className="w-4 h-4" strokeWidth={1.5} />}
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
              rightIcon={<CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />}
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
