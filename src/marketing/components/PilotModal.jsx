import { useState } from 'react';

const MODULES = [
  'Supply Chain Visibility',
  'Sales Management',
  'Field Team Oversight',
  'Product Authentication',
  'Driver Tracking',
  'Market Intelligence',
  'Pharma Module',
];

const INITIAL = {
  name: '',
  role: '',
  email: '',
  phone: '',
  company: '',
  industry: '',
  number_of_staff: '',
  operations_and_needs: [],
  location: '',
  challenge: '',
  from_where: 'crm.sartor.ng',
};

export default function PilotModal({ isOpen, onClose }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState(INITIAL);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    const field = id.replace('f-', '');
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleCheckboxChange = (mod) => {
    setFormData((prev) => {
      const current = prev.operations_and_needs;
      const next = current.includes(mod)
        ? current.filter((m) => m !== mod)
        : [...current, mod];
      if (errors.operations_and_needs && next.length > 0) {
        setErrors((prevErr) => {
          const newErrors = { ...prevErr };
          delete newErrors.operations_and_needs;
          return newErrors;
        });
      }
      return { ...prev, operations_and_needs: next };
    });
  };

  const validate = () => {
    const required = [
      'name',
      'role',
      'email',
      'phone',
      'company',
      'industry',
      'number_of_staff',
      'location',
    ];
    const newErrors = {};
    required.forEach((field) => {
      if (!formData[field]) newErrors[field] = true;
    });
    if (formData.operations_and_needs.length === 0) {
      newErrors.operations_and_needs = true;
    }
    if (formData.email && !formData.email.includes('@')) newErrors.email = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
    if (!scriptUrl) {
      setFormError('Pilot form is not configured yet. Email support@sartor.ng instead.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        operations_and_needs: formData.operations_and_needs.join(', '),
      };
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setIsSubmitted(true);
    } catch {
      setFormError('Failed to submit request. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[1002] bg-[rgba(5,10,30,0.82)] backdrop-blur-[8px] flex items-center justify-center sm:p-5 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={handleOverlayClick}
    >
      <div
        className={`bg-[var(--navy-mid)] border-[0.5px] border-[var(--border-light)] rounded-lg w-full max-w-[640px] max-h-[90vh] overflow-y-auto transition-transform duration-300 relative ${isOpen ? 'translate-y-0' : 'translate-y-6'}`}
      >
        <div className="p-[32px_36px_24px] border-b border-[var(--border)] sticky top-0 bg-[var(--navy-mid)] z-[2] flex items-start justify-between gap-4">
          <div>
            <div className="font-syne text-[22px] font-extrabold tracking-[-0.03em] mb-1.5 text-[var(--white)]">
              Request a Pilot
            </div>
            <div className="text-[14px] text-[var(--text-muted)] leading-relaxed max-w-[440px]">
              Tell us about your business and we&apos;ll be in touch within 24 hours to discuss pilot
              terms.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--card-bg-hover)] hover:text-[var(--white)] transition-all duration-220 flex-shrink-0 mt-0.5"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            <div className="p-[28px_36px_36px]">
              {formError ? (
                <p className="mb-4 text-[13px] text-red-400 font-medium">{formError}</p>
              ) : null}

              <div className="font-syne text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--orange)] mb-4 mt-0 flex items-center gap-2">
                Contact Details
                <div className="flex-1 h-[1px] bg-[rgba(255,92,53,0.2)]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                <FormGroup label="Full Name" id="f-name" required value={formData.name} onChange={handleChange} error={errors.name} placeholder="Adebayo Okonkwo" />
                <FormGroup label="Job Title / Role" id="f-role" required value={formData.role} onChange={handleChange} error={errors.role} placeholder="Head of Sales, MD, Brand Manager…" />
                <FormGroup label="Email Address" id="f-email" required value={formData.email} onChange={handleChange} error={errors.email} placeholder="name@company.com" type="email" />
                <FormGroup label="Phone Number" id="f-phone" required value={formData.phone} onChange={handleChange} error={errors.phone} placeholder="+234 800 000 0000" type="tel" />
              </div>

              <div className="font-syne text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--orange)] mb-4 mt-7 flex items-center gap-2">
                Company Information
                <div className="flex-1 h-[1px] bg-[rgba(255,92,53,0.2)]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                <FormGroup label="Company Name" id="f-company" required value={formData.company} onChange={handleChange} error={errors.company} placeholder="Acme Pharmaceuticals Ltd" />
                <div className="flex flex-col gap-[7px]">
                  <label className="text-[13px] font-medium text-[var(--text-mid)] flex items-center gap-1.5">
                    Industry <span className="text-[var(--orange)] text-[12px]">*</span>
                  </label>
                  <select
                    id="f-industry"
                    className={`p-[11px_14px] bg-[rgba(255,255,255,0.04)] border rounded-lg text-[var(--white)] font-dm text-[14px] outline-none transition-all w-full appearance-none pr-9 ${errors.industry ? 'border-red-500/60' : 'border-[var(--border-light)] focus:border-[var(--orange)]'}`}
                    value={formData.industry}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Select industry
                    </option>
                    <option value="FMCG / Consumer Goods">FMCG / Consumer Goods</option>
                    <option value="Pharmaceutical / Healthcare">Pharmaceutical / Healthcare</option>
                    <option value="FMCG & Pharmaceutical">FMCG & Pharmaceutical</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Distribution / Logistics">Distribution / Logistics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-[7px]">
                  <label className="text-[13px] font-medium text-[var(--text-mid)] flex items-center gap-1.5">
                    Company Size <span className="text-[var(--orange)] text-[12px]">*</span>
                  </label>
                  <select
                    id="f-number_of_staff"
                    className={`p-[11px_14px] bg-[rgba(255,255,255,0.04)] border rounded-lg text-[var(--white)] font-dm text-[14px] outline-none transition-all w-full appearance-none pr-9 ${errors.number_of_staff ? 'border-red-500/60' : 'border-[var(--border-light)] focus:border-[var(--orange)]'}`}
                    value={formData.number_of_staff}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Number of staff
                    </option>
                    <option value="1 – 10">1 – 10</option>
                    <option value="11 – 50">11 – 50</option>
                    <option value="51 – 200">51 – 200</option>
                    <option value="201 – 500">201 – 500</option>
                    <option value="500+">500+</option>
                  </select>
                </div>
                <FormGroup label="Location" id="f-location" required value={formData.location} onChange={handleChange} error={errors.location} placeholder="Lagos, Nigeria" />
              </div>

              <div className="font-syne text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--orange)] mb-4 mt-7 flex items-center gap-2">
                Operations & Needs
                <div className="flex-1 h-[1px] bg-[rgba(255,92,53,0.2)]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                <div className="flex flex-col gap-[7px] sm:col-span-2">
                  <label className="text-[13px] font-medium text-[var(--text-mid)]">
                    Which modules interest you most? <span className="text-[var(--orange)] text-[12px]">*</span>
                  </label>
                  <div className="flex flex-col gap-2.5 mt-1">
                    {MODULES.map((mod) => (
                      <label key={mod} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-[var(--border-light)] accent-[var(--orange)] cursor-pointer"
                          checked={formData.operations_and_needs.includes(mod)}
                          onChange={() => handleCheckboxChange(mod)}
                        />
                        <span className="text-[14px] text-[var(--text-mid)] group-hover:text-[var(--white)] transition-colors">
                          {mod}
                        </span>
                      </label>
                    ))}
                    {errors.operations_and_needs ? (
                      <p className="text-red-400 text-[12px]">Please select at least one module.</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col gap-[7px] sm:col-span-2">
                  <label className="text-[13px] font-medium text-[var(--text-mid)]">
                    What is your biggest operational challenge right now?{' '}
                    <span className="text-[var(--text-muted)] font-normal text-[11px]">(optional)</span>
                  </label>
                  <textarea
                    id="f-challenge"
                    className="p-[11px_14px] bg-[rgba(255,255,255,0.04)] border border-[var(--border-light)] rounded-lg text-[var(--white)] font-dm text-[14px] outline-none focus:border-[var(--orange)] transition-all w-full resize-vertical min-h-[90px] leading-relaxed"
                    placeholder="e.g. We can't track what our reps are actually doing in the field..."
                    value={formData.challenge}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="p-[0_36px_36px] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[12px] text-[var(--text-muted)] leading-relaxed max-w-[300px]">
                Your information is kept confidential and will only be used to contact you about the
                Sartor CRM pilot.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-pilot btn-pilot-hero w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending…' : 'Submit Request'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-[60px_36px] text-center">
            <div className="font-syne text-[24px] font-extrabold tracking-[-0.03em] mb-3 text-[var(--white)]">
              Request received
            </div>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed max-w-[380px] mx-auto">
              Thank you. A member of the Sartor team will review your submission and reach out within
              24 hours to discuss pilot terms.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn-pilot btn-pilot-hero mt-8"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FormGroup({ label, id, required, error, placeholder, type = 'text', value, onChange }) {
  return (
    <div className="flex flex-col gap-[7px]">
      <label className="text-[13px] font-medium text-[var(--text-mid)] flex items-center gap-1.5" htmlFor={id}>
        {label} {required ? <span className="text-[var(--orange)] text-[12px]">*</span> : null}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`p-[11px_14px] bg-[rgba(255,255,255,0.04)] border-[0.5px] rounded-lg text-[var(--white)] font-dm text-[14px] outline-none transition-all w-full ${error ? 'border-red-500/60' : 'border-[var(--border-light)] focus:border-[var(--orange)]'}`}
      />
    </div>
  );
}
