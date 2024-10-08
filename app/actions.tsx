"use server";
const GREPTILE_API_BASE_URL = process.env.GREPTILE_API_BASE_URL;
const GREPTILE_API_KEY = process.env.GREPTILE_API_KEY;
const GITHUB_API_BASE_URL = process.env.GITHUB_API_BASE_URL;
const GITHUB_PERSONAL_ACCESS_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
const GITHUB_USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME;

console.log("BASE URL:", GREPTILE_API_BASE_URL);

async function getAccessibilityConcerns(repo: string) {

  console.log("in getAccessibilityconcerns, repo:", repo, "GITHUB_USERNAME:", GITHUB_USERNAME);
  const query = {
    messages: [
      {
        content: `Look closely at this code base and find files that have accessibility concerns.
        These accessibility concerns could include color contrast issues, missing alt attributes on images, missing ARIA attributes, or any other accessibility issues.
        Be specific in your findings.
        The output response should be a json object formatted like this:
        {concerns: [{"id": string, "title": string, "description": string, "file": string},]}
        where "id" is a unique identifier for the concern, "title" is a brief description of the concerns,
        "description" is a detailed description of the accessibility concerns in that file, and "file" is the exact path of the file where the concern is located.
        Only include one item in the concerns array for each file that has accessibility concerns. If there is more than one concern in that file, summarize
        the concerns in both the title and the description.
        The source code may be written in any language or framework. Adjust accordingly when looking for accessibility concerns.
        Do not look for accessibility concerns in files that belong to third party libraries or frameworks.`,
        role: "user",
      },
    ],
    repositories: [
      {
        remote: "github",
        repository: `${GITHUB_USERNAME}/${repo}`,
        branch: "main",
      },
    ],
    jsonMode: true,
    // sessionId: "accessibility-test",
    // genius: true,
  };

  const response = await fetch(`${GREPTILE_API_BASE_URL}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GREPTILE_API_KEY}`,
      "X-GitHub-Token": GITHUB_PERSONAL_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  });

  console.log(response);
  const data = await response.json();
  console.log("DATA:", data);
  const message = JSON.parse(data.message);
  console.log("MESSAGE:", message);

  return message.concerns;


  // const concerns = [
  //   {
  //     id: 'AC001',
  //     title: 'Potential color contrast and keyboard navigation issues',
  //     description: "The AllComplete component may have color contrast issues, especially in dark mode. The Button component used for 'View Reports' might lack proper focus indicators for keyboard navigation. The Card component should be reviewed to ensure it has appropriate ARIA attributes for screen readers.",
  //     file: '/components/AllComplete.tsx'
  //   },
  //   {
  //     id: 'AC002',
  //     title: 'Color contrast and dark mode accessibility',
  //     description: 'The global CSS file defines color variables for both light and dark modes. Some color combinations may not meet WCAG contrast requirements, particularly in dark mode. The transition between light and dark modes should be tested for smooth accessibility across various devices and assistive technologies.',
  //     file: '/app/globals.css'
  //   },
  //   {
  //     id: 'AC003',
  //     title: 'Potential font size and color contrast issues',
  //     description: "The Tailwind configuration extends the theme with custom colors and animations. Some color combinations might not meet accessibility standards for contrast ratios. The configuration doesn't explicitly set minimum font sizes, which could lead to readability issues on smaller screens or for users with visual impairments.",
  //     file: '/tailwind.config.ts'
  //   }
  // ]
  // return concerns;
}

async function createIssueDescription(file:string, repo: string) {

  console.log("in createIssueDescriptionm file:", file, "repo:", repo);
  const query = {
    messages: [
      {
        content: `Look closely at the file ${file} and find all accessibility concerns.
            The output response should be just the body of the issue formatted to be displayed as markdown.
            Do not include anything other than the body of the issue in your response.
              include the following information:
                - The file path where the issues are located
                - information about each accessibility issue in this file. Include:
                  - A code snippet of each of the concerns
                  - A description of why this is a problem and how to fix the issue
                  - A code snippet of the fixed code
              `,
        role: "user",
      },
    ],
    repositories: [
      {
        remote: "github",
        repository: `${GITHUB_USERNAME}/${repo}`,
        branch: "main",
      },
    ],
    // sessionId: "accessibility-test",
    //   genius: true,
  };

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GREPTILE_API_KEY}`,
      "X-GitHub-Token": GITHUB_PERSONAL_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  };
  console.log("OPTIONS", options);

  const response = await fetch(`${GREPTILE_API_BASE_URL}/query`, options);
  console.log(response);
  const data = await response.json();
  console.log("ISSUE DATA:", data);
  return data.message


//  return `# This is the issue description for the file ${file}

//  ### Accessibility Concerns:

//  - The image tag in line 10 is missing an alt attribute. This is a problem because screen readers rely on the alt attribute to describe the content of the image to visually impaired users. To fix this issue, add an alt attribute to the image tag.
//  yay!

//  Here's a bunch more information about the issue and how to fix it.

//  lalala! `


}

async function createGithubIssue(title: string, body: string, repo: string) {
  const response = await fetch(`${GITHUB_API_BASE_URL}/repos/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, body }),
  });
  const data = await response.json();
  console.log("ISSUE CREATED:", data);
  return data;
}

export { getAccessibilityConcerns, createIssueDescription, createGithubIssue };
