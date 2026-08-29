import crypto from "node:crypto";

const buckets = new Map();

const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, value] of buckets.entries()) {
    if (value.resetAt <= now) buckets.delete(key);
  }
}, 60_000);
cleanup.unref?.();

export const requestContext = (req, res, next) => {
  const supplied = req.get("X-Request-Id");
  req.requestId = supplied && supplied.length <= 128 ? supplied : crypto.randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
};

export const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
};

export const createRateLimiter = ({ windowMs, max, keyPrefix, message }) => {
  return (req, res, next) => {
    const key = `${keyPrefix}:${req.ip || req.socket?.remoteAddress || "unknown"}`;
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader("RateLimit-Limit", max);
      res.setHeader("RateLimit-Remaining", Math.max(max - 1, 0));
      return next();
    }

    current.count += 1;
    res.setHeader("RateLimit-Limit", max);
    res.setHeader("RateLimit-Remaining", Math.max(max - current.count, 0));
    res.setHeader("RateLimit-Reset", Math.ceil(current.resetAt / 1000));

    if (current.count > max) {
      res.setHeader("Retry-After", Math.ceil((current.resetAt - now) / 1000));
      return res.status(429).json({
        success: false,
        message,
        requestId: req.requestId,
      });
    }

    next();
  };
};

export const apiRateLimiter = createRateLimiter({
  windowMs: 60_000,
  max: Number(process.env.API_RATE_LIMIT_PER_MINUTE) || 180,
  keyPrefix: "api",
  message: "Too many requests. Please try again shortly.",
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60_000,
  max: Number(process.env.AUTH_RATE_LIMIT_PER_15_MINUTES) || 20,
  keyPrefix: "auth",
  message: "Too many authentication attempts. Please try again later.",
});

export const __resetRateLimitersForTests = () => buckets.clear();
