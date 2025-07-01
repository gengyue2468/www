import Head from "next/head";
import { Spotlight } from "./ui/spotlight";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { Laptop2Icon, MoonIcon, SunIcon } from "lucide-react";

export default function Layout({ title, children }) {
    const { theme, setTheme, resolvedTheme } = useTheme();

    return (
        <div className="w-screen min-h-screen">
            <Head>
                <title>{title}</title>
            </Head>
            <div className="max-w-xl mx-auto px-6 py-48 *:text-balance relative w-full">
                <Button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} variant="outline" className="absolute bg-transparent backdrop-blur-2xl rounded-full size-10 right-6 top-48 text-foreground border-foreground/25! border">
                    {theme === "system" && <Laptop2Icon size="6" />}
                    {theme === "light" && <SunIcon size="6" />}
                    {theme === "dark" && <MoonIcon size="6" />}
                </Button>
                <main>{children}</main>
            </div>

            <Spotlight
                className='bg-neutral-300 dark:bg-neutral-700 blur-2xl'
                size={96}
                springOptions={{
                    bounce: 0.3,
                    duration: 0.1,
                }}
            />
        </div>
    )
}