import { InsightArticle } from '../types';
import {
  insightSystemArchImg,
  insightEnterpriseAiImg,
  insightCloudModImg,
} from '../assets/images';

export const insightsArticles: InsightArticle[] = [
  {
    id: 'art-1',
    slug: 'scaling-event-streaming-zero-data-loss',
    title: 'Architecting Event-Driven Streaming Pipelines with Zero Data Loss at 10M Events/Sec',
    category: 'System Architecture',
    imageUrl: insightSystemArchImg,
    readTime: '6 min read',
    publishedDate: 'October 2026',
    author: {
      name: 'Faizur Rahman',
      role: 'Principal Solutions Architect',
    },
    excerpt: 'How we engineered a fault-tolerant event processing architecture using partitioned streaming buffers, exactly-once deduplication keys, and distributed cold-storage syncing.',
    content: [
      'In high-concurrency transactional architectures, even a 0.001% data packet drop rate translates to thousands of lost financial records or broken downstream microservices. Building systems that pursue exactly-once delivery at massive volume requires abandoning simplistic queues in favor of distributed partitioned log structures.',
      'Our approach leverages distributed append-only journals combined with client-side idempotency hashing. When upstream clients push transactional payloads, an idempotent SHA-256 fingerprint is immediately assigned and stored in an ultra-fast in-memory Bloom filter before persisting into partitioned write-ahead logs.',
      'By decoupling ingestion buffers from analytical consumers, the architecture can pursue illustrative targets such as low-double-digit millisecond P99 latency while remaining resilient through regional node outages without dropping in-flight events.',
      'When designing for enterprise scale, remember: simplicity in contract boundaries yields predictability in distributed fault domains.',
    ],
    sections: [
      { id: 'overview', title: 'Overview' },
      { id: 'architecture', title: 'Architecture Pattern' },
      { id: 'takeaways', title: 'Key Takeaways' },
    ],
    tags: ['Architecture', 'Kafka', 'Streaming', 'Microservices', 'Zero-Loss'],
  },
  {
    id: 'art-2',
    slug: 'private-enterprise-ai-rag-architectures',
    title: 'Building Air-Gapped Enterprise AI: Zero Data Leakage RAG Systems in Regulated Environments',
    category: 'Enterprise AI',
    imageUrl: insightEnterpriseAiImg,
    readTime: '8 min read',
    publishedDate: 'September 2026',
    author: {
      name: 'V. Sundar',
      role: 'Director of Cloud & AI Systems',
    },
    excerpt: 'A blueprint for deploying private large language models with real-time vector search inside strict SOC 2 and HIPAA security boundaries without public API exposure.',
    content: [
      'Enterprise adoption of generative AI has frequently stalled at the security boundary. Corporate legal and compliance teams rightfully reject sending proprietary intellectual property and customer records across multi-tenant commercial LLM endpoints.',
      'The modern enterprise solution is private RAG (Retrieval-Augmented Generation) hosted entirely within dedicated VPC or on-premise Kubernetes clusters using quantized open-weights models and hardware-accelerated inference engines.',
      'In this architecture, document ingestion pipelines automatically tokenize, redact PII via local transformer models, and index vector embeddings into dedicated Qdrant or Milvus clusters with granular row-level access permissions.',
      'The result is enterprise-grade contextual intelligence that operates under strict data-retention controls, supporting both regulatory standards and executive velocity goals.',
    ],
    sections: [
      { id: 'risk', title: 'Security Risk' },
      { id: 'architecture', title: 'Private RAG Design' },
      { id: 'outcome', title: 'Operational Outcome' },
    ],
    tags: ['AI', 'RAG', 'VectorDB', 'Zero-Trust', 'HIPAA'],
  },
  {
    id: 'art-3',
    slug: 'zero-downtime-monolith-to-microservice-migration',
    title: 'The Strangler Fig Pattern: Migrating Core Monoliths to Microservices with Zero Downtime',
    category: 'Cloud Modernization',
    imageUrl: insightCloudModImg,
    readTime: '7 min read',
    publishedDate: 'August 2026',
    author: {
      name: 'A. K. Sharma',
      role: 'Head of Pod Engineering',
    },
    excerpt: 'Step-by-step strategies for deconstructing multi-gigabyte monolithic databases and application cores using dynamic reverse proxy routing and dual-write synchronizations.',
    content: [
      'The most dangerous decision an enterprise can make is a "Big Bang" rewrite of an active production monolith. Systems that took a decade to build contain countless undocumented domain edge cases that cannot be cleanly replicated in a single simultaneous cutover.',
      'The Strangler Fig design pattern provides an incremental, zero-risk pathway. By placing an intelligent API gateway at the edge, individual functional domains (e.g., Auth, Inventory, Billing) are systematically intercepted and directed to modern microservices while the legacy core continues operating seamlessly.',
      'Dual-write data synchronization with automated reconciliation background workers maintains parity between legacy relational tables and new distributed event streams during the multi-month transition period.',
      'Only once the new services meet agreed high-availability reliability targets under production load is the legacy module permanently retired.',
    ],
    sections: [
      { id: 'risk', title: 'Migration Risk' },
      { id: 'strategy', title: 'Fallback Strategy' },
      { id: 'migration', title: 'Controlled Migration' },
    ],
    tags: ['Modernization', 'Microservices', 'DevOps', 'Cloud', 'Kubernetes'],
  },
];
