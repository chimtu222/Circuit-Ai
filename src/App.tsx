import { getRandomCreatorImages } from "./creatorImages";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Background from "./components/Background";
import AlarmClockWidget, { type CircuitAlarm } from "./components/AlarmClockWidget";
import WeatherWidget from "./components/WeatherWidget";
import GlassBlob from "./components/GlassBlob";
import ImageDeck from "./components/ImageDeck";
import CircuitLayout from "./components/CircuitLayout";
import MusicPlayerBar from "./components/MusicPlayerBar";
import HistoryDrawer from "./components/HistoryDrawer";
import SettingsPanel from "./components/SettingsPanel";
import YouTubePlayer from "./components/YouTubePlayer";
import type { YouTubeTrack } from "./youtube";

type HistoryItem = {
  id: string;
  question: string;
  answer: string;
  images?: string[];
  messages?: ChatMessage[];
  updatedAt: number;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("Circuit sleeping. Say Hi Circuit first.");

  const sendButtonRef = useRef<HTMLButtonElement | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [alarms, setAlarms] = useState<CircuitAlarm[]>([]);
  const alarmTimersRef = useRef<Record<string, number>>({});
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isAwake, setIsAwake] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState(
    localStorage.getItem("circuit_selected_voice") || ""
  );

  const [showPlayer, setShowPlayer] = useState(false);
  const [playerTitle, setPlayerTitle] = useState("");
  const [playerThumbnail, setPlayerThumbnail] = useState("");
  const [isPlayerPlaying, setIsPlayerPlaying] = useState(false);

  const [playlist, setPlaylist] = useState<YouTubeTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentVideoId, setCurrentVideoId] = useState("");
  const [playerCommand, setPlayerCommand] = useState<{
    type: "play" | "pause";
    id: number;
  } | null>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  function createSessionId() {
    return `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState(createSessionId);

  const lastSpokenTextRef = useRef("");
  const lastIntentRef = useRef("");
  const lastWeatherCityRef = useRef("Bengaluru");

  useEffect(() => {
    function loadVoices() {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    }

    loadVoices();

    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  function saveHistory(
    questionText: string,
    answerText: string,
    imageList: string[] = [],
    messageList: ChatMessage[] = []
  ) {
    setHistory((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === currentSessionId);

      const sessionItem: HistoryItem = {
        id: currentSessionId,
        question: questionText,
        answer: answerText,
        images: imageList,
        messages: messageList.length > 0 ? messageList : undefined,
        updatedAt: Date.now()
      };

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...sessionItem
        };

        return updated
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, 25);
      }

      return [sessionItem, ...prev].slice(0, 25);
    });
  }

  function startNewChat() {
    setCurrentSessionId(createSessionId());
    setConversation([]);
    setImages([]);
    setQuestion("");
    setAnswer("Fresh chat started bhidu. Bol kya karna hai?");
  }

  function extractImageQuery(text: string) {
    return text
      .replace(/show me/gi, "")
      .replace(/show/gi, "")
      .replace(/image of/gi, "")
      .replace(/photo of/gi, "")
      .replace(/picture of/gi, "")
      .replace(/images of/gi, "")
      .replace(/photos of/gi, "")
      .trim();
  }

  function shouldShowImage(query: string) {
    const q = query.toLowerCase();

    return (
      q.includes("show") ||
      q.includes("image") ||
      q.includes("photo") ||
      q.includes("picture")
    );
  }
  function isCreatorQuestion(query: string) {
    const q = query.toLowerCase();

    const hasCreatorName =
      q.includes("subramanyam") ||
      q.includes("subramanyam panda") ||
      q.includes("creator") ||
      q.includes("owner");

    const hasCircuitOwnershipIntent =
      q.includes("who created circuit") ||
      q.includes("who created you") ||
      q.includes("who built you") ||
      q.includes("tereko kisne banaya") ||
      q.includes("tujhe kisne banaya") ||
      q.includes("kisne banaya tujhe") ||
      q.includes("who made circuit") ||
      q.includes("who owns circuit") ||
      q.includes("creator of circuit") ||
      q.includes("owner of circuit") ||
      q.includes("who is the creator") ||
      q.includes("who is your creator") ||
      q.includes("who is subramanyam") ||
      q.includes("who is subramanyam panda");

    const hasImageIntent =
      q.includes("image") ||
      q.includes("images") ||
      q.includes("photo") ||
      q.includes("photos") ||
      q.includes("picture") ||
      q.includes("pictures") ||
      q.includes("pic") ||
      q.includes("pics");

    const hasSelfIntent =
      q.includes("my images ") ||
      q.includes("mine") ||
      q.includes("show me my pics ") ||
      q.includes("subramanyam") ||
      q.includes("subramanyam's") ||
      q.includes("subramanyam panda");
    q.includes("Subramanyam panda");

    return hasCircuitOwnershipIntent || (hasImageIntent && (hasSelfIntent || hasCreatorName));
  }


  function prepareSpeechText(text: string) {
    return text
      .replaceAll("Odisha", "O-dee-sha")
      .replaceAll("odisha", "O-dee-sha")
      .replaceAll("Bhubaneswar", "Bhoo-buh-nesh-war")
      .replaceAll("Bhubaneshwar", "Bhoo-buh-nesh-war")
      .replaceAll("Bengaluru", "Ben-guh-loo-roo")
      .replaceAll("**", "")
      .replaceAll("<br><br>", ". ")
      .replaceAll("<br>", ". ")
      .replaceAll("&lt;br&gt;&lt;br&gt;", ". ")
      .replaceAll("&lt;br&gt;", ". ")
      .replace(/[#*_`]/g, "");
  }

  function getCircuitVoice() {
    const voices = window.speechSynthesis.getVoices();

    if (selectedVoiceName) {
      const selectedVoice = voices.find((voice) => voice.name === selectedVoiceName);

      if (selectedVoice) {
        return selectedVoice;
      }
    }

    const preferredVoice =
      voices.find(
        (voice) =>
          voice.lang === "en-IN" &&
          voice.name.toLowerCase().includes("rishi")
      ) ||
      voices.find(
        (voice) =>
          voice.lang === "en-IN" &&
          voice.name.toLowerCase().includes("male")
      ) ||
      voices.find((voice) => voice.name.toLowerCase().includes("daniel")) ||
      voices.find((voice) => voice.name.toLowerCase().includes("alex")) ||
      voices.find((voice) => voice.name.toLowerCase().includes("aaron")) ||
      voices.find((voice) => voice.lang === "en-IN") ||
      voices.find((voice) => voice.lang.startsWith("en"));

    return preferredVoice || null;
  }

  function speak(text: string) {
    if (isMuted) {
      return;
    }

    window.speechSynthesis.cancel();

    lastSpokenTextRef.current = text;
    setIsSpeechPaused(false);

    const speech = new SpeechSynthesisUtterance(prepareSpeechText(text));

    speech.lang = "en-IN";
    speech.rate = 0.92;
    speech.pitch = 0.86;
    speech.volume = 1;

    const preferredVoice = getCircuitVoice();

    if (preferredVoice) {
      speech.voice = preferredVoice;
    }

    speech.onend = () => {
      setIsSpeechPaused(false);
    };

    speech.onerror = () => {
      setIsSpeechPaused(false);
    };

    window.speechSynthesis.speak(speech);
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    setIsSpeechPaused(false);
  }

  function toggleSpeechPause() {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsSpeechPaused(false);
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsSpeechPaused(true);
      return;
    }

    if (lastSpokenTextRef.current) {
      speak(lastSpokenTextRef.current);
    }
  }

  function isWakePhrase(text: string) {
    const q = text.toLowerCase();

    return (
      q.includes("hi circuit") ||
      q.includes("hi") ||
      q.includes("hello bhidu") ||
      q.includes("hey circuit") ||
      q.includes("hello circuit") ||
      q.includes("hii gandu") ||
      q.includes("high circuit") ||
      q.includes("circuit")
    );
  }

  function isPlayCommand(text: string) {
    const q = text.toLowerCase();

    return (
      q.startsWith("play ") ||
      q.includes("play song") ||
      q.includes("play music") ||
      q.includes("gaana chala") ||
      q.includes("song chala") ||
      q.includes("music chala") ||
      q.includes("baja") ||
      q.includes("chala de")
    );
  }

  function extractPlayQuery(text: string) {
    return text
      .replace(/^play/i, "")
      .replace(/play song/gi, "")
      .replace(/play music/gi, "")
      .replace(/gaana chala/gi, "")
      .replace(/song chala/gi, "")
      .replace(/music chala/gi, "")
      .replace(/baja/gi, "")
      .replace(/chala de/gi, "")
      .trim();
  }

  async function handlePlayCommand(text: string) {
    const playQuery = extractPlayQuery(text);

    if (!playQuery) {
      const msg = "Kya play karna hai bhidu? Song ka naam bol.";
      setAnswer(msg);
      saveHistory(text, msg);
      speak(msg);
      return;
    }

    try {
      const { searchYouTubeVideos, getYouTubeSearchUsage } = await import("./youtube");

      const currentUsage = getYouTubeSearchUsage();

      if (currentUsage.count >= currentUsage.limit) {
        const msg =
          "Bhai ab aur gaana sunega aaj toh paisa/limit ka scene ho jayega. YouTube search limit 99/100 hit ho gaya.";

        setAnswer(msg);
        saveHistory(text, msg);
        speak(msg);
        return;
      }

      const results = await searchYouTubeVideos(playQuery);

      const updatedUsage = getYouTubeSearchUsage();

      if (results.length === 0) {
        const msg = `Arey bhidu, "${playQuery}" ke liye koi playable result nahi mila.`;

        setAnswer(msg);
        saveHistory(text, msg);
        speak(msg);
        return;
      }

      const firstTrack = results[0];

      setPlaylist(results);
      setCurrentTrackIndex(0);
      setCurrentVideoId(firstTrack.videoId);
      setPlayerTitle(firstTrack.title);
      setPlayerThumbnail(firstTrack.thumbnail);
      setShowPlayer(true);
      setIsPlayerPlaying(true);
      setPlayerCommand({
        type: "play",
        id: Date.now()
      });

      const msg = `Theek hai bhidu, "${firstTrack.title}" play kar raha hoon. YouTube API usage: ${updatedUsage.count}/${updatedUsage.limit}.`;

      setAnswer(msg);
      saveHistory(text, msg);
      speak(msg);
    } catch (error) {
      console.error(error);

      const errorText = String(error);

      if (errorText.includes("YOUTUBE_LIMIT_REACHED")) {
        const msg =
          "Bhai ab aur gaana sunega aaj toh paisa kharcha ho jayega, YouTube search limit 99/100 hit ho gaya.";

        setAnswer(msg);
        saveHistory(text, msg);
        speak(msg);
        return;
      }

      if (errorText.includes("YOUTUBE_API_KEY_MISSING")) {
        const msg = "YouTube API key missing hai bhidu. .env.local check kar.";

        setAnswer(msg);
        saveHistory(text, msg);
        speak(msg);
        return;
      }

      const msg =
        "YouTube player setup mein issue aa gaya bhidu. YouTube API key/API enablement check kar.";

      setAnswer(msg);
      saveHistory(text, msg);
      speak(msg);
    }
  }

  function handlePlayerPlayPause() {
    if (!currentVideoId) {
      return;
    }

    if (isPlayerPlaying) {
      setIsPlayerPlaying(false);
      setPlayerCommand({
        type: "pause",
        id: Date.now()
      });

      setAnswer(`Paused "${playerTitle}"`);
      return;
    }

    setIsPlayerPlaying(true);
    setPlayerCommand({
      type: "play",
      id: Date.now()
    });

    setAnswer(`Playing "${playerTitle}"`);
  }

  function handlePlayerNext() {
    if (playlist.length === 0) {
      return;
    }

    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    const nextTrack = playlist[nextIndex];

    setCurrentTrackIndex(nextIndex);
    setCurrentVideoId(nextTrack.videoId);
    setPlayerTitle(nextTrack.title);
    setPlayerThumbnail(nextTrack.thumbnail);
    setIsPlayerPlaying(true);
    setPlayerCommand({
      type: "play",
      id: Date.now()
    });

    setAnswer(`Next track: "${nextTrack.title}"`);
  }

  function handlePlayerPrevious() {
    if (playlist.length === 0) {
      return;
    }

    const previousIndex =
      currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;

    const previousTrack = playlist[previousIndex];

    setCurrentTrackIndex(previousIndex);
    setCurrentVideoId(previousTrack.videoId);
    setPlayerTitle(previousTrack.title);
    setPlayerThumbnail(previousTrack.thumbnail);
    setIsPlayerPlaying(true);
    setPlayerCommand({
      type: "play",
      id: Date.now()
    });

    setAnswer(`Previous track: "${previousTrack.title}"`);
  }

  function extractWeatherCity(text: string) {
    const q = text.toLowerCase();

    if (q.includes("bhubaneshwar") || q.includes("bhubaneswar")) {
      return "Bhubaneswar";
    }

    if (q.includes("odisha")) {
      return "Bhubaneswar";
    }

    if (q.includes("bangalore") || q.includes("bengaluru")) {
      return "Bengaluru";
    }

    if (q.includes("mumbai")) {
      return "Mumbai";
    }

    if (q.includes("delhi")) {
      return "Delhi";
    }

    if (q.includes("pune")) {
      return "Pune";
    }

    if (q.includes("hyderabad")) {
      return "Hyderabad";
    }

    if (q.includes("chennai")) {
      return "Chennai";
    }

    if (q.includes("kolkata")) {
      return "Kolkata";
    }

    return "";
  }

  function isWeatherQuestion(text: string) {
    const q = text.toLowerCase();

    const hasWeatherKeyword =
      q.includes("weather") ||
      q.includes("mausam") ||
      q.includes("temperature") ||
      q.includes("rain") ||
      q.includes("baarish");

    const city = extractWeatherCity(text);

    const isWeatherFollowUp = lastIntentRef.current === "weather" && Boolean(city);

    return hasWeatherKeyword || isWeatherFollowUp;
  }
  function playAlarmSound() {
    try {
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause();
        alarmAudioRef.current.currentTime = 0;
      }

      const audio = new Audio("./alarm.wav");
      audio.loop = true;
      audio.volume = 0.85;

      alarmAudioRef.current = audio;

      audio.play().catch(() => {
        playFallbackBeep();
      });
    } catch {
      playFallbackBeep();
    }
  }

  function playFallbackBeep() {
    const audioContext = new AudioContext();

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 850;

    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.26, audioContext.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.55);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.6);
  }

  function stopAlarmSound() {
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
      alarmAudioRef.current = null;
    }
  }

  function dismissAlarm(id: string) {
    setAlarms((prev) => prev.filter((alarm) => alarm.id !== id));
    stopAlarmSound();
  }

  function stopAllAlarms() {
    Object.values(alarmTimersRef.current).forEach((timerId) => {
      window.clearTimeout(timerId);
    });

    alarmTimersRef.current = {};
    setAlarms([]);
    stopAlarmSound();
  }

  function getReminderLabel(text: string) {
    const cleaned = text
      .replace(/set\s+(a\s+)?/gi, "")
      .replace(/reminder/gi, "")
      .replace(/alarm/gi, "")
      .replace(/timer/gi, "")
      .replace(/\b(in|for|at)\b\s+\d{1,2}([:.]\d{1,2})?\s*(am|pm|seconds?|secs?|minutes?|mins?|hours?|hrs?)?/gi, "")
      .replace(/remind me to/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    if (cleaned.length > 0) {
      return cleaned;
    }

    return "your reminder";
  }

  function parseDurationAlarm(text: string) {
    const q = text.toLowerCase();

    const durationMatch = q.match(
      /\b(?:in|for)\s+(\d+)\s*(seconds?|secs?|sec|minutes?|mins?|min|hours?|hrs?|hr)\b/i
    );

    if (!durationMatch) {
      return null;
    }

    const amount = Number(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();

    let milliseconds = amount * 1000;

    if (unit.startsWith("min")) {
      milliseconds = amount * 60 * 1000;
    }

    if (unit.startsWith("hr") || unit.startsWith("hour")) {
      milliseconds = amount * 60 * 60 * 1000;
    }

    return Date.now() + milliseconds;
  }

  function parseClockAlarm(text: string) {
    const q = text.toLowerCase();

    const timeMatch = q.match(/\bat\s+(\d{1,2})(?:\d{1,2})?\s*(am|pm)\b/i);

    if (!timeMatch) {
      return null;
    }

    let hour = Number(timeMatch[1]);
    const minute = timeMatch[2] ? Number(timeMatch[2]) : 0;
    const meridian = timeMatch[3].toLowerCase();

    if (meridian === "pm" && hour < 12) {
      hour += 12;
    }

    if (meridian === "am" && hour === 12) {
      hour = 0;
    }

    const alarmDate = new Date();
    alarmDate.setHours(hour, minute, 0, 0);

    if (alarmDate.getTime() <= Date.now()) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }

    return alarmDate.getTime();
  }

  function parseCircuitReminder(text: string) {
    const q = text.toLowerCase();

    const hasAlarmIntent =
      q.includes("reminder") ||
      q.includes("remind me") ||
      q.includes("alarm") ||
      q.includes("timer");

    if (!hasAlarmIntent) {
      return null;
    }

    const fireAt = parseDurationAlarm(text) || parseClockAlarm(text);

    if (!fireAt) {
      return null;
    }

    const type: "alarm" | "reminder" = q.includes("alarm") ? "alarm" : "reminder";
    const label = getReminderLabel(text);

    return {
      type,
      label,
      fireAt
    };
  }

  function scheduleCircuitAlarm(
    rawText: string,
    parsedAlarm: {
      type: "alarm" | "reminder";
      label: string;
      fireAt: number;
    }
  ) {
    const id = `alarm-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const alarm: CircuitAlarm = {
      id,
      label: parsedAlarm.label,
      fireAt: parsedAlarm.fireAt,
      type: parsedAlarm.type,
      isRinging: false
    };

    setAlarms((prev) => [...prev, alarm].sort((a, b) => a.fireAt - b.fireAt));

    const delay = Math.max(0, parsedAlarm.fireAt - Date.now());

    const timerId = window.setTimeout(() => {
      setAlarms((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
              ...item,
              isRinging: true
            }
            : item
        )
      );

      playAlarmSound();

      const ringMessage = `Bhidu, ${parsedAlarm.label} baj gaya. Tujhe kuch karna tha na?`;

      setAnswer(ringMessage);
      speak(ringMessage);
    }, delay);

    alarmTimersRef.current[id] = timerId;

    const alarmTimeText = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).format(new Date(parsedAlarm.fireAt));

    const response = `Done bhidu, ${parsedAlarm.type} set kar diya for ${alarmTimeText}: ${parsedAlarm.label}`;

    const nextConversation = [
      ...conversation,
      {
        role: "user" as const,
        content: rawText
      },
      {
        role: "assistant" as const,
        content: response
      }
    ].slice(-12);

    setConversation(nextConversation);
    setAnswer(response);
    saveHistory(rawText, response, [], nextConversation);
    speak(response);
  }

  async function askCircuit(inputText?: string) {
    const q = (inputText ?? question).trim();

    if (!q) {
      return;
    }

    setQuestion("");
    stopSpeaking();

    if (!isAwake) {
      if (isWakePhrase(q)) {
        setIsAwake(true);

        const greeting = "Haan bhidu, Circuit online hai. Bol kya chahiye?";

        setAnswer(greeting);
        saveHistory(q, greeting);
        speak(greeting);
        return;
      }

      const msg = "Pehle mujhe wake karo bhidu. Type or say: Hi Circuit";

      setAnswer(msg);
      saveHistory(q, msg);
      return;
    }

    if (
      q.toLowerCase().includes("new chat") ||
      q.toLowerCase().includes("clear chat") ||
      q.toLowerCase().includes("reset memory") ||
      q.toLowerCase().includes("forget this")
    ) {
      startNewChat();

      const msg = "Done bhidu, fresh chat start kar diya.";
      setAnswer(msg);
      saveHistory(q, msg);
      speak(msg);
      return;
    }

    if (
      q.toLowerCase().includes("stop") ||
      q.toLowerCase().includes("chup") ||
      q.toLowerCase().includes("cancel")
    ) {
      stopSpeaking();

      const msg = "Theek hai bhidu, chup ho gaya.";

      setAnswer(msg);
      saveHistory(q, msg);
      return;
    }

    if (
      q.toLowerCase().includes("sleep") ||
      q.toLowerCase().includes("so ja") ||
      q.toLowerCase().includes("bye circuit")
    ) {
      stopSpeaking();
      setIsAwake(false);
      setConversation([]);
      setImages([]);

      const msg = "Circuit sogya bhidu. Wapas bulaana ho toh Hi Circuit bol.";

      setAnswer(msg);
      saveHistory(q, msg);
      return;
    }
    if (isCreatorQuestion(q)) {
      const creatorAnswer =
        "Subramanyam Panda is the creator and owner of Circuit AI. He built Circuit as a futuristic AI assistant with multi-agent support, voice interaction,Reminder ,Pexels image cards, music controls, chat memory, and a frosted glass interface.";

      const creatorImages = getRandomCreatorImages(8);

      const nextConversation = [
        ...conversation,
        {
          role: "user" as const,
          content: q
        },
        {
          role: "assistant" as const,
          content: creatorAnswer
        }
      ].slice(-12);

      setConversation(nextConversation);
      setImages(creatorImages);
      setAnswer(creatorAnswer);
      saveHistory(q, creatorAnswer, creatorImages, nextConversation);
      speak(creatorAnswer);

      return;
    }
    const parsedAlarm = parseCircuitReminder(q);
    if (parsedAlarm) {
      scheduleCircuitAlarm(q, parsedAlarm);

      return;

    }
    try {
      setIsThinking(true);

      if (isPlayCommand(q)) {
        await handlePlayCommand(q);
        return;
      }

      if (isWeatherQuestion(q)) {
        const { getWeatherForCity } = await import("./weather");

        const detectedCity = extractWeatherCity(q);
        const cityToUse = detectedCity || lastWeatherCityRef.current || "Bengaluru";

        const weatherResponse = await getWeatherForCity(cityToUse);

        lastIntentRef.current = "weather";
        lastWeatherCityRef.current = cityToUse;

        setImages([]);
        setAnswer(weatherResponse);
        saveHistory(q, weatherResponse);
        speak(weatherResponse);
        return;
      }

      lastIntentRef.current = "general";

      const { askCircuitAI } = await import("./ai/providerManager");

      const nextConversation = [
        ...conversation,
        {
          role: "user" as const,
          content: q
        }
      ].slice(-12);

      setConversation(nextConversation);

      const response = await askCircuitAI(nextConversation);

      const updatedConversation = [
        ...nextConversation,
        {
          role: "assistant" as const,
          content: response
        }
      ].slice(-12);

      setConversation(updatedConversation);

      let imageResults: string[] = [];

      if (shouldShowImage(q)) {
        const { searchImage } = await import("./imageSearch");

        const imageQuery = extractImageQuery(q);
        imageResults = await searchImage(imageQuery);
      }

      setImages(imageResults);
      setAnswer(response);
      saveHistory(q, response, imageResults, updatedConversation);
      speak(response);
    } catch (error) {
      console.error(error);

      const msg = "Error bhidu: " + String(error);

      setImages([]);
      setAnswer(msg);
      saveHistory(q, msg);
    } finally {
      setIsThinking(false);
      setQuestion("");
    }
  }

  const startListening = () => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      setAnswer("Speech recognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      stopSpeaking();
      setIsListening(true);
      setAnswer("Listening bhidu...");
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;

      setIsListening(false);
      setQuestion(text);

      setTimeout(() => {
        askCircuit(text);
      }, 150);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setAnswer("Mic Error: " + event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const cornerButtonStyle: CSSProperties = {
    position: "fixed",
    top: "34px",
    width: "58px",
    height: "58px",
    borderRadius: "50%",
    border: "1px solid rgba(183,218,244,0.24)",
    color: "rgba(213,235,250,0.92)",
    background:
      "radial-gradient(circle at 35% 25%, rgba(180,225,255,0.17), rgba(8,25,40,0.45) 65%)",
    boxShadow:
      "inset 0 1px 1px rgba(255,255,255,0.10), 0 8px 30px rgba(0,0,0,0.34)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    cursor: "pointer",
    zIndex: 200,
    lineHeight: 1
  };

  const controlButtonStyle: CSSProperties = {
    width: "58px",
    height: "58px",
    minWidth: "58px",
    borderRadius: "50%",
    border: "1px solid rgba(172,215,241,0.19)",
    color: "rgba(210,233,249,0.86)",
    background:
      "radial-gradient(circle at 35% 25%, rgba(122,181,218,0.18), rgba(7,23,37,0.58) 70%)",
    boxShadow:
      "inset 0 1px 1px rgba(255,255,255,0.09), 0 12px 35px rgba(0,0,0,0.35)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    cursor: "pointer",
    fontSize: "22px"
  };

  const micButtonStyle: CSSProperties = {
    ...controlButtonStyle,
    border: isListening
      ? "2px solid rgba(80,170,255,0.95)"
      : controlButtonStyle.border,
    boxShadow: isListening
      ? "0 0 0 4px rgba(80,170,255,0.22), 0 0 34px rgba(80,170,255,0.75)"
      : controlButtonStyle.boxShadow,
    background: isListening
      ? "radial-gradient(circle at 35% 25%, rgba(96,190,255,0.42), rgba(8,25,40,0.64) 70%)"
      : controlButtonStyle.background
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif"
      }}
    >
      <Background />
      <style>
  {`
    @keyframes circuitSendOrbit {
      0% {
        transform: rotate(0deg);
        opacity: 0.35;
      }

      45% {
        opacity: 0.85;
      }

      100% {
        transform: rotate(360deg);
        opacity: 0.35;
      }
    }

    @keyframes circuitSendBreath {
      0% {
        box-shadow:
          inset 0 1px 1px rgba(255,255,255,0.12),
          inset 0 -1px 2px rgba(126,242,255,0.08),
          0 12px 34px rgba(0,0,0,0.35),
          0 0 0 rgba(126,242,255,0);
      }

      50% {
        box-shadow:
          inset 0 1px 1px rgba(255,255,255,0.15),
          inset 0 -1px 2px rgba(126,242,255,0.14),
          0 14px 38px rgba(0,0,0,0.38),
          0 0 18px rgba(126,242,255,0.18);
      }

      100% {
        box-shadow:
          inset 0 1px 1px rgba(255,255,255,0.12),
          inset 0 -1px 2px rgba(126,242,255,0.08),
          0 12px 34px rgba(0,0,0,0.35),
          0 0 0 rgba(126,242,255,0);
      }
    }

    @keyframes circuitArrowPulse {
      0% {
        transform: translateX(0) scale(1);
      }

      50% {
        transform: translateX(2px) scale(1.05);
      }

      100% {
        transform: translateX(0) scale(1);
      }
    }
  `}
</style>
      <style>
        {`
    @keyframes circuitSendPulse {
      0% {
        box-shadow:
          inset 0 1px 1px rgba(255,255,255,0.14),
          0 12px 36px rgba(33,170,235,0.22),
          0 0 0 rgba(75,210,255,0);
      }

      50% {
        box-shadow:
          inset 0 1px 1px rgba(255,255,255,0.18),
          0 14px 42px rgba(33,170,235,0.34),
          0 0 28px rgba(75,210,255,0.28);
      }

      100% {
        box-shadow:
          inset 0 1px 1px rgba(255,255,255,0.14),
          0 12px 36px rgba(33,170,235,0.22),
          0 0 0 rgba(75,210,255,0);
      }
    }

    @keyframes circuitSendArrowMove {
      0% {
        transform: translateX(0);
      }

      50% {
        transform: translateX(3px);
      }

      100% {
        transform: translateX(0);
      }
    }

    .circuit-send-button {
      width: 58px;
      height: 58px;
      min-width: 58px;
      border-radius: 50%;
      border: 1px solid rgba(172,215,241,0.24);
      color: rgba(235,248,255,0.96);
      background:
        radial-gradient(circle at 35% 25%, rgba(92,205,255,0.62), rgba(24,98,150,0.72));
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      overflow: hidden;
      position: relative;
      padding: 0;
      transition:
        width 0.24s ease,
        border-radius 0.24s ease,
        background 0.24s ease,
        transform 0.16s ease;
      animation: circuitSendPulse 2.2s infinite;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }

    .circuit-send-button:hover {
      width: 126px;
      border-radius: 24px;
      background:
        linear-gradient(135deg, rgba(92,205,255,0.72), rgba(24,98,150,0.78));
    }

    .circuit-send-button:active {
      transform: translate(2px, 2px) scale(0.97);
    }

    .circuit-send-icon {
      width: 58px;
      height: 58px;
      min-width: 58px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 21px;
      transition: transform 0.24s ease;
      animation: circuitSendArrowMove 1.6s infinite ease-in-out;
    }

    .circuit-send-button:hover .circuit-send-icon {
      transform: translateX(4px);
      animation: none;
    }

    .circuit-send-label {
      position: absolute;
      right: 22px;
      opacity: 0;
      transform: translateX(16px);
      font-size: 16px;
      font-weight: 650;
      letter-spacing: 0.2px;
      color: rgba(245,252,255,0.96);
      transition:
        opacity 0.22s ease,
        transform 0.22s ease;
      pointer-events: none;
      white-space: nowrap;
    }

    .circuit-send-button:hover .circuit-send-label {
      opacity: 1;
      transform: translateX(0);
    }
  `}
      </style>
      <ImageDeck
        images={images}
        onClose={() => setImages([])}
      />
      <AlarmClockWidget
        alarms={alarms}
        onDismiss={dismissAlarm}
        onStopAll={stopAllAlarms}
      />
      <WeatherWidget />

      {currentVideoId && (
        <YouTubePlayer
          videoId={currentVideoId}
          command={playerCommand}
        />
      )}

      {showPlayer && (
        <MusicPlayerBar
          title={playerTitle}
          thumbnail={playerThumbnail}
          isPlaying={isPlayerPlaying}
          onPlayPause={handlePlayerPlayPause}
          onNext={handlePlayerNext}
          onPrevious={handlePlayerPrevious}
          onClose={() => {
            setShowPlayer(false);
            setIsPlayerPlaying(false);
            setCurrentVideoId("");
            setPlaylist([]);
            setPlayerThumbnail("");
            setPlayerCommand({
              type: "pause",
              id: Date.now()
            });
          }}
        />
      )}

      <button
        onClick={() => setShowHistory(true)}
        aria-label="History"
        style={{
          ...cornerButtonStyle,
          left: "36px",
          fontSize: "22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <i className="fa fa-history" aria-hidden="true" />
      </button>

      <button
        onClick={() => setShowSettings(true)}
        aria-label="Settings"
        style={{
          ...cornerButtonStyle,
          right: "36px",
          fontSize: "30px"
        }}
      >
        ⛯
      </button>

      <GlassBlob>
        <CircuitLayout
          answer={answer}
          messages={conversation}
          isAwake={isAwake}
          isThinking={isThinking}
          onNewChat={startNewChat}
        />
      </GlassBlob>

      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: "64px",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          zIndex: 300
        }}
      >
        <div
          style={{
            width: "min(760px, 56vw)",
            height: "74px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px",
            borderRadius: "51px",
            border: "1px solid rgba(141,199,234,0.22)",
            background:
              "linear-gradient(180deg, rgba(17,42,60,0.38), rgba(4,17,29,0.62))",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.07), 0 16px 45px rgba(0,0,0,0.34), 0 0 34px rgba(61,224,255,0.08)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            gap: "12px"
          }}
        >
          <button
            onClick={startListening}
            aria-label="Voice input"
            style={micButtonStyle}
          >
            <svg
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="9"
                y="3"
                width="6"
                height="11"
                rx="3"
                stroke="rgba(220,245,255,0.9)"
                strokeWidth="1.7"
              />
              <path
                d="M5.5 11.5C5.5 15.1 8.4 18 12 18C15.6 18 18.5 15.1 18.5 11.5"
                stroke="rgba(220,245,255,0.9)"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <path
                d="M12 18V21"
                stroke="rgba(220,245,255,0.9)"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <path
                d="M9 21H15"
                stroke="rgba(220,245,255,0.9)"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                askCircuit();
              }
            }}
            placeholder="Ask anything..."
            style={{
              flex: 1,
              height: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              color: "rgba(235,246,255,0.92)",
              fontSize: "20px",
              fontWeight: 350
            }}
          />

          <button
  ref={sendButtonRef}
  onClick={() => {
  if (!question.trim()|| isThinking) {
    return;
  }
  askCircuit();
}}
  aria-label="Ask Circuit"
  style={{
    width: "58px",
    height: "58px",
    minWidth: "58px",
    borderRadius: "50%",
    border: "1px solid rgba(172,215,241,0.22)",
    position: "relative",
    overflow: "hidden",
    cursor: "pointer",
    color: "rgba(230,247,255,0.94)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(145deg, rgba(20,50,73,0.58), rgba(4,18,30,0.78))",
    backdropFilter: "blur(24px) saturate(150%)",
    WebkitBackdropFilter: "blur(24px) saturate(150%)",
    animation: "circuitSendBreath 2.6s ease-in-out infinite"
  }}
>

  <span
    style={{
      position: "absolute",
      width: "82px",
      height: "82px",
      borderRadius: "50%",
      background:
        "conic-gradient(from 0deg, transparent 0deg, transparent 55deg, rgba(126,242,255,0.52) 82deg, rgba(255,255,255,0.72) 96deg, rgba(126,242,255,0.28) 112deg, transparent 150deg, transparent 360deg)",
      animation: "circuitSendOrbit 7.8s linear infinite",
      filter: "blur(0.2px)",
      pointerEvents: "none"
    }}
  />

  <span
    style={{
      position: "relative",
      zIndex: 2,
      fontSize: "25px",
      lineHeight: 1,
      textShadow:"0 0 10px rgba(126,242,255,0.42), 0 0 22px rgba(126,242,255,0.20)",
    }}
  >
    ➤
  </span>
</button>
        </div>

        <button
          onClick={toggleSpeechPause}
          aria-label="Pause or resume speech"
          style={controlButtonStyle}
        >
          {isSpeechPaused ? "▶" : "⏸"}
        </button>
      </div>

      <HistoryDrawer
        open={showHistory}
        history={history}
        onClose={() => setShowHistory(false)}
        onClear={() => {
          setHistory([]);
          setImages([]);
        }}
        onSelect={(item) => {
          const selectedItem = item as HistoryItem;

          setCurrentSessionId(selectedItem.id);
          setAnswer(selectedItem.answer);
          setQuestion(selectedItem.question);
          setImages(selectedItem.images || []);

          if (selectedItem.messages && selectedItem.messages.length > 0) {
            setConversation(selectedItem.messages);
          } else {
            setConversation([
              {
                role: "user",
                content: selectedItem.question
              },
              {
                role: "assistant",
                content: selectedItem.answer
              }
            ]);
          }

          setShowHistory(false);
        }}
      />

      <SettingsPanel
        open={showSettings}
        isMuted={isMuted}
        availableVoices={availableVoices}
        selectedVoiceName={selectedVoiceName}
        onVoiceChange={(voiceName) => {
          setSelectedVoiceName(voiceName);
          localStorage.setItem("circuit_selected_voice", voiceName);
        }}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}

export default App;
