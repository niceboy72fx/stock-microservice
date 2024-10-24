require("dotenv").config({ path: "./env/.env" });
const config = {
    verbose: true,
    "testMatch": [
        "**/tests/**/*.test.ts"
    ]
};

module.exports = config;