import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

export default function AudioCall() {
  const { state, dispatch } = useApp();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ending'>('connecting');

  // Simulate call connection
  useEffect(() => {
    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
    }, 3000);

    return () => clearTimeout(connectTimer);
  }, []);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallStatus('ending');
    setTimeout(() => {
      dispatch({ type: 'END_CALL' });
      // Navigate back to where user came from
      if (state.previousPage) {
        dispatch({ type: 'SET_PAGE', payload: state.previousPage });
      } else {
        dispatch({ type: 'SET_PAGE', payload: 'private-chat' });
      }
    }, 2000);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    // In a real app, this would control the microphone
    console.log(isMuted ? 'Microphone unmuted' : 'Microphone muted');
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // In a real app, this would control the speaker output
    console.log(isSpeakerOn ? 'Speaker off' : 'Speaker on');
  };

  const handleGoBack = () => {
    if (state.previousPage) {
      dispatch({ type: 'SET_PAGE', payload: state.previousPage });
    } else {
      dispatch({ type: 'SET_PAGE', payload: 'private-chat' });
    }
  };

  const getStatusMessage = () => {
    switch (callStatus) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return formatCallDuration(callDuration);
      case 'ending':
        return 'Call ended';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center pb-16">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Call Status */}
          <div className="text-center mb-8">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center shadow-2xl">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=caller`}
                alt="Caller Avatar"
                className="w-24 h-24 rounded-full"
              />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Anonymous User</h2>
            <p className="text-white/70 text-lg">{getStatusMessage()}</p>
            
            {callStatus === 'connecting' && (
              <div className="flex justify-center mt-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="flex justify-center items-center gap-6 mb-8">
            <button
              onClick={handleToggleMute}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                isMuted 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
              disabled={callStatus !== 'connected'}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <MicOff className="w-7 h-7 text-white" />
              ) : (
                <Mic className="w-7 h-7 text-white" />
              )}
            </button>
            
            <button
              onClick={handleEndCall}
              className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg"
              title="End call"
            >
              <PhoneOff className="w-8 h-8 text-white" />
            </button>
            
            <button
              onClick={handleToggleSpeaker}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                isSpeakerOn 
                  ? 'bg-white/20 hover:bg-white/30' 
                  : 'bg-gray-500 hover:bg-gray-600'
              }`}
              disabled={callStatus !== 'connected'}
              title={isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
            >
              {isSpeakerOn ? (
                <Volume2 className="w-7 h-7 text-white" />
              ) : (
                <VolumeX className="w-7 h-7 text-white" />
              )}
            </button>
          </div>

          {/* Call Quality Indicator */}
          {callStatus === 'connected' && (
            <div className="text-center mb-6">
              <div className="flex justify-center items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-green-400 rounded-full"></div>
                  <div className="w-1 h-3 bg-green-400 rounded-full"></div>
                  <div className="w-1 h-5 bg-green-400 rounded-full"></div>
                  <div className="w-1 h-2 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-white/70 text-sm">Good quality</span>
              </div>
            </div>
          )}

          {/* Back Button */}
          {callStatus === 'ending' && (
            <div className="text-center">
              <button
                onClick={handleGoBack}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full transition-all duration-300"
              >
                Back to Chat
              </button>
            </div>
          )}
        </div>

        {/* Call Tips */}
        {callStatus === 'connected' && (
          <div className="mt-6 text-center">
            <p className="text-white/50 text-sm">
              {isMuted ? '🔇 Microphone is muted' : '🎤 Microphone is on'} • {isSpeakerOn ? '🔊 Speaker is on' : '🔇 Speaker is off'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}