# Empathy Ledger

**Ethical storytelling infrastructure that helps organizations collect, protect, and amplify community voices while ensuring stories remain sovereign and value flows back to storytellers.**

## 🌟 Vision

Empathy Ledger is an engine for ethical storytelling that powers diverse organizations. Like WordPress revolutionized web publishing, Empathy Ledger revolutionizes how communities collect, protect, and benefit from their stories.

## 🏗️ Architecture

- **Engine Layer**: Core sovereignty principles (story ownership, economic justice, cultural safety)
- **Project Layer**: Each organization gets their own branded experience
- **Module Layer**: Configurable features for different use cases

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Environment variables (see `.env.example`)

### Development Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
npx supabase migration up

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
├── README.md                 # This file
├── docs/                     # All documentation
│   ├── PLATFORM_EVOLUTION_SUMMARY.md
│   ├── TECHNICAL_ROADMAP.md
│   ├── PHILOSOPHY_AND_PRINCIPLES.md
│   └── ...
├── src/                      # Application source code
│   ├── app/                  # Next.js app router
│   ├── components/           # React components
│   ├── lib/                  # Utilities and integrations
│   └── middleware.ts         # Request middleware
├── supabase/                 # Database schema and migrations
├── scripts/                  # Build and deployment scripts
└── public/                   # Static assets
```

## 🏢 Multi-Tenant Architecture

Each organization (project) gets:

- ✅ Custom branding and domain
- ✅ Configurable modules (story collection, analytics, etc.)
- ✅ Role-based access control
- ✅ Data sovereignty controls
- ✅ Cultural protocol support

## 🧩 Core Modules

### Essential (All Projects)

- **Story Core**: Multi-modal story collection
- **Consent & Privacy**: Granular permission management
- **User Management**: Role-based access control

### Standard (Most Projects)

- **Community Analytics**: Insights respecting sovereignty
- **Cultural Protocols**: Sacred knowledge protection
- **Value Distribution**: Economic benefit tracking

### Specialized (Specific Use Cases)

- **Youth Tracker**: Progress monitoring for youth services
- **Cultural Knowledge**: Indigenous knowledge preservation
- **Report Builder**: Automated stakeholder reporting
- **Service Finder**: Resource location and availability

## 🔐 Core Principles

1. **Story Sovereignty**: Storytellers own their narratives
2. **Economic Justice**: Value flows back to storytellers
3. **Cultural Safety**: Respect for protocols and knowledge
4. **Collective Wisdom**: Individual stories reveal systemic patterns
5. **Transparent Impact**: Clear tracking of story usage and value

## 🛠️ Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📊 Platform Admin

Platform administrators can:

- Manage all projects/tenants
- Monitor system health
- Configure modules
- Track platform-wide metrics
- Support organization onboarding

Access via `/admin/platform` (requires super_admin role).

## 🌍 Current Deployments

- **JusticeHub**: Youth justice organizations
- **Wilya Janta**: Indigenous knowledge preservation
- **Community Voices**: Local storytelling initiatives

## 📚 Documentation

Comprehensive documentation is available in the [`/docs`](./docs) directory:

- [Platform Evolution Summary](./docs/PLATFORM_EVOLUTION_SUMMARY.md)
- [Technical Roadmap](./docs/TECHNICAL_ROADMAP.md)
- [Philosophy & Principles](./docs/PHILOSOPHY_AND_PRINCIPLES.md)
- [Implementation Roadmap](./docs/IMPLEMENTATION_ROADMAP.md)
- [Migration Strategy](./docs/MIGRATION_STRATEGY.md)

## 🤝 Contributing

1. Read our [Philosophy & Principles](./docs/PHILOSOPHY_AND_PRINCIPLES.md)
2. Check the [Technical Roadmap](./docs/TECHNICAL_ROADMAP.md)
3. Follow sovereignty-first development practices
4. Ensure all features maintain cultural safety

## 📄 License

[License details to be added]

## 🆘 Support

- Documentation: [`/docs`](./docs)
- Technical Issues: [Create an issue](https://github.com/your-repo/issues)
- Community: [Contact information]

---

**Built with sovereignty. Powered by community voices.**
