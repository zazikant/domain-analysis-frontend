import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues with the chat interface
const ChatInterface = dynamic(() => import('@/components/ChatInterface'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading chat interface...</p>
      </div>
    </div>
  )
});

export default function Home() {
  return (
    <>
      <Head>
        <title>Domain Analysis Chat - AI-Powered Business Intelligence</title>
        <meta 
          name="description" 
          content="Analyze email domains to get comprehensive business insights and sector classifications powered by AI" 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph / Social Media */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Domain Analysis Chat - AI-Powered Business Intelligence" />
        <meta property="og:description" content="Analyze email domains to get comprehensive business insights and sector classifications powered by AI" />
        <meta property="og:image" content="/og-image.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Domain Analysis Chat" />
        <meta name="twitter:description" content="AI-powered domain analysis for business intelligence" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        <ChatInterface />
      </main>
    </>
  );
}