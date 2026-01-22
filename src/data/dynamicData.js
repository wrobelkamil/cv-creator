/**
 * This file defines the shape of the data that we expect from the AI (ChatGPT).
 * It serves as a schema/type definition.
 * Initial state is empty so App.js falls back to Master Experience.
 */

export const initialDynamicData = {
    summary: "", // Let fallback to staticData.summary
    experience: [
        // Empty to trigger fallback to staticData.masterExperience
    ],
    matchedSkills: []
};
