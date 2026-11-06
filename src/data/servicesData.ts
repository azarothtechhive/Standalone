import { ServiceOffering, SlaTier } from '../types';

export const serviceOfferings: ServiceOffering[] = [
  {
    id: 'serv-digital-transformation',
    slug: 'digital-transformation-technology-solutions',
    title: 'Enterprise Digital Transformation & Technology Solutions',
    category: 'Architecture & Modernization',
    badge: 'Enterprise Core',
    description: 'Azaroth Tech-Hive empowers enterprises to build, modernize, and scale their software ecosystems through strategic engineering and architectural expertise. We transform complex applications, streamline system integrations, strengthen data management, and optimize critical business systems through disciplined engineering practices—delivering secure, resilient, and adaptable software designed for operational continuity and long-term growth.',
    bestFor: 'Teams modernising legacy systems, integrating critical applications, or rebuilding a platform foundation.',
    capabilities: [
      'Technology Strategy & Solution Architecture',
      'Application Modernization & Software Evolution',
      'End-to-End Software Engineering & Modernization',
      'Enterprise Applications & Systems Integration',
      'Intelligent Automation & Data Solutions',
    ],
    outcomes: [
      'Modernized application foundations supporting low-risk, staged deployment',
      'Secure, interconnected enterprise API data exchange',
      'Security and compliance controls aligned to standards such as ISO 27001 and SOC 2',
    ],
    deliverables: [
      'Comprehensive Solution Architecture Blueprints',
      'Production-Grade Microservices & Modernized Repositories',
      'CI/CD Pipeline Automation & Telemetry Dashboards',
    ],
    metrics: [
      { label: 'Delivery focus', value: 'Architecture + execution' },
      { label: 'Typical scope', value: 'Platform modernization' },
      { label: 'Outcome', value: 'Clearer roadmap' },
    ],
    iconName: 'Cpu',
  },
  {
    id: 'serv-strategic-partnership',
    slug: 'strategic-partnership-consulting',
    title: 'Strategic Partnership & Consulting',
    category: 'Advisory & Continuous Improvement',
    badge: 'Executive Advisory',
    description: 'Build a stronger technology foundation with strategic guidance and hands-on engineering collaboration. We work alongside your team to clarify technical direction, improve software architecture, strengthen development practices, and turn business priorities into actionable technology initiatives. From evaluating technology choices to evolving existing products and addressing security risks, we help you make informed decisions, improve delivery, and create lasting value from your software investments.',
    bestFor: 'Organisations that need a clearer technical direction before committing to a build or platform investment.',
    capabilities: [
      'Strategic Technology Advisory & Roadmap Planning',
      'Software Architecture & Engineering Guidance',
      'Collaborative Engineering Partnership',
      'Application Modernisation & Continuous Improvement',
      'Product Innovation, Prototyping & R&D Support',
      'Software Security & Risk Management',
    ],
    outcomes: [
      'Clarified technical roadmaps tied to measurable business goals',
      'Reduced architectural debt and stronger code quality governance',
      'Improved long-term total cost of ownership (TCO) through disciplined engineering',
    ],
    deliverables: [
      'Technology Strategy Roadmaps & Architectural Recommendations',
      'Security Posture & Vulnerability Remediation Guides',
      'Prototyping Spikes & Architectural Validation Reports',
    ],
    iconName: 'Compass',
  },
  {
    id: 'serv-on-demand-workforce',
    slug: 'on-demand-workforce-solutions',
    title: 'On-Demand Engineering Workforce Solutions',
    category: 'Dedicated Teams & Staff Augmentation',
    badge: 'Rapid Mobilization',
    description: 'Strengthen your software development capabilities with experienced engineers, solution architects, and quality specialists across diverse technologies and platforms. Our flexible engagement models, structured onboarding, and transparent delivery practices help teams overcome technical challenges, accelerate development, improve software quality, and bring ideas to life efficiently.',
    bestFor: 'Teams that need additional engineering capacity, specialist skills, or a dedicated delivery pod.',
    capabilities: [
      'Dedicated Specialist Teams',
      'Flexible Team Scaling & Staff Augmentation',
      'Precision Skills & Expertise Matching',
      'Rapid Team Mobilisation & Onboarding',
    ],
    outcomes: [
      'Engineers available through a structured onboarding and ramp-up plan',
      'Senior engineers integrated into your sprint ceremonies and workflows',
      'Reduced recruitment overhead with flexible scaling aligned to delivery horizons',
    ],
    deliverables: [
      'Dedicated Senior Engineering Pods (Architects, Full-Stack, QA, DevOps)',
      'Transparent Sprint Velocity Reports & Git Commits',
      'Direct Async & Real-Time Communication via Slack/Teams',
    ],
    metrics: [
      { label: 'Engagement pattern', value: 'Dedicated pod' },
      { label: 'Team fit', value: 'Role-based matching' },
      { label: 'Delivery rhythm', value: 'Sprint-based' },
    ],
    iconName: 'Users',
  },
  {
    id: 'serv-business-process-management',
    slug: 'business-process-management-operations',
    title: 'Business Process Management & Operations',
    category: 'Process Automation & Real-Time Insights',
    badge: 'Efficiency Engine',
    description: 'Transform complex workflows into streamlined digital processes with intelligent automation, integrated applications, and actionable real-time insights. From reducing manual effort to connecting fragmented systems, we engineer practical software solutions that improve efficiency, enhance visibility, and help businesses operate smarter.',
    bestFor: 'Operations teams working with manual handoffs, fragmented systems, or limited process visibility.',
    capabilities: [
      'Workflow Optimisation & Process Re-engineering',
      'Intelligent Automation & API Integration',
      'Application Monitoring, Reliability & Operational Support',
      'Document Digitisation & Approval Workflow Automation',
      'Operational Analytics, Performance Insights & Continuous Improvement',
    ],
    outcomes: [
      'Reduced manual rework and data-entry friction through automation',
      'Process automation designed to shorten end-to-end cycle turnaround times',
      'Automated observability and real-time operational alerts',
    ],
    deliverables: [
      'Intelligent Workflow Orchestration Engines',
      'Automated Document & Approval Reconciliation Pipelines',
      'Real-Time Operational Analytics & Executive Dashboards',
    ],
    iconName: 'Workflow',
  },
];

