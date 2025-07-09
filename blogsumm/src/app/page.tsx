import BlogForm from '@/components/BlogForm';

export default function HomePage() {
  return (
    <main className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧠 Blog Summarizer</h1>
      <BlogForm />
    </main>
  );
}
