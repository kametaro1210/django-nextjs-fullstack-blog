"use client"

// エラー画面 (app/error.tsx)
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div>
            <div className="text-center text-5xl font-bold mb-3">500</div>
            <div className="text-center text-xl font-bold">Server Error</div>
        </div>
    )
}