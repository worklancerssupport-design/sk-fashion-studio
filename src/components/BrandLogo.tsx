import React from 'react';

type BrandSize = 'sm' | 'md' | 'lg';

interface BrandLogoProps {
  size?: BrandSize;
  color?: string;
  bare?: boolean;
  tag?: 'a' | 'div';
  href?: string;
  className?: string;
}

const SIZES: Record<BrandSize, { logo: number; text: number; gap: number; letter: string }> = {
  sm: { logo: 16, text: 11, gap: 8, letter: '0.16em' },
  md: { logo: 22, text: 14, gap: 14, letter: '0.18em' },
  lg: { logo: 30, text: 18, gap: 14, letter: '0.2em' },
};

export default function BrandLogo({
  size = 'md',
  color = '#ffffff',
  bare = false,
  tag = 'div',
  href,
  className = '',
}: BrandLogoProps) {
  const s = SIZES[size];

  const logoEl = (
    <span
      className="brand-logo"
      style={{
        width: s.logo,
        height: s.logo,
        backgroundColor: color,
        maskImage: "url('/sk_logo_alone.svg')",
        WebkitMaskImage: "url('/sk_logo_alone.svg')",
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        display: 'block',
        flexShrink: 0,
      }}
      role="img"
      aria-label="SK"
    />
  );

  const textEl = (
    <span
      style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: s.text,
        fontWeight: 300,
        letterSpacing: s.letter,
        textTransform: 'uppercase' as const,
        lineHeight: 1.2,
        fontStyle: 'normal',
        color,
        borderRight: 'none',
        paddingRight: 0,
      }}
    >
      FASHION STUDIO
    </span>
  );

  if (bare) {
    return (
      <>
        {logoEl}
        {textEl}
      </>
    );
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: s.gap,
    textDecoration: 'none',
    color,
    whiteSpace: 'nowrap',
  };

  const content = (
    <>
      {logoEl}
      {textEl}
    </>
  );

  if (tag === 'a') {
    return (
      <a href={href || '/'} style={containerStyle} className={className}>
        {content}
      </a>
    );
  }

  return (
    <div style={containerStyle} className={className}>
      {content}
    </div>
  );
}
