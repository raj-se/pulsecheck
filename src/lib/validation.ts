import { z } from "zod";

export const httpMethodSchema = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);

const urlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "Enter a valid http:// or https:// URL");

const HEADER_NAME_PATTERN = /^[A-Za-z0-9!#$%&'*+\-.^_`|~]+$/; // valid HTTP token chars
const NO_CONTROL_CHARS = /^[^\r\n]*$/; // reject header-injection via CR/LF

const headerNameSchema = z
  .string()
  .trim()
  .min(1, "Header name is required")
  .regex(HEADER_NAME_PATTERN, "Use a valid header name (letters, digits, - and _ only)");

const headerValueSchema = z
  .string()
  .min(1, "Header value is required")
  .regex(NO_CONTROL_CHARS, "Header values can't contain line breaks");

export const customHeaderSchema = z.object({
  key: headerNameSchema,
  value: headerValueSchema,
});

export const authConfigSchema = z
  .object({
    type: z.enum(["none", "bearer", "apiKey", "basic", "custom"]),
    bearerToken: z.string().regex(NO_CONTROL_CHARS, "Can't contain line breaks").optional(),
    apiKeyName: z.string().trim().optional(),
    apiKeyValue: z.string().regex(NO_CONTROL_CHARS, "Can't contain line breaks").optional(),
    apiKeyLocation: z.enum(["header", "query"]).optional(),
    basicUsername: z.string().optional(),
    basicPassword: z.string().regex(NO_CONTROL_CHARS, "Can't contain line breaks").optional(),
    customHeaders: z.array(customHeaderSchema).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.type === "bearer" && !val.bearerToken?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["bearerToken"], message: "Token is required" });
    }
    if (val.type === "apiKey") {
      if (!val.apiKeyName?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["apiKeyName"], message: "Header or param name is required" });
      } else if (val.apiKeyLocation !== "query" && !HEADER_NAME_PATTERN.test(val.apiKeyName.trim())) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["apiKeyName"], message: "Use a valid header name" });
      }
      if (!val.apiKeyValue?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["apiKeyValue"], message: "API key value is required" });
      }
    }
    if (val.type === "basic") {
      if (!val.basicUsername?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["basicUsername"], message: "Username is required" });
      }
      if (!val.basicPassword) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["basicPassword"], message: "Password is required" });
      }
    }
    if (val.type === "custom" && (!val.customHeaders || val.customHeaders.length === 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["customHeaders"], message: "Add at least one header" });
    }
  });

export type AuthConfigValues = z.infer<typeof authConfigSchema>;

export const monitorFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Keep it under 80 characters"),
  url: urlSchema,
  method: httpMethodSchema,
  timeout: z.coerce
    .number({ invalid_type_error: "Timeout must be a number" })
    .int("Timeout must be a whole number")
    .min(1, "Timeout must be at least 1 second")
    .max(60, "Timeout can't exceed 60 seconds"),
  expectedStatusCode: z.coerce
    .number({ invalid_type_error: "Status code must be a number" })
    .int("Status code must be a whole number")
    .min(100, "Status code must be between 100 and 599")
    .max(599, "Status code must be between 100 and 599"),
  isActive: z.boolean(),
  auth: authConfigSchema,
});

export type MonitorFormValues = z.infer<typeof monitorFormSchema>;

export const checkRequestSchema = z.object({
  url: urlSchema,
  method: httpMethodSchema.default("GET"),
  timeout: z.coerce.number().int().min(1000, "Minimum timeout is 1000ms").max(60000, "Maximum timeout is 60000ms").default(10000),
  auth: authConfigSchema.optional(),
});

export type CheckRequestValues = z.infer<typeof checkRequestSchema>;

const checkResultSchema = z.object({
  id: z.string(),
  monitorId: z.string(),
  statusCode: z.number().nullable(),
  responseTime: z.number().nullable(),
  success: z.boolean(),
  errorMessage: z.string().optional(),
  checkedAt: z.string(),
});

const monitorSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  method: httpMethodSchema,
  timeout: z.number(),
  expectedStatusCode: z.number(),
  isActive: z.boolean(),
  isDemo: z.boolean().optional(),
  auth: authConfigSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const incidentSchema = z.object({
  id: z.string(),
  monitorId: z.string(),
  startedAt: z.string(),
  resolvedAt: z.string().optional(),
  reason: z.string(),
});

export const exportPayloadSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  monitors: z.array(monitorSchema),
  checks: z.array(checkResultSchema),
  incidents: z.array(incidentSchema),
});
