# Security Policy

## Security Reporting

### Responsible Disclosure

If you discover a security vulnerability, please **email security@pacifica.fi** instead of using public GitHub issues.

**Please include:**
- Type of vulnerability
- Location (file, function, line)
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

**Do not:**
- Public disclosure before patch
- Access other users' data
- Modify or delete data
- Disrupt service availability

We will:
1. Acknowledge your report within 24 hours
2. Investigate and confirm vulnerability
3. Work on fix (prioritized by severity)
4. Notify you when patch is released
5. Credit you (if desired) in security advisory

---

## Security Standards

### Authentication & Authorization

#### Wallet-Based Authentication
- Ed25519 signature verification using PyNaCl
- Message format: `sentra_terminal-{wallet}-{timestamp}`
- Replay protection: timestamp validation (5-minute window)
- No private keys transmitted

**Flow:**
```
1. Frontend requests auth message: POST /auth/message
2. Backend generates random message: "Sign this message: {random_string}"
3. Wallet signs message using Ed25519
4. Frontend submits signature: POST /auth/login
5. Backend verifies signature and issues JWT token
```

#### JWT Tokens
- Algorithm: HS256 (HMAC with SHA-256)
- Access tokens: 1-hour expiration
- Refresh tokens: 7-day expiration
- Stored in httpOnly cookies (frontend never accesses via JS)
- Token validation on every request

#### Authorization
- Role-based access control (RBAC)
- Roles: `user`, `trader`, `admin`
- Permissions checked per endpoint
- Public endpoints: markets list, health check

### Data Protection

#### In Transit
- HTTPS/TLS 1.3 minimum in production
- WSS (WebSocket Secure) for real-time connections
- Certificate pinning for API client libraries

#### At Rest
- PostgreSQL SSL connections
- Encryption at application level for sensitive data
- Encrypted environment variables in CI/CD

#### API Keys
- Never logged or printed
- Stored in environment variables only
- Rotated quarterly
- Different keys per environment (dev/staging/prod)

### Database Security

```sql
-- Row-level security
CREATE POLICY user_positions_policy ON positions
  USING (wallet_address = current_user_wallet());

-- Audit logging
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(255),
  action VARCHAR(20),
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Backup encryption
pg_dump --format=custom --compress=9 | gpg --encrypt > backup.sql.gpg
```

### Input Validation

#### Backend (FastAPI/Pydantic)
```python
from pydantic import BaseModel, Field, validator

class MarketQuery(BaseModel):
    symbol: str = Field(..., regex="^[A-Z]{1,10}-PERP$")
    limit: int = Field(default=100, ge=1, le=1000)
    hours: int = Field(default=24, ge=1, le=8760)

    @validator('symbol')
    def validate_symbol(cls, v):
        # Whitelist check
        if v not in SUPPORTED_SYMBOLS:
            raise ValueError(f"Unsupported symbol: {v}")
        return v
```

#### Frontend (React/TypeScript)
```typescript
// Input sanitization
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')  // Remove HTML tags
    .trim()
    .substring(0, 255);    // Limit length
};

// Type safety prevents many injection attacks
const query: IMarketQuery = {
  symbol: sanitizeInput(userInput),
  limit: Math.min(Math.max(userLimit, 1), 1000),  // Clamp range
};
```

### Rate Limiting

```python
# Backend rate limiting (using slowapi)
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/markets/")
@limiter.limit("100/minute")
def get_markets(request: Request):
    pass

# Per-user rate limiting for authenticated endpoints
@app.get("/analytics/")
@limiter.limit("1000/hour; 100/minute")
def analytics(request: Request, current_user: User = Depends(get_current_user)):
    pass
```

### CORS Configuration

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sentra.example.com",
        "https://app.sentra.example.com",
    ],  # Never use "*" in production
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Restrict to necessary methods
    allow_headers=["Authorization", "Content-Type"],
    max_age=3600,
)
```

### SQL Injection Prevention

✅ **Safe** - Using SQLAlchemy ORM:
```python
markets = db.query(Market).filter(Market.symbol == symbol).all()
```

❌ **Unsafe** - Raw string formatting:
```python
query = f"SELECT * FROM markets WHERE symbol = '{symbol}'"  # NEVER do this
```

### XSS Prevention

React automatically escapes JSX expressions:
```typescript
// Safe - React escapes the string
const market = "BTC-PERP</script>";
return <div>{market}</div>;  // Renders as "BTC-PERP&lt;/script&gt;"
```

But be careful with `dangerouslySetInnerHTML`:
```typescript
// Unsafe - allows HTML injection
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// Safe - sanitize first
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

### CSRF Protection

- Tokens included in POST/PUT/DELETE requests
- SameSite cookies (strict mode)
- Origin/Referer header validation

