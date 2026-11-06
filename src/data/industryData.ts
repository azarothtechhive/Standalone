export interface IndustryExpertiseItem {
  id: string;
  industry: string;
  subtitle: string;
  challenge: string;
  architecture: string;
  outcome: string;
  iconName: string;
}

export const industryExpertiseData: IndustryExpertiseItem[] = [
  {
    id: 'retail-commerce',
    industry: 'Retail & Digital Commerce',
    subtitle: 'E-Commerce Platforms & Omnichannel Integration',
    challenge: 'Disconnected sales channels, inconsistent inventory visibility, and manual order processing created friction across the customer journey.',
    architecture: 'We design integrated commerce solutions connecting online storefronts, inventory systems, order management, payment gateways, and customer engagement tools.',
    outcome: 'Streamlined order fulfilment, clearer inventory visibility, and a more consistent shopping experience across digital channels.',
    iconName: 'ShoppingBag',
  },
  {
    id: 'education-learning',
    industry: 'Education & Digital Learning',
    subtitle: 'Learning Platforms & Content Integration',
    challenge: 'Fragmented learning channels, manual certification tracking, and inconsistent learner engagement made training delivery difficult to manage.',
    architecture: 'We build centralized learning platforms with virtual classrooms, personalized learning paths, automated certification, and progress tracking.',
    outcome: 'Simplified learning administration, improved learner visibility, and streamlined certification management with accessible training records.',
    iconName: 'GraduationCap',
  },
  {
    id: 'healthcare-tech',
    industry: 'Healthcare & Health Technology',
    subtitle: 'Secure Applications & Healthcare Data Interoperability',
    challenge: 'Disconnected applications, fragmented patient information, and manual administrative workflows limited information accessibility and operational efficiency.',
    architecture: 'We build secure healthcare applications with integrated patient records, appointment management, workflow automation, and interoperable data exchange.',
    outcome: 'Improved information accessibility, reduced administrative friction, and enabled more coordinated workflows across healthcare services.',
    iconName: 'HeartPulse',
  },
  {
    id: 'supply-chain',
    industry: 'Supply Chain & Logistics',
    subtitle: 'Workflow Automation & Tracking Systems',
    challenge: 'Limited shipment visibility, disconnected tracking systems, and manual coordination made logistics operations difficult to monitor and optimise.',
    architecture: 'We integrate shipment tracking, inventory management, route visibility, automated notifications, and operational reporting into connected software workflows.',
    outcome: 'Enhanced shipment visibility, improved coordination, and enabled faster, more informed operational decisions across logistics processes.',
    iconName: 'Truck',
  },
  {
    id: 'erp-business',
    industry: 'ERP & Business Management Systems',
    subtitle: 'ERP Development, Customisation & Systems Integration',
    challenge: 'Siloed business applications, duplicated data, and disconnected finance, inventory, and operational workflows reduced efficiency and reporting accuracy.',
    architecture: 'We develop and integrate business management solutions connecting finance, procurement, inventory, sales, reporting, and other core business functions.',
    outcome: 'Centralized business information, streamlined cross-functional workflows, and improved operational visibility for more informed decision-making.',
    iconName: 'Layers',
  },
];
