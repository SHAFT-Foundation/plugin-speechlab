import { logger } from '@elizaos/core';
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = 'https://translate-api.speechlab.ai';

// Interfaces for API Payloads and Responses
interface LoginPayload {
    email: string;
    password: string;
}

interface LoginResponse {
    tokens: {
        accessToken: {
            jwtToken: string;
        };
    };
}

interface CreateDubPayload {
    name: string;
    sourceLanguage: string;
    targetLanguage: string;
    dubAccent: string;
    unitType: string;
    mediaFileURI: string;
    voiceMatchingMode: 'source' | 'native';
    thirdPartyID: string;
    customizedVoiceMatchingSpeakers?: Array<{
        speaker: string;
        voiceMatchingMode: 'native';
    }>;
}

interface CreateDubResponse {
    projectId: string;
}

interface GenerateLinkPayload {
    projectId: string;
}

interface GenerateLinkResponse {
    link: string;
}

// Define the structure for the Dub Media Item (OUTPUTS)
export interface DubMedia {
    _id: string;
    uri: string;
    category: string; 
    contentTYpe: string;
    format: string; 
    operationType: string;
    presignedURL?: string; 
    isSRTUploaded?: boolean;
}

// Define the structure for the main Dub object within a Translation
export interface DubObject {
     id?: string;
     language?: string;
     voiceMatchingMode?: string;
     isDubUpdated?: boolean;
     mergeStatus?: string;
     lastDubRunType?: string;
     medias?: DubMedia[];
}

// Define the structure for a Translation object
export interface Translation {
    id: string;
    language: string;
    dub?: DubObject[];
}

// Define the structure for the Project Details
export interface Project {
    id: string;
    job: {
        name: string;
        sourceLanguage: string;
        targetLanguage: string;
        status: string; 
    };
    translations?: Translation[];
}

// Update GetProjectsResponse to use the refined Project type
interface GetProjectsResponse {
    results: Array<Project>; 
    totalResults: number;
}

// Simple in-memory cache for the token
let cachedToken: string | null = null;
let tokenExpiryTime: number | null = null;

// Create an Axios instance for API calls
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout
});

/**
 * Handles API errors, logging relevant details.
 * @param error The error object (likely AxiosError).
 * @param context Descriptive string for the context where the error occurred.
 */
function handleApiError(error: unknown, context: string): void {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        logger.log(`[🤖 SpeechLab] ❌ API Error during ${context}: ${axiosError.message}`);
        if (axiosError.response) {
            logger.log(`[🤖 SpeechLab] Status: ${axiosError.response.status}`);
            logger.log(`[🤖 SpeechLab] Data: ${JSON.stringify(axiosError.response.data)}`);
        } else if (axiosError.request) {
            logger.log('[🤖 SpeechLab] No response received:', axiosError.request);
        } else {
            logger.log('[🤖 SpeechLab] Error setting up request:', axiosError.message);
        }
    } else {
        logger.log(`[🤖 SpeechLab] ❌ Non-Axios error during ${context}:`, error);
    }
}

/**
 * Invalidates the cached authentication token.
 */
function invalidateAuthToken(): void {
    logger.log('[🤖 SpeechLab] Invalidating cached authentication token.');
    cachedToken = null;
    tokenExpiryTime = null;
}

/**
 * Authenticates with the SpeechLab API to get a JWT token.
 * Uses simple caching. Add proper JWT expiry check if needed.
 * @param email SpeechLab account email
 * @param password SpeechLab account password
 * @returns {Promise<string | null>} The JWT token or null on failure.
 */
export async function getAuthToken(email: string, password: string): Promise<string | null> {
    // Basic check: If we have a token, return it (improve with expiry check later)
    if (cachedToken) {
        logger.log('[🤖 SpeechLab] Using cached authentication token.');
        return cachedToken;
    }

    logger.log('[🤖 SpeechLab] No cached token. Authenticating with API...');
    const loginPayload: LoginPayload = { email, password };

    try {
        const response = await apiClient.post<LoginResponse>('/v1/auth/login', loginPayload);
        const token = response.data?.tokens?.accessToken?.jwtToken;

        if (token) {
            logger.log('[🤖 SpeechLab] ✅ Successfully authenticated and obtained token.');
            cachedToken = token;
            return token;
        } else {
            logger.log('[🤖 SpeechLab] ❌ Authentication successful but token not found in response.');
            return null;
        }
    } catch (error) {
        handleApiError(error, 'authentication');
        return null;
    }
}

