import { useEffect, useState } from 'react';
import './App.css';
import { Display, IDisplay } from './Display/Index'; // Make sure your types are imported correctly
import logo from './assets/logo_text_light.svg';
import { DeviceManager } from './DeviceManager';
import { socket } from './shared/config';

const App = (): JSX.Element => {
  const [iotData, setIotData] = useState<IDisplay | null>(null);
  const timeoutDuration = 30000; // 30 seconds timeout for data inactivity

  useEffect(() => {
    const timeout = setTimeout(() => {
      // If no data is received for 30 seconds, set iotData to null
      setIotData(null);
    }, timeoutDuration);

    socket.on('iot-data', (recIotData) => {
      const data = typeof recIotData === 'string' ? JSON.parse(recIotData) : recIotData;
      clearTimeout(timeout); // Clear the existing timeout
      setIotData(data); // Update the state with the new data
    });

    return () => {
      clearTimeout(timeout); // Clean up the timeout on component unmount
      socket.off('iot-data'); // Remove the socket listener
    };
  }, []);

  return (
    <div className="App">
      <DeviceManager />
      <img src={logo} alt="Logo" className="logo" />
      <Display temperature={Number(iotData?.temperature)} humidity={Number(iotData?.humidity)} />
    </div>
  );
};

export default App;
