import { describe, expect, it } from "vitest";
import { extractInstagramDmEvents } from "@/server/modules/webhooks/service";

describe("extractInstagramDmEvents", () => {
  it("extracts entry.messaging payload events", () => {
    const payload = {
      object: "instagram",
      entry: [
        {
          messaging: [
            {
              sender: { id: "user_1" },
              message: { text: "hello" }
            }
          ]
        }
      ]
    };

    expect(extractInstagramDmEvents(payload)).toEqual([{ senderId: "user_1", messageText: "hello" }]);
  });

  it("extracts entry.changes field=messages events", () => {
    const payload = {
      object: "instagram",
      entry: [
        {
          changes: [
            {
              field: "messages",
              value: {
                messages: [{ from: "user_2", text: { body: "compare" } }]
              }
            }
          ]
        }
      ]
    };

    expect(extractInstagramDmEvents(payload)).toEqual([{ senderId: "user_2", messageText: "compare" }]);
  });

  it("ignores non-message webhook payloads", () => {
    const payload = {
      object: "instagram",
      entry: [{ changes: [{ field: "comments", value: { text: "nice" } }] }]
    };

    expect(extractInstagramDmEvents(payload)).toEqual([]);
  });
});

