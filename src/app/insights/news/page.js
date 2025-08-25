import {Suspense} from 'react';
import styles from './style.module.scss';
import {notFound} from 'next/navigation';
import NewsImage from "./newsImage";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

async function getContent() {
    let debugInfo = {
        step: 'starting',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        isServer: typeof window === 'undefined'
    };

    try {
        const isServer = typeof window === 'undefined';
        debugInfo.isServer = isServer;

        let baseUrl;
        let urlStrategy = '';

        if (isServer) {
            if (process.env.NEXT_PUBLIC_SITE_URL) {
                baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
                urlStrategy = 'NEXT_PUBLIC_SITE_URL';
            } else if (process.env.VERCEL_URL) {
                baseUrl = `https://${process.env.VERCEL_URL}`;
                urlStrategy = 'VERCEL_URL';
            } else if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
                baseUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
                urlStrategy = 'VERCEL_PROJECT_PRODUCTION_URL';
            } else {
                baseUrl = 'http://localhost:3000';
                urlStrategy = 'localhost_fallback';
            }
        } else {
            baseUrl = window.location.origin;
            urlStrategy = 'window.location.origin';
        }

        debugInfo.baseUrl = baseUrl;
        debugInfo.urlStrategy = urlStrategy;
        debugInfo.step = 'url_constructed';

        if (isServer) {
            try {
                console.log('🔄 Attempting internal API call...');
                const {GET} = require('../../api/content/[section]/route');
                const mockRequest = {nextUrl: {searchParams: new Map()}};
                const mockParams = Promise.resolve({section: 'newsletter'});

                const response = await GET(mockRequest, {params: mockParams});
                const data = await response.json();

                console.log('✅ Internal API call successful:', data);
                debugInfo.method = 'internal_api';
                debugInfo.success = true;

                return {
                    title: data.title || 'News & Updates',
                    subtitle: data.subtitle || '',
                    content: data.content || 'Content is being loaded...',
                    image: data.image || null,
                    meta: data.meta || '',
                    debugInfo
                };
            } catch (internalError) {
                console.log('⚠️ Internal API call failed, falling back to HTTP:', internalError.message);
                debugInfo.internalApiError = internalError.message;
            }
        }

        const apiUrl = `${baseUrl}/api/content/newsletter`;
        debugInfo.apiUrl = apiUrl;
        debugInfo.step = 'attempting_fetch';

        console.log('🔍 Debug Info:', JSON.stringify(debugInfo, null, 2));

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(apiUrl, {
            signal: controller.signal,
            cache: 'no-store',
            next: {revalidate: 0},
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

        clearTimeout(timeoutId);
        debugInfo.step = 'fetch_completed';
        debugInfo.responseStatus = response.status;

        console.log('📡 Response status:', response.status);
        console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            debugInfo.errorText = errorText;
            debugInfo.step = 'response_not_ok';

            console.error('❌ API Error Response:', errorText);
            console.error('❌ Full response:', {
                status: response.status,
                statusText: response.statusText,
                url: response.url
            });

            if (response.status === 404) {
                notFound();
            }
            throw new Error(`Failed to fetch content: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        debugInfo.step = 'json_parsed';
        debugInfo.dataReceived = !!data;
        debugInfo.method = 'http_fetch';
        debugInfo.success = true;

        console.log('✅ Received data:', data);

        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data structure received');
        }

        return {
            title: data.title || 'News & Updates',
            subtitle: data.subtitle || '',
            content: data.content || 'Content is being loaded...',
            image: data.image || null,
            meta: data.meta || '',
            debugInfo
        };

    } catch (error) {
        debugInfo.step = 'error_caught';
        debugInfo.error = {
            message: error?.message || 'Unknown error',
            name: error?.name || 'Unknown',
            stack: error?.stack || 'No stack trace',
            toString: error?.toString() || 'No string representation'
        };

        console.error('💥 Error fetching newsletter content:', error);
        console.error('💥 Full error object:', {
            error,
            type: typeof error,
            constructor: error?.constructor?.name,
            isNull: error === null,
            isUndefined: error === undefined
        });
        console.error('💥 Debug Info:', JSON.stringify(debugInfo, null, 2));

        return {
            title: 'News & Updates (Error Mode)',
            subtitle: 'Debug information available below',
            content: `Error loading content. Debug info: ${JSON.stringify(debugInfo, null, 2)}`,
            image: null,
            meta: 'Published monthly',
            debugInfo,
            error: error?.message || 'Unknown error occurred'
        };
    }
}

function ContentSkeleton() {
    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <div className={styles.heroImage} style={{backgroundColor: '#f0f0f0', height: '400px'}}>
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

async function NewsContent() {
    const content = await getContent();

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <NewsImage
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

export default function NewsPage() {
    return (
        <Suspense fallback={<ContentSkeleton/>}>
            <NewsContent/>
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
                images: content.image ? [{url: content.image}] : [],
            },
        };
    } catch (error) {
        return {
            title: 'News & Updates',
            description: 'Stay informed with our latest news and updates',
        };
    }
}
