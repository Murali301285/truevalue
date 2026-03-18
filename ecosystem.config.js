module.exports = {
    apps: [
        {
            name: 'realsme-portfolio',
            script: '.next/standalone/server.js',
            args: '', // Standalone server handles port via env
            cwd: './',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 6001,
                AUTH_TRUST_HOST: 'true',
                AUTH_URL: 'http://localhost:6001'
            }
        }
    ]
};
