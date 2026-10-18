/// <reference types="vite/client" />

declare module '*.png' {
  const source: string;
  export default source;
}

interface Error {
  response?: { data?: { message?: string; errors?: Array<{ message?: string }> } };
}
