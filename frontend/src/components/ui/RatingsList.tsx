import React from 'react';
import { useQuery } from 'react-query';
import { MessageSquare, User } from 'lucide-react';
import StarRating from './StarRating';
import Loading from './Loading';
import { formatDate } from '../../utils/helpers';
import api from '../../utils/api';

interface Rating {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  client: {
    name: string;
  };
  job: {
    title: string;
  };
}

interface RatingsListProps {
  labourId: string;
  limit?: number;
  showJobTitle?: boolean;
}

const RatingsList: React.FC<RatingsListProps> = ({
  labourId,
  limit = 10,
  showJobTitle = false,
}) => {
  const { data, isLoading, error } = useQuery(
    ['ratings', labourId, limit],
    async () => {
      const response = await api.get(`/labour/${labourId}/ratings`, {
        params: { limit },
      });
      return response.data;
    }
  );

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Failed to load ratings
      </div>
    );
  }

  const ratings: Rating[] = data?.ratings || [];

  if (ratings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No ratings yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ratings.map((rating) => (
        <div
          key={rating._id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{rating.client.name}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(rating.createdAt)}
                </p>
              </div>
            </div>
            <StarRating rating={rating.rating} readonly size="sm" />
          </div>

          {showJobTitle && (
            <p className="text-sm text-gray-600 mb-2">
              Job: <span className="font-medium">{rating.job.title}</span>
            </p>
          )}

          {rating.comment && (
            <p className="text-gray-700 text-sm mt-2 leading-relaxed">
              {rating.comment}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default RatingsList;
