module.exports = {
    apps: [
        {
            name: 'realsme-portfolio-source',
            script: 'npm',
            args: 'start',
            cwd: './',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 4002,
                AUTH_TRUST_HOST: 'true',
                AUTH_URL: 'http://localhost:4002'
            }
        }
    ]
};
