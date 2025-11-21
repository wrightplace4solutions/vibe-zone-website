import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, Send, ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import type { Session } from "@supabase/supabase-js";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
  feedback?: "positive" | "negative";
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [authStage, setAuthStage] = useState<"collect" | "verify" | "chat">("collect");
  const [otpCode, setOtpCode] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [initialSessionCheckComplete, setInitialSessionCheckComplete] = useState(false);
  const [historyLoadedForEmail, setHistoryLoadedForEmail] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const saveMessageToDb = useCallback(async (
    role: "user" | "assistant",
    content: string,
    msgId?: string,
    conversationOverride?: string,
  ) => {
    try {
      const targetConversationId = conversationOverride || conversationId;
      if (!targetConversationId) {
        return; // Skip if no conversation ID
      }

      const { supabase } = await import("@/integrations/supabase/client");
      
      const { error: msgError } = await supabase.from("chat_messages").insert({
        id: msgId || crypto.randomUUID(),
        conversation_id: targetConversationId,
        role,
        content,
      });

      if (msgError) throw msgError;
    } catch (error) {
      console.error("Error saving message:", error);
      // Continue without DB persistence
    }
  }, [conversationId]);

  const loadConversationHistory = useCallback(async (emailAddress: string, customerName?: string) => {
    setIsLoadingHistory(true);
    
    // Add welcome message immediately without DB
    const welcomeMsg = {
      id: crypto.randomUUID(),
      role: "assistant" as const,
      content: "Hey there! 👋 Welcome to Vibe Zone Entertainment! I'm here to help you find the perfect DJ package for your event. Tell me about your upcoming celebration! #LETSWORK",
    };
    setMessages([welcomeMsg]);
    
    try {
      // Dynamically import Supabase only when needed
      const { supabase } = await import("@/integrations/supabase/client");
      
      const { data: conversations, error: convError } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("customer_email", emailAddress)
        .order("created_at", { ascending: false })
        .limit(1);

      if (convError) throw convError;

      if (conversations && conversations.length > 0) {
        const convId = conversations[0].id;
        setConversationId(convId);

        const { data: msgs, error: msgsError } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: true });

        if (msgsError) throw msgsError;

        if (msgs && msgs.length > 0) {
          setMessages(
            msgs.map((msg) => ({
              role: msg.role as "user" | "assistant",
              content: msg.content,
              id: msg.id,
              feedback: msg.feedback as "positive" | "negative" | undefined,
            }))
          );
        } else {
          // Save welcome message to DB
          await saveMessageToDb("assistant", welcomeMsg.content, welcomeMsg.id, convId);
        }
      } else {
        // New conversation
        const { data: newConv, error: convError } = await supabase
          .from("chat_conversations")
          .insert({
            customer_email: emailAddress,
            customer_name: customerName || null,
          })
          .select()
          .single();

        if (convError) throw convError;
        setConversationId(newConv.id);
        await saveMessageToDb("assistant", welcomeMsg.content, welcomeMsg.id, newConv.id);
      }
      setHistoryLoadedForEmail(emailAddress);
    } catch (error) {
      console.error("Error loading conversation:", error);
      // Don't show error toast, just continue without DB persistence
      console.log("Chat will work without conversation history");
    } finally {
      setIsLoadingHistory(false);
    }
  }, [saveMessageToDb]);

  useEffect(() => {
    if (initialSessionCheckComplete) {
      return;
    }

    const restoreSession = async () => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data } = await supabase.auth.getSession();
        if (data.session?.user?.email) {
          setSession(data.session);
          setEmail(data.session.user.email);
          setAuthStage("chat");
          if (historyLoadedForEmail !== data.session.user.email) {
            await loadConversationHistory(
              data.session.user.email,
              (data.session.user.user_metadata as { full_name?: string } | null)?.full_name,
            );
          }
        }
      } catch (error) {
        console.error("Unable to restore Supabase session", error);
      } finally {
        setInitialSessionCheckComplete(true);
      }
    };

    void restoreSession();
  }, [initialSessionCheckComplete, historyLoadedForEmail, loadConversationHistory]);

  const requestOtp = async () => {
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email to continue",
        variant: "destructive",
      });
      return;
    }

    setAuthError(null);
    setIsAuthLoading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          data: name ? { full_name: name } : undefined,
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });

      if (error) throw error;
      setOtpCode("");
      setAuthStage("verify");
      toast({
        title: "Check your inbox",
        description: "We emailed you a 6-digit verification code.",
      });
    } catch (error) {
      console.error("OTP request failed", error);
      setAuthError("We couldn't send the code. Please try again.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otpCode.trim().length !== 6) {
      setAuthError("Enter the 6-digit code from your email.");
      return;
    }

    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode.trim(),
        type: "email",
      });

      if (error) throw error;

      const activeSession = data.session;
      if (!activeSession?.user?.email) {
        throw new Error("Missing Supabase session");
      }

      setSession(activeSession);
      setAuthStage("chat");
      if (!historyLoadedForEmail || historyLoadedForEmail !== activeSession.user.email) {
        await loadConversationHistory(activeSession.user.email, name || undefined);
      }
    } catch (error) {
      console.error("OTP verification failed", error);
      setAuthError("Invalid or expired code. Please request a new one.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const streamChat = async (userMessage: string) => {
    setIsTyping(true);
    const assistantMessageId = crypto.randomUUID();
    
    await saveMessageToDb("user", userMessage);
    
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const cachedSession = session ?? (await supabase.auth.getSession()).data.session;
      const accessToken = cachedSession?.access_token;

      if (!accessToken) {
        throw new Error("Missing authenticated session");
      }

      if (!session && cachedSession) {
        setSession(cachedSession);
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            messages: [...messages, { role: "user", content: userMessage }],
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to start stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                assistantResponse += content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];

                  if (lastMessage?.role === "assistant" && lastMessage.id === assistantMessageId) {
                    newMessages[newMessages.length - 1] = {
                      ...lastMessage,
                      content: assistantResponse,
                    };
                  } else {
                    newMessages.push({
                      role: "assistant",
                      content: assistantResponse,
                      id: assistantMessageId,
                    });
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      await saveMessageToDb("assistant", assistantResponse, assistantMessageId);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: userMessage },
    ]);

    await streamChat(userMessage);
  };

  const handleFeedback = async (messageId: string, feedbackType: "positive" | "negative") => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, feedback: feedbackType } : msg
      )
    );

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase
        .from("chat_messages")
        .update({ feedback: feedbackType })
        .eq("id", messageId);
    } catch (error) {
      console.error("Error saving feedback:", error);
    }

    toast({
      title: "Thanks for your feedback!",
      description: "Your feedback helps us improve our service.",
    });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-neon-cyan z-50"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-h-[calc(100vh-8rem)] h-[600px] bg-card border border-border rounded-lg shadow-neon-cyan z-50 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Vibe Zone DJ Assistant</h3>
              <p className="text-sm text-muted-foreground">Ask about pricing, packages, or availability!</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Email Capture or Messages */}
          {authStage !== "chat" ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center gap-4">
              <MessageSquare className="h-16 w-16 text-primary" />
              <div className="text-center">
                <h4 className="font-semibold mb-2">Start a Conversation</h4>
                {authStage === "collect" ? (
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter your email to request a secure one-time code and continue chatting.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter the 6-digit security code we sent to your email to unlock chat history.
                  </p>
                )}
              </div>
              {authStage === "collect" && (
                <div className="w-full space-y-3">
                  <Input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && requestOtp()}
                  />
                  <Input
                    type="text"
                    placeholder="Your name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && requestOtp()}
                  />
                  {authError && (
                    <p className="text-sm text-destructive text-center">{authError}</p>
                  )}
                  <Button onClick={requestOtp} className="w-full" disabled={isAuthLoading}>
                    {isAuthLoading ? "Sending..." : "Send Secure Code"}
                  </Button>
                </div>
              )}

              {authStage === "verify" && (
                <div className="w-full space-y-4">
                  <InputOTP
                    maxLength={6}
                    value={otpCode}
                    onChange={(value) => setOtpCode(value)}
                    className="w-full"
                  >
                    <InputOTPGroup className="flex justify-center gap-3">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot key={`otp-slot-${index}`} index={index} className="w-10 h-12 text-lg" />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                  {authError && (
                    <p className="text-sm text-destructive text-center">{authError}</p>
                  )}
                  <div className="flex flex-col gap-2">
                    <Button onClick={verifyOtp} disabled={isAuthLoading}>
                      {isAuthLoading ? "Verifying..." : "Verify & Continue"}
                    </Button>
                    <Button variant="ghost" onClick={requestOtp} disabled={isAuthLoading}>
                      Resend Code
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {isLoadingHistory && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    Loading your conversation history...
                  </div>
                )}
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`mb-4 flex flex-col ${
                      message.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    {message.role === "assistant" && message.content && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFeedback(message.id, "positive")}
                          className={message.feedback === "positive" ? "text-primary" : ""}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFeedback(message.id, "negative")}
                          className={message.feedback === "negative" ? "text-destructive" : ""}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-start mb-4">
                    <div className="bg-secondary text-secondary-foreground rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Ask about packages, pricing, or availability..."
                    className="flex-1 min-h-[60px] max-h-[120px]"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isTyping || !input.trim()}
                    size="icon"
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
