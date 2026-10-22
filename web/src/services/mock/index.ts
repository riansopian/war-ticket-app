import type { Services } from "../contracts";
import { MockBookingService } from "./MockBookingService";
import { MockEventService } from "./MockEventService";
import { MockPaymentService } from "./MockPaymentService";
import { MockQueueService } from "./MockQueueService";
import { MockSessionService } from "./MockSessionService";

export { resetMockDb } from "./db";

/** Composition root untuk implementasi mock. Ganti dengan createHttpServices() nanti. */
export function createMockServices(): Services {
  return {
    events: new MockEventService(),
    queue: new MockQueueService(),
    booking: new MockBookingService(),
    payment: new MockPaymentService(),
    session: new MockSessionService(),
  };
}
