import React, { useState, useEffect } from 'react';
import api from '../config/api';

// Helper for consistent ID handling
const normalizeId = (id: any): string => {
  if (!id) return '';
  return String(id).trim();
};

// Force format to match exact server format
const formatIdForServer = (id: any): string => {
  if (!id) return '';
  return normalizeId(id);
};

interface Frame {
  _id: string;
  name: string;
  overlayUrl: string;
  sizesWithPrices: any[];
}

const FrameDebug: React.FC = () => {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFrameId, setSelectedFrameId] = useState<string>('');
  const [frameDetails, setFrameDetails] = useState<any>(null);
  const [frameCheckResult, setFrameCheckResult] = useState<string>('');
  
  // Get all frames for comparison
  const fetchAllFrames = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/frames');
      if (response.status === 200) {
        const data = response.data;
        console.log('Raw frame data:', data);
        
        const formattedFrames = data.map((frame: any) => ({
          ...frame,
          _id: normalizeId(frame._id)
        }));
        
        setFrames(formattedFrames);
        
        // Debug frame IDs
        console.log('Frame IDs from API:');
        formattedFrames.forEach((frame: Frame, index: number) => {
          console.log(`Frame ${index}: ID=${frame._id}, type=${typeof frame._id}, length=${frame._id.length}`);
        });
      } else {
        setError('Failed to fetch frames');
      }
    } catch (err) {
      console.error('Error fetching frames:', err);
      setError('Error fetching frames');
    } finally {
      setLoading(false);
    }
  };
  
  // Check if a specific frame ID exists directly
  const checkFrameById = async () => {
    if (!selectedFrameId.trim()) {
      setFrameCheckResult('Please enter a frame ID');
      return;
    }
    
    setFrameCheckResult('Checking...');
    setFrameDetails(null);
    
    try {
      const formattedId = formatIdForServer(selectedFrameId);
      console.log(`Checking frame ID: "${formattedId}"`);
      
      // Check if it exists in our cached list
      const existsInList = frames.some(frame => normalizeId(frame._id) === normalizeId(formattedId));
      console.log(`Exists in cached list: ${existsInList}`);
      
      // Try direct API request
      try {
        const response = await api.get(`/api/frames/${formattedId}`);
        
        if (response.status === 200 && response.data) {
          setFrameDetails(response.data);
          setFrameCheckResult(`✅ Frame found! ID: ${response.data._id}`);
          console.log('Frame details:', response.data);
          return;
        } 
        
        setFrameCheckResult(`❌ API request succeeded but no frame data returned`);
      } catch (apiErr: any) {
        console.error('API error:', apiErr);
        
        if (apiErr.response?.status === 404) {
          setFrameCheckResult(`❌ Frame not found (404) for ID: "${formattedId}"`);
        } else {
          setFrameCheckResult(`❌ Error: ${apiErr.message}`);
        }
        
        // If not found directly, check which similar IDs exist
        const similarFrames = frames.filter(frame => {
          const normalizedFrameId = normalizeId(frame._id);
          const normalizedInputId = normalizeId(formattedId);
          
          // Check for partial matches or similar IDs
          return normalizedFrameId.includes(normalizedInputId) || 
                 normalizedInputId.includes(normalizedFrameId);
        });
        
        if (similarFrames.length > 0) {
          console.log('Similar frames found:', similarFrames);
          setFrameCheckResult(`❌ Frame not found, but found ${similarFrames.length} similar IDs:`);
          setFrameDetails(similarFrames);
        }
      }
    } catch (err) {
      console.error('Error checking frame:', err);
      setFrameCheckResult(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };
  
  useEffect(() => {
    fetchAllFrames();
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Frame Debug Tool</h1>
      <p className="mb-8 text-gray-600">Use this tool to debug frame ID issues</p>
      
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">All Available Frames ({frames.length})</h2>
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-4 border-blue-500 border-t-transparent mr-3"></div>
            <span>Loading frames...</span>
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-80">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">ID Length</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {frames.map((frame, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-4 py-2 font-mono text-xs truncate max-w-xs">{frame._id}</td>
                    <td className="px-4 py-2">{frame.name}</td>
                    <td className="px-4 py-2">{frame._id.length}</td>
                    <td className="px-4 py-2">
                      <button 
                        onClick={() => setSelectedFrameId(frame._id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Check
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Check Frame ID</h2>
        <div className="flex">
          <input
            type="text"
            value={selectedFrameId}
            onChange={(e) => setSelectedFrameId(e.target.value)}
            placeholder="Enter frame ID to check"
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2 font-mono"
          />
          <button
            onClick={checkFrameById}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Check ID
          </button>
        </div>
        
        {frameCheckResult && (
          <div className="mt-4">
            <div className="font-medium">{frameCheckResult}</div>
            
            {frameDetails && (
              <div className="mt-4 bg-gray-100 p-4 rounded-lg overflow-auto max-h-80">
                {Array.isArray(frameDetails) ? (
                  <div>
                    <h3 className="font-medium mb-2">Similar Frames:</h3>
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="px-4 py-2 text-left">ID</th>
                          <th className="px-4 py-2 text-left">Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {frameDetails.map((frame, index) => (
                          <tr key={index} className="border-b border-gray-200">
                            <td className="px-4 py-2 font-mono text-xs">{frame._id}</td>
                            <td className="px-4 py-2">{frame.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <pre className="text-xs font-mono">{JSON.stringify(frameDetails, null, 2)}</pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">ID Format Problems</h2>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Common MongoDB ID Issues:</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>MongoDB ObjectIDs are 24 character hex strings</li>
            <li>IDs might get truncated when passing between components</li>
            <li>Type inconsistencies (string vs object)</li>
            <li>Different string representations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FrameDebug; 