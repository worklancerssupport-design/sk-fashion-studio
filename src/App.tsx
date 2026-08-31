import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle, ArrowRight, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
  Clock, Download, ExternalLink, FileText, Globe, Heart, Instagram, Loader2, MapPin, Menu,
  MessageCircle, MessageSquarePlus, Phone, Scissors, Send, ShieldCheck,
  Sparkles, Star, Upload, UserCheck, X
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { fetchGoogleReviews, GooglePlaceDetails, fallbackPlaceData } from './services/googleReviews';
import EditPage from './edit/EditPage';
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
function ExploreDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const go = (targetId: string) => {
    setOpen(false);
    smoothScrollTo(targetId, 1300, 70);
  };

  const menuItems = [
    { label: 'All Designs', id: 'explore-designs' },
    ...designCategories.map(c => ({ label: c.label, id: c.id })),
  ];

  return (
    <div className="explore-wrap" ref={ref}>
      <B className="button pink explore-button" onClick={() => setOpen(x => !x)}>
        Explore our designs <ChevronDown className={open ? 'up' : ''} />
      </B>
      <AnimatePresence>
        {open && (
          <motion.div
            className="explore-menu"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            {menuItems.map(item => (
              <B key={item.id} onClick={() => go(item.id)}>
                <Sparkles size={14} />
                {item.label}
                <ArrowRight size={14} />
              </B>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
          <X size={20} />
        </button>

        {/* Modal Banner */}
        <div className="service-modal-hero">
          <img src={img(service.image, 1200)} alt={service.title} />
          <div className="service-modal-hero-overlay">
            <span className="service-modal-badge">{service.badge}</span>
            <h2>{service.title}</h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="service-modal-body">
          <div className="service-modal-section">
            <p className="service-modal-desc">{service.fullDesc}</p>
          </div>

          <div className="service-modal-grid">
            <div className="service-modal-block">
              <h4>
                <CheckCircle2 size={16} className="pink-icon" /> What is Included
              </h4>
              <ul>
                {service.whatsIncluded.map((item, idx) => (
                  <li key={idx}>
                    <span className="bullet-dot" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="service-modal-block">
              <h4>
                <Sparkles size={16} className="pink-icon" /> Suitable Occasions
              </h4>
              <div className="occasion-tags">
                {service.suitableOccasions.map((occ, idx) => (
                  <span className="occasion-tag" key={idx}>{occ}</span>
                ))}
              </div>

              <h4 style={{ marginTop: '20px' }}>
                <Scissors size={16} className="pink-icon" /> Customization &amp; Options
              </h4>
              <ul className="custom-options-list">
                {service.customizationOptions.map((opt, idx) => (
                  <li key={idx}>
                    <span className="bullet-dash">–</span>
                    <span>{opt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Privacy & Trust Bar */}
          <div className="service-modal-trust-bar">
            <UserCheck size={18} className="pink-icon" />
            <div>
              <strong>Personal Measurement Guarantee:</strong> All customer measurements and fittings are conducted personally by Karuna Kumari.
            </div>
          </div>

          {/* Bottom Action */}
          <div className="service-modal-footer">
            <div className="service-modal-footer-text">
              <p className="eyebrow pink-text">INTERESTED IN THIS SERVICE?</p>
              <span>Have questions or specific fabric requirements? Let's bring your design to life.</span>
            </div>
            <motion.button
              className="button pink service-modal-cta"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onStartCustom(service.outfitKey)}
            >
              <Sparkles size={16} />
              <span>Create Your Custom Design</span>
              <ArrowRight size={16} />
            </motion.button>
          </div>
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
            <span className="cat-img-overlay"><span>{cat.label}</span></span>
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
                <span className="cat-img-overlay"><span>{cat.label}</span></span>
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
                <span className="cat-img-overlay"><span>{cat.label}</span></span>
              </motion.button>
            ))}
          </div>
          <motion.button
            className="cat-img cat-img--hero"
            whileHover={{ scale: 1.02 }}
            onClick={() => setLight(images.length > 4 ? 4 : 0)}
          >
            <img src={img(images[4] || images[0], 1200)} alt={cat.label} />
            <span className="cat-img-overlay"><span>{cat.label}</span></span>
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
              <span className="cat-img-overlay">
                <span>{cat.subcategories ? cat.subcategories[i % cat.subcategories.length] : cat.label}</span>
              </span>
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
              <span className="cat-img-overlay"><span>{cat.label}</span></span>
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
            <span className="cat-img-overlay"><span>{cat.label}</span></span>
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
            {cat.subcategories && (
              <div className="design-subcat-chips">
                {cat.subcategories.map((sub, idx) => (
                  <span key={idx} className="subcat-chip">
                    <Sparkles size={12} /> {sub}
                  </span>
                ))}
              </div>
            )}
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
  const [activeNav, setActiveNav] = useState<string>('all');

  const selectCategory = (id: string) => {
    setActiveNav(id);
    smoothScrollTo(id === 'all' ? 'explore-designs' : id, 1200, 75);
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
        <p className="eyebrow pink-text">THE DESIGN PORTFOLIO</p>
        <h2>Explore Our <i>Designs</i></h2>
        <p className="explore-subtitle">
          From timeless bridal craftsmanship to modern saree transformations and kids wear, discover
          creations crafted for life’s grandest occasions.
        </p>
      </motion.div>

      {/* Category navigation bar */}
      <div className="explore-cat-nav">
        <button
          className={`cat-nav-pill${activeNav === 'all' ? ' cat-nav-pill--active' : ''}`}
          onClick={() => selectCategory('all')}
        >
          All Designs
        </button>
        {designCategories.map(cat => (
          <button
            key={cat.id}
            className={`cat-nav-pill${activeNav === cat.id ? ' cat-nav-pill--active' : ''}`}
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
      {/* Subtle fashion-related decorative elements (absolute positioned) */}
      <DecorThreadSpool className="decor-space-tl" />
      <DecorFloralMotif className="decor-space-br" />

      <div className="space-gallery-container">
        {/* Section Header */}
        <motion.div
          className="space-gallery-head"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <p className="eyebrow pink-text">ATELIER &amp; BOUTIQUE</p>
          <h2>Visit Our Space</h2>
          <p className="space-gallery-subtitle">
            Step inside SK Fashion Studio — where creativity, craftsmanship, and personal attention come together.
          </p>
        </motion.div>

        {/* Clean Editorial Layout */}
        <div className="space-gallery-layout">
          {/* Top Row: Large Featured (Left) + 2 Stacked (Right) */}
          <div className="space-gallery-top-grid">
            {/* 1. Large Shop Image (Left) */}
            <motion.button
              className="space-gallery-card space-card--featured"
              whileHover={{ scale: 1.015 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onClick={() => setLight(0)}
              aria-label={`View ${shopPhotos[0].title}`}
            >
              <img src={shopPhotos[0].url} alt={shopPhotos[0].title} />
              <div className="space-card-overlay">
                <span className="space-card-tag">{shopPhotos[0].tag}</span>
                <h4 className="space-card-caption">{shopPhotos[0].title}</h4>
              </div>
            </motion.button>

            {/* Right: 2 Stacked Boutique Images */}
            <div className="space-gallery-stack">
              {/* 2. Small Interior */}
              <motion.button
                className="space-gallery-card space-card--stacked"
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                onClick={() => setLight(1)}
                aria-label={`View ${shopPhotos[1].title}`}
              >
                <img src={shopPhotos[1].url} alt={shopPhotos[1].title} />
                <div className="space-card-overlay">
                  <span className="space-card-tag">{shopPhotos[1].tag}</span>
                  <h4 className="space-card-caption">{shopPhotos[1].title}</h4>
                </div>
              </motion.button>

              {/* 3. Small Detail */}
              <motion.button
                className="space-gallery-card space-card--stacked"
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                onClick={() => setLight(2)}
                aria-label={`View ${shopPhotos[2].title}`}
              >
                <img src={shopPhotos[2].url} alt={shopPhotos[2].title} />
                <div className="space-card-overlay">
                  <span className="space-card-tag">{shopPhotos[2].tag}</span>
                  <h4 className="space-card-caption">{shopPhotos[2].title}</h4>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Bottom Row: 2 Balanced Images */}
          <div className="space-gallery-bottom-row">
            {/* 4. Workspace */}
            <motion.button
              className="space-gallery-card space-card--bottom"
              whileHover={{ scale: 1.018 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              onClick={() => setLight(3)}
              aria-label={`View ${shopPhotos[3].title}`}
            >
              <img src={shopPhotos[3].url} alt={shopPhotos[3].title} />
              <div className="space-card-overlay">
                <span className="space-card-tag">{shopPhotos[3].tag}</span>
                <h4 className="space-card-caption">{shopPhotos[3].title}</h4>
              </div>
            </motion.button>

            {/* 5. Boutique Detail */}
            <motion.button
              className="space-gallery-card space-card--bottom"
              whileHover={{ scale: 1.018 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              onClick={() => setLight(4)}
              aria-label={`View ${shopPhotos[4].title}`}
            >
              <img src={shopPhotos[4].url} alt={shopPhotos[4].title} />
              <div className="space-card-overlay">
                <span className="space-card-tag">{shopPhotos[4].tag}</span>
                <h4 className="space-card-caption">{shopPhotos[4].title}</h4>
              </div>
            </motion.button>
          </div>
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
                <div className="space-lightbox-meta">
                  <span className="space-lightbox-tag">{shopPhotos[light].tag}</span>
                  <h4>{shopPhotos[light].title}</h4>
                </div>
                <span className="space-lightbox-counter">
                  {light + 1} / {shopPhotos.length}
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
  const languages = ['Tamil', 'English', 'Hindi', 'Telugu'];

  return (
    <motion.section
      id="about-owner"
      className="about-owner-section"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
    >
      {/* Light Tailoring Background Motifs */}
      <DecorMeasuringTape className="decor-owner-tl" />
      <DecorMannequinSilhouette className="decor-owner-br" />
      <DecorTailorScissors className="decor-owner-tr" />

      <div className="about-owner-container">
        {/* Owner Header Info */}
        <div className="owner-header-tag">
          <p className="eyebrow pink-text">THE HEART OF SK FASHION STUDIO</p>
          <h2>About the Owner</h2>
          <h3 className="owner-name-title">Karuna Kumari</h3>
          <span className="owner-role-badge">Founder &amp; Head Designer</span>
        </div>

        {/* Bio Text */}
        <div className="owner-bio-text">
          <p>
            Karuna Kumari is the creative force behind SK Fashion Studio. A fashion school graduate since 2016,
            she brings over 8 years of experience in designing, tailoring, custom styling, and understanding the
            unique needs of every client.
          </p>
          <p>
            Her approach to fashion is deeply personal — every outfit is designed with attention to comfort,
            fit, occasion, personality, and individual style. From bridal blouses and wedding outfits to saree
            transformations and children’s wear, she believes that every creation should feel truly made for the
            person wearing it.
          </p>
        </div>

        {/* Measurements Trust Highlight Card */}
        <div className="owner-trust-card">
          <div className="trust-card-icon">
            <ShieldCheck size={26} />
          </div>
          <div className="trust-card-body">
            <h4>Personal Measurements, Personally Taken</h4>
            <p>
              "At SK Fashion Studio, all customer measurements are personally taken by Karuna Kumari.
              No male staff member will take measurements."
            </p>
            <span className="trust-card-guarantee">
              <UserCheck size={14} /> 100% Privacy, Comfort &amp; Respect Guaranteed
            </span>
          </div>
        </div>

        {/* Languages Spoken */}
        <div className="owner-languages-block">
          <span className="languages-label">
            <Globe size={15} /> Languages Spoken:
          </span>
          <div className="languages-pills">
            {languages.map(lang => (
              <span className="lang-pill" key={lang}>{lang}</span>
            ))}
          </div>
        </div>
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
        {/* Section Header */}
        <motion.div
          className="reviews-header"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="eyebrow pink-text">REAL GOOGLE REVIEWS</p>
          <h2>Loved by Our <i>Clients</i></h2>
          <p className="reviews-subtitle">
            Every stitch tells a story. Here's what our clients have to say about their experience with SK Fashion Studio.
          </p>
        </motion.div>

        {/* Prominent Overall Rating Banner */}
        <motion.div
          className="reviews-summary-badge"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="summary-rating-left">
            <span className="large-score">{placeData.rating.toFixed(1)}</span>
            <div className="score-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={22} className="pink-star-filled" fill="#f08bab" />
              ))}
            </div>
          </div>
          <div className="summary-rating-divider" />
          <div className="summary-rating-right">
            <div className="google-verified-tag">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Based on Google Reviews</span>
            </div>
            <p className="summary-count">Verified reviews from authentic studio clients in Chennai</p>
          </div>
        </motion.div>

        {/* Review Cards Carousel */}
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
              <ChevronLeft size={22} />
            </button>
            <button
              className="review-nav-btn next"
              onClick={nextReview}
              aria-label="Next Review"
            >
              <ChevronRight size={22} />
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
                <div className="review-card-top">
                  <div className="reviewer-profile">
                    <img
                      src={reviews[currentIndex].profile_photo_url || img('photo-1534528741775-53994a69daeb', 160)}
                      alt={reviews[currentIndex].author_name}
                      className="reviewer-avatar"
                    />
                    <div className="reviewer-info">
                      <h4>{reviews[currentIndex].author_name}</h4>
                      <span className="review-date">
                        {reviews[currentIndex].relative_time_description || 'Google Verified Client'}
                      </span>
                    </div>
                  </div>
                  <div className="review-stars-row">
                    {[...Array(reviews[currentIndex].rating || 5)].map((_, i) => (
                      <Star key={i} size={17} className="pink-star" fill="#f08bab" />
                    ))}
                  </div>
                </div>

                <div className="review-card-text">
                  <p>"{reviews[currentIndex].text}"</p>
                </div>

                <div className="review-card-footer">
                  <span className="google-badge-pill">
                    <CheckCircle2 size={13} /> Verified Google Review
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
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

        {/* Official Google Buttons */}
        <div className="reviews-actions-row">
          <a
            href={placeData.place_url}
            target="_blank"
            rel="noreferrer"
            className="button light google-action-btn"
          >
            <span>Read All Reviews on Google</span>
            <ExternalLink size={16} />
          </a>

          <a
            href={placeData.write_review_url}
            target="_blank"
            rel="noreferrer"
            className="button pink google-action-btn"
          >
            <MessageSquarePlus size={16} />
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
          <img src="/sk_logo_alone.svg" alt="SK" className="brand-logo" />
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '14px', fontWeight: 300, letterSpacing: '0.18em', color: '#fff', textTransform: 'uppercase', fontStyle: 'normal', borderRight: 'none', paddingRight: 0 }}>FASHION STUDIO</span>
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
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
              Bespoke tailoring and custom design, crafted entirely around you.
            </motion.p>
            <motion.div className="actions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <ExploreDropdown />
              <B className="button light" onClick={() => openCustomWithOutfit()}>
                Create your custom design
              </B>
            </motion.div>
          </div>
          <a className="scroll" href="#about">SCROLL TO EXPLORE <b>↓</b></a>
        </section>

        {/* ── About Atelier ── */}
        <Section id="about" c="intro">
          <p className="eyebrow pink-text">THE SK EXPERIENCE</p>
          <h2>Crafting fashion,<br /><i>one detail at a time.</i></h2>
          <div className="intro-grid">
            <p>
              Every garment begins with a personal conversation. We listen to your vision, understand the
              occasion, and bring it alive through considered design, delicate hand embroidery, and precise bespoke tailoring.
            </p>
            <div>
              {[
                'Personalised stitching',
                'Perfect fitting by Karuna Kumari',
                'Detailed Maggam & Aari embroidery',
                'Saree conversions & pre-pleating',
                'Skin-safe kids wear'
              ].map(x => (
                <span className="tag" key={x}><Sparkles size={14} />{x}</span>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Services Section ── */}
        <Section id="services" c="services">
          <DecorBlouseOutline className="decor-services-tr" />
          <DecorEmbroideryCircle className="decor-services-bl" />
          <div className="heading-row">
            <div>
              <p className="eyebrow pink-text">OUR ATELIER SERVICES</p>
              <h2>Designed around <i>you.</i></h2>
              <p className="services-subtitle">
                Click any service to view design inclusions, fabric options, and bespoke customization details.
              </p>
            </div>
          </div>

          <div className="service-grid">
            {servicesData.map(service => (
              <motion.article
                whileHover={{ y: -6 }}
                className="service service-card-interactive"
                key={service.id}
                onClick={() => setActiveServiceModal(service)}
              >
                <div className="service-card-top-bar">
                  <em>{service.number}</em>
                  <span className="service-badge-pill">{service.badge}</span>
                </div>
                <Scissors size={24} className="service-card-icon" />
                <h3>{service.title}</h3>
                <p>{service.shortDesc}</p>
                <div className="service-card-footer">
                  <span className="service-learn-more">
                    View Service Details <ArrowRight size={14} />
                  </span>
                </div>
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

        {/* ── Contact Section ── */}
        <Section id="contact" c="contact">
          <DecorFloralMotif className="decor-contact-tr" />
          <div>
            <p className="eyebrow pink-text">VISIT THE STUDIO</p>
            <h2>Let's make your<br /><i>vision wearable.</i></h2>
            <p>We would love to hear about your next special outfit. Come visit us or reach out directly.</p>
            <a
              className="button dark"
              href={contactData.mapsDirectionsUrl}
              target="_blank"
              rel="noreferrer"
            >
              Get directions <MapPin />
            </a>
          </div>
          <div className="contact-details">
            <p>
              <span><MapPin /></span>
              <span>
                {contactData.address}
              </span>
            </p>
            <a href={`tel:${contactData.phoneDigits}`}>
              <Phone />
              <span>{contactData.phone}<small>Call us — {contactData.workingHours}</small></span>
            </a>
            <a href={contactData.instagram} target="_blank" rel="noreferrer" aria-label="Follow SK Fashion Studio on Instagram">
              <Instagram /> Follow us on Instagram
            </a>
          </div>
        </Section>

        {/* ── Google Maps Embed ── */}
        <div className="map-embed-wrapper">
          <iframe
            title="SK Fashion Studio Location"
            src={contactData.mapsEmbedUrl}
            width="100%"
            height="420"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-header-row">
            <div className="footer-brand-box">
              <a className="footer-brand-logo" href="#home">
                <span className="footer-brand-monogram">SK</span>
                <div className="footer-brand-text">
                  <span className="footer-brand-name">FASHION TAILORS</span>
                </div>
              </a>
              <p className="footer-brand-desc">
                Bespoke Bridal, Designer Blouse &amp; Haute Couture Studio
              </p>
            </div>

            <div className="footer-nav-and-social">
              <nav className="footer-nav-links">
                {[
                  { label: 'Home',            href: '#home' },
                  { label: 'About Atelier',   href: '#about' },
                  { label: 'Services',        href: '#services' },
                  { label: 'Explore Designs', href: '#explore-designs' },
                  { label: 'Shop Gallery',    href: '#gallery' },
                  { label: 'About Owner',     href: '#about-owner' },
                  { label: 'Reviews',         href: '#reviews' },
                  { label: 'Custom Enquiry',  href: undefined },
                ].map(({ label, href }) => (
                  href
                    ? <a key={label} href={href}>{label}</a>
                    : <button key={label} onClick={() => openCustomWithOutfit()}>{label}</button>
                ))}
              </nav>

              <div className="footer-social-icons">
                <a href={contactData.instagram} target="_blank" rel="noreferrer" aria-label="Follow SK Fashion Studio on Instagram" title="Follow us on Instagram">
                  <Instagram size={17} />
                </a>
                <a href={contactData.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp" title="Chat on WhatsApp">
                  <MessageCircle size={17} />
                </a>
                <a href={`tel:${contactData.phoneDigits}`} aria-label="Call SK Fashion Studio" title="Call Atelier">
                  <Phone size={17} />
                </a>
              </div>
            </div>
          </div>

          <div className="footer-cards-grid">
            <div className="footer-card">
              <div className="footer-card-icon"><Sparkles size={18} /></div>
              <div className="footer-card-body">
                <span className="footer-card-label">Founder &amp; Head Designer</span>
                <span className="footer-card-value">Karuna Kumari</span>
                <span className="footer-card-sub">Fashion School Graduate 2016 · 8+ Years of Bespoke Craft</span>
              </div>
            </div>

            <a href={`tel:${contactData.phoneDigits}`} className="footer-card footer-card--clickable">
              <div className="footer-card-icon"><Phone size={18} /></div>
              <div className="footer-card-body">
                <span className="footer-card-label">Phone Consultation</span>
                <span className="footer-card-value">{contactData.phone}</span>
                <span className="footer-card-sub">{contactData.workingHours}</span>
              </div>
            </a>

            <a href={contactData.whatsapp} target="_blank" rel="noreferrer" className="footer-card footer-card--clickable">
              <div className="footer-card-icon"><MessageCircle size={18} /></div>
              <div className="footer-card-body">
                <span className="footer-card-label">WhatsApp Studio</span>
                <span className="footer-card-value">{contactData.phone}</span>
                <span className="footer-card-sub">Instant Design Quotes &amp; Queries</span>
              </div>
            </a>

            <a href={`mailto:${contactData.email}`} className="footer-card footer-card--clickable">
              <div className="footer-card-icon"><Heart size={18} /></div>
              <div className="footer-card-body">
                <span className="footer-card-label">Email Atelier</span>
                <span className="footer-card-value">{contactData.email}</span>
                <span className="footer-card-sub">Send References &amp; Fabric Details</span>
              </div>
            </a>

            <div className="footer-card">
              <div className="footer-card-icon"><MapPin size={18} /></div>
              <div className="footer-card-body">
                <span className="footer-card-label">Boutique Studio</span>
                <span className="footer-card-value">30A, Sheshadripuram 1st Main Rd, Chennai</span>
                <a
                  href={contactData.mapsDirectionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="footer-card-link"
                >
                  Get Google Maps Directions →
                </a>
              </div>
            </div>

            <div className="footer-card">
              <div className="footer-card-icon"><Scissors size={18} /></div>
              <div className="footer-card-body">
                <span className="footer-card-label">Working Hours</span>
                <span className="footer-card-value">{contactData.workingHours}</span>
                <span className="footer-card-sub">{contactData.workingHoursNote}</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <span className="footer-copyright">© 2026 SK Fashion Studio. All Rights Reserved.</span>
            <span className="footer-tag">Crafting bespoke bridal &amp; couture elegance, stitch by stitch.</span>
          </div>
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
