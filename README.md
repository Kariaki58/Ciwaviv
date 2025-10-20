m # Ciwaviv - Modern Sportswear E-commerce

This is a modern, responsive e-commerce website for a fictional sportswear brand named "Ciwaviv," built with Next.js and styled with Tailwind CSS.

The project demonstrates a sleek, performance-focused site that matches the brand’s energetic identity and allows users to browse and purchase athletic apparel easily.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18.x or later)
- npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/ciwaviv.git
    cd ciwaviv
    ```

2.  **Install dependencies:**

    Using npm:
    ```bash
    npm install
    ```

    Using yarn:
    ```bash
    yarn install
    ```

    Using pnpm:
    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**

    If you are using Firebase services, you might need a `.env` file for your configuration.

### Running the Development Server

To start the development server, run one of the following commands:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

The site is now running in development mode with hot-reloading. You can start editing pages, and the changes will be reflected in the browser.

## 🛠️ Built With

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand) (for cart), React Context (for theme)
*   **Animations:** [Framer Motion](https://www.framer.com/motion/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

## 📄 Pages

The application includes the following pages:

-   **Home:** Landing page with a hero section, featured collections, and brand mission.
-   **Shop:** A grid of all products with client-side filtering.
-   **Product Detail:** A dynamic page for each product with a description, image carousel, and an "Add to Cart" button.
-   **About:** A static page describing the brand's story.
-   **Contact:** A page with a contact form and social media links.
-   **Cart:** A summary of items added to the cart, with options to update quantity or remove items.
-   **Checkout:** A mock checkout form to simulate the final purchase step.
-   **404:** A custom "Not Found" page.
