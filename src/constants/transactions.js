const DEFAULT_CR_ID = 1; // Default Commission Rule is Seeded to ID 1
const MISC_CHARGE_PCT = 0.07; // Default miscellaneous charge is 7%
const HOLDING_PERIOD = 7; // Default 7 days holding period for refund
const PETHUB_STRIPE_HOLDING_ACCT_EMAIL = 'pethub@gmail.com'; // Pethub's holding account for holding and payout funds

module.exports = {
    HOLDING_PERIOD,
    DEFAULT_CR_ID,
    MISC_CHARGE_PCT,
    PETHUB_STRIPE_HOLDING_ACCT_EMAIL
};
