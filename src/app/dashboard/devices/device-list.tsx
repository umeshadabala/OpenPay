'use client';

import React, { useState } from 'react';
import { Smartphone, Trash2, Clock, CheckCircle2 } from 'lucide-react';

interface Device {
  id: string;
  deviceId: string;
  deviceName: string;
  status: string;
  lastSyncAt: string | null;
  createdAt: string;
}

interface DeviceListProps {
  initialDevices: Device[];
}

export default function DeviceList({ initialDevices }: DeviceListProps) {
  const [devicesList, setDevicesList] = useState<Device[]>(initialDevices);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUnpair = async (id: string) => {
    if (!confirm('Are you sure you want to unpair this device? It will stop syncing SMS notification logs.')) {
      return;
    }

    setLoadingId(id);

    try {
      const res = await fetch(`/api/devices?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to unpair device');
      }

      setDevicesList(devicesList.filter(d => d.id !== id));
    } catch (error) {
      alert('Failed to unpair device. Please try again.');
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white mb-4">Paired Devices</h3>

      {devicesList.length === 0 ? (
        <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-8 text-center">
          <p className="text-slate-500 text-sm">No devices connected. Use the pairing instructions to link your Android Companion Agent.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devicesList.map((device) => (
            <div
              key={device.id}
              className="p-5 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{device.deviceName}</h4>
                  <p className="text-slate-500 text-xs font-mono">{device.deviceId}</p>
                  
                  {/* Status Indicator */}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-450"></span>
                      {device.status.toUpperCase()}
                    </span>
                    
                    {device.lastSyncAt && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock size={10} />
                        Sync:{' '}
                        {new Date(device.lastSyncAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleUnpair(device.id)}
                disabled={loadingId === device.id}
                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Unpair Device"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