export interface EngagementModel {
  id: string;
  name: string;
  summary: string;
  bestFor: string;
  structure: string;
  team: string;
  governance: string;
  support: string;
  highlight?: boolean;
}

export const engagementModels: EngagementModel[] = [
  {
    id: 'project-delivery',
    name: 'Project Delivery',
    summary:
      'A defined scope, planned in milestones and delivered against agreed acceptance criteria.',
    bestFor: 'A clear outcome with a bounded scope.',
    structure:
      'Milestone-based delivery with a written scope and acceptance criteria.',
    team: 'A focused project team assembled around the required skills.',
    governance:
      'Scope reviews, milestone demonstrations, and delivery checkpoints.',
    support:
      'Handover and post-release support as defined in the written agreement.',
  },
  {
    id: 'dedicated-engineering-pod',
    name: 'Dedicated Engineering Pod',
    summary:
      'An ongoing engineering team that works inside your delivery rhythm and priorities.',
    bestFor:
      'Continuous product development or additional engineering capacity.',
    structure: 'Sprint-based engagement with a role-matched team.',
    team: 'Engineers, QA, and architecture support matched to your stack.',
    governance:
      'Sprint planning, demonstrations, and transparent progress reporting.',
    support: 'Ongoing development and support as agreed for the engagement.',
    highlight: true,
  },
  {
    id: 'advisory-architecture-retainer',
    name: 'Advisory & Architecture Retainer',
    summary:
      'Technical guidance for direction, architecture, and delivery decisions.',
    bestFor:
      'Teams that need experienced guidance without a full build engagement.',
    structure: 'Scheduled advisory sessions and architecture reviews.',
    team: 'Architecture and engineering guidance from our practice leads.',
    governance:
      'Roadmaps, architecture recommendations, and written review notes.',
    support: 'Periodic check-ins and follow-up guidance as agreed.',
  },
];

export const slaMatrixData: SlaTier[] = [
  {
    tierName: 'Standard',
    highlight: false,
    responseTime: 'Business hours triage and updates',
    availabilityTarget: 'Operational support aligned to agreed scope',
    leadArchitectSupport: 'Monthly advisory check-ins',
    dedicatedEngineeringPod: 'Shared pod model',
    securityAuditsIncluded: 'Baseline review schedule',
    deploymentCadence: 'Planned release windows',
  },
  {
    tierName: 'Business',
    highlight: false,
    responseTime: 'Priority review within agreed response windows',
    availabilityTarget: 'Support model matched to critical workflows',
    leadArchitectSupport: 'Bi-weekly architecture syncs',
    dedicatedEngineeringPod: 'Focused delivery pod',
    securityAuditsIncluded: 'Quarterly review cadence',
    deploymentCadence: 'Sprint-based release planning',
  },
  {
    tierName: 'Mission-Critical Enterprise',
    highlight: true,
    responseTime: 'Escalation handling within agreed critical paths',
    availabilityTarget: 'High-priority support aligned to critical operations',
    leadArchitectSupport: 'Named architecture partner',
    dedicatedEngineeringPod: 'Multi-pod engagement model',
    securityAuditsIncluded: 'Risk review and remediation cadence',
    deploymentCadence: 'Delivery aligned to critical roadmap milestones',
  },
];
