// Updated blogs/page.js - Fix for static/dynamic rendering issue
import { Suspense } from 'react';
import styles from './style.module.scss';
import { notFound } from 'next/navigation';
import BlogImage from "./blogImage";
import Text from "@/common/Text/index";

// CRITICAL: These force dynamic rendering
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
        // IMPORTANT: Use absolute URL or handle both cases
        const isServer = typeof window === 'undefined';
        debugInfo.isServer = isServer;
        
        // Try multiple URL strategies
        let baseUrl;
        let urlStrategy = '';
        
        if (isServer) {
            // Strategy 1: Try NEXT_PUBLIC_SITE_URL first
            if (process.env.NEXT_PUBLIC_SITE_URL) {
                baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
                urlStrategy = 'NEXT_PUBLIC_SITE_URL';
            }
            // Strategy 2: Try VERCEL_URL (auto-provided by Vercel)
            else if (process.env.VERCEL_URL) {
                baseUrl = `https://${process.env.VERCEL_URL}`;
                urlStrategy = 'VERCEL_URL';
            }
            // Strategy 3: Try constructing from Vercel environment
            else if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
                baseUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
                urlStrategy = 'VERCEL_PROJECT_PRODUCTION_URL';
            }
            // Strategy 4: Localhost fallback
            else {
                baseUrl = 'http://localhost:3000';
                urlStrategy = 'localhost_fallback';
            }
        } else {
            // Client-side: use current origin
            baseUrl = window.location.origin;
            urlStrategy = 'window.location.origin';
        }
        
        debugInfo.baseUrl = baseUrl;
        debugInfo.urlStrategy = urlStrategy;
        debugInfo.step = 'url_constructed';
        
        // Try internal API call first (server-side)
        if (isServer) {
            try {
                console.log('🔄 Attempting internal API call...');
                // Try calling the API logic directly to bypass network issues
                const { GET } = require('../../api/content/[section]/route');
                const mockRequest = { nextUrl: { searchParams: new Map() } };
                const mockParams = Promise.resolve({ section: 'blogs' });
                
                const response = await GET(mockRequest, { params: mockParams });
                const data = await response.json();
                
                console.log('✅ Internal API call successful:', data);
                debugInfo.method = 'internal_api';
                debugInfo.success = true;
                
                return {
                    title: data.title || 'Our Blog',
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
        
        // Fallback to HTTP fetch
        const apiUrl = `${baseUrl}/api/content/blogs`;
        debugInfo.apiUrl = apiUrl;
        debugInfo.step = 'attempting_fetch';
        
        console.log('🔍 Debug Info:', JSON.stringify(debugInfo, null, 2));
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(apiUrl, {
            signal: controller.signal,
            cache: 'no-store',
            next: { revalidate: 0 },
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
            title: data.title || 'Our Blog',
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
        
        console.error('💥 Error fetching blog content:', error);
        console.error('💥 Full error object:', {
            error,
            type: typeof error,
            constructor: error?.constructor?.name,
            isNull: error === null,
            isUndefined: error === undefined
        });
        console.error('💥 Debug Info:', JSON.stringify(debugInfo, null, 2));
        
        // Return fallback data with debug info
        return {
            title: 'Our Blog (Error Mode)',
            subtitle: 'Debug information available below',
            content: `Error loading content. Debug info: ${JSON.stringify(debugInfo, null, 2)}`,
            image: null,
            meta: 'Content temporarily unavailable',
            debugInfo,
            error: error?.message || 'Unknown error occurred'
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

// This component will be rendered on the server for each request
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
                    {/* Debug info - remove after fixing */}
                    <div style={{
                        marginTop: '20px',
                        padding: '10px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#666'
                    }}>
                        <strong>Debug Info:</strong><br/>
                        Loaded at: {new Date().toISOString()}<br/>
                        Content length: {content.content?.length || 0} characters<br/>
                        Has image: {content.image ? 'Yes' : 'No'}<br/>
                        Environment: {process.env.NODE_ENV}
                    </div>
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
        console.error('Error generating metadata:', error);
        return {
            title: 'Our Blog',
            description: 'Latest insights and updates from our team',
        };
    }
}