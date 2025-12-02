import React from "react"

export const onRenderBody = ({ setHeadComponents }: any) => {
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

