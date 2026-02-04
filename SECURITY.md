# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of TraceTrash seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to:

- **Email:** contacto@axoloit.com
- **Subject:** [SECURITY] TraceTrash Vulnerability Report

### What to Include

Please include the following information in your report:

- Type of vulnerability (e.g., SQL injection, XSS, authentication bypass)
- Full paths of affected source files
- Location of the affected code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability
- Suggested remediation (if available)

### Response Timeline

- **Acknowledgment:** We will acknowledge receipt of your vulnerability report within 48 hours
- **Initial Assessment:** We will provide an initial assessment within 5 business days
- **Resolution:** We aim to resolve critical vulnerabilities within 30 days

### Responsible Disclosure

We request that you:

- Allow us reasonable time to respond before public disclosure
- Make a good faith effort to avoid privacy violations, data destruction, and service interruption
- Do not exploit the vulnerability beyond what is necessary to demonstrate it

### Recognition

We appreciate the security research community's efforts and will:

- Acknowledge your responsible disclosure (if you wish)
- Keep you informed of the remediation process
- Credit you in our security advisories (unless you prefer to remain anonymous)

## Security Best Practices for Users

### For Developers

1. **Never commit sensitive data:**
   - Use `.env` files for configuration (already in `.gitignore`)
   - Store Firebase credentials locally, never in code
   - Use environment variables for all API keys

2. **Keep dependencies updated:**
   - Run `npm audit` regularly
   - Update packages with known vulnerabilities

3. **Firebase Security Rules:**
   - Review and test Firestore security rules regularly
   - Implement principle of least privilege
   - Enable Firebase App Check for production

### For End Users

1. **Use strong passwords:**
   - Minimum 8 characters
   - Mix of letters, numbers, and symbols

2. **Keep the app updated:**
   - Install updates promptly for security patches

3. **Report suspicious activity:**
   - Contact support immediately if you notice unusual behavior

## Security Measures Implemented

- 🔒 Firebase Authentication for secure user management
- 🔒 Firestore Security Rules for data access control
- 🔒 Input validation and sanitization
- 🔒 Encrypted data transmission (HTTPS/TLS)
- 🔒 Secure token storage using `expo-secure-store`

## Additional Resources

- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/best-practices)
- [React Native Security Guide](https://reactnative.dev/docs/security)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)

---

**Last Updated:** February 4, 2026  
**Contact:** contacto@axoloit.com
