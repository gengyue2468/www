const CPUIcon = ({ ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M16.5 7.5h-9v9h9v-9Z" />
      <path
        fillRule="evenodd"
        d="M8.25 2.25A.75.75 0 0 1 9 3v.75h2.25V3a.75.75 0 0 1 1.5 0v.75H15V3a.75.75 0 0 1 1.5 0v.75h.75a3 3 0 0 1 3 3v.75H21A.75.75 0 0 1 21 9h-.75v2.25H21a.75.75 0 0 1 0 1.5h-.75V15H21a.75.75 0 0 1 0 1.5h-.75v.75a3 3 0 0 1-3 3h-.75V21a.75.75 0 0 1-1.5 0v-.75h-2.25V21a.75.75 0 0 1-1.5 0v-.75H9V21a.75.75 0 0 1-1.5 0v-.75h-.75a3 3 0 0 1-3-3v-.75H3A.75.75 0 0 1 3 15h.75v-2.25H3a.75.75 0 0 1 0-1.5h.75V9H3a.75.75 0 0 1 0-1.5h.75v-.75a3 3 0 0 1 3-3h.75V3a.75.75 0 0 1 .75-.75ZM6 6.75A.75.75 0 0 1 6.75 6h10.5a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V6.75Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

const RAMIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M2 5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h3v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v2h3a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zm3 4h6v3H5zm8 0h6v3h-6z"
      />
    </svg>
  );
};

const StorageIcon = ({ ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      viewBox="0 0 32 32"
      {...props}
    >
      <path
        fill="currentColor"
        d="M6.5 9A4.5 4.5 0 0 0 2 13.5v5A4.5 4.5 0 0 0 6.5 23h19a4.5 4.5 0 0 0 4.5-4.5v-5A4.5 4.5 0 0 0 25.5 9zM21 14.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0m3.5 1.5a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3"
      />
    </svg>
  );
};

const GraphicsIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M2 7v1.5h1V17h1.5V7zm4 0v9h1v1h7v-1h8V7zm11.5 2a2.5 2.5 0 0 1 2.5 2.5a2.5 2.5 0 0 1-2.5 2.5a2.5 2.5 0 0 1-2.5-2.5A2.5 2.5 0 0 1 17.5 9"
      />
    </svg>
  );
};

const PhoneIcon = ({ ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path d="M8 16.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z" />
      <path
        fillRule="evenodd"
        d="M4 4a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V4Zm4-1.5v.75c0 .414.336.75.75.75h2.5a.75.75 0 0 0 .75-.75V2.5h1A1.5 1.5 0 0 1 14.5 4v12a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 16V4A1.5 1.5 0 0 1 7 2.5h1Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

const LaptopIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 48 48">
      <g
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="4"
      >
        <path d="M8 8h32v20H8zm0 20L4 41h40l-4-13" />
        <path d="M19.9 35h8.2l1.9 6H18z" />
      </g>
    </svg>
  );
};

const MacIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M13.112 7.508a1.5 1.5 0 0 0 .39-1c0-.048 0-.1-.006-.144a1.5 1.5 0 0 0-.576.162a1.63 1.63 0 0 0-.92 1.39a1 1 0 0 0 .009.135a1.33 1.33 0 0 0 1.103-.543m-3.335 5.078a3.7 3.7 0 0 0 .517.619a.9.9 0 0 0 .648.288a1.8 1.8 0 0 0 .561-.147a1.7 1.7 0 0 1 .648-.138a1.7 1.7 0 0 1 .631.138a1.6 1.6 0 0 0 .585.141a.97.97 0 0 0 .633-.279a3.5 3.5 0 0 0 .493-.6a4 4 0 0 0 .384-.691q.068-.157.123-.327a1.7 1.7 0 0 1-.492-.324a1.556 1.556 0 0 1 .3-2.5a1.72 1.72 0 0 0-1.351-.712a2 2 0 0 0-.81.144a3.3 3.3 0 0 1-.6.186a2.2 2.2 0 0 1-.537-.159a2 2 0 0 0-.678-.159a1.75 1.75 0 0 0-.877.249a1.85 1.85 0 0 0-.648.658A2.35 2.35 0 0 0 9 10.212a4 4 0 0 0 .231 1.288a4.3 4.3 0 0 0 .546 1.086m11.712-8.505H2.51a.51.51 0 0 0-.51.511V17.46a.51.51 0 0 0 .51.511h7.781l-.113 1.69a.82.82 0 0 1-.262.554l-.791.7a.16.16 0 0 0 .105.281h5.54a.16.16 0 0 0 .1-.282l-.8-.7a.8.8 0 0 1-.269-.567l-.1-1.68h7.783A.51.51 0 0 0 22 17.46V4.592a.51.51 0 0 0-.511-.511M12 4.214a.186.186 0 0 1 .019.372h-.038A.186.186 0 0 1 12 4.214m9.36 10.925H2.64V4.721h18.72z"
      />
    </svg>
  );
};

const GitHubIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
      />
    </svg>
  );
};

