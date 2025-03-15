# Peels

[Peels](https://www.peels.app) is a Next.js and Supabase app, hosted on Vercel. It connects people who have food scraps to others who can compost those food scraps or otherwise repurpose them, like feeding chooks. Businesses also use Peels to give away spent coffee, timber offcuts, and similar.

You can think of Peels as a two-sided marketplace, with one side ('hosts') being in permanent physical locations, such as a community farm or private household. The other side ('donors') find hosts on the map and then message them to arrange food scrap drop-offs (or collection, in the case of businesses).

Peels is a free, non-commercial, community project. As you can see, the code is open source. Feel free to use it as a starting point for your own circular economy projects. We also welcome and encourage [contributions](#contributing).

## Getting started

There are two ways to use this repository:

1. **Contributing to Peels**: Help building out and improving Peels
2. **Forking Peels**: Create your own circular economy project based on our codebase

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Git

If you plan to fork Peels, or just want to make light contributions, you should also sign up for the following:

- A Supabase account (free tier works fine)
- A MapTiler account (for geocoding)
- A Protomaps account (for map tiles)

### Contributing to Peels

1. Clone the repository:

   ```bash
   git clone https://github.com/dnywh/peels.git
   cd peels
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up your environment:

   - Copy `.env.example` to `.env.local`
   - Request development database access and API keys from the maintainers via our [discussions board](https://github.com/dnywh/peels/discussions)
   - Once approved, you'll receive:
     - Supabase development database credentials
     - Development API keys for MapTiler and Protomaps
     - Font hosting URL

4. Start the development server:
   ```bash
   npm run dev
   ```

The app should now be running at [http://localhost:3000](http://localhost:3000) with a connection to our development database.

### Forking Peels

If you want to create your own project based on Peels:

0. Make sure your project is aligned with our [license](#license)

1. Fork the repository on GitHub

2. Clone your fork:

   ```bash
   git clone https://github.com/your-username/your-fork.git
   cd your-fork
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Set up your services:

   - Create a new Supabase project at [database.new](https://database.new)
   - Get a free API key from [MapTiler](https://cloud.maptiler.com/)
   - Get a free API key from [Protomaps](https://protomaps.com/)
   - Set up your own font hosting (or modify the app to use different fonts)

5. Set up your environment:

   - Copy `.env.example` to `.env.local`
   - Fill in your own API keys and URLs as documented in `.env.example`

6. Initialize your database:

   ```bash
   npx supabase db push
   ```

7. Start the development server:
   ```bash
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

### Development Guidelines

- We're moving towards TypeScript for type safety
- Styling is done with Pigment CSS (similar to Linaria)
- Follow mobile-first responsive design principles
- Keep console.logs for development, they help with debugging
- Media queries should use min-width (mobile-first approach)

### Getting Help

- Check existing [issues](https://github.com/yourusername/peels/issues) for known problems
- Create a new issue if you find a bug or have a feature request
- Join our [discussion board](https://github.com/dnywh/peels/discussions) for anything else

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0) - see the [LICENSE](LICENSE) file for details.

This means you can:

- Share, copy, and redistribute the code
- Adapt and build upon the code
- Use it as a base for your own non-commercial circular economy projects

Under these conditions:

- **Attribution** — You must give appropriate credit to Peels
- **NonCommercial** — You may not use this code for commercial purposes
- **No additional restrictions** — You may not apply legal terms that legally restrict others from doing anything the license permits

The code is provided as-is and may be repurposed for your own two-sided, map-centric marketplace, as long as your project is non-commercial. Some examples of what you could build:

- A platform connecting folks with spare yarn to knitters
- A tool-sharing network for community gardens
- Any project connecting permanent locations with regular input/output needs

For commercial projects, we recommend starting with the [Next.js and Supabase Starter Kit](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs).

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Authentication and database by [Supabase](https://supabase.com)
- Maps powered by [MapTiler](https://www.maptiler.com) and [Protomaps](https://protomaps.com)
- Our [contributors](https://github.com/dnywh/peels/graphs/contributors)!
