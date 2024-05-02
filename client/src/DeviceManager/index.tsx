/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, useEffect, useState } from 'react';
import './DeviceManager.css';
import { BASE_URL, socket } from '../shared/config';


export const DeviceManager = (): JSX.Element => {
  const [deviceList, setDeviceList] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${BASE_URL}/devices`)
      .then(response => response.json())
      .then(devices => setDeviceList(devices));

  }, []);

  const pathHandler = (event: ChangeEvent<HTMLSelectElement>) => {
    socket.emit('iot-path', event.target.value);
  };

  return (
    <div className="DeviceManager">
      <select onChange={pathHandler}>
        <option>No PORT Selected</option>
        {deviceList.map((device, index) => (
          <option key={index} value={device.path}>{device.manufacturer || 'Not Connected'}</option>
        ))}
      </select>
    </div>
  );
};
