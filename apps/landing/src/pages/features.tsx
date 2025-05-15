import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Head>
        <title>Features - Kivo</title>
        <meta
          name="description"
          content="Explore all the features Kivo offers to simplify your academic journey."
        />
      </Head>
      <Header />

      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              All Features
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover everything Kivo has to offer to help you stay organized
              and excel academically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-fade-in-delayed">
            {[
              {
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                title: "Assignment Tracking",
                description:
                  "Keep track of all your assignments, deadlines, and progress in one place.",
              },
              {
                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                title: "Calendar Integration",
                description:
                  "Sync your academic schedule with your personal calendar for seamless planning.",
              },
              {
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                title: "Progress Analytics",
                description:
                  "Visualize your academic progress and identify areas for improvement.",
              },
              {
                icon: "M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-1.79-8-4V7a2 2 0 012-2h2V3a1 1 0 112 0v2h4V3a1 1 0 112 0v2h2a2 2 0 012 2v7c0 2.21-3.582 4-8 4z",
                title: "Reminders & Notifications",
                description:
                  "Never miss a deadline with smart reminders and real-time notifications.",
              },
              {
                icon: "M5 13l4 4L19 7",
                title: "Collaboration Tools",
                description:
                  "Work with classmates, share notes, and collaborate on group projects easily.",
              },
              {
                icon: "M12 4v16m8-8H4",
                title: "Resource Management",
                description:
                  "Organize your study materials, notes, and resources in one convenient place.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group transform transition-all duration-300 hover:-translate-y-2"
              >
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100">
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
                  <p className="text-gray-600 leading-relaxed">
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
