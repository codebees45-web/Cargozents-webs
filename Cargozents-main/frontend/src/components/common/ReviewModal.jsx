import { useState } from 'react';
import StarRating from './StarRating';

/**
 * Small centered modal for submitting a 1-5 star review + optional
 * comment. `onSubmit(rating, comment)` should return a promise; the
 * modal closes itself on success and surfaces the error message on
 * failure (e.g. "already reviewed" from the backend's unique index).
 */
const ReviewModal = ({ title, subtitle, onSubmit, onClose }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!rating) {
      setError('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(rating, comment);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit review right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-primary/10 bg-background p-6 shadow-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-base font-semibold text-primary">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-[#5B7A70]">{subtitle}</p>}

        <div className="mt-5">
          <StarRating value={rating} onChange={setRating} size="text-2xl" />
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment (optional)"
          maxLength={500}
          rows={3}
          className="mt-4 w-full rounded-lg border border-primary/15 bg-transparent px-3 py-2 text-sm text-primary placeholder:text-[#5B7A70]/60 focus:border-primary/40 focus:outline-none"
        />

        {error && <p className="mt-2 text-xs text-danger">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-primary/15 px-4 py-2 text-xs text-primary/70 transition hover:border-primary/40"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-primary transition hover:shadow-glow disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;