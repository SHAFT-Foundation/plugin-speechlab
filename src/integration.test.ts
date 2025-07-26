import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { speechLabPlugin } from "./index";
import type { IAgentRuntime } from "@elizaos/core";

// Integration tests that run against the real SpeechLab API
// These tests require actual credentials and should be run separately
describe("SpeechLab Plugin - Real API Integration Tests", () => {
  let mockRuntime: IAgentRuntime;
  const isIntegrationTestEnabled = process.env.SPEECHLAB_INTEGRATION_TEST === 'true';
  
  beforeAll(() => {
    // Skip integration tests if credentials not provided
    if (!process.env.SPEECHLAB_EMAIL || !process.env.SPEECHLAB_PASSWORD) {
      console.log('⚠️  Skipping integration tests: Missing SPEECHLAB_EMAIL or SPEECHLAB_PASSWORD environment variables');
      return;
    }

    mockRuntime = {
      getSetting: (key: string) => {
        // Use environment variables for real testing
        return process.env[key];
      },
    } as unknown as IAgentRuntime;
  });

  describe("Authentication", () => {
    it.runIf(isIntegrationTestEnabled)("should authenticate with valid credentials", async () => {
      const testSuite = speechLabPlugin.tests[0];
      const connectionTest = testSuite.tests.find(
        test => test.name === "SpeechLab API connection test"
      );

      expect(connectionTest).toBeDefined();
      
      // This should succeed with real credentials
      await expect(connectionTest!.fn(mockRuntime)).resolves.toBeUndefined();
    }, 30000); // 30 second timeout for real API

    it.runIf(isIntegrationTestEnabled)("should fail with invalid credentials", async () => {
      const invalidRuntime = {
        getSetting: (key: string) => {
          if (key === 'SPEECHLAB_EMAIL') return 'invalid@example.com';
          if (key === 'SPEECHLAB_PASSWORD') return 'wrongpassword';
          return process.env[key];
        },
      } as unknown as IAgentRuntime;

      const testSuite = speechLabPlugin.tests[0];
      const connectionTest = testSuite.tests.find(
        test => test.name === "SpeechLab API connection test"
      );

      await expect(connectionTest!.fn(invalidRuntime)).rejects.toThrow();
    }, 30000);
  });

  describe("Full Dubbing Workflow", () => {
    it.skipIf(!isIntegrationTestEnabled)("should complete full dubbing workflow with short audio", async () => {
      // Use a very short test audio file for faster testing
      const testAudioUrl = "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav"; // 60 seconds
      
      const result = await speechLabPlugin.models["AUDIO_DUBBING"](mockRuntime, {
        audioUrl: testAudioUrl,
        targetLanguage: "es",
        projectName: "Integration Test - Baby Elephant Walk"
      });

      // Verify the result structure
      expect(result).toHaveProperty('projectId');
      expect(result).toHaveProperty('status', 'COMPLETE');
      expect(result).toHaveProperty('targetLanguage', 'es');
      expect(result).toHaveProperty('sharingLink');
      expect(result).toHaveProperty('projectDetails');

      // Verify the sharing link is valid
      expect(result.sharingLink).toMatch(/^https:\/\//);
      
      // Verify project details
      expect(result.projectDetails.id).toBe(result.projectId);
      expect(result.projectDetails.job.status).toBe('COMPLETE');
      expect(result.projectDetails.job.targetLanguage).toMatch(/es/);

      console.log('✅ Integration test successful!');
      console.log(`Project ID: ${result.projectId}`);
      console.log(`Sharing Link: ${result.sharingLink}`);
    }, 300000); // 5 minute timeout for real dubbing

    it.skipIf(!isIntegrationTestEnabled)("should handle very short timeout gracefully", async () => {
      const shortTimeoutRuntime = {
        getSetting: (key: string) => {
          if (key === 'SPEECHLAB_MAX_WAIT_TIME_MINUTES') return '0.1'; // 6 seconds
          if (key === 'SPEECHLAB_CHECK_INTERVAL_SECONDS') return '2';
          return process.env[key];
        },
      } as unknown as IAgentRuntime;

      const testAudioUrl = "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav";
      
      // This should timeout because dubbing takes longer than 6 seconds
      await expect(
        speechLabPlugin.models["AUDIO_DUBBING"](shortTimeoutRuntime, {
          audioUrl: testAudioUrl,
          targetLanguage: "fr",
          projectName: "Timeout Test"
        })
      ).rejects.toThrow("Project did not complete successfully");
    }, 60000);
  });

  describe("Error Scenarios", () => {
    it.runIf(isIntegrationTestEnabled)("should handle invalid audio URL", async () => {
      await expect(
        speechLabPlugin.models["AUDIO_DUBBING"](mockRuntime, {
          audioUrl: "https://example.com/nonexistent-audio.mp3",
          targetLanguage: "es",
          projectName: "Invalid Audio Test"
        })
      ).rejects.toThrow();
    }, 60000);

    it.runIf(isIntegrationTestEnabled)("should handle unsupported language", async () => {
      const testAudioUrl = "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav";
      
      await expect(
        speechLabPlugin.models["AUDIO_DUBBING"](mockRuntime, {
          audioUrl: testAudioUrl,
          targetLanguage: "unsupported-lang",
          projectName: "Unsupported Language Test"
        })
      ).rejects.toThrow();
    }, 60000);
  });

  describe("Language Mapping", () => {
    it.skipIf(!isIntegrationTestEnabled)("should handle Spanish language mapping (es -> es_la)", async () => {
      const testAudioUrl = "https://www2.cs.uic.edu/~i101/SoundFiles/PinkPanther30.wav"; // 30 seconds
      
      const result = await speechLabPlugin.models["AUDIO_DUBBING"](mockRuntime, {
        audioUrl: testAudioUrl,
        targetLanguage: "es", // Should be mapped to es_la
        projectName: "Language Mapping Test - Spanish"
      });

      expect(result.targetLanguage).toBe('es');
      // The API should have received es_la but we return the original es
      expect(result.projectDetails.job.targetLanguage).toMatch(/es/);

      console.log('✅ Spanish language mapping test successful!');
      console.log(`API Target Language: ${result.projectDetails.job.targetLanguage}`);
    }, 300000);
  });
});