# Security Policy

> Security is a top priority for BlackRoad OS

---

## 🔐 Supported Versions

| Version | Supported |
|---------|-----------|
| Latest | ✅ Active support |

---

## 🚨 Reporting a Vulnerability

### DO NOT

- ❌ Open a public GitHub issue
- ❌ Post on social media
- ❌ Share in public channels

### DO

1. **Email** security@blackroad.io (or blackroad.systems@gmail.com)
2. **Include** detailed information

### What to Include

```
Subject: [SECURITY] Brief description

1. Description of vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)
5. Your contact info (for follow-up)
```

### Response Timeline

| Phase | Timeline |
|-------|----------|
| Initial response | 24 hours |
| Triage & assessment | 72 hours |
| Fix development | 7-14 days |
| Coordinated disclosure | 90 days |

---

## 🔒 Security Best Practices

### For Contributors

1. **Never commit secrets**
   ```bash
   # Use environment variables
   export API_KEY="your-key"

   # Or .env files (gitignored)
   echo "API_KEY=your-key" >> .env
   ```

2. **Validate all input**

3. **Keep dependencies updated**

---

## 📞 Security Contacts

| Role | Contact |
|------|---------|
| Security Lead | security@blackroad.io |
| Backup | blackroad.systems@gmail.com |

---

*Last updated: 2026-02-28*
