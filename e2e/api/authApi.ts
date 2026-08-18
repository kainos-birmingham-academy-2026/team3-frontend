import type { APIRequestContext, APIResponse } from '@playwright/test';
import { apiBaseURL } from '../support/config';
import type { TestUser } from '../support/testUser';

/** Wraps the backend auth endpoints, which the browser never observes directly. */
export class AuthApi {
  constructor(private readonly request: APIRequestContext) {}

  async register(user: TestUser): Promise<APIResponse> {
    return this.request.post(`${apiBaseURL}/api/register`, { data: user });
  }

  async login(user: TestUser): Promise<APIResponse> {
    return this.request.post(`${apiBaseURL}/api/login`, { data: user });
  }
}
