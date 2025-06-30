import Head from "next/head";

export default function Layout({ title, children }) {
    return (
        <div>
            <Head>
                <title>{title}</title>
            </Head>
            <div>
                <main className="max-w-xl mx-auto px-6 py-24 *:text-balance">{children}</main>
            </div>
        </div>
    )
}