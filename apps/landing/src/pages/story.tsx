import { motion } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function StoryPage() {
  return (
    <div className="min-h-screen bg-primary-50/20 flex flex-col">
      <Head>
        <title>Our Story | Asetta</title>
        <meta
          name="description"
          content="The story behind Asetta - why we built an AI-powered academic management platform to support students through the transition to post-secondary independence."
        />
      </Head>
      <Header />

      <main 
        className="flex-grow pb-24 relative overflow-hidden"
        style={{
          paddingTop: `max(8rem, calc(8rem + env(safe-area-inset-top)))`,
        }}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-100/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-primary-100/15 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20 animate-fade-in"
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm border border-primary-200/50 mb-6">
              <span className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></span>
              Our Story
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 font-heading tracking-tight leading-tight">
              Why We Built{" "}
              <span className="text-primary-600">
                Asetta
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The journey from structured high school to independent post-secondary life—and how we're helping students navigate that transition.
            </p>
          </motion.div>

          {/* Main Story Sections */}
          <div className="space-y-16">
            {/* The Educational Journey */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary-50/30 opacity-50"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                  The Educational Journey
                </h2>
                <div className="prose prose-lg prose-gray max-w-none">
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    From elementary school through high school, our entire educational journey was guided. Teachers told us exactly when assignments were due, 
                    what to study, and how to manage our time. Parents, counselors, and the system itself provided structure at every step.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    This system worked well. We learned to follow schedules, meet deadlines, and achieve academic success within a framework that supported us. 
                    Every day was planned, every assignment was announced, and every test was scheduled well in advance with clear expectations.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    Then post-secondary education arrives—university, college, trade school—and suddenly that structure disappears. 
                    No more daily check-ins. No more guided schedules. You're expected to independently manage complex coursework, deadlines, and academic goals.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                    <strong className="text-primary-600">But why should support vanish right when the academic challenges become most demanding?</strong>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* The Independence Challenge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-orange-50/30 opacity-50"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                  The Independence Challenge
                </h2>
                <div className="prose prose-lg prose-gray max-w-none">
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    Post-secondary life is overwhelming. New environments, new freedoms, increased responsibility—and suddenly you're 
                    expected to independently track multiple courses, assignments, and deadlines without the support systems you've always had.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    The challenges are real and immediate. Course syllabi become your only guidance, but they're often dense documents filled with 
                    dates, policies, and assignment descriptions that can be difficult to parse. Professors assume you can manage your time effectively, 
                    but time management is a skill that was never explicitly taught in previous education levels.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    Many students struggle with this transition. There are countless new adjustments: 
                    managing complex schedules, understanding different course structures, balancing academic and personal responsibilities, 
                    adapting to various teaching styles, and building the organizational skills that were never explicitly taught.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    Add to this the stress of being away from home (for many), financial pressures, social adjustments, and the weight of making 
                    decisions that feel like they'll impact your entire future. It's no wonder that even the most motivated students can feel overwhelmed.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                    <strong className="text-orange-600">When life gets overwhelming, even the most motivated students can struggle to stay organized.</strong>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* The Solution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-green-50/30 opacity-50"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                  Our Solution
                </h2>
                <div className="prose prose-lg prose-gray max-w-none">
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    That's where Asetta comes in. We recognized that students don't need less independence—they need better tools to manage that independence effectively. 
                    We're here to help you navigate the transition to post-secondary life and stay organized through the challenges that come with academic independence.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    Asetta uses artificial intelligence to help you track deadlines, organize assignments, and manage your academic workload with less effort and stress. 
                    Our intelligent system can extract assignment details from your syllabi, predict upcoming deadlines, and provide personalized insights about your academic progress.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    The platform adapts to your unique schedule and learning style. Whether you're a first-year finding your footing, a returning student balancing work and studies, 
                    or a senior managing complex coursework and job applications, Asetta provides the organizational backbone you need to succeed.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    We don't want to replace your independence—we want to enhance it. Think of Asetta as the support system you wish you had, 
                    helping you focus on learning and growing rather than constantly worrying about missed deadlines or forgotten assignments.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                    <strong className="text-green-600">We're always available when academic life gets overwhelming, helping you stay organized and in control.</strong>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Why It Matters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-primary-50 rounded-3xl p-8 md:p-12 shadow-lg border border-primary-200/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary-100/20"></div>
              
              <div className="relative z-10 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                  Why This Matters
                </h2>
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 max-w-3xl mx-auto">
                  Post-secondary education should be about learning, growing, and discovering your potential—not constantly feeling overwhelmed by organization and time management. 
                  When students have the right support systems, they can focus on what really matters: their education, their growth, and their future.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                      Reducing Stress
                    </h3>
                    <p className="text-gray-700">
                      By automating organization and providing clear overviews of academic responsibilities, students can reduce anxiety and feel more in control of their academic journey.
                    </p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                      Improving Outcomes
                    </h3>
                    <p className="text-gray-700">
                      When students are organized and aware of their deadlines, they can plan better, avoid last-minute rushes, and produce higher quality work.
                    </p>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block"
                >
                  <Link
                    href="https://asetta.me/register"
                    className="group inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Start Your Journey
                    <svg
                      className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}