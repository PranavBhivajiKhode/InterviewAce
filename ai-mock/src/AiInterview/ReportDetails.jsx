import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, Mic, Smile, TrendingUp, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ReportDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { videoUrl, analysisUrl, analysisResults } = location.state || {};

  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fullVideoUrl = videoUrl ? `http://localhost:5000${videoUrl}` : null;

  useEffect(() => {
    // If results were passed directly from the interview page, use them
    if (analysisResults) {
      setAnalysisData(analysisResults);
      setIsLoading(false);
      return;
    }

    // Otherwise, fetch from backend using analysisUrl (JSON file)
    if (analysisUrl) {
      const fullAnalysisUrl = `http://localhost:5000${analysisUrl}`;
      console.log('Fetching analysis from:', fullAnalysisUrl);
      fetch(fullAnalysisUrl)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          return res.json();
        })
        .then((data) => {
          console.log('Analysis data received:', data);
          setAnalysisData(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching analysis:', err);
          setIsLoading(false);
        });
    } else {
      console.log('No analysis URL provided');
      setIsLoading(false);
    }
  }, [analysisUrl, analysisResults]);

  const MetricCard = ({ icon, title, value, subtitle }) => (
    <div className="bg-slate-700 p-6 rounded-xl border border-slate-600 hover:border-slate-500 transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(99,102,241,0.08)' }}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="text-4xl font-bold text-white mb-2">{value}</div>
      <p className="text-sm text-gray-300">{subtitle}</p>
    </div>
  );

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Safely read values from backend JSON
  const gazePercentage = analysisData?.gaze?.percentage || 0;
  const fillerCount = analysisData?.fluency?.filler_count || 0;
  const transcript = analysisData?.fluency?.transcript || 'No transcript available';
  const emotions = analysisData?.emotions || {};
  const wordCount = analysisData?.fluency?.word_count || 0;
  const speakingRate = analysisData?.fluency?.speaking_rate_wpm || 0;
  const fillerPer100 = analysisData?.fluency?.filler_per_100_words || 0;

  const emotionSummary = analysisData?.emotion_summary || {};
  const scores = analysisData?.scores || {};

  const dominantEmotionFromSummary = emotionSummary.dominant_emotion || null;
  const dominantEmotionConfidence = emotionSummary.confidence || 0;

  // Fallback: compute dominant emotion from raw counts if summary missing
  const dominantEmotionFromCounts =
    Object.keys(emotions).length > 0
      ? Object.entries(emotions).sort((a, b) => b[1] - a[1])[0][0]
      : 'neutral';

  const finalDominantEmotion = dominantEmotionFromSummary || dominantEmotionFromCounts;

  // Use backend overall_score if available, otherwise fallback to previous formula
  const overallScoreRaw =
    typeof scores.overall_score === 'number'
      ? scores.overall_score
      : Math.round(
          gazePercentage * 0.6 + (1 - Math.min(fillerCount / 10, 1)) * 40
        );

  const overallScore = Math.round(overallScoreRaw);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
        <div className="max-w-3xl mx-auto text-center text-white">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white hover:text-gray-200 mb-6 transition-colors mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">No Analysis Data</h1>
          <p className="text-gray-300">We couldn’t find your analysis details. Please try recording again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white hover:text-gray-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">Interview Analysis Complete!</h1>
          <p className="text-gray-300">Here's your detailed performance report</p>
        </div>

        {/* Overall Score */}
        <div className="bg-slate-800 rounded-2xl shadow-xl p-8 mb-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Overall Performance Score</h2>
          <div className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-slate-700 border-8 border-slate-600">
            <span className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</span>
          </div>
          <p className="mt-6 text-gray-300 text-lg">
            {overallScore >= 80 && '🎉 Excellent! You showed great confidence and clarity.'}
            {overallScore >= 60 && overallScore < 80 && '👍 Good job! A few areas to improve.'}
            {overallScore >= 40 && overallScore < 60 && '📈 Fair performance. Practice will help.'}
            {overallScore < 40 && "💪 Keep practicing! You'll improve with time."}
          </p>

          {/* Show breakdown from backend scores */}
          {scores && (
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-300">
              <span>
                Eye Contact Score:{' '}
                <span className="font-semibold">
                  {typeof scores.eye_contact_score === 'number' ? scores.eye_contact_score.toFixed(1) : 'N/A'}
                </span>
              </span>
              <span>
                Fluency Score:{' '}
                <span className="font-semibold">
                  {typeof scores.fluency_score === 'number' ? scores.fluency_score.toFixed(1) : 'N/A'}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Video + Transcript Section */}
          <div className="lg:col-span-2 bg-slate-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Your Interview Recording</h2>
            {fullVideoUrl ? (
              <video src={fullVideoUrl} controls className="w-full rounded-lg mb-6" />
            ) : (
              <div className="bg-slate-700 rounded-lg p-8 text-center">
                <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                <p className="text-gray-300">No video recording was found.</p>
              </div>
            )}

            <h3 className="text-xl font-bold text-white mb-3">Speech Transcript</h3>
            <div className="bg-slate-700 p-4 rounded-lg border border-slate-600 max-h-64 overflow-y-auto">
              <p className="text-gray-200 whitespace-pre-wrap">{transcript}</p>
            </div>
            {(wordCount || speakingRate || fillerPer100) && (
              <p className="text-sm text-gray-400 mt-2">
                {wordCount > 0 && <>Total words: <span className="font-semibold text-gray-200">{wordCount}</span> • </>}
                {speakingRate > 0 && <>Speaking rate: <span className="font-semibold text-gray-200">{speakingRate.toFixed(1)} WPM</span> • </>}
                {fillerPer100 >= 0 && <>
                  Filler density:{' '}
                  <span className="font-semibold text-gray-200">
                    {fillerPer100.toFixed(2)} per 100 words
                  </span>
                </>}
              </p>
            )}
          </div>

          {/* Metrics Section */}
          <div className="space-y-6">
            <MetricCard
              icon={<Eye className="w-6 h-6 text-indigo-400" />}
              title="Eye Contact"
              value={`${gazePercentage.toFixed(1)}%`}
              subtitle={
                gazePercentage >= 75
                  ? 'Excellent eye contact!'
                  : gazePercentage >= 50
                  ? 'Good, but try to look at the camera more'
                  : 'Practice maintaining eye contact'
              }
            />

            <MetricCard
              icon={<Mic className="w-6 h-6 text-purple-400" />}
              title="Filler Words"
              value={fillerCount}
              subtitle={
                fillerCount <= 3
                  ? 'Great fluency!'
                  : fillerCount <= 6
                  ? 'Moderate use of fillers'
                  : 'Try to reduce filler words'
              }
            />

            <div className="bg-slate-700 p-6 rounded-xl border border-slate-600">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-pink-500/20 rounded-lg">
                  <Smile className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Dominant Emotion</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-2 capitalize">
                {finalDominantEmotion}
              </div>
              {dominantEmotionConfidence > 0 && (
                <p className="text-sm text-gray-300 mb-3">
                  Seen in about{' '}
                  <span className="font-semibold text-gray-100">
                    {dominantEmotionConfidence.toFixed(1)}%
                  </span>{' '}
                  of analyzed frames
                </p>
              )}
              {Object.keys(emotions).length > 0 && (
                <div className="mt-2 space-y-2">
                  {Object.entries(emotions)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([emotion, count]) => (
                      <div key={emotion} className="flex justify-between items-center text-sm">
                        <span className="text-gray-300 capitalize">{emotion}</span>
                        <span className="text-gray-400">{count} frames</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-slate-800 rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            Recommendations
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {gazePercentage < 70 && (
              <div className="bg-slate-700 p-4 rounded-lg border-l-4 border-yellow-500">
                <h4 className="font-semibold text-white mb-1">Improve Eye Contact</h4>
                <p className="text-sm text-gray-300">
                  Look directly at the camera, not just the screen. This simulates eye contact with
                  the interviewer.
                </p>
              </div>
            )}
            {fillerCount > 5 && (
              <div className="bg-slate-700 p-4 rounded-lg border-l-4 border-orange-500">
                <h4 className="font-semibold text-white mb-1">Reduce Filler Words</h4>
                <p className="text-sm text-gray-300">
                  It&apos;s okay to pause and think instead of saying &quot;um&quot; or
                  &quot;like&quot;. Practice slower, deliberate speaking.
                </p>
              </div>
            )}
            {overallScore >= 75 && (
              <div className="bg-slate-700 p-4 rounded-lg border-l-4 border-green-500">
                <h4 className="font-semibold text-white mb-1">Great Performance!</h4>
                <p className="text-sm text-gray-300">
                  You&apos;re doing well! Keep practicing to maintain this level of confidence and
                  clarity.
                </p>
              </div>
            )}
            <div className="bg-slate-700 p-4 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-white mb-1">Keep Practicing</h4>
              <p className="text-sm text-gray-300">
                Regular mock interviews will help you become more comfortable and confident in
                real interviews.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={() => navigate('/ai-interview-video')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
          >
            Practice Again
          </button>
          <button
            onClick={() => window.print()}
            className="bg-slate-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-slate-600 transition-all shadow-lg"
          >
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
}
