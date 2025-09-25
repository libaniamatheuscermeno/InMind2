export const metadata = {
  title: 'InMind - AI Neurological Diagnostic Assistant',
  description: 'AI-powered tool for neurological symptom analysis',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  )
}
