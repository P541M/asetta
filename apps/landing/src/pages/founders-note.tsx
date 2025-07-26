import { motion } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function FoundersNotePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/20 to-white flex flex-col">
      <Head>
        <title>A Note from Our Founder | Asetta</title>
        <meta
          name="description"
          content="A personal message from Eleazar, founder of Asetta, about his journey from struggling first-year student to creating an AI-powered academic management platform."
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
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-gray-100/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-gradient-to-tr from-gray-100/20 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20 animate-fade-in"
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-200/50 mb-6">
              <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
              From the Founder
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 font-heading tracking-tight leading-tight">
              A Personal{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
                Note
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The story of a struggling first-year student who built the
              academic support system he wished he had.
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="space-y-16">
            {/* Personal Story */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200/50 relative overflow-hidden">
                {/* Decorative quote element */}
                <div className="absolute top-8 left-8 w-12 h-12 opacity-10">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-gray-600"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                  </svg>
                </div>

                <div className="relative z-10">
                  <div className="max-w-3xl mx-auto">
                    <div className="prose prose-lg max-w-none">
                      <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 italic font-medium">
                        "I was that kid who felt completely overwhelmed when I
                        started post-secondary. The jump from having everything
                        structured and guided to suddenly being responsible for
                        managing complex course loads, multiple deadlines, and
                        academic planning was honestly terrifying."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* The Struggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-transparent to-orange-50/10 opacity-50"></div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                  My First Year Reality Check
                </h2>
                <div className="prose prose-lg prose-gray max-w-none">
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    I spent my first year constantly stressed about missing
                    assignments, forgetting deadlines, and feeling like I was
                    always playing catch-up. My high school grades were
                    excellent, but suddenly I found myself struggling not with
                    the course material, but with managing the chaos of multiple
                    syllabi, conflicting deadlines, and the complete lack of the
                    organizational structure I'd relied on for 12 years.
                  </p>

                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    I remember sitting in my dorm room at 2 AM, frantically
                    trying to figure out what assignments were due the next day,
                    scrolling through different course portals, checking email
                    threads, and rifling through printed syllabi. I had sticky
                    notes everywhere, multiple calendar apps that I'd forget to
                    update, and a constant anxiety that I was forgetting
                    something important.
                  </p>

                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    The worst part? I realized I wasn't alone. So many of my
                    friends were struggling with the same overwhelming
                    transition. We had the intelligence and motivation to
                    succeed—we'd all been successful students in high school—but
                    we just didn't have the organizational systems to handle
                    this new level of academic independence.
                  </p>

                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                    <strong className="text-orange-600">
                      It felt like we were set up to fail at organization,
                      despite being capable of succeeding academically.
                    </strong>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* The Realization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-blue-50/10 opacity-50"></div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                  The Turning Point
                </h2>
                <div className="prose prose-lg prose-gray max-w-none">
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    By second year, I'd developed some coping strategies. I
                    started using spreadsheets, created elaborate folder
                    systems, and found ways to stay more organized. But I kept
                    thinking: why should every student have to reinvent these
                    systems from scratch? Why isn't there something that just...
                    works?
                  </p>

                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    As a software engineering student, I started imagining what
                    that solution could look like. What if technology could help
                    bridge that gap between the structured support system of
                    high school and the complete independence of post-secondary
                    life? What if there was a way to automatically extract all
                    those important dates from syllabi, organize them
                    intelligently, and present them in a way that actually made
                    sense?
                  </p>

                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                    <strong className="text-blue-600">
                      That's when the idea for Asetta was born—not as a business
                      opportunity, but as a solution to a problem I was living
                      with every day.
                    </strong>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Building Asetta */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-transparent to-green-50/10 opacity-50"></div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                  Building the Solution
                </h2>
                <div className="prose prose-lg prose-gray max-w-none">
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    I started building Asetta during my third year, initially
                    just for myself and a few close friends. The goal was
                    simple: create a system that could automatically organize
                    academic life the way high school teachers and parents used
                    to do, but without taking away the independence that makes
                    post-secondary education valuable.
                  </p>

                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    I wanted Asetta to be the support system I wish I had during
                    that overwhelming first year—something that could take a
                    syllabus and immediately understand all the important dates,
                    something that could remind me about deadlines without being
                    annoying, something that could help me see the big picture
                    of my academic semester without requiring hours of manual
                    organization.
                  </p>

                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    Most importantly, I wanted it to be accessible to every
                    student who needed it. I remembered that feeling of stress
                    and overwhelm, and I knew that financial barriers shouldn't
                    prevent students from getting the organizational support
                    they need to succeed.
                  </p>

                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                    <strong className="text-green-600">
                      That's why Asetta has been and will always remain
                      completely free for students.
                    </strong>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Personal Reflection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200/50 relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 font-heading">
                    Today
                  </h2>

                  <div className="prose prose-lg max-w-none">
                    <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                      I'm now in my fourth year, and I still use Asetta every
                      single day. It helps me manage my course load, track my
                      deadlines, and stay organized as I balance academics with
                      building and improving the platform. Every feature I add
                      is something I've needed myself or heard other students
                      ask for.
                    </p>

                    <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8">
                      If my experience struggling through that first year can
                      help even one student feel less overwhelmed and more in
                      control of their academic journey, then every hour spent
                      building this platform was worth it. Asetta isn't just a
                      product I built—it's the solution I needed, and I hope it
                      can be the solution you need too.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-gray-300/50">
                    <p className="text-xl font-bold text-gray-700 mb-2">
                      — Eleazar
                    </p>
                    <p className="text-gray-600 mb-1">Founder & Student</p>
                    <p className="text-sm text-gray-500">
                      4th Year Software Engineering, University of Guelph
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="bg-gradient-to-br from-primary-50 to-primary-25 rounded-3xl p-8 md:p-12 shadow-lg border border-primary-200/50 relative overflow-hidden text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 via-transparent to-primary-100/10"></div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                  Ready to Get Organized?
                </h2>
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 max-w-2xl mx-auto">
                  Join thousands of students who have transformed their academic
                  organization with Asetta. It's completely free, and it might
                  just change how you experience post-secondary life.
                </p>

                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block"
                >
                  <Link
                    href="https://asetta.me/register"
                    className="group inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg hover:shadow-xl"
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
