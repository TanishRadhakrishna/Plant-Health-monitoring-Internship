import { useState } from 'react';
import predictionAPI from '../../api/prediction';

export default function ImageUpload({ onResult, sessionId }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChoose = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleAnalyze = async () => {
    if (!file) return alert('Please select an image');

    // validate file client-side
    const validation = predictionAPI.validateImageFile(file);
    if (!validation.valid) return alert(validation.error);

    setLoading(true);
    try {
      // pass sessionId so the backend can store the prediction in the correct session
      const res = await predictionAPI.predict(file, sessionId);

      // backend might return { id, prediction, confidence, remedy, imageUrl } or nested object
      const normalized = res?.result || res || {};

      const payload = {
        id: normalized.id || normalized.predictionId || normalized._id || null,
        label: normalized.class || normalized.label || normalized.prediction || 'Unknown',
        confidence: normalized.confidence ?? normalized.score ?? 0,
        remedy: normalized.remedy || normalized.recommendation || 'Follow agronomic best practices',
        imageUrl: normalized.imageUrl || preview || null,
        raw: res,
      };

      onResult?.(payload);
    } catch (err) {
      console.error(err);
      alert(err?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 w-full">
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-green-200 rounded-lg p-6 text-center hover:bg-green-50 upload-drop-area">
              <p className="text-lg font-semibold">Drag & drop or click to upload</p>
              <p className="text-sm text-green-600 mt-1">JPG, PNG — up to 10MB</p>
              <input type="file" accept="image/png,image/jpeg" onChange={onChoose} className="hidden" />
            </div>
          </label>
        </div>

        <div className="w-56 flex flex-col items-center gap-3">
          {preview ? <img src={preview} alt="preview" className="rounded-md shadow-sm w-full object-cover h-36" /> : <div className="w-full h-36 rounded-md bg-green-50 flex items-center justify-center text-green-600">Preview</div>}
          <button onClick={handleAnalyze} disabled={loading} className="btn w-full">
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>
    </div>
  );
}
