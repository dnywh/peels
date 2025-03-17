'use client';

const UTM_STORAGE_KEY = 'attribution_params';

export function captureAttributionParams() {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Get UTM params from URL
    const params = new URLSearchParams(window.location.search);
    const utmParams = {
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign')
    };

    // Only store if we have at least one UTM parameter
    if (Object.values(utmParams).some(value => value)) {
        console.log('Capturing UTM params:', utmParams);
        localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmParams));
    }
}

export function getStoredAttributionParams() {
    // Only run in browser
    if (typeof window === 'undefined') return {};

    try {
        const stored = localStorage.getItem(UTM_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        console.error('Error reading attribution params:', e);
        return {};
    }
}

export function clearAttributionParams() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(UTM_STORAGE_KEY);
} 
