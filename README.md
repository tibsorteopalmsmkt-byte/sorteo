# Gatsby GraphQL TypeScript Project

A simple Gatsby project with TypeScript and GraphQL integration.

## Features

- ✅ Gatsby with TypeScript
- ✅ GraphQL integration with `gatsby-source-graphql`
- ✅ Example GraphQL queries
- ✅ Type-safe development

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run develop
   ```

3. Open your browser and navigate to `http://localhost:8000`

## GraphQL Configuration

The project is configured to use the Star Wars API as an example GraphQL data source. You can modify the GraphQL endpoint in `gatsby-config.ts`:

```typescript
{
  resolve: `gatsby-source-graphql`,
  options: {
    typeName: `SWAPI`,
    fieldName: `swapi`,
    url: `https://swapi-graphql.netlify.app/.netlify/functions/index`,
  },
}
```

## Scripts

- `npm run develop` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Serve production build
- `npm run clean` - Clean cache and public folders
- `npm run type-check` - Run TypeScript type checking# sorteo
