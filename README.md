# Peels

[Peels](https://www.peels.app) connects folks with food scraps to those who compost. It’s a free, non-commercial, community project.

Peels is built on top of Next.js and Supabase. The code is [open source](#forking-peels) and could be used as a starting point for your own circular economy projects.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/dnywh/peels.git
cd peels

# Install dependencies
npm install

# Copy environment file (then add API keys)
cp .env.example .env.local

# Start development server
npm run dev

# Go to http://localhost:3000
```

> **Note**: This project currently uses `--webpack` flag for the `dev` and `build` scripts due to compatibility with Pigment CSS. Once [Pigment CSS adds Turbopack support](https://github.com/mui/pigment-css/issues), we’ll switch back to Turbopack (Next.js 16’s default bundler).

> **Note**: You’ll need some API keys for full functionality. See [Required Services](#required-services) below.

## Prerequisites

### Core Requirements

| Requirement | Version               |
| ----------- | --------------------- |
| Node.js     | 18+ (LTS recommended) |
| npm/yarn    | Latest stable         |
| Git         | Latest stable         |

Deno and Docker are also required if you plan to work on Supabase edge functions.

### Required Services

You’ll need to populate the environment variables with keys from following services:

- [Supabase](https://supabase.com): Database and authentication
- [MapTiler](https://maptiler.com): Geocoding
- [Protomaps](https://protomaps.com): Map tiles

See [Contributing](#environment-variables) if you need access to shared development keys.

## Project Structure

```text
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

## Contributing to Peels

Thank you for contributing! Please read our [Code of Conduct](https://github.com/dnywh/peels/blob/main/.github/CODE_OF_CONDUCT.md) and [contributing guidelines](https://github.com/dnywh/peels/contribute) before you start.

Check out the list of [issues](https://github.com/dnywh/peels/issues) you could help out on, [discussions](https://github.com/dnywh/peels/discussions) about future improvements, and our [Wiki](https://peels.notion.site/207b37e1678f80259217f54cd9d1f637) for information on how things are set up.

For minor improvements, feel free to just go ahead and create a pull request. For major changes, please [open an issue](https://github.com/dnywh/peels/issues) first to discuss what you would like to change.

### Environment Variables

Personal keys for [MapTiler](https://www.maptiler.com/cloud/) and [Protomaps](https://protomaps.com/account) will work just fine for local development. You’ll probably need the shared development keys for Supabase, so please introduce yourself and tell us how you plan to help on the [discussion board](https://github.com/dnywh/peels/discussions). We’ll go from there.

> **Note**: We’re exploring ways to make local development work without a shared development key for Supabase, probably by [seeding example data](https://supabase.com/docs/guides/local-development/seeding-your-database) and doing something similar for authentication. We’d love your help with this.

Environmental variables can also be optionally added to [Supabase edge functions](https://github.com/dnywh/peels/blob/main/supabase/functions) for local testing. You’re unlikely to need these though, as each edge function currently requires user information and interaction.

### Usage

1. Clone and set up codebase:

   ```bash
   git clone https://github.com/dnywh/peels.git
   cd peels
   npm install
   ```

2. Populate environment variables:
   - Copy `.env.example` to `.env.local`
   - Request development credentials via our [discussions board](https://github.com/dnywh/peels/discussions)

3. Start development:

   ```bash
   npm run dev
   ```

You might need to clear out and restart your Next.js development server in the case that you add environment variables after the above steps. Here’s how to do that:

```bash
rm -rf .next
npm run dev
```

### Development Guidelines

- We use Pigment CSS for styling at a component-level
- We’re slowly moving towards TypeScript for type safety
- Heavy commenting is encouraged to make the codebase accessible to others
- Code formatting is handled by Prettier. Please ensure your code is formatted according to `.prettierrc` before submitting a pull request

### Getting Help

- Check existing [issues](https://github.com/dnywh/peels/issues) for known problems
- Create a [new issue](https://github.com/dnywh/peels/issues/new) if you find a bug or have a feature request
- Join our [discussion board](https://github.com/dnywh/peels/discussions) for anything else

## Forking Peels

Please review our [License](#license) before you fork and built upon Peels for your own purposes.

Peels is designed to facilitate the sharing and repurposing of resources at a local community level. It’s therefore best suited as a foundation for similar circular economy projects. For example, you could use it to help kickstart a creative materials exchange platform or tool sharing platform. Let us know what you build!

### License

This project is licensed under the GNU General Public License version 3 (GPLv3). See the [LICENSE](LICENSE) file for details.

In short: you can use Peels as a base for your own projects but only if you share-alike. That means you must license whatever you make under the same GLPv3 license and make the source code similarly available as we do with Peels.

Check out the [Next.js and Supabase Starter Kit](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs) if your project doesn’t fit our license requirements.

### Setup

1. Fork and clone:

   ```bash
   git clone https://github.com/your-username/your-fork.git
   cd your-fork
   npm install
   ```

2. Set up your environment:
   - Follow the services setup in [Prerequisites](#prerequisites)
   - Copy `.env.example` to `.env.local`
   - Add your API keys to `.env.local`

3. Initialize and run:

   ```bash
   npx supabase db push
   npm run dev
   ```

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Authentication and database by [Supabase](https://supabase.com)
- Translations powered by [next-intl](https://next-intl.dev/) and [Crowdin](https://crowdin.com/)
- Maps powered by [MapTiler](https://www.maptiler.com) and [Protomaps](https://protomaps.com)
- Styled components built with [Pigment CSS](https://github.com/mui/pigment-css)

See the [Colophon](https://www.peels.app/colophon) and [Wiki](https://peels.notion.site/207b37e1678f80259217f54cd9d1f637) for more.