const UserIcon = ({ ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

const LinkIcon = ({ ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
      <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
    </svg>
  );
};

const EmailIcon = ({ ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
};

const WeChatIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M15.85 8.14c.39 0 .77.03 1.14.08C16.31 5.25 13.19 3 9.44 3c-4.25 0-7.7 2.88-7.7 6.43c0 2.05 1.15 3.86 2.94 5.04L3.67 16.5l2.76-1.19c.59.21 1.21.38 1.87.47c-.09-.39-.14-.79-.14-1.21c-.01-3.54 3.44-6.43 7.69-6.43M12 5.89a.96.96 0 1 1 0 1.92a.96.96 0 0 1 0-1.92M6.87 7.82a.96.96 0 1 1 0-1.92a.96.96 0 0 1 0 1.92"
      />
      <path
        fill="currentColor"
        d="M22.26 14.57c0-2.84-2.87-5.14-6.41-5.14s-6.41 2.3-6.41 5.14s2.87 5.14 6.41 5.14c.58 0 1.14-.08 1.67-.2L20.98 21l-1.2-2.4c1.5-.94 2.48-2.38 2.48-4.03m-8.34-.32a.96.96 0 1 1 .96-.96c.01.53-.43.96-.96.96m3.85 0a.96.96 0 1 1 0-1.92a.96.96 0 0 1 0 1.92"
      />
    </svg>
  );
};

const QQIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 24 24">
      <g fill="none">
        <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
        <path
          fill="currentColor"
          d="M12 2a6.285 6.285 0 0 0-6.276 5.937l-.146 2.63a28 28 0 0 0-.615 1.41c-1.24 3.073-1.728 5.773-1.088 6.032c.335.135.913-.426 1.566-1.432a6.67 6.67 0 0 0 1.968 3.593c-1.027.35-1.91.828-1.91 1.33c0 .509 2.48.503 4.239.5h.001c.549-.002 1.01-.008 1.38-.057a6.7 6.7 0 0 0 1.76 0c.37.05.833.055 1.382.056c1.76.004 4.239.01 4.239-.499c0-.502-.883-.979-1.909-1.33a6.67 6.67 0 0 0 1.967-3.586c.65 1.002 1.227 1.56 1.56 1.425c.64-.259.154-2.96-1.088-6.032a28 28 0 0 0-.607-1.395l-.147-2.645A6.285 6.285 0 0 0 12 2"
        />
      </g>
    </svg>
  );
};

const PadIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        fill-rule="evenodd"
        d="M5.2 3.2v17.6h13.6V3.2zM4 3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm8 17a1 1 0 1 1 0-2a1 1 0 0 1 0 2"
      />
    </svg>
  );
};

const LightningIcon = ({ ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path d="M11.983 1.907a.75.75 0 0 0-1.292-.657l-8.5 9.5A.75.75 0 0 0 2.75 12h6.572l-1.305 6.093a.75.75 0 0 0 1.292.657l8.5-9.5A.75.75 0 0 0 17.25 8h-6.572l1.305-6.093Z" />
    </svg>
  );
};

const WrenchIcon = ({ ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M14.5 10a4.5 4.5 0 0 0 4.284-5.882c-.105-.324-.51-.391-.752-.15L15.34 6.66a.454.454 0 0 1-.493.11 3.01 3.01 0 0 1-1.618-1.616.455.455 0 0 1 .11-.494l2.694-2.692c.24-.241.174-.647-.15-.752a4.5 4.5 0 0 0-5.873 4.575c.055.873-.128 1.808-.8 2.368l-7.23 6.024a2.724 2.724 0 1 0 3.837 3.837l6.024-7.23c.56-.672 1.495-.855 2.368-.8.096.007.193.01.291.01ZM5 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
        clipRule="evenodd"
      />
      <path d="M14.5 11.5c.173 0 .345-.007.514-.022l3.754 3.754a2.5 2.5 0 0 1-3.536 3.536l-4.41-4.41 2.172-2.607c.052-.063.147-.138.342-.196.202-.06.469-.087.777-.067.128.008.257.012.387.012ZM6 4.586l2.33 2.33a.452.452 0 0 1-.08.09L6.8 8.214 4.586 6H3.309a.5.5 0 0 1-.447-.276l-1.7-3.402a.5.5 0 0 1 .093-.577l.49-.49a.5.5 0 0 1 .577-.094l3.402 1.7A.5.5 0 0 1 6 3.31v1.277Z" />
    </svg>
  );
};

