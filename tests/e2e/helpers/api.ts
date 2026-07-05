import { request, type APIRequestContext } from "@playwright/test";
import { API_URL } from "./config";
import { getApiToken } from "./auth";

/**
 * Thin client for the CRM and Scheduling APIs (through the Envoy gateway),
 * used to seed and clean up test data without going through the UI.
 */
export class Api {
  private constructor(private readonly context: APIRequestContext) {}

  static async create(): Promise<Api> {
    const token = await getApiToken();
    const context = await request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    });
    return new Api(context);
  }

  async dispose(): Promise<void> {
    await this.context.dispose();
  }

  private async post(path: string, data: unknown): Promise<string> {
    const response = await this.context.post(path, { data });
    if (!response.ok()) {
      throw new Error(`POST ${path} failed: ${response.status()} ${await response.text()}`);
    }
    const text = await response.text();
    // Endpoints return the created id as a JSON-encoded GUID string.
    try {
      return JSON.parse(text) as string;
    } catch {
      return text;
    }
  }

  async delete(path: string): Promise<void> {
    const response = await this.context.delete(path);
    if (!response.ok()) {
      throw new Error(`DELETE ${path} failed: ${response.status()} ${await response.text()}`);
    }
  }

  async get<T>(path: string): Promise<T> {
    const response = await this.context.get(path);
    if (!response.ok()) {
      throw new Error(`GET ${path} failed: ${response.status()} ${await response.text()}`);
    }
    return (await response.json()) as T;
  }

  // --- CRM ---

  async createChild(child: {
    givenName: string;
    familyName: string;
    dateOfBirth: string; // YYYY-MM-DD
  }): Promise<string> {
    return this.post("/crm/v1/children", child);
  }

  async deleteChild(id: string): Promise<void> {
    await this.delete(`/crm/v1/children/${id}`);
  }

  async createGuardian(guardian: {
    givenName: string;
    familyName: string;
    dateOfBirth: string; // YYYY-MM-DD
    email: string;
    phoneNumbers?: { number: string; type: number | string }[];
  }): Promise<string> {
    return this.post("/crm/v1/guardians", { phoneNumbers: [], ...guardian });
  }

  async deleteGuardian(id: string): Promise<void> {
    await this.delete(`/crm/v1/guardians/${id}`);
  }

  async linkGuardianToChild(
    childId: string,
    guardianId: string,
    relationshipType: number | string,
  ): Promise<string> {
    return this.post(`/crm/v1/children/${childId}/guardians/${guardianId}`, { relationshipType });
  }

  // --- Scheduling ---

  async createGroup(name: string): Promise<string> {
    return this.post("/scheduling/v1/groups", { name });
  }

  async deleteGroup(id: string): Promise<void> {
    await this.delete(`/scheduling/v1/groups/${id}`);
  }

  async createTimeSlot(timeSlot: {
    name: string;
    startTime: string; // HH:mm:ss
    endTime: string; // HH:mm:ss
  }): Promise<string> {
    return this.post("/scheduling/v1/timeslots", timeSlot);
  }

  async deleteTimeSlot(id: string): Promise<void> {
    await this.delete(`/scheduling/v1/timeslots/${id}`);
  }

  /**
   * Creating a schedule requires the child to exist in the Scheduling service,
   * which receives it asynchronously from CRM over RabbitMQ — hence the retry.
   */
  async createSchedule(schedule: {
    childId: string;
    startDate: string; // YYYY-MM-DD
    scheduleRules: { day: number; timeSlotId: string; groupId: string }[];
  }): Promise<string> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 20; attempt++) {
      try {
        return await this.post("/scheduling/v1/schedules", schedule);
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    throw lastError;
  }

  async createClosurePeriod(period: {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    reason: string;
  }): Promise<string> {
    return this.post("/scheduling/v1/closure-periods", period);
  }

  async deleteClosurePeriod(id: string): Promise<void> {
    await this.delete(`/scheduling/v1/closure-periods/${id}`);
  }

  async createEndMark(endMark: {
    childId: string;
    endDate: string; // YYYY-MM-DD
    reason?: string;
  }): Promise<string> {
    return this.post("/scheduling/v1/endmarks", endMark);
  }

  async deleteEndMark(id: string): Promise<void> {
    await this.delete(`/scheduling/v1/endmarks/${id}`);
  }

  async addAbsence(absence: {
    childId: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }): Promise<string> {
    return this.post(`/scheduling/v1/children/${absence.childId}/absences`, absence);
  }
}

/** Unique, recognizable test-data name to avoid collisions between runs. */
export function uniqueName(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
