import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { Mic, Send, Settings, Command, Zap, FileText, Monitor, Shield, Leaf, MicOff } from 'lucide-react';

// Define interfaces for Speech Recognition API
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  readonly [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

// Define response interface
interface Response {
  text: string;
  isUser: boolean;
}

function App() {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [responses, setResponses] = useState<Response[]>([
    { text: "How can I help you today?", isUser: false }
  ]);

  // Initialize speech recognition with proper type handling
  const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = SpeechRecognitionConstructor ? new SpeechRecognitionConstructor() as SpeechRecognition : null;
  
  useEffect(() => {
    if (!recognition) return;
    
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const transcript = Array.from(results)
        .map((result: SpeechRecognitionResult) => result[0])
        .map((alternative: SpeechRecognitionAlternative) => alternative.transcript)
        .join('');
      
      setMessage(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    return () => {
      if (recognition) recognition.stop();
    };
  }, [recognition]);

  // Initialize speech synthesis
  const synth = window.speechSynthesis;

  const toggleListening = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setIsListening(!isListening);
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message to responses
    setResponses(prev => [...prev, { text: message, isUser: true }]);

    // Simulate AI response
    const aiResponse = `I understand you said: "${message}". How can I help with that?`;
    setTimeout(() => {
      setResponses(prev => [...prev, { text: aiResponse, isUser: false }]);
      speak(aiResponse);
    }, 1000);

    setMessage('');
  };

  const features = [
    { icon: Command, title: 'Task Automation', description: 'Automate repetitive tasks with simple commands' },
    { icon: Monitor, title: 'Cross-Platform', description: 'Works seamlessly across Windows, macOS, and Linux' },
    { icon: Shield, title: 'Secure', description: 'Enterprise-grade security and authentication' },
    { icon: Leaf, title: 'Eco-Friendly', description: 'Promotes sustainability through paperless automation' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-12"
      >
        <nav className="flex justify-between items-center mb-16">
          <motion.div 
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="flex items-center gap-2"
          >
            <Zap className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold">AI Assistant</span>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="p-2 rounded-full hover:bg-gray-800"
          >
            <Settings className="w-6 h-6" />
          </motion.button>
        </nav>

        {/* Main Interface */}
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Intelligent Desktop
              <span className="text-blue-500"> Assistant</span>
            </h1>
            <TypeAnimation
              sequence={[
                'Control your apps with voice...',
                1000,
                'Manage files effortlessly...',
                1000,
                'Automate your workflow...',
                1000,
              ]}
              wrapper="p"
              speed={50}
              className="text-xl text-gray-400"
              repeat={Infinity}
            />
          </motion.div>

          {/* Command Interface */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 p-6 rounded-2xl shadow-xl mb-12"
          >
            <div className="min-h-[200px] mb-4 bg-gray-900 rounded-xl p-4 overflow-y-auto max-h-[400px]">
              {responses.map((response, index) => (
                <div key={index} className={`flex items-start gap-4 mb-4 ${response.isUser ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full ${response.isUser ? 'bg-blue-600' : 'bg-blue-500'} flex items-center justify-center`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className={`${response.isUser ? 'bg-blue-600' : 'bg-gray-800'} rounded-2xl p-4 max-w-[80%]`}>
                    <p>{response.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleListening}
                className={`p-3 rounded-full ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </motion.button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your command..."
                className="flex-1 bg-gray-900 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                className="p-3 rounded-full bg-blue-500 hover:bg-blue-600"
              >
                <Send className="w-6 h-6" />
              </motion.button>
            </div>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-gray-800 p-6 rounded-xl hover:bg-gray-750 transition-colors"
              >
                <feature.icon className="w-8 h-8 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default App;