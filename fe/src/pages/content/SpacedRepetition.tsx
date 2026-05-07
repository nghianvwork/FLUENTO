import { useState, useEffect } from 'react';
import { srsApi } from '../../services/apiServices';
import toast from 'react-hot-toast';

interface ReviewItem {
  id: number;
  vocabularyId: number;
  word: string;
  definition: string;
  exampleSentence: string;
  source: string;
  masteryLevel: number;
  nextReviewAt: string;
}

export default function SpacedRepetition() {
  const [dueItems, setDueItems] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDueReviews();
  }, []);

  const loadDueReviews = async () => {
    try {
      const res = await srsApi.getDueReviews();
      setDueItems(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (quality: number) => {
    if (dueItems.length === 0) return;
    const currentItem = dueItems[currentIndex];
    
    try {
      await srsApi.submitReview({ progressId: currentItem.id, quality });
      
      if (currentIndex < dueItems.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setShowAnswer(false);
      } else {
        // Finished all
        toast.success('You have completed all reviews for now!');
        setDueItems([]);
        setCurrentIndex(0);
        setShowAnswer(false);
      }
    } catch (err) {
      toast.error('Error submitting review');
    }
  };

  if (loading) return <div className="text-center text-muted" style={{ padding: 100 }}>Loading reviews...</div>;

  if (dueItems.length === 0) {
    return (
      <div className="card text-center" style={{ padding: 60, marginTop: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <div className="page-title">You're all caught up!</div>
        <div className="text-muted mt-8">No vocabulary words are due for review right now.</div>
      </div>
    );
  }

  const currentItem = dueItems[currentIndex];

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <div className="page-title">Spaced Repetition Review</div>
          <div className="page-subtitle">Master your vocabulary with SM-2 algorithm</div>
        </div>
        <div className="pill pill-orange" style={{ fontSize: 16 }}>
          {currentIndex + 1} / {dueItems.length}
        </div>
      </div>

      <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 24, color: 'var(--primary)' }}>
          {currentItem.word}
        </div>
        
        {!showAnswer ? (
          <button className="btn btn-primary" onClick={() => setShowAnswer(true)} style={{ width: '100%' }}>
            Show Answer
          </button>
        ) : (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ fontSize: 18, marginBottom: 16 }}>
              {currentItem.definition}
            </div>
            {currentItem.exampleSentence && (
              <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: 24 }}>
                "{currentItem.exampleSentence}"
              </div>
            )}
            
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, marginTop: 24 }}>
              <div className="text-sm text-muted" style={{ marginBottom: 16 }}>How well did you know this?</div>
              <div className="flex gap-12 justify-center">
                <button className="btn btn-secondary" onClick={() => submitReview(1)} style={{ background: 'var(--bg-tertiary)', color: 'var(--accent-red)' }}>
                  Again (1)
                </button>
                <button className="btn btn-secondary" onClick={() => submitReview(2)} style={{ background: 'var(--bg-tertiary)', color: 'var(--accent-orange)' }}>
                  Hard (2)
                </button>
                <button className="btn btn-secondary" onClick={() => submitReview(4)} style={{ background: 'var(--bg-tertiary)', color: 'var(--accent-green)' }}>
                  Good (4)
                </button>
                <button className="btn btn-secondary" onClick={() => submitReview(5)} style={{ background: 'var(--bg-tertiary)', color: 'var(--primary)' }}>
                  Easy (5)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
