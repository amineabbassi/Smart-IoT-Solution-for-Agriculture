import React, { useEffect, useState } from 'react';
import { Droplets, Thermometer, Wind, Power } from 'lucide-react';

// ThingSpeak configuration
const CHANNEL_ID = '2810591';
const READ_API_KEY = 'BQE7H26UUD75VYNT';
const WRITE_API_KEY = 'E538BEZV88CBRWJ9';

interface SensorData {
  temp: number;
  humidity: number;
  sprinkler: boolean;
  timestamp: string;
}

function App() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds/last.json?api_key=${READ_API_KEY}`
      );
      const data = await response.json();
      
      setSensorData({
        temp: parseFloat(data.field1),
        humidity: parseFloat(data.field2),
        sprinkler: data.field3 === '1',
        timestamp: data.created_at
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Fetch data every 15 seconds
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const toggleSprinkler = async (state: boolean) => {
    try {
      const response = await fetch(
        `https://api.thingspeak.com/update?api_key=${WRITE_API_KEY}&field4=${state ? '1' : '0'}`
      );
      if (response.ok) {
        console.log('Sprinkler command sent successfully');
      }
    } catch (error) {
      console.error('Error sending command:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Smart Agriculture Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Temperature Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Thermometer className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-700">Temperature</h2>
                  <p className="text-3xl font-bold text-gray-900">
                    {sensorData?.temp.toFixed(1)}°C
                  </p>
                </div>
              </div>
            </div>

            {/* Humidity Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Droplets className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-700">Humidity</h2>
                  <p className="text-3xl font-bold text-gray-900">
                    {sensorData?.humidity.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Sprinkler Control */}
            <div className="md:col-span-2 bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Wind className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700">
                      Sprinkler Control
                    </h2>
                    <p className="text-gray-600">
                      Current Status:{' '}
                      <span className={sensorData?.sprinkler ? 'text-green-500' : 'text-red-500'}>
                        {sensorData?.sprinkler ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSprinkler(!sensorData?.sprinkler)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    sensorData?.sprinkler
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white transition-colors`}
                >
                  <Power className="w-4 h-4" />
                  <span>{sensorData?.sprinkler ? 'Turn Off' : 'Turn On'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-6 text-center text-gray-600">
            Last updated:{' '}
            {sensorData?.timestamp
              ? new Date(sensorData.timestamp).toLocaleString()
              : 'Never'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;