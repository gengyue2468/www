import classNames from "classnames";
import Post from "./Post";

export default function AllPosts({ posts, filterBy, searchValue, type }) {
  return (
    <div className="my-8">
      <h1
        className={classNames(
          "mb-4 text-balance",
          type === "search" ? "text-2xl" : "text-3xl"
        )}
      >
        {type === "display" && "所有随想"}
        {type === "search" &&
          searchValue &&
          posts.length !== 0 &&
          `按照${filterBy}筛选出的包含 "${searchValue}" 的结果`}
      </h1>
      {type === "search" && searchValue == "" && (
        <div className="mt-8 mb-4 flex flex-col items-center rounded-3xl bg-neutral-100 dark:bg-neutral-900 px-4 py-8 justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-24"
            viewBox="0 0 32 32"
          >
            <g fill="none">
              <path
                fill="#F4F4F4"
                d="M15.5 28C21.851 28 27 22.851 27 16.5S21.851 5 15.5 5S4 10.149 4 16.5S9.149 28 15.5 28"
              />
              <path
                fill="#F9C23C"
                d="M25.766 7.733c.377.171.795.267 1.234.267c1.65 0 3-1.35 3-3s-1.35-3-3-3s-3 1.35-3 3c0 .44.096.857.267 1.234A13.45 13.45 0 0 0 15.5 3C8.044 3 2 9.044 2 16.5S8.044 30 15.5 30S29 23.956 29 16.5a13.45 13.45 0 0 0-3.234-8.767M25.39 4.99a1.609 1.609 0 1 1 3.22 0a1.609 1.609 0 1 1-3.22 0M26 16.5C26 22.299 21.299 27 15.5 27S5 22.299 5 16.5S9.701 6 15.5 6S26 10.701 26 16.5"
              />
              <path
                fill="#FFB02E"
                d="m25.35 8l-1.36-1.36l1.36-1.36c.37-.37.98-.37 1.36 0c.37.37.37.98 0 1.36z"
              />
              <path
                fill="#9B9B9B"
                d="M13.223 17.724L11.41 20.21c-.18.24.12.54.37.37l2.494-1.82l.936 5.99c.05.33.53.33.58 0l1.076-6.884l6.884-1.076c.33-.05.33-.53 0-.58l-5.99-.937l1.82-2.493c.18-.24-.12-.54-.37-.37l-2.486 1.813l-.934-5.973c-.05-.33-.53-.33-.58 0l-1.076 6.884L7.25 16.21c-.33.05-.33.53 0 .58z"
              />
              <path
                fill="#9B9B9B"
                d="m17.338 15l3.601 6.327c.224.398-.214.836-.613.612L14 18.334z"
              />
              <path
                fill="#E5336D"
                d="m13.676 18l-3.616-6.328a.448.448 0 0 1 .611-.611L17 14.67z"
              />
              <path
                fill="#D3D3D3"
                d="M15.5 19a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5"
              />
            </g>
          </svg>

          <h1 className="font-extrabold text-2xl mb-4">键入以搜索</h1>
          <p className="font-bold text-lg opacity-50">
            现在开始，按条件筛选随想
          </p>
        </div>
      )}
      {type === "display" && (
        <Post
          posts={posts}
          filterBy={null}
          searchValue={searchValue}
          type={type}
        />
      )}
      {type === "search" && searchValue != "" && (
        <Post
          posts={posts}
          filterBy={filterBy}
          searchValue={searchValue}
          type={type}
        />
      )}

      {type == "search" && searchValue != "" && posts.length == 0 && (
        <div className="mt-8 mb-4 flex flex-col items-center rounded-3xl bg-neutral-100 dark:bg-neutral-900 px-4 py-8 justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-24"
            viewBox="0 0 32 32"
          >
            <g fill="none">
              <path
                fill="#00D26A"
                d="M21.166 26.579V26h-2.737A3.43 3.43 0 0 0 15 29.43v.193c0 .212.172.385.385.385h2.351a3.43 3.43 0 0 0 3.43-3.43"
              />
              <path
                fill="#7D4533"
                d="M2 19.098L30 7.902v5l-15.495 6.079H30v5.117h-7.43c-.153 0-.207.203-.074.28l1.727.997c1.31.756.773 2.758-.74 2.758c-.259 0-.514-.069-.738-.198l-5.486-3.168a5 5 0 0 0-2.5-.67H2z"
              />
              <path
                fill="#F3AD61"
                fill-rule="evenodd"
                d="M21.753 2.849a.5.5 0 0 0 .118.697c.866.616 1.85 1.888 2.645 3.554C22.791 5.16 19.596 3 14.344 3a.5.5 0 1 0 0 1c2.422 0 4.363.485 5.895 1.186a8.5 8.5 0 0 0-1.734-.177h-5.01c-2.11 0-4.041.77-5.527 2.044a9.6 9.6 0 0 1 2.13-2.115a.5.5 0 1 0-.58-.814c-2.114 1.508-4.531 4.556-4.531 9.17q0 .06.014.118v.093A8.495 8.495 0 0 0 13.494 22h5.01a8.495 8.495 0 0 0 8.487-8.858c-.038-2.217-.626-4.4-1.454-6.216c-.85-1.868-1.98-3.408-3.087-4.195a.5.5 0 0 0-.698.118"
                clip-rule="evenodd"
              />
              <path
                fill="#B97028"
                fill-rule="evenodd"
                d="M12.997 5.818a4.854 4.854 0 1 0 0 9.71h1.587c2.1-.192 4.377-.836 6.211-2.848a.5.5 0 1 1 .739.674a9.25 9.25 0 0 1-2.945 2.173h.414a4.854 4.854 0 1 0 0-9.709z"
                clip-rule="evenodd"
              />
              <path
                fill="#7D4533"
                fill-rule="evenodd"
                d="M14.584 15.527h-1.727c-2.241 0-4.117-1.61-4.596-3.769c.402-1.556 1.78-2.703 3.418-2.703h8.642c1.638 0 3.016 1.147 3.418 2.703c-.479 2.159-2.355 3.77-4.596 3.77h-.554a9.25 9.25 0 0 0 2.945-2.174a.5.5 0 1 0-.739-.674c-1.834 2.012-4.11 2.656-6.212 2.847"
                clip-rule="evenodd"
              />
            </g>
          </svg>

          <h1 className="font-extrabold text-2xl mb-4">什么都没有</h1>
          <p className="font-bold text-lg opacity-50">
            很抱歉，但是确实什么都没有
          </p>
        </div>
      )}
    </div>
  );
}
