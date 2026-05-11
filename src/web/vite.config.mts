import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  // depending on your application, base can also be "/"
  base: "/",
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
    }),
    babel({
      plugins: ["@emotion/babel-plugin"],
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    // this ensures that the browser opens upon server start
    open: true,
    // this sets a default port to 3000
    port: 3000,
  },
});
