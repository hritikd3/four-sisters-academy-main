import { useState, useEffect, useRef } from 'react'

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwABol6_OifSqhJ2HvW0lW3L1V3oLb0AzzCQh8gro4HIZr1c_cIzP5sfMawvgkQeOAA/exec'

const getIP = async () => {
  try {
    const res = await fetch('https://api.ipify.org?format=json')
    const data = await res.json()
    return data.ip
  } catch (e) {
    return 'Unknown'
  }
}

// ─── Typewriter Hook ───────────────────────────────────────────────────────────
function useTypewriter(phrases, typingSpeed = 80, pauseTime = 2000, deletingSpeed = 40) {
  const [displayed, setDisplayed] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const current = phrases[phraseIndex]
    let timeout

    if (!isDeleting && charIndex <= current.length) {
      timeout = setTimeout(() => setCharIndex(c => c + 1), typingSpeed)
      setDisplayed(current.slice(0, charIndex))
    } else if (!isDeleting && charIndex > current.length) {
      timeout = setTimeout(() => setIsDeleting(true), pauseTime)
    } else if (isDeleting && charIndex >= 0) {
      timeout = setTimeout(() => setCharIndex(c => c - 1), deletingSpeed)
      setDisplayed(current.slice(0, charIndex))
    } else {
      setIsDeleting(false)
      setPhraseIndex(i => (i + 1) % phrases.length)
    }

    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, phraseIndex, phrases, typingSpeed, pauseTime, deletingSpeed])

  return displayed
}

// ─── Scroll Reveal Hook ────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible')
      })
    }, { threshold: 0.12 })
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

// ─── Counter Component ─────────────────────────────────────────────────────────
function Counter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const startTime = Date.now()
        const tick = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(eased * end))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

