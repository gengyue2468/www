import { homeStyles } from "./home.config";

export default function NotFound() {
  return (
    <>
      <div className={homeStyles.container}>
        <div className={homeStyles.listContainer}>
          <h1 className={homeStyles.title}>404 - Page Not Found</h1>
          <p className={homeStyles.subtitle}>
            Sorry, the page you are looking for does not exist.
          </p>
        </div>
      </div>
    </>
  );
}
