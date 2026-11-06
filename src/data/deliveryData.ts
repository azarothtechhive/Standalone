import { DeliveryStage } from '../types';

export const deliveryFrameworkMeta = {
  title: 'Our Delivery Framework',
  subtitle: 'AOur Approach to Engineering Excellence',
  description: 'A structured, collaborative approach that brings clarity to every stage of software development, ensuring solutions remain aligned with project goals, built on sound engineering practices, and adaptable to evolving needs.',
};

export const deliveryStages: DeliveryStage[] = [
  {
    stageNumber: 1,
    title: 'Discovery',
    tagline: 'Understanding Goals, Constraints & Direction',
    duration: 'Phase 01',
    description: 'We understand your goals, user needs, existing systems, and technical challenges to define clear requirements and establish the right direction for your project.',
    keyActivities: [
      'Comprehensive stakeholder goal mapping & user journey analysis',
      'Legacy software, systems integration, and API constraint review',
      'Clear requirements specification and scope boundaries',
      'Risk evaluation, security compliance, and success criteria definition',
    ],
    deliverables: [
      'Requirements & Project Scope Specification',
      'System Architecture Feasibility Assessment',
      'Baseline Delivery Horizon & Sprint Roadmap',
    ],
    qualityGates: [
      'Validated requirements sign-off',
      'Consensus on project targets and architecture boundaries',
    ],
  },
  {
    stageNumber: 2,
    title: 'Planning',
    tagline: 'Translating Needs into Practical Architecture',
    duration: 'Phase 02',
    description: 'We translate requirements into practical technical solutions, defining system architecture, technology choices, integrations, and a development roadmap built for long-term adaptability.',
    keyActivities: [
      'System blueprints, data models, and API contract design',
      'Selection of scalable frameworks, tools, and infrastructure stacks',
      'Third-party software integration mapping and security postures',
      'Development timeline, milestones, and release strategy planning',
    ],
    deliverables: [
      'Target Solution Architecture & Design Blueprints',
      'API Interface Contracts & Data Schemas',
      'Implementation Roadmap & Resource Plan',
    ],
    qualityGates: [
      'Architectural review approval',
      'Approved database & component boundaries',
    ],
  },
  {
    stageNumber: 3,
    title: 'Development',
    tagline: 'Disciplined Coding & Collaborative Execution',
    duration: 'Phase 03',
    description: 'We transform designs into functional software through disciplined coding, collaborative development, reusable components, and consistent engineering practices.',
    keyActivities: [
      'Sprint-based full-stack software development',
      'Clean architecture with modular, maintainable, and typed codebases',
      'Collaborative code reviews and automated CI pipeline runs',
      'Frequent iterative builds deployed to staging for continuous review',
    ],
    deliverables: [
      'Tested, deployable software increments',
      'Automated build scripts & code repositories',
      'Continuous progress demos and sprint updates',
    ],
    qualityGates: [
      'Passing unit & integration test suites',
      'Strict linting, code quality, and peer review sign-offs',
    ],
  },
  {
    stageNumber: 4,
    title: 'Testing',
    tagline: 'Functionality, Performance & Usability Validation',
    duration: 'Phase 04',
    description: 'We validate functionality, performance, security, compatibility, and usability to identify issues early and ensure the solution meets its intended requirements.',
    keyActivities: [
      'End-to-end regression testing and user scenario validation',
      'Load, stress, and latency performance benchmarking',
      'Security posture checks, vulnerability scans, and access control testing',
      'Cross-browser and responsive device compatibility verification',
    ],
    deliverables: [
      'Comprehensive QA Verification Report',
      'Performance Benchmark & Latency Telemetry Logs',
      'Security Compliance & Access Validation Audit',
    ],
    qualityGates: [
      'Exit criteria include no open high or critical severity defects',
      'Performance targets exercised under simulated operational load',
    ],
  },
  {
    stageNumber: 5,
    title: 'Deployment',
    tagline: 'Structured Rollout & Smooth Transition',
    duration: 'Phase 05',
    description: 'We implement solutions through structured deployment, system integration, data validation, and release management to ensure a smooth transition into operation.',
    keyActivities: [
      'Staged production rollout with blue/green deployment targeting zero-downtime cutovers where the platform allows',
      'Production database migrations, data consistency, and validation checks',
      'Live external systems integration and API verification',
      'Operational monitoring, rollback safeguards, and launch support',
    ],
    deliverables: [
      'Production Deployment & Operational Runbook',
      'Live Release Verification Sign-Off',
      'Active Telemetry & Real-Time Monitoring Dashboards',
    ],
    qualityGates: [
      'Data integrity validation complete',
      'Production health checks completed against agreed targets',
    ],
  },
  {
    stageNumber: 6,
    title: 'Support',
    tagline: 'Ongoing Reliability, Optimization & Evolution',
    duration: 'Phase 06',
    description: 'We provide ongoing maintenance, issue resolution, performance optimisation, and iterative enhancements to keep your software reliable, relevant, and ready to evolve.',
    keyActivities: [
      'Continuous system observability, uptime tracking, and health diagnostics',
      'Proactive bug fixes, framework updates, and dependency maintenance',
      'Performance fine-tuning, query optimization, and cost governance',
      'Feature iterations aligned with user feedback and evolving priorities',
    ],
    deliverables: [
      'Scheduled Health & Maintenance Reports',
      'Ongoing Iterative Feature Updates',
      'Support coverage aligned to the agreed operating model',
    ],
    qualityGates: [
      'Operational health checks completed against agreed criteria',
      'Issue resolution tracked within defined delivery windows',
    ],
  },
];