// ─── Floating Petals ───────────────────────────────────────────────────────────
function FloatingPetals() {
  const petals = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${8 + Math.random() * 16}px`,
    delay: `${Math.random() * 8}s`,
    duration: `${8 + Math.random() * 8}s`,
    color: i % 3 === 0 ? '#fda4af' : i % 3 === 1 ? '#fcd34d' : '#c4b5fd',
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {petals.map(p => (
        <div
          key={p.id}
          className="petal"
          style={{
            left: p.left,
            top: '-20px',
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: 0.2,
            animationName: 'petalFall',
            animationDuration: p.duration,
            animationDelay: p.delay,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          }}
        />
      ))}
    </div>
  )
}

// ─── Enquiry Form ──────────────────────────────────────────────────────────────
function EnquiryForm({ variant = 'hero' }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', age: '', profile: '', course: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    try {
      // Fetch IP with a 1-second timeout so it doesn't block submission
      const ipPromise = getIP()
      const timeoutPromise = new Promise(resolve => setTimeout(() => resolve('Timeout'), 1000))
      const ip = await Promise.race([ipPromise, timeoutPromise])

      const formData = new URLSearchParams()
      Object.entries(form).forEach(([key, val]) => formData.append(key, val))
      formData.append('ip', ip)

      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      })

      // Google Ads Conversion for Lead
      if (window.gtag) {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-18111723754/swL_CMjG3aAcEOrxq7xD',
          'value': 1.0,
          'currency': 'INR'
        });
      }

      setSubmitted(true)
    } catch (error) {
      console.error('Submission error:', error)
      alert("Something went wrong while submitting your lead. Please try again or contact us directly on WhatsApp.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-green-600 mb-2">Thank You!</h3>
        <p className="text-gray-600">We'll call you within 2 hours for your <strong>FREE Demo Class</strong></p>
        <p className="text-sm text-gray-500 mt-2">Check WhatsApp for confirmation.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text" name="name" required placeholder="Your Full Name *"
          value={form.name} onChange={handleChange}
          className="form-input px-4 py-3 rounded-xl bg-white text-gray-800 placeholder-gray-400 text-sm"
        />
        <input
          type="tel" name="phone" required placeholder="Phone Number *"
          value={form.phone} onChange={handleChange}
          className="form-input px-4 py-3 rounded-xl bg-white text-gray-800 placeholder-gray-400 text-sm"
        />
      </div>
      <input
        type="email" name="email" required placeholder="Email Address *"
        value={form.email} onChange={handleChange}
        className="form-input px-4 py-3 rounded-xl bg-white text-gray-800 placeholder-gray-400 text-sm"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          name="age" required value={form.age} onChange={handleChange}
          className="form-input px-4 py-3 rounded-xl bg-white text-gray-700 text-sm cursor-pointer"
        >
          <option value="">Age Group *</option>
          <option>16 – 20 years</option>
          <option>21 – 25 years</option>
          <option>26 – 30 years</option>
          <option>31 – 35 years</option>
          <option>35+ years</option>
        </select>
        <select
          name="profile" required value={form.profile} onChange={handleChange}
          className="form-input px-4 py-3 rounded-xl bg-white text-gray-700 text-sm cursor-pointer"
        >
          <option value="">Current Profile *</option>
          <option>Student</option>
          <option>Homemaker</option>
          <option>Working Professional</option>
          <option>Freelancer</option>
          <option>Makeup Enthusiast</option>
          <option>Other</option>
        </select>
      </div>
      <select
        name="course" required value={form.course} onChange={handleChange}
        className="form-input px-4 py-3 rounded-xl bg-white text-gray-700 text-sm cursor-pointer"
      >
        <option value="">Interested In *</option>
        <option>Bridal Makeup Artist Course</option>
        <option>Professional Beauty Salon Course</option>
        <option>Nail Art & Extension Course</option>
        <option>All Courses Bundle</option>
        <option>Just Exploring</option>
      </select>
      <button
        type="submit"
        disabled={loading}
        className="cta-btn w-full py-4 rounded-xl text-white font-bold text-base tracking-wide disabled:opacity-70"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
            Submitting...
          </span>
        ) : '🎓 Book FREE Demo Class →'}
      </button>
      <p className="text-xs text-center text-gray-400">100% Free • No Spam • We respect your privacy</p>
    </form>
  )
}

// ─── Masterclass Modal ────────────────────────────────────────────────────────
function MasterclassModal({ onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', age: '', profile: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    try {
      const ipPromise = getIP()
      const timeoutPromise = new Promise(resolve => setTimeout(() => resolve('Timeout'), 1000))
      const ip = await Promise.race([ipPromise, timeoutPromise])

      const formData = new URLSearchParams()
      Object.entries(form).forEach(([key, val]) => formData.append(key, val))
      formData.append('course', 'Masterclass')
      formData.append('ip', ip)

      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      })

      // Google Ads Conversion for Lead (Masterclass)
      if (window.gtag) {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-18111723754/swL_CMjG3aAcEOrxq7xD',
          'value': 1.0,
          'currency': 'INR'
        });
      }

      setSubmitted(true)
    } catch (error) {
      console.error('Submission error:', error)
      alert("Something went wrong while submitting your lead. Please try again or contact us directly on WhatsApp.")
    } finally {
      setLoading(false)
    }

  }

  // Close on backdrop click
  const handleBackdrop = e => { if (e.target === e.currentTarget) onClose() }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: 'rgba(10,0,20,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-lg max-h-[95vh] overflow-y-auto rounded-3xl shadow-2xl"
        style={{ background: 'linear-gradient(160deg, #fff1f2 0%, #fdf2f8 50%, #fffbeb 100%)' }}>

        {/* Rainbow top bar */}
        <div className="h-1.5 w-full rounded-t-3xl"
          style={{ background: 'linear-gradient(90deg, #e11d48, #f59e0b, #7c3aed, #e11d48)', backgroundSize: '200%', animation: 'shimmer 2.5s linear infinite' }} />

        {/* Close btn */}
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 shadow transition-all text-lg font-bold z-10">
          ✕
        </button>

        <div className="p-6 md:p-8">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">You're Registered!</h3>
              <p className="text-gray-600 mb-1">See you on <strong>27th April, Monday!</strong></p>
              <p className="text-sm text-gray-500">We'll WhatsApp you the venue & timing details shortly.</p>
              <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-800">
                🎁 Your <strong>Free Gift worth ₹499</strong> is reserved. Bring this confirmation on the day!
              </div>
              <button onClick={onClose}
                className="mt-6 cta-btn px-8 py-3 rounded-full text-white font-bold text-sm">
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Event header */}
              <div className="text-center mb-5">
                <span className="inline-flex items-center gap-1.5 bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-3">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse inline-block" />
                  1-Day Masterclass
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                  Learn the Art of <span className="text-gradient-rose">Professional Makeup</span>
                </h2>
                <p className="text-gray-500 text-sm mt-1">by <strong className="text-rose-700">Four Sisters Makeup Academy</strong>, Indore</p>
              </div>

              {/* Event details strip */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { icon: '📅', label: 'Date', value: '27th April' },
                  { icon: '📆', label: 'Day', value: 'Monday' },
                  { icon: '📍', label: 'Venue', value: 'Sarthak Park' },
                ].map((d, i) => (
                  <div key={i} className="bg-white rounded-xl p-2.5 text-center shadow-sm border border-rose-100">
                    <div className="text-xl mb-0.5">{d.icon}</div>
                    <div className="text-xs text-gray-400">{d.label}</div>
                    <div className="text-xs font-bold text-gray-800 leading-tight">{d.value}</div>
                  </div>
                ))}
              </div>

              {/* Full address */}
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5 mb-4">
                <span className="text-base flex-shrink-0">📌</span>
                <span className="text-xs text-rose-800"><strong>Singapore Sarthak Business Park, 1st Floor, Indore</strong></span>
              </div>

              {/* What you'll learn — from poster */}
              <div className="bg-white rounded-2xl p-4 mb-4 border border-rose-100 shadow-sm">
                <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-3">What You'll Learn in 1 Day 🎓</p>
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-3">
                  {[
                    { icon: '👰', text: 'Bridal Makeup' },
                    { icon: '💇‍♀️', text: 'Bridal Hairstyle' },
                    { icon: '🥻', text: 'Bridal Draping' },
                    { icon: '💼', text: 'Business Knowledge' },
                    { icon: '📖', text: 'Theory Session' },
                    { icon: '📱', text: 'Social Media Tips' },
                    { icon: '📜', text: 'Certificate' },
                    { icon: '🎁', text: 'Free Gift Worth ₹499' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-800 font-medium">
                      <span className="w-6 h-6 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center text-xs flex-shrink-0">{item.icon}</span>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Free gift banner */}
              <div className="rounded-2xl p-3 mb-5 flex items-center gap-3"
                style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                <span className="text-3xl">🎁</span>
                <div>
                  <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">Exclusive Free Gift!</p>
                  <p className="text-sm font-extrabold text-amber-800">Worth ₹499 — For Every Registrant</p>
                  <p className="text-xs text-amber-700">Hurry! Seats are filling fast — Limited spots only</p>
                </div>
              </div>

              {/* Urgency */}
              <div className="flex items-center justify-center gap-2 mb-5 text-xs text-rose-700 font-semibold bg-rose-50 rounded-xl py-2">
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                Only a few seats remaining — Register NOW to secure yours!
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="name" required placeholder="Your Full Name *"
                    value={form.name} onChange={handleChange}
                    className="form-input px-4 py-3 rounded-xl bg-white text-gray-800 placeholder-gray-400 text-sm" />
                  <input type="tel" name="phone" required placeholder="WhatsApp Number *"
                    value={form.phone} onChange={handleChange}
                    className="form-input px-4 py-3 rounded-xl bg-white text-gray-800 placeholder-gray-400 text-sm" />
                </div>
                <input type="email" name="email" placeholder="Email Address (optional)"
                  value={form.email} onChange={handleChange}
                  className="form-input px-4 py-3 rounded-xl bg-white text-gray-800 placeholder-gray-400 text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <select name="age" required value={form.age} onChange={handleChange}
                    className="form-input px-4 py-3 rounded-xl bg-white text-gray-700 text-sm cursor-pointer">
                    <option value="">Age Group *</option>
                    <option>16 – 20 years</option>
                    <option>21 – 25 years</option>
                    <option>26 – 30 years</option>
                    <option>31 – 35 years</option>
                    <option>35+ years</option>
                  </select>
                  <select name="profile" required value={form.profile} onChange={handleChange}
                    className="form-input px-4 py-3 rounded-xl bg-white text-gray-700 text-sm cursor-pointer">
                    <option value="">Current Profile *</option>
                    <option>Student</option>
                    <option>Homemaker</option>
                    <option>Working Professional</option>
                    <option>Makeup Enthusiast</option>
                    <option>Other</option>
                  </select>
                </div>
                <button type="submit" disabled={loading}
                  className="cta-btn w-full py-4 rounded-xl text-white font-extrabold text-base tracking-wide disabled:opacity-70">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                      </svg>
                      Registering...
                    </span>
                  ) : '🎓 Register for FREE Masterclass + Claim Gift →'}
                </button>
                <p className="text-xs text-center text-gray-400">100% Free to attend · No hidden charges · Only for Indore</p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  useScrollReveal()
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [bannerVisible, setBannerVisible] = useState(true)
  const [masterclassOpen, setMasterclassOpen] = useState(false)

  const typewriterPhrases = [
    'Earn ₹30,000+ per month as a Makeup Artist',
    'Get Certified & Work with Real Clients',
    'Learn from Industry Experts in Indore',
    'Free Demo Class + Placement Support',
  ]
  const dynamicText = useTypewriter(typewriterPhrases, 70, 2200, 35)

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const clientImages = [
    'https://i.ibb.co/hFJ40sXx/IMG-1862.jpg',
    'https://i.ibb.co/GQtztBJ1/IMG-9207.jpg',
    'https://i.ibb.co/XkXxSmDm/IMG-5653.jpg',
    'https://i.ibb.co/d4gpkZcC/IMG-1863.jpg',
    'https://i.ibb.co/1tr5rxPm/IMG-5655.jpg',
    'https://i.ibb.co/twSYBCxw/IMG-5506.jpg',
    'https://i.ibb.co/RG20rwPr/IMG-8877.jpg',
    'https://i.ibb.co/nMsCSKNn/IMG-1831.jpg',
    'https://i.ibb.co/DNhXLvn/IMG-2684.jpg',
  ]

  const courses = [
    {
      icon: '💄',
      title: 'Professional Makeup Course',
      subtitle: '🔥 Most Popular',
      highlight: 'Basic to Advanced Level',
      color: 'from-rose-50 to-pink-50',
      accent: 'text-rose-600',
      border: 'border-rose-200',
      badge: 'bg-rose-100 text-rose-700',
      badgeBg: 'from-rose-500 to-pink-600',
      points: [
        'Bridal Makeup (HD & Airbrush)',
        'Sangeet Bridal Look',
        'Party Makeup',
        'No-Makeup Makeup Look',
        'Hairstyling',
        'Draping Techniques',
      ],
      perks: [
        'Detailed Study Notes',
        'Products for Practice (Provided)',
        'Certificate After Completion',
        '100% Hands-on Practice',
      ],
      duration: '2 Weeks Course',
      batch: '1:00 PM – 4:00 PM',
      originalFee: '₹30,000',
      fee: '₹20,000',
      savings: '₹10,000 OFF',
      savingsPct: '33%',
    },
    {
      icon: '✨',
      title: 'Makeup & Hair Classes',
      subtitle: '⭐ Academy Opening Offer',
      highlight: 'Special 50% OFF Deal',
      color: 'from-amber-50 to-yellow-50',
      accent: 'text-amber-700',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-700',
      badgeBg: 'from-amber-500 to-orange-500',
      points: [
        'Complete Makeup Techniques',
        'Hair Styling & Blow-Dry',
        'Party & Occasion Looks',
        'Skin Prep & Base Building',
        'Eye Makeup & Contouring',
        'Hairstyling & Updos',
      ],
      perks: [
        'FREE Draping Class Included',
        'Certificate After Completion',
        '100% Hands-on Practice',
        'Products for Practice',
      ],
      duration: 'Short-Term Course',
      batch: '11:00 AM – 8:00 PM',
      originalFee: '₹30,000',
      fee: '₹15,000',
      savings: '₹15,000 OFF',
      savingsPct: '50%',
    },
    {
      icon: '💅',
      title: '7-in-1 Beauty Bundle',
      subtitle: '🌟 Best Value Deal',
      highlight: '45-Day Special Offer',
      color: 'from-purple-50 to-violet-50',
      accent: 'text-purple-700',
      border: 'border-purple-200',
      badge: 'bg-purple-100 text-purple-700',
      badgeBg: 'from-purple-600 to-violet-600',
      points: [
        'Hair Chemical Treatments',
        'Beautician Course',
        'Nail Extension',
        'Lash Extension',
        'Hair Extension',
        'Makeup & Hairstyling',
      ],
      perks: [
        '7 Courses in ONE Bundle',
        'High-Quality Salon Products',
        'Certificate for Each Course',
        '100% Practical Training',
      ],
      duration: '45 Days',
      batch: '11:00 AM – 8:00 PM',
      originalFee: '₹1,00,000',
      fee: '₹60,000',
      savings: '₹40,000 OFF',
      savingsPct: '40%',
    },
  ]

  const benefits = [
    { icon: '🆓', title: 'FREE Demo Class', desc: 'Talk to our expert before enrolling — zero pressure' },
    { icon: '🎪', title: 'FREE Workshop', desc: 'Attend a live demo class before committing to the course' },
    { icon: '📜', title: 'Certified Training', desc: 'Industry-recognized certificate on course completion' },
    { icon: '👩‍🏫', title: 'Expert Mentors', desc: 'Learn from top working makeup artists of Indore' },
    { icon: '📸', title: 'Portfolio Building', desc: 'Professional photoshoot to launch your career' },
    { icon: '💼', title: 'Placement Support', desc: 'Job & freelance assistance after graduation' },
    { icon: '🔧', title: 'Hands-on Practice', desc: 'Daily live model practice, not just theory' },
    { icon: '💰', title: 'Easy EMI Options', desc: 'Flexible payment plans to make learning affordable' },
  ]

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Bridal Makeup Artist, Indore',
      text: 'Four Sisters changed my life! I was a homemaker with zero experience. Today I charge ₹15,000 per bridal booking. The training was so practical and real.',
      stars: 5,
      avatar: '👩',
    },
    {
      name: 'Ritu Patel',
      role: 'Salon Owner, Ujjain',
      text: 'I did the Beauty Salon course here and within 3 months opened my own salon. The course covered everything from facials to business management.',
      stars: 5,
      avatar: '💆‍♀️',
    },
    {
      name: 'Anjali Singh',
      role: 'Nail Artist, Bhopal',
      text: 'The nail art course is absolutely top-notch! I learned gel nails, 3D art, everything. Now I have 50+ regular clients. So worth it!',
      stars: 5,
      avatar: '💅',
    },
  ]

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">

      {/* ── MASTERCLASS MODAL ─────────────────────────── */}
      {masterclassOpen && <MasterclassModal onClose={() => setMasterclassOpen(false)} />}

      {/* ── ANNOUNCEMENT BANNER ───────────────────────── */}
      {bannerVisible && (
        <div className="fixed top-0 left-0 right-0 z-[60]"
          style={{ background: 'linear-gradient(90deg, #7c3aed 0%, #be123c 40%, #e11d48 60%, #f59e0b 100%)' }}>

          {/* Mobile layout: stacked */}
          <div className="sm:hidden px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium leading-snug">
                  <span className="text-yellow-300 animate-pulse mr-1">⚡</span>
                  <strong>Hurry up! Seats filling fast —</strong>{' '}
                  Join our{' '}
                  <span className="text-yellow-300 font-extrabold">1-Day Makeup Masterclass</span>
                  {' '}· 🎁 Free Gift worth ₹499 · 📅 27th April, Monday
                </p>
                <button
                  onClick={() => setMasterclassOpen(true)}
                  className="mt-2 w-full bg-white text-rose-700 hover:bg-yellow-50 font-extrabold text-xs px-4 py-2 rounded-full shadow-md transition-all duration-200"
                >
                  Register Free →
                </button>
              </div>
              {/* <button
                onClick={() => setBannerVisible(false)}
                className="flex-shrink-0 text-white/70 hover:text-white transition-colors text-base leading-none pt-0.5"
                aria-label="Close"
              >
                ✕
              </button> */}
            </div>
          </div>

          {/* Desktop layout: single row */}
          <div className="hidden sm:flex max-w-7xl mx-auto px-4 py-2.5 items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="flex-shrink-0 flex items-center gap-1 bg-white/20 border border-white/40 text-white text-xs font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                🔥 NEW
              </span>
              <div className="flex items-center gap-2 text-white text-sm font-medium flex-1 min-w-0">
                <span className="flex-shrink-0 text-yellow-300 animate-pulse">⚡</span>
                <p className="whitespace-normal">
                  <strong>Hurry up! Seats filling fast —</strong>{' '}
                  Join our{' '}
                  <span className="text-yellow-300 font-extrabold">1-Day Makeup Masterclass</span>
                  {' '}· Learn the Art of Makeup ·{' '}
                  <span className="hidden md:inline text-yellow-200">🎁 Free Gift worth ₹499 · </span>
                  <span className="font-bold">📅 27th April, Monday</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setMasterclassOpen(true)}
              className="flex-shrink-0 bg-white text-rose-700 hover:bg-yellow-50 font-extrabold text-sm px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              Register Free →
            </button>
            {/* <button
              onClick={() => setBannerVisible(false)}
              className="flex-shrink-0 text-white/70 hover:text-white transition-colors text-lg leading-none ml-1"
              aria-label="Close"
            >
              ✕
            </button> */}
          </div>
        </div>
      )}

      {/* ── STICKY HEADER ────────────────────────────── */}
      <header className={`fixed left-0 right-0 z-50 transition-all duration-300 ${bannerVisible ? 'top-[88px] sm:top-[40px]' : 'top-0'} ${headerScrolled ? 'shadow-lg bg-white/95 backdrop-blur-md py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <a href="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="Four Sisters Salon & Academy"
              className="h-12 md:h-16 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#courses" className="hover:text-rose-600 transition-colors">Courses</a>
            <a href="#gallery" className="hover:text-rose-600 transition-colors">Gallery</a>
            <a href="#about" className="hover:text-rose-600 transition-colors">About</a>
            <a href="#contact" className="hover:text-rose-600 transition-colors">Contact</a>
          </nav>
          <a
            href="#enroll"
            className="cta-btn px-5 py-2.5 rounded-full text-white text-sm font-semibold"
          >
            Free Demo Class
          </a>
        </div>
      </header>

      {/* ── HERO SECTION ─────────────────────────────── */}
      <section className={`relative min-h-screen flex items-center overflow-hidden transition-all duration-300 ${bannerVisible ? 'pt-44 sm:pt-28' : 'pt-16'}`}
        style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #fdf2f8 40%, #fffbeb 100%)' }}>
        <FloatingPetals />

        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-10 bg-rose-400 blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-64 h-64 rounded-full opacity-10 bg-amber-400 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: Headline + badges */}
            <div>
              {/* Urgency badge */}
              <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block"></span>
                <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Admissions Open — Limited Seats!</span>
              </div>

              {/* Main headline */}
              <h1 className="font-display text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold leading-tight text-gray-900 mb-4">
                Become a Certified Makeup Artist & Start Your Career in 30 Days
              </h1>

              <div className="typewriter-cursor text-rose-700 text-lg md:text-xl mb-6 leading-relaxed font-bold min-h-[2.8em] sm:min-h-[1.4em]">
                {dynamicText}
              </div>

              {/* Benefit badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  { icon: '🎓', text: 'FREE Demo Class' },
                  { icon: '🎪', text: 'FREE Workshop' },
                  { icon: '📜', text: 'Certified Course' },
                  { icon: '💼', text: 'Placement Help' },
                ].map((b, i) => (
                  <span key={i} className="flex items-center gap-1.5 bg-white border border-rose-200 rounded-full px-3 py-1.5 text-sm font-medium text-rose-800 shadow-sm">
                    <span>{b.icon}</span> {b.text}
                  </span>
                ))}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 max-w-sm">
                {[
                  { num: 500, suf: '+', label: 'Students Trained' },
                  { num: 8, suf: '+', label: 'Years of Excellence' },
                  { num: 98, suf: '%', label: 'Success Rate' },
                ].map((s, i) => (
                  <div key={i} className="text-center stat-card p-3 rounded-xl">
                    <div className="text-2xl font-extrabold text-rose-600">
                      <Counter end={s.num} suffix={s.suf} />
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Enquiry form */}
            <div id="enroll">
              <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-rose-100 relative overflow-hidden">
                {/* Form header shine */}
                <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl"
                  style={{ background: 'linear-gradient(90deg, #e11d48, #f59e0b, #7c3aed, #e11d48)', backgroundSize: '200%', animation: 'shimmer 2.5s linear infinite' }} />

                <div className="text-center mb-6">
                  <div className="text-3xl mb-2">✨</div>
                  <h2 className="font-display text-2xl font-bold text-gray-900">Book Your <span className="text-gradient-rose">FREE Session</span></h2>
                  <p className="text-sm text-gray-500 mt-1">Get a free counselling call within 2 hours!</p>
                </div>

                <EnquiryForm variant="hero" />
              </div>

              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="text-amber-500">★★★★★</span> 4.9/5 Rating
                </div>
                <div className="w-px h-4 bg-gray-300" />
                <div className="text-xs text-gray-500">500+ Happy Students</div>
                <div className="w-px h-4 bg-gray-300" />
                <div className="text-xs text-gray-500">Indore's #1 Academy</div>
              </div>
            </div>

          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-rose-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── URGENCY STRIP ────────────────────────────── */}
      <div style={{ background: 'linear-gradient(90deg, #be123c, #e11d48, #9f1239)' }} className="py-3 text-white text-center text-sm font-medium">
        <span className="animate-pulse inline-block mr-2">🔥</span>
        <strong>Hurry!</strong> New batch starts soon — Only <strong>8 seats remaining</strong>. Reserve yours now!
        <a href="#enroll" className="ml-4 inline-block bg-white text-rose-700 px-4 py-1 rounded-full text-xs font-bold hover:bg-rose-50 transition-colors">
          Enroll Now →
        </a>
      </div>

      {/* ── WHY CHOOSE US ─────────────────────────────── */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14 reveal">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-500 bg-rose-50 px-4 py-1.5 rounded-full">Why Four Sisters?</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-3">
              Everything You Need to{' '}
              <span className="text-gradient-rose">Launch Your Career</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">We don't just teach makeup — we build careers. Here's what makes our academy different from the rest.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {benefits.map((b, i) => (
              <div key={i} className="reveal course-card bg-gradient-to-br from-rose-50 to-white p-5 rounded-2xl text-center" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="text-3xl mb-3">{b.icon}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{b.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COURSES SECTION ───────────────────────────── */}
      <section id="courses" className="py-20" style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fffbeb 100%)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14 reveal">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full">Our Programs</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-3">
              World-Class Courses,{' '}
              <span className="text-gradient-gold">Real-World Results</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">Hands-on, industry-aligned courses taught by professionals — designed to make you job-ready from day one.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {courses.map((c, i) => (
              <div key={i} className={`reveal course-card bg-gradient-to-br ${c.color} rounded-3xl border ${c.border} relative overflow-hidden flex flex-col`} style={{ transitionDelay: `${i * 120}ms` }}>

                {/* Top gradient bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${c.badgeBg}`} />

                {/* Savings ribbon */}
                <div className={`absolute top-6 right-0 bg-gradient-to-r ${c.badgeBg} text-white text-xs font-extrabold px-4 py-1.5 rounded-l-full shadow-lg`}>
                  {c.savingsPct} OFF
                </div>

                <div className="p-6 flex flex-col flex-1">
                  {/* Subtitle badge */}
                  <span className={`inline-block ${c.badge} text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wide w-fit`}>
                    {c.subtitle}
                  </span>

                  <div className="text-4xl mb-2">{c.icon}</div>
                  <h3 className={`font-display text-xl font-bold ${c.accent} mb-0.5`}>{c.title}</h3>
                  <p className="text-xs text-gray-500 italic mb-4">{c.highlight}</p>

                  {/* Course includes */}
                  <div className="mb-3">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Course Includes:</p>
                    <ul className="space-y-1.5">
                      {c.points.map((p, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500 mt-0.5 flex-shrink-0 font-bold">✓</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* What you'll get */}
                  <div className="bg-white/60 rounded-xl p-3 mb-4">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">What You'll Get:</p>
                    <ul className="space-y-1">
                      {c.perks.map((p, j) => (
                        <li key={j} className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Batch timing */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <span>🕐</span>
                    <span>Batch Timing: <strong className="text-gray-700">{c.batch}</strong></span>
                  </div>

                  {/* Pricing block */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Duration</div>
                        <div className={`font-bold text-sm ${c.accent}`}>{c.duration}</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-0.5">
                          <span className="text-gray-400 line-through text-sm">{c.originalFee}</span>
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">{c.savings}</span>
                        </div>
                        <div className={`font-extrabold text-2xl ${c.accent}`}>{c.fee}<span className="text-sm font-normal text-gray-500">/-</span></div>
                      </div>
                    </div>
                  </div>

                  <a href="#enroll" className="mt-auto block text-center py-3 rounded-xl font-bold text-sm text-white cta-btn">
                    Enquire Now — It's FREE →
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Bundle note */}
          <div className="reveal mt-8 text-center">
            <div className="inline-block bg-white border-2 border-rose-200 rounded-2xl px-6 py-4 shadow-md">
              <p className="text-sm text-gray-600">
                🎁 <strong className="text-rose-700">Register Now</strong> and get a{' '}
                <strong className="text-green-600">FREE Draping Class</strong> absolutely free!{' '}
                <a href="#enroll" className="text-rose-600 font-bold underline">Book your FREE Demo Class →</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY / PROOF OF WORK ────────────────────── */}
      <section id="gallery" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14 reveal">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full">Our Work</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-3">
              Real Brides.{' '}
              <span className="text-gradient-purple">Real Transformations.</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">Every look is crafted with love, skill, and artistry. This is what our students learn to create.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {clientImages.map((src, i) => (
              <div
                key={i}
                className={`gallery-img rounded-2xl overflow-hidden reveal shadow-md ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
                style={{ transitionDelay: `${i * 80}ms`, aspectRatio: i === 0 ? 'auto' : '3/4' }}
              >
                <img
                  src={src}
                  alt={`Four Sisters Bridal Makeup ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-8 reveal">
            <a href="#enroll" className="cta-btn inline-block px-8 py-4 rounded-full text-white font-bold text-base">
              Learn to Create Looks Like These →
            </a>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────── */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #fdf2f8 100%)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14 reveal">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-500 bg-rose-50 px-4 py-1.5 rounded-full">Student Stories</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-3">
              <span className="text-gradient-rose">500+ Lives Changed</span> by Four Sisters
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="reveal bg-white rounded-3xl p-6 shadow-md border border-rose-50 relative overflow-hidden" style={{ transitionDelay: `${i * 120}ms` }}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-amber-400" />
                <div className="flex text-amber-400 text-lg mb-4">
                  {'★'.repeat(t.stars)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-xl">{t.avatar}</div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECOND CTA FORM SECTION ───────────────────── */}
      <section className="py-20 bg-white" id="register">
        <div className="max-w-3xl mx-auto px-4">
          <div className="reveal text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-green-600 bg-green-50 px-4 py-1.5 rounded-full">Limited Time Offer</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-3">
              Ready to Start Your{' '}
              <span className="text-gradient-rose">Glam Career?</span>
            </h2>
            <p className="text-gray-500">Fill in the form below. Our expert will call you for a <strong>FREE Counselling Session</strong> — no commitment needed.</p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {['FREE Counselling', 'FREE Demo Class', 'No Commitment', 'Expert Guidance'].map((item, i) => (
                <span key={i} className="flex items-center gap-1 text-sm text-green-700 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="reveal bg-white rounded-3xl shadow-xl p-8 border border-rose-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl"
              style={{ background: 'linear-gradient(90deg, #7c3aed, #e11d48, #f59e0b, #7c3aed)', backgroundSize: '200%', animation: 'shimmer 2.5s linear infinite' }} />
            <EnquiryForm variant="bottom" />
          </div>
        </div>
      </section>

      {/* ── CONTACT + MAP ─────────────────────────────── */}
      <section id="contact" className="py-20" style={{ background: 'linear-gradient(135deg, #1a0a10 0%, #2d0a1e 100%)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 reveal">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-400 bg-rose-900/30 px-4 py-1.5 rounded-full">Find Us</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-4 mb-3">
              Visit Us in <span className="text-gradient-gold">Indore</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Contact info */}
            <div className="reveal space-y-5">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-5 flex items-start gap-4 border border-white/10">
                <div className="w-10 h-10 bg-rose-600/30 rounded-xl flex items-center justify-center text-xl flex-shrink-0">📍</div>
                <div>
                  <div className="font-bold text-white mb-1">Our Location</div>
                  <div className="text-gray-300 text-sm leading-relaxed">AB Rd, LIG Square, Anoop Nagar<br />Indore, Madhya Pradesh 452011</div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-5 flex items-start gap-4 border border-white/10">
                <div className="w-10 h-10 bg-green-600/30 rounded-xl flex items-center justify-center text-xl flex-shrink-0">📞</div>
                <div>
                  <div className="font-bold text-white mb-1">Call / WhatsApp</div>
                  <a href="tel:7024824574" className="text-green-400 text-lg font-bold hover:text-green-300 transition-colors">+91 7024 824 574</a>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-5 flex items-start gap-4 border border-white/10">
                <div className="w-10 h-10 bg-amber-600/30 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🕐</div>
                <div>
                  <div className="font-bold text-white mb-1">Academy Hours</div>
                  <div className="text-gray-300 text-sm">Monday – Sunday: <span className="text-amber-400 font-semibold">11:00 AM – 8:00 PM</span></div>
                </div>
              </div>
              <a
                href="tel:7024824574"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 transition-colors text-white font-bold py-4 rounded-2xl text-base"
              >
                📞 Call Now for FREE Demo Class
              </a>
              <a
                href="https://wa.me/917024824574?text=Hi! I am interested in learning makeup at Four Sisters Academy. Please share details."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20c05a] transition-colors text-white font-bold py-4 rounded-2xl text-base"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>

            {/* Map */}
            <div className="reveal rounded-3xl overflow-hidden shadow-2xl border border-white/10" style={{ height: '380px' }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117755.30602824363!2d75.73803849726563!3d22.733692899999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fdd44bff8a4b%3A0xa28fcbb8ffeef7b6!2sSingapore%20Business%20Park!5e0!3m2!1sen!2sin!4v1776591163904!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Four Sisters Makeup Academy Location"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer className="bg-black text-gray-400 py-8 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          {/* <span className="text-2xl">👯‍♀️</span> */}
          <span className="font-display font-bold text-white text-lg">Four Sisters Makeup Academy</span>
        </div>
        <p className="text-xs">AB Rd, LIG Square, Anoop Nagar, Indore, MP 452011 · +91 7024 824 574</p>
        <p className="text-xs mt-2 text-gray-600 flex items-center justify-center gap-4">
          <span>© {new Date().getFullYear()} Four Sisters Makeup Academy. All rights reserved.</span>
          <a href="/privacy.html" className="underline hover:text-white transition-colors">Privacy Policy</a>
        </p>
      </footer>

      {/* ── WHATSAPP FLOAT BUTTON ─────────────────────── */}
      <a
        href="https://wa.me/917024824574?text=Hi! I am interested in the makeup courses at Four Sisters Academy. Can you please share details?"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
        aria-label="Chat on WhatsApp"
      >
        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      {/* ── STICKY BOTTOM CTA (Mobile) ────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div className="bg-white border-t border-rose-200 px-4 py-3 flex gap-3">
          <a href="tel:7024824574" className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-semibold text-sm">
            📞 Call Now
          </a>
          <a href="#enroll" className="flex-1 flex items-center justify-center gap-2 cta-btn text-white py-3 rounded-xl font-semibold text-sm">
            Free Demo Class
          </a>
        </div>
      </div>
    </div>
  )
}
