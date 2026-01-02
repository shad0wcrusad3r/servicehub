import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { MessageSquare, Send, X } from 'lucide-react';
import StarRating from './StarRating';
import Button from './Button';
import toast from 'react-hot-toast';
import api from '../../utils/api';

interface RatingFormProps {
  jobId: string;
  labourName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RatingForm: React.FC<RatingFormProps> = ({
  jobId,
  labourName,
  onSuccess,
  onCancel,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const submitRatingMutation = useMutation(
    async () => {
      const response = await api.post(`/jobs/${jobId}/rate`, {
        rating,
        comment: comment.trim() || undefined,
      });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Rating submitted successfully!');
        queryClient.invalidateQueries('jobs');
        queryClient.invalidateQueries(['job', jobId]);
        if (onSuccess) onSuccess();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.error || 'Failed to submit rating'
        );
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    submitRatingMutation.mutate();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Rate {labourName}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating
          </label>
          <div className="flex justify-center py-2">
            <StarRating
              rating={rating}
              onChange={setRating}
              size="lg"
            />
          </div>
          {rating > 0 && (
            <p className="text-center text-sm text-gray-600 mt-2">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Review (Optional)
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience working with this worker..."
              maxLength={500}
              rows={4}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            {comment.length}/500
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={rating === 0 || submitRatingMutation.isLoading}
            className="flex-1"
          >
            {submitRatingMutation.isLoading ? (
              'Submitting...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Rating
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RatingForm;
