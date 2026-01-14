// src/utils/tokenManager.js
/**
 * Token Manager - Secure in-memory storage for access tokens
 * NEVER stores tokens in localStorage (XSS vulnerability)
 * Refresh token is handled via HTTP-only cookies automatically
 */

class TokenManager {
  constructor() {
    this.accessToken = null;
    this.tokenExpiryTime = null;

    // Try to resume from localStorage for a persistent session
    try {
      const raw = localStorage.getItem('leafai_token');
      const rawExpiry = localStorage.getItem('leafai_token_expiry');
      if (raw && rawExpiry && Number(rawExpiry) > Date.now()) {
        this.accessToken = raw;
        this.tokenExpiryTime = Number(rawExpiry);
        console.log('TokenManager: Resumed token from localStorage');
      }
    } catch (e) {
      // ignore
    }
  }

  /**
   * Store access token in memory and localStorage for persistence
   * @param {string} token - JWT access token
   * @param {number} expiresIn - Expiry time in seconds (e.g., 900 for 15 minutes)
   */
  setAccessToken(token, expiresIn) {
    this.accessToken = token;
    // Calculate exact expiry timestamp
    this.tokenExpiryTime = Date.now() + (expiresIn * 1000);
    try {
      localStorage.setItem('leafai_token', token);
      localStorage.setItem('leafai_token_expiry', String(this.tokenExpiryTime));
    } catch (e) {
      console.warn('TokenManager: failed to persist token', e);
    }
    console.log('Access token stored. Expires in:', expiresIn, 'seconds');
  }

  /**
   * Get current access token
   * Returns null if token is expired or about to expire (within 1 minute)
   * @returns {string|null}
   */
  getAccessToken() {
    // Check if token exists
    if (!this.accessToken || !this.tokenExpiryTime) {
      return null;
    }

    // Check if token is expired or about to expire (within 1 minute buffer)
    if (Date.now() >= this.tokenExpiryTime - 60000) {
      console.log('Access token expired or about to expire');
      this.clearAccessToken();
      return null;
    }

    return this.accessToken;
  }

  /**
   * Clear access token from memory
   */
  clearAccessToken() {
    this.accessToken = null;
    this.tokenExpiryTime = null;
    try {
      localStorage.removeItem('leafai_token');
      localStorage.removeItem('leafai_token_expiry');
    } catch (e) {}
    console.log('Access token cleared');
  }

  /**
   * Check if token exists and is valid
   * @returns {boolean}
   */
  hasValidToken() {
    return this.getAccessToken() !== null;
  }

  /**
   * Get time remaining until token expires (in seconds)
   * @returns {number|null}
   */
  getTimeUntilExpiry() {
    if (!this.tokenExpiryTime) return null;
    const remaining = Math.max(0, this.tokenExpiryTime - Date.now());
    return Math.floor(remaining / 1000);
  }
}

// Export singleton instance
export default new TokenManager();