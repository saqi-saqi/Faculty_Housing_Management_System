import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Building, Users, CheckCircle, ArrowRight, LayoutGrid, List } from 'lucide-react';
import api from '../../lib/api.js';
import { useAuthStore } from '../../lib/store.js';
import { PageHeader } from '../../components/shared/PageHeader.js';
import { DataTable, Column } from '../../components/shared/DataTable.js';
import { EmptyState } from '../../components/shared/EmptyState.js';
import { CardSkeleton } from '../../components/shared/LoadingSkeleton.js';
import { House } from '../../types/index.js';

export function VacantHousesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedCapacity, setSelectedCapacity] = useState<string>('all');

  const { data: houses = [], isLoading } = useQuery<House[]>({
    queryKey: ['houses', 'vacant'],
    queryFn: async () => {
      const res = await api.get('/houses/vacant');
      return res.data.data;
    }
  });

  const filteredHouses = houses.filter((h) => {
    if (selectedCapacity === 'all') return true;
    return h.capacity === parseInt(selectedCapacity, 10);
  });

  const handleApply = (houseId: number) => {
    navigate(`/portal/apply/${houseId}`);
  };

  const columns: Column<House>[] = [
    {
      key: 'house_number',
      header: 'House Number',
      sortable: true,
      render: (h) => (
        <div className="font-semibold text-foreground flex items-center gap-2">
          <Building className="w-4 h-4 text-primary" />
          {h.house_number}
        </div>
      )
    },
    {
      key: 'address',
      header: 'Location / Address',
      sortable: true,
      render: (h) => <span className="text-muted-foreground">{h.address}</span>
    },
    {
      key: 'capacity',
      header: 'Capacity',
      sortable: true,
      render: (h) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          {h.capacity} Bedrooms
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Action',
      render: (h) => (
        <button
          onClick={() => handleApply(h.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Apply Now
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Available Campus Quarters"
        description="Browse currently vacant university housing units eligible for faculty allocation."
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border rounded-lg p-0.5 bg-card">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <select
            value={selectedCapacity}
            onChange={(e) => setSelectedCapacity(e.target.value)}
            className="text-xs bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Capacities</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3 Bedrooms</option>
            <option value="4">4 Bedrooms</option>
          </select>
        </div>
      </PageHeader>

      {/* Info notice if resident */}
      {user?.hasHouse && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 flex items-center gap-3 text-xs text-blue-600 dark:text-blue-400">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p>
            You currently have active residential quarters allocated. Applying for a new house will submit a formal Quarters Transfer Request.
          </p>
        </div>
      )}

      {viewMode === 'table' ? (
        <DataTable
          data={filteredHouses}
          columns={columns}
          isLoading={isLoading}
          searchPlaceholder="Search vacant houses by number or address..."
          searchKeys={['house_number', 'address']}
          emptyTitle="No vacant houses"
          emptyDescription="There are currently no vacant houses matching your search."
        />
      ) : (
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : filteredHouses.length === 0 ? (
            <EmptyState
              icon={Building}
              title="No vacant houses available"
              description="All campus quarters are currently allocated. Please check back later or contact the Estate Office."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHouses.map((house) => (
                <div
                  key={house.id}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-foreground flex items-center gap-2">
                        <Building className="w-5 h-5 text-primary" />
                        {house.house_number}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        Vacant
                      </span>
                    </div>

                    <p className="text-sm text-foreground font-medium">{house.address}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {house.description || 'Standard faculty residential quarters with modern amenities and power backup.'}
                    </p>

                    <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground border-t border-border">
                      <span className="flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        {house.capacity} Bedrooms
                      </span>
                      <span>Enclave Sector</span>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-border">
                    <button
                      onClick={() => handleApply(house.id)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
                    >
                      Apply for this House
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
