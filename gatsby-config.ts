import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  siteMetadata: {
    title: `Gatsby GraphQL TypeScript`,
    description: `A simple Gatsby site with GraphQL and TypeScript`,
    author: `@gatsby`,
    siteUrl: `https://gatsbystarterdefaultsource.gatsbyjs.io/`,
  },
  graphqlTypegen: true,
  plugins: [
    `gatsby-plugin-typescript`,
    `gatsby-plugin-postcss`,
    // GraphQL deshabilitado temporalmente - endpoint causa bucle infinito
    // {
    //   resolve: `gatsby-source-graphql`,
    //   options: {
    //     typeName: `WPGraphQL`,
    //     fieldName: `wp`,
    //     url: `https://premios.tibconsult.com/graphql`,
    //     // Opciones para evitar bucles infinitos
    //     refetchInterval: 60, // Refrescar cada 60 segundos en lugar de constantemente
    //     batch: true, // Agrupar múltiples queries en una sola petición
    //     fetchOptions: {
    //       method: `POST`,
    //       headers: {
    //         'Content-Type': `application/json`,
    //       },
    //     },
    //   },
    // },
  ],
}

export default config