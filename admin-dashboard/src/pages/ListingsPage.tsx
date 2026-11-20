import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Building2,
  MapPin,
  Eye,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { adminService } from '../services/api';
import { PropertyRequest } from '../types';
import { ModuleBadge } from '../components/common/ModuleBadge';

export const ListingsPage: React.FC = () => {
  const [listings, setListings] = useState<PropertyRequest[]>([]);
  const [search, setSearch] = useState('');

  const loadListings = async () => {
    const all = await adminService.getRequests();
    setListings(all.filter((r) => r.status === 'published'));
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleUnpublish = async (id: string) => {
    if (window.confirm('Are you sure you want to unpublish this listing from live app?')) {
      await adminService.updateRequest(
        id,
        { status: 'in_review' },
        'Unpublished from live portal by admin'
      );
      loadListings();
    }
  };

  const filtered = listings.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.locality.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Live Verified Listings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Properties currently searchable and visible to users in the mobile app.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>{listings.length} Active Listings</span>
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search live listings..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="relative h-48 bg-slate-900">
              {item.photos?.[0] ? (
                <img
                  src={item.photos[0]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                  No preview photo
                </div>
              )}
              <div className="absolute top-3 left-3">
                <ModuleBadge module={item.module} />
              </div>
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified</span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.locality}, {item.city}</span>
                </div>
                <p className="text-base font-extrabold text-emerald-700 mt-3">
                  {item.priceDisplay}
                </p>
                <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span>Owner: <strong>{item.ownerName}</strong></span>
                  <span className="font-mono text-slate-500">{item.ownerPhone}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <button
                  onClick={() => handleUnpublish(item.id)}
                  className="text-rose-600 hover:text-rose-700"
                >
                  Unpublish
                </button>
                <Link
                  to={`/requests/${item.id}`}
                  className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
