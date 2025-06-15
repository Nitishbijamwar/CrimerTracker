// aiUtils.js

/**
 * Predict a possible legal outcome based on the case data.
 * @param {Object} data - The case data including type, description, etc.
 * @returns {string} A human-readable outcome prediction.
 */
export const predictOutcome = (data) => {
  if (!data) return "";

  const type = data.type?.toLowerCase() || "";
  const description = data.description?.toLowerCase() || "";

  // Basic AI rules - can be replaced by ML model in the future
  if (type.includes("theft")) {
    if (description.includes("watch") || description.includes("mobile")) {
      return "Low-level outcome: Warning or Fine";
    }
    return "Moderate-level: Investigation required, possible fine";
  }

  if (type.includes("assault")) {
    return "Likely outcome: Short-term custody or Community Service";
  }

  if (description.includes("cyber") || type.includes("cyber")) {
    return "Technical investigation required; possible fine or arrest";
  }

  if (type.includes("murder") || description.includes("dead")) {
    return "Severe: Jail time likely, further investigation needed";
  }

  return "Outcome prediction unavailable";
};

/**
 * Analyze case complexity based on text length or indicators.
 * @param {Object} data - The case data with description field.
 * @returns {string} Complexity level: Low, Medium, or High
 */
export const analyzeComplexity = (data) => {
  const wordCount = data?.description?.split(" ").length || 0;

  if (wordCount < 20) return "Low Complexity";
  if (wordCount < 50) return "Medium Complexity";
  return "High Complexity";
};
