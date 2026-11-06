export interface ValuePrinciple {
  number: string;
  title: string;
  description: string;
  iconName: string;
}

export const companyInfo = {
  name: 'Azaroth Tech-Hive',
  // tagline: 'Enterprise software engineering for complex systems.',
  logoUrl: '/Logo.png',
  faviconUrl: '/Favicon.png',
  description: 'Azaroth Tech-Hive delivers practical software engineering solutions that help enterprises overcome technical challenges, improve operations, and turn ideas into dependable digital products. We partner with organizations to build systems that scale, evolve, and drive meaningful business outcomes.',
  establishedYear: '2024',
  headquarters: {
    title: 'Chennai — Head Office',
    address: 'Malaviya Avenue, Thiruvanmiyur, Chennai, India',
    phone: '+91 6379480931',
    whatsapp: '+916379480931',
    email: 'hello@azaroth-techhive.com',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=24+Malaviya+Avenue+Thiruvanmiyur+Chennai+India',
  },
  socialLinks: [] as { label: string; url: string; icon: string }[],
};

// Metrics removed per client requirement - unverified percentages not to be published
// Client to supply verified figures before re-enabling metrics section

export const companyVisionMission = {
  vision: {
    title: 'Our Vision',
    statement: 'To shape a future where thoughtful software engineering and continuous innovation enable businesses of every size to solve complex challenges, embrace new opportunities, and achieve sustainable growth.',
  },
  mission: {
    title: 'Our Mission',
    statement: 'To engineer practical, reliable, and adaptable software solutions that simplify complex challenges, improve everyday operations, and empower businesses to innovate, evolve, and grow with confidence.',
  },
};

export const ourValuesPrinciples: ValuePrinciple[] = [
  {
    number: '01',
    title: 'Purpose-Driven Innovation',
    description: 'We embrace innovation with intention, creating solutions that address real business challenges, deliver practical value, and make technology more useful.',
    iconName: 'Lightbulb',
  },
  {
    number: '02',
    title: 'Engineering Excellence',
    description: 'We prioritise clean code, sound architecture, rigorous testing, and dependable implementation to build software that performs reliably and stands the test of time.',
    iconName: 'ShieldCheck',
  },
  {
    number: '03',
    title: 'Simplicity by Design',
    description: 'We turn complexity into clarity, designing intuitive solutions that are easier to use, maintain, integrate, and evolve.',
    iconName: 'Maximize2',
  },
  {
    number: '04',
    title: 'Trust & Accountability',
    description: 'We value transparency, responsible engineering, and clear communication. We take ownership of our work and remain committed to delivering on our promises.',
    iconName: 'CheckCircle',
  },
  {
    number: '05',
    title: 'Collaborative Partnership',
    description: 'We work closely with clients and teams to understand their goals, exchange ideas, solve challenges, and create solutions that reflect real needs.',
    iconName: 'Users',
  },
  {
    number: '06',
    title: 'Continuous Evolution',
    description: 'We keep learning, adapting, and refining our approach to help software remain relevant, resilient, and ready for what comes next.',
    iconName: 'TrendingUp',
  },
];
