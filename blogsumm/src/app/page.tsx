"use client"
import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Brain, ChevronRight, Globe, Users, TrendingUp } from 'lucide-react';

// Simulated BlogForm component since we don't have access to the actual one
const BlogForm = () => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async () => {
  if (!topic.trim()) return;

  setIsGenerating(true);
  try {
    const res = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: topic }),
    });

    const data = await res.json();

    if (res.ok) {
      alert(`Summary:\n${data.summary}`);
    } else {
      alert(`Error: ${data.error || 'Unknown error'}`);
    }
  } catch (err) {
    alert('API call failed');
    console.error(err);
  } finally {
    setIsGenerating(false);
  }
};


  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter blog URL or paste blog content..."
          className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-green-400/50 focus:ring-2 focus:ring-green-400/20 transition-all duration-300 text-lg backdrop-blur-sm"
          disabled={isGenerating}
        />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={isGenerating || !topic.trim()}
        className="w-full relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative flex items-center justify-center space-x-2">
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Analyzing Content...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Summarize Blog</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </div>
      </button>
    </div>
  );
};

const FloatingElement = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => {
  return (
    <div 
      className="animate-pulse"
      style={{
        animation: `float 6s ease-in-out infinite ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

type StatCardProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  value: string;
  label: string;
  delay?: number;
};

const StatCard = ({ icon: Icon, value, label, delay = 0 }: StatCardProps) => (
  <div 
    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 group"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center space-x-3">
      <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-300">
        <Icon className="w-6 h-6 text-green-400" />
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-white/70">{label}</div>
      </div>
    </div>
  </div>
);

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Mouse follower effect */}
      <div 
        className="absolute pointer-events-none z-0 w-96 h-96 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-full blur-3xl transition-all duration-1000 ease-out"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      ></div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="pt-8 pb-4">
          <div className="max-w-6xl mx-auto px-6">
            <nav className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    AI Blog Summarizer
                  </h1>
                  <p className="text-xs text-white/50">Powered by Advanced AI</p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <a href="#" className="text-white/70 hover:text-white transition-colors">Features</a>
                <a href="#" className="text-white/70 hover:text-white transition-colors">Pricing</a>
                <a href="#" className="text-white/70 hover:text-white transition-colors">Contact</a>
              </div>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <FloatingElement delay={0}>
                <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent leading-tight">
                  Summarize
                  <br />
                  <span className="relative">
                    Any Blog
                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transform scale-x-0 animate-pulse"></div>
                  </span>
                </h1>
              </FloatingElement>
              
              <FloatingElement delay={0.5}>
                <p className="text-xl md:text-2xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Transform lengthy blog posts into concise, actionable summaries with our next-generation AI. 
                  Extract key insights in seconds, not hours.
                </p>
              </FloatingElement>

              <FloatingElement delay={1}>
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                  <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm border border-white/20">
                    <Zap className="w-4 h-4 inline mr-2" />
                    Lightning Fast
                  </span>
                  <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm border border-white/20">
                    <Brain className="w-4 h-4 inline mr-2" />
                    AI Powered
                  </span>
                  <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm border border-white/20">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Smart Summaries
                  </span>
                </div>
              </FloatingElement>
            </div>

            {/* Main Form */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
                <BlogForm />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard 
                icon={Users} 
                value="50K+" 
                label="Active Users" 
                delay={200}
              />
              <StatCard 
                icon={Globe} 
                value="500K+" 
                label="Blogs Summarized" 
                delay={400}
              />
              <StatCard 
                icon={TrendingUp} 
                value="99.9%" 
                label="Satisfaction Rate" 
                delay={600}
              />
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Why Choose Our AI Blog Summarizer?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Instant Summaries",
                  description: "Get concise, accurate summaries of any blog post in seconds with our advanced AI technology."
                },
                {
                  icon: Brain,
                  title: "Smart Analysis",
                  description: "Leverages cutting-edge language models to understand context and extract key insights."
                },
                {
                  icon: Sparkles,
                  title: "Key Highlights",
                  description: "Automatically identifies and extracts the most important points and actionable insights."
                }
              ].map((feature, index) => (
                <div key={index} className="group">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 h-full">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-orange-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:from-blue-500/30 group-hover:to-orange-500/30 transition-all duration-300">
                      <feature.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-white/70 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center">
              <p className="text-white/50 mb-4">© 2025 AI Blog Summarizer. Powered by the future of content analysis.</p>
              <div className="flex justify-center space-x-6">
                <a href="#" className="text-white/40 hover:text-white/70 transition-colors">Privacy</a>
                <a href="#" className="text-white/40 hover:text-white/70 transition-colors">Terms</a>
                <a href="#" className="text-white/40 hover:text-white/70 transition-colors">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}