import Link from 'next/link'

export default function NotFound() {
    return (
        <div>
            <h2>404</h2>
            <p>Sorry, we couldn’t find the page you were looking for.</p>
            <Link href="/">Home</Link>
        </div>
    )
}
