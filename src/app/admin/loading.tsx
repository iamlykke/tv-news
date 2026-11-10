/** Shown instantly on navigation inside the admin while the server renders the page. */
export default function AdminLoading() {
    return (
        <div className="flex flex-col gap-6 animate-pulse">
            <div className="h-8 w-56 rounded-lg bg-base-300" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-video rounded-xl bg-base-300" />
                ))}
            </div>
        </div>
    );
}
