import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import ColorPicker from '../../components/admin/ColorPicker';
import { db } from '../../lib/db';
import {
  createUniqueSlug,
  DEFAULT_COLORS,
  LIMITS,
  sanitizeSlugInput,
  toSlug,
  validateBusinessInput,
} from '../../lib/validation';
import { getBusinessUrl } from '../../config/app';
import { copyToClipboard } from '../../utils/clipboard';

export default function BusinessForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');

  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    slug: '',
    category: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    logo_url: '',
    primary_color: DEFAULT_COLORS.primary,
    secondary_color: DEFAULT_COLORS.secondary,
    background_color: DEFAULT_COLORS.background,
    button_color: DEFAULT_COLORS.button,
    google_review_url: '',
    welcome_heading: 'How was your experience?',
    welcome_description: 'Your feedback means a lot to us.',
    welcome_message: '',
    default_language: 'en',
    is_active: true,
  });

  const [slugModifiedManually, setSlugModifiedManually] = useState(false);
  const [slugSuggestion, setSlugSuggestion] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [takenSlugs, setTakenSlugs] = useState([]);

  // Load other businesses' slugs so slug generation/uniqueness checks are pure
  // and synchronous (no side effects inside a state updater).
  useEffect(() => {
    let isMounted = true;

    db.businesses
      .getAll()
      .then((list) => {
        if (!isMounted) return;
        setTakenSlugs(
          list
            .filter((business) => business.id !== id)
            .map((business) => business.slug)
            .filter(Boolean)
        );
      })
      .catch((error) => {
        console.error('Failed to load existing slugs:', error);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!isEdit) return;

    let isMounted = true;
    async function loadBusiness() {
      try {
        setLoading(true);
        const data = await db.businesses.getById(id);
        if (!data) {
          if (isMounted) setLoadError('Business profile not found.');
          return;
        }

        if (isMounted) {
          setFormData({
            ...data,
            name: data.name || data.business_name || '',
            business_name: data.business_name || data.name || '',
            contact_email: data.contact_info?.email || data.contact_email || '',
            contact_phone: data.contact_info?.phone || data.contact_phone || '',
          });
          setSlugModifiedManually(true);
        }
      } catch (err) {
        console.error('Failed to load business:', err);
        if (isMounted) setLoadError('Failed to load business details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBusiness();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit]);

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFormData((prev) => {
      const next = {
        ...prev,
        name: newName,
        business_name: newName,
      };

      // Keep this updater pure: uniqueness is computed from the already-loaded
      // slug list instead of reading storage as a side effect.
      if (!slugModifiedManually) {
        next.slug = newName.trim() ? createUniqueSlug(newName, takenSlugs) : '';
      }

      return next;
    });

    setSlugSuggestion('');
    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
    if (errors.slug) setErrors((prev) => ({ ...prev, slug: '' }));
  };

  const handleSlugChange = (e) => {
    setSlugModifiedManually(true);
    const cleanSlug = sanitizeSlugInput(e.target.value);

    setFormData((prev) => ({ ...prev, slug: cleanSlug }));

    if (cleanSlug && takenSlugs.includes(cleanSlug)) {
      setSlugSuggestion(createUniqueSlug(cleanSlug, takenSlugs));
      setErrors((prev) => ({
        ...prev,
        slug: `Slug "${cleanSlug}" is already taken.`,
      }));
    } else {
      setSlugSuggestion('');
      if (errors.slug) setErrors((prev) => ({ ...prev, slug: '' }));
    }
  };

  const handleApplySuggestion = () => {
    if (!slugSuggestion) return;
    setFormData((prev) => ({ ...prev, slug: slugSuggestion }));
    setSlugSuggestion('');
    setErrors((prev) => ({ ...prev, slug: '' }));
  };

  const handleAutoGenerateSlug = () => {
    const sourceName = formData.name || formData.business_name || 'business';
    const uniqueSlug = createUniqueSlug(sourceName, takenSlugs);
    setFormData((prev) => ({ ...prev, slug: uniqueSlug }));
    setSlugModifiedManually(false);
    setSlugSuggestion('');
    setErrors((prev) => ({ ...prev, slug: '' }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleColorChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const businessUrl = formData.slug ? getBusinessUrl(toSlug(formData.slug)) : '';

  const handleCopyUrl = async () => {
    if (!businessUrl) return;
    const success = await copyToClipboard(businessUrl);
    if (success) {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  /** Build the canonical payload and return validation errors keyed for the form. */
  const buildPayload = () => {
    const { valid, errors: validationErrors, value } = validateBusinessInput({
      ...formData,
      business_name: formData.name,
      slug: toSlug(formData.slug),
      contact_info: {
        email: formData.contact_email,
        phone: formData.contact_phone,
      },
    });

    const formErrors = { ...validationErrors };
    if (formErrors.business_name) {
      formErrors.name = formErrors.business_name;
      delete formErrors.business_name;
    }

    if (!formData.slug.trim()) {
      formErrors.slug = 'Slug is required.';
    }

    if (!formErrors.slug && takenSlugs.includes(value.slug)) {
      formErrors.slug = `The slug "${value.slug}" is already in use by another business.`;
    }

    return {
      valid: valid && Object.keys(formErrors).length === 0,
      errors: formErrors,
      value,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { valid, errors: validationErrors, value } = buildPayload();
    setErrors(validationErrors);
    if (!valid) return;

    setSubmitting(true);
    try {
      if (isEdit) {
        await db.businesses.update(id, value);
      } else {
        await db.businesses.create(value);
      }
      navigate('/admin/businesses');
    } catch (err) {
      console.error('Failed to save business:', err);
      const fieldErrors = err?.fieldErrors || {};
      setErrors((prev) => ({
        ...prev,
        ...fieldErrors,
        ...(fieldErrors.business_name ? { name: fieldErrors.business_name } : {}),
        submit: err?.message || 'Failed to save business profile. Please try again.',
      }));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm text-gray-500">Loading business information...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-lg mx-auto">
        <h2 className="text-lg font-bold text-red-600 mb-2">Error</h2>
        <p className="text-sm text-gray-600 mb-6">{loadError}</p>
        <button
          type="button"
          onClick={() => navigate('/admin/businesses')}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          Back to Businesses
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top back button and title */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/admin/businesses')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to businesses</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {isEdit ? 'Edit Business Profile' : 'Create New Business'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit
            ? 'Update the business profile details, branding colors, and review redirection configuration.'
            : 'Fill in the information below to set up a new business profile and review flow.'}
        </p>
      </div>

      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Basic Information */}
        <fieldset className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            <p className="text-xs text-gray-500 mt-0.5">Core business details and unique URL configuration</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                maxLength={LIMITS.businessName}
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g. Royal Salon"
                className={`w-full px-3.5 py-2 border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs ${
                  errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              <p className="text-xs text-gray-400 mt-1">
                URL slug is generated automatically from the business name.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700" htmlFor="slug">
                  Unique Slug <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateSlug}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                  title="Generate a unique slug from business name"
                >
                  <Sparkles className="w-3 h-3" />
                  Auto-generate
                </button>
              </div>

              <div className="flex rounded-lg shadow-xs">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  /
                </span>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  required
                  maxLength={LIMITS.slug}
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder="royal-salon"
                  className={`flex-1 min-w-0 px-3.5 py-2 border rounded-r-lg text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.slug ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
              </div>

              {errors.slug && <p className="text-xs text-red-600 mt-1">{errors.slug}</p>}

              {slugSuggestion && (
                <div className="mt-1.5 flex items-center gap-2 text-xs">
                  <span className="text-gray-600">Suggested alternative:</span>
                  <button
                    type="button"
                    onClick={handleApplySuggestion}
                    className="font-mono text-blue-600 hover:text-blue-800 underline font-semibold cursor-pointer"
                  >
                    {slugSuggestion}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Constructed ReviewGen Business URL with Copy URL button */}
          {formData.slug && (
            <div className="rounded-lg bg-blue-50/70 border border-blue-200 p-3.5 mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 block mb-0.5">
                    Customer ReviewGen URL
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs sm:text-sm font-medium text-blue-950 truncate select-all">
                      {businessUrl}
                    </span>
                    <a
                      href={businessUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 shrink-0 inline-flex items-center gap-1 text-xs"
                      title="Open page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-md text-xs font-medium shadow-2xs transition-colors shrink-0 cursor-pointer"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-blue-600/80 mt-1.5">
                Paste this destination URL into your existing dynamic QR card provider.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
                Category
              </label>
              <input
                id="category"
                name="category"
                type="text"
                maxLength={LIMITS.category}
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Salon, Restaurant, Hotel"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="contact_email">
                Contact Email
              </label>
              <input
                id="contact_email"
                name="contact_email"
                type="email"
                maxLength={LIMITS.contactEmail}
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="contact@business.com"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="contact_phone">
                Contact Phone
              </label>
              <input
                id="contact_phone"
                name="contact_phone"
                type="tel"
                maxLength={LIMITS.contactPhone}
                value={formData.contact_phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
              Business Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              maxLength={LIMITS.description}
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the business..."
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
          </div>
        </fieldset>

        {/* SECTION 2: Branding */}
        <fieldset className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-lg font-semibold text-gray-900">Branding & Colors</h2>
            <p className="text-xs text-gray-500 mt-0.5">Customize the visual theme and logo for this business</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="logo_url">
              Logo URL
            </label>
            <input
              id="logo_url"
              name="logo_url"
              type="text"
              maxLength={LIMITS.url}
              value={formData.logo_url}
              onChange={handleChange}
              placeholder="https://example.com/logo.png or /logo.svg"
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <ColorPicker
              label="Primary Color"
              value={formData.primary_color}
              onChange={(c) => handleColorChange('primary_color', c)}
            />
            <ColorPicker
              label="Secondary Color"
              value={formData.secondary_color}
              onChange={(c) => handleColorChange('secondary_color', c)}
            />
            <ColorPicker
              label="Background Color"
              value={formData.background_color}
              onChange={(c) => handleColorChange('background_color', c)}
            />
            <ColorPicker
              label="Button Color"
              value={formData.button_color}
              onChange={(c) => handleColorChange('button_color', c)}
            />
          </div>
        </fieldset>

        {/* SECTION 3: Review Configuration */}
        <fieldset className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-lg font-semibold text-gray-900">Review Configuration</h2>
            <p className="text-xs text-gray-500 mt-0.5">Configure Google Reviews URL and customer page messages</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="google_review_url">
              Google Reviews URL <span className="text-red-500">*</span>
            </label>
            <input
              id="google_review_url"
              name="google_review_url"
              type="url"
              required
              maxLength={LIMITS.url}
              value={formData.google_review_url}
              onChange={handleChange}
              placeholder="https://g.page/r/YOUR_PLACE_ID/review"
              className={`w-full px-3.5 py-2 border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs ${
                errors.google_review_url ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            {errors.google_review_url && (
              <p className="text-xs text-red-600 mt-1">{errors.google_review_url}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              When customers complete the review draft, the Submit Review button will open this Google Reviews page.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="welcome_heading">
                Welcome Heading
              </label>
              <input
                id="welcome_heading"
                name="welcome_heading"
                type="text"
                maxLength={LIMITS.welcomeHeading}
                value={formData.welcome_heading}
                onChange={handleChange}
                placeholder="How was your experience?"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="welcome_description">
                Welcome Description (Tagline)
              </label>
              <input
                id="welcome_description"
                name="welcome_description"
                type="text"
                maxLength={LIMITS.welcomeDescription}
                value={formData.welcome_description}
                onChange={handleChange}
                placeholder="Your feedback means a lot to us."
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="welcome_message">
              Custom Welcome Message (Optional)
            </label>
            <textarea
              id="welcome_message"
              name="welcome_message"
              rows={2}
              maxLength={LIMITS.welcomeMessage}
              value={formData.welcome_message}
              onChange={handleChange}
              placeholder="Any additional welcome message shown to your reviewers..."
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="default_language">
                Default Language
              </label>
              <select
                id="default_language"
                name="default_language"
                value={formData.default_language}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              >
                <option value="en">English</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-4 sm:pt-6">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-900 cursor-pointer">
                Business is active and accepting reviews
              </label>
            </div>
          </div>
        </fieldset>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/admin/businesses')}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isEdit ? 'Save Changes' : 'Create Business'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
