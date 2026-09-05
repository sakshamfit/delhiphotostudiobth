// Single source of truth for Delhi Photo Studio BTH.
// Only facts provided by the studio are used here — no invented claims.

export const STUDIO = {
  name: 'Delhi Photo Studio BTH',
  category: 'Wedding Photographer · Photography & Cinematography Studio',
  tagline: 'Every moment deserves to be remembered.',
  serviceArea: 'Bettiah & nearby areas, Bihar',
  address: {
    line1: 'SH 54, Shastri Nagar',
    line2: 'Chhoni Road',
    line3: 'Near Bettiah Church',
    city: 'Bettiah',
    state: 'Bihar',
    pin: '845438',
    full: 'SH 54, Shastri Nagar, Chhoni Road, Near Bettiah Church, Bettiah, Bihar 845438',
  },
  phone: {
    display: '073688 78786',
    dial: '+917368878786',
    tel: 'tel:+917368878786',
  },
  rating: {
    value: 4.5,
    count: 173,
  },
  links: {
    whatsappCatalog: 'https://wa.me/c/98526717546751',
    directions:
      'https://www.google.com/maps/dir/?api=1&destination=' +
      encodeURIComponent('Delhi Photo Studio BTH, SH 54, Shastri Nagar, Chhoni Road, Near Bettiah Church, Bettiah, Bihar 845438'),
    mapEmbed:
      'https://www.google.com/maps?q=' +
      encodeURIComponent('Delhi Photo Studio BTH, Chhoni Road, Bettiah, Bihar 845438') +
      '&output=embed',
  },
} as const

export const NAV = [
  { id: 'work', label: 'Work' },
  { id: 'services', label: 'Services' },
  { id: 'studio', label: 'Studio' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'contact', label: 'Contact' },
] as const

// Full service list exactly as supplied by the studio.
export const ALL_SERVICES = [
  'Wedding Photography',
  'Wedding Cinematography',
  'Wedding & Engagement Photography',
  'Pre-Wedding Photoshoots',
  'Candid Photography',
  'Destination Wedding Photography',
  'Bridal Photography',
  'Wedding Ceremony Photography',
  'Wedding Preparation Photography',
  'Wedding Albums',
  'Wedding Photo Packages',
  'Marriage Proposal Photography',
  'Wedding Rehearsal Photography',
  'Events & Parties',
  'Couples Photography',
  'Rural Wedding Photography',
  'Maternity & Newborn Photography',
  'Family & Group Photography',
  'Baby Photography',
  'Product Photography',
  'Property Photography',
  'Headshots & Portraits',
  'School Portraits',
  'Photo Booth Rentals',
  'Photo Editing',
] as const

export type ServiceCard = {
  no: string
  title: string
  desc: string
  image: string
  includes: string[]
}

