
# Node Backend Template

A minimal Node.js backend template for rapid project setup.

## Features

- Express.js server setup
- Environment configuration
- Basic middleware setup
- Error handling
- Modular route structure

## Prerequisites

- Node.js (v14 or higher)
- pnpm or yarn

## Installation

```bash
pnpm install
```

## Configuration

Create a `.env` file in the root directory:

```
PORT=3000
NODE_ENV=development
```

## Running the Server

```bash
pnpm start
```

Development mode with auto-reload:

```bash
pnpm run dev
```

## Project Structure

```
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── server.js
├── .env
├── .gitignore
└── package.json
```

## License

MIT
