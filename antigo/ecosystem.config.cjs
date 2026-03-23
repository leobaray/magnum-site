module.exports = {
  apps: [{
    name: "magnum",
    script: "dist/index.js",
    cwd: "/sistemas/magnum",
    env_production: {
      NODE_ENV: "production"
      // DATABASE_URL e SESSION_SECRET devem estar no .env do servidor
      // (nunca commitar credenciais aqui)
    }
  }]
}
