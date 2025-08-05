'use client'

import { CrossDeviceSyncTest } from '@/components/CrossDeviceSyncTest'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TestSyncPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cross-Device Sync Testing
          </h1>
          <p className="text-gray-600">
            Comprehensive testing tool to verify that emotion records sync properly across different devices
          </p>
        </div>

        {/* Test Component */}
        <CrossDeviceSyncTest />

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-3">What This Tests</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• User authentication with credentials</li>
              <li>• Creation of quick emotion checks</li>
              <li>• Creation of conversation emotion records</li>
              <li>• Data retrieval from split tables</li>
              <li>• Cross-device data synchronization</li>
              <li>• Row Level Security (RLS) policies</li>
            </ul>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-3">Testing Steps</h2>
            <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
              <li>Enter valid user credentials</li>
              <li>Click "Run Full Sync Test"</li>
              <li>Verify all three tests pass</li>
              <li>Check that data appears in the app</li>
              <li>Sign in from another device/browser</li>
              <li>Confirm the same data is visible</li>
            </ol>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-lg font-semibold text-yellow-800 mb-3">Troubleshooting</h2>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>Authentication fails:</strong> Check if user exists and credentials are correct</p>
            <p><strong>Data creation fails:</strong> Verify database tables exist and RLS policies are set up</p>
            <p><strong>Sync verification fails:</strong> Check if user_id matches and data was actually saved</p>
            <p><strong>Cross-device issues:</strong> Ensure both devices use the same user account</p>
          </div>
        </div>
      </div>
    </div>
  )
}