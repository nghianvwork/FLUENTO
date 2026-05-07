import { useState, useEffect } from 'react';
import { Trash2, Languages, Copy, Check } from 'lucide-react';

interface Translation {
  id: number;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestampSeconds: number;
  createdAt: string;
}

interface ContentTranslationProps {
  contentId: number;
}

export default function ContentTranslation({ contentId }: ContentTranslationProps) {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('vi');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    loadTranslations();
  }, [contentId]);

  const loadTranslations = async () => {
    try {
      const response = await fetch(`/api/content/${contentId}/translations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setTranslations(data.data);
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  };

  const handleTranslate = async () => {
    if (!selectedText.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/content/${contentId}/translations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          originalText: selectedText,
          sourceLanguage: 'en',
          targetLanguage,
          timestampSeconds: null
        })
      });
      const data = await response.json();
      if (data.success) {
        setTranslations([data.data, ...translations]);
        setSelectedText('');
      }
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/content/translations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTranslations(translations.filter(t => t.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Languages className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Translate Text</h3>
        </div>

        <textarea
          value={selectedText}
          onChange={(e) => setSelectedText(e.target.value)}
          placeholder="Enter text to translate..."
          className="w-full p-3 border rounded-lg mb-3 min-h-[100px]"
        />

        <div className="flex gap-3">
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="vi">Vietnamese</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>

          <button
            onClick={handleTranslate}
            disabled={loading || !selectedText.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Translating...' : 'Translate'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {translations.map((translation) => (
          <div key={translation.id} className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-2">Original (English)</div>
                <p className="text-gray-800">{translation.originalText}</p>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-2">
                  Translation ({translation.targetLanguage.toUpperCase()})
                </div>
                <p className="text-gray-800">{translation.translatedText}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">
                {new Date(translation.createdAt).toLocaleString()}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(translation.translatedText, translation.id)}
                  className="p-2 text-gray-600 hover:text-blue-600"
                  title="Copy translation"
                >
                  {copiedId === translation.id ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(translation.id)}
                  className="p-2 text-gray-600 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
