const cookiePreferences = (function () {
    const cookieExpiry = 2592000000; // 30 days
    const config = require('./config.json');

    /*
    | ----------- | ------------------------------ |
    | Cookie Name | Purpose & Provider             |
    | ----------- | ------------------------------ |
    | _clck       | Usage - MS Clarity             |
    | _clsk       | Usage - MS Clarity             |
    | _ga         | Usage - Google Analytics       |
    | _ga_*       | Usage - Google Analytics       |
    | _gat_UA-*   | Usage - Google Analytics       |
    | _gid        | Usage - Google Analytics       |
    | ----------- | ------------------------------ |
*/

    var COOKIE_CATEGORIES = {
        // Mandatory Cookies
        'cookies_policy': ['essential'],
        'cookies_preferences_set': ['essential'],

        // Optional Cookies - Usage
        '_ga': ['usage'],
        '_gid': ['usage'],
        '_gat': ['usage'],
        ["_ga_" + config.GoogleAnalytics.measurementId.substr(2)]: ['usage'],
        ["_gat_" + config.GoogleAnalytics.measurementId.substr(2)]: ['usage'],
        '_clck': ['usage'],
        '_clsk': ['usage'],
        'CLID': ['usage'],
        'ANONCHK': ['usage'],
        'MR': ['usage'],
        'MUID': ['usage'],
        'SM': ['usage'],

    }
    defaultCookieTypes = function (req, res) {
        var consent = {
            'essential': true,
            'usage': false,
            'marketing': false,
            'version': 1
        };

        res.cookie('cookies_policy', JSON.stringify(consent), { maxAge: cookieExpiry, httpOnly: true });
       };

    rejectAllCookieTypes = function (req, res) {
        defaultCookieTypes(req, res);
        deleteUnconsentedCookies(req, res, 'essential');
        res.cookie('cookies_preferences_set', true, { maxAge: cookieExpiry, httpOnly: true });
    };

    approveAllCookieTypes = function (req, res) {
        var consent = {
            'essential': true,
            'usage': true,
            'marketing': false,
            'version': 1
        };

        res.cookie('cookies_policy', JSON.stringify(consent), { maxAge: cookieExpiry, httpOnly: true });
        res.cookie('cookies_preferences_set', true, { maxAge: cookieExpiry, httpOnly: true });
     };

    function deleteUnconsentedCookies(req, res, consentState) {
        // Delete cookies of that type if consent being set to false
        for (var cookie in COOKIE_CATEGORIES) {
            var types = COOKIE_CATEGORIES[cookie];
            var allowed = false;
            for (var i = 0; i < types.length; i++) {
                if (consentState && types[i] == consentState) {
                    allowed = true;
                }
            }
            if (!allowed) {
                res.clearCookie(cookie, { path: '/' });
            }
        }
    }

    return {
        defaultCookieTypes: defaultCookieTypes,
        rejectAllCookieTypes: rejectAllCookieTypes,
        approveAllCookieTypes: approveAllCookieTypes
    };
})();

module.exports = cookiePreferences;