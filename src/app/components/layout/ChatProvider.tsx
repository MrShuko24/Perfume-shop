"use client";
import { useState } from "react";
import ChatWidget from "@/app/components/chat/ChatWidget";

export default function ChatProvider() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    return <ChatWidget isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />;
}