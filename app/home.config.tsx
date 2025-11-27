import Link from "next/link";
import { SVGProps } from "react";

export const homeStyles = {
  container:
    "px-8 flex min-h-screen items-center justify-center py-24 md:py-32 lg:py-48",
  name: "font-semibold text-6xl md:text-7xl lg:text-8xl",
  bio: "text-2xl md:text-3xl lg:text-4xl mt-8 leading-relaxed",
  tag: "px-4 py-2 rounded-xs text-xl md:text-2xl lg:text-3xl",
  stackContainer: "flex flex-col gap-0 w-full",
  stack:
    "text-2xl md:text-3xl lg:text-4xl py-8 font-medium leading-relaxed w-full text-left px-8",
  gridContainer:
    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 w-full grid-flow-row-dense grid-flow-col-dense grid-dense py-12",
  gridItem: "border border-neutral-200 dark:border-neutral-800 p-6",
  title: "font-medium",
  subtitle: "opacity-80",
  listContainer: "flex flex-col gap-1 mt-2",
  rowContainer: "flex flex-row items-center justify-between w-full gap-4",
  rowText: "text-right",
};

export const profile = {
  name: "Yue Geng",
  age: new Date().getFullYear() - 2007,
  university: "Huazhong University of Science and Technology",
  major: "Computer Science",
  club: "Bingyan Studio",
  tags: [
    "Poop Master 💩",
    "Abstract Being 🌀",
    "Lazy Pig 🐷",
    "Unwoken Soul 😵‍💫",
    "Sleepyhead 😴",
    "Family Guy Enthusiast 🧔📺",
    "NetEase Music Lover 🎧",
    "Zhihu Explorer 🧠",
    "Bilibili Dweller 📺⚡",
  ],
  stacks: [
    {
      lan: "JavaScript",
      icon: <JavascriptIcon />,
      description:
        "A versatile, high-level programming language primarily used for web development to create interactive and dynamic user experiences on websites.",
    },
    {
      lan: "TypeScript",
      icon: <TypescriptIcon />,
      description:
        "A superset of JavaScript that adds static typing and advanced features, enhancing code quality and maintainability for large-scale applications.",
    },
    {
      lan: "React",
      icon: <ReactIcon />,
      description:
        "A popular JavaScript library for building user interfaces, known for its component-based architecture and efficient rendering using a virtual DOM.",
    },
    {
      lan: "Next.js",
      icon: <NextIcon />,
      description:
        "A React framework that enables server-side rendering and static site generation, optimizing performance and SEO for web applications.",
    },
  ],
  projects: [
    {
      name: "BuddyUp",
      tags: ["Active", "Private", "Next.js", "TypeScript", "AI"],
      url: "https://buddyup.top",
      description:
        "A AI-powered PS generation and management tool designed to help users create and manage their PS with ease.",
      time: "2025.11 - Present",
    },
    {
      name: "BuddyUp Website",
      tags: ["Active", "Private", "Next.js", "TypeScript", "AI"],
      url: "https://buddyup.studio",
      description:
        "The official website for BuddyUp, showcasing its features, benefits, and providing users with information about the platform.",
      time: "2025.11 - Present",
    },
    {
      name: "Let’s see sexual photos together",
      tags: ["Inactive", "Public", "Next.js", "JavaScript", "Internship"],
      url: "https://github.com/gengyue2468/bingyan-internship-project",
      description: "",
      time: "2025.10",
    },
  ],
  games: [
    "Forza Horizon 5",
    "Grand Theft Auto V: Enhanced Edition",
    "Grand Theft Auto IV",
    "Euro Truck Simulator 2",
    "Plants vs. Zombies 2",
  ],
};

