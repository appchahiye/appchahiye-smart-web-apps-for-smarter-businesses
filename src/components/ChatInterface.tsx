import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import type { MessageWithSender } from '@shared/types';
import { cn } from '@/lib/utils';
import { Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
});
type MessageFormValues = z.infer<typeof messageSchema>;
interface ChatInterfaceProps {
  clientId: string;
  currentUserId: string;
  receiverId: string;
}
export function ChatInterface({ clientId, currentUserId, receiverId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
  });
  const fetchMessages = useCallback(async () => {
    try {
      const data = await api<MessageWithSender[]>(`/api/chat/${clientId}`);
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fetchMessages]);
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  const onSubmit = async (data: MessageFormValues) => {
    try {
      await api(`/api/chat/${clientId}`, {
        method: 'POST',
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: receiverId,
          content: data.content,
        }),
      });
      reset();
      fetchMessages(); // Fetch immediately after sending
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={cn("flex items-end gap-2", i % 2 === 0 ? "justify-start" : "justify-end")}>
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-10 w-48 rounded-lg" />
              </div>
            ))
          ) : messages.length > 0 ? (
            messages.map(msg => (
              <div
                key={msg.id}
                className={cn(
                  "flex max-w-xs md:max-w-md lg:max-w-lg gap-2",
                  msg.senderId === currentUserId ? "ml-auto justify-end" : "mr-auto justify-start"
                )}
              >
                <div
                  className={cn(
                    "rounded-lg px-3 py-2",
                    msg.senderId === currentUserId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">{format(new Date(msg.createdAt), 'p')}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
          <Input {...register('content')} placeholder="Type a message..." autoComplete="off" />
          <Button type="submit" size="icon" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}