/**
 * Creates a dubbing project in SpeechLab. Handles 401 errors by retrying once after refreshing the token.
 * @param email SpeechLab account email
 * @param password SpeechLab account password 
 * @param publicAudioUrl The publicly accessible URL of the source audio file (e.g., S3 URL).
 * @param projectName The desired name for the project.
 * @param targetLanguageCode The detected target language code (e.g., 'es').
 * @param thirdPartyId The unique identifier for this job (e.g., spaceId-langCode).
 * @param sourceLanguageCode Optional source language code.
 * @returns {Promise<string | null>} The projectId if successful, otherwise null.
 */
export async function createDubbingProject(
    email: string,
    password: string,
    publicAudioUrl: string, 
    projectName: string, 
    targetLanguageCode: string, 
    thirdPartyId: string,
    sourceLanguageCode: string = 'en'
): Promise<string | null> {
    logger.log(`[🤖 SpeechLab] Attempting to create dubbing project: Name="${projectName}", Source=${sourceLanguageCode}, Target=${targetLanguageCode}, 3rdPartyID=${thirdPartyId}`);
    
    let attempt = 1;
    const maxAttempts = 2; // Initial attempt + 1 retry

    // Ensure projectName is reasonably limited
    const finalProjectName = projectName.substring(0, 100);

    // Map 'es' to 'es_la' for API compatibility
    const apiTargetLanguage = targetLanguageCode === 'es' ? 'es_la' : targetLanguageCode;
    const apiDubAccent = targetLanguageCode === 'es' ? 'es_la' : targetLanguageCode;
    logger.log(`[🤖 SpeechLab] Mapped target language code ${targetLanguageCode} to API targetLanguage: ${apiTargetLanguage}, dubAccent: ${apiDubAccent}`);

    const payload: CreateDubPayload = {
        name: finalProjectName,
        sourceLanguage: sourceLanguageCode,
        targetLanguage: apiTargetLanguage, // Use mapped code
        dubAccent: apiDubAccent,          // Use mapped code
        unitType: "whiteGlove",
        mediaFileURI: publicAudioUrl,
        voiceMatchingMode: "source",
        thirdPartyID: thirdPartyId,
    };

    logger.log(`[🤖 SpeechLab] Create project payload (Attempt ${attempt}): ${JSON.stringify(payload)}`);

    while (attempt <= maxAttempts) {
        const token = await getAuthToken(email, password);
        if (!token) {
            logger.log(`[🤖 SpeechLab] ❌ Cannot create project (Attempt ${attempt}): Failed to get authentication token.`);
            return null; // Can't proceed without a token
        }

        try {
            const response = await apiClient.post<CreateDubResponse>('/v1/projects/createProjectAndDub', payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const projectId = response.data?.projectId;
            if (projectId) {
                logger.log(`[🤖 SpeechLab] ✅ Successfully created project (Attempt ${attempt}). Project ID: ${projectId} (ThirdPartyID: ${thirdPartyId})`);
                return projectId;
            } else {
                logger.log(`[🤖 SpeechLab] ❌ Project creation API call successful (Attempt ${attempt}) but projectId not found in response.`);
                return null; // API succeeded but didn't return expected data
            }

        } catch (error) {
            const context = `project creation for ${finalProjectName} (3rdPartyID: ${thirdPartyId}) (Attempt ${attempt})`;
            
            if (axios.isAxiosError(error) && error.response?.status === 401 && attempt < maxAttempts) {
                logger.log(`[🤖 SpeechLab] ⚠️ Received 401 Unauthorized on attempt ${attempt}. Invalidating token and retrying...`);
                invalidateAuthToken(); // Invalidate the cached token
                attempt++;
                continue; // Go to the next iteration to retry
            } else {
                // Handle non-401 errors or failure on the final attempt
                handleApiError(error, context);
                return null;
            }
        }
    }

    logger.log(`[🤖 SpeechLab] ❌ Failed to create project after ${maxAttempts} attempts.`);
    return null;
}

/**
 * Generates a sharing link for a given SpeechLab project. Handles 401 errors by retrying once after refreshing the token.
 * @param email SpeechLab account email
 * @param password SpeechLab account password
 * @param projectId The ID of the project.
 * @returns {Promise<string | null>} The sharing link URL if successful, otherwise null.
 */
export async function generateSharingLink(
    email: string,
    password: string,
    projectId: string
): Promise<string | null> {
    logger.log(`[🤖 SpeechLab] Attempting to generate sharing link for project ID: ${projectId}`);
    
    let attempt = 1;
    const maxAttempts = 2; // Initial attempt + 1 retry

    const payload: GenerateLinkPayload = { projectId };
    logger.log(`[🤖 SpeechLab] Generate link payload (Attempt ${attempt}): ${JSON.stringify(payload)}`);

    while (attempt <= maxAttempts) {
        const token = await getAuthToken(email, password);
        if (!token) {
            logger.log(`[🤖 SpeechLab] ❌ Cannot generate link (Attempt ${attempt}): Failed to get authentication token.`);
            return null;
        }

        try {
            const response = await apiClient.post<GenerateLinkResponse>('/v1/collaborations/generateSharingLink', payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const link = response.data?.link;
            if (link) {
                logger.log(`[🤖 SpeechLab] ✅ Successfully generated sharing link (Attempt ${attempt}): ${link}`);
                return link;
            } else {
                logger.log(`[🤖 SpeechLab] ❌ Link generation successful (Attempt ${attempt}) but link not found in response.`);
                return null;
            }
        } catch (error) {
            const context = `sharing link generation for project ${projectId} (Attempt ${attempt})`;
            
            if (axios.isAxiosError(error) && error.response?.status === 401 && attempt < maxAttempts) {
                logger.log(`[🤖 SpeechLab] ⚠️ Received 401 Unauthorized on attempt ${attempt} for link generation. Invalidating token and retrying...`);
                invalidateAuthToken();
                attempt++;
                continue; 
            } else {
                handleApiError(error, context);
                return null;
            }
        }
    }
    
    logger.log(`[🤖 SpeechLab] ❌ Failed to generate sharing link after ${maxAttempts} attempts.`);
    return null;
}

/**
 * Gets project details by thirdPartyID to check its status.
 * Returns the *full* project object if found.
 * @param email SpeechLab account email
 * @param password SpeechLab account password
 * @param thirdPartyID The thirdPartyID used when creating the project
 * @returns {Promise<Project | null>} Full project object if found, otherwise null
 */
export async function getProjectByThirdPartyID(
    email: string,
    password: string,
    thirdPartyID: string
): Promise<Project | null> {
    logger.log(`[🤖 SpeechLab] Getting project status for thirdPartyID: ${thirdPartyID}`);
    
    let attempt = 1;
    const maxAttempts = 2; // Initial attempt + 1 retry

    const encodedThirdPartyID = encodeURIComponent(thirdPartyID);
    const url = `/v1/projects?sortBy=createdAt%3Aasc&limit=10&page=1&expand=true&thirdPartyIDs=${encodedThirdPartyID}`;
        
    logger.log(`[🤖 SpeechLab] 🔍 Fetching project status from API URL (Attempt ${attempt}): ${API_BASE_URL}${url}`);

    while (attempt <= maxAttempts) {
        const token = await getAuthToken(email, password);
        if (!token) {
            logger.log(`[🤖 SpeechLab] ❌ Cannot check project status (Attempt ${attempt}): Failed to get authentication token.`);
            return null;
        }

        try {
            const response = await apiClient.get<GetProjectsResponse>(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.data?.results && response.data.results.length > 0) {
                const project = response.data.results[0]; 
                const status = project.job?.status || "UNKNOWN";
                
                logger.log(`[🤖 SpeechLab] ✅ (Attempt ${attempt}) Found project with ID: ${project.id} for thirdPartyID: ${thirdPartyID}`);
                logger.log(`[🤖 SpeechLab] 📊 (Attempt ${attempt}) Project status: ${status}`);
                logger.log(`[🤖 SpeechLab] 📋 (Attempt ${attempt}) Project details: Name: "${project.job?.name || 'Unknown'}", Source: ${project.job?.sourceLanguage || 'Unknown'}, Target: ${project.job?.targetLanguage || 'Unknown'}`);
                logger.log(`[🤖 SpeechLab] 🔍 (Attempt ${attempt}) Found ${project.translations?.[0]?.dub?.[0]?.medias?.length || 0} media objects in first translation's first dub.`); 

                return project; // Success! Return the project details
            } else {
                logger.log(`[🤖 SpeechLab] ⚠️ (Attempt ${attempt}) No projects found matching thirdPartyID: ${thirdPartyID}`);
                if (response.data?.totalResults !== undefined) {
                    logger.log(`[🤖 SpeechLab] API reported ${response.data.totalResults} total results for this query (Attempt ${attempt}).`);
                }
                return null; // No project found, but API call succeeded
            }

        } catch (error) {
            const context = `getting project status for thirdPartyID: ${thirdPartyID} (Attempt ${attempt})`;

            if (axios.isAxiosError(error) && error.response?.status === 401 && attempt < maxAttempts) {
                logger.log(`[🤖 SpeechLab] ⚠️ Received 401 Unauthorized on attempt ${attempt} for project status check. Invalidating token and retrying...`);
                invalidateAuthToken();
                attempt++;
                continue; 
            } else {
                handleApiError(error, context);
                return null;
            }
        }
    }
    
    logger.log(`[🤖 SpeechLab] ❌ Failed to get project status for ${thirdPartyID} after ${maxAttempts} attempts.`);
    return null;
}

/**
 * Waits for a project to reach COMPLETE status, checking at regular intervals.
 * @param email SpeechLab account email
 * @param password SpeechLab account password
 * @param thirdPartyID The thirdPartyID of the project to monitor
 * @param maxWaitTimeMs Maximum time to wait in milliseconds (default: 1 hour)
 * @param checkIntervalMs Interval between status checks in milliseconds (default: 30 seconds)
 * @returns {Promise<Project | null>} The full project object if completed successfully, otherwise null
 */
export async function waitForProjectCompletion(
    email: string,
    password: string,
    thirdPartyID: string, 
    maxWaitTimeMs = 60 * 60 * 1000, // 1 hour default
    checkIntervalMs = 30000 // 30 seconds default
): Promise<Project | null> {
    logger.log(`[🤖 SpeechLab] Waiting for project completion: ${thirdPartyID}`);
    logger.log(`[🤖 SpeechLab] Maximum wait time: ${maxWaitTimeMs/1000/60} minutes, Check interval: ${checkIntervalMs/1000} seconds`);
    
    const startTime = Date.now();
    let pollCount = 0;
    let lastProjectDetails: Project | null = null; // Store last retrieved details
    
    while (Date.now() - startTime < maxWaitTimeMs) {
        pollCount++;
        const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
        
        logger.log(`[🤖 SpeechLab] 🔄 Poll #${pollCount} - Checking project status (${elapsedSeconds}s elapsed)...`);
        
        // Get the full project details
        const project = await getProjectByThirdPartyID(email, password, thirdPartyID); 
        lastProjectDetails = project; // Store the latest result
        
        if (!project) {
            logger.log(`[🤖 SpeechLab] ⚠️ Poll #${pollCount} - Could not retrieve project details, will retry in ${checkIntervalMs/1000}s...`);
        } else if (project.job?.status === "COMPLETE") {
            const elapsedMinutes = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
            logger.log(`[🤖 SpeechLab] ✅ Poll #${pollCount} - Project completed successfully after ${elapsedMinutes} minutes!`);
            return project; // Return the full project object on success
        } else if (project.job?.status === "FAILED") {
            logger.log(`[🤖 SpeechLab] ❌ Poll #${pollCount} - Project failed to process!`);
            return null; // Return null on failure
        } else {
            // Calculate progress (simplified)
            const status = project.job?.status || "UNKNOWN";
            const progressPercent = status === "PROCESSING" ? 50 : 0; 
            let remainingTimeEstimate = "unknown";
            
            if (progressPercent > 0) {
                const elapsedMs = Date.now() - startTime;
                const estimatedTotalMs = (elapsedMs / progressPercent) * 100;
                const estimatedRemainingMs = estimatedTotalMs - elapsedMs;
                const estimatedRemainingMin = Math.ceil(estimatedRemainingMs / 1000 / 60);
                remainingTimeEstimate = `~${estimatedRemainingMin} minutes`;
            }
            
            logger.log(`[🤖 SpeechLab] 🕒 Poll #${pollCount} - Project status: ${status}, Progress: ${progressPercent}%, Estimated time remaining: ${remainingTimeEstimate}`);
            logger.log(`[🤖 SpeechLab] ⏳ Poll #${pollCount} - Will check again in ${checkIntervalMs/1000}s...`);
        }
        
        await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
    }
    
    const maxWaitMinutes = (maxWaitTimeMs/1000/60).toFixed(1);
    logger.log(`[🤖 SpeechLab] ⏰ Poll #${pollCount} - Maximum wait time of ${maxWaitMinutes} minutes exceeded without project completion.`);
    return lastProjectDetails?.job?.status === "COMPLETE" ? lastProjectDetails : null; // Return last details only if complete, else null
} 