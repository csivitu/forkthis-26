export interface ResourceItem {
  id: string;
  number: string;
  title: string;
  description: string;
  buttonText: string;
  url: string;
}

export interface ResourceSection {
  id: string;
  title: string;
  navLabel: string;
  items: ResourceItem[];
}

export const RESOURCE_SECTIONS: ResourceSection[] = [
  {
    id: "youtube",
    title: "YOUTUBE VIDEOS",
    navLabel: "Youtube",
    items: [
      {
        id: "yt-1",
        number: "001",
        title: "Learn Git in 20 Minutes",
        description:
          "A YouTube tutorial on learning Git, covering all essential commands and concepts",
        buttonText: "Watch video",
        url: "https://www.youtube.com/watch?v=RGOj5yH7evk",
      },
      {
        id: "yt-2",
        number: "002",
        title: "GitHub Tutorial For Beginners",
        description:
          "A complete guide to using GitHub for version control and collaboration on code.",
        buttonText: "Watch video",
        url: "https://www.youtube.com/watch?v=HkdAHXoRtos",
      },
      {
        id: "yt-3",
        number: "003",
        title: "Git & GitHub Crash Course For Beginners",
        description:
          "A beginner-friendly crash course on Git and GitHub, perfect for newcomers.",
        buttonText: "Watch video",
        url: "https://www.youtube.com/watch?v=RGOj5yH7evk",
      },
    ],
  },
  {
    id: "articles",
    title: "ARTICLES",
    navLabel: "Articles",
    items: [
      {
        id: "art-1",
        number: "001",
        title: "Git and GitHub Documentation",
        description:
          "Comprehensive documentation on Git and GitHub provided by Chaicode.",
        buttonText: "Read Docs",
        url: "https://docs.github.com/en",
      },
      {
        id: "art-2",
        number: "002",
        title: "GitLab Git Cheat Sheet",
        description:
          "A downloadable PDF cheat sheet for Git commands, provided by GitLab.",
        buttonText: "Open PDFs",
        url: "https://about.gitlab.com/images/press/git-cheat-sheet.pdf",
      },
      {
        id: "art-3",
        number: "003",
        title: "Git and GitHub for Beginners",
        description:
          "A beginner's guide to understanding Git and GitHub, focusing on version control",
        buttonText: "Read Article",
        url: "https://www.freecodecamp.org/news/git-and-github-for-beginners/",
      },
      {
        id: "art-4",
        number: "004",
        title: "Chai aur Git Welcome",
        description:
          "The welcome page for a comprehensive guide to Git and GitHub, curated for the 'Chai aur Git Welcome'",
        buttonText: "Read Article",
        url: "https://chaicode.com",
      },
    ],
  },
  {
    id: "github",
    title: "GITHUB",
    navLabel: "GitHub",
    items: [
      {
        id: "gh-1",
        number: "001",
        title: "Git Cheatsheet by Excalith",
        description:
          "A collection of useful Git commands and cheats for quick reference.",
        buttonText: "View on GitHub",
        url: "https://github.com/excalith/git-cheat-sheet",
      },
      {
        id: "gh-2",
        number: "002",
        title: "Official GitHub Learning Resources",
        description:
          "Official documentation and resources from GitHub to start your journey.",
        buttonText: "View on GitHub",
        url: "https://github.com/skills",
      },
      {
        id: "gh-3",
        number: "003",
        title: "Official GitHub Git Cheat Sheet",
        description:
          "A downloadable PDF cheat sheet with common Git commands, provided directly by GitHub",
        buttonText: "View on GitHub",
        url: "https://github.com/training/git-cheat-sheets",
      },
    ],
  },
];
