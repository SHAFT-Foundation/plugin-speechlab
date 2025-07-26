import { describe, it, expect, vi, beforeEach } from "vitest";
import { speechLabPlugin } from "./index";
import type { IAgentRuntime } from "@elizaos/core";

// Mock axios
vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      post: vi.fn(),
      get: vi.fn(),
    })),
    isAxiosError: vi.fn(),
  },
}));

describe("SpeechLab Plugin", () => {
  let mockRuntime: IAgentRuntime;

  beforeEach(() => {
    mockRuntime = {
      getSetting: vi.fn((key: string) => {
        const settings: Record<string, string> = {
          SPEECHLAB_EMAIL: "test@example.com",
          SPEECHLAB_PASSWORD: "testpassword",
          SPEECHLAB_SOURCE_LANGUAGE: "en",
          SPEECHLAB_MAX_WAIT_TIME_MINUTES: "60",
          SPEECHLAB_CHECK_INTERVAL_SECONDS: "30",
        };
        return settings[key];
      }),
    } as unknown as IAgentRuntime;
  });

  describe("Plugin Structure", () => {
    it("should have required plugin properties", () => {
      expect(speechLabPlugin).toBeDefined();
      expect(speechLabPlugin.name).toBe("speechLab");
      expect(speechLabPlugin.description).toBe(
        "SpeechLab dubbing plugin for voice translation",
      );
      expect(speechLabPlugin.models).toBeDefined();
      expect(speechLabPlugin.tests).toBeDefined();
    });

    it("should provide AUDIO_DUBBING model", () => {
      expect(speechLabPlugin.models["AUDIO_DUBBING"]).toBeDefined();
      expect(speechLabPlugin.models["AUDIO_DUBBING"]).toBeInstanceOf(Function);
    });
  });

  describe("Plugin Tests", () => {
    it("should define credential validation test", () => {
      expect(speechLabPlugin.tests).toBeDefined();
      expect(speechLabPlugin.tests.length).toBeGreaterThan(0);

      const testSuite = speechLabPlugin.tests[0];
      expect(testSuite.name).toBe("test speechlab");
      expect(testSuite.tests).toBeDefined();
      expect(testSuite.tests.length).toBeGreaterThan(0);

      const credentialTest = testSuite.tests.find(
        (test) => test.name === "SpeechLab API credential validation",
      );
      expect(credentialTest).toBeDefined();
    });

    it("should define API connection test", () => {
      const testSuite = speechLabPlugin.tests[0];
      const connectionTest = testSuite.tests.find(
        (test) => test.name === "SpeechLab API connection test",
      );
      expect(connectionTest).toBeDefined();
    });
  });

  describe("AUDIO_DUBBING Model", () => {
    it("should throw error when credentials are missing", async () => {
      const mockRuntimeNoCreds = {
        getSetting: vi.fn(() => undefined),
      } as unknown as IAgentRuntime;

      await expect(
        speechLabPlugin.models["AUDIO_DUBBING"](mockRuntimeNoCreds, {
          audioUrl: "https://example.com/audio.mp3",
          targetLanguage: "es",
        }),
      ).rejects.toThrow("Missing required credentials");
    });

    it("should throw error when audioUrl is missing", async () => {
      await expect(
        speechLabPlugin.models["AUDIO_DUBBING"](mockRuntime, {
          targetLanguage: "es",
        }),
      ).rejects.toThrow("Missing required audioUrl parameter");
    });

    it("should throw error when targetLanguage is missing", async () => {
      await expect(
        speechLabPlugin.models["AUDIO_DUBBING"](mockRuntime, {
          audioUrl: "https://example.com/audio.mp3",
        }),
      ).rejects.toThrow("Missing required targetLanguage parameter");
    });

    it("should throw error when options are not provided", async () => {
      await expect(
        speechLabPlugin.models["AUDIO_DUBBING"](mockRuntime, null),
      ).rejects.toThrow("Missing required dubbing options");
    });
  });
});
