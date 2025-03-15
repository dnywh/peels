# Peels

[Peels](https://www.peels.app) connects people (or businesses) who have food scraps with those who can compost or repurpose them.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/dnywh/peels.git
cd peels

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Visit http://localhost:3000

> **Note**: You'll need some API keys for full functionality. See [Prerequisites](#prerequisites) below.

## About Peels

Peels is a two-sided marketplace built with Next.js and Supabase:

- **Hosts**: Permanent locations like community farms or households that can accept materials
- **Donors**: Individuals and businesses with food scraps or other materials to give away

This is a free, non-commercial, community project. The code is open source and can be used as a starting point for your own circular economy projects.

## Prerequisites

### Core Requirements

| Requirement | Version               |
| ----------- | --------------------- |
| Node.js     | 18+ (LTS recommended) |
| npm/yarn    | Latest stable         |
| Git         | Latest stable         |

### Required Services

If you're forking Peels or contributing, you'll need free accounts with:

- [Supabase](https://supabase.com) - Database and authentication
- [MapTiler](https://maptiler.com) - Geocoding
- [Protomaps](https://protomaps.com) - Map tiles

## Usage Options

### 1. Contributing to Peels

1. Clone and set up:

   ```bash
   git clone https://github.com/dnywh/peels.git
   cd peels
   npm install
   ```

2. Set up environment:

   - Copy `.env.example` to `.env.local`
   - Request development credentials via our [discussions board](https://github.com/dnywh/peels/discussions)

3. Start development:
   ```bash
   npm run dev
   ```

### 2. Forking Peels

1. Review our [Usage Policy](#usage-policy) and [License](#license)

2. Fork and clone:

   ```bash
   git clone https://github.com/your-username/your-fork.git
   cd your-fork
   npm install
   ```

3. Set up your environment:

   - Follow the services setup in [Prerequisites](#prerequisites)
   - Copy `.env.example` to `.env.local`
   - Add your API keys to `.env.local`

4. Initialize and run:
   ```bash
   npx supabase db push
   npm run dev
   ```

## Project structure

```
peels/
├── src/                   # Source code
│   ├── app/               # Next.js app router pages
│   ├── components/        # React components
│   ├── lib/               # Utility functions and shared logic
│   └── middleware.ts      # Next.js middleware for auth
├── public/                # Static assets
├── supabase/              # Supabase configurations and migrations
└── package.json           # Project dependencies and scripts
```

## Usage Policy

This project is intended for circular economy applications that:

- Facilitate the sharing or repurposing of resources
- Connect permanent locations with regular input/output needs
- Operate on non-commercial, community-focused principles

Examples of what you could build:

- Tool libraries for community gardens
- Creative materials exchange platforms

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0), with some additional terms to reflect our [Usage Policy](#usage-policy). See the [LICENSE](LICENSE) file for details.

In short: you can use Peels as a base for your own non-commercial circular economy projects but not much else.

Check out the [Next.js and Supabase Starter Kit](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs) if your project doesn’t fit our license requirements.

## Development Guidelines

- Mobile-first responsive design (using min-width queries)
- Pigment CSS for styling (similar to Linaria)
- TypeScript for new features
- Console.logs encouraged during development
- Comprehensive testing for new features

## Contributing

Before making contributions:

1. Read our [Code of Conduct](CODE_OF_CONDUCT.md)
2. Check the [Issues](https://github.com/dnywh/peels/issues/new) for existing tasks
3. For major changes, please open an issue first to discuss what you would like to change

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests and linting: `npm run lint`
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request

### Getting Help

- Check existing [issues](https://github.com/dnywh/peels/issues) for known problems
- Create a new issue if you find a bug or have a feature request
- Join our [discussion board](https://github.com/dnywh/peels/discussions) for anything else

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Authentication and database by [Supabase](https://supabase.com)
- Maps powered by [MapTiler](https://www.maptiler.com) and [Protomaps](https://protomaps.com)
- Our [contributors](https://github.com/dnywh/peels/graphs/contributors)!
