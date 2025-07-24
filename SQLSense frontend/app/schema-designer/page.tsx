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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate mock Mermaid diagram
    const mockDiagram = generateMockDiagram(schemaDescription)
    setGeneratedDiagram(mockDiagram)

    setIsGenerating(false)

    toast({
      title: "Schema Generated!",
      description: "Your database schema has been created",
    })
  }

  const generateMockDiagram = (description: string) => {
    const lowerDesc = description.toLowerCase()

    if (lowerDesc.includes("ecommerce") || lowerDesc.includes("shop") || lowerDesc.includes("order")) {
      return `graph TD
    A[Users] --> B[Orders]
    B --> C[Order_Items]
    C --> D[Products]
    D --> E[Categories]
    A --> F[Addresses]
    A --> G[Payment_Methods]
    B --> G
    
    A --> |"user_id"| B
    B --> |"order_id"| C
    C --> |"product_id"| D
    D --> |"category_id"| E
    A --> |"user_id"| F
    A --> |"user_id"| G`
    }

    if (lowerDesc.includes("blog") || lowerDesc.includes("post") || lowerDesc.includes("article")) {
      return `graph TD
    A[Users] --> B[Posts]
    B --> C[Comments]
    B --> D[Tags]
    B --> E[Categories]
    A --> C
    
    A --> |"author_id"| B
    B --> |"post_id"| C
    C --> |"user_id"| A
    B --> |"category_id"| E`
    }

    return `graph TD
    A[Table1] --> B[Table2]
    B --> C[Table3]
    A --> C
    
    A --> |"foreign_key"| B
    B --> |"foreign_key"| C`
  }

  const handleSaveSchema = () => {
    if (!schemaName.trim() || !generatedDiagram) {
      toast({
        title: "Cannot save schema",
        description: "Please provide a name and generate a schema first",
        variant: "destructive",
      })
      return
    }

    addSchema({
      name: schemaName,
      description: schemaDescription,
      diagram: generatedDiagram,
      version: 1,
      author: user?.name || "Anonymous",
    })

    toast({
      title: "Schema Saved!",
      description: "Your schema has been saved to version control",
    })

    // Reset form
    setSchemaName("")
    setSchemaDescription("")
    setGeneratedDiagram("")
  }

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type: "user",
      content: currentMessage,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        type: "assistant",
        content: generateAssistantResponse(currentMessage),
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, assistantMessage])
    }, 1000)

    setCurrentMessage("")
  }

  const generateAssistantResponse = (message: string) => {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("add") && lowerMessage.includes("table")) {
      return "I'll help you add a new table. What should we call it and what columns do you need?"
    }
    if (lowerMessage.includes("column")) {
      return "Great! I can add columns to your existing tables. Which table and what type of column?"
    }
    if (lowerMessage.includes("relationship") || lowerMessage.includes("foreign key")) {
      return "I'll help you create relationships between tables. Which tables should be connected?"
    }

    return "I understand you want to modify the schema. Can you be more specific about what changes you'd like to make?"
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
                      <Button onClick={handleSaveSchema} variant="outline" disabled={!schemaName.trim()}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
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
