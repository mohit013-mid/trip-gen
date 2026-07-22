import React, { useState } from "react";
import { Image as ImageIcon, Send, Clock, Sparkles, ShieldCheck } from "lucide-react";

const EXAMPLES = [
    "Plan a trip for me and my partner for 5 days. We are going to Japan from NYC on the 27th with a budget of $2200. Refer to these images for our dream trip.",
    "Me and my two friends are going to Los Angeles and San Diego for 6 days from Chicago. Each of us has a budget of $1500. Give fun recommendations and include Disneyland!",
    "I'm solo travelling for a week in Bali starting from Sydney next week. I have $2000 to spend. I want to visit beaches, see the culture, and meet people.",
];

const FEATURES = [
    { Icon: Clock, title: "Time Efficient", text: "One prompt and an itinerary done. No need to search for hours!" },
    { Icon: Sparkles, title: "Personalized", text: "Want a fun trip? On a budget? Got a specific photo reference? TripGen personalizes the itinerary just for you." },
    { Icon: ShieldCheck, title: "Stress Free", text: "All the details managed in one place — flights, hotels, and activities. You won't miss a thing." },
];

/**
 * onGetStarted(prompt?: string) — call your router here, e.g.:
 *   navigate("/chat/new", { state: { prompt } })
 */
export default function LandingPage({ onGetStarted = () => { } }) {
    const [input, setInput] = useState("");

    return (
        <div className="min-h-screen w-full relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

            {/* soft gradient backdrop */}
            <div className="absolute inset-0 -z-10 bg-white">
                <div className="absolute -bottom-32 -left-32 w-[520px] h-[520px] rounded-full bg-blue-300/40 blur-[110px]" />
                <div className="absolute -top-24 -right-16 w-[480px] h-[480px] rounded-full bg-emerald-200/50 blur-[110px]" />
                <div className="absolute top-1/3 left-1/3 w-[380px] h-[380px] rounded-full bg-sky-200/40 blur-[100px]" />
            </div>

            {/* nav */}
            <nav className="flex items-center justify-between px-8 md:px-14 py-6">
                <span className="text-[19px] font-bold tracking-tight text-gray-900">TripGen<span className="font-normal">AI</span></span>
                <button className="text-[13.5px] font-semibold tracking-wide text-gray-800 hover:text-gray-500 transition-colors">
                    LOG IN
                </button>
            </nav>

            {/* hero */}
            <main className="flex flex-col items-center px-6 pt-10 md:pt-16 pb-24">
                <h1 className="text-[28px] md:text-[38px] font-medium text-gray-900 text-center leading-tight max-w-[720px]">
                    <span className="underline decoration-2 underline-offset-4">Seamless</span> itinerary planning with your smart travel sidekick.
                </h1>

                {/* prompt box */}
                <div className="w-full max-w-2xl mt-9 bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-gray-100 p-4">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Plan a trip for me and my partner for 5 days. We are going to Japan from NYC on the 27th with a budget of $2200. Refer to these images for our dream trip."
                        rows={3}
                        className="w-full resize-none outline-none text-[14.5px] text-gray-800 placeholder:text-gray-400 leading-relaxed"
                    />
                    <div className="flex items-center justify-between mt-2">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Attach reference image">
                            <ImageIcon size={19} />
                        </button>
                        <button
                            onClick={() => onGetStarted(input)}
                            disabled={!input.trim()}
                            className="text-gray-400 disabled:text-gray-300 hover:text-blue-600 transition-colors"
                            aria-label="Send"
                        >
                            <Send size={19} />
                        </button>
                    </div>
                </div>

                {/* examples */}
                <p className="text-[13px] text-gray-500 mt-8 mb-3">Try these examples:</p>
                <div className="grid sm:grid-cols-3 gap-3 max-w-4xl w-full">
                    {EXAMPLES.map((ex) => (
                        <button
                            key={ex}
                            onClick={() => setInput(ex)}
                            className="text-left bg-white border border-gray-100 rounded-xl p-4 text-[12.5px] text-gray-600 leading-relaxed shadow-[0_1px_8px_rgba(0,0,0,0.04)] hover:border-blue-200 hover:shadow-[0_2px_14px_rgba(0,0,0,0.07)] transition-all line-clamp-4"
                        >
                            {ex}
                        </button>
                    ))}
                </div>
                <p className="text-[12px] text-gray-400 mt-5">For image functionality, log in.</p>

                {/* why section */}
                <div className="w-full max-w-4xl mt-28">
                    <h2 className="text-[22px] font-semibold text-gray-900 text-center mb-10">Why TripGen AI?</h2>
                    <div className="grid sm:grid-cols-3 gap-8">
                        {FEATURES.map(({ Icon, title, text }) => (
                            <div key={title} className="text-center">
                                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3.5">
                                    <Icon size={19} className="text-blue-600" />
                                </div>
                                <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5">{title}</h3>
                                <p className="text-[13px] text-gray-500 leading-relaxed">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => onGetStarted()}
                    className="mt-16 bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-medium px-7 py-3 rounded-xl transition-colors shadow-[0_2px_12px_rgba(37,99,235,0.25)]"
                >
                    Get Started
                </button>
            </main>
        </div>
    );
}