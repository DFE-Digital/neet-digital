const baseConfig = require('./config.json');

const config = {
    ...baseConfig,
    // Add additional properties here
    "GoogleAnalytics": {
        "MeasurementId": process.env.GOOGLE_ANALYTICS_MEASUREMENT_ID || "",
        "ApiSecret": process.env.GOOGLE_ANALYTICS_API_SECRET || ""
    },
    "MicrosoftClarity": {
        "ProjectId": process.env.MICROSOFT_CLARITY_PROJECT_ID || ""
    },
};

module.exports = config;