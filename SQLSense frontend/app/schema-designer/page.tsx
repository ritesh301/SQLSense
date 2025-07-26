"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Database, Send, Download, Save, MessageCircle, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/lib/store"

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function SchemaDesigner() {
  const [schemaDescription, setSchemaDescription] = useState("")
  const [schemaName, setSchemaName] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDiagram, setGeneratedDiagram] = useState("")
  const [generatedSchemaId, setGeneratedSchemaId] = useState<number | null>(null); // To store the ID of the saved schema
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hello! I can help you modify your schema. Try asking me to add tables, columns, or relationships.",
      timestamp: new Date(),
    },
  ])
  const [currentMessage, setCurrentMessage] = useState("")

  const { addSchema, user } = useAppStore()
  const { toast } = useToast()

  // --- MODIFIED: Connect to Backend API ---
  const handleGenerateSchema = async () => {
    if (!schemaDescription.trim()) {
      toast({
        title: "Please describe your schema",
        description: "Tell me what tables and relationships you need",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedDiagram("")
    setGeneratedSchemaId(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-schema`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: schemaDescription,
          name: schemaName || "Untitled Schema",
          database_type: "postgresql" // Or make this selectable in the UI
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate schema");
      }

      // Assuming the 'schema' field in the response contains Mermaid-compatible DDL
      setGeneratedDiagram(data.schema);
      setGeneratedSchemaId(data.schema_id); // Assumes the backend returns the ID

      toast({
        title: "Schema Generated!",
        description: "Your database schema has been created and saved.",
      });

    } catch (error: any) {
      console.error("Schema generation error:", error);
      toast({
        title: "Error Generating Schema",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false)
    }
  }

  // --- MODIFIED: Connect to Backend API ---
  const handleSaveSchema = async () => {
    if (!generatedSchemaId) {
      toast({
        title: "Cannot save schema",
        description: "Please generate a schema first. It is saved automatically, this button is for updates.",
        variant: "destructive",
      })
      return
    }

    // This function can be used to update the schema, e.g., mark it as active
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'schema',
          schema_id: generatedSchemaId,
          is_active: true // Example update
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save schema");
      }

      toast({
        title: "Schema Updated!",
        description: "Your schema has been updated successfully.",
      });

    } catch (error: any) {
      console.error("Schema save error:", error);
      toast({
        title: "Error Saving Schema",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    }
  }

  // --- MODIFIED: Connect to Backend API ---
  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type: "user",
      content: currentMessage,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    const messageToSend = currentMessage;
    setCurrentMessage("")

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: messageToSend,
                type: 'schema' // Context for the chat
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to get response from assistant");
        }

        const assistantMessage: ChatMessage = {
            id: Math.random().toString(36).substr(2, 9),
            type: "assistant",
            content: data.response,
            timestamp: new Date(),
        }
        setChatMessages((prev) => [...prev, assistantMessage])

    } catch (error: any) {
        console.error("Chat error:", error);
        const assistantErrorMessage: ChatMessage = {
            id: Math.random().toString(36).substr(2, 9),
            type: "assistant",
            content: `Sorry, I encountered an error: ${error.message}`,
            timestamp: new Date(),
        }
        setChatMessages((prev) => [...prev, assistantErrorMessage]);
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Schema Designer</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Design and visualize your database schemas with AI assistance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Design Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Section */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5" />
                    <span>Describe Your Schema</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Schema name (e.g., E-commerce Database)"
                    value={schemaName}
                    onChange={(e) => setSchemaName(e.target.value)}
                  />

                  <Textarea
                    placeholder="Describe your database schema... (e.g., 'I need an e-commerce database with users, products, orders, and categories')"
                    value={schemaDescription}
                    onChange={(e) => setSchemaDescription(e.target.value)}
                    className="min-h-[120px]"
                  />

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleGenerateSchema}
                      disabled={isGenerating || !schemaDescription.trim()}
                      className="flex-1"
                    >
                      {isGenerating ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Generate Schema
                        </>
                      )}
                    </Button>

                    {generatedDiagram && (
                      <Button onClick={handleSaveSchema} variant="outline" disabled={!generatedSchemaId}>
                        <Save className="w-4 h-4 mr-2" />
                        Update Schema
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Generated Diagram */}
            {generatedDiagram && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Generated Schema Diagram</CardTitle>
                      <div className="flex space-x-2">
                        <Badge variant="secondary">Mermaid.js</Badge>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                      <pre className="text-sm overflow-x-auto">
                        <code>{generatedDiagram}</code>
                      </pre>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        💡 This diagram shows your database structure. Use the chat assistant to modify tables, add
                        columns, or create relationships.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Chat Sidebar */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Schema Assistant</span>
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(!isChatOpen)} className="lg:hidden">
                    {isChatOpen ? <X className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.type === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ask me to modify the schema..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} disabled={!currentMessage.trim()} size="icon">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
