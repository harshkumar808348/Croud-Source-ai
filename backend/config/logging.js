// Logging configuration
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

const currentLogLevel = process.env.LOG_LEVEL || 'INFO';

const shouldLog = (level) => {
    return LOG_LEVELS[level] <= LOG_LEVELS[currentLogLevel];
};

// Clean logging functions
export const logger = {
    error: (message, ...args) => {
        if (shouldLog('ERROR')) {
            console.error(`❌ ${message}`, ...args);
        }
    },
    
    warn: (message, ...args) => {
        if (shouldLog('WARN')) {
            console.warn(`⚠️ ${message}`, ...args);
        }
    },
    
    info: (message, ...args) => {
        if (shouldLog('INFO')) {
            console.log(`ℹ️ ${message}`, ...args);
        }
    },
    
    success: (message, ...args) => {
        if (shouldLog('INFO')) {
            console.log(`✅ ${message}`, ...args);
        }
    },
    
    debug: (message, ...args) => {
        if (shouldLog('DEBUG')) {
            console.log(`🔍 ${message}`, ...args);
        }
    }
};

// Environment-based logging
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Production logging (minimal)
export const prodLogger = {
    error: (message, ...args) => console.error(`❌ ${message}`, ...args),
    warn: (message, ...args) => console.warn(`⚠️ ${message}`, ...args),
    info: (message, ...args) => console.log(`ℹ️ ${message}`, ...args),
    success: (message, ...args) => console.log(`✅ ${message}`, ...args),
    debug: () => {} // No debug logs in production
};

export default logger;