```python
from fastapi_csrf_protect import CsrfProtect

@app.post("/orders/")
async def create_order(
    csrf_protect: CsrfProtect = Depends()
):
    pass  # Automatic CSRF validation
```

---

## Dependency Management

### Regular Updates

```bash
# Backend
pip list --outdated
pip-audit --desc  # Check for known vulnerabilities

# Frontend
npm outdated
npm audit  # Check for vulnerabilities
npm audit fix  # Auto-fix where possible
```

### Dependency Security Scanning

GitHub Actions automatically:
1. Runs `pip-audit` on backend dependencies
2. Runs `npm audit` on frontend dependencies
3. Fails build if high-severity vulnerabilities found

```yaml
# In .github/workflows/security.yml
- name: Audit Python dependencies
  run: pip-audit --desc --strict

- name: Audit Node dependencies
  run: npm audit --production --audit-level=moderate
```

### Pinning Versions

Always pin major versions in production:
```txt
# requirements.txt - Pin major versions
fastapi==0.114.*
sqlalchemy==2.0.*
```

Never use:
```txt
fastapi  # No version constraint (dangerous)
fastapi==*  # Equivalent to no constraint
```

---

## Infrastructure Security

### Environment Variables

**Development (.env):**
```bash
DEBUG=True
DATABASE_URL=postgresql://localhost/sentra_dev
PACIFICA_API_KEY=dev_key_only
```

**Production (.env):**
```bash
DEBUG=False
DATABASE_URL=postgresql://user:password@prod-db:5432/sentra
PACIFICA_API_KEY=${PACIFICA_API_KEY}  # Injected from secrets
ALLOWED_ORIGINS=https://sentra.example.com
```

### Secrets Management

```bash
# GitHub Actions Secrets
Settings → Secrets and variables → Actions → New repository secret
- PACIFICA_API_KEY
- DATABASE_PASSWORD
- JWT_SECRET_KEY
- DEPLOY_KEY

# In workflow
- name: Deploy
  env:
    PACIFICA_API_KEY: ${{ secrets.PACIFICA_API_KEY }}
```

### Database Backups

```bash
# Automated backup script
#!/bin/bash
BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql.gpg"
pg_dump $DATABASE_URL | gpg --encrypt -r your@email.com > $BACKUP_FILE

# Store in S3 with encryption
aws s3 cp $BACKUP_FILE s3://sentra-backups/ --sse AES256

# Retention policy: Keep last 30 days, archive older
```

### Server Hardening

```bash
# SSH Security
PubkeyAuthentication yes
PasswordAuthentication no  # Disable password login
PermitRootLogin no

# Firewall
ufw enable
ufw allow 22/tcp    # SSH
ufw allow 443/tcp   # HTTPS
ufw allow 80/tcp    # HTTP (redirect to HTTPS)
ufw deny incoming   # Default deny

# Fail2ban (brute force protection)
apt-get install fail2ban
systemctl enable fail2ban
```

---

## API Security Checklist

- [ ] All endpoints require authentication (except public list endpoints)
- [ ] Rate limiting enabled (per-user and global)
- [ ] Input validation on all requests
- [ ] CORS properly configured (whitelist origins)
- [ ] HTTPS enforced (redirect HTTP to HTTPS)
- [ ] CSRF tokens for state-changing operations
- [ ] Security headers set (CSP, X-Frame-Options, X-Content-Type-Options)
- [ ] Error messages don't leak system details
- [ ] Sensitive data not logged
- [ ] Dependencies audited and patched
- [ ] Database backups encrypted and tested
- [ ] Secrets rotated quarterly
- [ ] Security events logged and monitored
- [ ] Penetration testing done pre-launch

### Security Headers

```python
from fastapi.middleware import Middleware
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        return response
```

---

## Incident Response

### Security Incident Report

If a breach is suspected:

1. **Immediate Actions (within 1 hour)**
   - Identify affected systems
   - Isolate if necessary
   - Begin logging all actions
   - Notify security team

2. **Investigation (within 4 hours)**
   - Collect evidence
   - Determine scope and severity
   - Assess data exposure
   - Identify root cause

3. **Notification (within 24 hours)**
   - Notify affected users
   - Provide remediation steps
   - Publish security advisory
   - Begin incident post-mortem

4. **Recovery (ongoing)**
   - Patch vulnerability
   - Deploy fix to production
   - Monitor for further incidents
   - Publish post-mortem report

---

## Security Contacts

- **Security Issues**: security@pacifica.fi
- **Maintainer**: [Reinasboo](https://github.com/Reinasboo)
- **Response Time**: 24 hours
- **Patch Time**: 72 hours (critical), 2 weeks (high)

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Solana Security Best Practices](https://docs.solana.com/security)

---

**Last Updated**: April 16, 2026

For questions about security, please contact the maintainers privately.
