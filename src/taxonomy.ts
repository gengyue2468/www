// Topic labels, not product names. Keep slugs stable when revising descriptions.
export const TAG_DEFINITIONS = [
  { name: "Code", slug: "code", description: "Programming, APIs, parsers, and coursework." },
  { name: "Web", slug: "web", description: "Interfaces, styling, editors, and readable HTML." },
  { name: "Net", slug: "net", description: "DNS, routing, tunnels, and edge delivery." },
  { name: "Cloud", slug: "cloud", description: "Cloud instances, free plans, and server benchmarks." },
  { name: "Ops", slug: "ops", description: "Deployment, containers, certificates, and self-hosting." },
  { name: "System", slug: "system", description: "Operating systems, WSL, services, and memory." },
  { name: "Tools", slug: "tools", description: "Software, command-line tools, and resource roundups." },
  { name: "Models", slug: "models", description: "Language models, agents, and model integrations." },
  { name: "Life", slug: "life", description: "Everyday life, trips, stories, and yearly reflections." },
  { name: "Music", slug: "music", description: "Listening, scrobbling, and music services." },
  { name: "Meta", slug: "meta", description: "This site, publishing, and build experiments." },
] as const;

export type TagDefinition = (typeof TAG_DEFINITIONS)[number];
export type TagName = TagDefinition["name"];

// The first tag is the primary cluster; an optional second tag is a cross-topic.
export const MAX_POST_TAGS = 2;
