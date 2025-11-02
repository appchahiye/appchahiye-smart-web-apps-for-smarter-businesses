import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ChatInterface } from '@/components/ChatInterface';
import { api } from '@/lib/api-client';
import type { Client, User } from '@shared/types';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { Trash2 } from 'lucide-react';
import { toast, Toaster } from '@/components/ui/sonner';
type ClientWithUser = Client & { user?: User };
export default function AdminChatPage() {
  const [clients, setClients] = useState<ClientWithUser[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientWithUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatKey, setChatKey] = useState(0); // To force re-mount of ChatInterface
  const adminUser = useAuthStore(state => state.user);
  useEffect(() => {
    api<ClientWithUser[]>('/api/admin/clients')
      .then(data => {
        setClients(data);
        if (data.length > 0) {
          setSelectedClient(data[0]);
        }
      })
      .catch(err => console.error("Failed to fetch clients:", err))
      .finally(() => setIsLoading(false));
  }, []);
  const handleClearConversation = async () => {
    if (!selectedClient) return;
    try {
      await api(`/api/chat/${selectedClient.id}`, { method: 'DELETE' });
      toast.success('Conversation cleared successfully!');
      // Force ChatInterface to re-fetch messages by changing its key
      setChatKey(prevKey => prevKey + 1);
    } catch (error) {
      toast.error('Failed to clear conversation.');
    }
  };
  if (!adminUser) {
    return <AdminLayout><div>Loading user...</div></AdminLayout>;
  }
  return (
    <AdminLayout>
      <Toaster richColors />
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 h-[calc(100vh-100px)]">
        <Card>
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-180px)]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))
              ) : (
                clients.map(client => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={cn(
                      "flex items-center gap-4 p-4 w-full text-left hover:bg-muted/50 transition-colors",
                      selectedClient?.id === client.id && "bg-muted"
                    )}
                  >
                    <Avatar>
                      <AvatarImage src={`https://i.pravatar.cc/150?u=${client.id}`} />
                      <AvatarFallback>{client.user?.name.charAt(0) || 'C'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{client.user?.name}</p>
                      <p className="text-sm text-muted-foreground">{client.company}</p>
                    </div>
                  </button>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          {selectedClient ? (
            <>
              <CardHeader className="border-b flex flex-row items-center justify-between">
                <CardTitle>{selectedClient.user?.name}</CardTitle>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Clear Conversation</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently delete the entire chat history for this client. This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearConversation}>Clear</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardHeader>
              <ChatInterface
                key={chatKey}
                clientId={selectedClient.id}
                currentUserId={adminUser.id}
                receiverId={selectedClient.userId}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Select a conversation to start chatting.</p>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}