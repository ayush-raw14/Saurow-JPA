import { Suspense } from 'react';
import styles from './style.module.scss';
import { notFound } from 'next/navigation';
import EventsImage from './eventImage';

async function getContent() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/content/events`, {
            next: {
                revalidate: process.env.NODE_ENV === 'production' ? 300 : 0
            },
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            console.error('API Response not OK:', response.status, response.statusText);

            if (response.status === 404) {
                notFound();
            }

            throw new Error(`Failed to fetch content: ${response.status}`);
        }

        const data = await response.json();

        // Validate the data structure
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data structure received');
        }

        return {
            title: data.title || 'Our Events',
            subtitle: data.subtitle || '',
            content: data.content || 'Content is being loaded...',
            image: data.image || null,
            meta: data.meta || ''
        };
    } catch (error) {
        console.error('Error fetching events content:', error);
        return {
            title: 'Our Events',
            subtitle: 'Join us at our upcoming events',
            content: 'We regularly host events, workshops, and conferences. Please check back later for upcoming event details.',
            image: null,
            meta: 'Event information temporarily unavailable'
        };
    }
}

function ContentSkeleton() {
    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <div className={styles.heroImage}>
                    <div>
                        Loading events...
                    </div>
                </div>
                <div className={styles.heroContent}>
                    <div style={{
                        height: '40px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '4px',
                        marginBottom: '10px'
                    }}></div>
                    <div style={{
                        height: '20px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '4px',
                        width: '60%'
                    }}></div>
                </div>
            </div>
        </div>
    );
}

async function EventsContent() {
    const content = await getContent();

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <EventsImage
                    src={content.image}
                    alt={content.title}
                    title={content.title}
                />
                <div className={styles.heroContent}>
                    <h1>{content.title}</h1>
                    {content.subtitle && (
                        <p className={styles.subtitle}>{content.subtitle}</p>
                    )}
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.contentBody}>
                    <p>{content.content}</p>
                </div>

                {content.meta && (
                    <div className={styles.meta}>
                        {content.meta}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function EventsPage() {
    return (
        <Suspense fallback={<ContentSkeleton />}>
            <EventsContent />
        </Suspense>
    );
}

export async function generateMetadata() {
    try {
        const content = await getContent();
        return {
            title: content.title,
            description: content.subtitle || content.content?.substring(0, 160),
            openGraph: {
                title: content.title,
                description: content.subtitle || content.content?.substring(0, 160),
                images: content.image ? [{ url: content.image }] : [],
            },
        };
    } catch (error) {
        return {
            title: 'Our Events',
            description: 'Join us at our upcoming events and activities',
        };
    }
}