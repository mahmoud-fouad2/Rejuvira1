export type IntegrationToolType = "WEBHOOK" | "API_CALL";
export type IntegrationAuthType = "NONE" | "BEARER" | "API_KEY" | "BASIC";
export type IntegrationHttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";

export type ParameterType = "string" | "number" | "boolean" | "date" | "enum";

export interface IntegrationParameter {
  name: string;
  type: ParameterType;
  required: boolean;
  description?: string;
  example?: string;
  enumOptions?: string[];
}

export interface IntegrationHeader {
  key: string;
  value: string;
}

export interface IntegrationAuthConfig {
  token?: string;
  key?: string;
  headerName?: string;
  username?: string;
  password?: string;
}

export interface IntegrationResponseMapping {
  success?: string;
  message?: string;
  data?: string;
}

export interface IntegrationToolDTO {
  id: string;
  name: string;
  description: string;
  type: IntegrationToolType;
  method: IntegrationHttpMethod;
  url: string;
  headers: IntegrationHeader[];
  authType: IntegrationAuthType;
  authConfig: IntegrationAuthConfig;
  parameters: IntegrationParameter[];
  bodyTemplate: string | null;
  responseMapping: IntegrationResponseMapping;
  aiInstructions: string | null;
  timeoutMs: number;
  isActive: boolean;
  lastTestStatus: string | null;
  lastTestAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationLogDTO {
  id: string;
  integrationId: string;
  toolName: string;
  status: string;
  httpStatus: number | null;
  requestPreview: unknown;
  responsePreview: unknown;
  error: string | null;
  executionMs: number;
  createdAt: string;
}

export function isValidToolName(name: string): boolean {
  return /^[a-z][a-z0-9_]{1,63}$/.test(name);
}
