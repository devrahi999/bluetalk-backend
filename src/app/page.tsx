export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d1117] text-white font-sans p-6">
      <div className="max-w-xl w-full border border-gray-800 rounded-2xl p-8 bg-[#161b22] shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">BlueTalk API</h1>
            <p className="text-sm text-gray-400">Serverless Backend System</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-[#0d1117] border border-gray-800">
            <span className="text-gray-400 font-medium">System Status</span>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-green-400 font-semibold text-sm">Online & Operational</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-[#0d1117] border border-gray-800">
            <span className="text-gray-400 font-medium">Environment</span>
            <span className="text-gray-200 font-mono text-sm px-2 py-1 bg-gray-800 rounded">Production</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-[#0d1117] border border-gray-800">
            <span className="text-gray-400 font-medium">FCM Integaration</span>
            <span className="text-blue-400 font-mono text-sm px-2 py-1 bg-blue-900/30 rounded border border-blue-800/50">Active</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
            This server processes push notifications and backend events for the BlueTalk Flutter application. 
            Unauthorized access is strictly prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
