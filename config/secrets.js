// add a .env file with the JWT_SECRET you'd like to use

module.exports = {
  jwtSecret:
    process.env.JWT_SECRET || "learn to code, pay $0 until you're hired",
};