// Eight cinematic service groupings, each mapped to real services above.
export const SERVICE_CARDS: ServiceCard[] = [
  {
    no: '01',
    title: 'Weddings',
    desc: 'Full ceremony coverage, candid storytelling and heirloom albums that hold the whole day.',
    image: '/images/gallery-wedding-1.jpg',
    includes: ['Wedding Photography', 'Candid Photography', 'Wedding Ceremony Photography', 'Wedding Albums'],
  },
  {
    no: '02',
    title: 'Pre-Weddings',
    desc: 'Cinematic pre-wedding and engagement shoots that begin your story before the vows.',
    image: '/images/gallery-prewedding-1.jpg',
    includes: ['Pre-Wedding Photoshoots', 'Wedding & Engagement Photography', 'Marriage Proposal Photography'],
  },
  {
    no: '03',
    title: 'Portraits',
    desc: 'Bridal, couple and individual portraits — headshots crafted with intent and light.',
    image: '/images/gallery-portrait-1.jpg',
    includes: ['Bridal Photography', 'Headshots & Portraits', 'Couples Photography', 'School Portraits'],
  },
  {
    no: '04',
    title: 'Events',
    desc: 'Parties, celebrations and gatherings captured with a photojournalist’s eye.',
    image: '/images/gallery-event-1.jpg',
    includes: ['Events & Parties', 'Photo Booth Rentals', 'Wedding Rehearsal Photography'],
  },
  {
    no: '05',
    title: 'Maternity',
    desc: 'Tender maternity, newborn and baby sessions — the first chapter, gently framed.',
    image: '/images/gallery-maternity-1.jpg',
    includes: ['Maternity & Newborn Photography', 'Baby Photography', 'Family & Group Photography'],
  },
  {
    no: '06',
    title: 'Products',
    desc: 'Clean, considered product and property photography for brands and spaces.',
    image: '/images/gallery-product-1.jpg',
    includes: ['Product Photography', 'Property Photography'],
  },
  {
    no: '07',
    title: 'Cinematography',
    desc: 'Wedding films and cinematic edits that move the way memory does.',
    image: '/images/gallery-cinema-1.jpg',
    includes: ['Wedding Cinematography', 'Destination Wedding Photography'],
  },
  {
    no: '08',
    title: 'Special Moments',
    desc: 'Rural weddings, preparations and the in-between moments most cameras miss.',
    image: '/images/gallery-special-1.jpg',
    includes: ['Rural Wedding Photography', 'Wedding Preparation Photography', 'Photo Editing'],
  },
]

export type GalleryItem = {
  id: string
  category: string
  title: string
  image: string
}

export const GALLERY_CATEGORIES = [
  'All',
  'Weddings',
  'Pre-Weddings',
  'Portraits',
  'Maternity',
  'Events',
  'Cinematography',
  'Products',
] as const

// Replaceable image slots — swap the /images/* files with real studio work.
export const GALLERY: GalleryItem[] = [
  { id: 'g1', category: 'Weddings', title: 'The Ceremony', image: '/images/gallery-wedding-1.jpg' },
  { id: 'g2', category: 'Weddings', title: 'Sacred Vows', image: '/images/gallery-wedding-2.jpg' },
  { id: 'g3', category: 'Pre-Weddings', title: 'Before The Vows', image: '/images/gallery-prewedding-1.jpg' },
  { id: 'g4', category: 'Portraits', title: 'The Bride', image: '/images/gallery-portrait-1.jpg' },
  { id: 'g5', category: 'Maternity', title: 'First Chapter', image: '/images/gallery-maternity-1.jpg' },
  { id: 'g6', category: 'Events', title: 'The Celebration', image: '/images/gallery-event-1.jpg' },
  { id: 'g7', category: 'Cinematography', title: 'Motion & Memory', image: '/images/gallery-cinema-1.jpg' },
  { id: 'g8', category: 'Products', title: 'Considered Detail', image: '/images/gallery-product-1.jpg' },
  { id: 'g9', category: 'Weddings', title: 'Candid Joy', image: '/images/gallery-special-1.jpg' },
  { id: 'g10', category: 'Portraits', title: 'Quiet Light', image: '/images/gallery-portrait-2.jpg' },
  { id: 'g11', category: 'Pre-Weddings', title: 'Golden Hour', image: '/images/gallery-prewedding-2.jpg' },
  { id: 'g12', category: 'Weddings', title: 'Together', image: '/images/gallery-wedding-3.jpg' },
]

// Only the review characteristics explicitly provided by the studio material.
export const REVIEW_HIGHLIGHTS = [
  { title: 'Good Service', body: 'Clients consistently note attentive, dependable service throughout the shoot.' },
  { title: 'Affordable Rates', body: 'Quality coverage offered at rates that clients describe as genuinely affordable.' },
  { title: 'Good Photo Quality', body: 'Sharp, well-crafted photographs that clients are proud to keep.' },
  { title: 'Polite & Experienced Team', body: 'A courteous, experienced team that puts people at ease on the day.' },
]

// Scroll-story labels shown during the exploded-camera sequence.
export const CAMERA_LABELS = ['LIGHT', 'FOCUS', 'FRAME', 'DETAIL', 'MEMORY'] as const
