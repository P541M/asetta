import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Head>
        <title>Features - Asetta</title>
        <meta
          name="description"
          content="Discover Asetta's AI-powered features designed to help students excel in their academic journey—completely free."
        />
      </Head>
      <Header />

      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Smart Features for Academic Success
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of academic organization with our smart AI
              technology, designed to help you stay on top of your studies—all
              completely free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-fade-in-delayed">
            {[
              {
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                title: "AI-Powered Assessment Tracking",
                description:
                  "Automatically extract and organize assignments, exams, and projects from your course documents using advanced AI technology.",
              },
              {
                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                title: "Smart Deadline Management",
                description:
                  "Never miss a deadline with AI-powered notifications and automated progress tracking for all your academic tasks.",
              },
              {
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                title: "Personalized Insights",
                description:
                  "Get AI-driven analytics and recommendations to optimize your study schedule and improve your academic performance.",
              },
              {
                icon: "M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-1.79-8-4V7a2 2 0 012-2h2V3a1 1 0 112 0v2h4V3a1 1 0 112 0v2h2a2 2 0 012 2v7c0 2.21-3.582 4-8 4z",
                title: "Smart Notifications",
                description:
                  "Receive intelligent reminders and real-time updates about upcoming deadlines and important academic events.",
              },
              {
                icon: "M5 13l4 4L19 7",
                title: "Document Processing",
                description:
                  "Upload course outlines and syllabi for automatic extraction of assessment details, dates, and weights.",
              },
              {
                icon: "M12 4v16m8-8H4",
                title: "Course Management",
                description:
                  "Organize your courses by semester, track assignment weights, and manage your academic progress efficiently.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group transform transition-all duration-300 hover:-translate-y-2"
              >
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 h-full flex flex-col">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={feature.icon}
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed flex-grow">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