export function JavascriptIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 128 128"
      {...props}
    >
      <path fill="#F0DB4F" d="M1.408 1.408h125.184v125.185H1.408z" />
      <path
        fill="#323330"
        d="M116.347 96.736c-.917-5.711-4.641-10.508-15.672-14.981c-3.832-1.761-8.104-3.022-9.377-5.926c-.452-1.69-.512-2.642-.226-3.665c.821-3.32 4.784-4.355 7.925-3.403c2.023.678 3.938 2.237 5.093 4.724c5.402-3.498 5.391-3.475 9.163-5.879c-1.381-2.141-2.118-3.129-3.022-4.045c-3.249-3.629-7.676-5.498-14.756-5.355l-3.688.477c-3.534.893-6.902 2.748-8.877 5.235c-5.926 6.724-4.236 18.492 2.975 23.335c7.104 5.332 17.54 6.545 18.873 11.531c1.297 6.104-4.486 8.08-10.234 7.378c-4.236-.881-6.592-3.034-9.139-6.949c-4.688 2.713-4.688 2.713-9.508 5.485c1.143 2.499 2.344 3.63 4.26 5.795c9.068 9.198 31.76 8.746 35.83-5.176c.165-.478 1.261-3.666.38-8.581M69.462 58.943H57.753l-.048 30.272c0 6.438.333 12.34-.714 14.149c-1.713 3.558-6.152 3.117-8.175 2.427c-2.059-1.012-3.106-2.451-4.319-4.485c-.333-.584-.583-1.036-.667-1.071l-9.52 5.83c1.583 3.249 3.915 6.069 6.902 7.901c4.462 2.678 10.459 3.499 16.731 2.059c4.082-1.189 7.604-3.652 9.448-7.401c2.666-4.915 2.094-10.864 2.07-17.444c.06-10.735.001-21.468.001-32.237"
      />
    </svg>
  );
}

export function TypescriptIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 32 32"
      {...props}
    >
      <rect width="28" height="28" x="2" y="2" fill="#3178c6" rx="1.312" />
      <path
        fill="#fff"
        fill-rule="evenodd"
        d="M18.245 23.759v3.068a6.5 6.5 0 0 0 1.764.575a11.6 11.6 0 0 0 2.146.192a10 10 0 0 0 2.088-.211a5.1 5.1 0 0 0 1.735-.7a3.54 3.54 0 0 0 1.181-1.266a4.47 4.47 0 0 0 .186-3.394a3.4 3.4 0 0 0-.717-1.117a5.2 5.2 0 0 0-1.123-.877a12 12 0 0 0-1.477-.734q-.6-.249-1.08-.484a5.5 5.5 0 0 1-.813-.479a2.1 2.1 0 0 1-.516-.518a1.1 1.1 0 0 1-.181-.618a1.04 1.04 0 0 1 .162-.571a1.4 1.4 0 0 1 .459-.436a2.4 2.4 0 0 1 .726-.283a4.2 4.2 0 0 1 .956-.1a6 6 0 0 1 .808.058a6 6 0 0 1 .856.177a6 6 0 0 1 .836.3a4.7 4.7 0 0 1 .751.422V13.9a7.5 7.5 0 0 0-1.525-.4a12.4 12.4 0 0 0-1.9-.129a8.8 8.8 0 0 0-2.064.235a5.2 5.2 0 0 0-1.716.733a3.66 3.66 0 0 0-1.171 1.271a3.73 3.73 0 0 0-.431 1.845a3.6 3.6 0 0 0 .789 2.34a6 6 0 0 0 2.395 1.639q.63.26 1.175.509a6.5 6.5 0 0 1 .942.517a2.5 2.5 0 0 1 .626.585a1.2 1.2 0 0 1 .23.719a1.1 1.1 0 0 1-.144.552a1.3 1.3 0 0 1-.435.441a2.4 2.4 0 0 1-.726.292a4.4 4.4 0 0 1-1.018.105a5.8 5.8 0 0 1-1.969-.35a5.9 5.9 0 0 1-1.805-1.045m-5.154-7.638h4v-2.527H5.938v2.527H9.92v11.254h3.171Z"
      />
    </svg>
  );
}

