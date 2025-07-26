// src/index.ts
import {
  logger,
  parseBooleanFromText
} from "@elizaos/core";
import axios from "axios";
var API_BASE_URL = "https://translate-api.speechlab.ai";
var cachedToken = null;
var tokenExpiryTime = null;
var apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 3e4
  // 30 second timeout
});
function handleApiError(error, context) {
  if (axios.isAxiosError(error)) {
    const axiosError = error;
    logger.log(
      `[\u{1F916} SpeechLab] \u274C API Error during ${context}: ${axiosError.message}`
    );
    if (axiosError.response) {
      logger.log(`[\u{1F916} SpeechLab] Status: ${axiosError.response.status}`);
      logger.log(
        `[\u{1F916} SpeechLab] Data: ${JSON.stringify(axiosError.response.data)}`
      );
    } else if (axiosError.request) {
      logger.log("[\u{1F916} SpeechLab] No response received:", axiosError.request);
    } else {
      logger.log(
        "[\u{1F916} SpeechLab] Error setting up request:",
        axiosError.message
      );
    }
  } else {
    logger.log(`[\u{1F916} SpeechLab] \u274C Non-Axios error during ${context}:`, error);
  }
}
function invalidateAuthToken() {
  logger.log("[\u{1F916} SpeechLab] Invalidating cached authentication token.");
  cachedToken = null;
  tokenExpiryTime = null;
}
async function getAuthToken(email, password) {
  if (cachedToken) {
    logger.log("[\u{1F916} SpeechLab] Using cached authentication token.");
    return cachedToken;
  }
  logger.log("[\u{1F916} SpeechLab] No cached token. Authenticating with API...");
  const loginPayload = { email, password };
  try {
    const response = await apiClient.post(
      "/v1/auth/login",
      loginPayload
    );
    const token = response.data?.tokens?.accessToken?.jwtToken;
    if (token) {
      logger.log(
        "[\u{1F916} SpeechLab] \u2705 Successfully authenticated and obtained token."
      );
      cachedToken = token;
      return token;
    } else {
      logger.log(
        "[\u{1F916} SpeechLab] \u274C Authentication successful but token not found in response."
      );
      return null;
    }
  } catch (error) {
    handleApiError(error, "authentication");
    return null;
  }
}
async function createDubbingProject(email, password, publicAudioUrl, projectName, targetLanguageCode, thirdPartyId, sourceLanguageCode = "en") {
  logger.log(
    `[\u{1F916} SpeechLab] Attempting to create dubbing project: Name="${projectName}", Source=${sourceLanguageCode}, Target=${targetLanguageCode}, 3rdPartyID=${thirdPartyId}`
  );
  let attempt = 1;
  const maxAttempts = 2;
  const finalProjectName = projectName.substring(0, 100);
  const apiTargetLanguage = targetLanguageCode === "es" ? "es_la" : targetLanguageCode;
  const apiDubAccent = targetLanguageCode === "es" ? "es_la" : targetLanguageCode;
  logger.log(
    `[\u{1F916} SpeechLab] Mapped target language code ${targetLanguageCode} to API targetLanguage: ${apiTargetLanguage}, dubAccent: ${apiDubAccent}`
  );
  const payload = {
    name: finalProjectName,
    sourceLanguage: sourceLanguageCode,
    targetLanguage: apiTargetLanguage,
    // Use mapped code
    dubAccent: apiDubAccent,
    // Use mapped code
    unitType: "whiteGlove",
    mediaFileURI: publicAudioUrl,
    voiceMatchingMode: "source",
    thirdPartyID: thirdPartyId
  };
  logger.log(
    `[\u{1F916} SpeechLab] Create project payload (Attempt ${attempt}): ${JSON.stringify(payload)}`
  );
  while (attempt <= maxAttempts) {
    const token = await getAuthToken(email, password);
    if (!token) {
      logger.log(
        `[\u{1F916} SpeechLab] \u274C Cannot create project (Attempt ${attempt}): Failed to get authentication token.`
      );
      return null;
    }
    try {
      const response = await apiClient.post(
        "/v1/projects/createProjectAndDub",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const projectId = response.data?.projectId;
      if (projectId) {
        logger.log(
          `[\u{1F916} SpeechLab] \u2705 Successfully created project (Attempt ${attempt}). Project ID: ${projectId} (ThirdPartyID: ${thirdPartyId})`
        );
        return projectId;
      } else {
        logger.log(
          `[\u{1F916} SpeechLab] \u274C Project creation API call successful (Attempt ${attempt}) but projectId not found in response.`
        );
        return null;
      }
    } catch (error) {
      const context = `project creation for ${finalProjectName} (3rdPartyID: ${thirdPartyId}) (Attempt ${attempt})`;
      if (axios.isAxiosError(error) && error.response?.status === 401 && attempt < maxAttempts) {
        logger.log(
          `[\u{1F916} SpeechLab] \u26A0\uFE0F Received 401 Unauthorized on attempt ${attempt}. Invalidating token and retrying...`
        );
        invalidateAuthToken();
        attempt++;
        continue;
      } else {
        handleApiError(error, context);
        return null;
      }
    }
  }
  logger.log(
    `[\u{1F916} SpeechLab] \u274C Failed to create project after ${maxAttempts} attempts.`
  );
  return null;
}
async function generateSharingLink(email, password, projectId) {
  logger.log(
    `[\u{1F916} SpeechLab] Attempting to generate sharing link for project ID: ${projectId}`
  );
  let attempt = 1;
  const maxAttempts = 2;
  const payload = { projectId };
  logger.log(
    `[\u{1F916} SpeechLab] Generate link payload (Attempt ${attempt}): ${JSON.stringify(payload)}`
  );
  while (attempt <= maxAttempts) {
    const token = await getAuthToken(email, password);
    if (!token) {
      logger.log(
        `[\u{1F916} SpeechLab] \u274C Cannot generate link (Attempt ${attempt}): Failed to get authentication token.`
      );
      return null;
    }
    try {
      const response = await apiClient.post(
        "/v1/collaborations/generateSharingLink",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const link = response.data?.link;
      if (link) {
        logger.log(
          `[\u{1F916} SpeechLab] \u2705 Successfully generated sharing link (Attempt ${attempt}): ${link}`
        );
        return link;
      } else {
        logger.log(
          `[\u{1F916} SpeechLab] \u274C Link generation successful (Attempt ${attempt}) but link not found in response.`
        );
        return null;
      }
    } catch (error) {
      const context = `sharing link generation for project ${projectId} (Attempt ${attempt})`;
      if (axios.isAxiosError(error) && error.response?.status === 401 && attempt < maxAttempts) {
        logger.log(
          `[\u{1F916} SpeechLab] \u26A0\uFE0F Received 401 Unauthorized on attempt ${attempt} for link generation. Invalidating token and retrying...`
        );
        invalidateAuthToken();
        attempt++;
        continue;
      } else {
        handleApiError(error, context);
        return null;
      }
    }
  }
  logger.log(
    `[\u{1F916} SpeechLab] \u274C Failed to generate sharing link after ${maxAttempts} attempts.`
  );
  return null;
}
async function getProjectByThirdPartyID(email, password, thirdPartyID) {
  logger.log(
    `[\u{1F916} SpeechLab] Getting project status for thirdPartyID: ${thirdPartyID}`
  );
  let attempt = 1;
  const maxAttempts = 2;
  const encodedThirdPartyID = encodeURIComponent(thirdPartyID);
  const url = `/v1/projects?sortBy=createdAt%3Aasc&limit=10&page=1&expand=true&thirdPartyIDs=${encodedThirdPartyID}`;
  logger.log(
    `[\u{1F916} SpeechLab] \u{1F50D} Fetching project status from API URL (Attempt ${attempt}): ${API_BASE_URL}${url}`
  );
  while (attempt <= maxAttempts) {
    const token = await getAuthToken(email, password);
    if (!token) {
      logger.log(
        `[\u{1F916} SpeechLab] \u274C Cannot check project status (Attempt ${attempt}): Failed to get authentication token.`
      );
      return null;
    }
    try {
      const response = await apiClient.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.results && response.data.results.length > 0) {
        const project = response.data.results[0];
        const status = project.job?.status || "UNKNOWN";
        logger.log(
          `[\u{1F916} SpeechLab] \u2705 (Attempt ${attempt}) Found project with ID: ${project.id} for thirdPartyID: ${thirdPartyID}`
        );
        logger.log(
          `[\u{1F916} SpeechLab] \u{1F4CA} (Attempt ${attempt}) Project status: ${status}`
        );
        logger.log(
          `[\u{1F916} SpeechLab] \u{1F4CB} (Attempt ${attempt}) Project details: Name: "${project.job?.name || "Unknown"}", Source: ${project.job?.sourceLanguage || "Unknown"}, Target: ${project.job?.targetLanguage || "Unknown"}`
        );
        logger.log(
          `[\u{1F916} SpeechLab] \u{1F50D} (Attempt ${attempt}) Found ${project.translations?.[0]?.dub?.[0]?.medias?.length || 0} media objects in first translation's first dub.`
        );
        return project;
      } else {
        logger.log(
          `[\u{1F916} SpeechLab] \u26A0\uFE0F (Attempt ${attempt}) No projects found matching thirdPartyID: ${thirdPartyID}`
        );
        if (response.data?.totalResults !== void 0) {
          logger.log(
            `[\u{1F916} SpeechLab] API reported ${response.data.totalResults} total results for this query (Attempt ${attempt}).`
          );
        }
        return null;
      }
    } catch (error) {
      const context = `getting project status for thirdPartyID: ${thirdPartyID} (Attempt ${attempt})`;
      if (axios.isAxiosError(error) && error.response?.status === 401 && attempt < maxAttempts) {
        logger.log(
          `[\u{1F916} SpeechLab] \u26A0\uFE0F Received 401 Unauthorized on attempt ${attempt} for project status check. Invalidating token and retrying...`
        );
        invalidateAuthToken();
        attempt++;
        continue;
      } else {
        handleApiError(error, context);
        return null;
      }
    }
  }
  logger.log(
    `[\u{1F916} SpeechLab] \u274C Failed to get project status for ${thirdPartyID} after ${maxAttempts} attempts.`
  );
  return null;
}
async function waitForProjectCompletion(email, password, thirdPartyID, maxWaitTimeMs = 60 * 60 * 1e3, checkIntervalMs = 3e4) {
  logger.log(`[\u{1F916} SpeechLab] Waiting for project completion: ${thirdPartyID}`);
  logger.log(
    `[\u{1F916} SpeechLab] Maximum wait time: ${maxWaitTimeMs / 1e3 / 60} minutes, Check interval: ${checkIntervalMs / 1e3} seconds`
  );
  const startTime = Date.now();
  let pollCount = 0;
  let lastProjectDetails = null;
  while (Date.now() - startTime < maxWaitTimeMs) {
    pollCount++;
    const elapsedSeconds = ((Date.now() - startTime) / 1e3).toFixed(1);
    logger.log(
      `[\u{1F916} SpeechLab] \u{1F504} Poll #${pollCount} - Checking project status (${elapsedSeconds}s elapsed)...`
    );
    const project = await getProjectByThirdPartyID(
      email,
      password,
      thirdPartyID
    );
    lastProjectDetails = project;
    if (!project) {
      logger.log(
        `[\u{1F916} SpeechLab] \u26A0\uFE0F Poll #${pollCount} - Could not retrieve project details, will retry in ${checkIntervalMs / 1e3}s...`
      );
    } else if (project.job?.status === "COMPLETE") {
      const elapsedMinutes = ((Date.now() - startTime) / 1e3 / 60).toFixed(1);
      logger.log(
        `[\u{1F916} SpeechLab] \u2705 Poll #${pollCount} - Project completed successfully after ${elapsedMinutes} minutes!`
      );
      return project;
    } else if (project.job?.status === "FAILED") {
      logger.log(
        `[\u{1F916} SpeechLab] \u274C Poll #${pollCount} - Project failed to process!`
      );
      return null;
    } else {
      const status = project.job?.status || "UNKNOWN";
      const progressPercent = status === "PROCESSING" ? 50 : 0;
      let remainingTimeEstimate = "unknown";
      if (progressPercent > 0) {
        const elapsedMs = Date.now() - startTime;
        const estimatedTotalMs = elapsedMs / progressPercent * 100;
        const estimatedRemainingMs = estimatedTotalMs - elapsedMs;
        const estimatedRemainingMin = Math.ceil(
          estimatedRemainingMs / 1e3 / 60
        );
        remainingTimeEstimate = `~${estimatedRemainingMin} minutes`;
      }
      logger.log(
        `[\u{1F916} SpeechLab] \u{1F552} Poll #${pollCount} - Project status: ${status}, Progress: ${progressPercent}%, Estimated time remaining: ${remainingTimeEstimate}`
      );
      logger.log(
        `[\u{1F916} SpeechLab] \u23F3 Poll #${pollCount} - Will check again in ${checkIntervalMs / 1e3}s...`
      );
    }
    await new Promise((resolve) => setTimeout(resolve, checkIntervalMs));
  }
  const maxWaitMinutes = (maxWaitTimeMs / 1e3 / 60).toFixed(1);
  logger.log(
    `[\u{1F916} SpeechLab] \u23F0 Poll #${pollCount} - Maximum wait time of ${maxWaitMinutes} minutes exceeded without project completion.`
  );
  return lastProjectDetails?.job?.status === "COMPLETE" ? lastProjectDetails : null;
}
function getSpeechLabSettings(runtime) {
  const getSetting = (key, fallback = "") => process.env[key] || runtime.getSetting(key) || fallback;
  return {
    email: getSetting("SPEECHLAB_EMAIL"),
    password: getSetting("SPEECHLAB_PASSWORD"),
    sourceLanguage: getSetting("SPEECHLAB_SOURCE_LANGUAGE", "en"),
    unitType: getSetting("SPEECHLAB_UNIT_TYPE", "whiteGlove"),
    voiceMatchingMode: getSetting("SPEECHLAB_VOICE_MATCHING_MODE", "source"),
    maxWaitTimeMinutes: parseInt(
      getSetting("SPEECHLAB_MAX_WAIT_TIME_MINUTES", "60")
    ),
    checkIntervalSeconds: parseInt(
      getSetting("SPEECHLAB_CHECK_INTERVAL_SECONDS", "30")
    ),
    debug: parseBooleanFromText(getSetting("SPEECHLAB_DEBUG", "false"))
  };
}
var speechLabPlugin = {
  name: "speechLab",
  description: "SpeechLab dubbing plugin for voice translation",
  models: {
    ["AUDIO_DUBBING"]: async (runtime, options) => {
      const settings = getSpeechLabSettings(runtime);
      logger.log(
        `[\u{1F916} SpeechLab] Using AUDIO_DUBBING with source language: ${settings.sourceLanguage}`
      );
      if (!settings.email || !settings.password) {
        throw new Error(
          "[\u{1F916} SpeechLab] Missing required credentials. Please set SPEECHLAB_EMAIL and SPEECHLAB_PASSWORD"
        );
      }
      if (!options || typeof options !== "object") {
        throw new Error("[\u{1F916} SpeechLab] Missing required dubbing options");
      }
      const { audioUrl, targetLanguage, projectName } = options;
      if (!audioUrl) {
        throw new Error("[\u{1F916} SpeechLab] Missing required audioUrl parameter");
      }
      if (!targetLanguage) {
        throw new Error(
          "[\u{1F916} SpeechLab] Missing required targetLanguage parameter"
        );
      }
      const finalProjectName = projectName || `SpeechLab Dub ${(/* @__PURE__ */ new Date()).toISOString()}`;
      const thirdPartyId = `eliza-${Date.now()}-${targetLanguage}`;
      try {
        const projectId = await createDubbingProject(
          settings.email,
          settings.password,
          audioUrl,
          finalProjectName,
          targetLanguage,
          thirdPartyId,
          settings.sourceLanguage
        );
        if (!projectId) {
          throw new Error("[\u{1F916} SpeechLab] Failed to create dubbing project");
        }
        logger.log(
          `[\u{1F916} SpeechLab] Successfully created dubbing project with ID: ${projectId}`
        );
        logger.log(
          `[\u{1F916} SpeechLab] Waiting for project to complete (this may take several minutes)...`
        );
        const completedProject = await waitForProjectCompletion(
          settings.email,
          settings.password,
          thirdPartyId,
          settings.maxWaitTimeMinutes * 60 * 1e3,
          settings.checkIntervalSeconds * 1e3
        );
        if (!completedProject) {
          throw new Error(
            "[\u{1F916} SpeechLab] Project did not complete successfully"
          );
        }
        logger.log(
          `[\u{1F916} SpeechLab] Generating sharing link for completed project...`
        );
        const sharingLink = await generateSharingLink(
          settings.email,
          settings.password,
          projectId
        );
        if (!sharingLink) {
          throw new Error("[\u{1F916} SpeechLab] Failed to generate sharing link");
        }
        return {
          projectId,
          status: completedProject.job?.status || "COMPLETE",
          targetLanguage,
          sharingLink,
          projectDetails: completedProject
        };
      } catch (error) {
        throw new Error(
          `[\u{1F916} SpeechLab] Failed to complete dubbing: ${error.message || "Unknown error occurred"}`
        );
      }
    }
  },
  tests: [
    {
      name: "test speechlab",
      tests: [
        {
          name: "SpeechLab API credential validation",
          fn: async (runtime) => {
            const settings = getSpeechLabSettings(runtime);
            if (!settings.email || !settings.password) {
              throw new Error(
                "Missing credentials: Please provide valid SpeechLab email and password."
              );
            }
          }
        },
        {
          name: "SpeechLab API connection test",
          fn: async (runtime) => {
            try {
              const settings = getSpeechLabSettings(runtime);
              if (!settings.email || !settings.password) {
                throw new Error("Missing credentials for connection test");
              }
              const result = await getProjectByThirdPartyID(
                settings.email,
                settings.password,
                "connection-test"
              );
              logger.log("[\u{1F916} SpeechLab] API connection test successful");
            } catch (error) {
              throw new Error(
                `Failed to connect to SpeechLab API: ${error.message || "Unknown error occurred"}`
              );
            }
          }
        }
      ]
    }
  ]
};
var index_default = speechLabPlugin;
export {
  index_default as default,
  speechLabPlugin
};
//# sourceMappingURL=index.js.map