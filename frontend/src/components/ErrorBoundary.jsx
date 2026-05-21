import React from 'react';
import Navbar from './Navbar';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-deepBlack text-white">
          <Navbar showFilters={false} />
          <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
            <div className="w-64 h-64 relative mb-8">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
                <span className="text-[120px] font-black text-red-500 relative z-10">⚠️</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
            <p className="text-gray-400 text-lg max-w-md mx-auto mb-10">
              We've encountered an unexpected error. Don't worry, our team has been notified (simulated).
            </p>
            <div className="bg-cardBlack p-4 rounded-xl border border-red-500/30 mb-8 max-w-2xl overflow-auto">
                <code className="text-red-400 text-sm">{this.state.error?.toString()}</code>
            </div>
            <button 
                onClick={() => window.location.href = '/'}
                className="btn-primary px-10 py-4 text-lg font-bold shadow-xl shadow-primary/30 transition-all"
            >
                Restart Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