export function ReactIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 32 32"
      {...props}
    >
      <circle cx="16" cy="15.974" r="2.5" fill="#00d8ff" />
      <path
        fill="#00d8ff"
        d="M16 21.706a28.4 28.4 0 0 1-8.88-1.2a11.3 11.3 0 0 1-3.657-1.958A3.54 3.54 0 0 1 2 15.974c0-1.653 1.816-3.273 4.858-4.333A28.8 28.8 0 0 1 16 10.293a28.7 28.7 0 0 1 9.022 1.324a11.4 11.4 0 0 1 3.538 1.866A3.4 3.4 0 0 1 30 15.974c0 1.718-2.03 3.459-5.3 4.541a28.8 28.8 0 0 1-8.7 1.191m0-10.217a28 28 0 0 0-8.749 1.282c-2.8.977-4.055 2.313-4.055 3.2c0 .928 1.349 2.387 4.311 3.4A27.2 27.2 0 0 0 16 20.51a27.6 27.6 0 0 0 8.325-1.13C27.4 18.361 28.8 16.9 28.8 15.974a2.33 2.33 0 0 0-1.01-1.573a10.2 10.2 0 0 0-3.161-1.654A27.5 27.5 0 0 0 16 11.489"
      />
      <path
        fill="#00d8ff"
        d="M10.32 28.443a2.64 2.64 0 0 1-1.336-.328c-1.432-.826-1.928-3.208-1.327-6.373a28.8 28.8 0 0 1 3.4-8.593a28.7 28.7 0 0 1 5.653-7.154a11.4 11.4 0 0 1 3.384-2.133a3.4 3.4 0 0 1 2.878 0c1.489.858 1.982 3.486 1.287 6.859a28.8 28.8 0 0 1-3.316 8.133a28.4 28.4 0 0 1-5.476 7.093a11.3 11.3 0 0 1-3.523 2.189a4.9 4.9 0 0 1-1.624.307m1.773-14.7a28 28 0 0 0-3.26 8.219c-.553 2.915-.022 4.668.75 5.114c.8.463 2.742.024 5.1-2.036a27.2 27.2 0 0 0 5.227-6.79a27.6 27.6 0 0 0 3.181-7.776c.654-3.175.089-5.119-.713-5.581a2.33 2.33 0 0 0-1.868.089A10.2 10.2 0 0 0 17.5 6.9a27.5 27.5 0 0 0-5.4 6.849Z"
      />
      <path
        fill="#00d8ff"
        d="M21.677 28.456c-1.355 0-3.076-.82-4.868-2.361a28.8 28.8 0 0 1-5.747-7.237a28.7 28.7 0 0 1-3.374-8.471a11.4 11.4 0 0 1-.158-4A3.4 3.4 0 0 1 8.964 3.9c1.487-.861 4.01.024 6.585 2.31a28.8 28.8 0 0 1 5.39 6.934a28.4 28.4 0 0 1 3.41 8.287a11.3 11.3 0 0 1 .137 4.146a3.54 3.54 0 0 1-1.494 2.555a2.6 2.6 0 0 1-1.315.324m-9.58-10.2a28 28 0 0 0 5.492 6.929c2.249 1.935 4.033 2.351 4.8 1.9c.8-.465 1.39-2.363.782-5.434A27.2 27.2 0 0 0 19.9 13.74a27.6 27.6 0 0 0-5.145-6.64c-2.424-2.152-4.39-2.633-5.191-2.169a2.33 2.33 0 0 0-.855 1.662a10.2 10.2 0 0 0 .153 3.565a27.5 27.5 0 0 0 3.236 8.1Z"
      />
    </svg>
  );
}

export function NextIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 32 32"
      {...props}
    >
      <defs>
        <linearGradient
          id="IconifyId19ac456f24319251a322"
          x1="336.1"
          x2="414.1"
          y1="522.5"
          y2="652.6"
          gradientTransform="translate(-8.06 -1.06)scale(.055)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stop-color="#fff" />
          <stop offset="1" stop-color="#fff" stop-opacity="0" />
        </linearGradient>
        <linearGradient
          id="IconifyId19ac456f24319251a323"
          x1="511.1"
          x2="511.1"
          y1="209.5"
          y2="359.9"
          gradientTransform="translate(-8.06 -1.06)scale(.055)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stop-color="#fff" />
          <stop offset="1" stop-color="#fff" stop-opacity="0" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" />
      <path
        fill="url(#IconifyId19ac456f24319251a322)"
        d="m25.26 26.5l-12.5-16.1H10.4v11.2h1.89v-8.8l11.49 14.84c.52-.35 1-.72 1.48-1.13z"
      />
      <path
        fill="url(#IconifyId19ac456f24319251a323)"
        d="M19.89 10.4h1.86v11.2H19.9z"
      />
    </svg>
  );
}
