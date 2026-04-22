import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Nano Banana | Future of Freshness',
    description: 'Experience the next evolution of cold-pressed juice. Nano-processed for 99.9% nutrient retention.',
    keywords: ['Nano Banana', 'Cold-pressed', 'Juice', 'Healthy', 'Fresh'],
    authors: [{ name: 'Nano Banana' }],
    openGraph: {
        title: 'Nano Banana | Future of Freshness',
        description: 'Experience the next evolution of cold-pressed juice.',
        type: 'website',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="antialiased">
                {children}
            </body>
        </html>
    )
}
