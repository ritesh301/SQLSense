"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { 
  Database, Mic, Copy, Download, Sparkles, Zap, ArrowRight, Play, Users, Globe, 
  GitBranch, History, BarChart3 // <-- ICONS ADDED HERE
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/lib/store"

// For Web Speech API compatibility
interface CustomWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}
declare const window: CustomWindow;


export default function HomePage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSQL, setGeneratedSQL] = useState("")
  const [isListening, setIsListening] = useState(false)
  
  // Ref to hold the speech recognition instance
  const recognitionRef = useRef<any>(null);

  const { currentQuery, setCurrentQuery, currentDialect, setCurrentDialect, user } = useAppStore()

  const { toast } = useToast()

  const handleGenerateSQL = async () => {
    if (!currentQuery.trim()) {
      toast({
        title: "Please enter a query",
        description: "Describe what you want to do in natural language",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedSQL("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-sql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentQuery,
          database_type: currentDialect,
          context: "" // You can add context from a schema here if needed
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate SQL");
      }
      
      setGeneratedSQL(data.sql_query);
      
      toast({
        title: "SQL Generated!",
        description: "Your query has been converted to SQL and saved to history.",
      });

    } catch (error: any) {
      console.error("SQL generation error:", error);
      toast({
        title: "Error Generating SQL",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false)
    }
  }

  const detectQueryType = (sql: string) => {
    if (!sql) return "OTHER";
    const upperSQL = sql.toUpperCase()
    if (upperSQL.startsWith("SELECT")) return "SELECT"
    if (upperSQL.startsWith("INSERT")) return "INSERT"
    if (upperSQL.startsWith("UPDATE")) return "UPDATE"
    if (upperSQL.startsWith("DELETE")) return "DELETE"
    return "OTHER"
  }

  const copyToClipboard = () => {
    if (!generatedSQL) return;
    navigator.clipboard.writeText(generatedSQL)
    toast({
      title: "Copied!",
      description: "SQL query copied to clipboard",
    })
  }

  const downloadSQL = () => {
    if (!generatedSQL) return;
    const blob = new Blob([generatedSQL], { type: "text/sql" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "query.sql"
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded!",
      description: "SQL file has been downloaded",
    })
  }

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentQuery(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        toast({ title: "Voice Error", description: `Error: ${event.error}`, variant: "destructive" });
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [setCurrentQuery, toast]);
  

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
        toast({ title: "Voice Not Supported", description: "Your browser does not support voice recognition.", variant: "destructive"});
        return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 sm:space-y-6"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered SQL Assistant</span>
              </motion.div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent leading-tight">
                Transform Natural Language
                <br className="hidden sm:block" />
                <span className="block">into Perfect SQL</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
                Stop wrestling with complex SQL syntax. Describe what you want in plain English, and watch SQLSense
                generate optimized queries instantly.
              </p>
            </motion.div>

            {/* Stats */}
            {user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center gap-4 sm:gap-8"
              >
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">{user.tokens}</div>
                  <div className="text-xs sm:text-sm text-gray-500">Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">{user.queriesCount}</div>
                  <div className="text-xs sm:text-sm text-gray-500">Queries</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">{user.badges.length}</div>
                  <div className="text-xs sm:text-sm text-gray-500">Badges</div>
                </div>
              </motion.div>
            )}

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
              >
                Try It Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg bg-transparent">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main SQL Generator */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-0 shadow-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <CardTitle className="flex items-center justify-center space-x-2 text-xl sm:text-2xl">
                  <Database className="w-6 h-6" />
                  <span>Natural Language to SQL Generator</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-4 sm:p-6">
                {/* Input Area */}
                <div className="space-y-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <Textarea
                        placeholder="Ask your question in natural language... (e.g., 'Show me all users who registered last month')"
                        value={currentQuery}
                        onChange={(e) => setCurrentQuery(e.target.value)}
                        className="min-h-[100px] text-base sm:text-lg border-2 focus:border-blue-500 transition-colors resize-none"
                      />
                    </div>

                    <div className="flex lg:flex-col gap-2 lg:gap-2">
                      <Button
                        variant={isListening ? "destructive" : "outline"}
                        size="icon"
                        onClick={toggleVoiceInput}
                        className="h-12 w-12 flex-shrink-0"
                      >
                        <Mic className={`w-5 h-5 ${isListening ? "animate-pulse" : ""}`} />
                      </Button>

                      <Select value={currentDialect} onValueChange={setCurrentDialect}>
                        <SelectTrigger className="w-full lg:w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="postgresql">PostgreSQL</SelectItem>
                          <SelectItem value="mysql">MySQL</SelectItem>
                          <SelectItem value="sqlite">SQLite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleGenerateSQL}
                      disabled={isGenerating || !currentQuery.trim()}
                      className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                    >
                      {isGenerating ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Generating SQL...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Generate SQL Query
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>

                {/* Output Area */}
                {generatedSQL && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold">Generated SQL Query</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{currentDialect.toUpperCase()}</Badge>
                        <Badge variant="outline">{detectQueryType(generatedSQL)}</Badge>
                      </div>
                    </div>

                    <div className="relative">
                      <pre className="bg-gray-900 dark:bg-gray-950 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{generatedSQL}</code>
                      </pre>

                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyToClipboard}
                          className="text-gray-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={downloadSQL}
                          className="text-gray-400 hover:text-white"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Everything You Need for SQL Success</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From natural language processing to schema design, SQLSense provides a complete toolkit for database
              professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                title: "AI-Powered Generation",
                description: "Convert natural language into optimized SQL queries instantly",
                icon: Sparkles,
                href: "/",
                color: "from-blue-500 to-cyan-500",
              },
              {
                title: "Schema Designer",
                description: "Design and visualize database schemas with drag-and-drop simplicity",
                icon: Database,
                href: "/schema-designer",
                color: "from-purple-500 to-pink-500",
              },
              {
                title: "Query History",
                description: "Track, organize, and reuse your previous SQL queries",
                icon: History,
                href: "/query-history",
                color: "from-green-500 to-emerald-500",
              },
              {
                title: "Version Control",
                description: "Manage schema versions with rollback and diff capabilities",
                icon: GitBranch,
                href: "/version-control",
                color: "from-orange-500 to-red-500",
              },
              {
                title: "Analytics Dashboard",
                description: "Gain insights into your SQL usage patterns and productivity",
                icon: BarChart3,
                href: "/analytics",
                color: "from-indigo-500 to-purple-500",
              },
              {
                title: "Rewards System",
                description: "Earn tokens and badges as you improve your SQL skills",
                icon: Zap,
                href: "/rewards",
                color: "from-yellow-500 to-orange-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group cursor-pointer"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                  <CardContent className="p-6 text-center space-y-4">
                    <div
                      className={`w-12 h-12 mx-auto rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Trusted by Developers Worldwide</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                stat: "10,000+",
                label: "Active Users",
                description: "Developers trust SQLSense daily",
              },
              {
                icon: Database,
                stat: "1M+",
                label: "Queries Generated",
                description: "SQL queries created and counting",
              },
              {
                icon: Globe,
                stat: "50+",
                label: "Countries",
                description: "Used across the globe",
              },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">{item.stat}</div>
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">{item.label}</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-white">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Ready to Transform Your SQL Workflow?</h2>
            <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands of developers who are already saving time and boosting productivity with SQLSense.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 text-lg border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                View Pricing
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
