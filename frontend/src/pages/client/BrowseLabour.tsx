import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Search, Filter, MapPin, Phone } from 'lucide-react';
import { Labour, Category } from '../../types';
import { formatCurrency, renderStars, truncateText } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import api from '../../utils/api';

const BrowseLabour: React.FC = () => {
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    search: '',
  });

  // Fetch categories
  const { data: categoriesData } = useQuery('categories', async () => {
    const response = await api.get('/categories');
    return response.data.categories as Category[];
  });

  // Fetch labour profiles
  const { data: labourData, isLoading } = useQuery(
    ['labour-profiles', filters],
    async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.city) params.append('city', filters.city);
      
      const response = await api.get(`/labour?${params.toString()}`);
      return response.data;
    }
  );

  const labours = labourData?.labours || [];

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredLabours = labours.filter((labour: Labour) => {
    if (filters.search && !labour.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (isLoading) {
    return <Loading text="Loading workers..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Browse Workers</h1>
        <p className="text-gray-600 mt-2">
          Find skilled workers in your area for your projects.
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name..."
                className="form-input pl-10"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="form-select"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categoriesData?.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* City Filter */}
            <select
              className="form-select"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            >
              <option value="">All Cities</option>
              <option value="Hubli">Hubli</option>
              <option value="Dharwad">Dharwad</option>
            </select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => setFilters({ category: '', city: '', search: '' })}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-gray-600 mb-4">
        Found {filteredLabours.length} worker{filteredLabours.length !== 1 ? 's' : ''}
      </div>

      {/* Worker Cards */}
      {filteredLabours.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabours.map((labour: Labour) => (
            <div key={labour.id} className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{labour.name}</h3>
                    <div className="flex items-center mt-1">
                      <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">{labour.city}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">
                      {formatCurrency(labour.hourlyRate)}
                    </p>
                    <p className="text-xs text-gray-500">per hour</p>
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {labour.categories.map((category) => (
                      <span
                        key={category._id}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">
                      {renderStars(labour.averageRating)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {labour.averageRating.toFixed(1)} ({labour.ratingCount} reviews)
                    </span>
                  </div>
                </div>

                {/* Recent Comments */}
                {labour.recentComments && labour.recentComments.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Reviews:</h4>
                    <div className="space-y-2">
                      {labour.recentComments.slice(0, 2).map((comment, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                          <div className="flex items-center mb-1">
                            <span className="text-yellow-500 mr-1">
                              {'★'.repeat(comment.rating)}
                            </span>
                            <span className="text-gray-500">{comment.clientName}</span>
                          </div>
                          <p className="text-gray-700">
                            {truncateText(comment.comment, 80)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button variant="primary" size="sm" className="flex-1">
                    Hire Worker
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No workers found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters to find more workers.
          </p>
          <Button
            variant="outline"
            onClick={() => setFilters({ category: '', city: '', search: '' })}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default BrowseLabour;