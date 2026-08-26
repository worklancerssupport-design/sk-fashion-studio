import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, ChevronDown, ChevronLeft, ChevronRight,
  Download, Heart, Instagram, MapPin, Menu, MessageCircle,
  Phone, Scissors, Sparkles, Upload, X
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// ─── Helpers ────────────────────────────────────────────────────────────────
// Accepts either a full URL (http/https) or an Unsplash photo ID
const img = (id: string, w = 900) =>
  id.startsWith('http')
    ? id
    : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=86`;

const slug = (x: string) => x.toLowerCase().replaceAll(' ', '-');

// ─── Custom Cinematic Slow Smooth Scroll ────────────────────────────────────
function smoothScrollTo(target: string | HTMLElement, duration = 1250, offset = 65) {
  const element = typeof target === 'string' ? document.getElementById(target.replace(/^#/, '')) : target;
  if (!element) return;

  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  
  if (Math.abs(distance) < 4) return;

  let startTime: number | null = null;

  // Ultra-smooth easeInOutQuart curve for graceful luxury deceleration
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

// ─── EXPLORE DESIGNS DATA ────────────────────────────────────────────────────
const designCategories = [
  {
    id: 'bridal-blouses',
    label: 'Bridal Blouses',
    desc: 'Premium bridal blouse designs with heavy embroidery, stone work and detailed craftsmanship — made for your most important day.',
    layout: 'feature-left',
    images: [
      'photo-1595777457583-95e059d581b8',
      'photo-1583391733956-6c78276477e2',
      'photo-1604005950576-100b5e9a23c4',
      'photo-1605763240000-7e93b172d754',
      'photo-1515886657613-9f3515b0c78f',
      'photo-1469334031218-e382a71b716b',
    ],
  },
  {
    id: 'designer-blouses',
    label: 'Designer Blouses',
    desc: 'Modern, traditional and custom blouse designs tailored to suit every personality and style preference.',
    layout: 'masonry-duo',
    images: [
      'photo-1469334031218-e382a71b716b',
      'photo-1515886657613-9f3515b0c78f',
      'photo-1583391733956-6c78276477e2',
      'photo-1595777457583-95e059d581b8',
      'photo-1604005950576-100b5e9a23c4',
    ],
  },
  {
    id: 'lehenga-designs',
    label: 'Lehenga Designs',
    desc: 'Bridal, traditional and designer lehenga stitching styles — from grand bridal flares to contemporary silhouettes.',
    layout: 'editorial-right',
    images: [
      'photo-1519741497674-611481863552',
      'photo-1594552072238-b8a33785b261',
      'photo-1581044777550-4cfa60707c03',
      'photo-1610189020381-8b9e3d1b5c34',
      'photo-1535632066927-ab7c9ab60908',
      'photo-1583846783214-7229a91b20ed',
    ],
  },
  {
    id: 'reception-designs',
    label: 'Reception Designs',
    desc: 'Elegant and modern outfits curated for receptions and special events — refined, graceful and unforgettable.',
    layout: 'triple-grid',
    images: [
      'photo-1539008835657-9e8e9680c956',
      'photo-1606800052052-a08af7148866',
      'photo-1602751584552-8ba73aad10e1',
      'photo-1594736797933-d0501ba2fe65',
      'photo-1515886657613-9f3515b0c78f',
    ],
  },
  {
    id: 'marriage-designs',
    label: 'Marriage Designs',
    desc: 'Traditional wedding outfits, silk designs and grand bridal creations — stitched with generations of craft and care.',
    layout: 'feature-right',
    images: [
      'photo-1511285560929-80b456fea0bc',
      'photo-1523438885200-e635ba2c371e',
      'photo-1544078751-58fee2d8a03b',
      'photo-1594736797933-d0501ba2fe65',
      'photo-1606800052052-a08af7148866',
      'photo-1539008835657-9e8e9680c956',
    ],
  },
  {
    id: 'embroidery-works',
    label: 'Embroidery Works',
    desc: 'Detailed embroidery including thread work, stone work, bead work, bridal embroidery and custom patterns — each piece a labour of love.',
    layout: 'masonry-wide',
    images: [
      'photo-1621184455862-c163dfb30e0f',
      'photo-1601924994987-69e26d50dc26',
      'photo-1564584217132-2271feaeb3c5',
      'photo-1566206091558-7f218b696731',
      'photo-1583391733956-6c78276477e2',
      'photo-1595777457583-95e059d581b8',
    ],
  },
  {
    id: 'chudidar-works',
    label: 'Chudidar Works',
    desc: 'Custom stitched and designer chudidar collections — comfortable, stylish and made precisely for you.',
    layout: 'masonry-duo',
    images: [
      'photo-1610030469983-98e550d6193c',
      'photo-1583846783214-7229a91b20ed',
      'photo-1618220179428-22790b461013',
      'photo-1608234807905-4466023792f5',
      'photo-1535632066927-ab7c9ab60908',
    ],
  },
];

const navLabels: Record<string, string> = {
  'bridal-blouses': 'Bridal Blouses',
  'designer-blouses': 'Designer Blouses',
  'lehenga-designs': 'Lehengas',
  'reception-designs': 'Reception',
  'marriage-designs': 'Marriage',
  'embroidery-works': 'Embroidery',
  'chudidar-works': 'Chudidars',
};

// ─── GALLERY DATA (shop / workspace photos only) ──────────────────────────
const shopPhotos = [
  { title: 'Our Boutique Storefront', id: 'photo-1558769132-cb1aea458c5e' },
  { title: 'Inside the Boutique', id: 'photo-1528698827591-e19ccd7bc23d' },
  { title: 'The Stitching Workspace', id: 'photo-1518895312237-a9e23508077d' },
  { title: 'Embroidery Studio', id: 'photo-1556742400-b5b7a512a8c2' },
  { title: 'Fabric & Colour Display', id: 'photo-1620799140408-edc6dcb6d633' },
];

// ─── HERO SLIDESHOW ──────────────────────────────────────────────────────────
const heroSlides = [
  'https://www.embroiderywale.com/wp-content/uploads/2025/02/JMD009-1300x1733.jpg',
  'https://hyderabad.ksethnic.com/blouse/2025/03/classy-black-minimal-embroidery-blouse-1.webp',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIVWFfYekR3mbUvaFGbmDO5HAOHkLYdCVz8g8MCRpMVNQEWQkqSyjU5e2m&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2vjihiHnJ-K8ApbaYiza-dmENzY4Na05hm-WQtCGxnsS1eg60ujBeHzM&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTauxkZkyllajv53BI7bCSxglVgKkSyfOQv8AcIONXacw&s',
];

function HeroSlideshow() {
  const [current, setCurrent] = useState(0);

  // Advance slide every 5 seconds
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

// ─── EXPLORE DESIGNS CATEGORY LAYOUT ────────────────────────────────────────
function CategorySection({ cat, active }: { cat: typeof designCategories[0]; active: boolean }) {
  const [light, setLight] = useState<number | null>(null);

  const renderLayout = () => {
    const { images, layout } = cat;

    if (layout === 'feature-left') {
      // Large image left, 2×2 grid right
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
                key={id}
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
      // 2×2 grid left, large image right
      return (
        <div className="cat-layout-editorial-right">
          <div className="cat-img-grid-2x2">
            {images.slice(0, 4).map((id, i) => (
              <motion.button
                key={id}
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
            onClick={() => setLight(4)}
          >
            <img src={img(images[4] || images[0], 1200)} alt={cat.label} />
            <span className="cat-img-overlay"><span>{cat.label}</span></span>
          </motion.button>
        </div>
      );
    }

    if (layout === 'feature-right') {
      // Row of 3 small, then large feature
      return (
        <div className="cat-layout-feature-right">
          <div className="cat-img-row-3">
            {images.slice(0, 3).map((id, i) => (
              <motion.button
                key={id}
                className="cat-img"
                whileHover={{ scale: 1.03 }}
                onClick={() => setLight(i)}
              >
                <img src={img(id)} alt={cat.label} />
                <span className="cat-img-overlay"><span>{cat.label}</span></span>
              </motion.button>
            ))}
          </div>
          <div className="cat-img-row-2-tall">
            <motion.button
              className="cat-img cat-img--tall"
              whileHover={{ scale: 1.02 }}
              onClick={() => setLight(3)}
            >
              <img src={img(images[3], 1200)} alt={cat.label} />
              <span className="cat-img-overlay"><span>{cat.label}</span></span>
            </motion.button>
            <div className="cat-img-stack">
              {images.slice(4, 6).map((id, i) => (
                <motion.button
                  key={id}
                  className="cat-img"
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setLight(i + 4)}
                >
                  <img src={img(id)} alt={cat.label} />
                  <span className="cat-img-overlay"><span>{cat.label}</span></span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (layout === 'triple-grid') {
      // Horizontal masonry: first image spans 2 rows
      return (
        <div className="cat-layout-triple">
          {images.map((id, i) => (
            <motion.button
              key={id}
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
    }

    if (layout === 'masonry-wide') {
      // 3-column masonry, first wide
      return (
        <div className="cat-layout-masonry">
          {images.map((id, i) => (
            <motion.button
              key={id}
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

    // masonry-duo (default)
    return (
      <div className="cat-layout-duo">
        <motion.button
          className="cat-img cat-img--tall"
          whileHover={{ scale: 1.02 }}
          onClick={() => setLight(0)}
        >
          <img src={img(images[0], 1200)} alt={cat.label} />
          <span className="cat-img-overlay"><span>{cat.label}</span></span>
        </motion.button>
        <div className="cat-img-stack-multi">
          {images.slice(1).map((id, i) => (
            <motion.button
              key={id}
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
          From timeless bridal craftsmanship to contemporary elegance, discover
          designs created for every occasion.
        </p>
      </motion.div>

      {/* Category navigation bar */}
      <div className="explore-cat-nav">
        <button
          className={`cat-nav-pill${activeNav === 'all' ? ' cat-nav-pill--active' : ''}`}
          onClick={() => selectCategory('all')}
        >
          All
        </button>
        {designCategories.map(cat => (
          <button
            key={cat.id}
            className={`cat-nav-pill${activeNav === cat.id ? ' cat-nav-pill--active' : ''}`}
            onClick={() => selectCategory(cat.id)}
          >
            {navLabels[cat.id]}
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

// ─── SHOP GALLERY SECTION ────────────────────────────────────────────────────
function ShopGallery({ onCustom }: { onCustom: () => void }) {
  const [light, setLight] = useState<number | null>(null);
  const shift = (n: number) =>
    setLight(prev => prev === null ? 0 : (prev + n + shopPhotos.length) % shopPhotos.length);

  return (
    <section id="gallery" className="shop-gallery-section">
      <motion.div
        className="shop-gallery-intro"
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <p className="eyebrow pink-text">VISIT OUR SPACE</p>
        <h2>Step Inside<br /><i>SK Fashion Tailors.</i></h2>
        <p>Take a glimpse into the space where ideas, fabrics and craftsmanship come together.</p>
      </motion.div>

      {/* Asymmetric premium gallery grid */}
      <div className="shop-gallery-grid">
        {shopPhotos.map((photo, i) => (
          <motion.button
            key={photo.id}
            className={`shop-gallery-item shop-gallery-item--${i}`}
            whileHover={{ scale: 1.018 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setLight(i)}
          >
            <img src={img(photo.id, i === 0 ? 1400 : 900)} alt={photo.title} />
            <div className="shop-gallery-overlay">
              <span>{photo.title}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Lightbox */}
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
              <img src={img(shopPhotos[light].id, 1500)} alt={shopPhotos[light].title} />
              <figcaption>
                {shopPhotos[light].title}
                <span>{light + 1} / {shopPhotos.length}</span>
              </figcaption>
            </motion.figure>
            <B className="lb-next" onClick={(e: React.MouseEvent) => { e.stopPropagation(); shift(1); }}>
              <ChevronRight />
            </B>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── MEET THE OWNERS SECTION ─────────────────────────────────────────────────
function MeetOwners() {
  return (
    <motion.section
      className="meet-owners"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
    >
      <div className="owner-photo">
        <img
          src={`https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=85`}
          alt="The SK Fashion Tailors studio team"
        />
      </div>
      <div className="owner-content">
        <p className="eyebrow pink-text">THE HEART OF SK</p>
        <h2>Meet the people<br /><i>behind the atelier.</i></h2>
        <p>
          With a passion for fashion, craftsmanship and detail, the team at SK Fashion Tailors
          believes every outfit should feel personal. Every stitch, design and embroidery flourish
          is carefully crafted to bring our customers' vision to life.
        </p>
        <blockquote>
          "The most beautiful thing you can wear is a garment that feels truly like you."
        </blockquote>
        <b>SK FASHION TAILORS<small>FOUNDER &amp; DESIGN TEAM</small></b>
      </div>
    </motion.section>
  );
}

// ─── CONSULTATION MODAL ───────────────────────────────────────────────────────
function Consultation({ close }: { close: () => void }) {
  const [s, setS] = useState(0);
  const [d, setD] = useState<any>({
    name: '', phone: '', email: '', outfit: '', occasion: '',
    style: '', notes: '', files: []
  });
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  const steps = [
    'Personal details', 'Choose your outfit', 'Select the occasion',
    'Design preferences', 'Embroidery preferences', 'Fabric details',
    'Measurements', 'Reference images', 'Additional requirements', 'Review & submit'
  ];

  const choice: any = [
    null,
    ['Blouse', 'Bridal Blouse', 'Lehenga', 'Wedding Outfit', 'Custom Outfit'],
    ['Wedding', 'Reception', 'Engagement', 'Festival', 'Other'],
    ['Traditional', 'Modern', 'Minimal', 'Heavy Bridal', 'Designer'],
    ['No embroidery', 'Light embroidery', 'Heavy embroidery', 'Stone work', 'Bead work'],
    ['I will bring my own fabric', 'I need assistance choosing fabric'],
    ['I will visit the studio', 'I want to provide measurements', 'I need assistance']
  ];

  const key: any = ['', '', 'outfit', 'occasion', 'style', 'embroidery', 'fabric', 'measurements'][s];

  const next = () => {
    if (s < 7 && s !== 0 && !d[key]) return setErr('Please choose an option before continuing.');
    if (s === 0 && (!d.name || !d.phone || !/^\S+@\S+\.\S+$/.test(d.email)))
      return setErr('Please complete your contact details.');
    setErr('');
    setS(s + 1);
  };

  const pdf = () => {
    const p = new jsPDF();
    p.setFillColor(22, 19, 20); p.rect(0, 0, 210, 38, 'F');
    p.setTextColor(255, 255, 255); p.setFontSize(23);
    p.text('SK FASHION TAILORS', 18, 22);
    p.setTextColor(25, 22, 23); p.setFontSize(16);
    p.text('Customer Design Enquiry', 18, 55);
    let y = 70;
    Object.entries(d).filter(([k]) => k !== 'files').forEach(([k, v]) => {
      p.setFontSize(10); p.text(k.toUpperCase(), 18, y);
      p.text(String(v || '—'), 75, y); y += 12;
    });
    p.save(`SK-Fashion-Tailors-Enquiry-${d.name.replace(/\s+/g, '-') || 'Customer'}.pdf`);
  };

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="consultation" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
        {!done ? (
          <>
            <B className="xclose" onClick={close}><X /></B>
            <p className="eyebrow pink-text">PRIVATE DESIGN CONSULTATION</p>
            <div className="form-title">
              <h2>{steps[s]}</h2>
              <span>STEP {s + 1} OF 10</span>
            </div>
            <div className="progress"><motion.i animate={{ width: `${(s + 1) * 10}%` }} /></div>
            {s === 0 ? (
              <div className="form-grid">
                {[['name', 'Full name'], ['phone', 'Phone number'], ['email', 'Email address']].map(([k, l]) => (
                  <label key={k}>{l}<input value={d[k]} onChange={e => setD({ ...d, [k]: e.target.value })} /></label>
                ))}
              </div>
            ) : s === 7 ? (
              <label className="upload">
                <Upload /><b>Upload inspiration images</b>
                <input type="file" multiple accept="image/*" onChange={e => setD({ ...d, files: Array.from(e.target.files || []).map((x: any) => x.name) })} />
              </label>
            ) : s === 8 ? (
              <label className="notes">Tell us exactly what you have in mind...
                <textarea value={d.notes} onChange={e => setD({ ...d, notes: e.target.value })} />
              </label>
            ) : s === 9 ? (
              <div className="review">
                {Object.entries(d).filter(([k]) => k !== 'files').map(([k, v]) => (
                  <p key={k}><b>{k}</b><span>{String(v || '—')}</span></p>
                ))}
              </div>
            ) : (
              <div className="choices">
                {choice[s].map((x: string) => (
                  <B className={d[key] === x ? 'selected' : ''} key={x} onClick={() => setD({ ...d, [key]: x })}>{x}</B>
                ))}
              </div>
            )}
            {err && <p className="form-error">{err}</p>}
            <div className="form-actions">
              {s > 0 && <B className="back" onClick={() => setS(s - 1)}>Previous</B>}
              {s < 9
                ? <B className="button pink" onClick={next}>Continue <ArrowRight /></B>
                : <B className="button pink" onClick={() => { pdf(); setDone(true); }}>Prepare enquiry <Sparkles /></B>
              }
            </div>
          </>
        ) : (
          <div className="success">
            <Sparkles />
            <p className="eyebrow pink-text">YOUR ENQUIRY IS READY</p>
            <h2>Thank you,<br /><i>{d.name}!</i></h2>
            <p>Your branded enquiry summary has downloaded successfully.</p>
            <B className="button pink" onClick={pdf}><Download /> Download PDF again</B>
            <B className="button dark" onClick={() => window.open(
              `https://wa.me/${import.meta.env.VITE_OWNER_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                `NEW CUSTOMER ENQUIRY — SK FASHION TAILORS\nName: ${d.name}\nOutfit: ${d.outfit}\nOccasion: ${d.occasion}\nStyle: ${d.style}\nNotes: ${d.notes}`
              )}`, '_blank'
            )}>
              <MessageCircle /> Send via WhatsApp
            </B>
            <B className="back" onClick={close}>Back to website</B>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── DECORATIVE FASHION ELEMENTS ─────────────────────────────────────────────
// Subtle SVG motifs — pink/rose palette, low opacity, slow Framer Motion float.
// pointer-events: none — never blocks interactions.

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
        {/* Simplified blouse neckline silhouette */}
        <path
          d="M10 10 C10 10 20 5 35 5 C50 5 60 10 60 10 L65 30 L55 35 L55 85 L15 85 L15 35 L5 30 Z"
          stroke="#c2446e" strokeWidth="1.2" fill="none" strokeLinejoin="round" strokeLinecap="round"
        />
        {/* Neckline */}
        <path d="M22 10 Q35 22 48 10" stroke="#c2446e" strokeWidth="1" fill="none" />
        {/* Sleeve decorative lines */}
        <path d="M5 30 Q8 28 15 35" stroke="#c2446e" strokeWidth="0.8" fill="none" opacity="0.6" />
        <path d="M65 30 Q62 28 55 35" stroke="#c2446e" strokeWidth="0.8" fill="none" opacity="0.6" />
        {/* Embroidery dots on hem */}
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
        {/* Thread lines on spool */}
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
        {/* 8-petal floral motif */}
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
        {/* Outer ring */}
        <circle cx="36" cy="36" r="34" stroke="#c2446e" strokeWidth="0.4" strokeDasharray="2 4" opacity="0.5" />
      </svg>
    </motion.div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [form, setForm] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    document.body.style.overflow = form ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [form]);

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

  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      const sectionMap = [
        { id: 'contact', elementId: 'contact' },
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

  const custom = () => { setMenu(false); setForm(true); };

  const navLinks = [
    { label: 'Home', href: '#home', id: 'home' },
    { label: 'Our Story', href: '#about', id: 'about' },
    { label: 'Services', href: '#services', id: 'services' },
    { label: 'Explore Designs', href: '#explore-designs', id: 'explore-designs' },
    { label: 'Gallery', href: '#gallery', id: 'gallery' },
    { label: 'Contact', href: '#contact', id: 'contact' },
  ];

  return (
    <>
      {/* ── Header ── */}
      <motion.header
        className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.a
          className="brand"
          href="#home"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          whileHover={{ y: -1 }}
        >
          <b>SK</b>
          <div className="brand-text-stack">
            <span className="brand-primary">SK FASHION</span>
            <span className="brand-accent">TAILORS</span>
          </div>
        </motion.a>

        <nav>
          {navLinks.map((n, i) => {
            const isActive = activeSection === n.id;
            return (
              <motion.a
                key={n.label}
                href={n.href}
                className={isActive ? 'nav-link--active' : ''}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
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

        <motion.button
          className="nav-cta"
          onClick={custom}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.65 }}
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
                    transition={{ delay: i * 0.05 }}
                    className={activeSection === n.id ? 'mobile-link--active' : ''}
                  >
                    {n.label}
                  </motion.a>
                ))}
              </div>
              <B className="mobile-nav-cta" onClick={custom}>
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
          {/* ── Full-image slideshow — one image at a time ── */}
          <HeroSlideshow />
          <div className="hero-copy">
            {/* <motion.p className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}> */}
            {/*   SK FASHION TAILORS */}
            {/* </motion.p> */}
            <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
              Raw fabric.<br />Rare <i>fashion.</i>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
              Bespoke tailoring and custom design, crafted entirely around you.
            </motion.p>
            <motion.div className="actions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <B
                className="button pink"
                onClick={() => {
                  smoothScrollTo('explore-designs', 1350, 70);
                }}
              >
                Explore our designs <ArrowRight size={17} />
              </B>
              <B className="button light" onClick={custom}>Create your custom design</B>
            </motion.div>
          </div>
          <a className="scroll" href="#about">SCROLL TO EXPLORE <b>↓</b></a>
        </section>

        {/* ── About ── */}
        <Section id="about" c="intro">
          <p className="eyebrow pink-text">THE SK EXPERIENCE</p>
          <h2>Crafting fashion,<br /><i>one detail at a time.</i></h2>
          <div className="intro-grid">
            <p>
              Every garment begins with a conversation. We listen to your vision, understand the
              occasion, and bring it alive through considered design and precise craftsmanship.
            </p>
            <div>
              {['Personalised stitching', 'Perfect fitting', 'Detailed embroidery', 'Bridal expertise'].map(x => (
                <span className="tag" key={x}><Sparkles size={14} />{x}</span>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Services ── */}
        <Section id="services" c="services">
          <DecorBlouseOutline className="decor-services-tr" />
          <DecorEmbroideryCircle className="decor-services-bl" />
          <div className="heading-row">
            <div>
              <p className="eyebrow pink-text">OUR ATELIER</p>
              <h2>Designed around <i>you.</i></h2>
            </div>
          </div>
          <div className="service-grid">
            {[
              'Designer Blouse Stitching', 'Bridal Wear', 'Lehenga Stitching',
              'Saree Blouses', 'Chudidar & Ethnic Wear', 'Embroidery Work', 'Fabric to Fashion'
            ].map((x, i) => (
              <motion.article whileHover={{ y: -6 }} className="service" key={x}>
                <em>0{i + 1}</em>
                <Scissors />
                <h3>{x}</h3>
                <p>Bespoke craftsmanship made around your unique occasion and style.</p>
              </motion.article>
            ))}
          </div>
        </Section>

        {/* ── Explore Our Designs ── */}
        <ExploreDesigns />

        {/* ── Gallery — Shop Showcase ── */}
        <ShopGallery onCustom={custom} />

        {/* ── Meet the Owners ── */}
        <MeetOwners />

        {/* ── Custom Design Banner ── */}
        <section className="custom-banner">
          <p className="eyebrow">HAVE A VISION?</p>
          <h2>Let's create something<br /><i>unforgettable.</i></h2>
          <B className="button pink" onClick={custom}>Create your custom design <ArrowRight /></B>
        </section>

        {/* ── Contact ── */}
        <Section id="contact" c="contact">
          <DecorFloralMotif className="decor-contact-tr" />
          <div>
            <p className="eyebrow pink-text">VISIT THE STUDIO</p>
            <h2>Let's make your<br /><i>vision wearable.</i></h2>
            <p>We would love to hear about your next special outfit. Come visit us or reach out directly.</p>
            <a
              className="button dark"
              href="https://www.google.com/maps/dir/?api=1&destination=B+Park+Avenue+Street%2C+30A%2C+Sheshadripuram+1st+Main+Rd%2C+Seshadripuram%2C+Velachery%2C+Chennai%2C+Tamil+Nadu+600042"
              target="_blank"
              rel="noreferrer"
            >
              Get directions <MapPin />
            </a>
          </div>
          <div className="contact-details">
            <p>
              <MapPin />
              <span>
                B Park Avenue Street, 30A<small>Sheshadripuram 1st Main Rd, Seshadripuram, Velachery, Chennai, Tamil Nadu 600042</small>
              </span>
            </p>
            <a href="tel:+919884016637">
              <Phone />
              <span>+91 98840 16637<small>Call us — Mon to Sat, 10:30 AM – 8:30 PM</small></span>
            </a>
            <a href="https://www.instagram.com/sk_fashion_studio/" target="_blank" rel="noreferrer" aria-label="Follow SK Fashion Studio on Instagram">
              <Instagram /> Follow us on Instagram
            </a>
          </div>
        </Section>

        {/* ── Google Maps Embed ── */}
        <div className="map-embed-wrapper">
          <iframe
            title="SK Fashion Tailors Location"
            src="https://www.google.com/maps?q=B+Park+Avenue+Street,+30A,+Sheshadripuram+1st+Main+Rd,+Seshadripuram,+Velachery,+Chennai,+Tamil+Nadu+600042&output=embed"
            width="100%"
            height="420"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          {/* ── 1. Top Row: Brand & Horizontal Nav + Socials ── */}
          <div className="footer-header-row">
            <div className="footer-brand-box">
              <a className="footer-brand-logo" href="#home">
                <span className="footer-brand-monogram">SK</span>
                <div className="footer-brand-text">
                  <span className="footer-brand-name">FASHION TAILORS</span>
                  </div>
              </a>
              <p className="footer-brand-desc">
                Bespoke Bridal, Designer Blouse & Haute Couture Studio
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
                  { label: 'Custom Enquiry',  href: undefined },
                ].map(({ label, href }) => (
                  href
                    ? <a key={label} href={href}>{label}</a>
                    : <button key={label} onClick={custom}>{label}</button>
                ))}
              </nav>

              <div className="footer-social-icons">
                <a href="https://www.instagram.com/sk_fashion_studio/" target="_blank" rel="noreferrer" aria-label="Follow SK Fashion Studio on Instagram" title="Follow us on Instagram">
                  <Instagram size={17} />
                </a>
                <a href="https://wa.me/919884016637" target="_blank" rel="noreferrer" aria-label="WhatsApp" title="Chat on WhatsApp">
                  <MessageCircle size={17} />
                </a>
                <a href="tel:+919884016637" aria-label="Call SK Fashion Tailors" title="Call Atelier">
                  <Phone size={17} />
                </a>
              </div>
            </div>
          </div>

          {/* ── 2. Middle Row: Spacious Contact & Location Tiles ── */}
          <div className="footer-cards-grid">
            <div className="footer-card">
              <div className="footer-card-icon"><Sparkles size={18} /></div>
              <div className="footer-card-body">
                <span className="footer-card-label">Founder &amp; Head Designer</span>
                <span className="footer-card-value">Mrs. S. K. Gayatri Devi &amp; Team</span>
                <span className="footer-card-sub">30+ Years of Bespoke Craftsmanship</span>
              </div>
            </div>

            <a href="tel:+919884016637" className="footer-card footer-card--clickable">
              <div className="footer-card-icon"><Phone size={18} /></div>
              <div className="footer-card-body">
                <span className="footer-card-label">Phone Consultation</span>
                <span className="footer-card-value">+91 98840 16637</span>
                <span className="footer-card-sub">Mon – Sat: 10:30 AM – 8:30 PM</span>
              </div>
            </a>

            <a href="https://wa.me/919884016637" target="_blank" rel="noreferrer" className="footer-card footer-card--clickable">
              <div className="footer-card-icon"><MessageCircle size={18} /></div>
              <div className="footer-card-body">
                <span className="footer-card-label">WhatsApp Studio</span>
                <span className="footer-card-value">+91 98840 16637</span>
                <span className="footer-card-sub">Instant Design Quotes &amp; Queries</span>
              </div>
            </a>

            <a href="mailto:bespoke@skfashiontailors.in" className="footer-card footer-card--clickable">
              <div className="footer-card-icon"><Heart size={18} /></div>
              <div className="footer-card-body">
                <span className="footer-card-label">Email Atelier</span>
                <span className="footer-card-value">bespoke@skfashiontailors.in</span>
                <span className="footer-card-sub">Send References &amp; Fabric Details</span>
              </div>
            </a>

            <div className="footer-card">
              <div className="footer-card-icon"><MapPin size={18} /></div>
              <div className="footer-card-body">
                <span className="footer-card-label">Boutique Studio</span>
                <span className="footer-card-value">30A, Sheshadripuram 1st Main Rd, Chennai</span>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=B+Park+Avenue+Street%2C+30A%2C+Sheshadripuram+1st+Main+Rd%2C+Seshadripuram%2C+Velachery%2C+Chennai%2C+Tamil+Nadu+600042"
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
                <span className="footer-card-value">Mon – Sat: 10:30 AM – 8:30 PM</span>
                <span className="footer-card-sub">Sundays by Prior Appointment</span>
              </div>
            </div>
          </div>

          {/* ── 3. Bottom Row: Copyright & Tagline ── */}
          <div className="footer-bottom-bar">
            <span className="footer-copyright">© 2026 SK Fashion Tailors. All Rights Reserved.</span>
            <span className="footer-tag">Crafting bespoke bridal & couture elegance, stitch by stitch.</span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {form && <Consultation close={() => setForm(false)} />}
      </AnimatePresence>
    </>
  );
}
