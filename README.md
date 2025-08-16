# Admin Dashboard

A minimal admin dashboard built with [React](https://react.dev/) and [Vite](https://vitejs.dev/). It includes a login view and basic dashboard layout using Material UI.

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The app will run at http://localhost:5173.

### Configuration

The app reads its API base URL from the `VITE_API_URL` environment variable. Create a `.env` file based on `.env.example` and set
`VITE_API_URL` to point to your backend. If unset, it defaults to `https://api.smartcareerassistant.online`.

## Scripts

- `npm run dev` – Start the Vite dev server with hot module replacement.
- `npm run build` – Build the app for production.
- `npm run preview` – Preview the production build locally.
- `npm run lint` – Lint the project with ESLint.
- `npm test` – Run the test suite with Vitest.

## Project Structure

- `src/` – Application source code.
- `public/` – Static assets.
- `index.html` – HTML entry point.

## Contributing

Pull requests are welcome. Please run `npm run lint` before submitting.

