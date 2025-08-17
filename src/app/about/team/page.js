import { Suspense } from 'react';
import styles from './style.module.scss';
import { notFound } from 'next/navigation';
import TeamImage from "./teamImage";

async function getContent() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/content/teams`, {
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

        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data structure received');
        }

        return {
            title: data.title || 'Our Team',
            subtitle: data.subtitle || '',
            content: data.content || '',
            image: data.image || null,
            meta: data.meta || '',
            members: data.members || []
        };
    } catch (error) {
        console.error('Error fetching team content:', error);

        return {
            title: 'Our Team',
            subtitle: 'Meet the people behind our success',
            content: 'Our diverse team of professionals brings together expertise from various fields.',
            image: null,
            meta: 'Team profiles updated quarterly',
            members: []
        };
    }
}

function ContentSkeleton() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titlePlaceholder}></div>
                <div className={styles.subtitlePlaceholder}></div>
            </div>
            <div className={styles.heroImagePlaceholder}></div>
            <div className={styles.contentPlaceholder}></div>
            <div className={styles.membersGrid}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className={styles.memberCardSkeleton}>
                        <div className={styles.memberImagePlaceholder}></div>
                        <div className={styles.memberNamePlaceholder}></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

async function TeamContent() {
    const content = await getContent();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h2>09</h2>
                <h1 className={styles.title}>{content.title}</h1>
                {content.subtitle && (
                    <p className={styles.subtitle}>{content.subtitle}</p>
                )}
            </header>

            {content.image && (
                <div className={styles.heroImage}>
                    <TeamImage
                        src={content.image}
                        alt={content.title}
                        title={content.title}
                    />
                </div>
            )}

            <article className={styles.content}>
                {content.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className={styles.paragraph}>
                        {paragraph}
                    </p>
                ))}
            </article>

            {content.members && content.members.length > 0 && (
                <div className={styles.teamMembers}>
                    <h2 className={styles.membersTitle}>Our Team</h2>
                    <div className={styles.membersGrid}>
                        {content.members.map((member, index) => (
                            <div key={index} className={styles.memberCard}>
                                {member.image && (
                                    <TeamImage
                                        src={member.image}
                                        alt={member.name}
                                        width={300}
                                        height={300}
                                        className={styles.memberImage}
                                    />
                                )}
                                <h3 className={styles.memberName}>{member.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {content.meta && (
                <footer className={styles.meta}>
                    {content.meta}
                </footer>
            )}
        </div>
    );
}

export default function TeamPage() {
    return (
        <Suspense fallback={<ContentSkeleton />}>
            <TeamContent />
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
            title: 'Our Team',
            description: 'Meet the people behind our success',
        };
    }
}