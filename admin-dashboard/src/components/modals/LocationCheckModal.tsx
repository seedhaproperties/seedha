import React, { useState } from 'react';
import { X, MapPin, CheckCircle2, AlertTriangle, Navigation } from 'lucide-react';
import { PropertyRequest } from '../../types';
import { adminService } from '../../services/api';

interface LocationCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PropertyRequest;
  onLocationChecked: () => void;
}

export const LocationCheckModal: React.FC<LocationCheckModalProps> = ({
  isOpen,
  onClose,
  request,
  onLocationChecked,
}) => {
  const serviceAreas = adminService.getServiceAreas();
  const [selectedHub, setSelectedHub] = useState(
    serviceAreas[0]?.hubName || serviceAreas[0]?.name || 'Hyderabad Financial District Hub'
  );
  const [distanceKm, setDistanceKm] = useState<number>(3.8);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentArea =
    serviceAreas.find((s) => (s.hubName || s.name) === selectedHub) || serviceAreas[0];
  const maxRadius = currentArea?.serviceRadiusKm || 15;
  const isWithinRadius = distanceKm <= maxRadius;

  const handleConfirm = async (matched: boolean) => {
    setIsSubmitting(true);
    try {
      if (matched) {
        await adminService.updateRequest(
          request.id,
          {
            locationCheck: {
              status: 'matched',
              inServiceRadius: true,
              nearestHub: selectedHub,
              distanceKm,
              latLng: request.locationCheck?.latLng || '17.4485, 78.3758',
              checkedAt: new Date().toISOString(),
              checkedBy: 'Admin Ops',
            },
            status: 'in_review',
          },
          `Location verified within ${selectedHub} operational radius (${distanceKm} km ≤ ${maxRadius} km)`
        );
      } else {
        await adminService.updateRequest(
          request.id,
          {
            locationCheck: {
              status: 'mismatched',
              inServiceRadius: false,
              nearestHub: selectedHub,
              distanceKm,
              latLng: request.locationCheck?.latLng || '17.4485, 78.3758',
              checkedAt: new Date().toISOString(),
              checkedBy: 'Admin Ops',
            },
            status: 'rejected',
            rejectionReason: `Property located at ${request.locality} is ${distanceKm} km from nearest hub (${selectedHub}), exceeding our active service radius of ${maxRadius} km.`,
          },
          `Location mismatch: ${distanceKm} km exceeds operational limit of ${maxRadius} km`
        );
      }
      onLocationChecked();
      onClose();
    } catch (e) {
      alert('Failed to update location check: ' + (e as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Service Radius Check</h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">{request.locality}, {request.city}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold mb-1">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Target Property Location</span>
            </div>
            <p className="text-sm font-bold text-slate-800">{request.locality}</p>
            <p className="text-xs text-slate-500">{request.address || `${request.locality}, ${request.city}`}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Select Nearest Operations Hub
            </label>
            <select
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white font-medium"
            >
              {serviceAreas.map((s) => {
                const hub = s.hubName || s.name;
                const radius = s.serviceRadiusKm || 15;
                return (
                  <option key={s.id} value={hub}>
                    {hub} ({s.zone || 'Hyderabad Central'} - Max {radius} km radius)
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Calculated Driving Distance (km)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="100"
                value={distanceKm}
                onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
                className="w-32 text-sm p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-bold"
              />
              <span className="text-xs text-slate-500">
                Max Allowed Radius: <strong className="text-slate-800">{maxRadius} km</strong>
              </span>
            </div>
          </div>

          {/* Result Alert */}
          {isWithinRadius ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-800">Location Match (Within Active Radius)</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  The property is within the {maxRadius} km service boundary of {selectedHub}. You can proceed to contact the owner and assign the field team.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-800">Location Mismatch (Outside Radius)</p>
                <p className="text-xs text-rose-700 mt-0.5">
                  The property is {distanceKm} km away, which exceeds the {maxRadius} km limit for this hub. This request should be rejected.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            {!isWithinRadius && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleConfirm(false)}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm"
              >
                Mismatch & Reject
              </button>
            )}
            {isWithinRadius && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleConfirm(true)}
                className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
              >
                Match: Approve for Contact
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
