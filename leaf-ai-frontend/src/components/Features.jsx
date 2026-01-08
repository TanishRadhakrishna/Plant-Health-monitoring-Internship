import './Features.css';

function Features() {
  const features = [
    { title: 'Upload Leaf Image', desc: 'Easily upload clear leaf photos for AI analysis.' },
    { title: 'AI Prediction', desc: 'Receive fast disease predictions with confidence scores.' },
    { title: 'Actionable Insights', desc: 'Get treatment steps and prevention tips.' },
  ];

  return (
    <div className="features">
      <h2>Why Leaf AI?</h2>

      <div className="cards">
        {features.map((f) => (
          <div className="card" key={f.title}>
            <div className="card-inner">
              <div className="card-front">{f.title}</div>
              <div className="card-back">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Features;
