// Single source of truth for Delhi Photo Studio BTH.
//
// The EDITABLE content (studio info, photos, copy) now lives in
//   src/content/site.content.json
// which is committed to git and bundled into every deploy. This means edits
// persist on any host (including Vercel) with NO cloud storage/database/token
// and can never "vanish on cold start". This module derives the typed,
// computed values (map links, tel:, full address) the app consumes — its
// exported shapes are unchanged, so nothing downstream breaks.

import content from '../content/site.content.json'

const c = content.studio

const fullAddress = `${c.address.line1}, ${c.address.line2}, ${c.address.line3}, ${c.address.city}, ${c.address.state} ${c.address.pin}`

export const STUDIO = {
  name: c.name,
  category: c.category,
  tagline: c.tagline,
  serviceArea: c.serviceArea,
  address: {
    line1: c.address.line1,
    line2: c.address.line2,
    line3: c.address.line3,
    city: c.address.city,
    state: c.address.state,
    pin: c.address.pin,
    full: fullAddress,
  },
  phone: {
    display: c.phoneDisplay,
    dial: c.phoneDial,
    tel: `tel:${c.phoneDial}`,
  },
  rating: {
    value: c.rating.value,
    count: c.rating.count,
  },
  links: {
    whatsappCatalog: c.whatsappCatalog,
    directions:
      'https://www.google.com/maps/dir/?api=1&destination=' +
      encodeURIComponent(`${c.name}, ${fullAddress}`),
    mapEmbed:
      'https://www.google.com/maps?q=' +
      encodeURIComponent(`${c.name}, ${c.address.line2}, ${c.address.city}, ${c.address.state} ${c.address.pin}`) +
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

// Eight cinematic service groupings — sourced from editable content.
export const SERVICE_CARDS: ServiceCard[] = content.serviceCards

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

// Replaceable image slots — edit src/content/site.content.json to change.
export const GALLERY: GalleryItem[] = content.gallery

// Path to the studio "about" portrait (editable in content JSON).
export const STUDIO_VISUAL: string = content.studioVisual

// Only the review characteristics explicitly provided by the studio material.
export const REVIEW_HIGHLIGHTS = content.reviewHighlights

// Scroll-story labels shown during the exploded-camera sequence.
export const CAMERA_LABELS = ['LIGHT', 'FOCUS', 'FRAME', 'DETAIL', 'MEMORY'] as const
