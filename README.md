<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Mystic Tarot

An immersive, AI-powered Tarot reading application built with React and Tailwind CSS.

## Features

- **Interactive Spreads**: Choose from various spreads including Daily Draw, Timeflow (Past/Present/Future), and Celtic Cross.
- **AI Interpretation**: Real-time, streaming interpretations provided by advanced AI models (via Gemini/Moonshot API).
- **Visual Richness**: Beautiful card animations, dark mode aesthetic, and responsive design.
- **Reversed Cards**: Authentic Tarot experience with support for reversed card meanings.
- **Customizable**: Easy to extend with new spreads or card decks.

## Demo

![Demo](public/demo.webp)

## Run Locally

**Prerequisites:** Node.js

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Environment:**
    Create a `.env.local` file in the root directory and add your API credentials:
    ```env
    VITE_API_KEY=your_api_key_here
    VITE_API_URL=https://ai.megallm.io
    VITE_API_MODEL=moonshotai/kimi-k2-thinking
    ```

3.  **Run the app:**
    ```bash
    npm run dev
    ```

## Technologies

- React 18
- TypeScript
- Tailwind CSS
- Lucide React (Icons)
- Framer Motion (Animations)

## Deployment

This project is configured for deployment to GitHub Pages.

1.  **Build and Deploy:**
    ```bash
    npm run deploy
    ```
    This command will build the project and push the `dist` folder to the `gh-pages` branch.

## Recent Updates

- **Mobile Optimization**: Enhanced mobile experience with horizontal scroll carousel for 3-card spreads and improved card visibility.
- **Performance**: Embedded core assets (card back) as Base64 to resolve loading issues and improve initial render stability.
- **Data Integration**: Standardized card data source for consistent multi-language support.