const EarthIcon = ({ ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-6.5 6.326a6.52 6.52 0 0 1-1.5.174 6.487 6.487 0 0 1-5.011-2.36l.49-.98a.423.423 0 0 1 .614-.164l.294.196a.992.992 0 0 0 1.491-1.139l-.197-.593a.252.252 0 0 1 .126-.304l1.973-.987a.938.938 0 0 0 .361-1.359.375.375 0 0 1 .239-.576l.125-.025A2.421 2.421 0 0 0 12.327 6.6l.05-.149a1 1 0 0 0-.242-1.023l-1.489-1.489a.5.5 0 0 1-.146-.353v-.067a6.5 6.5 0 0 1 5.392 9.23 1.398 1.398 0 0 0-.68-.244l-.566-.566a1.5 1.5 0 0 0-1.06-.439h-.172a1.5 1.5 0 0 0-1.06.44l-.593.592a.501.501 0 0 1-.13.093l-1.578.79a1 1 0 0 0-.553.894v.191a1 1 0 0 0 1 1h.5a.5.5 0 0 1 .5.5v.326Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

const SunIcon = ({ ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.06ZM5.404 6.464a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 1 0-1.061 1.06l1.06 1.06Z" />
    </svg>
  );
};

const MoonIcon = ({ ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

const NCMIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M12.001 22c-5.523 0-10-4.477-10-10s4.477-10 10-10s10 4.477 10 10s-4.477 10-10 10m-1.086-10.432c.24-.84 1.075-1.541 1.99-1.648c.187.694.388 1.373.545 2.063c.053.23.037.495-.018.727c-.213.892-1.248 1.242-1.978.685c-.53-.405-.742-1.12-.539-1.827m3.817-.197c-.125-.465-.256-.927-.393-1.42c.5.13.907.36 1.255.697c1.257 1.222 1.385 3.3.294 4.732c-1.135 1.49-3.155 2.134-5.028 1.605c-2.302-.65-3.808-2.952-3.441-5.316c.274-1.768 1.27-3.004 2.9-3.733c.407-.182.58-.56.42-.93c-.157-.364-.54-.504-.944-.343c-2.721 1.088-4.32 4.134-3.67 6.987c.713 3.118 3.495 5.163 6.675 4.859c1.732-.166 3.164-.948 4.216-2.347c1.506-2.002 1.297-4.783-.463-6.499c-.666-.65-1.471-1.018-2.39-1.153c-.083-.013-.217-.052-.232-.106c-.087-.313-.18-.632-.206-.954c-.029-.357.29-.64.65-.645c.253-.003.434.13.603.3c.303.3.704.322.988.062c.29-.264.296-.678.018-1.008c-.566-.672-1.586-.891-2.43-.523c-.847.37-1.321 1.187-1.2 2.093c.038.28.11.557.167.842l-.26.072a3.86 3.86 0 0 0-2.098 1.414c-.921 1.22-.936 2.828-.041 3.947c1.274 1.594 3.747 1.284 4.523-.568c.284-.677.275-1.368.087-2.065"
      ></path>
    </svg>
  );
};

const WaveIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 24 24">
      <rect width="2.8" height="12" x="1" y="6" fill="currentColor">
        <animate
          attributeName="y"
          begin="svgSpinnersBarsScaleMiddle0.begin+0.4s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".14,.73,.34,1;.65,.26,.82,.45"
          values="6;1;6"
        />
        <animate
          attributeName="height"
          begin="svgSpinnersBarsScaleMiddle0.begin+0.4s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".14,.73,.34,1;.65,.26,.82,.45"
          values="12;22;12"
        />
      </rect>
      <rect width="2.8" height="12" x="5.8" y="6" fill="currentColor">
        <animate
          attributeName="y"
          begin="svgSpinnersBarsScaleMiddle0.begin+0.2s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".14,.73,.34,1;.65,.26,.82,.45"
          values="6;1;6"
        />
        <animate
          attributeName="height"
          begin="svgSpinnersBarsScaleMiddle0.begin+0.2s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".14,.73,.34,1;.65,.26,.82,.45"
          values="12;22;12"
        />
      </rect>
      <rect width="2.8" height="12" x="10.6" y="6" fill="currentColor">
        <animate
          id="svgSpinnersBarsScaleMiddle0"
          attributeName="y"
          begin="0;svgSpinnersBarsScaleMiddle1.end-0.1s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".14,.73,.34,1;.65,.26,.82,.45"
          values="6;1;6"
        />
        <animate
          attributeName="height"
          begin="0;svgSpinnersBarsScaleMiddle1.end-0.1s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".14,.73,.34,1;.65,.26,.82,.45"
          values="12;22;12"
        />
      </rect>
      <rect width="2.8" height="12" x="15.4" y="6" fill="currentColor">
        <animate
          attributeName="y"
          begin="svgSpinnersBarsScaleMiddle0.begin+0.2s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".14,.73,.34,1;.65,.26,.82,.45"
          values="6;1;6"
        />
        <animate
          attributeName="height"
          begin="svgSpinnersBarsScaleMiddle0.begin+0.2s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".14,.73,.34,1;.65,.26,.82,.45"
          values="12;22;12"
        />
      </rect>
      <rect width="2.8" height="12" x="20.2" y="6" fill="currentColor">
        <animate
          id="svgSpinnersBarsScaleMiddle1"
          attributeName="y"
          begin="svgSpinnersBarsScaleMiddle0.begin+0.4s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".14,.73,.34,1;.65,.26,.82,.45"
          values="6;1;6"
        />
        <animate
          attributeName="height"
          begin="svgSpinnersBarsScaleMiddle0.begin+0.4s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".14,.73,.34,1;.65,.26,.82,.45"
          values="12;22;12"
        />
      </rect>
    </svg>
  );
};

