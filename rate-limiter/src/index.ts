// Once middleware is complete, import and export the middleware from this file
import endpointMonitor from "./middleware/monitoring.js";
import rateLimiter from "./middleware/rate-limit.js";

const gleiphQL = {
  endpointMonitor,
  rateLimiter
}

export default gleiphQL