import NodeCache from 'node-cache';

// TTL is in seconds. Default to 5 minutes (300 seconds)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export const getCache = (key: string) => {
    return cache.get(key);
};

export const setCache = (key: string, value: any, ttl?: number) => {
    if (ttl) {
        return cache.set(key, value, ttl);
    }
    return cache.set(key, value);
};

export const deleteCache = (key: string) => {
    return cache.del(key);
};

export const flushCache = () => {
    return cache.flushAll();
};

export default cache;
