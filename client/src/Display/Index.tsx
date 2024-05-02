import { FC } from 'react';
import './Display.css';

export interface IDisplay {
    temperature: number;
    humidity: number;
}

export const Display: FC<IDisplay | null> = ({ temperature, humidity }): JSX.Element => {
    return (
        <div className="Display">
            {(temperature !== undefined && humidity !== undefined) ? (
                <div className="info">
                    <span className="indicator">{temperature.toFixed(1)}&deg;C</span>
                    <span className="indicator">{humidity.toFixed(1)}%</span>
                </div>
            ) : (
                <span className="indicator">No Sensor Connected</span>
            )}
        </div>
    );
};