const PlusIcon = ({ ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
};

const BrainIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 48 48">
      <g fill="none" stroke="currentColor" strokeWidth={1}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={4.667}
          d="M19.036 44q-1.47-4.793-4.435-7.147c-2.965-2.353-7.676-.89-9.416-3.318s1.219-6.892 2.257-9.526s-3.98-3.565-3.394-4.313q.585-.748 7.609-4.316Q13.652 4 26.398 4C39.144 4 44 14.806 44 21.68c0 6.872-5.88 14.276-14.256 15.873q-1.123 1.636 3.24 6.447"
        ></path>
        <path
          fill="currentColor"
          fillRule="evenodd"
          strokeLinejoin="round"
          strokeWidth={4}
          d="M19.5 14.5q-.981 3.801.583 5.339q1.563 1.537 5.328 2.01q-.855 4.903 2.083 4.6q2.937-.302 3.53-2.44q4.59 1.29 4.976-2.16c.385-3.45-1.475-6.201-2.238-6.201s-2.738-.093-2.738-1.148s-2.308-1.65-4.391-1.65s-.83-1.405-3.69-.85q-2.86.555-3.443 2.5Z"
          clipRule="evenodd"
        ></path>
        <path
          strokeLinecap="round"
          strokeWidth={4}
          d="M30.5 25.5c-1.017.631-2.412 1.68-3 2.5c-1.469 2.05-2.66 3.298-2.92 4.608"
        ></path>
      </g>
    </svg>
  );
};

const HomeIcon = ({ ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

const PaintIcon = ({ ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path d="M15.993 1.385a1.87 1.87 0 0 1 2.623 2.622l-4.03 5.27a12.749 12.749 0 0 1-4.237 3.562 4.508 4.508 0 0 0-3.188-3.188 12.75 12.75 0 0 1 3.562-4.236l5.27-4.03ZM6 11a3 3 0 0 0-3 3 .5.5 0 0 1-.72.45.75.75 0 0 0-1.035.931A4.001 4.001 0 0 0 9 14.004V14a3.01 3.01 0 0 0-1.66-2.685A2.99 2.99 0 0 0 6 11Z" />
    </svg>
  );
};

const PCIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M5 3a2 2 0 0 0-2 2v5h18V5a2 2 0 0 0-2-2zM3 14v-2h18v2a2 2 0 0 1-2 2h-6v3h2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h2v-3H5a2 2 0 0 1-2-2"
        clipRule="evenodd"
      ></path>
    </svg>
  );
};

const WordIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 32 32">
      <defs>
        <linearGradient
          id="vscodeIconsFileTypeWord0"
          x1={4.494}
          x2={13.832}
          y1={-1712.086}
          y2={-1695.914}
          gradientTransform="translate(0 1720)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset={0} stopColor="#2368c4"></stop>
          <stop offset={0.5} stopColor="#1a5dbe"></stop>
          <stop offset={1} stopColor="#1146ac"></stop>
        </linearGradient>
      </defs>
      <path
        fill="#41a5ee"
        d="M28.806 3H9.705a1.19 1.19 0 0 0-1.193 1.191V9.5l11.069 3.25L30 9.5V4.191A1.19 1.19 0 0 0 28.806 3"
      ></path>
      <path fill="#2b7cd3" d="M30 9.5H8.512V16l11.069 1.95L30 16Z"></path>
      <path fill="#185abd" d="M8.512 16v6.5l10.418 1.3L30 22.5V16Z"></path>
      <path
        fill="#103f91"
        d="M9.705 29h19.1A1.19 1.19 0 0 0 30 27.809V22.5H8.512v5.309A1.19 1.19 0 0 0 9.705 29"
      ></path>
      <path
        d="M16.434 8.2H8.512v16.25h7.922a1.2 1.2 0 0 0 1.194-1.191V9.391A1.2 1.2 0 0 0 16.434 8.2"
        opacity={0.1}
      ></path>
      <path
        d="M15.783 8.85H8.512V25.1h7.271a1.2 1.2 0 0 0 1.194-1.191V10.041a1.2 1.2 0 0 0-1.194-1.191"
        opacity={0.2}
      ></path>
      <path
        d="M15.783 8.85H8.512V23.8h7.271a1.2 1.2 0 0 0 1.194-1.191V10.041a1.2 1.2 0 0 0-1.194-1.191"
        opacity={0.2}
      ></path>
      <path
        d="M15.132 8.85h-6.62V23.8h6.62a1.2 1.2 0 0 0 1.194-1.191V10.041a1.2 1.2 0 0 0-1.194-1.191"
        opacity={0.2}
      ></path>
      <path
        fill="url(#vscodeIconsFileTypeWord0)"
        d="M3.194 8.85h11.938a1.193 1.193 0 0 1 1.194 1.191v11.918a1.193 1.193 0 0 1-1.194 1.191H3.194A1.19 1.19 0 0 1 2 21.959V10.041A1.19 1.19 0 0 1 3.194 8.85"
      ></path>
      <path
        fill="#fff"
        d="M6.9 17.988q.035.276.046.481h.028q.015-.195.065-.47c.05-.275.062-.338.089-.465l1.255-5.407h1.624l1.3 5.326a8 8 0 0 1 .162 1h.022a8 8 0 0 1 .135-.975l1.039-5.358h1.477l-1.824 7.748h-1.727l-1.237-5.126q-.054-.222-.122-.578t-.084-.52h-.021q-.021.189-.084.561t-.1.552L7.78 19.871H6.024L4.19 12.127h1.5l1.131 5.418a5 5 0 0 1 .079.443"
      ></path>
    </svg>
  );
};

const PowerPointIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 32 32">
      <defs>
        <linearGradient
          id="vscodeIconsFileTypePowerpoint0"
          x1={4.494}
          x2={13.832}
          y1={-1748.086}
          y2={-1731.914}
          gradientTransform="translate(0 1756)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset={0} stopColor="#ca4c28"></stop>
          <stop offset={0.5} stopColor="#c5401e"></stop>
          <stop offset={1} stopColor="#b62f14"></stop>
        </linearGradient>
      </defs>
      <path
        fill="#ed6c47"
        d="M18.93 17.3L16.977 3h-.146A12.9 12.9 0 0 0 3.953 15.854V16Z"
      ></path>
      <path
        fill="#ff8f6b"
        d="M17.123 3h-.146v13l6.511 2.6L30 16v-.146A12.9 12.9 0 0 0 17.123 3"
      ></path>
      <path
        fill="#d35230"
        d="M30 16v.143A12.905 12.905 0 0 1 17.12 29h-.287a12.907 12.907 0 0 1-12.88-12.857V16Z"
      ></path>
      <path
        d="M17.628 9.389V23.26a1.2 1.2 0 0 1-.742 1.1a1.2 1.2 0 0 1-.45.091H7.027a10 10 0 0 1-.521-.65a12.74 12.74 0 0 1-2.553-7.657v-.286A12.7 12.7 0 0 1 6.05 8.85a9 9 0 0 1 .456-.65h9.93a1.2 1.2 0 0 1 1.192 1.189"
        opacity={0.1}
      ></path>
      <path
        d="M16.977 10.04v13.871a1.2 1.2 0 0 1-.091.448a1.2 1.2 0 0 1-1.1.741H7.62q-.309-.314-.593-.65a10 10 0 0 1-.521-.65a12.74 12.74 0 0 1-2.553-7.657v-.286A12.7 12.7 0 0 1 6.05 8.85h9.735a1.2 1.2 0 0 1 1.192 1.19"
        opacity={0.2}
      ></path>
      <path
        d="M16.977 10.04v12.571a1.2 1.2 0 0 1-1.192 1.189H6.506a12.74 12.74 0 0 1-2.553-7.657v-.286A12.7 12.7 0 0 1 6.05 8.85h9.735a1.2 1.2 0 0 1 1.192 1.19"
        opacity={0.2}
      ></path>
      <path
        d="M16.326 10.04v12.571a1.2 1.2 0 0 1-1.192 1.189H6.506a12.74 12.74 0 0 1-2.553-7.657v-.286A12.7 12.7 0 0 1 6.05 8.85h9.084a1.2 1.2 0 0 1 1.192 1.19"
        opacity={0.2}
      ></path>
      <path
        fill="url(#vscodeIconsFileTypePowerpoint0)"
        d="M3.194 8.85h11.938a1.193 1.193 0 0 1 1.194 1.191v11.918a1.193 1.193 0 0 1-1.194 1.191H3.194A1.19 1.19 0 0 1 2 21.959V10.041A1.19 1.19 0 0 1 3.194 8.85"
      ></path>
      <path
        fill="#fff"
        d="M9.293 12.028a3.3 3.3 0 0 1 2.174.636a2.27 2.27 0 0 1 .756 1.841a2.56 2.56 0 0 1-.373 1.376a2.5 2.5 0 0 1-1.059.935a3.6 3.6 0 0 1-1.591.334H7.687v2.8H6.141v-7.922ZM7.686 15.94h1.331a1.74 1.74 0 0 0 1.177-.351a1.3 1.3 0 0 0 .4-1.025q0-1.309-1.525-1.31H7.686z"
      ></path>
    </svg>
  );
};

const ExcelIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 32 32">
      <defs>
        <linearGradient
          id="vscodeIconsFileTypeExcel0"
          x1={4.494}
          x2={13.832}
          y1={-2092.086}
          y2={-2075.914}
          gradientTransform="translate(0 2100)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset={0} stopColor="#18884f"></stop>
          <stop offset={0.5} stopColor="#117e43"></stop>
          <stop offset={1} stopColor="#0b6631"></stop>
        </linearGradient>
      </defs>
      <path
        fill="#185c37"
        d="M19.581 15.35L8.512 13.4v14.409A1.19 1.19 0 0 0 9.705 29h19.1A1.19 1.19 0 0 0 30 27.809V22.5Z"
      ></path>
      <path
        fill="#21a366"
        d="M19.581 3H9.705a1.19 1.19 0 0 0-1.193 1.191V9.5L19.581 16l5.861 1.95L30 16V9.5Z"
      ></path>
      <path fill="#107c41" d="M8.512 9.5h11.069V16H8.512Z"></path>
      <path
        d="M16.434 8.2H8.512v16.25h7.922a1.2 1.2 0 0 0 1.194-1.191V9.391A1.2 1.2 0 0 0 16.434 8.2"
        opacity={0.1}
      ></path>
      <path
        d="M15.783 8.85H8.512V25.1h7.271a1.2 1.2 0 0 0 1.194-1.191V10.041a1.2 1.2 0 0 0-1.194-1.191"
        opacity={0.2}
      ></path>
      <path
        d="M15.783 8.85H8.512V23.8h7.271a1.2 1.2 0 0 0 1.194-1.191V10.041a1.2 1.2 0 0 0-1.194-1.191"
        opacity={0.2}
      ></path>
      <path
        d="M15.132 8.85h-6.62V23.8h6.62a1.2 1.2 0 0 0 1.194-1.191V10.041a1.2 1.2 0 0 0-1.194-1.191"
        opacity={0.2}
      ></path>
      <path
        fill="url(#vscodeIconsFileTypeExcel0)"
        d="M3.194 8.85h11.938a1.193 1.193 0 0 1 1.194 1.191v11.918a1.193 1.193 0 0 1-1.194 1.191H3.194A1.19 1.19 0 0 1 2 21.959V10.041A1.19 1.19 0 0 1 3.194 8.85"
      ></path>
      <path
        fill="#fff"
        d="m5.7 19.873l2.511-3.884l-2.3-3.862h1.847L9.013 14.6c.116.234.2.408.238.524h.017q.123-.281.26-.546l1.342-2.447h1.7l-2.359 3.84l2.419 3.905h-1.809l-1.45-2.711A2.4 2.4 0 0 1 9.2 16.8h-.024a1.7 1.7 0 0 1-.168.351l-1.493 2.722Z"
      ></path>
      <path
        fill="#33c481"
        d="M28.806 3h-9.225v6.5H30V4.191A1.19 1.19 0 0 0 28.806 3"
      ></path>
      <path fill="#107c41" d="M19.581 16H30v6.5H19.581Z"></path>
    </svg>
  );
};

const PDFIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 24 24">
      <path
        fill="#ef5350"
        d="M13 9h5.5L13 3.5zM6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m4.93 10.44c.41.9.93 1.64 1.53 2.15l.41.32c-.87.16-2.07.44-3.34.93l-.11.04l.5-1.04c.45-.87.78-1.66 1.01-2.4m6.48 3.81c.18-.18.27-.41.28-.66c.03-.2-.02-.39-.12-.55c-.29-.47-1.04-.69-2.28-.69l-1.29.07l-.87-.58c-.63-.52-1.2-1.43-1.6-2.56l.04-.14c.33-1.33.64-2.94-.02-3.6a.85.85 0 0 0-.61-.24h-.24c-.37 0-.7.39-.79.77c-.37 1.33-.15 2.06.22 3.27v.01c-.25.88-.57 1.9-1.08 2.93l-.96 1.8l-.89.49c-1.2.75-1.77 1.59-1.88 2.12c-.04.19-.02.36.05.54l.03.05l.48.31l.44.11c.81 0 1.73-.95 2.97-3.07l.18-.07c1.03-.33 2.31-.56 4.03-.75c1.03.51 2.24.74 3 .74c.44 0 .74-.11.91-.3m-.41-.71l.09.11c-.01.1-.04.11-.09.13h-.04l-.19.02c-.46 0-1.17-.19-1.9-.51c.09-.1.13-.1.23-.1c1.4 0 1.8.25 1.9.35M7.83 17c-.65 1.19-1.24 1.85-1.69 2c.05-.38.5-1.04 1.21-1.69zm3.02-6.91c-.23-.9-.24-1.63-.07-2.05l.07-.12l.15.05c.17.24.19.56.09 1.1l-.03.16l-.16.82z"
      ></path>
    </svg>
  );
};

const FolderIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 48 48">
      <path
        fill="#ffa000"
        d="M40 12H22l-4-4H8c-2.2 0-4 1.8-4 4v8h40v-4c0-2.2-1.8-4-4-4"
      ></path>
      <path
        fill="#ffca28"
        d="M40 12H8c-2.2 0-4 1.8-4 4v20c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V16c0-2.2-1.8-4-4-4"
      ></path>
    </svg>
  );
};

const DownloadIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 24 24">
      <g fill="none" fillRule="evenodd">
        <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path>
        <path
          fill="currentColor"
          d="M12 2a1 1 0 0 0-1 1v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-6V3a1 1 0 0 0-1-1m1 3v8.828L14.828 12a1 1 0 0 1 1.415 1.414l-3.36 3.359a1.25 1.25 0 0 1-1.767 0l-3.359-3.359A1 1 0 1 1 9.172 12L11 13.828V5z"
        ></path>
      </g>
    </svg>
  );
};

const NotionIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 256 256">
      <g fill="none">
        <g clipPath="url(#SVG9PUMWdIu)">
          <path
            fill="#f4f2ed"
            d="M196 0H60C26.863 0 0 26.863 0 60v136c0 33.137 26.863 60 60 60h136c33.137 0 60-26.863 60-60V60c0-33.137-26.863-60-60-60"
          ></path>
          <g clipPath="url(#SVGwxg6hbaa)">
            <path
              fill="#fff"
              d="m50.53 47.548l96.832-7.152c11.895-1.02 14.951-.333 22.43 5.105l30.91 21.775c5.098 3.745 6.796 4.765 6.796 8.843v119.425c0 7.485-2.718 11.912-12.233 12.588l-112.448 6.811c-7.14.337-10.54-.683-14.28-5.448l-22.762-29.6C41.692 174.448 40 170.37 40 165.603V59.448c0-6.12 2.718-11.223 10.53-11.9"
            ></path>
            <path
              fill="#000"
              fillRule="evenodd"
              d="M147.362 40.398L50.53 47.55C42.718 48.225 40 53.33 40 59.448v106.155c0 4.765 1.692 8.843 5.775 14.292l22.762 29.598c3.74 4.765 7.14 5.787 14.28 5.448l112.45-6.808c9.508-.677 12.232-5.104 12.232-12.587V76.12c0-3.867-1.527-4.982-6.025-8.282L169.792 45.5c-7.478-5.438-10.535-6.125-22.43-5.105zM85.36 74.165c-9.182.618-11.265.758-16.48-3.482L55.622 60.137c-1.347-1.364-.67-3.067 2.725-3.407l93.088-6.802c7.817-.682 11.888 2.042 14.945 4.422l15.965 11.568c.682.344 2.38 2.38.338 2.38L86.55 74.085zm-10.705 120.36V93.142c0-4.427 1.36-6.47 5.43-6.812L190.5 79.865c3.745-.337 5.437 2.043 5.437 6.463v100.707c0 4.428-.682 8.173-6.795 8.511l-105.66 6.125c-6.112.337-8.825-1.698-8.825-7.146zm104.3-95.947c.678 3.063 0 6.125-3.062 6.475l-5.093 1.01v74.853c-4.422 2.38-8.493 3.739-11.894 3.739c-5.438 0-6.796-1.703-10.868-6.802l-33.302-52.395v50.692l10.535 2.386s0 6.125-8.5 6.125l-23.433 1.359c-.682-1.365 0-4.765 2.375-5.442l6.12-1.698v-67.025l-8.493-.687c-.683-3.063 1.015-7.485 5.775-7.828l25.142-1.692l34.65 53.072v-46.953l-8.832-1.015c-.682-3.75 2.035-6.475 5.43-6.807z"
              clipRule="evenodd"
            ></path>
          </g>
        </g>
        <defs>
          <clipPath id="SVG9PUMWdIu">
            <path fill="#fff" d="M0 0h256v256H0z"></path>
          </clipPath>
          <clipPath id="SVGwxg6hbaa">
            <path fill="#fff" d="M40 40h175v175H40z"></path>
          </clipPath>
        </defs>
      </g>
    </svg>
  );
};

const PlayIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M21.409 9.353a2.998 2.998 0 0 1 0 5.294L8.597 21.614C6.534 22.737 4 21.277 4 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"
      ></path>
    </svg>
  );
};

const PauseIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M2 6c0-1.886 0-2.828.586-3.414S4.114 2 6 2s2.828 0 3.414.586S10 4.114 10 6v12c0 1.886 0 2.828-.586 3.414S7.886 22 6 22s-2.828 0-3.414-.586S2 19.886 2 18zm12 0c0-1.886 0-2.828.586-3.414S16.114 2 18 2s2.828 0 3.414.586S22 4.114 22 6v12c0 1.886 0 2.828-.586 3.414S19.886 22 18 22s-2.828 0-3.414-.586S14 19.886 14 18z"
      ></path>
    </svg>
  );
};

const RewindIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 24 24">
      <g fill="currentColor" fillRule="evenodd" clipRule="evenodd">
        <path d="M10.325 7.824a.75.75 0 0 1 .425.676v7a.75.75 0 0 1-1.5 0v-5.44l-1.281 1.026a.75.75 0 0 1-.937-1.172l2.5-2a.75.75 0 0 1 .793-.09M14.25 9.25a1 1 0 0 0-1 1v3.5a1 1 0 1 0 2 0v-3.5a1 1 0 0 0-1-1m-2.5 1a2.5 2.5 0 0 1 5 0v3.5a2.5 2.5 0 0 1-5 0z"></path>
        <path d="M11.324 1.675A.75.75 0 0 1 12 1.25q1.104.002 2.15.215c4.906.996 8.6 5.333 8.6 10.535c0 5.937-4.813 10.75-10.75 10.75S1.25 17.937 1.25 12c0-4.41 2.655-8.197 6.45-9.855a.75.75 0 1 1 .6 1.374A9.25 9.25 0 1 0 21.25 12a9.255 9.255 0 0 0-6.5-8.834V4.5a.75.75 0 0 1-1.336.469l-2-2.5a.75.75 0 0 1-.09-.794"></path>
      </g>
    </svg>
  );
};

const ForwardIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 24 24">
      <g fill="currentColor" fillRule="evenodd" clipRule="evenodd">
        <path d="M10.325 7.824a.75.75 0 0 1 .425.676v7a.75.75 0 0 1-1.5 0v-5.44l-1.281 1.026a.75.75 0 0 1-.937-1.172l2.5-2a.75.75 0 0 1 .793-.09M14.25 9.25a1 1 0 0 0-1 1v3.5a1 1 0 1 0 2 0v-3.5a1 1 0 0 0-1-1m-2.5 1a2.5 2.5 0 0 1 5 0v3.5a2.5 2.5 0 0 1-5 0z"></path>
        <path d="M12.676 1.675A.75.75 0 0 0 12 1.25q-1.104.002-2.15.215C4.945 2.461 1.25 6.798 1.25 12c0 5.937 4.813 10.75 10.75 10.75S22.75 17.937 22.75 12c0-4.41-2.655-8.197-6.45-9.855a.75.75 0 0 0-.6 1.374A9.25 9.25 0 1 1 2.75 12a9.255 9.255 0 0 1 6.5-8.834V4.5a.75.75 0 0 0 1.336.469l2-2.5a.75.75 0 0 0 .09-.794"></path>
      </g>
    </svg>
  );
};

const FullscreenIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 512 512">
      <path
        fill="currentColor"
        d="M208 48V16H16v192h32V70.627l160.687 160.686l22.626-22.626L70.627 48zm256 256v137.373L299.313 276.687l-22.626 22.626L441.373 464H304v32h192V304z"
      ></path>
    </svg>
  );
};

const SoundIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 512 512">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="m403.966 426.944l-33.285-26.63c74.193-81.075 74.193-205.015-.001-286.09l33.285-26.628c86.612 96.712 86.61 242.635.001 339.348M319.58 155.105l-33.324 26.659c39.795 42.568 39.794 108.444.001 151.012l33.324 26.658c52.205-58.22 52.205-146.109-.001-204.329m-85.163-69.772l-110.854 87.23H42.667v170.666h81.02l110.73 85.458z"
      ></path>
    </svg>
  );
};

const MutedIcon = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 512 512">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="m403.375 257.27l59.584 59.584l-30.167 30.166l-59.583-59.583l-59.584 59.583l-30.166-30.166l59.583-59.584l-59.583-59.583l30.166-30.166l59.584 59.583l59.583-59.583l30.167 30.166zM234.417 85.333l-110.854 87.23H42.667v170.666h81.02l110.73 85.458z"
      ></path>
    </svg>
  );
};

const SpinnerIcon = ({ ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      viewBox="0 0 24 24"
    >
      <g>
        <rect
          width={2}
          height={5}
          x={11}
          y={1}
          fill="currentColor"
          opacity={0.14}
        ></rect>
        <rect
          width={2}
          height={5}
          x={11}
          y={1}
          fill="currentColor"
          opacity={0.29}
          transform="rotate(30 12 12)"
        ></rect>
        <rect
          width={2}
          height={5}
          x={11}
          y={1}
          fill="currentColor"
          opacity={0.43}
          transform="rotate(60 12 12)"
        ></rect>
        <rect
          width={2}
          height={5}
          x={11}
          y={1}
          fill="currentColor"
          opacity={0.57}
          transform="rotate(90 12 12)"
        ></rect>
        <rect
          width={2}
          height={5}
          x={11}
          y={1}
          fill="currentColor"
          opacity={0.71}
          transform="rotate(120 12 12)"
        ></rect>
        <rect
          width={2}
          height={5}
          x={11}
          y={1}
          fill="currentColor"
          opacity={0.86}
          transform="rotate(150 12 12)"
        ></rect>
        <rect
          width={2}
          height={5}
          x={11}
          y={1}
          fill="currentColor"
          transform="rotate(180 12 12)"
        ></rect>
        <animateTransform
          attributeName="transform"
          calcMode="discrete"
          dur="0.75s"
          repeatCount="indefinite"
          type="rotate"
          values="0 12 12;30 12 12;60 12 12;90 12 12;120 12 12;150 12 12;180 12 12;210 12 12;240 12 12;270 12 12;300 12 12;330 12 12;360 12 12"
        ></animateTransform>
      </g>
    </svg>
  );
};

export {
  CPUIcon,
  RAMIcon,
  StorageIcon,
  GraphicsIcon,
  GitHubIcon,
  EmailIcon,
  PhoneIcon,
  LaptopIcon,
  MacIcon,
  QQIcon,
  WeChatIcon,
  LinkIcon,
  UserIcon,
  PadIcon,
  LightningIcon,
  WrenchIcon,
  EarthIcon,
  SunIcon,
  MoonIcon,
  NCMIcon,
  WaveIcon,
  PlusIcon,
  BrainIcon,
  HomeIcon,
  PaintIcon,
  PCIcon,
  WordIcon,
  PowerPointIcon,
  ExcelIcon,
  PDFIcon,
  FolderIcon,
  DownloadIcon,
  NotionIcon,
  PlayIcon,
  PauseIcon,
  FullscreenIcon,
  ForwardIcon,
  RewindIcon,
  MutedIcon,
  SoundIcon,
  SpinnerIcon
};
