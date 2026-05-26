# RealSME Portfolio & Valuations Platform

**RealSME** is a comprehensive, automated web application tailored for Micro, Small, and Medium Enterprises (MSMEs). It delivers instant, data-driven enterprise valuations based on core financial inputs, and offers a robust portfolio management interface for analyzing cash flows, health metrics, and growth pipelines.

---

## ⚡ Core Features

### 1. Automated Business Valuation Engine
- **Multi-Step Wizard**: A frictionless, step-by-step UI to collect Company Info, Financial Details, and Value Drivers.
- **Dynamic Multipliers**: Valuation mathematics driven by customizable, industry-specific EBITDA and Revenue multiples.
- **Risk & Growth Impacts**: Valuation figures automatically adjust based on configured age, revenue growth velocity, and business risk stability parameters.
- **Express Reports**: Clear visual presentation of the estimated Enterprise Value (EV), alongside side-by-side industry benchmark comparisons.

### 2. Portfolio Health & Indexing
- **Company Tracking**: Add and manage multiple subsidiary/portfolio companies under a single parent user.
- **Cash Flow Engine**: Detailed logging of transactions (Inflows/Outflows) with recurrence capabilities.
- **Weekly & Monthly Health Reports**: Periodic pulse checks capturing operational metrics (asset utilization, absenteeism, sentiment) and deep financial metrics (Aging Debtors/Creditors).
- **Dynamic Index Weights**: Configurable algorithms allowing founders to weight Runway, Sentiment, and Pipeline scoring manually.

### 3. Admin Operations & Configurations
- **Role-Based Access Control**: Strict segregation between `USER` contexts and `ADMIN` hubs.
- **Master Configurations**: A centralized panel to manage Active Industries, Base Multipliers, Pricing Plans, Payment Gateways, and AI Model connectivity.

---

## 🛠 Tech Stack

**Architecture**
- **Framework**: Next.js 16 (App Router paradigm) - server-side rendering, proxying, and React Server Components.
- **Language**: TypeScript (End-to-End type safety)

**UI & Styling**
- **Styling**: Tailwind CSS (v4)
- **Component Library**: Radix UI (Headless accessibility)
- **Animations**: Framer Motion (page transitions, wizard slides)
- **Forms**: React Hook Form coupled with Zod Schema Validation
- **Visuals**: Lucide React (Icons), Recharts (Graphing)

**Backend & Database**
- **ORM**: Prisma Client
- **Database**: PostgreSQL
- **Auth**: NextAuth.js (Session & Credentials provider integration) + BcryptJS

**Deployment**
- **Process Management**: PM2 Configuration (`ecosystem.config.js`)
- **Build Target**: Next.js Standalone (Optimized isolated bundles)

---

## 🗄️ Database Structure (Prisma Schema)

The PostgreSQL database is fully strictly typed and managed via Prisma. Here is the operational table structure:

### 1. User & Access Control
| Table/Model   | Purpose | Key Fields |
| :--- | :--- | :--- |
| **`User`** | Represents a system user (Parent/Founder or Admin). | `id`, `name`, `email`, `role(ADMIN/USER)`, `password` |
| **`IndexConfig`** | Stores customized index weighting algorithms per parent user. | `userId`, `weightRunway`, `weightSentiment`, `weightPipeline` |

### 2. Company & Operations
| Table/Model   | Purpose | Key Fields |
| :--- | :--- | :--- |
| **`Company`** | A localized MSME business belonging to a Parent User. | `id`, `name`, `industry`, `gstNo`, `legalStructure`, `management (JSON)` |
| **`Customer`** | Distinct entities purchasing from a managed Company. | `id`, `name`, `area` |
| **`CustomerContact`** | Authorized points of contact belonging to Customers. | `name`, `phone`, `email`, `designation` |
| **`CashTransaction`** | Granular ledger logic tracking inflows and outflows. | `type (INFLOW/OUTFLOW)`, `amount`, `date`, `frequency` |

### 3. Periodic Health Tracking
| Table/Model   | Purpose | Key Fields |
| :--- | :--- | :--- |
| **`WeeklyStat`** | Lightweight weekly pulse reporting. | `cashInflow`, `newOrders`, `sentiment`, `peopleChanges (JSON)` |
| **`MonthlyStat`** | Deep retrospective of a fiscal month. | `debtors0to30`, `creditors90plus`, `cashOnHand`, `top5Expenses` |

### 4. Admin Masters & Configurations
| Table/Model   | Purpose | Key Fields |
| :--- | :--- | :--- |
| **`Industry`** | Registered business sectors available in the system. | `name`, `status`, `remarks` |
| **`BaseMultiplier`**| Associates core valuation multipliers with an active industry. | `revMultipleFrom/To`, `ebitdaMultipleFrom/To` |
| **`PricingPlan`** | Manages subscription or report generation tiers. | `name`, `price`, `features` |
| **`PaymentConfig`** | Tracks 3rd-party payment gateway integration keys. | `provider(Razorpay)`, `apiKey`, `apiSecret` |
| **`AiModelConfig`** | Registers AI endpoints utilized for parsing/report generation. | `name`, `apiKey`, `usedFor` |

### 5. Valuation Logic Engine
| Table/Model   | Purpose | Key Fields |
| :--- | :--- | :--- |
| **`Valuation`** | Distinct historical record of an estimated target company. | `companyName`, `industry`, `revenue`, `ebitda`, `estimatedValue` |

---

## 🚀 Getting Started

**Local Development**
1. Run `npx prisma generate` to synchronize your local target `.node` DLL integrations.
2. Ensure your PostgreSQL instance connects flawlessly to the local `.env` `DATABASE_URL`.
3. Boot the environment via `npx next dev -p 3007`.

**Server Deployment**
This application utilizes standalone architecture:
- Execute `npm run build` locally or on CI.
- Push your `.next/standalone`, `.next/static`, and `/public` directories.
- Restart the environment with `pm2 restart realsme-portfolio`.
