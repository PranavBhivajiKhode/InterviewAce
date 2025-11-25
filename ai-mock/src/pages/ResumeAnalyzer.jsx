import React, { useState } from 'react';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Briefcase,
  GraduationCap,
  Target,
  Zap,
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe2,
  Info
} from 'lucide-react';

export default function ResumeAnalyzer() {
  const [currentPage, setCurrentPage] = useState('form'); // 'form' or 'results'
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    experience: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const roles = [
    'software engineer',
    'data analyst',
    'machine learning engineer',
    'frontend developer',
    'backend developer',
    'devops engineer'
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const fileName = file.name.toLowerCase();
      const allowedExtensions = ['.pdf', '.docx'];

      const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

      if (!isValidExtension) {
        setError('Please upload a PDF or DOCX file');
        setSelectedFile(null);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.role || !formData.experience) {
      setError('Please fill all fields');
      return;
    }

    if (!selectedFile) {
      setError('Please select a resume file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', selectedFile);
      formDataToSend.append('userId', 'user_' + Date.now());
      formDataToSend.append('name', formData.name);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('experience', formData.experience);

      const response = await fetch('http://localhost:8000/upload-and-analyze', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      const data = await response.json();
      setResult(data);
      setCurrentPage('results');

      // Save to localStorage
      saveToLocalStorage(data);

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveToLocalStorage = (analysisData) => {
    try {
      const existingAnalyses = JSON.parse(localStorage.getItem('resume_analyses') || '[]');
      existingAnalyses.push({
        ...analysisData,
        timestamp: new Date().toISOString(),
        id: Date.now()
      });
      localStorage.setItem('resume_analyses', JSON.stringify(existingAnalyses));
    } catch (e) {
      console.error('Could not save to localStorage:', e);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBackToForm = () => {
    setCurrentPage('form');
    setResult(null);
    setSelectedFile(null);
    setFormData({ name: '', role: '', experience: '' });
    setError('');
  };

  if (currentPage === 'results' && result) {
    return <ResultsPage data={result} onBack={handleBackToForm} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Resume ATS Analyzer</h1>
          <p className="text-gray-600">Get your ATS score and personalized recommendations in seconds</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-gray-900 placeholder-gray-500"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Target Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-gray-900"
                required
              >
                <option value="">Select your target role</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role
                      .split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Years of Experience <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-gray-900 placeholder-gray-500"
                placeholder="3"
                min="0"
                max="50"
                step="0.5"
                required
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Resume (PDF or DOCX) <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  {selectedFile ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                      <p className="text-green-600 font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                      <p className="text-xs text-blue-600 hover:underline">Click to change file</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <p className="text-gray-600 font-medium">Click to upload PDF or DOCX</p>
                      <p className="text-xs text-gray-400">Maximum file size: 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Analyzing Your Resume...
                </span>
              ) : (
                'Analyze My Resume'
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              What We Analyze
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-blue-700">
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>ATS compatibility score</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Skills match analysis</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Format & structure</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Achievement quantification</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Missing skills detection</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Personalized tips</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Results Page Component
function ResultsPage({ data, onBack }) {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-blue-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getCategoryMax = (category) => {
    const maxScores = {
      'Format & Structure': 15,
      'Contact Information': 5,
      'Skills Match': 25,
      'Experience Quality': 20,
      Education: 10,
      'Achievements & Impact': 15,
      'ATS Optimization': 10
    };
    return maxScores[category] || 20;
  };

  const formatExperienceLabel = (expString) => {
    const num = parseFloat(expString);
    if (isNaN(num)) return expString; // e.g. "Not specified"
    return `${num} ${num === 1 ? 'year' : 'years'}`;
  };

  const contactInfo = data.meta?.contact_info || {};
  const experienceSummary = data.meta?.experience_summary || {};
  const atsChecks = data.meta?.ats_checks || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="w-full px-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-700 font-medium transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Analyze Another Resume
        </button>

        {/* Main Results Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 text-center">
            <h2 className="text-3xl font-bold mb-2">{data.candidate_name}</h2>
            <p className="text-blue-100 text-lg mb-6">
              {data.role
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
              {' • '}
              {formatExperienceLabel(data.experience)} experience
            </p>

            {/* Score Circle */}
            <div className="inline-block">
              <div className={`${getScoreBgColor(data.ats_score)} rounded-full p-8 inline-block`}>
                <div className={`text-7xl font-bold ${getScoreColor(data.ats_score)}`}>
                  {data.ats_score}
                </div>
                <div className="text-xl font-semibold text-gray-700 mt-2">{data.score_label}</div>
              </div>
            </div>

            <p className="text-blue-100 mt-4">
              Skills match for this role: <span className="font-semibold">{data.match_percentage || 0}%</span>
            </p>
          </div>

          {/* Content Section */}
          <div className="p-8 space-y-8">
            {/* Critical Issues */}
            {data.recommendations?.critical_issues &&
              data.recommendations.critical_issues.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                    <h3 className="text-xl font-bold text-red-900">Critical Issues to Fix</h3>
                  </div>
                  <ul className="space-y-2">
                    {data.recommendations.critical_issues.map((issue, i) => (
                      <li key={i} className="text-red-800 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Score Breakdown */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
                Detailed Score Breakdown
              </h3>
              <div className="space-y-4">
                {Object.entries(data.detailed_scores || {}).map(([category, score]) => {
                  const maxScore = getCategoryMax(category);
                  const percentage = (score / maxScore) * 100;
                  return (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">{category}</span>
                        <span className="text-sm font-semibold text-gray-600">
                          {score} / {maxScore}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percentage >= 80
                              ? 'bg-green-500'
                              : percentage >= 60
                              ? 'bg-blue-500'
                              : percentage >= 40
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Profile & ATS Health */}
            {(data.meta || data.meta?.contact_info || data.meta?.ats_checks) && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Contact & Profile */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <Info className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-bold text-gray-900">Contact & Profile</h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <ContactRow label="Email" present={contactInfo.email} Icon={Mail} />
                    <ContactRow label="Phone" present={contactInfo.phone} Icon={Phone} />
                    <ContactRow label="LinkedIn" present={contactInfo.linkedin} Icon={Linkedin} />
                    <ContactRow label="GitHub" present={contactInfo.github} Icon={Github} />
                    <ContactRow label="Portfolio / Website" present={contactInfo.portfolio} Icon={Globe2} />
                  </div>

                  {experienceSummary && (
                    <div className="mt-4 text-sm text-gray-700">
                      <p className="font-semibold mb-1">Experience Summary:</p>
                      <p>
                        Detected experience:{' '}
                        <span className="font-medium">
                          {experienceSummary.years_found ?? 0} {experienceSummary.years_found === 1 ? 'year' : 'years'}
                        </span>
                      </p>
                      {experienceSummary.user_years != null && (
                        <p>
                          You entered:{' '}
                          <span className="font-medium">
                            {experienceSummary.user_years}{' '}
                            {experienceSummary.user_years === 1 ? 'year' : 'years'}
                          </span>
                        </p>
                      )}
                      <p>
                        Detail level:{' '}
                        <span className="font-medium capitalize">
                          {experienceSummary.detail_level || 'unknown'}
                        </span>
                      </p>
                      <p>
                        Consistent with resume:{' '}
                        <span
                          className={`font-semibold ${
                            experienceSummary.consistent ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {experienceSummary.consistent ? 'Yes' : 'No'}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* ATS Health Check */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <Zap className="w-6 h-6 text-purple-600 mr-3" />
                    <h3 className="text-lg font-bold text-gray-900">ATS Health Check</h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <AtsCheckRow
                      label="Standard sections (Experience, Education, Skills)"
                      ok={atsChecks.standard_sections}
                    />
                    <AtsCheckRow label="Simple formatting (no complex tables)" ok={atsChecks.simple_formatting} />
                    <AtsCheckRow label="Contact info detectable" ok={atsChecks.contact_info} />
                    <AtsCheckRow label="Appropriate length" ok={atsChecks.appropriate_length} />
                  </div>
                </div>
              </div>
            )}

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              {data.recommendations?.strengths && data.recommendations.strengths.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-xl font-bold text-green-900">Your Strengths</h3>
                  </div>
                  <ul className="space-y-2">
                    {data.recommendations.strengths.map((strength, i) => (
                      <li key={i} className="text-green-800 text-sm flex items-start">
                        <span className="mr-2">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {data.recommendations?.improvements && data.recommendations.improvements.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Target className="w-6 h-6 text-yellow-600 mr-3" />
                    <h3 className="text-xl font-bold text-yellow-900">Areas to Improve</h3>
                  </div>
                  <ul className="space-y-2">
                    {data.recommendations.improvements.map((improvement, i) => (
                      <li key={i} className="text-yellow-800 text-sm flex items-start">
                        <span className="mr-2">•</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Skills Analysis */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Award className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-bold text-blue-900">
                  Skills Analysis ({data.analysis?.total_skills || 0} found)
                </h3>
              </div>

              {/* Skills Found */}
              <div className="mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">Skills Detected:</h4>
                <div className="flex flex-wrap gap-2">
                  {(data.analysis?.skills_found || []).slice(0, 15).map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {data.analysis?.skills_found &&
                    data.analysis.skills_found.length > 15 && (
                      <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium">
                        +{data.analysis.skills_found.length - 15} more
                      </span>
                    )}
                </div>
              </div>

              {/* Missing Skills */}
              {data.analysis?.missing_required_skills &&
                data.analysis.missing_required_skills.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">Missing Critical Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.analysis.missing_required_skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {data.analysis?.word_count != null ? data.analysis.word_count : '-'}
                </div>
                <div className="text-sm text-gray-600">Words</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Briefcase className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {data.analysis?.sections_found ? data.analysis.sections_found.length : '-'}
                </div>
                <div className="text-sm text-gray-600">Sections</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <GraduationCap className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {data.analysis?.total_skills != null ? data.analysis.total_skills : '-'}
                </div>
                <div className="text-sm text-gray-600">Skills</div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-indigo-900 mb-4">📋 Next Steps</h3>
              <ol className="space-y-2">
                {(data.next_steps || []).map((step, i) => (
                  <li key={i} className="text-indigo-800 flex items-start">
                    <span className="font-bold mr-3">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={onBack}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Analyze Another Resume
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                Print Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small helper components for clean JSX

function ContactRow({ label, present, Icon }) {
  return (
    <div className="flex items-center">
      <Icon className={`w-4 h-4 mr-2 ${present ? 'text-green-600' : 'text-gray-400'}`} />
      <span className="flex-1">{label}</span>
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          present ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}
      >
        {present ? 'Present' : 'Missing'}
      </span>
    </div>
  );
}

function AtsCheckRow({ label, ok }) {
  return (
    <div className="flex items-center">
      <span
        className={`w-2 h-2 rounded-full mr-2 ${
          ok ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className="flex-1 text-sm text-gray-700">{label}</span>
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}
      >
        {ok ? 'OK' : 'Check'}
      </span>
    </div>
  );
}
