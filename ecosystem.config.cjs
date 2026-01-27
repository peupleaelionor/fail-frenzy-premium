module.exports = {
  apps: [
    {
      name: 'failfrenzy-engine',
      script: 'npx',
      args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      wait_ready: true,
      listen_timeout: 10000
    }
  ]
}
