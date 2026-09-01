import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const photos = [
  ['Our storefront', 'photo-1497366811353-6870744d04b2'],
  ['Inside the boutique', 'photo-1497215728101-856f4ea42174'],
  ['The makers’ table', 'photo-1497366412874-3415097a27e7'],
  ['Fabric & colour library', 'photo-1513519245088-0e12902e5a38'],
  ['The detail workspace', 'photo-1497215842964-222b430dc094']
];
const src = (id: string, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

export default function ShopExperience() {
  const [active, setActive] = useState<number | null>(null);
  useEffect(() => {
    document.querySelector<HTMLAnchorElement>('nav a[href="#gallery"]')?.setAttribute('href', '#shop-gallery');
  }, []);

  return (
    <>
      <section id="shop-gallery" className="shop-gallery">
        <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="shop-intro">
          <p className="eyebrow pink-text">VISIT OUR SPACE</p>
          <h2>Step inside<br /><i>SK Fashion Studio.</i></h2>
          <p>Take a glimpse into the space where ideas, fabrics and craftsmanship come together.</p>
        </motion.div>
        <div className="shop-grid">
          {photos.map(([title, id], i) => (
            <motion.button whileHover={{ scale: 1.015 }} onClick={() => setActive(i)} key={id} className="shop-photo">
              <img src={src(id)} alt={`${title} — SK Fashion Studio boutique space, Velachery Chennai`} loading="lazy" decoding="async" />
              <span>{title}</span>
            </motion.button>
          ))}
        </div>
      </section>
      <section className="owner-story">
        <motion.div className="owner-photo" initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <img src={src('photo-1573496359142-b8d87734a5a2')} alt="Karuna Kumari — Founder and Head Designer at SK Fashion Studio, Velachery Chennai" loading="lazy" decoding="async" />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <p className="eyebrow pink-text">THE HEART OF SK</p>
          <h2>About the Owner<br /><i>Karuna Kumari.</i></h2>
          <p>A fashion school graduate since 2016 with 8+ years of expertise in designing, tailoring, custom styling, and understanding the unique needs of every client.</p>
          <blockquote>“The most beautiful thing you can wear is a garment that feels truly like you.”</blockquote>
          <b>SK FASHION STUDIO<small>KARUNA KUMARI — FOUNDER &amp; HEAD DESIGNER</small></b>
        </motion.div>
      </section>
      <AnimatePresence>
        {active !== null && (
          <motion.div className="space-lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)}>
            <button onClick={() => setActive(null)}><X /></button>
            <button className="left" onClick={e => { e.stopPropagation(); setActive((active + photos.length - 1) % photos.length); }}><ChevronLeft /></button>
            <figure onClick={e => e.stopPropagation()}>
              <img src={src(photos[active][1], 1500)} alt={`${photos[active][0]} — SK Fashion Studio boutique, Velachery Chennai`} decoding="async" />
              <figcaption>{photos[active][0]}<span>{active + 1} / {photos.length}</span></figcaption>
            </figure>
            <button className="right" onClick={e => { e.stopPropagation(); setActive((active + 1) % photos.length); }}><ChevronRight /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
