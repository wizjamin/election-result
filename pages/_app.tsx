import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Link from 'next/link';
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient()
const links = [
    {
        name: '',
        label: 'Page 1'
    },
    {
        name: 'page-two',
        label: 'Page 2'
    },
    {
        name: 'page-three',
        label: 'Page 3'
    }
];
export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const [path, setPath] = useState('')

    useEffect(() => {
        setPath(location.pathname || '/')
        router.events.on('routeChangeComplete', (evts)=> {
            setPath(evts)
        })
        links.filter(link => `/${link.name}` !== location.pathname).forEach(link => router.prefetch(`/${link.name}`))
    }, [])
    return (
        <QueryClientProvider client={queryClient}>
            <div>
                <h1 style={{textAlign: 'center', padding: '10px'}}>2011 Election Results</h1>
                <div style={{ display: 'flex', gap: '10px', padding: '30px 20px', justifyContent: 'center', backgroundColor: 'white' }}>
                    {links.map(link => <Link key={link.name} style={{
                        transition: 'all linear 300ms',
                        padding: '10px',
                        borderRadius: '3px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        outline: 'none',
                        ...(path === `/${link.name}` ? {
                            border: 'none',
                            color: 'white',
                            backgroundColor: 'green',
                        } : {
                            backgroundColor: 'white',
                            color: 'green',
                            borderColor: 'green',
                            borderWidth: '2px',
                            borderStyle: 'solid',
                        }),

                        cursor: 'pointer',
                    }} href={`/${link.name}`}>{link.label}</Link>)}
                </div>
                <Component {...pageProps} />
            </div>
        </QueryClientProvider>
  )
}
