import { projects, certificates, blogPosts, profileSettings } from "../../drizzle/schema";
import { getDb, getJsonDb } from "./db";

// --- Seed Initial Data if empty ---
export async function seedInitialData() {
  const db = await getDb();

  if (db) {
    await seedMySQL(db);
  } else {
    await seedJson();
  }
}

// --- MySQL Seeding ---
async function seedMySQL(db: NonNullable<Awaited<ReturnType<typeof getDb>>>) {
  try {
    const existingProfile = await db.select().from(profileSettings).limit(1);
    if (existingProfile.length === 0) {
      await db.insert(profileSettings).values(SEED_PROFILE);
    }

    const existingProjects = await db.select().from(projects).limit(1);
    if (existingProjects.length === 0) {
      await db.insert(projects).values(SEED_PROJECTS);
    }

    const existingCertificates = await db.select().from(certificates).limit(1);
    if (existingCertificates.length === 0) {
      await db.insert(certificates).values(SEED_CERTIFICATES);
    }

    const existingBlogs = await db.select().from(blogPosts).limit(1);
    if (existingBlogs.length === 0) {
      await db.insert(blogPosts).values(SEED_BLOG_POSTS);
    }
  } catch (err) {
    console.error("[Database] Seed error:", err);
  }
}

// --- JSON File Seeding ---
async function seedJson() {
  const json = getJsonDb();

  if (json.isEmpty("profileSettings")) {
    json.insert("profileSettings", SEED_PROFILE);
    console.log("[JSON] Seeded profile settings.");
  }
  if (json.isEmpty("projects")) {
    json.insertMany("projects", SEED_PROJECTS);
    console.log("[JSON] Seeded projects.");
  }
  if (json.isEmpty("certificates")) {
    json.insertMany("certificates", SEED_CERTIFICATES);
    console.log("[JSON] Seeded certificates.");
  }
  if (json.isEmpty("blogPosts")) {
    json.insertMany("blogPosts", SEED_BLOG_POSTS);
    console.log("[JSON] Seeded blog posts.");
  }
}

// ==================== Seed Data ====================

const SEED_PROFILE = {
  name: "Alex Chen",
  title: "DevOps, IoT & Full Stack Principal Engineer",
  bio: "Senior systems and cloud architect specializing in resilient multi-cloud infrastructure, industrial IoT edge telemetry pipelines, and high-throughput web platforms.",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
  githubUrl: "https://github.com/executive-chen",
  linkedinUrl: "https://linkedin.com/in/alex-chen-devops",
  twitterUrl: "https://twitter.com/alexchen_eng",
  email: "alex.chen@executive-tech.io",
  activeTheme: "devops" as const,
};

const SEED_PROJECTS = [
  {
    title: "Kubernetes Multi-Region Edge Mesh & GitOps Pipeline",
    slug: "k8s-multi-region-edge-mesh",
    summary: "Zero-downtime global multi-cloud orchestration platform powered by Istio, ArgoCD, and Terraform.",
    category: "DevOps" as const,
    imageUrl: "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?q=80&w=1200&auto=format&fit=crop",
    githubUrl: "https://github.com/executive-devops/k8s-edge-mesh",
    liveUrl: "https://mesh.executive-infra.io",
    technologies: "Kubernetes, Istio, ArgoCD, Terraform, AWS, Prometheus, Go",
    problem: "Enterprise financial client experienced frequent cross-region latency spikes and manual deployment bottlenecks causing 45-minute rollback windows during high-traffic market openings.",
    architecture: "Designed a GitOps-driven multi-cluster service mesh across AWS EKS and GCP GKE with automated canary analysis via Flagger, synchronized through ArgoCD with strict Mutual TLS (mTLS).",
    impact: "Achieved 99.999% uptime, reduced global latency by 42%, and cut mean-time-to-recovery (MTTR) from 45 minutes to under 90 seconds.",
    featured: true,
    orderIndex: 1,
  },
  {
    title: "Industrial IoT Smart Factory Telemetry & Predictive AI",
    slug: "industrial-iot-smart-factory",
    summary: "Real-time MQTT ingestion pipeline processing 2M+ sensor streams per second with anomaly detection at the edge.",
    category: "IoT" as const,
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop",
    githubUrl: "https://github.com/executive-iot/edge-telemetry-ai",
    liveUrl: "https://iot.executive-factory.net",
    technologies: "MQTT, Apache Kafka, Edge TPU, Python, FastAPI, TimescaleDB, React",
    problem: "Manufacturing facility faced unexpected robotic arm failures resulting in $2.4M annual downtime because legacy SCADA systems lacked real-time predictive vibration analysis.",
    architecture: "Deed-edge micro-gateways running Python and TensorFlow Lite on Coral TPUs streaming compressed Protobuf over MQTT to a centralized Kafka + TimescaleDB analytics backend.",
    impact: "Early anomaly detection prevented 14 critical machinery failures in Year 1, saving estimated $1.8M in maintenance costs and boosting production throughput by 12%.",
    featured: true,
    orderIndex: 2,
  },
  {
    title: "Enterprise Multi-Tenant Cloud ERP & Analytics Suite",
    slug: "enterprise-multi-tenant-erp",
    summary: "High-throughput cloud native ERP with real-time financial ledger, role-based security, and dynamic reporting.",
    category: "Full Stack" as const,
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    githubUrl: "https://github.com/executive-fullstack/cloud-erp-suite",
    liveUrl: "https://erp.executive-cloud.io",
    technologies: "TypeScript, React 19, Node.js, PostgreSQL, Redis, TailwindCSS, Docker",
    problem: "Global logistics provider struggled with fragmented legacy monoliths causing data desynchronization between warehouse inventory and billing engines across 14 timezones.",
    architecture: "Engineered a decoupled, event-driven microservices architecture with a responsive React/TypeScript frontend, Redis caching layers, and PostgreSQL partitioned tenant tables.",
    impact: "Processed 500K daily ledger transactions with sub-50ms p99 latency while onboarding 4,500 active enterprise users with zero data sync errors.",
    featured: true,
    orderIndex: 3,
  },
];

