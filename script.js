// === HTML Elements ===
const btn = document.querySelector("#btn");
const content = document.querySelector("#content");
const voice = document.querySelector("#voice");

// === Speech Synthesis (बोलने वाला हिस्सा) ===
const synth = window.speechSynthesis;
let hindiVoice = null;

// आवाज़ों को लोड करने और हिंदी वॉयस चुनने का फंक्शन
function loadVoices() {
    const voices = synth.getVoices();
    hindiVoice = voices.find(v => v.lang === 'hi-IN');
    if (hindiVoice) {
        console.log("SUCCESS: Hindi voice found and loaded.");
    } else {
        console.warn("WARNING: Hindi (hi-IN) voice not found. Using default.");
    }
}

// यह सुनिश्चित करता है कि आवाज़ें बोलने से पहले लोड हो जाएं
loadVoices();
if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices;
}

// बोलने वाला मुख्य फंक्शन (इसे नहीं बदलेंगे)
function speak(text) {
    if (synth.speaking) {
        synth.cancel(); // अगर पहले से बोल रहा है तो उसे रोकें
    }
    
    // थोड़ा सा Delay देना ताकि recognition ठीक से बंद हो जाए
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.onerror = (event) => {
            console.error("SpeechSynthesis Error:", event.error);
        };
        
        if (hindiVoice) {
            utterance.voice = hindiVoice;
        }
        
        utterance.lang = 'hi-IN';
        utterance.pitch = 1;
        utterance.rate = 1;
        utterance.volume = 1;
        
        synth.speak(utterance);
    }, 200); // 200 मिलीसेकंड की देरी
}

// === Speech Recognition (सुनने वाला हिस्सा) ===
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'hi-IN'; // आप हिंदी में भी कमांड दे सकते हैं
recognition.interimResults = false;
recognition.continuous = false;


// जब सुनना शुरू हो
recognition.onstart = () => {
    console.log("Listening has started.");
    voice.style.display = "block";
    btn.style.display = "none";
};

// जब सुनना बंद हो
recognition.onend = () => {
    console.log("Listening has ended.");
    voice.style.display = "none";
    btn.style.display = "flex";
};

// जब कोई एरर आए
recognition.onerror = (event) => {
    console.error("SpeechRecognition Error:", event.error);
    content.innerText = "माफ़ कीजिये, मैं सुन नहीं पा रही हूँ। माइक्रोफ़ोन जांचें।";
};

// जब आवाज़ पहचान ली जाए (सबसे महत्वपूर्ण)
recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    content.innerText = `आपने कहा: "${transcript}"`;
    console.log(`Command received: ${transcript}`);
    takeCommand(transcript.toLowerCase());
};

// बटन क्लिक इवेंट
btn.addEventListener("click", () => {
    // बोलने की प्रक्रिया को रोकें और सुनना शुरू करें
    synth.cancel();
    recognition.start();
});

// === Command Handling (कमांड्स को मैनेज करना) ===
function takeCommand(message) {
    console.log(`Processing command: ${message}`); // चेक करें कि कमांड प्रोसेस हो रही है

    if (message.includes("hello") || message.includes("hey") || message.includes("हेलो")) {
        speak("नमस्ते सर, मैं आपकी क्या मदद कर सकती हूँ?");
    } else if (message.includes("who are you") || message.includes("कौन हो तुम")) {
        speak("मैं एक वर्चुअल असिस्टेंट हूँ, जिसे विकास सर ने बनाया है।");
    } else if (message.includes("open youtube") || message.includes("यूट्यूब खोलो")) {
        speak("यूट्यूब खोल रही हूँ");
        window.open("https://youtube.com/", "_blank");
    } else if (message.includes("open google") || message.includes("गूगल खोलो")) {
        speak("गूगल खोल रही हूँ");
        window.open("https://google.com/", "_blank");
    } else if (message.includes("time") || message.includes("समय")) {
        const time = new Date().toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
        speak(`अभी ${time} हो रहे हैं।`);
    } else if (message.includes("date") || message.includes("तारीख")) {
        const date = new Date().toLocaleString("hi-IN", { day: "numeric", month: "long" });
        speak(`आज ${date} है।`);
    } else {
        const query = message.replace("shipra", "").replace("shifra", "").trim();
        speak(`मुझे इंटरनेट पर ${query} के बारे में यह मिला है।`);
        window.open(`https://www.google.com/search?q=${query}`, "_blank");
    }
}