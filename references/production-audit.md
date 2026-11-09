# Production Audit — Survive Launch

## Pre-Launch Checklist

### Reliability
- [ ] Health endpoint (`/health`) returns 200 with dependency status
- [ ] Graceful degradation (feature flags for non-critical paths)
- [ ] Circuit breakers on external dependencies
- [ ] Retry logic with exponential backoff on all external calls
- [ ] Timeouts configured (not infinite) on all HTTP clients
- [ ] Idempotency keys on all mutations

### Observability
- [ ] Structured JSON logs (level, timestamp, service, traceId, message, context)
- [ ] Request tracing (traceId propagated through all services)
- [ ] Metrics: latency (p50/p95/p99), error rate, throughput, saturation
- [ ] Alerts: error rate > 1%, p99 latency > SLO, saturation > 80%
- [ ] Dashboards: RED metrics (Rate, Errors, Duration) per endpoint

### Security
- [ ] No secrets in code, logs, or Docker images
- [ ] Input validation at all boundaries (Zod schemas)
- [ ] Rate limiting on all public endpoints
- [ ] CORS configured correctly
- [ ] Security headers (CSP, HSTS, X-Frame-Options)
- [ ] Dependency scanning (npm audit, Snyk, GitHub Dependabot)

### Data
- [ ] Migrations tested with `supabase db reset` / equivalent
- [ ] Backup strategy tested (restore drill quarterly)
- [ ] PII encrypted at rest, minimal in logs
- [ ] GDPR/CCPA compliance if applicable

### Deployment
- [ ] Blue-green or rolling deployment
- [ ] Rollback procedure documented and tested (< 5 min)
- [ ] Feature flags for risky changes
- [ ] Canary deployment for high-risk changes
- [ ] Database migrations run before code deploy (backward compatible)

## Incident Response

### Runbook Template
```markdown
# Runbook: [Service Name]

## Symptoms
- [Alert name] triggers when [metric] > [threshold]

## Diagnosis
1. Check [dashboard] for [specific panels]
2. Run `kubectl logs -l app=[service] --tail=100`
3. Check [dependency] status page

## Mitigation
- **Quick:** [Feature flag to disable] / [Scale replicas]
- **Root cause:** [Fix steps]

## Contacts
- Primary: [Name, Slack, Phone]
- Secondary: [Name, Slack, Phone]

## Post-Incident
- Incident doc template linked
- Action items tracked in [tracker]
```

### Severity Levels
| Level | Definition | Response Time | Escalation |
|-------|------------|---------------|------------|
| SEV-1 | User-facing outage, data loss | 15 min | Page primary + secondary |
| SEV-2 | Degraded performance, partial outage | 1 hour | Page primary |
| SEV-3 | Minor issue, workaround exists | 4 hours | Assign to team |

## Capacity Planning

```typescript
// Load test script
import { check, sleep } from "k6";
import http from "k6/http";

export const options = {
  stages: [
    { duration: "2m", target: 100 },   // Ramp up
    { duration: "5m", target: 100 },   // Steady state
    { duration: "2m", target: 500 },   // Stress
    { duration: "5m", target: 500 },   // Sustained stress
    { duration: "2m", target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res = http.get("https://api.example.com/health");
  check(res, { "status 200": r => r.status === 200 });
  sleep(1);
}
```

**Run weekly.** Track trends. Scale before you need to.

## Your Production Rules (Add to .ai-rules.md)

```markdown
- RULE: Health endpoint checks ALL dependencies (DB, cache, external APIs)
- RULE: Structured JSON logs with traceId — no printf debugging in prod
- RULE: Alerts on symptoms (error rate, latency), not causes (CPU, memory)
- RULE: Runbook for every alert — diagnosis + mitigation steps
- RULE: Rollback tested monthly, < 5 minutes
- RULE: Load test before launch, weekly after
- RULE: Feature flags for every risky change
```