const SEED_CERTIFICATES = [
  {
    title: "AWS Certified Solutions Architect – Professional",
    issuer: "Amazon Web Services",
    credentialId: "AWS-PSA-98234102",
    issueDate: "Jan 2025",
    expiryDate: "Jan 2028",
    verificationUrl: "https://aws.amazon.com/verification",
    category: "DevOps" as const,
    orderIndex: 1,
  },
  {
    title: "Certified Kubernetes Administrator (CKA)",
    issuer: "Cloud Native Computing Foundation (CNCF)",
    credentialId: "LF-CKA-772910",
    issueDate: "Nov 2024",
    expiryDate: "Nov 2027",
    verificationUrl: "https://www.cncf.io/certification/cka/",
    category: "DevOps" as const,
    orderIndex: 2,
  },
  {
    title: "AWS Certified IoT Specialty",
    issuer: "Amazon Web Services",
    credentialId: "AWS-IOT-449102",
    issueDate: "Aug 2024",
    expiryDate: "Aug 2027",
    verificationUrl: "https://aws.amazon.com/verification",
    category: "IoT" as const,
    orderIndex: 3,
  },
  {
    title: "Professional Cloud DevOps Engineer",
    issuer: "Google Cloud",
    credentialId: "GCP-PDE-883921",
    issueDate: "May 2024",
    expiryDate: "May 2027",
    verificationUrl: "https://cloud.google.com/certification",
    category: "DevOps" as const,
    orderIndex: 4,
  },
];

const SEED_BLOG_POSTS = [
  {
    title: "Architecting Resilient Multi-Region Kubernetes Failover Strategies",
    slug: "architecting-resilient-multi-region-k8s",
    summary: "A deep dive into active-active multi-region Kubernetes clusters with automated DNS routing and stateful replication.",
    content: `## Introduction

In modern cloud architecture, achieving true high availability requires designing for region-level catastrophic failures. Traditional active-passive setups introduce recovery time objectives (RTO) measured in hours. In this article, we examine how to build active-active multi-region Kubernetes clusters with zero-downtime failover.

## The Network Topology

To eliminate single points of failure, we deploy independent EKS clusters across AWS us-east-1 and eu-central-1. Global Anycast DNS with health-check-based routing automatically shifts user traffic within 10 seconds of a node or region outage.

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: global-ingress-mesh
spec:
  ingressClassName: nginx
  rules:
  - host: api.executive-tech.io
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: gateway-service
            port:
              number: 80
\`\`\`

## State Management and Database Replication

Stateless microservices are trivial to scale globally; the true challenge lies in distributed databases. We utilize PostgreSQL with synchronous streaming replication in same-region availability zones and asynchronous logical replication across continents, handling conflict resolution at the application layer using vector clocks.

## Conclusion

By adopting GitOps workflows with ArgoCD and automated canary testing, platform engineers can maintain absolute stability while pushing continuous updates across global infrastructure.`,
    category: "DevOps" as const,
    tags: "Kubernetes, DevOps, Cloud Architecture, SRE",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
    published: true,
    readTime: "7 min read",
    likes: 0,
  },
  {
    title: "Edge AI & MQTT: Building Intelligent IoT Systems on Low-Power Hardware",
    slug: "edge-ai-mqtt-iot-systems",
    summary: "How to deploy quantized neural networks on edge devices communicating over secure MQTT broker topologies.",
    content: `## The Rise of Edge Intelligence

Sending raw telemetry streams from thousands of remote IoT sensors to cloud data centers consumes excessive bandwidth and introduces unacceptable latency for real-time actuators. Moving intelligence directly to the edge transforms smart systems.

## Hardware Selection and Model Quantization

Using Coral Edge TPUs and Raspberry Pi 4 compute nodes, we compile TensorFlow models into INT8 quantized formats. This reduces memory footprint by 75% while maintaining 98.4% inference accuracy for vibration and thermal anomaly detection.

## Secure MQTT Telemetry

Devices communicate over TLS 1.3 secured MQTT streams with mutual certificate authentication. The broker cluster handles message queuing with QoS Level 1 guarantees, ensuring zero data loss even during intermittent cellular network outages.`,
    category: "IoT" as const,
    tags: "IoT, Edge AI, MQTT, Embedded Systems",
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
    published: true,
    readTime: "6 min read",
    likes: 0,
  },
  {
    title: "Scaling Full Stack React & TypeScript Applications to Millions of Users",
    slug: "scaling-full-stack-react-typescript",
    summary: "Best practices in state management, tRPC API optimization, and database indexing for high-performance web apps.",
    content: `## Engineering for Scale

When building enterprise web applications, architectural decisions made during day one dictate performance at scale. This article explores optimizing React 19 component trees, leveraging tRPC type-safe API boundaries, and database query tuning.

## Frontend Rendering Strategies

Combining server components with selective client hydration minimizes JavaScript bundle sizes. Leveraging TanStack React Query with robust stale-while-revalidate caching strategies provides instant perceived performance.

## Database Indexing and Connection Pooling

Using Drizzle ORM alongside PgBouncer connection pooling ensures that database queries maintain sub-20ms p95 latency under high concurrency loads.`,
    category: "Full Stack" as const,
    tags: "React, TypeScript, Full Stack, Performance",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
    published: true,
    readTime: "5 min read",
    likes: 0,
  },
];
