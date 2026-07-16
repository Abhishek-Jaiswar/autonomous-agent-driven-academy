"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { BrainCircuit, Loader2, Send, Terminal, LogOut, CheckCircle, GraduationCap, ChevronRight, UserPlus, LogIn } from "lucide-react";

import { useSignupMutation, useLoginMutation, useStartCurriculumMutation } from "@/lib/redux/api/apiSlice";
import { setCredentials, logout } from "@/lib/redux/slices/authSlice";
import type { RootState } from "@/lib/redux/store";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Redux Auth Selector
  const auth = useSelector((state: RootState) => state.auth);

  // API Mutation Hooks
  const [signupMut, { isLoading: isSigningUp }] = useSignupMutation();
  const [loginMut, { isLoading: isLoggingIn }] = useLoginMutation();
  const [startCurriculumMut, { isLoading: isStartingSession }] = useStartCurriculumMutation();

  // Auth Forms State
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Goal Setup State
  const [goalText, setGoalText] = useState("");
  const [category, setCategory] = useState("job_project");
  const [durationDays, setDurationDays] = useState("14");
  const [goalError, setGoalError] = useState("");

  // WebSocket Chat Interview State
  const [goalId, setGoalId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(4);
  const [answerText, setAnswerText] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [logs, setLogs] = useState<Array<{ agentName: string; message: string; timestamp: Date }>>([]);
  const [synthesis, setSynthesis] = useState<any | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Restore Goal ID from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedGoalId = localStorage.getItem("astralearn_goal_id");
      if (savedGoalId) {
        setGoalId(savedGoalId);
      }
    }
  }, []);

  // Handle User Signup
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await signupMut({ email, password }).unwrap();
      if (res.success && res.data) {
        // Automatically log in after successful signup
        const loginRes = await loginMut({ email, password }).unwrap();
        dispatch(setCredentials({ user: loginRes.data.user, token: loginRes.data.token }));
      }
    } catch (err: any) {
      setAuthError(err.data?.error || "Signup failed. Try again.");
    }
  }

  // Handle User Login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await loginMut({ email, password }).unwrap();
      if (res.success && res.data) {
        dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
      }
    } catch (err: any) {
      setAuthError(err.data?.error || "Invalid email or password.");
    }
  }

  // Initialize Learning Goal Session
  async function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault();
    setGoalError("");
    if (!goalText.trim() || goalText.trim().length < 10) {
      setGoalError("Goal description must be at least 10 characters long.");
      return;
    }

    try {
      const res = await startCurriculumMut({
        goalText: goalText.trim(),
        category,
        durationDays: parseInt(durationDays, 10),
      }).unwrap();

      if (res.success && res.data?.goalId) {
        const newGoalId = res.data.goalId;
        setGoalId(newGoalId);
        if (typeof window !== "undefined") {
          localStorage.setItem("astralearn_goal_id", newGoalId);
        }
      }
    } catch (err: any) {
      setGoalError(err.data?.error || "Failed to initialize learning goal.");
    }
  }

  // Manage Socket.io connection during interview phase
  useEffect(() => {
    if (!goalId || !auth.token) return;

    // Connect to backend WebSocket server
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000";
    const socketConn = io(socketUrl, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socketConn.on("connect", () => {
      setIsConnected(true);
      // Join Room
      socketConn.emit("join-session", goalId);
      // Start the Interview Node
      socketConn.emit("start-interview", { goalId });
    });

    socketConn.on("disconnect", () => {
      setIsConnected(false);
    });

    // Listen to Counselor dynamic question broadcast
    socketConn.on("interview-question", (data: { question: string; questionIndex: number; totalQuestions: number }) => {
      setCurrentQuestion(data.question);
      setQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setIsSubmittingAnswer(false);
    });

    // Listen to background agent logs
    socketConn.on("agent-log", (data: { agentName: string; message: string }) => {
      setLogs((prev) => [...prev, { ...data, timestamp: new Date() }]);
    });

    // Listen to completed synthesis baseline
    socketConn.on("profile-ready", (data: any) => {
      setSynthesis(data);
      setCurrentQuestion(null);
    });

    setSocket(socketConn);

    return () => {
      socketConn.disconnect();
    };
  }, [goalId, auth.token]);

  // Auto-scroll logs
  useEffect(() => {
    logContainerRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Submit Q&A Answer
  function handleSubmitAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!answerText.trim() || !socket || !goalId) return;

    setIsSubmittingAnswer(true);
    socket.emit("submit-answer", {
      goalId,
      answer: answerText.trim(),
    });
    setAnswerText("");
  }

  // Handle Logout
  function handleLogoutClick() {
    dispatch(logout());
    setGoalId(null);
    setSynthesis(null);
    setLogs([]);
    setCurrentQuestion(null);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      
      {/* ── Ambient Glow Blobs ────────────────────────────────────────────────── */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />

      {/* ── Navbar ───────────────────────────────────────────────────────────── */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
              AstraLearn AI
            </span>
          </div>

          {auth.user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">{auth.user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleLogoutClick} className="text-slate-400 hover:text-white">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* ── Core Layout Container ────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-4 max-w-7xl mx-auto w-full">
        
        {/* VIEW 1: AUTHENTICATION (Not Logged In) */}
        {!auth.user && (
          <Card className="w-full max-w-md border-slate-900 bg-slate-900/50 backdrop-blur-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
                Welcome to AstraLearn
              </CardTitle>
              <CardDescription className="text-slate-400">
                Register or log in to compile your custom academy roadmap.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={authTab} onValueChange={(val: any) => setAuthTab(val)} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 bg-slate-950">
                  <TabsTrigger value="login" className="data-[state=active]:bg-violet-600">Login</TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-violet-600">Sign Up</TabsTrigger>
                </TabsList>

                {authError && (
                  <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 text-sm">
                    {authError}
                  </div>
                )}

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email Address</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="student@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-slate-950 border-slate-800 focus:border-violet-600"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-slate-950 border-slate-800 focus:border-violet-600"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={isLoggingIn}>
                      {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
                      Access Account
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email Address</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="student@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-slate-950 border-slate-800 focus:border-violet-600"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Must be at least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-slate-950 border-slate-800 focus:border-violet-600"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={isSigningUp}>
                      {isSigningUp ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                      Create Student Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* VIEW 2: SETUP LEARNING GOAL (Logged In, No Active Session) */}
        {auth.user && !goalId && (
          <Card className="w-full max-w-lg border-slate-900 bg-slate-900/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
                Initialize Learning Goal
              </CardTitle>
              <CardDescription className="text-slate-400">
                Define what you want to master. Our AI agents will craft a custom roadmap.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                {goalError && (
                  <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 text-sm">
                    {goalError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="goal-input">Learning Goal Description</Label>
                  <textarea
                    id="goal-input"
                    placeholder="e.g. I want to learn Generative AI and build a RAG product recommendation system."
                    value={goalText}
                    onChange={(e) => setGoalText(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-violet-600 text-slate-100"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-select">Goal Category</Label>
                    <Select value={category} onValueChange={(val) => setCategory(val || "job_project")}>
                      <SelectTrigger id="category-select" className="bg-slate-950 border-slate-800">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                        <SelectItem value="job_project">Project & Job Prep</SelectItem>
                        <SelectItem value="exam_prep">Academic Exam Prep</SelectItem>
                        <SelectItem value="school_subject">General Core Topic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration-input">Duration (Days)</Label>
                    <Input
                      id="duration-input"
                      type="number"
                      min={1}
                      max={365}
                      value={durationDays}
                      onChange={(e) => setDurationDays(e.target.value)}
                      className="bg-slate-950 border-slate-800 focus:border-violet-600"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={isStartingSession}>
                  {isStartingSession ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                  Construct Learning Roadmap
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* VIEW 3: ACTIVE INTENSIVE INTERVIEW & DIAGNOSTICS */}
        {auth.user && goalId && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 max-h-[85vh] items-stretch">
            
            {/* Left/Main Block: Counselor Q&A Chat window */}
            <Card className="lg:col-span-2 border-slate-900 bg-slate-900/50 backdrop-blur-md flex flex-col min-h-[500px]">
              <CardHeader className="border-b border-slate-900">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-violet-400" />
                  Classroom Intake Interview
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {currentQuestion ? `Question ${questionIndex + 1} of ${totalQuestions}` : "Synthesis completed"}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col justify-center p-6 space-y-6">
                
                {/* 1. Dynamic Question State */}
                {currentQuestion && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-900/30 text-lg font-medium text-violet-200">
                      {currentQuestion}
                    </div>

                    <form onSubmit={handleSubmitAnswer} className="flex gap-2 items-center">
                      <Input
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Type your response here..."
                        className="bg-slate-950 border-slate-800 focus:border-violet-600 h-12"
                        disabled={isSubmittingAnswer}
                        required
                        autoFocus
                      />
                      <Button type="submit" className="h-12 bg-violet-600 hover:bg-violet-700 px-6" disabled={isSubmittingAnswer}>
                        {isSubmittingAnswer ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                    </form>
                  </div>
                )}

                {/* 2. Loading State between questions / synthesis */}
                {!currentQuestion && !synthesis && (
                  <div className="text-center py-10 space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-violet-500 mx-auto" />
                    <p className="text-slate-400 animate-pulse">
                      Analyzing your answer and formulating your profile...
                    </p>
                  </div>
                )}

                {/* 3. Synthesis Completed State */}
                {synthesis && (
                  <div className="space-y-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-950/30 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Baseline Profile Compiled!</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
                      <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800">
                        <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Learning Style</span>
                        <span className="font-semibold text-violet-300">{synthesis.learningStyle}</span>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 md:col-span-2">
                        <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Target Weak Areas</span>
                        <span className="text-sm text-slate-300">
                          {Array.isArray(synthesis.weakAreas) ? synthesis.weakAreas.join(", ") : String(synthesis.weakAreas)}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => router.push("/dashboard/curriculum")}
                      className="bg-green-600 hover:bg-green-700 px-8 py-6 text-base font-semibold"
                    >
                      Enter Your Classroom <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Block: Live Agent Diagnostic Logs Terminal */}
            <Card className="border-slate-900 bg-slate-950/80 flex flex-col max-h-[500px] lg:max-h-full">
              <CardHeader className="border-b border-slate-900 flex flex-row items-center gap-2 py-3">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Live Agent Console
                </CardTitle>
                <div className={`w-2 h-2 rounded-full ml-auto ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-3 bg-slate-950">
                {logs.length === 0 ? (
                  <p className="text-slate-600 italic">Waiting for agent activity log streams...</p>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="flex flex-col space-y-0.5 border-l-2 border-slate-800 pl-3">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-bold text-violet-400">[{log.agentName}]</span>
                        <span>{log.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{log.message}</p>
                    </div>
                  ))
                )}
                <div ref={logContainerRef} />
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </main>
  );
}
