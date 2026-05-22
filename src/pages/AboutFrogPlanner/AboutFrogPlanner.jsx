import React from 'react';
import { BookOpen, Milestone, HelpCircle, Award, Play, Star, ArrowRight } from 'lucide-react';

const AboutFrogPlanner = () => {
  const rules = [
    { num: 1, title: 'Eat Your Frog First', text: 'Complete your most important task before distractions begin.', icon: '🐸' },
    { num: 2, title: 'Top 3 Priorities Only', text: "Don't overload your day. More tasks rarely means more impact.", icon: '🎯' },
    { num: 3, title: 'Avoid Busy Work', text: 'Staying busy and being productive are not the same thing.', icon: '🚫' },
    { num: 4, title: 'One Task at a Time', text: 'Multitasking reduces quality. Finish before moving on.', icon: '✅' },
    { num: 5, title: 'Think About Impact', text: 'Before starting, ask: "Will this task create real results?"', icon: '💡' },
  ];

  const steps = [
    { step: 1, title: 'Pick your frog 🐸', desc: 'Identify the single most important task for today. If everything feels urgent, ask: what has the biggest consequence if left undone?' },
    { step: 2, title: 'Add your top priorities 🎯', desc: 'List 2–3 supporting tasks that still matter. Keep the list short by design.' },
    { step: 3, title: 'Block your day ⏰', desc: 'Assign time for your frog before anything else — meetings, messages, or admin.' },
    { step: 4, title: 'Work through tasks one by one ✅', desc: 'Complete each task fully before moving to the next. Resist the urge to context-switch.' },
    { step: 5, title: 'Review at end of day 📊', desc: "Did you eat the frog? Note what got done, what didn't, and what tomorrow's frog should be." },
  ];

  return (
    <div className="h-full overflow-y-auto bg-white scrollbar-hide">
      <div className="p-4 md:p-6 space-y-5">

      {/* ── Hero Banner ── */}
      <div className="relative bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 lg:p-8 overflow-hidden shadow-lg">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 pointer-events-none">
          <span className="text-[120px] leading-none select-none">🐸</span>
        </div>
        <div className="relative z-10 space-y-2.5">
          <span className="inline-block bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
            Productivity Guide
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
            🐸 Welcome to Frog Planner
          </h1>
          <p className="text-sm text-green-100/90 max-w-xl font-medium leading-relaxed">
            Inspired by the <span className="font-bold text-yellow-300">"Eat The Frog"</span> concept — designed to help you focus on high-impact results rather than constant busyness.
          </p>
        </div>
      </div>

      {/* ── Who Is This For? ── */}
      <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <h2 className="text-sm font-extrabold text-gray-800">Who is Frog Planner Designed For?</h2>
        </div>
        <p className="text-xs text-gray-500 font-medium leading-relaxed">
          Frog Planner is designed to help <span className="font-bold text-green-700">individuals and teams</span> focus on what truly matters — transforming daily work into meaningful progress.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { emoji: '👨‍💼', label: 'Business Owner' },
            { emoji: '👨‍💻', label: 'Professional' },
            { emoji: '👥', label: 'Team Leader' },
            { emoji: '🚀', label: 'Founder / Entrepreneur' },
            { emoji: '📚', label: 'Student' },
            { emoji: '💪', label: 'Personal Goals' },
          ].map(({ emoji, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 bg-green-50/60 border border-green-100 rounded-2xl p-3 hover:border-green-300 hover:bg-green-50 hover:shadow-sm transition-all duration-150 text-center">
              <span className="text-2xl select-none">{emoji}</span>
              <span className="text-[10px] font-bold text-green-800 leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Why We Built This + What is Frog Task ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-3 gap-4">
        {/* Why */}
        <div className="md:col-span-3 lg:col-span-2 bg-white rounded-2xl border border-green-100 shadow-sm p-5 flex flex-col gap-3">
          <h2 className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
            <Milestone className="text-green-600" size={17} />
            Why We Built This System
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">
            Most people stay busy throughout the day but still feel that important work remains unfinished. Small tasks, calls, messages, and distractions consume time while the work that actually creates growth keeps getting pushed.
          </p>
          <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-xs font-semibold text-green-800 leading-relaxed text-center italic mt-auto">
            "Focus on what matters most, complete important work first, and create meaningful results — not just stay busy."
          </div>
        </div>

        {/* What is Frog Task */}
        <div className="md:col-span-2 lg:col-span-1 bg-green-50/60 rounded-2xl border border-green-100 shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
            <HelpCircle className="text-green-600" size={17} />
            What is a Frog Task?
          </h2>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            A Frog Task is the core driver of your day — it represents the:
          </p>
          <ul className="space-y-2 text-xs font-bold text-gray-700">
            {[
              ['✨', 'Most important task'],
              ['⚡', 'Most difficult task'],
              ['🚀', 'Highest impact task'],
              ['⏳', 'Task most likely to be delayed'],
            ].map(([icon, text]) => (
              <li key={text} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-green-100 shadow-sm">
                <span>{icon}</span> {text}
              </li>
            ))}
          </ul>
          <p className="text-[10.5px] text-gray-400 italic pt-1 border-t border-green-100">
            Complete your Frog first and the rest of the day becomes easier.
          </p>
        </div>
      </div>

      {/* ── Examples Comparison ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="bg-rose-50 rounded-2xl border border-rose-100 p-4 space-y-3 shadow-sm">
          <span className="inline-block text-[11px] font-extrabold text-rose-700 bg-white px-3 py-1 rounded-full border border-rose-200 shadow-sm">
            ❌ Avoid First (Distractions)
          </span>
          <ul className="space-y-2">
            {['Replying to random messages immediately', 'Checking emails continuously without a goal', 'Filling hours with small low-value tasks'].map(item => (
              <li key={item} className="flex items-start gap-2 text-xs font-semibold text-rose-800">
                <span className="mt-0.5 text-rose-400">✗</span>{item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-green-50 rounded-2xl border border-green-100 p-4 space-y-3 shadow-sm">
          <span className="inline-block text-[11px] font-extrabold text-green-700 bg-white px-3 py-1 rounded-full border border-green-200 shadow-sm">
            ✅ Tackle First (Frog Tasks)
          </span>
          <ul className="space-y-2">
            {['Finalizing client proposal & agreements', 'Closing important sales follow-up calls', 'Completing key milestones & critical work'].map(item => (
              <li key={item} className="flex items-start gap-2 text-xs font-semibold text-green-800">
                <span className="mt-0.5 text-green-500">✓</span>{item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── 80/20 Rule ── */}
      <div className="bg-gradient-to-br from-green-700 to-green-900 text-white p-5 rounded-2xl shadow-md grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
        <div className="sm:col-span-1 text-center">
          <span className="text-[3rem] font-black tracking-tight leading-none text-yellow-300 block">80/20</span>
          <span className="text-[9px] uppercase tracking-widest font-extrabold text-green-300">Pareto Principle</span>
        </div>
        <div className="sm:col-span-3 space-y-1.5">
          <h3 className="text-sm font-extrabold text-yellow-300">The 80/20 Rule: Focus on Results</h3>
          <p className="text-xs text-green-100/90 leading-relaxed font-medium">
            Around <span className="text-white font-bold">20% of your tasks create 80% of your results</span>. You may complete 15 tasks today, but only 2–3 tasks actually improve revenue, growth, or customer satisfaction. This system helps you find and protect those tasks.
          </p>
        </div>
      </div>

      {/* ── 5 Rules ── */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
          <Award className="text-yellow-500" size={17} />
          Five Rules of Frog Productivity
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {rules.map((rule) => (
            <div key={rule.num} className="bg-white p-4 rounded-2xl border border-green-100 shadow-sm flex flex-col gap-2 hover:border-green-300 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                  {rule.num}
                </span>
                <span className="text-lg">{rule.icon}</span>
              </div>
              <h4 className="text-[11.5px] font-extrabold text-gray-800 leading-tight">{rule.title}</h4>
              <p className="text-[10.5px] text-gray-400 font-semibold leading-relaxed">{rule.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Daily Flow Steps ── */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
          <Play className="text-green-600" size={16} />
          Your Daily Frog Flow
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {steps.map((st, i) => (
            <div key={st.step} className="flex gap-4 items-start bg-white rounded-2xl border border-green-100 p-4 shadow-sm hover:border-green-300 transition-all duration-150">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-black flex-shrink-0 shadow">
                {st.step}
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-extrabold text-gray-800 mb-0.5">{st.title}</h4>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{st.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight size={14} className="text-green-300 flex-shrink-0 mt-1 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── How It Works (6-step detailed) ── */}
      <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-5">
        <div className="mb-5">
          <h2 className="text-xl font-black text-gray-900">How It Works</h2>
          <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
            A simple 6-step daily system that helps you focus on what matters most — starting with your most important task every single day.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-4">

        {[
          {
            num: 1,
            title: 'Spend 10 minutes planning',
            desc: 'Every evening, take just 10 minutes to plan the next day. This one small habit pays back hours of wasted morning confusion.',
            tags: ['Clarity', 'Less stress', 'Set priorities', 'Stay focused', 'More productive'],
            quote: 'Invest 10 minutes today to plan tomorrow — small planning, big results.',
          },
          {
            num: 2,
            title: 'Select your frog task',
            desc: 'Pick the one task that is most important, highest impact, most difficult — and most likely to be delayed. That\'s your frog.',
            tags: ['Most important', 'Highest impact', 'Most difficult', 'Most delayed'],
            quote: null,
          },
          {
            num: 3,
            title: 'Add your priorities',
            desc: 'Below your frog, select 2–3 top priority tasks for the day. Keep the list intentionally short — constraints force better decisions.',
            tags: [],
            quote: null,
          },
          {
            num: 4,
            title: 'Plan your day',
            desc: 'Organise your work around meaningful activities. Block time for deep work first — meetings, messages, and admin come after.',
            tags: [],
            quote: null,
          },
          {
            num: 5,
            title: 'Complete tasks with focus',
            desc: 'Work on one task at a time. Close tabs, silence notifications, and protect your focus until the frog is done.',
            tags: [],
            quote: null,
          },
          {
            num: 6,
            title: 'Review & improve',
            desc: 'End your day with a quick review — what got done, what\'s pending, and what tomorrow\'s frog should be. 5 minutes of reflection compounds over time.',
            tags: [],
            quote: null,
          },
        ].map((step, idx, arr) => (
          <div key={step.num}>
            <div className="flex gap-4 py-4">
              {/* Step number circle */}
              <div className="flex-shrink-0 w-9 h-9 rounded-full border-2 border-green-200 bg-green-50 flex items-center justify-center">
                <span className="text-sm font-black text-green-700">{step.num}</span>
              </div>
              {/* Content */}
              <div className="flex-1 space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Step {step.num}</p>
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                  {step.title} <span className="inline-block w-3 h-3 bg-gray-800 rounded-sm flex-shrink-0" />
                </h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">{step.desc}</p>
                {step.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {step.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 text-[10px] font-semibold text-green-800 border border-green-300 rounded-full bg-white">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {step.quote && (
                  <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 mt-2">
                    <p className="text-[11px] text-gray-500 italic font-medium">{step.quote}</p>
                  </div>
                )}
              </div>
            </div>
            {idx < arr.length - 1 && <hr className="border-gray-100" />}
          </div>
        ))}
        </div>
      </div>

      {/* ── What You May Notice Within Just One Week ── */}
      <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-5 space-y-4">
        <div>
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-gray-800 rounded-sm flex-shrink-0" />
            What You May Notice Within Just One Week
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-1.5 leading-relaxed">
            After consistently spending 10 minutes a day planning and completing your frog task, most people start noticing real shifts — faster than they expected.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            'Better focus during work',
            'Less confusion about what to do next',
            'Reduced stress and mental clutter',
            'Fewer distractions and delays',
            'More important work getting done',
            'Better time management',
            'Increased productivity and consistency',
            'Improved discipline and work habits',
            'Feeling more in control of your day',
            'Visible progress toward your goals',
          ].map(item => (
            <div key={item} className="flex items-center gap-2.5 bg-gray-50/70 border border-gray-100 rounded-lg px-3 py-2.5">
              <span className="text-green-600 font-black text-sm flex-shrink-0">✓</span>
              <span className="text-xs text-gray-700 font-semibold">{item}</span>
            </div>
          ))}
        </div>

        {/* Callout box */}
        <div className="flex items-start gap-3 bg-green-50/60 border-l-4 border-green-500 rounded-r-xl p-4 mt-2">
          <span className="inline-block w-3 h-3 bg-green-700 rounded-sm flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-700 leading-relaxed font-medium">
            <span className="font-extrabold text-gray-900">You don't need months to start seeing changes.</span>{' '}
            Small actions repeated daily create big results over time. One frog a day is all it takes.
          </p>
        </div>
      </div>

      {/* ── Goal CTA ── */}
      <div className="bg-gradient-to-br from-yellow-400/20 to-green-50 border border-yellow-300/50 rounded-2xl p-6 text-center space-y-2 shadow-sm">
        <div className="text-4xl">🚀</div>
        <h3 className="text-base font-extrabold text-gray-800">Ready to plan your day?</h3>
        <p className="text-xs text-gray-500 max-w-lg mx-auto leading-relaxed font-medium">
          Don't just complete tasks — <span className="text-green-700 font-bold">complete the right ones first.</span> Every day you eat your frog, you move one step closer to your goals.
        </p>
        <p className="text-[11px] text-amber-600 font-extrabold pt-1">🐸 Eat the Frog. Every. Single. Day.</p>
      </div>

      </div>
    </div>
  );
};

export default AboutFrogPlanner;
