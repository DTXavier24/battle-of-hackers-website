/**
 * Site-wide configuration. Edit this file to update event details or to
 * enable the "Join CTF" button once the CTFd instance is live.
 */
export const site = {
  name: 'APU Battle of Hackers',
  host: {
    short: 'FSEC-SS',
    full: 'APU Forensic & Cybersecurity Research Centre Student Section',
    university: 'Asia Pacific University of Technology & Innovation',
  },

  /** Set to the CTFd URL (e.g. "https://ctf.example.edu") to enable the button. */
  ctfUrl: null as string | null,

  event: {
    day: '14',
    month: 'November',
    year: '2026',
    time: '8:30 AM to 6:00 PM',
    mode: 'Hybrid, on campus and online',
    venue: 'APU Campus, Kuala Lumpur',
    audience: 'Open to local and international students',
  },

  socials: [
    { label: 'Instagram', href: 'https://www.instagram.com/apu_fsec.ss/' },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/company/forensic-security-research-center-student-section-apu/',
    },
    { label: 'Discord', href: 'https://discord.com/invite/U7asN8gmV9' },
    { label: 'Email', href: 'mailto:fsec.ss@gmail.com' },
  ],
} as const;
