/**
 * Email Validation & Anti-Spam Utility
 * Validates email format and blocks disposable/temporary email services
 */

// RFC 5322 compliant email regex pattern
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Common disposable/temporary email domains to block
// Updated list of known spam and temporary email providers
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  // Popular temporary email services
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com",
  "maildrop.cc",
  "throwaway.email",
  "getnada.com",
  "temp-mail.io",
  "yopmail.com",
  "fakeinbox.com",
  "trashmail.com",
  "disposablemail.com",
  "tempinbox.com",
  "sharklasers.com",
  "guerrillamail.info",
  "grr.la",
  "guerrillamail.biz",
  "guerrillamail.de",
  "spam4.me",
  "tempmail.it",
  "dispostable.com",
  "mailnesia.com",
  "mailcatch.com",
  "mintemail.com",
  "jetable.org",
  "throwawaymail.com",
  "emailondeck.com",
  "mytrashmail.com",
  "tempsky.com",
  "mohmal.com",
  "tmail.ws",
  "fake-mail.cf",
  "mailexpire.com",
  "tmails.net",
  "emailfake.com",
  "spamgourmet.com",
  "incognitomail.com",
  "anonbox.net",
  "anonymousemail.me",
  "rootprompt.org",
  "mailforspam.com",
  "spamfree24.org",
  "spamex.com",
  "spambox.us",
  "thankyou2010.com",
  "trash-mail.at",
  "trashmailer.com",
  "trashymail.com",
  "wegwerfmail.de",
  "wegwerfmail.net",
  "wegwerfmail.org",
  "zehnminuten.de",
  "zippymail.info",
  "bugmenot.com",
  "deadaddress.com",
  "dumpmail.de",
  "filzmail.com",
  "getairmail.com",
  "getonemail.com",
  "gishpuppy.com",
  "guerrillamailblock.com",
  "harakirimail.com",
  "imails.info",
  "inboxalias.com",
  "inboxclean.com",
  "inboxclean.org",
  "lifebyfood.com",
  "lookugly.com",
  "meltmail.com",
  "mytempemail.com",
  "nobulk.com",
  "no-spam.ws",
  "nospamfor.us",
  "nowmymail.com",
  "objectmail.com",
  "obobbo.com",
  "oneoffemail.com",
  "otherinbox.com",
  "pookmail.com",
  "prtnx.com",
  "safersignup.de",
  "safetymail.info",
  "sandelf.de",
  "selfdestructingmail.com",
  "sendspamhere.com",
  "shiftmail.com",
  "skeefmail.com",
  "slopsbox.com",
  "smellfear.com",
  "snakemail.com",
  "sneakemail.com",
  "sofort-mail.de",
  "solvemail.info",
  "spambob.com",
  "spambog.com",
  "spamcannon.com",
  "spamcannon.net",
  "spamcorptastic.com",
  "spamcowboy.com",
  "spamcowboy.net",
  "spamcowboy.org",
  "spamday.com",
  "spamfree.eu",
  "spamify.com",
  "spaminator.de",
  "spamkill.info",
  "spaml.com",
  "spaml.de",
  "spammotel.com",
  "spamobox.com",
  "spamspot.com",
  "spamthis.co.uk",
  "spamthisplease.com",
  "spikio.com",
  "spoofmail.de",
  "stuffmail.de",
  "super-auswahl.de",
  "teewars.org",
  "teleworm.com",
  "tempalias.com",
  "tempe-mail.com",
  "tempemail.biz",
  "tempemail.com",
  "TempEMail.net",
  "tempinbox.co.uk",
  "tempmaildemo.com",
  "tempmailer.com",
  "tempmailer.de",
  "tempomail.fr",
  "temporarily.de",
  "temporarioemail.com.br",
  "temporaryemail.net",
  "temporaryforwarding.com",
  "temporaryinbox.com",
  "temporarymailaddress.com",
  "tempthe.net",
  "thankyou2010.com",
  "thisisnotmyrealemail.com",
  "thismail.net",
  "tmailinator.com",
  "trbvm.com",
  "trialmail.de",
  "trillianpro.com",
  "turual.com",
  "twinmail.de",
  "upliftnow.com",
  "venompen.com",
  "veryrealemail.com",
  "viditag.com",
  "viewcastmedia.com",
  "viewcastmedia.net",
  "viewcastmedia.org",
  "webm4il.info",
  "wh4f.org",
  "whyspam.me",
  "willselfdestruct.com",
  "winemaven.info",
  "wronghead.com",
  "www.e4ward.com",
  "www.gishpuppy.com",
  "www.mailinator.com",
  "wwwnew.eu",
  "xagloo.com",
  "xemaps.com",
  "xents.com",
  "xmaily.com",
  "xoxy.net",
  "yapped.net",
  "yogamaven.com",
  "yuurok.com",
  "zehnminuten.de",
  "zippymail.info",
  "junk1e.com",
  "mt2009.com",
  "mt2014.com",
  "proxymail.eu",
  "rcpt.at",
  "sweetxxx.de",
  "emailias.com",
  "nospam.ze.tc",
  "nospamthanks.info",
  "notmailinator.com",
  "mynetstore.de",
]);

/**
 * Validate email format using RFC 5322 compliant regex
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid format
 */
const isValidEmailFormat = (email) => {
  if (!email || typeof email !== "string") {
    return false;
  }
  
  const trimmedEmail = email.trim().toLowerCase();
  
  // Check basic constraints
  if (trimmedEmail.length === 0 || trimmedEmail.length > 254) {
    return false;
  }
  
  // Must contain exactly one @ symbol
  const atCount = (trimmedEmail.match(/@/g) || []).length;
  if (atCount !== 1) {
    return false;
  }
  
  // Test against RFC 5322 regex
  return EMAIL_REGEX.test(trimmedEmail);
};

/**
 * Check if email domain is from a disposable/temporary email service
 * @param {string} email - Email address to check
 * @returns {boolean} - True if disposable domain detected
 */
const isDisposableEmail = (email) => {
  if (!email || typeof email !== "string") {
    return false;
  }
  
  const trimmedEmail = email.trim().toLowerCase();
  const domain = trimmedEmail.split("@")[1];
  
  if (!domain) {
    return false;
  }
  
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
};

/**
 * Comprehensive email validation
 * @param {string} email - Email address to validate
 * @returns {object} - { valid: boolean, reason: string }
 */
const validateEmail = (email) => {
  // Check format first
  if (!isValidEmailFormat(email)) {
    return {
      valid: false,
      reason: "Invalid email format. Please provide a valid email address.",
    };
  }
  
  // Check for disposable email services
  if (isDisposableEmail(email)) {
    return {
      valid: false,
      reason: "Temporary or disposable email addresses are not allowed. Please use a permanent email address.",
    };
  }
  
  return {
    valid: true,
    reason: null,
  };
};

module.exports = {
  validateEmail,
  isValidEmailFormat,
  isDisposableEmail,
};
