import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle, ArrowRight, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
  Clock, Download, ExternalLink, FileText, Heart, Instagram, Loader2, MapPin, Menu,
  MessageCircle, MessageSquarePlus, Phone, Scissors, Send, ShieldCheck,
  Sparkles, Upload, UserCheck, X
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { fetchGoogleReviews, GooglePlaceDetails, fallbackPlaceData } from './services/googleReviews';
import EditPage from './edit/EditPage';
import BrandLogo from './components/BrandLogo';
import GoogleMap from './components/GoogleMap';
import servicesData from './data/services.json';
import { categories as designCategories, navLabels as navLabelsRaw } from './data/designs.json';

const navLabels: Record<string, string> = navLabelsRaw;
import shopPhotos from './data/shopPhotos.json';
import heroSlides from './data/heroSlides.json';
import consultationChoices from './data/consultationChoices.json';
import contactData from './data/contact.json';

// ─── Helpers ────────────────────────────────────────────────────────────────
const img = (id: string, w = 900) =>
  id.startsWith('http')
    ? id
    : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=86`;

// ─── Custom Cinematic Slow Smooth Scroll ────────────────────────────────────
function smoothScrollTo(target: string | HTMLElement, duration = 1250, offset = 65) {
  const element = typeof target === 'string' ? document.getElementById(target.replace(/^#/, '')) : target;
  if (!element) return;

  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  
  if (Math.abs(distance) < 4) return;

  let startTime: number | null = null;

  function animation(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    
    const ease = progress < 0.5
      ? 8 * progress * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 4) / 2;

    window.scrollTo(0, startPosition + distance * ease);

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

const B = (p: any) => (
  <motion.button whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.97 }} {...p} />
);

// ─── Animated Section wrapper ────────────────────────────────────────────────
function Section({ id, c, children }: any) {
  return (
    <motion.section
      id={id}
      className={c}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
    >
      {children}
    </motion.section>
  );
}

// ─── SERVICES DATA (With Informational Modal Content) ─────────────────────────
interface ServiceItem {
  id: string;
  number: string;
  title: string;
  badge: string;
  shortDesc: string;
  image: string;
  fullDesc: string;
  whatsIncluded: string[];
  suitableOccasions: string[];
  customizationOptions: string[];
  outfitKey: string;
}

// ─── EXPLORE DESIGNS DATA ────────────────────────────────────────────────────

// ─── GALLERY DATA (shop / boutique photos only) ─────────────────────────────

// ─── HERO SLIDESHOW ──────────────────────────────────────────────────────────

function HeroSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setCurrent(c => (c + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="hero-slideshow">
      <AnimatePresence mode="sync">
        <motion.img
          key={heroSlides[current]}
          className="hero-slide-img"
          src={img(heroSlides[current], 1600)}
          alt=""
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        />
      </AnimatePresence>
    </div>
  );
}

// ─── HERO EXPLORE DROPDOWN ───────────────────────────────────────────────────
// ─── SERVICE INFORMATIONAL MODAL (Framer Motion) ─────────────────────────────
function ServiceDetailModal({
  service,
  onClose,
  onStartCustom,
}: {
  service: ServiceItem | null;
  onClose: () => void;
  onStartCustom: (outfitKey: string) => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!service) return null;

  return (
    <motion.div
      className="modal-backdrop service-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="service-modal-card"
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <button className="service-modal-close" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {/* Modal Image with overlaid heading */}
        <div className="service-modal-hero">
          <img src={img(service.image, 1200)} alt={service.title} />
          <div className="service-modal-hero-overlay">
            <p className="service-modal-eyebrow">Service</p>
            <h2 className="service-modal-title">{service.title}</h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="service-modal-body">
          <p className="service-modal-desc">{service.fullDesc}</p>

          <section className="service-modal-section">
            <p className="service-modal-label">What is Included</p>
            <ul className="service-modal-list">
              {service.whatsIncluded.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="service-modal-section">
            <p className="service-modal-label">Customization &amp; Options</p>
            <ul className="service-modal-list">
              {service.customizationOptions.map((opt, idx) => (
                <li key={idx}>{opt}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* Bottom Action — always visible */}
        <div className="service-modal-footer">
          <motion.button
            className="service-modal-cta"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => onStartCustom(service.outfitKey)}
          >
            <span>Start Your Custom Design</span>
            <ArrowRight size={16} />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── EXPLORE DESIGNS CATEGORY LAYOUT ────────────────────────────────────────
function CategorySection({ cat, active }: { cat: typeof designCategories[0]; active: boolean }) {
  const [light, setLight] = useState<number | null>(null);

  const renderLayout = () => {
    const { images, layout } = cat;

    if (layout === 'feature-left') {
      return (
        <div className="cat-layout-feature-left">
          <motion.button
            className="cat-img cat-img--hero"
            whileHover={{ scale: 1.02 }}
            onClick={() => setLight(0)}
          >
            <img src={img(images[0], 1200)} alt={cat.label} />
          </motion.button>
          <div className="cat-img-grid-2x2">
            {images.slice(1, 5).map((id, i) => (
              <motion.button
                key={id + i}
                className="cat-img"
                whileHover={{ scale: 1.03 }}
                onClick={() => setLight(i + 1)}
              >
                <img src={img(id)} alt={cat.label} />
              </motion.button>
            ))}
          </div>
        </div>
      );
    }

    if (layout === 'editorial-right') {
      return (
        <div className="cat-layout-editorial-right">
          <div className="cat-img-grid-2x2">
            {images.slice(0, 4).map((id, i) => (
              <motion.button
                key={id + i}
                className="cat-img"
                whileHover={{ scale: 1.03 }}
                onClick={() => setLight(i)}
              >
                <img src={img(id)} alt={cat.label} />
              </motion.button>
            ))}
          </div>
          <motion.button
            className="cat-img cat-img--hero"
            whileHover={{ scale: 1.02 }}
            onClick={() => setLight(images.length > 4 ? 4 : 0)}
          >
            <img src={img(images[4] || images[0], 1200)} alt={cat.label} />
          </motion.button>
        </div>
      );
    }

    if (layout === 'conversion-grid') {
      return (
        <div className="cat-layout-conversion">
          {images.map((id, i) => (
            <motion.button
              key={id + i}
              className={`cat-img cat-img--conversion cat-img--conversion-${i}`}
              whileHover={{ scale: 1.025 }}
              onClick={() => setLight(i)}
            >
              <img src={img(id, 1200)} alt={cat.label} />
            </motion.button>
          ))}
        </div>
      );
    }

    if (layout === 'masonry-wide') {
      return (
        <div className="cat-layout-masonry">
          {images.map((id, i) => (
            <motion.button
              key={id + i}
              className={`cat-img${i === 0 ? ' cat-img--wide' : ''}`}
              whileHover={{ scale: 1.02 }}
              onClick={() => setLight(i)}
            >
              <img src={img(id, i === 0 ? 1400 : 900)} alt={cat.label} />
            </motion.button>
          ))}
        </div>
      );
    }

    // triple-grid (default)
    return (
      <div className="cat-layout-triple">
        {images.map((id, i) => (
          <motion.button
            key={id + i}
            className={`cat-img${i === 0 ? ' cat-img--span2' : ''}`}
            whileHover={{ scale: 1.02 }}
            onClick={() => setLight(i)}
          >
            <img src={img(id, i === 0 ? 1200 : 900)} alt={cat.label} />
          </motion.button>
        ))}
      </div>
    );
  };

  const shift = (n: number) => setLight(prev => prev === null ? 0 : (prev + n + cat.images.length) % cat.images.length);

  return (
    <>
      <motion.article
        id={cat.id}
        className={`design-category${active ? ' design-category--active' : ''}`}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.07 }}
        style={{ scrollMarginTop: '120px' }}
      >
        <div className="design-cat-header">
          <div className="design-cat-meta">
            <h3>{cat.label}</h3>
            <p>{cat.desc}</p>
          </div>
          <span className="design-cat-num">0{designCategories.indexOf(cat) + 1}</span>
        </div>
        {renderLayout()}
      </motion.article>

      {/* Per-category lightbox */}
      <AnimatePresence>
        {light !== null && (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLight(null)}
          >
            <B className="close-light" onClick={() => setLight(null)}><X /></B>
            <B className="lb-prev" onClick={(e: React.MouseEvent) => { e.stopPropagation(); shift(-1); }}>
              <ChevronLeft />
            </B>
            <motion.figure
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <img src={img(cat.images[light], 1400)} alt={cat.label} />
              <figcaption>{cat.label}<span>{light + 1} / {cat.images.length}</span></figcaption>
            </motion.figure>
            <B className="lb-next" onClick={(e: React.MouseEvent) => { e.stopPropagation(); shift(1); }}>
              <ChevronRight />
            </B>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── EXPLORE DESIGNS SECTION ─────────────────────────────────────────────────
function ExploreDesigns() {
  const [activeNav, setActiveNav] = useState<string>(designCategories[0].id);

  const selectCategory = (id: string) => {
    setActiveNav(id);
    smoothScrollTo(id, 1200, 75);
  };

  return (
    <section id="explore-designs" className="explore-section" style={{ scrollMarginTop: '80px' }}>
      <DecorFloralMotif className="decor-explore-tr" />
      <DecorBlouseOutline className="decor-explore-bl" />
      <motion.div
        className="explore-head"
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <p className="eyebrow explore-eyebrow">The Design Portfolio</p>
        <h2>Explore our <i>designs.</i></h2>
        <p className="explore-subtitle">
          A curated collection across bridal couture, designer blouses, saree transformations and bespoke kids wear.
        </p>
      </motion.div>

      {/* Category navigation bar — linear, full-width, equal cells */}
      <div className="explore-cat-nav">
        {designCategories.map(cat => (
          <button
            key={cat.id}
            className={`cat-nav-link${activeNav === cat.id ? ' cat-nav-link--active' : ''}`}
            onClick={() => selectCategory(cat.id)}
          >
            {navLabels[cat.id] || cat.label}
          </button>
        ))}
      </div>

      {/* Design categories */}
      <div className="design-categories-list">
        {designCategories.map(cat => (
          <CategorySection key={cat.id} cat={cat} active={activeNav === cat.id} />
        ))}
      </div>
    </section>
  );
}

// ─── VISIT OUR SPACE / SHOP GALLERY SECTION ────────────────────────────────
function ShopGallery() {
  const [light, setLight] = useState<number | null>(null);

  const shift = (n: number) =>
    setLight(prev => (prev === null ? 0 : (prev + n + shopPhotos.length) % shopPhotos.length));

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (light === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLight(null);
      if (e.key === 'ArrowLeft') shift(-1);
      if (e.key === 'ArrowRight') shift(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [light]);

  return (
    <>
    <section id="gallery" className="space-gallery-section">
      <div className="space-gallery-container">
        {/* Section Header — left-aligned, single column */}
        <motion.div
          className="space-gallery-head"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <p className="space-gallery-eyebrow">The Studio</p>
          <h2 className="space-gallery-heading">Visit our <i>space.</i></h2>
          <p className="space-gallery-subtitle">
            Step inside SK Fashion Studio — where creativity, craftsmanship, and personal attention come together.
          </p>
        </motion.div>

        {/* Gallery — 2 stacked left, 1 big right */}
        <div className="space-gallery-layout">
          {shopPhotos.length > 0 && (
            <div className="space-gallery-top-row">
              {shopPhotos.length > 1 && (
                <div className="space-gallery-stack">
                  {shopPhotos.slice(1, 3).map((photo, i) => (
                    <motion.button
                      key={photo.url}
                      className="space-gallery-card space-card--stacked"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.08 * (i + 1) }}
                      onClick={() => setLight(i + 1)}
                      aria-label={`View ${photo.title}`}
                    >
                      <img src={photo.url} alt={photo.title} />
                    </motion.button>
                  ))}
                </div>
              )}

              <motion.button
                className="space-gallery-card space-card--featured"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => setLight(0)}
                aria-label={`View ${shopPhotos[0].title}`}
              >
                <img src={shopPhotos[0].url} alt={shopPhotos[0].title} />
              </motion.button>
            </div>
          )}

          {shopPhotos.length > 3 && (
            <div className="space-gallery-grid">
              {shopPhotos.slice(3).map((photo, i) => (
                <motion.button
                  key={photo.url}
                  className="space-gallery-card space-card--grid"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.06 * (i + 1) }}
                  onClick={() => setLight(i + 3)}
                  aria-label={`View ${photo.title}`}
                >
                  <img src={photo.url} alt={photo.title} />
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Preview */}
      <AnimatePresence>
        {light !== null && (
          <motion.div
            className="space-lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLight(null)}
          >
            <button
              className="space-lightbox-close"
              onClick={() => setLight(null)}
              aria-label="Close preview"
            >
              <X size={22} />
            </button>

            <button
              className="space-lightbox-nav space-lightbox-prev"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                shift(-1);
              }}
              aria-label="Previous image"
            >
              <ChevronLeft size={26} />
            </button>

            <motion.figure
              className="space-lightbox-figure"
              initial={{ scale: 0.94, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <img src={shopPhotos[light].url} alt={shopPhotos[light].title} />
              <figcaption className="space-lightbox-caption">
                <span className="space-lightbox-title">{shopPhotos[light].title}</span>
                <span className="space-lightbox-counter">
                  {light + 1} <i>/</i> {shopPhotos.length}
                </span>
              </figcaption>
            </motion.figure>

            <button
              className="space-lightbox-nav space-lightbox-next"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                shift(1);
              }}
              aria-label="Next image"
            >
              <ChevronRight size={26} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
    </>
  );
}

// ─── ABOUT THE OWNER SECTION (Karuna Kumari) ─────────────────────────────────
function AboutOwner() {
  return (
    <motion.section
      id="about-owner"
      className="about-owner-section"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="about-owner-container">
        <p className="about-owner-eyebrow">The Designer</p>

        <h2 className="about-owner-name">
          Karuna <i>Kumari.</i>
        </h2>

        <p className="about-owner-role">Founder &amp; Head Designer · SK Fashion Studio</p>

        <div className="about-owner-body">
          <p>
            Karuna Kumari is the creative force behind SK Fashion Studio. A fashion school graduate since 2016,
            she brings over eight years of experience in designing, tailoring and custom styling — and a quiet
            belief that every outfit should feel made for the person wearing it.
          </p>
          <p>
            From bridal blouses and wedding wear to saree transformations and children's outfits, her process is
            the same: attention to comfort, fit, occasion and the small details that make a garment yours. Comfortable to converse and style in English, Hindi, Tamil, or Telugu.     
          </p>
        </div>

        <blockquote className="about-owner-quote">
          <p>
            All customer measurements are personally taken by Karuna Kumari.
            No male staff member will ever take your measurements.
          </p>
        </blockquote>
      </div>
    </motion.section>
  );
}

// ─── GOOGLE REVIEWS SECTION ("Loved by Our Clients") ─────────────────────────
function CustomerReviews() {
  const [placeData, setPlaceData] = useState<GooglePlaceDetails>(fallbackPlaceData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    fetchGoogleReviews().then(data => {
      if (data && data.reviews && data.reviews.length > 0) {
        setPlaceData(data);
      }
    });
  }, []);

  const reviews = placeData.reviews || fallbackPlaceData.reviews;

  const nextReview = () => {
    setCurrentIndex(prev => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex(prev => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) nextReview();
    if (diff < -50) prevReview();
    setTouchStart(null);
  };

  return (
    <section id="reviews" className="customer-reviews-section">
      <div className="reviews-container">

        {/* Section Header — left-aligned, single column */}
        <motion.div
          className="reviews-header"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="reviews-eyebrow">Reviews</p>
          <h2 className="reviews-heading">Loved by our <i>clients.</i></h2>
          <p className="reviews-subtitle">
            Every stitch tells a story. Here's what our clients have to say about their experience with SK Fashion Studio.
          </p>
        </motion.div>

        {/* Carousel */}
        <div
          className="reviews-carousel-wrap"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="reviews-carousel-controls">
            <button
              className="review-nav-btn prev"
              onClick={prevReview}
              aria-label="Previous Review"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="review-nav-btn next"
              onClick={nextReview}
              aria-label="Next Review"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="reviews-cards-viewport">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="review-card"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              >
                <p className="review-quote">"{reviews[currentIndex].text}"</p>

                <div className="review-meta">
                  <span className="review-author">
                    {reviews[currentIndex].author_name}
                  </span>
                  <span className="review-dot-sep">·</span>
                  <span className="review-date">
                    {reviews[currentIndex].relative_time_description || 'Google Verified Client'}
                  </span>
                  <span className="review-dot-sep">·</span>
                  <span className="review-rating">
                    {reviews[currentIndex].rating || 5}.0
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="reviews-carousel-dots">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                className={`review-dot${idx === currentIndex ? ' active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to review ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="reviews-actions-row">
          <a
            href={placeData.place_url}
            target="_blank"
            rel="noreferrer"
            className="reviews-link"
          >
            <span>Read all reviews on Google</span>
            <ExternalLink size={14} />
          </a>

          <a
            href={placeData.write_review_url}
            target="_blank"
            rel="noreferrer"
            className="reviews-cta"
          >
            <MessageSquarePlus size={14} />
            <span>Write a Review</span>
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── CONSULTATION / CUSTOM DESIGN WORKFLOW ───────────────────────────────────
interface ConsultationFormData {
  name: string;
  phone: string;
  email: string;
  outfit: string;
  occasion: string;
  style: string;
  embroidery: string;
  fabric: string;
  measurements: string;
  timeline: string;
  notes: string;
  files: string[];
}

function generateBrandedPDF(data: ConsultationFormData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // 1. Header Banner Background (#150d12)
  doc.setFillColor(21, 13, 18);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Decorative Pink Accent Line (#f08bab)
  doc.setFillColor(240, 139, 171);
  doc.rect(0, 41, pageWidth, 1.2, 'F');

  // Brand Name & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SK FASHION STUDIO', margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(240, 139, 171);
  doc.text('BESPOKE BRIDAL & COUTURE ATELIER · CHENNAI', margin, 25);

  // Right Header Meta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('CUSTOM DESIGN ENQUIRY', pageWidth - margin, 18, { align: 'right' });

  const submissionDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(200, 190, 195);
  doc.text(`Date: ${submissionDate}`, pageWidth - margin, 25, { align: 'right' });

  let y = 52;

  // Helper for Section Titles
  const drawSectionHeader = (title: string, currentY: number) => {
    doc.setFillColor(248, 235, 240);
    doc.roundedRect(margin, currentY, contentWidth, 7, 1.2, 1.2, 'F');
    doc.setTextColor(165, 45, 80);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.text(title, margin + 4, currentY + 4.8);
    return currentY + 11.5;
  };

  // Helper for key-value rows
  const drawRow = (label: string, value: string, currentY: number, isAlternate = false) => {
    if (isAlternate) {
      doc.setFillColor(253, 248, 250);
      doc.rect(margin, currentY - 3.8, contentWidth, 6.5, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(90, 60, 70);
    doc.text(label, margin + 4, currentY + 0.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(25, 20, 22);
    const splitValue = doc.splitTextToSize(value || '—', contentWidth - 62);
    doc.text(splitValue, margin + 58, currentY + 0.8);

    const rowHeight = Math.max(6.5, splitValue.length * 4.2 + 2.2);
    return currentY + rowHeight;
  };

  // ── SECTION 1: CUSTOMER DETAILS ──
  y = drawSectionHeader('1. CUSTOMER INFORMATION', y);
  y = drawRow('Customer Name', data.name, y, false);
  y = drawRow('Phone Number', data.phone, y, true);
  y = drawRow('Email Address', data.email, y, false);
  y = drawRow('Submission Date', submissionDate, y, true);

  y += 3;

  // ── SECTION 2: DESIGN & TAILORING SPECIFICATIONS ──
  y = drawSectionHeader('2. DESIGN REQUIREMENTS & PREFERENCES', y);
  y = drawRow('Selected Service', data.outfit, y, false);
  y = drawRow('Occasion', data.occasion, y, true);
  y = drawRow('Design Style', data.style, y, false);
  y = drawRow('Embroidery Preference', data.embroidery, y, true);
  y = drawRow('Fabric Details', data.fabric, y, false);
  y = drawRow('Measurement Mode', data.measurements, y, true);
  y = drawRow('Preferred Timeline', data.timeline, y, false);

  y += 3;

  // ── SECTION 3: ADDITIONAL REQUIREMENTS & NOTES ──
  y = drawSectionHeader('3. ADDITIONAL REQUIREMENTS & NOTES', y);
  const notesText = data.notes && data.notes.trim() ? data.notes.trim() : 'No additional custom notes provided.';
  const splitNotes = doc.splitTextToSize(notesText, contentWidth - 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(40, 35, 38);
  doc.text(splitNotes, margin + 4, y);
  y += splitNotes.length * 4.4 + 3.5;

  if (data.files && data.files.length > 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.8);
    doc.setTextColor(140, 70, 95);
    doc.text(`Reference files noted: ${data.files.join(', ')} (Customer will attach in WhatsApp)`, margin + 4, y);
    y += 6;
  }

  // ── FOOTER / ATELIER DETAILS ──
  const footerY = pageHeight - 32;
  doc.setDrawColor(240, 180, 200);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(165, 45, 80);
  doc.text('SK FASHION STUDIO · ATELIER GUARANTEE', margin, footerY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 85, 90);
  doc.text(
    'All customer fittings and personal measurements taken exclusively by Karuna Kumari. 100% Privacy Guaranteed.',
    margin,
    footerY + 9.2
  );
  doc.text(
    `Address: ${contactData.address} · WhatsApp: ${contactData.phone}`,
    margin,
    footerY + 13.5
  );

  const fileName = `SK-Fashion-Enquiry-${(data.name || 'Customer').replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
  doc.save(fileName);
}

function buildWhatsAppUrl(data: ConsultationFormData): string {
  const ownerNumber = (import.meta.env.VITE_OWNER_WHATSAPP_NUMBER || contactData.phoneDigits).replace(/[^0-9]/g, '');

  const message = `Hello SK Fashion Studio 👋

I would like to enquire about a custom design.

CUSTOMER DETAILS
Name: ${data.name || '—'}
Phone: ${data.phone || '—'}
Email: ${data.email || '—'}

DESIGN REQUIREMENTS
Service: ${data.outfit || '—'}
Occasion: ${data.occasion || '—'}
Design Style: ${data.style || '—'}
Embroidery: ${data.embroidery || '—'}
Fabric Details: ${data.fabric || '—'}
Measurements: ${data.measurements || '—'}
Preferred Timeline: ${data.timeline || '—'}

ADDITIONAL REQUIREMENTS:
${data.notes && data.notes.trim() ? data.notes.trim() : 'None'}

Thank you!`;

  return `https://wa.me/${ownerNumber}?text=${encodeURIComponent(message)}`;
}

function Consultation({
  initialOutfit = '',
  close,
}: {
  initialOutfit?: string;
  close: () => void;
}) {
  const [s, setS] = useState(0);
  const [d, setD] = useState<ConsultationFormData>({
    name: '',
    phone: '',
    email: '',
    outfit: initialOutfit || '',
    occasion: '',
    style: '',
    embroidery: '',
    fabric: '',
    measurements: '',
    timeline: '',
    notes: '',
    files: [],
  });

  const [err, setErr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState<'idle' | 'pdf' | 'download' | 'whatsapp'>('idle');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (initialOutfit && !d.outfit) {
      setD(prev => ({ ...prev, outfit: initialOutfit }));
    }
  }, [initialOutfit]);

  const steps = [
    'Personal Details',
    'Choose Your Outfit / Service',
    'Select the Occasion',
    'Design Preferences',
    'Embroidery Preferences',
    'Fabric Details',
    'Measurements',
    'Preferred Timeline',
    'Reference Images & Notes',
    'Review & Submit',
  ];

  const choices: Record<number, string[]> = consultationChoices as Record<number, string[]>;

  const stepKeyMap: Record<number, keyof ConsultationFormData> = {
    1: 'outfit',
    2: 'occasion',
    3: 'style',
    4: 'embroidery',
    5: 'fabric',
    6: 'measurements',
    7: 'timeline',
  };

  const next = () => {
    // Validate current step
    if (s === 0) {
      if (!d.name || d.name.trim().length < 2) {
        return setErr('Please enter your full name (minimum 2 characters).');
      }
      const digitsOnly = d.phone.replace(/[^0-9]/g, '');
      if (!digitsOnly || digitsOnly.length < 10) {
        return setErr('Please enter a valid 10-digit phone number.');
      }
      if (!d.email || !/^\S+@\S+\.\S+$/.test(d.email.trim())) {
        return setErr('Please enter a valid email address.');
      }
    } else if (s >= 1 && s <= 7) {
      const fieldKey = stepKeyMap[s];
      if (!d[fieldKey]) {
        return setErr('Please choose an option before continuing.');
      }
    }

    setErr('');
    setS(s + 1);
  };

  const handleFinalSubmit = async () => {
    // Comprehensive validation
    if (!d.name || d.name.trim().length < 2) {
      setErr('Please enter your full name.');
      setS(0);
      return;
    }
    if (!d.phone || d.phone.replace(/[^0-9]/g, '').length < 10) {
      setErr('Please enter a valid 10-digit phone number.');
      setS(0);
      return;
    }
    if (!d.email || !/^\S+@\S+\.\S+$/.test(d.email.trim())) {
      setErr('Please enter a valid email address.');
      setS(0);
      return;
    }
    if (!d.outfit) {
      setErr('Please select your preferred outfit / service.');
      setS(1);
      return;
    }

    setErr('');
    setIsSubmitting(true);

    try {
      // 1. Generate & Download PDF
      setSubmitStage('pdf');
      await new Promise(r => setTimeout(r, 450));

      setSubmitStage('download');
      generateBrandedPDF(d);

      // 2. Wait until download is triggered successfully
      await new Promise(r => setTimeout(r, 850));

      // 3. Prepare WhatsApp & trigger redirect
      setSubmitStage('whatsapp');
      const waUrl = buildWhatsAppUrl(d);

      // Open WhatsApp in new tab / application
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      // 4. Show success screen
      await new Promise(r => setTimeout(r, 500));
      setDone(true);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error processing custom design enquiry:', error);
      setErr('An error occurred while generating your enquiry summary. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="modal-backdrop consultation-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="consultation-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <button className="consultation-modal-close" onClick={close} aria-label="Close modal">
          <X size={20} />
        </button>

        {!done ? (
          <>
            {/* Header / Progress */}
            <div className="consultation-header">
              <span className="eyebrow pink-text">START YOUR BESPOKE CREATION</span>
              <div className="consultation-title-row">
                <h2>{steps[s]}</h2>
                <span className="step-counter">STEP {s + 1} OF {steps.length}</span>
              </div>
              <div className="consultation-progress-bar">
                <motion.div
                  className="consultation-progress-fill"
                  animate={{ width: `${((s + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Step Content */}
            <div className="consultation-body">
              {/* Step 0: Personal Contact Details */}
              {s === 0 && (
                <div className="consultation-form-grid">
                  <div className="consultation-field">
                    <label htmlFor="customer-name">Full Name *</label>
                    <input
                      id="customer-name"
                      type="text"
                      placeholder="e.g. Priyadarshini Sundaram"
                      value={d.name}
                      onChange={e => setD({ ...d, name: e.target.value })}
                      autoFocus
                    />
                  </div>

                  <div className="consultation-field">
                    <label htmlFor="customer-phone">Phone Number (WhatsApp preferred) *</label>
                    <input
                      id="customer-phone"
                      type="tel"
                      placeholder="e.g. 98840 12345"
                      value={d.phone}
                      onChange={e => setD({ ...d, phone: e.target.value })}
                    />
                  </div>

                  <div className="consultation-field full-span">
                    <label htmlFor="customer-email">Email Address *</label>
                    <input
                      id="customer-email"
                      type="email"
                      placeholder="e.g. priya@gmail.com"
                      value={d.email}
                      onChange={e => setD({ ...d, email: e.target.value })}
                    />
                  </div>

                  <div className="consultation-guarantee-pill full-span">
                    <ShieldCheck size={16} className="pink-icon" />
                    <span>Your details are completely confidential. Personal measurements taken exclusively by Karuna Kumari.</span>
                  </div>
                </div>
              )}

              {/* Step 1 to 7: Multiple Choice Selection */}
              {s >= 1 && s <= 7 && (
                <div className="consultation-choices-grid">
                  {choices[s].map((option: string) => {
                    const currentKey = stepKeyMap[s];
                    const isSelected = d[currentKey] === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        className={`consultation-choice-btn ${isSelected ? 'choice--selected' : ''}`}
                        onClick={() => {
                          setD({ ...d, [currentKey]: option });
                          setErr('');
                        }}
                      >
                        <div className="choice-indicator">
                          {isSelected ? <Check size={14} /> : <span className="choice-dot" />}
                        </div>
                        <span className="choice-text">{option}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Step 8: Reference Images & Additional Notes */}
              {s === 8 && (
                <div className="consultation-notes-step">
                  <div className="consultation-field">
                    <label>Inspiration / Reference Images (Optional)</label>
                    <label className="consultation-upload-box">
                      <Upload size={22} className="pink-icon" />
                      <div className="upload-box-text">
                        <strong>Click to select images from your device</strong>
                        <span>PNG, JPG, WEBP formats supported</span>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={e => {
                          const fileNames = Array.from(e.target.files || []).map((f: File) => f.name);
                          setD({ ...d, files: fileNames });
                        }}
                      />
                    </label>
                    {d.files && d.files.length > 0 && (
                      <div className="uploaded-files-list">
                        <span className="uploaded-count">
                          <CheckCircle2 size={14} className="pink-icon" /> {d.files.length} file(s) selected:
                        </span>
                        <div className="file-chips">
                          {d.files.map((fn, idx) => (
                            <span key={idx} className="file-chip">{fn}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="upload-note">
                      💡 <strong>Note:</strong> You can also send your photos and Pinterest links directly in the WhatsApp chat when it opens.
                    </p>
                  </div>

                  <div className="consultation-field">
                    <label htmlFor="customer-notes">Additional Requirements &amp; Design Notes</label>
                    <textarea
                      id="customer-notes"
                      rows={3}
                      placeholder="Tell us about specific necklines, sleeve preferences, color combinations, or special requests..."
                      value={d.notes}
                      onChange={e => setD({ ...d, notes: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Step 9: Review & Submit */}
              {s === 9 && (
                <div className="consultation-review-container">
                  <div className="review-summary-box">
                    <div className="review-row">
                      <span className="review-label">Customer Name:</span>
                      <strong className="review-val">{d.name || '—'}</strong>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Phone Number:</span>
                      <strong className="review-val">{d.phone || '—'}</strong>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Email Address:</span>
                      <strong className="review-val">{d.email || '—'}</strong>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Selected Service:</span>
                      <strong className="review-val pink-highlight">{d.outfit || '—'}</strong>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Occasion:</span>
                      <strong className="review-val">{d.occasion || '—'}</strong>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Design Style:</span>
                      <strong className="review-val">{d.style || '—'}</strong>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Embroidery:</span>
                      <strong className="review-val">{d.embroidery || '—'}</strong>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Fabric Details:</span>
                      <strong className="review-val">{d.fabric || '—'}</strong>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Measurements:</span>
                      <strong className="review-val">{d.measurements || '—'}</strong>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Preferred Timeline:</span>
                      <strong className="review-val">{d.timeline || '—'}</strong>
                    </div>
                    {d.notes && (
                      <div className="review-row full">
                        <span className="review-label">Additional Notes:</span>
                        <p className="review-val notes-val">{d.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="review-workflow-notice">
                    <div className="notice-icon"><Sparkles size={18} className="pink-icon" /></div>
                    <div className="notice-text">
                      <strong>Automatic Workflow on Submit:</strong>
                      <ol>
                        <li>A professional branded PDF will download to your device immediately.</li>
                        <li>WhatsApp will automatically open with your complete enquiry pre-filled to chat with SK Fashion Studio.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {err && (
                <motion.div
                  className="consultation-error-banner"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle size={16} />
                  <span>{err}</span>
                </motion.div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="consultation-footer">
              {s > 0 ? (
                <button
                  type="button"
                  className="consultation-back-btn"
                  onClick={() => {
                    setErr('');
                    setS(s - 1);
                  }}
                  disabled={isSubmitting}
                >
                  <ChevronLeft size={16} /> Back
                </button>
              ) : (
                <div />
              )}

              {s < steps.length - 1 ? (
                <motion.button
                  type="button"
                  className="button pink consultation-next-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={next}
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  className="button pink consultation-submit-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>
                        {submitStage === 'pdf' && 'Generating PDF...'}
                        {submitStage === 'download' && 'Downloading PDF...'}
                        {submitStage === 'whatsapp' && 'Opening WhatsApp...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Generate PDF &amp; Open WhatsApp</span>
                      <Send size={16} />
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </>
        ) : (
          /* ── Premium Success Screen ── */
          <motion.div
            className="consultation-success-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <div className="success-icon-badge">
              <CheckCircle2 size={48} className="pink-icon-glow" />
            </div>

            <p className="eyebrow pink-text">BESPOKE DESIGN ENQUIRY</p>
            <h2>Your Design Request Is Ready!</h2>
            <p className="success-subtitle">
              Thank you, <strong>{d.name}</strong>. We have prepared your complete custom tailoring specification.
            </p>

            {/* Animated Checklist */}
            <div className="success-checklist">
              <motion.div
                className="checklist-item"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <span className="check-bullet"><Check size={14} /></span>
                <span>Your enquiry has been created</span>
              </motion.div>

              <motion.div
                className="checklist-item"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="check-bullet"><Check size={14} /></span>
                <span>Your PDF has been downloaded</span>
              </motion.div>

              <motion.div
                className="checklist-item"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
              >
                <span className="check-bullet"><Check size={14} /></span>
                <span>Your WhatsApp message is ready</span>
              </motion.div>
            </div>

            {/* Opening WhatsApp Status Box */}
            <div className="success-whatsapp-status">
              <div className="wa-status-header">
                <MessageCircle size={20} className="pink-icon" />
                <strong>Opening WhatsApp so you can send your enquiry to SK Fashion Studio.</strong>
              </div>
              <p className="wa-status-desc">
                WhatsApp click-to-chat pre-fills your complete enquiry details. Please press the <strong>Send</strong> button in WhatsApp to deliver it directly to our head designer.
              </p>
              {d.files && d.files.length > 0 && (
                <p className="wa-status-files">
                  📷 <strong>Reference Images:</strong> You can attach your inspiration photos or sketches directly in the WhatsApp chat.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="success-actions">
              <a
                className="button pink success-wa-btn"
                href={buildWhatsAppUrl(d)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={18} />
                <span>Open WhatsApp &amp; Send Enquiry</span>
                <Send size={16} />
              </a>

              <button
                type="button"
                className="button dark success-pdf-btn"
                onClick={() => generateBrandedPDF(d)}
              >
                <Download size={16} />
                <span>Download PDF Again</span>
              </button>

              <button
                type="button"
                className="success-close-link"
                onClick={close}
              >
                Back to website
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── DECORATIVE FASHION ELEMENTS ─────────────────────────────────────────────
function DecorEmbroideryCircle({ className }: { className: string }) {
  return (
    <motion.div
      className={`decor-el ${className}`}
      animate={{ y: [0, -14, 0], rotate: [0, 4, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="36" stroke="#c2446e" strokeWidth="1.2" strokeDasharray="4 3" />
        <circle cx="40" cy="40" r="24" stroke="#c2446e" strokeWidth="0.8" />
        <circle cx="40" cy="40" r="4" fill="#c2446e" fillOpacity="0.5" />
        <line x1="40" y1="4" x2="40" y2="76" stroke="#c2446e" strokeWidth="0.5" opacity="0.4" />
        <line x1="4" y1="40" x2="76" y2="40" stroke="#c2446e" strokeWidth="0.5" opacity="0.4" />
        <line x1="12" y1="12" x2="68" y2="68" stroke="#c2446e" strokeWidth="0.5" opacity="0.3" />
        <line x1="68" y1="12" x2="12" y2="68" stroke="#c2446e" strokeWidth="0.5" opacity="0.3" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <circle
            key={i}
            cx={40 + 36 * Math.cos((deg * Math.PI) / 180)}
            cy={40 + 36 * Math.sin((deg * Math.PI) / 180)}
            r="2.2"
            fill="#c2446e"
            fillOpacity="0.6"
          />
        ))}
      </svg>
    </motion.div>
  );
}

function DecorBlouseOutline({ className }: { className: string }) {
  return (
    <motion.div
      className={`decor-el ${className}`}
      animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
      transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
    >
      <svg width="70" height="90" viewBox="0 0 70 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10 10 C10 10 20 5 35 5 C50 5 60 10 60 10 L65 30 L55 35 L55 85 L15 85 L15 35 L5 30 Z"
          stroke="#c2446e" strokeWidth="1.2" fill="none" strokeLinejoin="round" strokeLinecap="round"
        />
        <path d="M22 10 Q35 22 48 10" stroke="#c2446e" strokeWidth="1" fill="none" />
        <path d="M5 30 Q8 28 15 35" stroke="#c2446e" strokeWidth="0.8" fill="none" opacity="0.6" />
        <path d="M65 30 Q62 28 55 35" stroke="#c2446e" strokeWidth="0.8" fill="none" opacity="0.6" />
        {[20, 27, 34, 41, 48].map((x, i) => (
          <circle key={i} cx={x} cy={80} r="1.5" fill="#c2446e" fillOpacity="0.5" />
        ))}
      </svg>
    </motion.div>
  );
}

function DecorThreadSpool({ className }: { className: string }) {
  return (
    <motion.div
      className={`decor-el ${className}`}
      animate={{ y: [0, 8, 0], rotate: [0, -6, 0] }}
      transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
    >
      <svg width="56" height="70" viewBox="0 0 56 70" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="28" cy="12" rx="22" ry="8" stroke="#c2446e" strokeWidth="1" fill="none" />
        <ellipse cx="28" cy="58" rx="22" ry="8" stroke="#c2446e" strokeWidth="1" fill="none" />
        <rect x="6" y="12" width="44" height="46" rx="2" stroke="#c2446e" strokeWidth="1" fill="none" />
        {[18, 23, 28, 33, 38].map((y, i) => (
          <line key={i} x1="6" y1={y} x2="50" y2={y} stroke="#c2446e" strokeWidth="0.5" opacity="0.4" />
        ))}
        <ellipse cx="28" cy="35" rx="8" ry="8" stroke="#c2446e" strokeWidth="0.8" fill="none" />
      </svg>
    </motion.div>
  );
}

function DecorFloralMotif({ className }: { className: string }) {
  return (
    <motion.div
      className={`decor-el ${className}`}
      animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 9 }}
    >
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <ellipse
            key={i}
            cx={36 + 16 * Math.cos((deg * Math.PI) / 180)}
            cy={36 + 16 * Math.sin((deg * Math.PI) / 180)}
            rx="8" ry="5"
            transform={`rotate(${deg} ${36 + 16 * Math.cos((deg * Math.PI) / 180)} ${36 + 16 * Math.sin((deg * Math.PI) / 180)})`}
            stroke="#c2446e" strokeWidth="0.9" fill="none"
          />
        ))}
        <circle cx="36" cy="36" r="5" stroke="#c2446e" strokeWidth="1" fill="none" />
        <circle cx="36" cy="36" r="2" fill="#c2446e" fillOpacity="0.4" />
        <circle cx="36" cy="36" r="34" stroke="#c2446e" strokeWidth="0.4" strokeDasharray="2 4" opacity="0.5" />
      </svg>
    </motion.div>
  );
}

function DecorMeasuringTape({ className }: { className: string }) {
  return (
    <motion.div
      className={`decor-el ${className}`}
      animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
      transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M15 75 C25 70, 35 35, 50 35 C65 35, 75 65, 80 60 C86 54, 82 25, 65 18 C48 10, 24 16, 16 35 C10 50, 16 68, 30 72"
          stroke="#f08bab"
          strokeWidth="1.2"
          strokeDasharray="4 2"
        />
        {[10, 20, 30, 40, 50, 60, 70].map((_, i) => (
          <circle key={i} cx={22 + i * 8} cy={35 + (i % 2) * 6} r="1" fill="#f08bab" fillOpacity="0.5" />
        ))}
      </svg>
    </motion.div>
  );
}

function DecorMannequinSilhouette({ className }: { className: string }) {
  return (
    <motion.div
      className={`decor-el ${className}`}
      animate={{ y: [0, 12, 0], rotate: [0, -4, 0] }}
      transition={{ duration: 23, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
    >
      <svg width="80" height="130" viewBox="0 0 80 130" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="10" r="4" stroke="#f08bab" strokeWidth="1" />
        <path d="M40 14 L40 22" stroke="#f08bab" strokeWidth="1" />
        <path
          d="M26 25 C32 22, 48 22, 54 25 C60 35, 56 50, 48 56 C44 59, 44 64, 50 72 C56 80, 54 92, 40 92 C26 92, 24 80, 30 72 C36 64, 36 59, 32 56 C24 50, 20 35, 26 25 Z"
          stroke="#f08bab"
          strokeWidth="1.1"
          fill="none"
        />
        <path d="M33 57 Q40 62 47 57" stroke="#f08bab" strokeWidth="1.3" strokeDasharray="2 2" />
        <path d="M40 24 L40 91" stroke="#f08bab" strokeWidth="0.7" strokeDasharray="3 3" opacity="0.6" />
        <path d="M40 92 L40 120" stroke="#f08bab" strokeWidth="1" />
        <path d="M26 125 L40 120 L54 125" stroke="#f08bab" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}

function DecorTailorScissors({ className }: { className: string }) {
  return (
    <motion.div
      className={`decor-el ${className}`}
      animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
      transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
    >
      <svg width="75" height="75" viewBox="0 0 75 75" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="56" rx="8" ry="11" transform="rotate(-30 22 56)" stroke="#f08bab" strokeWidth="1.1" />
        <ellipse cx="52" cy="56" rx="8" ry="11" transform="rotate(30 52 56)" stroke="#f08bab" strokeWidth="1.1" />
        <path d="M28 48 L56 16" stroke="#f08bab" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M46 48 L18 16" stroke="#f08bab" strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="37" cy="35" r="2.2" fill="#f08bab" />
      </svg>
    </motion.div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [form, setForm] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState('');
  const [activeServiceModal, setActiveServiceModal] = useState<ServiceItem | null>(null);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    document.body.style.overflow = form || activeServiceModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [form, activeServiceModal]);

  // Global smooth scroll interceptor for all in-page # links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      const id = href.replace(/^#/, '');
      const element = document.getElementById(id);
      if (element) {
        e.preventDefault();
        smoothScrollTo(element, 1300, 70);
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      const sectionMap = [
        { id: 'contact', elementId: 'contact' },
        { id: 'reviews', elementId: 'reviews' },
        { id: 'about-owner', elementId: 'about-owner' },
        { id: 'gallery', elementId: 'gallery' },
        { id: 'explore-designs', elementId: 'explore-designs' },
        { id: 'services', elementId: 'services' },
        { id: 'about', elementId: 'about' },
        { id: 'home', elementId: 'home' },
      ];

      for (const sec of sectionMap) {
        const el = document.getElementById(sec.elementId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openCustomWithOutfit = (outfit = '') => {
    setActiveServiceModal(null);
    setSelectedOutfit(outfit);
    setMenu(false);
    setForm(true);
  };

  const navLinks = [
    { label: 'Home', href: '#home', id: 'home' },
    { label: 'Our Story', href: '#about', id: 'about' },
    { label: 'Services', href: '#services', id: 'services' },
    { label: 'Explore Designs', href: '#explore-designs', id: 'explore-designs' },
    { label: 'Gallery', href: '#gallery', id: 'gallery' },
    { label: 'Contact', href: '#contact', id: 'contact' },
  ];

  return (
    <Routes>
      <Route path="/edit" element={<EditPage />} />
      <Route path="/" element={
    <>
      {/* ── Header ── */}
      <motion.header
        className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Subtle Luxury Glowing Bottom Line */}
        <div className="header-glow-line" />

        {/* LEFT: Brand Logo */}
        <motion.a
          className="brand"
          href="#home"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          whileHover={{ y: -1 }}
        >
          <BrandLogo bare size="md" color="#ffffff" />
        </motion.a>

        {/* CENTER: Clean Navigation Links */}
        <nav className="header-nav-center">
          {navLinks.map((n, i) => {
            const isActive = activeSection === n.id;
            return (
              <motion.a
                key={n.label}
                href={n.href}
                className={isActive ? 'nav-link--active' : ''}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.04 }}
                whileHover={{ y: -2 }}
              >
                <span>{n.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="activeNavLine"
                    className="active-indicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.a>
            );
          })}
        </nav>

        {/* RIGHT: Clean CTA & Mobile Toggle */}
        <div className="header-right-actions">
          <motion.button
            className="nav-cta"
            onClick={() => openCustomWithOutfit()}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            <Sparkles size={13} className="cta-icon-sparkle" />
            <span>Start Your Design</span>
            <ArrowRight size={14} className="cta-icon-arrow" />
          </motion.button>

          <B className="menu" onClick={() => setMenu(!menu)} aria-label="Toggle Navigation Menu">
            <motion.div animate={{ rotate: menu ? 90 : 0 }} transition={{ duration: 0.2 }}>
              {menu ? <X size={22} /> : <Menu size={22} />}
            </motion.div>
          </B>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {menu && (
            <motion.div
              className="mobile-nav"
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <div className="mobile-nav-links">
                {navLinks.map((n, i) => (
                  <motion.a
                    key={n.label}
                    href={n.href}
                    onClick={() => setMenu(false)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={activeSection === n.id ? 'mobile-link--active' : ''}
                  >
                    {n.label}
                  </motion.a>
                ))}
              </div>

              <B className="mobile-nav-cta" onClick={() => openCustomWithOutfit()}>
                <Sparkles size={14} /> Start Your Design <ArrowRight size={14} />
              </B>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main id="home">
        {/* ── Hero ── */}
        <section className="hero">
          <div className="hero-shade" />
          <DecorEmbroideryCircle className="decor-hero-tl" />
          <DecorThreadSpool className="decor-hero-br" />
          <HeroSlideshow />
          <div className="hero-copy">
            <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
              Raw fabric.<br />Rare <i>fashion.</i>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 0.35 }}>
              Bespoke tailoring and custom design, crafted entirely around you.
            </motion.p>
            <motion.div className="actions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <B className="button pink" onClick={() => smoothScrollTo('explore-designs', 1300, 70)}>
                Explore our designs <ArrowRight size={16} />
              </B>
              <B className="button light" onClick={() => openCustomWithOutfit()}>
                Create your custom design
              </B>
            </motion.div>
          </div>
          <a className="scroll" href="#about">SCROLL TO EXPLORE <b>↓</b></a>
        </section>

        {/* ── Services Section ── */}
        <Section id="services" c="services">
          <div className="services-header">
            <p className="services-eyebrow">Services</p>
            <h2 className="services-heading">
              Designed around <i>you.</i>
            </h2>
          </div>

          <div className="service-grid">
            {servicesData.map(service => (
              <motion.article
                whileHover={{ y: -4 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="service"
                key={service.id}
                onClick={() => setActiveServiceModal(service)}
              >
                <span className="service-number">{service.number}</span>
                <h3>{service.title}</h3>
                <p>{service.shortDesc}</p>
                <span className="service-arrow" aria-hidden="true">
                  <ArrowRight size={16} />
                </span>
              </motion.article>
            ))}
          </div>
        </Section>

        {/* ── Explore Our Designs / Design Portfolio ── */}
        <ExploreDesigns />

        {/* ── Gallery — Shop Showcase ── */}
        <ShopGallery />

        {/* ── About the Owner — Karuna Kumari ── */}
        <AboutOwner />

        {/* ── Customer Reviews Section (Loved by Our Clients — Google Reviews) ── */}
        <CustomerReviews />

        {/* ── Contact Section — Visit the Studio ── */}
        <Section id="contact" c="contact">
          <div className="contact-left">
            <div className="contact-header">
              <p className="contact-eyebrow">Visit the Studio</p>
              <h2 className="contact-heading">
                Let&rsquo;s make your<br />
                <i>vision wearable.</i>
              </h2>
            </div>

            <div className="contact-details">
              <div className="contact-meta">
                <span className="contact-meta-label">Atelier</span>
                <address className="contact-address">
                  {contactData.address.split(',').map((line, i) => (
                    <span key={i} className="contact-address-line">{line.trim()}</span>
                  ))}
                </address>
                <a
                  className="contact-action"
                  href={contactData.mapsDirectionsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Get directions
                  <span className="contact-arrow" aria-hidden="true">→</span>
                </a>
              </div>

              <div className="contact-meta-side">
                <div className="contact-meta">
                  <span className="contact-meta-label">Call</span>
                  <a
                    className="contact-value"
                    href={`tel:${contactData.phoneDigits}`}
                  >
                    {contactData.phone}
                  </a>
                  <span className="contact-meta-sub">{contactData.workingHours}</span>
                  <span className="contact-meta-sub">{contactData.workingHoursNote}</span>
                </div>

                <div className="contact-meta">
                  <span className="contact-meta-label">Follow</span>
                  <a
                    className="contact-value"
                    href={contactData.instagram}
                    target="_blank"
                    rel="noreferrer"
                  >
                    @sk_fashion_studio
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-right">
            <div className="contact-map">
              <GoogleMap
                className="contact-map-canvas"
              />
            </div>
          </div>
        </Section>
      </main>

      {/* ── Footer — Brand+Nav LEFT, Minimal contact directory RIGHT ── */}
      <footer className="site-footer">
        <div className="footer-inner">

          {/* Main: two columns */}
          <div className="footer-main">

            {/* Left: Brand (consistent BrandLogo) + tagline + vertical high-value nav */}
            <div className="footer-brand-col">
              <a className="footer-brand-link" href="#home" aria-label="SK Fashion Studio — home">
                <BrandLogo bare size="lg" color="#ffffff" />
              </a>
              <p className="footer-tagline">
                Bespoke bridal · Designer blouse · Haute couture
              </p>

              <nav className="footer-nav-vertical" aria-label="Footer">
                {[
                  { label: 'Services',        href: '#services' },
                  { label: 'Explore Designs', href: '#explore-designs' },
                  { label: 'Shop Gallery',    href: '#gallery' },
                  { label: 'Reviews',         href: '#reviews' },
                  { label: 'Custom Enquiry',  href: undefined },
                ].map(({ label, href }) => (
                  href
                    ? <a key={label} href={href}>{label}</a>
                    : <button key={label} onClick={() => openCustomWithOutfit()}>{label}</button>
                ))}
              </nav>
            </div>

            {/* Right: Minimal 6 contact rows (label/value grid, no cards/icons/pink) */}
            <div className="footer-contact-col">
              <div className="footer-contact-grid">

                <div className="footer-contact-row">
                  <span className="footer-contact-label">Founder</span>
                  <div className="footer-contact-value">
                    <span>Karuna Kumari</span>
                    {/* <span className="footer-contact-sub">Fashion School Graduate · 8+ Years of Bespoke Craft</span> */}
                  </div>
                </div>

                <div className="footer-contact-row">
                  <span className="footer-contact-label">Phone</span>
                  <div className="footer-contact-value">
                    <a href={`tel:${contactData.phoneDigits}`}>{contactData.phone}</a>
                    {/* <span className="footer-contact-sub">{contactData.workingHours}</span> */}
                  </div>
                </div>

                <div className="footer-contact-row">
                  <span className="footer-contact-label">WhatsApp</span>
                  <div className="footer-contact-value">
                    <a href={contactData.whatsapp} target="_blank" rel="noreferrer">{contactData.phone}</a>
                    {/* <span className="footer-contact-sub">Instant Design Quotes &amp; Queries</span> */}
                  </div>
                </div>

                <div className="footer-contact-row">
                  <span className="footer-contact-label">Email</span>
                  <div className="footer-contact-value">
                    <a href={`mailto:${contactData.email}`}>{contactData.email}</a>
                    {/* <span className="footer-contact-sub">Send References &amp; Fabric Details</span> */}
                  </div>
                </div>

                <div className="footer-contact-row">
                  <span className="footer-contact-label">Boutique</span>
                  <div className="footer-contact-value">
                    <span>30A, Sheshadripuram 1st Main Rd, Chennai</span>
                    {/* <a href={contactData.mapsDirectionsUrl} target="_blank" rel="noreferrer" className="footer-contact-action">Get directions →</a> */}
                  </div>
                </div>

                <div className="footer-contact-row">
                  <span className="footer-contact-label">Hours</span>
                  <div className="footer-contact-value">
                    <span>{contactData.workingHours}</span>
                    <span className="footer-contact-sub">{contactData.workingHoursNote}</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          <div className="footer-rule" />

          {/* Legal */}
          <p className="footer-legal">© 2026 SK Fashion Studio · Chennai</p>

        </div>
      </footer>

      {/* ── Service Details Informational Modal ── */}
      <AnimatePresence>
        {activeServiceModal && (
          <ServiceDetailModal
            service={activeServiceModal}
            onClose={() => setActiveServiceModal(null)}
            onStartCustom={(outfitKey) => openCustomWithOutfit(outfitKey)}
          />
        )}
      </AnimatePresence>

      {/* ── Consultation Modal ── */}
      <AnimatePresence>
        {form && (
          <Consultation
            initialOutfit={selectedOutfit}
            close={() => setForm(false)}
          />
        )}
      </AnimatePresence>
    </>
      } />
    </Routes>
  );
}
