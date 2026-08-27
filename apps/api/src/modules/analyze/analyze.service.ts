import config from "../../config/env.config.js";

export const analyzeGithub = async (username: string) => {
  const res = await fetch(config.aiServiceUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ githubUsername: username }),
  });

  return res.json();
};