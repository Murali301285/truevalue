module.exports = {
    apps: [
        {
            name: 'realsme-portfolio',
            script: 'server.js',
            instances: 1, // Or 'max' to use all CPU cores
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 4002
            }
        }
    ]
};
