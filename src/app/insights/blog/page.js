import { Suspense } from 'react';
import styles from './style.module.scss';
import { notFound } from 'next/navigation';
import BlogImage from "./blogImage";
import Text from "@/common/Text/index";

// Force dynamic rendering - this is crucial for real-time updates
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getContent() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/content/blogs`, {
            // Remove caching entirely for real-time updates
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
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

        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data structure received');
        }

        return {
            title: data.title || 'Our Blog',
            subtitle: data.subtitle || '',
            content: data.content || 'Content is being loaded...',
            image: data.image || null,
            meta: data.meta || ''
        };
    } catch (error) {
        console.error('Error fetching blog content:', error);

        return {
            title: 'Our Blog',
            subtitle: 'Latest insights and updates',
            content: 'We share the latest insights, industry trends, and company updates. Please check back later for more content.',
            image: null,
            meta: 'Content temporarily unavailable'
        };
    }
}

function ContentSkeleton() {
    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <div className={styles.heroImage} style={{ backgroundColor: '#f0f0f0', height: '400px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: '#666'
                    }}>
                        Loading...
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

async function BlogContent() {
    const content = await getContent();

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <BlogImage
                    src={content.image}
                    alt={content.title}
                    title={content.title}
                />
                <div className={styles.heroContent}>
                    <Text><h1>{content.title}</h1></Text>
                    {content.subtitle && (
                        <Text><p className={styles.subtitle}>{content.subtitle}</p></Text>
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

export default function BlogPage() {
    return (
        <Suspense fallback={<ContentSkeleton />}>
            <BlogContent />
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
            title: 'Our Blog',
            description: 'Latest insights and updates from our team',
        };
    }
}