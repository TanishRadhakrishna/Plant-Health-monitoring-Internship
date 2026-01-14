export default function Footer(){
  return (
    <footer className="mt-12 bg-green-50 text-green-800 py-8">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-sm">© {new Date().getFullYear()} Leaf AI — Smart crop health diagnostics</p>
      </div>
    </footer>
  )
}
