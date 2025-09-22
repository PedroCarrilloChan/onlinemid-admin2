import { onRequestPost as __api_auth_login_ts_onRequestPost } from "/home/runner/workspace/functions/api/auth/login.ts"
import { onRequestGet as __api_public_content_ts_onRequestGet } from "/home/runner/workspace/functions/api/public/content.ts"
import { onRequestGet as __api_customers_ts_onRequestGet } from "/home/runner/workspace/functions/api/customers.ts"
import { onRequestOptions as __api_customers_ts_onRequestOptions } from "/home/runner/workspace/functions/api/customers.ts"
import { onRequestPost as __api_customers_ts_onRequestPost } from "/home/runner/workspace/functions/api/customers.ts"
import { onRequestGet as __api_debug_ts_onRequestGet } from "/home/runner/workspace/functions/api/debug.ts"
import { onRequest as __api___path___ts_onRequest } from "/home/runner/workspace/functions/api/[[path]].ts"
import { onRequest as ___middleware_ts_onRequest } from "/home/runner/workspace/functions/_middleware.ts"

export const routes = [
    {
      routePath: "/api/auth/login",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_login_ts_onRequestPost],
    },
  {
      routePath: "/api/public/content",
      mountPath: "/api/public",
      method: "GET",
      middlewares: [],
      modules: [__api_public_content_ts_onRequestGet],
    },
  {
      routePath: "/api/customers",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_customers_ts_onRequestGet],
    },
  {
      routePath: "/api/customers",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_customers_ts_onRequestOptions],
    },
  {
      routePath: "/api/customers",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_customers_ts_onRequestPost],
    },
  {
      routePath: "/api/debug",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_debug_ts_onRequestGet],
    },
  {
      routePath: "/api/:path*",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api___path___ts_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_ts_onRequest],
      modules: [],
    },
  ]