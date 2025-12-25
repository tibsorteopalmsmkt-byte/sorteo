import React from "react"
import * as dotenv from "dotenv"

// Cargar variables de entorno
dotenv.config({
  path: `.env`,
})

export const onRenderBody = ({ setHeadComponents, setPostBodyComponents }: any) => {
  // Inyectar variables de entorno de Firebase en el HTML
  const firebaseConfig = {
    apiKey: process.env.GATSBY_FIREBASE_API_KEY || "",
    authDomain: process.env.GATSBY_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.GATSBY_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.GATSBY_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.GATSBY_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.GATSBY_FIREBASE_APP_ID || "",
  };

  setPostBodyComponents([
    React.createElement("script", {
      key: "firebase-config",
      dangerouslySetInnerHTML: {
        __html: `window.__FIREBASE_CONFIG__ = ${JSON.stringify(firebaseConfig)};`,
      },
    }),
  ]);

  setHeadComponents([
    React.createElement("link", {
      key: "urbanist-font",
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    }),
    React.createElement("link", {
      key: "urbanist-font-2",
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    }),
    React.createElement("link", {
      key: "urbanist-font-3",
      href: "https://fonts.googleapis.com/css2?family=Urbanist:wght@400;700;800;900&display=swap",
      rel: "stylesheet",
    }),
  ])
}

