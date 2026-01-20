module.exports = {
  apps: [{
    name: "magnum",
    script: "dist/index.js",
    cwd: "/sistemas/magnum",
    env_production: {
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://magnumuser:83301100@localhost:5432/magnumtorque"
    }
  }]
}
